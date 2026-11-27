import * as ort from "onnxruntime-web";
import { calculateScore, categoryFromScore, type ReportCategory, type ReportParameters } from "../types/report";

const INPUT_SIZE = 640;

export type PotholeBox = {
  confidence: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type PotholeAssessment = {
  box: PotholeBox;
  parameters: ReportParameters;
  score: number;
  category: ReportCategory;
  areaCm2: number;
};

export type PotholeScan = {
  boxes: PotholeBox[];
  primary: PotholeAssessment | null;
};

let sessionPromise: Promise<ort.InferenceSession> | null = null;

function modelSession(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`;
    sessionPromise = ort.InferenceSession.create(`${import.meta.env.BASE_URL}models/best.onnx`, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    }).catch((error: unknown) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

export function warmupPotholeModel(): void {
  void modelSession().catch(() => undefined);
}

export async function detectPotholes(file: File): Promise<PotholeScan> {
  const image = await loadImage(file);
  const prepared = letterbox(image);
  const session = await modelSession();
  const inputName = session.inputNames[0] ?? "images";
  const outputName = session.outputNames.includes("output0") ? "output0" : session.outputNames[0];
  const tensor = new ort.Tensor("float32", prepared.input, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  const outputs = await session.run({ [inputName]: tensor });
  const output = outputs[outputName];
  const decoded = decodeOutput(output.data as Float32Array, output.dims);
  const boxes = decoded
    .map((box) => unmapBox(box, prepared))
    .sort((a, b) => b.confidence - a.confidence);
  const primary = boxes[0] ? assessBox(boxes[0]) : null;
  return { boxes, primary };
}

function assessBox(box: PotholeBox): PotholeAssessment {
  const width = clamp01(box.right - box.left);
  const height = clamp01(box.bottom - box.top);
  const area = width * height;
  const centerX = (box.left + box.right) / 2;
  const parameters: ReportParameters = {
    L: clamp100((area / 0.02) * 40),
    K: clamp100((height / Math.max(width, 0.02)) * 32),
    P: clamp100(100 - Math.abs(centerX - 0.5) * 200),
    T: 55,
  };
  const score = calculateScore(parameters);
  return {
    box,
    parameters,
    score,
    category: categoryFromScore(score),
    areaCm2: width * 350 * height * 250,
  };
}

function letterbox(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = INPUT_SIZE;
  canvas.height = INPUT_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Kanvas foto tidak tersedia.");
  context.fillStyle = "rgb(114,114,114)";
  context.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  const scale = Math.min(INPUT_SIZE / image.naturalWidth, INPUT_SIZE / image.naturalHeight);
  const contentWidth = image.naturalWidth * scale;
  const contentHeight = image.naturalHeight * scale;
  const padX = (INPUT_SIZE - contentWidth) / 2;
  const padY = (INPUT_SIZE - contentHeight) / 2;
  context.drawImage(image, padX, padY, contentWidth, contentHeight);
  const pixels = context.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data;
  const input = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);
  const plane = INPUT_SIZE * INPUT_SIZE;
  for (let index = 0; index < plane; index += 1) {
    const pixel = index * 4;
    input[index] = pixels[pixel] / 255;
    input[plane + index] = pixels[pixel + 1] / 255;
    input[plane * 2 + index] = pixels[pixel + 2] / 255;
  }
  return { input, padX, padY, contentWidth, contentHeight };
}

function unmapBox(
  box: PotholeBox,
  frame: { padX: number; padY: number; contentWidth: number; contentHeight: number },
): PotholeBox {
  const mapX = (value: number) => clamp01((value * INPUT_SIZE - frame.padX) / frame.contentWidth);
  const mapY = (value: number) => clamp01((value * INPUT_SIZE - frame.padY) / frame.contentHeight);
  return {
    confidence: box.confidence,
    left: mapX(box.left),
    top: mapY(box.top),
    right: mapX(box.right),
    bottom: mapY(box.bottom),
  };
}

function decodeOutput(data: Float32Array, dims: readonly number[]): PotholeBox[] {
  const shape = dims[0] === 1 ? dims.slice(1) : [...dims];
  if (shape.length < 2) return [];
  const channelMajor = shape[0] <= shape[1];
  const channels = channelMajor ? shape[0] : shape[1];
  const anchors = channelMajor ? shape[1] : shape[0];
  if (channels < 5 || anchors <= 0 || data.length < channels * anchors) return [];
  const maskChannels = channels > 36 ? 32 : 0;
  const classChannels = channels - 4 - maskChannels;
  if (classChannels < 1) return [];

  const at = (channel: number, anchor: number) =>
    channelMajor ? data[channel * anchors + anchor] : data[anchor * channels + channel];

  let peak = 0;
  const step = Math.max(1, Math.floor(anchors / 48));
  for (let index = 0; index < anchors; index += step) {
    peak = Math.max(peak, Math.abs(at(2, index)));
  }
  const scale = peak > 2 ? INPUT_SIZE : 1;
  const candidates: PotholeBox[] = [];
  for (let index = 0; index < anchors; index += 1) {
    let confidence = 0;
    for (let channel = 4; channel < 4 + classChannels; channel += 1) {
      confidence = Math.max(confidence, probability(at(channel, index)));
    }
    if (confidence < 0.4) continue;
    const centerX = at(0, index) / scale;
    const centerY = at(1, index) / scale;
    const width = at(2, index) / scale;
    const height = at(3, index) / scale;
    if (width <= 0.01 || height <= 0.01) continue;
    candidates.push({
      confidence,
      left: clamp01(centerX - width / 2),
      top: clamp01(centerY - height / 2),
      right: clamp01(centerX + width / 2),
      bottom: clamp01(centerY + height / 2),
    });
  }
  candidates.sort((a, b) => b.confidence - a.confidence);
  return suppress(candidates);
}

function probability(raw: number): number {
  if (raw >= 0 && raw <= 1) return raw;
  return 1 / (1 + Math.exp(-raw));
}

function suppress(boxes: PotholeBox[]): PotholeBox[] {
  const kept: PotholeBox[] = [];
  for (const box of boxes) {
    if (kept.some((other) => iou(box, other) > 0.45)) continue;
    kept.push(box);
    if (kept.length === 4) break;
  }
  return kept;
}

function iou(a: PotholeBox, b: PotholeBox): number {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);
  const width = right - left;
  const height = bottom - top;
  if (width <= 0 || height <= 0) return 0;
  const intersection = width * height;
  const union = (a.right - a.left) * (a.bottom - a.top) + (b.right - b.left) * (b.bottom - b.top) - intersection;
  return union <= 0 ? 0 : intersection / union;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Foto tidak bisa dibaca."));
    };
    image.src = url;
  });
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clamp100(value: number): number {
  return Math.min(100, Math.max(0, value));
}

import type { PotholeReport, ReportCategory, ReportStatus } from "../types/report";
import { categoryFromScore } from "../types/report";
import { readToken } from "./session";

export const API_ORIGIN = "https://api-roadasafe.houselab.my.id";
export const API_BASE = `${API_ORIGIN}/api/v1`;

const STATUSES: ReportStatus[] = [
  "Pending",
  "Terverifikasi",
  "Dalam Penanganan",
  "Selesai",
  "Ditolak",
];

export type AuthUser = {
  nama: string;
  email: string;
  peran: string;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};

export type ReportSummary = {
  totalReports: number;
  pendingVerification: number;
  verifiedAndHandled: number;
  completed: number;
  rejected: number;
};

type ApiReport = {
  id: number;
  kode_laporan?: string | null;
  lokasi_jalan?: string | null;
  latitude: number;
  longitude: number;
  akurasi_gps?: number | null;
  kecepatan?: number | null;
  arah?: number | null;
  waktu: string;
  gambar_path?: string | null;
  confidence?: number | null;
  skor: number;
  kategori: string;
  status: string;
  jumlah_terlapor?: number | null;
  versi_model?: string | null;
  device_id?: string | null;
  parameter?: {
    nilai_L?: number;
    nilai_K?: number;
    nilai_P?: number;
    nilai_T?: number;
  } | null;
};

async function apiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail.length > 0) {
      const first = body.detail[0] as { msg?: string };
      if (first.msg) return first.msg;
    }
  } catch {
    return `Permintaan gagal (${response.status}).`;
  }
  return `Permintaan gagal (${response.status}).`;
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = readToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!response.ok) throw new Error(await apiError(response));
  return response;
}

function categoryOf(value: string, score: number): ReportCategory {
  const normalized = value.toLowerCase();
  if (normalized === "high" || normalized.includes("tinggi")) return "High";
  if (normalized === "medium" || normalized.includes("sedang")) return "Medium";
  if (normalized === "low" || normalized.includes("rendah")) return "Low";
  return categoryFromScore(score);
}

function statusOf(value: string): ReportStatus {
  return STATUSES.find((status) => status.toLowerCase() === value.toLowerCase()) ?? "Pending";
}

function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_ORIGIN}/${path.replace(/^\//, "")}`;
}

export function mapReport(raw: ApiReport): PotholeReport {
  const street = raw.lokasi_jalan?.trim() || "Lokasi tidak diketahui";
  const city = street.includes(",") ? street.split(",").at(-1)?.trim() : undefined;
  const code = (raw.kode_laporan ?? `RS-${raw.id}`).replace(/^#/, "");
  const parameter = raw.parameter;

  return {
    id: code,
    serverId: raw.id,
    coordinates: { lat: raw.latitude, lng: raw.longitude },
    score: raw.skor,
    category: categoryOf(raw.kategori, raw.skor),
    status: statusOf(raw.status),
    image_url: mediaUrl(raw.gambar_path),
    parameters: {
      L: parameter?.nilai_L ?? 0,
      K: parameter?.nilai_K ?? 0,
      P: parameter?.nilai_P ?? 0,
      T: parameter?.nilai_T ?? 0,
    },
    timestamp: raw.waktu,
    report_count: raw.jumlah_terlapor ?? 1,
    street,
    city,
    accuracyM: raw.akurasi_gps ?? undefined,
    speedKmh: raw.kecepatan ?? undefined,
    headingDeg: raw.arah ?? undefined,
    confidence: raw.confidence ?? undefined,
    modelVersion: raw.versi_model ?? undefined,
    deviceId: raw.device_id ?? undefined,
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const body = (await response.json()) as {
    access_token: string;
    user: AuthUser;
  };
  return { token: body.access_token, user: body.user };
}

export async function listReports(): Promise<PotholeReport[]> {
  const response = await apiFetch("/reports/?limit=100");
  const body = (await response.json()) as ApiReport[];
  return body.map(mapReport);
}

export async function getReportSummary(): Promise<ReportSummary> {
  const response = await apiFetch("/reports/summary");
  const body = (await response.json()) as {
    total_laporan: number;
    menunggu_verifikasi: number;
    terverifikasi_ditangani: number;
    selesai_ditambal: number;
    ditolak: number;
  };
  return {
    totalReports: body.total_laporan,
    pendingVerification: body.menunggu_verifikasi,
    verifiedAndHandled: body.terverifikasi_ditangani,
    completed: body.selesai_ditambal,
    rejected: body.ditolak,
  };
}

export async function updateReportStatus(serverId: number, status: ReportStatus): Promise<void> {
  await apiFetch(`/reports/${serverId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function downloadServerCsv(): Promise<void> {
  const response = await apiFetch("/reports/export/csv");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "roadsafe-laporan.csv";
  link.click();
  URL.revokeObjectURL(url);
}

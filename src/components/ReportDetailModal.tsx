import { useEffect, useState } from "react";
import {
  Camera,
  Compass,
  Cpu,
  Gauge,
  Images,
  MapPin,
  ScanLine,
  ShieldCheck,
  X,
  ZoomIn,
} from "lucide-react";
import type { PotholeReport, ReportStatus } from "../types/report";
import { URGENCY_WEIGHTS } from "../types/report";
import { CATEGORY_META, formatScore, streetName } from "../utils/reportDisplay";

const DECISION_OPTIONS: ReportStatus[] = ["Pending", "Terverifikasi", "Ditolak"];

const DECISION_LABEL: Record<ReportStatus, string> = {
  Pending: "PENDING (Menunggu Verifikasi)",
  Terverifikasi: "TERVERIFIKASI",
  Ditolak: "DITOLAK",
  "Dalam Penanganan": "DALAM PENANGANAN",
  Selesai: "SELESAI",
};

const DECISION_TONE: Record<ReportStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Terverifikasi: "bg-blue-100 text-blue-700",
  Ditolak: "bg-rose-100 text-rose-700",
  "Dalam Penanganan": "bg-violet-100 text-violet-700",
  Selesai: "bg-emerald-100 text-emerald-700",
};

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type InspectionTelemetry = {
  accuracyM: number;
  speedKmh: number;
  headingDeg: number;
  deviceUuid: string;
  deviceName: string;
  model: string;
  fileKb: number;
  sha: string;
  district: string;
};

type ReportDetailModalProps = {
  report: PotholeReport | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
};

function formatCaptureTime(timestamp: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const month = MONTHS[Number(read("month")) - 1] ?? "";
  return `${Number(read("day"))} ${month} ${read("year")}, ${read("hour")}:${read("minute")} WIB`;
}

function headingText(degrees: number): string {
  const names = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return `${degrees}° ${names[index]}`;
}

function laneHint(position: number): string {
  if (position >= 85) return "(Tengah Lajur Roda)";
  if (position >= 50) return "(Tepi Lajur)";
  return "(Bahu Jalan)";
}

function roadHint(density: number): string {
  if (density >= 75) return "(Jalan Arteri - OSM)";
  if (density >= 50) return "(Jalan Kolektor - OSM)";
  return "(Jalan Lokal - OSM)";
}

function telemetryFor(report: PotholeReport): InspectionTelemetry {
  if (report.id === "RS-20241024-001") {
    return {
      accuracyM: 3.8,
      speedKmh: 34.5,
      headingDeg: 182,
      deviceUuid: "9b1deb4d-4b16-4f2a-9c1e-0a6f2e8b7c31",
      deviceName: "Snapdragon 720G",
      model: "YOLOv8n-INT8-v1.2",
      fileKb: 248,
      sha: "4f8b7c21a09e44d199a1",
      district: "Bogor Tengah",
    };
  }

  const seed = [...report.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const uuidHead = (seed * 17).toString(16).padStart(8, "0").slice(0, 8);
  return {
    accuracyM: Number((2.2 + (seed % 28) / 10).toFixed(1)),
    speedKmh: Number((16 + (seed % 32) + (seed % 10) / 10).toFixed(1)),
    headingDeg: seed % 360,
    deviceUuid: `${uuidHead}-7c2a-4e91-b5d0-${(seed * 97).toString(16).padStart(12, "0").slice(0, 12)}`,
    deviceName: "Snapdragon 720G",
    model: "YOLOv8n-INT8-v1.2",
    fileKb: 168 + (seed % 120),
    sha: `${((seed * 2654435761) >>> 0).toString(16).padStart(8, "0").slice(0, 8)}${((seed * 97) >>> 0).toString(16).padStart(4, "0").slice(0, 4)}`,
    district: report.city === "Jakarta" ? "Jakarta Pusat" : "Bogor",
  };
}

function detectionConfidence(report: PotholeReport): number {
  if (report.id === "RS-20241024-001") return 84;
  return Math.min(97, Math.max(62, Math.round(62 + report.score * 0.28)));
}

function shortHash(sha: string): string {
  return `${sha.slice(0, 4)}…${sha.slice(-4)}`;
}

function EvidenceScene({ frame, zoomed }: { frame: number; zoomed: boolean }) {
  const shift = frame === 0 ? -24 : frame === 2 ? 24 : 0;

  return (
    <svg
      viewBox="0 0 640 360"
      className="h-full w-full"
      style={{ transform: `translateX(${shift}px) scale(${zoomed ? 1.18 : 1})` }}
      aria-hidden="true"
    >
      <rect width="640" height="360" fill="#4b5563" />
      <rect width="640" height="360" fill="#374151" opacity="0.35" />
      <g fill="#6b7280" opacity="0.55">
        <circle cx="70" cy="48" r="16" />
        <circle cx="180" cy="110" r="8" />
        <circle cx="520" cy="70" r="12" />
        <circle cx="150" cy="300" r="14" />
        <circle cx="580" cy="250" r="10" />
      </g>
      <path d="M292 0 L236 360" stroke="#facc15" strokeWidth="8" strokeDasharray="22 16" />
      <path d="M372 0 L448 360" stroke="#e5e7eb" strokeWidth="3" />
      <ellipse cx="248" cy="168" rx="96" ry="50" fill="#1f2937" />
      <ellipse cx="242" cy="162" rx="68" ry="30" fill="#111827" />
      <ellipse cx="226" cy="152" rx="26" ry="10" fill="#9ca3af" opacity="0.55" />
      <g transform="translate(455 62)">
        <rect width="96" height="40" rx="6" fill="#1e3a8a" />
        <rect x="18" y="8" width="28" height="14" rx="2" fill="#bfdbfe" />
        <rect x="34" y="30" width="30" height="8" rx="1" fill="#f8fafc" opacity="0.8" />
      </g>
    </svg>
  );
}

export default function ReportDetailModal({
  report,
  onClose,
  onStatusChange,
}: ReportDetailModalProps) {
  const [zoomed, setZoomed] = useState(false);
  const [showFrames, setShowFrames] = useState(false);
  const [frame, setFrame] = useState(1);
  const [notice, setNotice] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    if (!report) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [report, onClose]);

  useEffect(() => {
    setZoomed(false);
    setShowFrames(false);
    setFrame(1);
    setNotice("");
    setPhotoFailed(false);
  }, [report?.id]);

  if (!report) return null;

  const current = report;
  const category = CATEGORY_META[current.category];
  const telemetry = telemetryFor(current);
  const confidence = detectionConfidence(current);
  const agency = `PUPR KOTA ${(current.city ?? "Bogor").toUpperCase()}`;
  const frameShift = ["object-left", "object-center", "object-right"][frame] ?? "object-center";

  const parameters = [
    {
      key: "L",
      label: "Parameter L: Luas Area Kerusakan",
      weight: `${Math.round(URGENCY_WEIGHTS.L * 100)}%`,
      value: current.parameters.L,
      hint: `(Rasio ${Math.round(current.parameters.L * 0.3)}%)`,
      bar: "bg-orange-500",
    },
    {
      key: "K",
      label: "Parameter K: Kedalaman Proxy",
      weight: `${Math.round(URGENCY_WEIGHTS.K * 100)}%`,
      value: current.parameters.K,
      hint: "estimasi visual",
      bar: "bg-orange-400",
    },
    {
      key: "P",
      label: "Parameter P: Posisi Lajur",
      weight: `${Math.round(URGENCY_WEIGHTS.P * 100)}%`,
      value: current.parameters.P,
      hint: laneHint(current.parameters.P),
      bar: "bg-red-500",
    },
    {
      key: "T",
      label: "Parameter T: Kepadatan Jalan",
      weight: `${Math.round(URGENCY_WEIGHTS.T * 100)}%`,
      value: current.parameters.T,
      hint: roadHint(current.parameters.T),
      bar: "bg-blue-500",
    },
  ] as const;

  function applyStatus(status: ReportStatus) {
    onStatusChange(current.id, status);
    setNotice(`Status diperbarui menjadi ${DECISION_LABEL[status]}.`);
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex justify-end bg-slate-900/45"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspection-title"
        className="flex h-dvh max-h-dvh w-full max-w-[560px] flex-col overflow-hidden bg-[#f8fafc] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500">
                <span className="text-blue-700">{agency}</span>
                <span className="mx-2 text-slate-300">|</span>
                Seksi Pemeliharaan Jalan
              </p>
              <h2 id="inspection-title" className="mt-1 text-lg font-bold text-slate-900">
                Laporan Kerusakan #{report.id}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Waktu Pengambilan: {formatCaptureTime(report.timestamp)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup inspeksi laporan"
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold ${category.text} bg-white ring-1 ring-slate-200`}>
              <span className={`h-2 w-2 rounded-full ${category.dot}`} />
              {category.label.toUpperCase()}
            </span>
            <span className="font-semibold text-slate-700">
              Skor Total: {formatScore(report.score)} / 100
            </span>
            <span className="text-slate-400">|</span>
            <span className="font-medium text-slate-600">
              {report.report_count}x Dilaporkan (Radius 12m)
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Camera className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Bukti Citra Visual & Deteksi AI
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Privasi UU PDP: Plat & Wajah Disamarkan
              </span>
            </div>

            <div className={`relative mt-3 overflow-hidden rounded-xl bg-slate-700 ${zoomed ? "h-80" : "h-52"}`}>
              <EvidenceScene frame={frame} zoomed={zoomed} />
              {photoFailed ? null : (
                <img
                  src={report.image_url}
                  alt=""
                  className={`absolute inset-0 h-full w-full ${frameShift} ${zoomed ? "scale-125 object-cover" : "object-cover"}`}
                  onError={() => setPhotoFailed(true)}
                />
              )}
              <div className="absolute left-[8%] top-[16%] h-[52%] w-[64%] rounded-sm border-2 border-red-500">
                <span className="absolute -top-3 left-2 bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  YOLOv8: Lubang {confidence}%
                </span>
              </div>
              <span className="absolute right-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
                PDP-MASK
              </span>
              <span className="absolute right-2 top-1/2 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
                PLAT-BLUR
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setZoomed((open) => !open)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                {zoomed ? "Ukuran Normal" : "Zoom Resolusi Penuh"}
              </button>
              <button
                type="button"
                onClick={() => setShowFrames((open) => !open)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Images className="h-3.5 w-3.5" aria-hidden="true" />
                Lihat 3 Frame Pendukung
              </button>
            </div>

            {showFrames ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["-2 dtk", "Terbaik", "+2 dtk"].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFrame(index)}
                    className={`cursor-pointer overflow-hidden rounded-lg border text-left ${
                      frame === index ? "border-blue-500" : "border-slate-200"
                    }`}
                  >
                    <span className="block h-16 overflow-hidden bg-slate-600">
                      <EvidenceScene frame={index} zoomed={false} />
                    </span>
                    <span className="block px-2 py-1 text-[10px] font-semibold text-slate-500">
                      Frame {label}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <p>
                Foto Frame Terbaik (Confidence Tertinggi) • Ukuran {telemetry.fileKb} KB • 1080p
              </p>
              <p className="font-mono">SHA-256: {shortHash(telemetry.sha)}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ScanLine className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Dekonstruksi Algoritma Penilaian (Skor: {formatScore(report.score)})
              </h3>
              <span className="text-[11px] text-slate-400">Standar Bina Marga PUPR</span>
            </div>
            <div className="mt-4 space-y-3">
              {parameters.map((parameter) => (
                <div key={parameter.key}>
                  <div className="flex items-start justify-between gap-3 text-[12px]">
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">{parameter.label}</span>{" "}
                      <span className="text-slate-400">(Bobot {parameter.weight})</span>
                    </p>
                    <p className="shrink-0 text-right font-semibold text-slate-800">
                      {parameter.value.toFixed(1)}{" "}
                      {parameter.key === "K" ? (
                        <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600">
                          {parameter.hint}
                        </span>
                      ) : (
                        <span className="font-normal text-slate-400">{parameter.hint}</span>
                      )}
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${parameter.bar}`}
                      style={{ width: `${Math.max(0, Math.min(100, parameter.value))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-800">Metadata Sensor & Telemetri Perangkat</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <article className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-400">Lokasi Administrasi</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {streetName(report)}, {telemetry.district}
                </p>
              </article>
              <article className="rounded-xl bg-slate-50 p-3">
                <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  Koordinat Spasial
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Lat: {report.coordinates.lat.toFixed(6)}, Lng: {report.coordinates.lng.toFixed(6)}
                </p>
                <p className="text-[11px] font-medium text-emerald-600">
                  Akurasi GPS: ±{telemetry.accuracyM.toFixed(1)} meter (Akurat)
                </p>
              </article>
              <article className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-400">Telemetri Armada</p>
                <div className="mt-2 flex gap-4 text-sm">
                  <p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Gauge className="h-3 w-3" aria-hidden="true" />
                      Kecepatan
                    </span>
                    <span className="mt-0.5 block font-semibold text-slate-800">
                      {telemetry.speedKmh.toFixed(1)} km/jam
                    </span>
                  </p>
                  <p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Compass className="h-3 w-3" aria-hidden="true" />
                      Haluan
                    </span>
                    <span className="mt-0.5 block font-semibold text-slate-800">
                      {headingText(telemetry.headingDeg)}
                    </span>
                  </p>
                </div>
              </article>
              <article className="rounded-xl bg-slate-50 p-3">
                <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Cpu className="h-3 w-3" aria-hidden="true" />
                  Perangkat Edge & Model
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {telemetry.deviceName} (UUID: {telemetry.deviceUuid.slice(0, 8)}…)
                </p>
                <p className="text-[11px] text-slate-500">Model: {telemetry.model}</p>
              </article>
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Keputusan Verifikator PUPR</h3>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${DECISION_TONE[report.status]}`}>
              {DECISION_LABEL[report.status]}
            </span>
          </div>
          <label className="mt-3 block text-xs font-medium text-slate-500" htmlFor="decision-status">
            Ubah status laporan
          </label>
          <select
            id="decision-status"
            value={report.status}
            onChange={(event) => applyStatus(event.target.value as ReportStatus)}
            className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {!DECISION_OPTIONS.includes(report.status) ? (
              <option value={report.status}>{DECISION_LABEL[report.status]}</option>
            ) : null}
            {DECISION_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {DECISION_LABEL[status]}
              </option>
            ))}
          </select>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DECISION_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => applyStatus(status)}
                className={`cursor-pointer rounded-lg border px-2 py-2 text-xs font-semibold ${
                  report.status === status
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status === "Pending" ? "Pending" : status}
              </button>
            ))}
          </div>
          {notice ? <p className="mt-2 text-xs font-medium text-emerald-600">{notice}</p> : null}
        </footer>
      </aside>
    </div>
  );
}

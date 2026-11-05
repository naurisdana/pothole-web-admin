import type { PotholeReport, ReportCategory, ReportStatus } from "../types/report";

const QUEUE_REFERENCE = new Date("2024-10-24T10:00:00+07:00").getTime();

export const CATEGORY_META: Record<
  ReportCategory,
  { label: string; text: string; dot: string; marker: string }
> = {
  High: {
    label: "Tinggi",
    text: "text-red-600",
    dot: "bg-red-500",
    marker: "#ef4444",
  },
  Medium: {
    label: "Sedang",
    text: "text-amber-500",
    dot: "bg-amber-400",
    marker: "#f59e0b",
  },
  Low: {
    label: "Rendah",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    marker: "#22c55e",
  },
};

export const STATUS_META: Record<ReportStatus, { label: string; className: string }> = {
  Pending: { label: "PENDING", className: "text-sky-600" },
  Terverifikasi: { label: "TERVERIFIKASI", className: "text-blue-600" },
  "Dalam Penanganan": { label: "DALAM PENANGANAN", className: "text-violet-600" },
  Selesai: { label: "SELESAI", className: "text-emerald-600" },
  Ditolak: { label: "DITOLAK", className: "text-rose-500" },
};

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function formatRelativeTime(timestamp: string): string {
  const minutes = Math.round((QUEUE_REFERENCE - new Date(timestamp).getTime()) / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export function dedupLabel(count: number): string {
  return count > 1 ? `${count}x Terlapor` : "1x";
}

export function formatCoordinates(report: PotholeReport): string {
  return `${report.coordinates.lat.toFixed(4)}, ${report.coordinates.lng.toFixed(4)}`;
}

export function estimatedDepthCm(report: PotholeReport): string {
  return (report.parameters.K / 12).toFixed(1);
}

export function hazardLabel(category: ReportCategory): string {
  if (category === "High") return "Bahaya R2";
  if (category === "Medium") return "Bahaya R1";
  return "Bahaya R0";
}

export function streetName(report: PotholeReport): string {
  return report.street ?? "Ruas tidak diketahui";
}

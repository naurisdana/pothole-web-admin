/**
 * Laporan kerusakan jalan hasil deteksi RoadSafe.
 * Skor urgensi = (0.35 * L) + (0.25 * K) + (0.20 * P) + (0.20 * T).
 * Low 0–33, Medium 34–66, High 67–100.
 */
export interface ReportCoordinates {
  lat: number;
  lng: number;
}

export interface ReportParameters {
  L: number;
  K: number;
  P: number;
  T: number;
}

export type ReportCategory = "Low" | "Medium" | "High";

export type ReportStatus =
  | "Pending"
  | "Terverifikasi"
  | "Dalam Penanganan"
  | "Selesai"
  | "Ditolak";

export interface PotholeReport {
  id: string;
  coordinates: ReportCoordinates;
  score: number;
  category: ReportCategory;
  status: ReportStatus;
  image_url: string;
  parameters: ReportParameters;
  timestamp: string;
  report_count: number;
  street?: string;
  city?: string;
}

export const URGENCY_WEIGHTS = {
  L: 0.35,
  K: 0.25,
  P: 0.2,
  T: 0.2,
} as const;

export function calculateScore(parameters: ReportParameters): number {
  const raw =
    URGENCY_WEIGHTS.L * parameters.L +
    URGENCY_WEIGHTS.K * parameters.K +
    URGENCY_WEIGHTS.P * parameters.P +
    URGENCY_WEIGHTS.T * parameters.T;

  return Math.round(raw * 10) / 10;
}

export function categoryFromScore(score: number): ReportCategory {
  if (score <= 33) return "Low";
  if (score <= 66) return "Medium";
  return "High";
}

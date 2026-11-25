import { URGENCY_WEIGHTS, type PotholeReport, type ReportCategory, type ReportStatus } from "../types/report";
import { CATEGORY_META } from "./reportDisplay";

const CATEGORY_ORDER: ReportCategory[] = ["High", "Medium", "Low"];
const STATUS_ORDER: ReportStatus[] = [
  "Pending",
  "Terverifikasi",
  "Dalam Penanganan",
  "Selesai",
  "Ditolak",
];

const STATUS_COLOR: Record<ReportStatus, string> = {
  Pending: "#0284c7",
  Terverifikasi: "#2563eb",
  "Dalam Penanganan": "#7c3aed",
  Selesai: "#059669",
  Ditolak: "#f43f5e",
};

export type InsightSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type ParameterAverage = {
  key: "L" | "K" | "P" | "T";
  label: string;
  weight: string;
  value: number;
  color: string;
};

export type DayVolume = {
  label: string;
  value: number;
};

export type StreetScore = {
  id: string;
  street: string;
  score: number;
  category: ReportCategory;
};

export type QueueInsights = {
  total: number;
  averageScore: number;
  categories: InsightSlice[];
  statuses: InsightSlice[];
  parameters: ParameterAverage[];
  days: DayVolume[];
  streets: StreetScore[];
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  const raw = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(raw * 10) / 10;
}

function dayLabel(timestamp: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(timestamp));
}

export function buildQueueInsights(reports: PotholeReport[]): QueueInsights {
  const categories = CATEGORY_ORDER.map((category) => ({
    key: category,
    label: CATEGORY_META[category].label,
    value: reports.filter((report) => report.category === category).length,
    color: CATEGORY_META[category].marker,
  }));

  const statuses = STATUS_ORDER.map((status) => ({
    key: status,
    label: status,
    value: reports.filter((report) => report.status === status).length,
    color: STATUS_COLOR[status],
  }));

  const parameters: ParameterAverage[] = [
    {
      key: "L",
      label: "Luas",
      weight: `${Math.round(URGENCY_WEIGHTS.L * 100)}%`,
      value: average(reports.map((report) => report.parameters.L)),
      color: "#f97316",
    },
    {
      key: "K",
      label: "Kedalaman",
      weight: `${Math.round(URGENCY_WEIGHTS.K * 100)}%`,
      value: average(reports.map((report) => report.parameters.K)),
      color: "#fb923c",
    },
    {
      key: "P",
      label: "Posisi lajur",
      weight: `${Math.round(URGENCY_WEIGHTS.P * 100)}%`,
      value: average(reports.map((report) => report.parameters.P)),
      color: "#ef4444",
    },
    {
      key: "T",
      label: "Kepadatan",
      weight: `${Math.round(URGENCY_WEIGHTS.T * 100)}%`,
      value: average(reports.map((report) => report.parameters.T)),
      color: "#3b82f6",
    },
  ];

  const dayMap = new Map<string, { value: number; time: number }>();
  for (const report of reports) {
    const label = dayLabel(report.timestamp);
    const time = new Date(report.timestamp).getTime();
    const current = dayMap.get(label);
    if (!current) {
      dayMap.set(label, { value: 1, time });
    } else {
      current.value += 1;
      current.time = Math.min(current.time, time);
    }
  }

  const streets = [...reports]
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map((report) => ({
      id: report.id,
      street: report.street ?? "Ruas tidak diketahui",
      score: report.score,
      category: report.category,
    }));

  return {
    total: reports.length,
    averageScore: average(reports.map((report) => report.score)),
    categories,
    statuses,
    parameters,
    days: [...dayMap.entries()]
      .sort((left, right) => left[1].time - right[1].time)
      .map(([label, item]) => ({ label, value: item.value })),
    streets,
  };
}

import {
  calculateScore,
  categoryFromScore,
  type PotholeReport,
  type ReportParameters,
  type ReportStatus,
} from "../types/report";

type ReportDraft = {
  id: string;
  street: string;
  city: string;
  coordinates: PotholeReport["coordinates"];
  parameters: ReportParameters;
  status: ReportStatus;
  image_url: string;
  timestamp: string;
  report_count: number;
};

function createReport(draft: ReportDraft): PotholeReport {
  const score = calculateScore(draft.parameters);

  return {
    ...draft,
    score,
    category: categoryFromScore(score),
  };
}

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=240&q=60`;

export const mockReports: PotholeReport[] = [
  createReport({
    id: "RS-20241024-001",
    street: "Jl. Pajajaran No. 45",
    city: "Bogor",
    coordinates: { lat: -6.5982, lng: 106.8041 },
    parameters: { L: 86, K: 78, P: 72, T: 72 },
    status: "Pending",
    image_url: photo("photo-1515165562839-978bbcf12d19"),
    timestamp: "2024-10-24T09:46:00+07:00",
    report_count: 4,
  }),
  createReport({
    id: "RS-20241024-002",
    street: "Jl. Otista",
    city: "Bogor",
    coordinates: { lat: -6.597, lng: 106.8065 },
    parameters: { L: 90, K: 82, P: 78, T: 76 },
    status: "Terverifikasi",
    image_url: photo("photo-1465447142348-e9952c393450"),
    timestamp: "2024-10-24T09:18:00+07:00",
    report_count: 3,
  }),
  createReport({
    id: "RS-20241024-003",
    street: "Jl. Suryakencana",
    city: "Bogor",
    coordinates: { lat: -6.6038, lng: 106.7932 },
    parameters: { L: 58, K: 54, P: 52, T: 50 },
    status: "Pending",
    image_url: photo("photo-1449824913935-59a10b8d2000"),
    timestamp: "2024-10-24T09:00:00+07:00",
    report_count: 1,
  }),
  createReport({
    id: "RS-20241024-004",
    street: "Jl. Siliwangi",
    city: "Bogor",
    coordinates: { lat: -6.5905, lng: 106.7898 },
    parameters: { L: 50, K: 50, P: 44, T: 46 },
    status: "Dalam Penanganan",
    image_url: photo("photo-1477959858617-67f85cf4f1df"),
    timestamp: "2024-10-24T08:00:00+07:00",
    report_count: 2,
  }),
  createReport({
    id: "RS-20241024-005",
    street: "Jl. Malabar Ujung",
    city: "Bogor",
    coordinates: { lat: -6.6095, lng: 106.8022 },
    parameters: { L: 30, K: 24, P: 18, T: 22 },
    status: "Selesai",
    image_url: photo("photo-1480714378408-67cf0d13bc1b"),
    timestamp: "2024-10-24T06:00:00+07:00",
    report_count: 1,
  }),
  createReport({
    id: "RS-20241024-006",
    street: "Jl. Ir. H. Juanda",
    city: "Bogor",
    coordinates: { lat: -6.5975, lng: 106.8002 },
    parameters: { L: 78, K: 70, P: 65, T: 66 },
    status: "Terverifikasi",
    image_url: photo("photo-1508921912186-1d1a45ebb3c1"),
    timestamp: "2024-10-24T07:30:00+07:00",
    report_count: 2,
  }),
  createReport({
    id: "RS-20241024-007",
    street: "Jl. Jenderal Sudirman",
    city: "Jakarta",
    coordinates: { lat: -6.2088, lng: 106.8229 },
    parameters: { L: 94, K: 90, P: 82, T: 84 },
    status: "Pending",
    image_url: photo("photo-1494522855154-9297ac14b55f"),
    timestamp: "2024-10-24T08:40:00+07:00",
    report_count: 5,
  }),
  createReport({
    id: "RS-20241024-008",
    street: "Jl. Gatot Subroto",
    city: "Jakarta",
    coordinates: { lat: -6.238, lng: 106.8305 },
    parameters: { L: 60, K: 56, P: 50, T: 50 },
    status: "Pending",
    image_url: photo("photo-1469474968028-56623f02e42e"),
    timestamp: "2024-10-23T18:20:00+07:00",
    report_count: 1,
  }),
  createReport({
    id: "RS-20241024-009",
    street: "Jl. TB Simatupang",
    city: "Jakarta",
    coordinates: { lat: -6.292, lng: 106.824 },
    parameters: { L: 68, K: 64, P: 60, T: 58 },
    status: "Dalam Penanganan",
    image_url: photo("photo-1433838552652-f9a46b332c40"),
    timestamp: "2024-10-24T05:15:00+07:00",
    report_count: 3,
  }),
  createReport({
    id: "RS-20241024-010",
    street: "Jl. Daan Mogot",
    city: "Jakarta",
    coordinates: { lat: -6.1485, lng: 106.735 },
    parameters: { L: 36, K: 28, P: 30, T: 28 },
    status: "Ditolak",
    image_url: photo("photo-1470219556762-1771e7f9427d"),
    timestamp: "2024-10-23T14:05:00+07:00",
    report_count: 1,
  }),
];

export const dashboardStats = {
  totalReports: 1248,
  totalChangePercent: 12,
  pendingVerification: 42,
  verifiedAndHandled: 890,
  verifiedRatioLabel: "71.3% ratio",
  completed: 316,
  qaLabel: "100% QA",
  asOfLabel: "24 Okt 2024",
} as const;

export const currentVerifier = {
  name: "Budi Santoso",
  role: "Verifikator • Dinas PUPR",
  initials: "BS",
} as const;

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function downloadReportsCsv(reports: PotholeReport[] = mockReports): void {
  const header = [
    "id",
    "ruas_jalan",
    "kota",
    "latitude",
    "longitude",
    "skor",
    "kategori",
    "status",
    "L",
    "K",
    "P",
    "T",
    "timestamp",
    "jumlah_laporan",
    "image_url",
  ];

  const lines = reports.map((report) =>
    [
      report.id,
      report.street ?? "",
      report.city ?? "",
      report.coordinates.lat,
      report.coordinates.lng,
      report.score,
      report.category,
      report.status,
      report.parameters.L,
      report.parameters.K,
      report.parameters.P,
      report.parameters.T,
      report.timestamp,
      report.report_count,
      report.image_url,
    ]
      .map(csvCell)
      .join(","),
  );

  const csv = `\uFEFF${[header.join(","), ...lines].join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "roadsafe-laporan.csv";
  link.click();
  URL.revokeObjectURL(url);
}

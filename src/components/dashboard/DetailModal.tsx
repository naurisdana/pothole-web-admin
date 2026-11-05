import { useEffect } from "react";
import { Check, MapPinned, X } from "lucide-react";
import type { PotholeReport } from "../../types/report";
import {
  CATEGORY_META,
  STATUS_META,
  estimatedDepthCm,
  formatCoordinates,
  formatRelativeTime,
  formatScore,
  hazardLabel,
  streetName,
} from "../../utils/reportDisplay";
import EvidenceThumb from "./EvidenceThumb";

type DetailModalProps = {
  report: PotholeReport | null;
  onClose: () => void;
  onValidate: (id: string) => void;
  onDismiss: (id: string) => void;
};

export default function DetailModal({ report, onClose, onValidate, onDismiss }: DetailModalProps) {
  useEffect(() => {
    if (!report) return undefined;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [report, onClose]);

  if (!report) return null;

  const category = CATEGORY_META[report.category];
  const status = STATUS_META[report.status];
  const areaTitle =
    report.city === "Bogor" || !report.city
      ? "Kota Bogor & Sekitarnya"
      : `Kota ${report.city}`;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-detail-title"
        className="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{areaTitle}</p>
              <p className="text-[11px] text-slate-400">EPSG:4326 · PostGIS Spatial View</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail laporan"
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <EvidenceThumb src={report.image_url} className="h-14 w-14 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 id="report-detail-title" className="text-base font-bold text-slate-900">
                {streetName(report)}
              </h3>
              <p className={`text-xl font-bold leading-none ${category.text}`}>
                {formatScore(report.score)}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide ${category.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${category.dot}`} />
                {category.label.toUpperCase()}
              </span>
              <span className={`text-[11px] font-bold tracking-wide ${status.className}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Klaster Laporan</dt>
            <dd className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {report.report_count}x Terdeteksi
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Koordinat</dt>
            <dd className="font-medium text-slate-800">{formatCoordinates(report)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Kedalaman Est.</dt>
            <dd className="font-medium text-slate-800">
              ~{estimatedDepthCm(report)} cm ({hazardLabel(report.category)})
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Waktu laporan</dt>
            <dd className="font-medium text-slate-800">{formatRelativeTime(report.timestamp)}</dd>
          </div>
        </dl>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {(
            [
              ["L", report.parameters.L],
              ["K", report.parameters.K],
              ["P", report.parameters.P],
              ["T", report.parameters.T],
            ] as const
          ).map(([name, value]) => (
            <div key={name} className="rounded-lg bg-slate-50 px-2 py-2 text-center">
              <p className="text-[10px] font-semibold tracking-wide text-slate-400">{name}</p>
              <p className="text-sm font-bold text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={report.status === "Terverifikasi"}
            onClick={() => onValidate(report.id)}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Validasi
          </button>
          <button
            type="button"
            disabled={report.status === "Ditolak"}
            onClick={() => onDismiss(report.id)}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Abaikan
          </button>
        </div>
      </div>
    </div>
  );
}

import { ChevronDown, ChevronLeft, ChevronRight, Clock, Layers, RefreshCw, Search } from "lucide-react";
import type { PotholeReport } from "../../types/report";
import type { CategoryFilter, StatusFilter } from "../../hooks/useReportQueue";
import {
  CATEGORY_META,
  STATUS_META,
  dedupLabel,
  formatRelativeTime,
  formatScore,
  streetName,
} from "../../utils/reportDisplay";
import EvidenceThumb from "./EvidenceThumb";

type ReportQueueProps = {
  pageReports: PotholeReport[];
  filteredCount: number;
  rangeStart: number;
  rangeEnd: number;
  page: number;
  pageCount: number;
  query: string;
  statusFilter: StatusFilter;
  categoryFilter: CategoryFilter;
  selectedId: string | null;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onPageChange: (page: number) => void;
  onReset: () => void;
  onSelect: (id: string) => void;
};

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "Semua", label: "Semua" },
  { value: "Pending", label: "Pending" },
  { value: "Terverifikasi", label: "Terverifikasi" },
  { value: "Dalam Penanganan", label: "Dalam Penanganan" },
  { value: "Selesai", label: "Selesai" },
  { value: "Ditolak", label: "Ditolak" },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "Semua", label: "Semua" },
  { value: "High", label: "Tinggi" },
  { value: "Medium", label: "Sedang" },
  { value: "Low", label: "Rendah" },
];

function FilterSelect<T extends string>({
  label,
  value,
  options,
  padClass,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  padClass: string;
  onChange: (value: T) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="pointer-events-none absolute left-3 text-xs text-slate-500">{label}:</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={`h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${padClass}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
    </label>
  );
}

export default function ReportQueue({
  pageReports,
  filteredCount,
  rangeStart,
  rangeEnd,
  page,
  pageCount,
  query,
  statusFilter,
  categoryFilter,
  selectedId,
  onQueryChange,
  onStatusChange,
  onCategoryChange,
  onPageChange,
  onReset,
  onSelect,
}: ReportQueueProps) {
  return (
    <section className="flex h-[620px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:h-full">
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">
              Daftar Deteksi & Antrean Verifikasi
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Deduplikasi klaster radius 15 meter via PostGIS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="whitespace-nowrap text-sm text-slate-400">
              <span className="font-semibold text-slate-700">
                {pageReports.length} dari {filteredCount}
              </span>{" "}
              aktif
            </p>
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset pencarian dan filter"
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 pb-3">
          <label className="relative min-w-[180px] flex-1">
            <span className="sr-only">Cari ruas jalan</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Jl. Pajajaran"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <FilterSelect
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            padClass="pl-16"
            onChange={onStatusChange}
          />
          <FilterSelect
            label="Urgensi"
            value={categoryFilter}
            options={CATEGORY_OPTIONS}
            padClass="pl-[4.6rem]"
            onChange={onCategoryChange}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-14" />
            <col className="w-[5.5rem]" />
            <col className="w-14" />
            <col />
            <col className="w-[6.5rem]" />
            <col className="w-[6.25rem]" />
          </colgroup>
          <thead className="sticky top-0 bg-white">
            <tr className="border-y border-slate-100 text-[10px] font-semibold tracking-[0.08em] text-slate-400">
              <th className="px-4 py-2 font-semibold">BUKTI</th>
              <th className="px-2 py-2 font-semibold">URGENSI</th>
              <th className="px-2 py-2 font-semibold">SKOR</th>
              <th className="px-2 py-2 font-semibold">RUAS JALAN</th>
              <th className="px-2 py-2 font-semibold">DEDUPLIKASI</th>
              <th className="px-4 py-2 font-semibold">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {pageReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-sm text-slate-400">
                  Tidak ada laporan yang cocok dengan pencarian atau filter.
                </td>
              </tr>
            ) : (
              pageReports.map((report) => {
                const category = CATEGORY_META[report.category];
                const status = STATUS_META[report.status];
                const selected = report.id === selectedId;

                return (
                  <tr
                    key={report.id}
                    tabIndex={0}
                    aria-selected={selected}
                    onClick={() => onSelect(report.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(report.id);
                      }
                    }}
                    className={`cursor-pointer border-b border-slate-100 outline-none transition hover:bg-slate-50 focus-visible:bg-blue-50 ${selected ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-4 py-2.5">
                      <EvidenceThumb src={report.image_url} />
                    </td>
                    <td className="px-2 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide ${category.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${category.dot}`} />
                        {category.label.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-2 py-2.5 text-sm font-bold ${category.text}`}>
                      {formatScore(report.score)}
                    </td>
                    <td className="px-2 py-2.5">
                      <p className="text-sm font-semibold text-slate-800">{streetName(report)}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatRelativeTime(report.timestamp)}
                      </p>
                    </td>
                    <td className="px-2 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Layers className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        {dedupLabel(report.report_count)}
                      </span>
                    </td>
                    <td className={`max-w-[6.5rem] px-3 py-2.5 text-[11px] font-bold leading-tight tracking-wide ${status.className}`}>
                      {status.label}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
        <p className="text-xs text-slate-400">
          Menampilkan {rangeStart}-{rangeEnd} dari {filteredCount} antrean
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Halaman sebelumnya"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              aria-label={`Halaman ${pageNumber}`}
              aria-current={pageNumber === page ? "page" : undefined}
              onClick={() => onPageChange(pageNumber)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs font-semibold ${
                pageNumber === page
                  ? "border-blue-500 text-blue-600"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            aria-label="Halaman berikutnya"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

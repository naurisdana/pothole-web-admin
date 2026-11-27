import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ReportDetailModal from "../components/ReportDetailModal";
import ReportQueue from "../components/dashboard/ReportQueue";
import SpatialMap from "../components/dashboard/SpatialMap";
import type { DashboardOutletContext } from "../components/layout/DashboardShell";
import { useReportQueue } from "../hooks/useReportQueue";
import { listReports } from "../services/api";
import type { PotholeReport } from "../types/report";

export default function Dashboard() {
  const { statusFilter, setStatusFilter } = useOutletContext<DashboardOutletContext>();
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const queue = useReportQueue(reports, statusFilter, setStatusFilter);

  useEffect(() => {
    let active = true;
    listReports()
      .then((items) => {
        if (active) setReports(items);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Laporan tidak dapat dimuat.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <h1 className="sr-only">Portal verifikasi dan manajemen laporan kerusakan jalan</h1>
      {loading ? <p className="mt-4 text-sm text-slate-500">Memuat laporan dari server...</p> : null}
      {loadError ? (
        <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </p>
      ) : null}
      {queue.statusError ? (
        <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {queue.statusError}
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:h-[clamp(560px,calc(100vh-280px),720px)] xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.12fr)]">
        <ReportQueue
          pageReports={queue.pageReports}
          filteredCount={queue.filtered.length}
          rangeStart={queue.rangeStart}
          rangeEnd={queue.rangeEnd}
          page={queue.currentPage}
          pageCount={queue.pageCount}
          query={queue.query}
          statusFilter={queue.statusFilter}
          categoryFilter={queue.categoryFilter}
          selectedId={queue.selectedId}
          onQueryChange={queue.changeQuery}
          onStatusChange={queue.changeStatus}
          onCategoryChange={queue.changeCategory}
          onPageChange={queue.setPage}
          onReset={queue.resetFilters}
          onSelect={queue.selectReport}
        />
        <SpatialMap
          reports={queue.filtered}
          selectedId={queue.selectedId}
          focusTick={queue.focusTick}
          onSelect={queue.selectReport}
        />
      </div>
      <ReportDetailModal
        report={queue.detailOpen ? queue.selected : null}
        onClose={queue.closeDetail}
        onStatusChange={queue.updateStatus}
      />
    </>
  );
}

import ReportDetailModal from "../components/ReportDetailModal";
import ReportQueue from "../components/dashboard/ReportQueue";
import SpatialMap from "../components/dashboard/SpatialMap";
import { useReportQueue } from "../hooks/useReportQueue";
import { mockReports } from "../services/mockData";

export default function Dashboard() {
  const queue = useReportQueue(mockReports);

  return (
    <>
      <h1 className="sr-only">Portal verifikasi dan manajemen laporan kerusakan jalan</h1>
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

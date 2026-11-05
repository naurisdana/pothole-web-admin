import { useEffect, useMemo, useState } from "react";
import type { PotholeReport, ReportCategory, ReportStatus } from "../types/report";

export const PAGE_SIZE = 5;

export type StatusFilter = "Semua" | ReportStatus;
export type CategoryFilter = "Semua" | ReportCategory;

export function useReportQueue(initialReports: PotholeReport[]) {
  const [reports, setReports] = useState(initialReports);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Semua");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("Semua");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return reports.filter((report) => {
      const haystack = `${report.street ?? ""} ${report.city ?? ""}`.toLowerCase();
      const matchesQuery = keyword.length === 0 || haystack.includes(keyword);
      const matchesStatus = statusFilter === "Semua" || report.status === statusFilter;
      const matchesCategory = categoryFilter === "Semua" || report.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [reports, query, statusFilter, categoryFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageReports = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const selected = reports.find((report) => report.id === selectedId) ?? null;

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function changeStatus(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function changeCategory(value: CategoryFilter) {
    setCategoryFilter(value);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setStatusFilter("Semua");
    setCategoryFilter("Semua");
    setPage(1);
  }

  function selectReport(id: string) {
    setSelectedId(id);
    setDetailOpen(true);
    setFocusTick((tick) => tick + 1);

    const index = filtered.findIndex((report) => report.id === id);
    if (index >= 0) setPage(Math.floor(index / PAGE_SIZE) + 1);
  }

  function closeDetail() {
    setDetailOpen(false);
  }

  function updateStatus(id: string, status: ReportStatus) {
    setReports((current) =>
      current.map((report) => (report.id === id ? { ...report, status } : report)),
    );
  }

  return {
    filtered,
    pageReports,
    pageCount,
    currentPage,
    rangeStart,
    rangeEnd,
    query,
    statusFilter,
    categoryFilter,
    selectedId,
    selected,
    detailOpen,
    focusTick,
    changeQuery,
    changeStatus,
    changeCategory,
    resetFilters,
    selectReport,
    closeDetail,
    updateStatus,
    setPage,
  };
}

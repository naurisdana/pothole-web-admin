import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { StatusFilter } from "../../hooks/useReportQueue";
import Header from "./Header";
import StatCards from "./StatCards";

export type DashboardOutletContext = {
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
};

export default function DashboardShell() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Semua");
  const location = useLocation();
  const navigate = useNavigate();

  function handleSelectFilter(next: StatusFilter) {
    setStatusFilter(next);
    if (location.pathname !== "/") {
      navigate("/");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6FA]">
      <Header />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6">
        <StatCards activeFilter={statusFilter} onSelectFilter={handleSelectFilter} />
        <Outlet context={{ statusFilter, setStatusFilter } satisfies DashboardOutletContext} />
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 text-[11px] text-slate-400 sm:px-6">
        <p>
          Sistem Integrasi Monitoring Dinas Bina Marga & PUPR
          <span className="mx-2 text-slate-300">•</span>
          Dukungan Sensor Mobile RoadSafe AI Engine v2.4
        </p>
        <p className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="font-medium text-emerald-600">Sinkronisasi Real-Time</span>
          <span>Latensi: 42ms</span>
        </p>
      </footer>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import Header from "./Header";
import StatCards from "./StatCards";

export default function DashboardShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6FA]">
      <Header />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6">
        <StatCards />
        <Outlet />
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

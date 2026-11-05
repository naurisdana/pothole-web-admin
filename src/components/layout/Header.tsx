import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Download, Route } from "lucide-react";
import {
  currentVerifier,
  dashboardStats,
  downloadReportsCsv,
} from "../../services/mockData";

export default function Header() {
  const [exported, setExported] = useState(false);

  useEffect(() => {
    if (!exported) return undefined;

    const timer = window.setTimeout(() => setExported(false), 2200);
    return () => window.clearTimeout(timer);
  }, [exported]);

  function handleExport() {
    downloadReportsCsv();
    setExported(true);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-4 lg:gap-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
              <Route className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-[15px] font-extrabold tracking-tight text-slate-900">
                  ROADSAFE
                </span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500">
                  UI-W01
                </span>
              </span>
              <span className="mt-0.5 block text-[10px] font-medium tracking-[0.06em] text-slate-400">
                VERIFIKASI & MONITORING KERUSAKAN JALAN
              </span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-600">Server Live</span>
            <span className="text-emerald-200">|</span>
            <span className="text-slate-500">PostGIS Spasial Aktif</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            Hari ini: {dashboardStats.asOfLabel}
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {exported ? "CSV terunduh" : "Ekspor Data (.CSV)"}
          </button>

          <div className="flex items-center gap-3 pl-1">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-slate-800">
                {currentVerifier.name}
              </p>
              <p className="text-[11px] text-slate-400">{currentVerifier.role}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {currentVerifier.initials}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

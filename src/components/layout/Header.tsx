import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Calendar, Download, LogOut, Route } from "lucide-react";
import { endSession, readUser } from "../../services/session";
import { downloadServerCsv } from "../../services/api";

export default function Header() {
  const navigate = useNavigate();
  const [exported, setExported] = useState(false);
  const [exportError, setExportError] = useState("");
  const user = readUser();
  const today = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
  const initials = (user?.nama ?? "VS")
    .split(" ")
    .filter((part) => part && part !== "(" && !part.endsWith(")"))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  useEffect(() => {
    if (!exported) return undefined;

    const timer = window.setTimeout(() => setExported(false), 2200);
    return () => window.clearTimeout(timer);
  }, [exported]);

  async function handleExport() {
    setExportError("");
    try {
      await downloadServerCsv();
      setExported(true);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Ekspor gagal.");
    }
  }

  function handleLogout() {
    endSession();
    navigate("/login", { replace: true });
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

          <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 ${isActive ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`
              }
            >
              Verifikasi
            </NavLink>
            <NavLink
              to="/analitik"
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 ${isActive ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`
              }
            >
              Analitik
            </NavLink>
          </nav>

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
            Hari ini: {today}
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {exported ? "CSV terunduh" : "Ekspor Data (.CSV)"}
          </button>
          {exportError ? <p className="w-full text-right text-xs text-rose-600">{exportError}</p> : null}

          <div className="flex items-center gap-3 pl-1">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-slate-800">
                {user?.nama ?? "Verifikator"}
              </p>
              <p className="text-[11px] text-slate-400">{user?.peran ?? "Dinas PUPR"}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {initials || "VS"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

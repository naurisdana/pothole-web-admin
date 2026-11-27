import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Calendar, Download, LogOut, Mail, ShieldCheck } from "lucide-react";
import { endSession, readUser } from "../../services/session";
import { downloadServerCsv } from "../../services/api";

export default function Header() {
  const navigate = useNavigate();
  const [exported, setExported] = useState(false);
  const [exportError, setExportError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!profileOpen) return undefined;

    function onPointerDown(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

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
    <header className="sticky top-0 z-[1100] border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5 xl:flex-nowrap">
        <div className="flex min-w-0 flex-wrap items-center gap-3 xl:flex-nowrap">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src="/roadsafe-icon.svg"
              alt=""
              aria-hidden="true"
              className="h-9 w-9 shrink-0 drop-shadow-sm"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="text-[14px] font-extrabold tracking-tight text-slate-900">
                  ROADSAFE
                </span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500">
                  UI-W01
                </span>
              </span>
              <span className="mt-0.5 block whitespace-nowrap text-[9.5px] font-medium tracking-[0.05em] text-slate-400">
                VERIFIKASI & MONITORING KERUSAKAN JALAN
              </span>
            </span>
          </Link>

          <nav className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 text-[13px] font-semibold">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-2.5 py-1 ${isActive ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`
              }
            >
              Verifikasi
            </NavLink>
            <NavLink
              to="/analitik"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-2.5 py-1 ${isActive ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`
              }
            >
              Analitik
            </NavLink>
          </nav>

          <span className="hidden h-6 w-px shrink-0 bg-slate-200 xl:block" aria-hidden="true" />

          <div className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-600">Server Live</span>
            <span className="text-emerald-200">|</span>
            <span className="font-medium text-emerald-700">PostGIS Spasial Aktif</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5 xl:flex-nowrap">
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-slate-600">Hari ini:</strong> {today}
            </span>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl bg-blue-600 px-3 py-1.5 text-[13px] font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {exported ? "CSV terunduh" : "Ekspor Data (.CSV)"}
          </button>
          {exportError ? <p className="w-full text-right text-xs text-rose-600">{exportError}</p> : null}

          <span className="hidden h-6 w-px shrink-0 bg-slate-200 xl:block" aria-hidden="true" />

          <div ref={profileRef} className="relative flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="dialog"
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1 text-right transition hover:bg-slate-100"
            >
              <div className="max-w-[155px] leading-tight">
                <p
                  title={user?.nama ?? "Verifikator"}
                  className="truncate text-[13px] font-semibold text-slate-800"
                >
                  {user?.nama ?? "Verifikator"}
                </p>
                <p className="truncate text-[11px] text-slate-400">{user?.peran ?? "Dinas PUPR"}</p>
              </div>
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {initials || "VS"}
                <span
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                  aria-hidden="true"
                />
              </span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Keluar
            </button>

            {profileOpen ? (
              <div
                role="dialog"
                aria-label="Profil Verifikator"
                className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {initials || "VS"}
                    <span
                      className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {user?.nama ?? "Verifikator"}
                    </p>
                    <p className="text-xs font-medium text-blue-600">
                      {user?.peran ?? "Dinas PUPR"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate">{user?.email ?? "-"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span>Sesi Verifikator Aktif</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Keluar dari Portal
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

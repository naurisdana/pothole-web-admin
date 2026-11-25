import type { ReactNode } from "react";

type PublicFrameProps = {
  children: ReactNode;
};

export default function PublicFrame({ children }: PublicFrameProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6FA]">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-blue-600" />
          <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-600 sm:text-xs">
            SISTEM INFORMASI PENGAWASAN & PERBAIKAN JALAN
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Server Aktif & Sinkron
          </span>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <span className="hidden sm:inline">Wilayah Kerja: Jawa Barat & DKI</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>

      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center">
        <p className="text-xs font-medium text-slate-600">
          RoadSafe v2.0 • Proyek Terpadu Visual Komputer & UI/UX • IPB University
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Hak Cipta © 2025 Laboratorium Kecerdasan Buatan & Rekayasa Perangkat Lunak.
          Dilindungi Undang-Undang.
        </p>
      </footer>
    </div>
  );
}

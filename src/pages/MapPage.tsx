import { useEffect, useState } from "react";
import { listReports } from "../services/api";

export default function MapPage() {
  const [summary, setSummary] = useState("Memuat titik dari server...");

  useEffect(() => {
    let active = true;
    listReports()
      .then((reports) => {
        if (!active) return;
        const cities = new Map<string, number>();
        for (const report of reports) {
          const city = report.city || "Tanpa kota";
          cities.set(city, (cities.get(city) ?? 0) + 1);
        }
        const parts = [...cities.entries()].map(([city, count]) => `${count} di ${city}`);
        setSummary(
          parts.length > 0
            ? `${reports.length} laporan siap dipetakan: ${parts.join(", ")}.`
            : "Belum ada laporan di server.",
        );
      })
      .catch((error: unknown) => {
        if (active) {
          setSummary(error instanceof Error ? error.message : "Peta API belum dapat dimuat.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">Peta Spasial</h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{summary}</p>
    </section>
  );
}

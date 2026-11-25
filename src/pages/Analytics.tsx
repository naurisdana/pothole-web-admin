import { useEffect, useState } from "react";
import QueueCharts from "../components/analytics/QueueCharts";
import { listReports } from "../services/api";
import type { PotholeReport } from "../types/report";
import { buildQueueInsights } from "../utils/queueInsights";

export default function Analytics() {
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [error, setError] = useState("");
  const insights = buildQueueInsights(reports);

  useEffect(() => {
    let active = true;
    listReports()
      .then((items) => {
        if (active) setReports(items);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Grafik tidak dapat dimuat.");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-4">
      <div className="mb-4">
        <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Analitik antrean</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
          Grafik dihitung dari {insights.total} laporan di server: skor, kategori, status, serta
          parameter L, K, P, dan T.
        </p>
      </div>
      {error ? (
        <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      <QueueCharts insights={insights} />
    </section>
  );
}

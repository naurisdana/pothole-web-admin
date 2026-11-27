import { CATEGORY_META } from "../../utils/reportDisplay";
import type { InsightSlice, QueueInsights } from "../../utils/queueInsights";

type QueueChartsProps = {
  insights: QueueInsights;
};

function Donut({ slices, total }: { slices: InsightSlice[]; total: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = total || 1;
  const segments = slices.reduce<Array<InsightSlice & { length: number; offset: number }>>(
    (acc, slice) => {
      const prev = acc[acc.length - 1];
      const offset = prev ? prev.offset + prev.length : 0;
      const length = (slice.value / safeTotal) * circumference;
      return [...acc, { ...slice, length, offset }];
    },
    [],
  );

  return (
    <svg viewBox="0 0 120 120" className="h-40 w-40 shrink-0" role="img" aria-label="Donat kategori urgensi">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
      {segments.map((seg) => (
        <circle
          key={seg.key}
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth="14"
          strokeDasharray={`${seg.length} ${circumference - seg.length}`}
          strokeDashoffset={-seg.offset}
          transform="rotate(-90 60 60)"
        />
      ))}
      <text x="60" y="57" textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="700">
        {total}
      </text>
      <text x="60" y="74" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">
        LAPORAN
      </text>
    </svg>
  );
}

function Bars({ slices, max }: { slices: InsightSlice[]; max: number }) {
  const ceiling = Math.max(max, 1);

  return (
    <ul className="space-y-3">
      {slices.map((slice) => (
        <li key={slice.key}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">{slice.label}</span>
            <span className="tabular-nums text-slate-500">{slice.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${(slice.value / ceiling) * 100}%`, backgroundColor: slice.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function QueueCharts({ insights }: QueueChartsProps) {
  const dayMax = Math.max(...insights.days.map((day) => day.value), 1);
  const statusMax = Math.max(...insights.statuses.map((status) => status.value), 1);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-slate-900">Kategori urgensi</h2>
        <p className="mt-1 text-xs text-slate-400">High, Medium, dan Low dari skor laporan.</p>
        <div className="mt-5 flex flex-wrap items-center gap-6">
          <Donut slices={insights.categories} total={insights.total} />
          <ul className="min-w-[160px] flex-1 space-y-3">
            {insights.categories.map((slice) => (
              <li key={slice.key} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                  {slice.label}
                </span>
                <span className="font-semibold tabular-nums text-slate-900">{slice.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-slate-900">Status verifikasi</h2>
        <p className="mt-1 text-xs text-slate-400">Alur yang sama dengan filter antrean.</p>
        <div className="mt-5">
          <Bars slices={insights.statuses} max={statusMax} />
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-slate-900">Rata-rata parameter</h2>
        <p className="mt-1 text-xs text-slate-400">
          Bobot skor: L {insights.parameters[0]?.weight}, K {insights.parameters[1]?.weight}, P{" "}
          {insights.parameters[2]?.weight}, T {insights.parameters[3]?.weight}.
        </p>
        <ul className="mt-5 space-y-4">
          {insights.parameters.map((parameter) => (
            <li key={parameter.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {parameter.key} · {parameter.label}
                  <span className="ml-2 font-medium text-slate-400">{parameter.weight}</span>
                </span>
                <span className="tabular-nums text-slate-600">{parameter.value.toFixed(1)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${parameter.value}%`, backgroundColor: parameter.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-slate-900">Volume per hari</h2>
        <p className="mt-1 text-xs text-slate-400">Diambil dari waktu tiap laporan sampel.</p>
        <div className="mt-6 flex h-40 items-end justify-start gap-6">
          {insights.days.map((day) => (
            <div key={day.label} className="flex w-24 flex-col items-center gap-2">
              <span className="text-xs font-semibold tabular-nums text-slate-700">{day.value}</span>
              <div className="flex h-28 w-full items-end rounded-xl bg-slate-50 px-3">
                <div
                  className="w-full rounded-t-lg bg-blue-600"
                  style={{ height: `${Math.max(12, (day.value / dayMax) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500">{day.label}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Ruas dengan skor tertinggi</h2>
            <p className="mt-1 text-xs text-slate-400">
              Skor rata-rata antrean {insights.averageScore.toFixed(1)}. Warna mengikuti kategori peta.
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-3">
          {insights.streets.map((street) => (
            <li key={street.id} className="grid grid-cols-[minmax(0,1fr)_72px] items-center gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-semibold text-slate-800">{street.street}</span>
                  <span className={`font-semibold ${CATEGORY_META[street.category].text}`}>
                    {CATEGORY_META[street.category].label}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${street.score}%`,
                      backgroundColor: CATEGORY_META[street.category].marker,
                    }}
                  />
                </div>
              </div>
              <p className="text-right text-sm font-bold tabular-nums text-slate-900">
                {street.score.toFixed(1)}
              </p>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

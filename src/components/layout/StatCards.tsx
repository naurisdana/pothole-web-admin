import { useEffect, useState, type ReactNode } from "react";
import { CircleCheck, ClipboardList, MapPin, Wrench } from "lucide-react";
import type { StatusFilter } from "../../hooks/useReportQueue";
import { getReportSummary, type ReportSummary } from "../../services/api";

type Tone = "slate" | "orange" | "blue" | "green";

const tones: Record<
  Tone,
  { label: string; value: string; icon: string; accent: string }
> = {
  slate: {
    label: "text-slate-500",
    value: "text-slate-900",
    icon: "bg-slate-100 text-slate-400",
    accent: "bg-slate-200",
  },
  orange: {
    label: "text-orange-500",
    value: "text-orange-500",
    icon: "bg-orange-50 text-orange-500",
    accent: "bg-orange-400",
  },
  blue: {
    label: "text-blue-600",
    value: "text-blue-600",
    icon: "bg-blue-50 text-blue-600",
    accent: "bg-blue-500",
  },
  green: {
    label: "text-emerald-600",
    value: "text-emerald-600",
    icon: "bg-emerald-50 text-emerald-600",
    accent: "bg-emerald-500",
  },
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

type StatCardProps = {
  tone: Tone;
  label: string;
  value: string;
  caption: string;
  icon: ReactNode;
  badge?: ReactNode;
  showAccent?: boolean;
  active?: boolean;
  onClick?: () => void;
};

function StatCard({
  tone,
  label,
  value,
  caption,
  icon,
  badge,
  showAccent = true,
  active = false,
  onClick,
}: StatCardProps) {
  const style = tones[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex min-h-[118px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl border bg-white px-5 py-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md ${
        active ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200/80"
      }`}
    >
      {showAccent ? (
        <span className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full ${style.accent}`} />
      ) : null}
      <div className="min-w-0 pl-2">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${style.label}`}>
          {label}
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <p className={`text-[32px] font-bold leading-none tracking-tight ${style.value}`}>
            {value}
          </p>
          {badge}
        </div>
        <p className="mt-2 text-xs text-slate-400">{caption}</p>
      </div>
      <span
        className={`ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
      >
        {icon}
      </span>
    </button>
  );
}

type StatCardsProps = {
  activeFilter?: StatusFilter;
  onSelectFilter?: (filter: StatusFilter) => void;
};

export default function StatCards({ activeFilter = "Semua", onSelectFilter }: StatCardsProps) {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getReportSummary()
      .then((value) => {
        if (active) setSummary(value);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Ringkasan gagal dimuat.");
      });
    return () => {
      active = false;
    };
  }, []);

  const total = summary?.totalReports ?? 0;
  const ratio =
    summary && total > 0 ? `${((summary.verifiedAndHandled / total) * 100).toFixed(1)}% ratio` : "—";
  const valueOf = (value: number | undefined) => (summary ? formatCount(value ?? 0) : "—");

  const pick = (target: StatusFilter) => {
    if (!onSelectFilter) return;
    if (target === "Semua") {
      onSelectFilter("Semua");
      return;
    }
    onSelectFilter(activeFilter === target ? "Semua" : target);
  };

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {error ? (
        <p role="alert" className="md:col-span-2 xl:col-span-4 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
      <StatCard
        tone="slate"
        showAccent={false}
        active={activeFilter === "Semua"}
        onClick={() => pick("Semua")}
        label="Total Laporan Terdata"
        value={valueOf(summary?.totalReports)}
        caption="Titik terpetakan dalam sistem"
        icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
      />
      <StatCard
        tone="orange"
        active={activeFilter === "Pending"}
        onClick={() => pick("Pending")}
        label="Menunggu Verifikasi"
        value={valueOf(summary?.pendingVerification)}
        caption="Perlu aksi verifikator dinas"
        icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
        badge={
          <span className="mb-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-500">
            Prioritas
          </span>
        }
      />
      <StatCard
        tone="blue"
        active={activeFilter === "Terverifikasi & Ditangani"}
        onClick={() => pick("Terverifikasi & Ditangani")}
        label="Terverifikasi & Ditangani"
        value={valueOf(summary?.verifiedAndHandled)}
        caption="Diteruskan ke tim lapangan PUPR"
        icon={<Wrench className="h-5 w-5" aria-hidden="true" />}
        badge={
          <span className="mb-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
            {ratio}
          </span>
        }
      />
      <StatCard
        tone="green"
        active={activeFilter === "Selesai"}
        onClick={() => pick("Selesai")}
        label="Selesai Ditambal"
        value={valueOf(summary?.completed)}
        caption="Perbaikan selesai & tertutup"
        icon={<CircleCheck className="h-5 w-5" aria-hidden="true" />}
        badge={
          <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            <CircleCheck className="h-3 w-3" aria-hidden="true" />
            {summary ? `${summary.rejected} ditolak` : "—"}
          </span>
        }
      />
    </section>
  );
}

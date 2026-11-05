import type { ReactNode } from "react";
import { CircleCheck, ClipboardList, MapPin, TrendingUp, Wrench } from "lucide-react";
import { dashboardStats } from "../../services/mockData";

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
};

function StatCard({
  tone,
  label,
  value,
  caption,
  icon,
  badge,
  showAccent = true,
}: StatCardProps) {
  const style = tones[tone];

  return (
    <article className="relative flex min-h-[118px] items-center justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
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
    </article>
  );
}

export default function StatCards() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        tone="slate"
        showAccent={false}
        label="Total Laporan Terdata"
        value={formatCount(dashboardStats.totalReports)}
        caption="Titik terpetakan dalam sistem"
        icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
        badge={
          <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />+
            {dashboardStats.totalChangePercent}%
          </span>
        }
      />
      <StatCard
        tone="orange"
        label="Menunggu Verifikasi"
        value={formatCount(dashboardStats.pendingVerification)}
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
        label="Terverifikasi & Ditangani"
        value={formatCount(dashboardStats.verifiedAndHandled)}
        caption="Diteruskan ke tim lapangan PUPR"
        icon={<Wrench className="h-5 w-5" aria-hidden="true" />}
        badge={
          <span className="mb-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
            {dashboardStats.verifiedRatioLabel}
          </span>
        }
      />
      <StatCard
        tone="green"
        label="Selesai Ditambal"
        value={formatCount(dashboardStats.completed)}
        caption="Perbaikan selesai & tertutup"
        icon={<CircleCheck className="h-5 w-5" aria-hidden="true" />}
        badge={
          <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            <CircleCheck className="h-3 w-3" aria-hidden="true" />
            {dashboardStats.qaLabel}
          </span>
        }
      />
    </section>
  );
}

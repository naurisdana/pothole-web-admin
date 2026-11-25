import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ClipboardCheck, MapPinned, Scale } from "lucide-react";
import PublicFrame from "../components/layout/PublicFrame";
import { completeOnboarding, readSession } from "../services/session";
import { URGENCY_WEIGHTS } from "../types/report";

const steps = [
  {
    icon: ClipboardCheck,
    kicker: "Antrean verifikasi",
    title: "Satu layar untuk memutus laporan",
    body: "Setiap deteksi dari aplikasi pengemudi masuk sebagai laporan dengan kode, waktu, ruas jalan, dan jumlah pelapor. Pilih baris atau titik peta untuk membuka panel inspeksi.",
    points: [
      "Foto bukti dan kotak deteksi YOLOv8",
      "Telemetri GPS, kecepatan, dan akurasi",
      "Keputusan Pending, Terverifikasi, atau Ditolak",
    ],
  },
  {
    icon: Scale,
    kicker: "Model skor urgensi",
    title: "Skor dihitung dari L, K, P, dan T",
    body: "Kategori mengikuti skor yang sama dengan antrean dan panel detail. Rendah sampai 33, sedang sampai 66, dan di atasnya tinggi.",
    points: [
      `L luas area, bobot ${Math.round(URGENCY_WEIGHTS.L * 100)}%`,
      `K kedalaman, bobot ${Math.round(URGENCY_WEIGHTS.K * 100)}%`,
      `P posisi lajur ${Math.round(URGENCY_WEIGHTS.P * 100)}% dan T kepadatan ${Math.round(URGENCY_WEIGHTS.T * 100)}%`,
    ],
  },
  {
    icon: MapPinned,
    kicker: "Peta dan tindak lanjut",
    title: "Warna peta mengikuti kategori yang sama",
    body: "Titik merah, kuning, dan hijau memakai kategori High, Medium, dan Low. Setelah terverifikasi, laporan dilanjutkan ke penanganan lapangan sampai selesai.",
    points: [
      "Pending menunggu keputusan verifikator",
      "Terverifikasi diteruskan ke tim PUPR",
      "Dalam penanganan, selesai, atau ditolak tetap tercatat",
    ],
  },
] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const last = step === steps.length - 1;

  function finish() {
    completeOnboarding();
    navigate(readSession() ? "/" : "/login", { replace: true });
  }

  return (
    <PublicFrame>
      <section className="w-full max-w-[560px] rounded-2xl border border-slate-200/80 bg-white px-7 py-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:px-8">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-blue-600">
          PANDUAN VERIFIKATOR {step + 1}/{steps.length}
        </p>
        <div className="mt-4 flex gap-2">
          {steps.map((item, index) => (
            <span
              key={item.kicker}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-blue-600" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          {current.kicker}
        </p>
        <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight text-slate-900">
          {current.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{current.body}</p>
        <ul className="mt-5 space-y-2">
          {current.points.map((point) => (
            <li
              key={point}
              className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
            >
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </button>
          {last ? (
            <button
              type="button"
              onClick={finish}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
            >
              {readSession() ? "Masuk ke Dashboard" : "Lanjut ke Login"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((value) => value + 1)}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Berikutnya
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Sudah paham alurnya?{" "}
          <Link to="/login" onClick={completeOnboarding} className="font-semibold text-blue-600">
            Langsung masuk
          </Link>
        </p>
      </section>
    </PublicFrame>
  );
}

import { useEffect, useId, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  IdCard,
  LifeBuoy,
  Lock,
  Shield,
} from "lucide-react";

import PublicFrame from "../components/layout/PublicFrame";
import { login as loginRequest } from "../services/api";
import { isOnboarded, readSession, startSession } from "../services/session";

const DEMO_EMAIL = "verifikator@pupr.go.id";
const DEMO_PASSWORD = "secretPassword123";

export default function Login() {
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState("");
  const [resetHint, setResetHint] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sopOpen, setSopOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (readSession()) {
      navigate(isOnboarded() ? "/" : "/onboarding", { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Email kedinasan dan kata sandi wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginRequest(normalizedEmail, password);
      if (rememberDevice) {
        window.localStorage.setItem("roadsafe.rememberEmail", normalizedEmail);
      } else {
        window.localStorage.removeItem("roadsafe.rememberEmail");
      }
      startSession(result.user.email, result.token, result.user);
      navigate(isOnboarded() ? "/" : "/onboarding", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Login gagal. Periksa akun verifikator.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicFrame>
      <div className="flex w-full max-w-[480px] flex-col items-center">
          <form
            onSubmit={handleSubmit}
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-7 py-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:px-8"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Shield className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-center text-[26px] font-extrabold tracking-tight text-slate-900">
              ROADSAFE <span className="text-blue-600">ADMIN</span>
            </h1>
            <p className="mt-2 text-center text-sm leading-snug text-slate-500">
              Portal Verifikasi & Manajemen Pelaporan Kerusakan Jalan
              <span className="block">Otonom</span>
            </p>

            <div className="mt-7 space-y-4">
              <div>
                <label htmlFor={emailId} className="mb-1.5 block text-[13px] font-semibold text-slate-800">
                  Email Kedinasan / NIP Verifikator
                </label>
                <div className="relative">
                  <IdCard
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={passwordId}
                  className="mb-1.5 block text-[13px] font-semibold text-slate-800"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id={passwordId}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(event) => setRememberDevice(event.target.checked)}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                  Ingat sesi perangkat ini
                </label>
                <button
                  type="button"
                  onClick={() => setResetHint((open) => !open)}
                  className="cursor-pointer text-[13px] font-medium text-blue-600 hover:text-blue-700"
                >
                  Lupa kata sandi?
                </button>
              </div>

              {resetHint ? (
                <p className="text-xs leading-relaxed text-blue-600">
                  Reset kata sandi diproses oleh IT Helpdesk Dinas PUPR pada jam kerja.
                </p>
              ) : null}
              {error ? (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? "Memeriksa akun..." : "Masuk ke Dashboard Verifikasi"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-slate-500">
                  Akses aman terenkripsi TLS 1.3. Khusus staf berwenang Dinas PUPR dan
                  Administrator Sistem. Setiap riwayat autentikasi dicatat dalam audit trail
                  keamanan.
                </p>
              </div>
            </div>
          </form>

          <div
            className={`relative mt-6 flex items-center gap-5 text-[13px] text-slate-500 ${helpOpen || sopOpen ? "mb-28" : ""}`}
          >
            <button
              type="button"
              onClick={() => {
                setHelpOpen((open) => !open);
                setSopOpen(false);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 hover:text-slate-700"
              aria-expanded={helpOpen}
            >
              <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              Bantuan IT Helpdesk
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => {
                setSopOpen((open) => !open);
                setHelpOpen(false);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 hover:text-slate-700"
              aria-expanded={sopOpen}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Panduan SOP Verifikasi
            </button>

            {helpOpen ? (
              <div className="absolute left-0 top-8 z-10 w-64 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs leading-relaxed text-slate-600 shadow-lg">
                Hubungi IT Helpdesk internal Dinas, ekstensi 2104, pada hari kerja pukul
                08.00–16.00 WIB.
              </div>
            ) : null}
            {sopOpen ? (
              <div className="absolute right-0 top-8 z-10 w-72 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs leading-relaxed text-slate-600 shadow-lg">
                Validasi foto laporan, cek duplikasi dalam radius 15 meter, lalu teruskan ke
                tim lapangan atau abaikan jika bukan kerusakan jalan.
              </div>
            ) : null}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Baru di portal ini?{" "}
            <Link to="/onboarding" className="font-semibold text-blue-600">
              Ikuti panduan onboarding
            </Link>
          </p>
        </div>
    </PublicFrame>
  );
}

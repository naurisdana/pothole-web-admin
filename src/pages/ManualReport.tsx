import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import { Camera, CheckCircle2, LocateFixed, MapPin } from "lucide-react";
import { submitManualReport } from "../services/api";
import { calculateScore, categoryFromScore, type ReportCategory, type ReportParameters } from "../types/report";
import "leaflet/dist/leaflet.css";

const BOGOR_CENTER: [number, number] = [-6.597147, 106.806038];
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const GPS_LIMIT_M = 20;

const URGENCY: Record<ReportCategory, { label: string; hint: string; parameters: ReportParameters }> = {
  Low: {
    label: "Rendah",
    hint: "Lubang kecil, di tepi jalan",
    parameters: { L: 30, K: 25, P: 20, T: 25 },
  },
  Medium: {
    label: "Sedang",
    hint: "Perlu perhatian, masih bisa dilalui",
    parameters: { L: 60, K: 55, P: 50, T: 50 },
  },
  High: {
    label: "Tinggi",
    hint: "Lebar atau di jalur utama",
    parameters: { L: 90, K: 80, P: 90, T: 70 },
  },
};

const pin = divIcon({
  className: "roadsafe-pin",
  iconSize: [26, 34],
  iconAnchor: [13, 33],
  html: `<svg width="26" height="34" viewBox="0 0 22 30" aria-hidden="true"><path d="M11 0C5.5 0 1 4.4 1 9.8 1 17.2 11 29 11 29s10-11.8 10-19.2C21 4.4 16.5 0 11 0z" fill="#2563eb" stroke="white" stroke-width="1.6"/><circle cx="11" cy="10" r="3.1" fill="white"/></svg>`,
});

function MapClick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

function FlyTo({ lat, lng, token }: { lat: number; lng: number; token: number }) {
  const map = useMap();
  const seen = useRef(0);

  useEffect(() => {
    if (token === 0 || token === seen.current) return;
    seen.current = token;
    map.setView([lat, lng], 16);
  }, [lat, lng, map, token]);

  return null;
}

function parseCoordinate(value: string): number | null {
  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ManualReport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [street, setStreet] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<ReportCategory>("Medium");
  const [flyToken, setFlyToken] = useState(0);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdCode, setCreatedCode] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const lat = parseCoordinate(latitude);
  const lng = parseCoordinate(longitude);
  const hasPoint = lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  const score = calculateScore(URGENCY[urgency].parameters);
  const category = categoryFromScore(score);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0];
    setError("");
    setCreatedCode("");
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("File harus berupa foto.");
      return;
    }
    if (next.size > MAX_PHOTO_BYTES) {
      setError("Ukuran foto maksimal 8 MB.");
      return;
    }
    setFile(next);
  }

  function placePoint(nextLat: number, nextLng: number, nextAccuracy: number) {
    setLatitude(nextLat.toFixed(6));
    setLongitude(nextLng.toFixed(6));
    setAccuracy(nextAccuracy);
    setFlyToken((token) => token + 1);
    setError("");
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setError("Browser ini tidak menyediakan lokasi perangkat.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextAccuracy = Math.round(position.coords.accuracy * 10) / 10;
        placePoint(position.coords.latitude, position.coords.longitude, nextAccuracy);
        if (nextAccuracy > GPS_LIMIT_M) {
          setError(
            `Akurasi GPS ${nextAccuracy} m. Server menolak di atas ${GPS_LIMIT_M} m. Ketuk peta untuk menandai titik yang lebih tepat.`,
          );
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Lokasi perangkat tidak dapat dibaca. Ketuk peta atau isi koordinat secara manual.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreatedCode("");
    if (!file) {
      setError("Pilih foto bukti lubang terlebih dahulu.");
      return;
    }
    if (!street.trim()) {
      setError("Isi nama jalan atau alamat lokasi.");
      return;
    }
    if (!hasPoint || lat === null || lng === null) {
      setError("Tandai titik lokasi di peta, atau isi lintang dan bujur.");
      return;
    }
    if (accuracy === null || accuracy > GPS_LIMIT_M) {
      setError(`Akurasi lokasi harus ${GPS_LIMIT_M} meter atau lebih baik. Ketuk peta untuk mengunci titik.`);
      return;
    }

    setSubmitting(true);
    try {
      const report = await submitManualReport({
        file,
        street: street.trim(),
        latitude: lat,
        longitude: lng,
        accuracyM: accuracy,
        parameters: URGENCY[urgency].parameters,
      });
      setCreatedCode(report.id);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Laporan gagal dikirim.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-4">
      <div className="mb-4">
        <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Laporkan lubang secara manual</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Unggah foto bukti dan tandai lokasi. Laporan masuk ke antrean verifikasi yang sama dengan hasil kamera ponsel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Foto bukti</h2>
          <p className="mt-1 text-xs text-slate-500">JPG, PNG, atau WEBP, maksimal 8 MB.</p>
          <label className="mt-4 flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center hover:border-blue-400 hover:bg-blue-50/40">
            {preview ? (
              <img src={preview} alt="Pratinjau foto lubang" className="h-72 w-full object-cover" />
            ) : (
              <span className="px-6 py-16">
                <Camera className="mx-auto h-8 w-8 text-blue-600" aria-hidden="true" />
                <span className="mt-3 block text-sm font-semibold text-slate-800">Pilih atau jatuhkan foto</span>
                <span className="mt-1 block text-xs text-slate-500">Klik area ini untuk membuka berkas</span>
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={choosePhoto}
            />
          </label>
          {file ? (
            <p className="mt-2 truncate text-xs text-slate-500">{file.name}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Lokasi</h2>
                <p className="mt-1 text-xs text-slate-500">Ketuk peta, isi koordinat, atau gunakan lokasi perangkat.</p>
              </div>
              <button
                type="button"
                onClick={useDeviceLocation}
                disabled={locating}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
              >
                <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
                {locating ? "Membaca lokasi..." : "Gunakan lokasi saya"}
              </button>
            </div>

            <label className="mt-4 block text-[13px] font-semibold text-slate-800" htmlFor="street">
              Nama jalan
            </label>
            <input
              id="street"
              value={street}
              onChange={(event) => setStreet(event.target.value)}
              placeholder="Jl. Pajajaran No. 45, Bogor Tengah"
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-slate-800" htmlFor="latitude">
                  Lintang
                </label>
                <input
                  id="latitude"
                  inputMode="decimal"
                  value={latitude}
                  onChange={(event) => {
                    setLatitude(event.target.value);
                    setAccuracy(5);
                  }}
                  placeholder="-6.597147"
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-800" htmlFor="longitude">
                  Bujur
                </label>
                <input
                  id="longitude"
                  inputMode="decimal"
                  value={longitude}
                  onChange={(event) => {
                    setLongitude(event.target.value);
                    setAccuracy(5);
                  }}
                  placeholder="106.806038"
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {accuracy === null
                ? "Titik belum ditandai."
                : `Akurasi ${accuracy} m${accuracy > GPS_LIMIT_M ? " — terlalu kasar untuk dikirim" : ""}`}
            </p>

            <div className="mt-3 h-64 overflow-hidden rounded-xl border border-slate-200">
              <MapContainer
                center={BOGOR_CENTER}
                zoom={13}
                className="roadsafe-map h-full w-full"
                style={{ height: "16rem", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClick onPick={(nextLat, nextLng) => placePoint(nextLat, nextLng, 5)} />
                {hasPoint && lat !== null && lng !== null ? <FlyTo lat={lat} lng={lng} token={flyToken} /> : null}
                {hasPoint && lat !== null && lng !== null ? <Marker position={[lat, lng]} icon={pin} /> : null}
              </MapContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Urgensi awal</h2>
            <p className="mt-1 text-xs text-slate-500">
              Skor perkiraan {score.toFixed(1)} · {category === "High" ? "Tinggi" : category === "Medium" ? "Sedang" : "Rendah"}. Server menghitung ulang dari parameter L, K, P, dan T.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(Object.keys(URGENCY) as ReportCategory[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setUrgency(key)}
                  className={`rounded-xl border px-3 py-2 text-left ${
                    urgency === key
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-sm font-semibold">{URGENCY[key].label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug">{URGENCY[key].hint}</span>
                </button>
              ))}
            </div>

            {error ? (
              <p role="alert" className="mt-3 text-xs font-medium text-rose-600">
                {error}
              </p>
            ) : null}
            {createdCode ? (
              <p className="mt-3 flex items-start gap-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Laporan {createdCode} masuk antrean.{" "}
                  <Link to="/" className="font-semibold text-blue-700 underline">
                    Lihat di verifikasi
                  </Link>
                </span>
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? "Mengirim laporan..." : "Kirim laporan"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

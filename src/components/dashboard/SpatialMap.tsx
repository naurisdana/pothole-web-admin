import { useEffect, useRef, useState } from "react";
import { Circle, CircleMarker, MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { divIcon, type DivIcon } from "leaflet";
import { Crosshair, Minus, Plus } from "lucide-react";
import type { PotholeReport } from "../../types/report";
import { CATEGORY_META, formatScore, streetName } from "../../utils/reportDisplay";
import "leaflet/dist/leaflet.css";

const BOGOR_CENTER: [number, number] = [-6.5982, 106.8041];

const TILES = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
} as const;

type MapMode = "osm" | "satellite" | "heatmap";

const pinCache = new Map<string, DivIcon>();

function pinIcon(color: string, active: boolean): DivIcon {
  const key = `${color}:${active ? "on" : "off"}`;
  const cached = pinCache.get(key);
  if (cached) return cached;

  const width = active ? 26 : 22;
  const height = active ? 34 : 30;
  const icon = divIcon({
    className: "roadsafe-pin",
    iconSize: [width, height],
    iconAnchor: [width / 2, height - 1],
    html: `<svg width="${width}" height="${height}" viewBox="0 0 22 30" aria-hidden="true"><path d="M11 0C5.5 0 1 4.4 1 9.8 1 17.2 11 29 11 29s10-11.8 10-19.2C21 4.4 16.5 0 11 0z" fill="${color}" stroke="white" stroke-width="1.6"/><circle cx="11" cy="10" r="3.1" fill="white"/></svg>`,
  });
  pinCache.set(key, icon);
  return icon;
}

const LEGEND = [
  { label: "Tinggi (>70)", count: "18 Titik", dot: "bg-red-500" },
  { label: "Sedang (40–70)", count: "19 Titik", dot: "bg-amber-400" },
  { label: "Rendah (<40)", count: "5 Titik", dot: "bg-emerald-500" },
];

function MapControls() {
  const map = useMap();

  return (
    <div className="absolute right-3 top-[4.5rem] z-[1000] flex flex-col gap-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          aria-label="Perbesar peta"
          onClick={() => map.zoomIn()}
          className="flex h-9 w-9 cursor-pointer items-center justify-center border-b border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Perkecil peta"
          onClick={() => map.zoomOut()}
          className="flex h-9 w-9 cursor-pointer items-center justify-center text-slate-600 hover:bg-slate-50"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        aria-label="Pusatkan peta ke Bogor"
        onClick={() => map.setView(BOGOR_CENTER, 13)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <Crosshair className="h-4 w-4" />
      </button>
    </div>
  );
}

function FlyToSelected({
  id,
  lat,
  lng,
  focusTick,
}: {
  id: string | null;
  lat: number;
  lng: number;
  focusTick: number;
}) {
  const map = useMap();
  const lastTick = useRef(0);

  useEffect(() => {
    if (!id || focusTick === 0 || focusTick === lastTick.current) return;
    lastTick.current = focusTick;
    map.flyTo([lat, lng], 15, { duration: 0.6 });
  }, [focusTick, id, lat, lng, map]);

  return null;
}

type SpatialMapProps = {
  reports: PotholeReport[];
  selectedId: string | null;
  focusTick: number;
  onSelect: (id: string) => void;
};

export default function SpatialMap({ reports, selectedId, focusTick, onSelect }: SpatialMapProps) {
  const [mode, setMode] = useState<MapMode>("osm");
  const selected = reports.find((report) => report.id === selectedId) ?? null;
  const tile = mode === "satellite" ? TILES.satellite : TILES.osm;

  return (
    <section className="relative h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:h-full">
      <h2 className="sr-only">Peta spasial kerusakan jalan di Bogor</h2>
      <MapContainer
        center={BOGOR_CENTER}
        zoom={13}
        zoomControl={false}
        className="roadsafe-map h-full w-full"
      >
        <TileLayer key={tile.url} attribution={tile.attribution} url={tile.url} />
        <MapControls />
        <FlyToSelected
          id={selected?.id ?? null}
          lat={selected?.coordinates.lat ?? BOGOR_CENTER[0]}
          lng={selected?.coordinates.lng ?? BOGOR_CENTER[1]}
          focusTick={focusTick}
        />
        {selected ? (
          <Circle
            center={[selected.coordinates.lat, selected.coordinates.lng]}
            radius={15}
            pathOptions={{
              color: "#2563eb",
              weight: 1.5,
              dashArray: "3 3",
              fillColor: "#2563eb",
              fillOpacity: 0.18,
            }}
          />
        ) : null}
        {reports.map((report) => {
          const color = CATEGORY_META[report.category].marker;
          const active = report.id === selectedId;
          const position: [number, number] = [report.coordinates.lat, report.coordinates.lng];

          if (mode === "heatmap") {
            return (
              <CircleMarker
                key={`heat-${report.id}`}
                center={position}
                radius={12 + report.score / 7}
                pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: active ? 0.55 : 0.32 }}
                eventHandlers={{ click: () => onSelect(report.id) }}
              >
                <Tooltip direction="top">
                  {streetName(report)} · {formatScore(report.score)}
                </Tooltip>
              </CircleMarker>
            );
          }

          return (
            <Marker
              key={report.id}
              position={position}
              icon={pinIcon(color, active)}
              title={streetName(report)}
              zIndexOffset={active ? 600 : 0}
              eventHandlers={{ click: () => onSelect(report.id) }}
            >
              {active ? (
                <Tooltip
                  permanent
                  direction="right"
                  offset={[8, -18]}
                  className={`roadsafe-score-tip tone-${report.category.toLowerCase()}`}
                >
                  {formatScore(report.score)}
                </Tooltip>
              ) : (
                <Tooltip direction="top">
                  {streetName(report)} · {formatScore(report.score)}
                </Tooltip>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute right-3 top-3 z-[1000] flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {(
          [
            ["osm", "OpenStreetMap"],
            ["satellite", "Satelit"],
            ["heatmap", "Heatmap"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${
              mode === value ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <aside className="pointer-events-none absolute bottom-3 right-3 z-[500] w-[232px] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md">
        <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.08em] text-slate-400">
          <span>LEGENDA URGENSI</span>
          <span>SEVERITY AI</span>
        </div>
        <ul className="mt-2 space-y-1.5">
          {LEGEND.map((item) => (
            <li key={item.label} className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-2 text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                {item.label}
              </span>
              <span className="font-medium text-slate-500">{item.count}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            PostGIS Klaster: 15m
          </span>
          <span className="whitespace-nowrap">Skala 1:10.000</span>
        </div>
      </aside>

      {reports.length === 0 ? (
        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-white/70 text-sm text-slate-500">
          Tidak ada titik untuk filter ini.
        </div>
      ) : null}
    </section>
  );
}

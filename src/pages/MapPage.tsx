import { mockReports } from "../services/mockData";

export default function MapPage() {
  const bogorCount = mockReports.filter((report) => report.city === "Bogor").length;
  const jakartaCount = mockReports.filter((report) => report.city === "Jakarta").length;

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">Peta Spasial</h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
        Rute peta untuk klaster laporan Bogor dan Jakarta. {mockReports.length} sampel
        siap dipetakan: {bogorCount} di Bogor dan {jakartaCount} di Jakarta. Integrasi
        Leaflet menyusul pada tahap peta.
      </p>
    </section>
  );
}

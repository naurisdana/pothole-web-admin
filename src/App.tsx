import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RequireSession from "./components/auth/RequireSession";
import DashboardShell from "./components/layout/DashboardShell";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ManualReport from "./pages/ManualReport.tsx";
import MapPage from "./pages/MapPage";
import Onboarding from "./pages/Onboarding";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route element={<RequireSession />}>
          <Route element={<DashboardShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analitik" element={<Analytics />} />
            <Route path="/laporan" element={<ManualReport />} />
            <Route path="/map" element={<MapPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

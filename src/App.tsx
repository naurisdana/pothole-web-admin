import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardShell from "./components/layout/DashboardShell";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MapPage from "./pages/MapPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<DashboardShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

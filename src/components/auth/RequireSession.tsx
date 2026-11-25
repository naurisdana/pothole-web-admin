import { Navigate, Outlet } from "react-router-dom";
import { isOnboarded, readSession } from "../../services/session";

export default function RequireSession() {
  if (!readSession()) {
    return <Navigate to={isOnboarded() ? "/login" : "/onboarding"} replace />;
  }

  return <Outlet />;
}

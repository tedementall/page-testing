// src/components/AdminProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToken } from "../api/http";

const ADMIN_STRICT = String(import.meta.env.VITE_ADMIN_STRICT || "false").toLowerCase() === "true";

function isAdminUser(user) {
  if (!user) return false;
  if (user.is_admin === true || user.admin === true) return true;
  const role = (user.role?.name || user.role || user.user_type || user.type || "")
    .toString()
    .toLowerCase();
  if (role === "admin" || role === "administrator") return true;
  const roles = Array.isArray(user.roles) ? user.roles : user.roles?.split?.(",") || [];
  return roles.map((r) => String(r).toLowerCase()).includes("admin");
}

export default function AdminProtectedRoute() {
  const { status, user, lastErrorCode } = useAuth(); // ⬅️ agrega lastErrorCode en tu AuthContext (abajo)
  const location = useLocation();

  const token = getToken();
  const hasSession = !!token;

  // Mientras valida sesión → no redirigir
  if (status === "checking") {
    return <div className="content-panel"><div className="text-center py-5">Verificando sesión…</div></div>;
  }

  // Si no hay token → al login
  if (!hasSession) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Si hubo 429 en /me, NO botar: dejar pasar con token
  const rateLimited = lastErrorCode === 429;

  if (ADMIN_STRICT && !rateLimited) {
    // Si aún no llega el user, espera
    if (!user) {
      return <div className="content-panel"><div className="text-center py-5">Cargando perfil…</div></div>;
    }
    if (!isAdminUser(user)) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
  }

  return <Outlet />;
}

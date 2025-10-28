// src/components/AdminProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToken } from "../api/http"; // <- ya lo tienes exportado

// Si pones VITE_ADMIN_STRICT=true en .env, exige rol admin
const ADMIN_STRICT = String(import.meta.env.VITE_ADMIN_STRICT || "false").toLowerCase() === "true";

function isAdminUser(user) {
  if (!user) return false;

  if (user.is_admin === true || user.admin === true) return true;

  const role = (user.role?.name || user.role || user.user_type || user.type || "")
    .toString()
    .toLowerCase();
  if (role === "admin" || role === "administrator") return true;

  const roles = Array.isArray(user.roles) ? user.roles : user.roles?.split?.(",") || [];
  if (roles.map((r) => String(r).toLowerCase()).includes("admin")) return true;

  return false;
}

export default function AdminProtectedRoute() {
  const { status, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1) Mientras valida sesión
  if (status === "checking") {
    return (
      <div className="content-panel">
        <div className="text-center py-5">Verificando sesión…</div>
      </div>
    );
  }

  // 2) Si NO hay token y el estado ya dijo "unauthenticated" -> al login
  const token = getToken();
  if (!token && status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) Hay token o el contexto ya dijo autenticado -> dejar pasar (aunque user sea null)
  const allowBySession = Boolean(token) || isAuthenticated;

  // 4) Si activaste modo estricto, además exige rol admin (cuando user ya está)
  if (ADMIN_STRICT && allowBySession) {
    // Si todavía no llega el user, deja pasar (evitas rebote); las páginas pueden mostrar loaders.
    if (!user) return <Outlet />;
    if (!isAdminUser(user)) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }

  // 5) Permitir acceso
  if (allowBySession) {
    return <Outlet />;
  }

  // 6) Fallback seguro
  return <Navigate to="/login" replace state={{ from: location }} />;
}

// src/components/AdminProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminProtectedRoute() {
  const { isAdmin, isAuthenticated, status, isLoading, user, role } = useAuth();
  const location = useLocation();

  // 🔎 Diagnóstico (míralo en la consola)
  console.log("[AdminGuard]", { status, isLoading, isAuthenticated, role, user });

  // Mientras valida el token y hace /auth/me, no decidas
  if (isLoading || status === "checking") {
    return <div className="p-6 text-white">Cargando sesión…</div>;
  }

  // Si no hay sesión: a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Fallback temporal: permite admin por correo (para test)
  const emailIsAdmin = user?.email?.toLowerCase() === "mint@gmail.com";

  // Si hay sesión pero no es admin: a Home
  if (!isAdmin && !emailIsAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

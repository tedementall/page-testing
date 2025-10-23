import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminProtectedRoute() {
  const { user, isLoading } = useAuth();

  // 1. Si aún está cargando el usuario, no mostramos nada
  if (isLoading) {
    return <div>Cargando...</div>; // O un spinner
  }

  // 2. Si cargó y el user_type NO es 'admin', lo sacamos al Home
  if (user?.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 3. Si es 'admin', le permitimos ver la página (el <Outlet />)
  return <Outlet />;
}
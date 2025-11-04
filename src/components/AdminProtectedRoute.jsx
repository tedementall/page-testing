// src/components/AdminProtectedRoute.jsx
// VERSIÓN TEMPORAL - Hardcodea usuarios admin por ID mientras arreglas Xano
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToken } from "../api/http";
import { useEffect, useState } from "react";

const ADMIN_STRICT = String(import.meta.env.VITE_ADMIN_STRICT || "false").toLowerCase() === "true";

// 🔧 TEMPORAL: Lista de IDs de usuarios que son admin
// Mientras arreglas el endpoint /auth/me en Xano
const HARDCODED_ADMIN_IDS = [2]; // ← Tu ID es 2, según los logs

function isAdminUser(user) {
  if (!user) return false;
  
  // 🔧 TEMPORAL: Verificar por ID hardcodeado
  if (HARDCODED_ADMIN_IDS.includes(user.id)) {
    console.log("[AdminProtectedRoute] ✅ Usuario admin por ID hardcodeado:", user.id);
    return true;
  }
  
  // Verificaciones normales (cuando Xano devuelva el campo)
  if (user.is_admin === true || user.admin === true) return true;
  const role = (user.role?.name || user.role || user.user_type || user.type || "")
    .toString()
    .toLowerCase();
  if (role === "admin" || role === "administrator") return true;
  const roles = Array.isArray(user.roles) ? user.roles : user.roles?.split?.(",") || [];
  return roles.map((r) => String(r).toLowerCase()).includes("admin");
}

export default function AdminProtectedRoute() {
  const { status, user, lastErrorCode } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const token = getToken();
  const hasSession = !!token;

  // Debug logs
  useEffect(() => {
    console.log("[AdminProtectedRoute] Estado:", {
      status,
      hasSession,
      hasUser: !!user,
      userId: user?.id,
      isAdmin: isAdminUser(user),
      lastErrorCode,
      pathname: location.pathname,
      ADMIN_STRICT,
      userRole: user?.role || user?.user_type || user?.type || "sin rol"
    });
  }, [status, hasSession, user, lastErrorCode, location.pathname]);

  // Timeout de seguridad
  useEffect(() => {
    if (status === "checking") {
      const timer = setTimeout(() => {
        console.warn("[AdminProtectedRoute] Timeout en checking, permitiendo acceso con token");
        setLoadingTimeout(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [status]);

  // Si no hay token → al login
  if (!hasSession) {
    console.log("[AdminProtectedRoute] Sin token, redirigiendo a login");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Si hay 429 (rate limit), permitir acceso si tiene token válido
  const rateLimited = lastErrorCode === 429;
  if (rateLimited) {
    console.warn("[AdminProtectedRoute] Error 429 detectado, permitiendo acceso con token existente");
    return <Outlet />;
  }

  // Mientras valida sesión (pero con timeout de seguridad)
  if (status === "checking" && !loadingTimeout) {
    return (
      <div className="content-panel">
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Verificando sesión...</span>
          </div>
          <p>Verificando sesión…</p>
        </div>
      </div>
    );
  }

  // Si el timeout se cumplió, dejar pasar con el token
  if (loadingTimeout && hasSession) {
    console.warn("[AdminProtectedRoute] Timeout alcanzado, permitiendo acceso con token");
    return <Outlet />;
  }

  // Modo estricto: verificar rol de admin
  if (ADMIN_STRICT) {
    if (!user && status === "checking") {
      return (
        <div className="content-panel">
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando perfil...</span>
            </div>
            <p>Cargando perfil…</p>
          </div>
        </div>
      );
    }

    if (user && !isAdminUser(user)) {
      console.warn("[AdminProtectedRoute] Usuario no es admin, redirigiendo");
      return <Navigate to="/" replace />;
    }
  }

  // Si el status es "unauthenticated" explícitamente
  if (status === "unauthenticated") {
    console.log("[AdminProtectedRoute] Status unauthenticated, redirigiendo a login");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Todo bien, dejar pasar
  console.log("[AdminProtectedRoute] ✅ Acceso permitido");
  return <Outlet />;
}
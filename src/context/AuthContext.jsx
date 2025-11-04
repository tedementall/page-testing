import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as AuthApi from "../api/authApi";
import { getToken, onUnauthorized } from "../api/http";

const AuthContext = createContext(null);

/* ------------------------- helpers ------------------------- */
function extractErrorMessage(error, fallback) {
  if (!error) return fallback;
  const res = error?.response?.data;
  if (typeof res === "string" && res.trim()) return res;
  if (res && typeof res === "object") {
    if (typeof res.message === "string" && res.message.trim()) return res.message;
    if (typeof res.error === "string" && res.error.trim()) return res.error;
    if (Array.isArray(res.errors) && res.errors.length) {
      const first = res.errors[0];
      if (typeof first === "string") return first;
      if (first && typeof first.message === "string") return first.message;
    }
    if (typeof res.detail === "string" && res.detail.trim()) return res.detail;
  }
  if (typeof error.message === "string" && error.message.trim()) return error.message;
  return fallback;
}

const initialStatus = (() => {
  try { return getToken() ? "checking" : "unauthenticated"; }
  catch { return "unauthenticated"; }
})();

/* ========================= Provider ========================= */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(initialStatus); // checking | authenticated | unauthenticated
  const [isLoading, setIsLoading] = useState(initialStatus === "checking");
  const [authError, setAuthError] = useState(null);
  const [lastErrorCode, setLastErrorCode] = useState(null);

  // evita múltiples /me concurrentes
  const meInFlight = useRef(null);

  const applyLogout = useCallback(() => {
    try { AuthApi.logout?.(); } catch {}
    setUser(null);
    setStatus("unauthenticated");
    setIsLoading(false);
  }, []);

  // 401 global -> logout. (No tocamos 429 aquí)
  useEffect(() => {
    const unsubscribe = onUnauthorized((code) => {
      if (code !== 401) return; // solo 401 aquí
      setAuthError("Tu sesión expiró. Inicia sesión nuevamente.");
      applyLogout();
      navigate("/login", { replace: true, state: { from: location.pathname } });
    });
    return unsubscribe;
  }, [applyLogout, location.pathname, navigate]);

  // === Cargar /me con single-flight y manejo de 429 ===
  const loadMe = useCallback(async () => {
    if (meInFlight.current) return meInFlight.current;

    meInFlight.current = (async () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        setStatus("unauthenticated");
        setLastErrorCode(null);
        return null;
      }

      try {
        const profile = await AuthApi.me();
        setUser(profile);
        setStatus("authenticated");
        setAuthError(null);
        setLastErrorCode(null);
        return profile;
      } catch (error) {
        const code = error?.response?.status || null;
        setLastErrorCode(code);

        if (code === 429) {
          // 🔸 No tumbes sesión por rate limit; mantenemos authenticated si hay token.
          setStatus("authenticated");
          return user; // conserva el user previo si lo había
        }

        // Otros errores (403/401/5xx) -> desautentica
        const message = extractErrorMessage(error, "Tu sesión expiró. Inicia sesión nuevamente.");
        setAuthError(message);
        applyLogout();
        if (code === 401) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
        }
        return null;
      } finally {
        meInFlight.current = null;
        setIsLoading(false);
      }
    })();

    return meInFlight.current;
  }, [applyLogout, location.pathname, navigate, user]);

  // Cargar sesión si hay token (evita intentarlo en /login)
  useEffect(() => {
    const token = getToken();

    if (location.pathname === "/login") {
      setStatus("unauthenticated");
      setIsLoading(false);
      return;
    }
    if (!token) {
      setStatus("unauthenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setStatus("checking");
    loadMe();
  }, [location.pathname, loadMe]);

  // === login/signup/logout ===
  const login = useCallback(async (credentialsOrEmail, maybePassword) => {
    setIsLoading(true);
    setStatus("checking");
    setAuthError(null);
    try {
      const creds = typeof credentialsOrEmail === "object"
        ? credentialsOrEmail
        : { email: credentialsOrEmail, password: maybePassword };

      await AuthApi.login(creds); // guarda token
      const profile = await loadMe(); // usa single-flight
      return profile;
    } catch (error) {
      const message = extractErrorMessage(error, "No pudimos iniciar sesión. Verifica tus credenciales.");
      setAuthError(message);
      applyLogout();
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [applyLogout, loadMe]);

  const signup = useCallback(async (payload) => {
    setIsLoading(true);
    setStatus("checking");
    setAuthError(null);
    try {
      await AuthApi.signup(payload);
      const profile = await loadMe();
      return profile;
    } catch (error) {
      const message = extractErrorMessage(error, "No pudimos crear tu cuenta. Inténtalo nuevamente.");
      setAuthError(message);
      applyLogout();
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [applyLogout, loadMe]);

  const logout = useCallback(() => {
    setAuthError(null);
    applyLogout();
    navigate("/login", { replace: true });
  }, [applyLogout, navigate]);

  // Rol + flag admin
  const role = useMemo(() => {
    const r = user?.user_type ?? user?.role ?? user?.type ?? "";
    return String(r || "").toLowerCase();
  }, [user]);
  const isAdmin = role === "admin";

  const value = useMemo(() => ({
    user,
    role,
    isAdmin,
    status,
    isAuthenticated: status === "authenticated",
    isLoading,
    error: authError,
    lastErrorCode,               // ⬅️ útil para el guard
    login,
    signup,
    logout,
    refetchMe: loadMe,           // ⬅️ por si necesitas forzar
  }), [authError, isAdmin, isLoading, lastErrorCode, loadMe, logout, signup, status, user, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

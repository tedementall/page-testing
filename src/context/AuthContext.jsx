import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as AuthApi from "../api/authApi";
import { getToken, onUnauthorized } from "../api/http";

const AuthContext = createContext(null);

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
  try {
    return getToken() ? "checking" : "unauthenticated";
  } catch {
    return "unauthenticated";
  }
})();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(initialStatus === "checking");
  const [authError, setAuthError] = useState(null);

  const applyLogout = useCallback(() => {
    AuthApi.logout?.(); // no falla si no existe
    setUser(null);
    setStatus("unauthenticated");
    setIsLoading(false);
  }, []);

  // 401 global → logout + redirección
  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setAuthError("Tu sesión expiró. Inicia sesión nuevamente.");
      applyLogout();
      navigate("/login", { replace: true, state: { from: location.pathname } });
    });
    return unsubscribe;
  }, [applyLogout, location.pathname, navigate]);

  // Cargar sesión si hay token
  useEffect(() => {
    let cancelled = false;
    const token = getToken();

    // Permite ver /login sin intentar /me
    if (location.pathname === "/login") {
      setStatus("unauthenticated");
      setIsLoading(false);
      return;
    }

    if (!token) {
      setStatus("unauthenticated");
      setIsLoading(false);
      return () => { cancelled = true; };
    }

    setIsLoading(true);
    setStatus("checking");

    AuthApi.me()
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        setStatus("authenticated");
        setAuthError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        const message = extractErrorMessage(error, "Tu sesión expiró. Inicia sesión nuevamente.");
        setAuthError(message);
        applyLogout();
        if (error?.response?.status === 401) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [applyLogout, location.pathname, navigate]);

  const login = useCallback(
    async (credentialsOrEmail, maybePassword) => {
      setIsLoading(true);
      setStatus("checking");
      setAuthError(null);
      try {
        const creds = typeof credentialsOrEmail === "object"
          ? credentialsOrEmail
          : { email: credentialsOrEmail, password: maybePassword };

        await AuthApi.login(creds);     // debe guardar token en http/miniAxios
        const profile = await AuthApi.me();
        setUser(profile);
        setStatus("authenticated");
        return profile;
      } catch (error) {
        const message = extractErrorMessage(error, "No pudimos iniciar sesión. Verifica tus credenciales.");
        setAuthError(message);
        applyLogout();
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [applyLogout]
  );

  const signup = useCallback(
    async (payload) => {
      setIsLoading(true);
      setStatus("checking");
      setAuthError(null);
      try {
        await AuthApi.signup(payload);
        const profile = await AuthApi.me();
        setUser(profile);
        setStatus("authenticated");
        return profile;
      } catch (error) {
        const message = extractErrorMessage(error, "No pudimos crear tu cuenta. Inténtalo nuevamente.");
        setAuthError(message);
        applyLogout();
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [applyLogout]
  );

  const logout = useCallback(() => {
    setAuthError(null);
    applyLogout();
    navigate("/login", { replace: true });
  }, [applyLogout, navigate]);

  // === Rol normalizado + flag admin ===
  const role = useMemo(() => {
    const r = user?.user_type ?? user?.role ?? user?.type ?? "";
    return String(r || "").toLowerCase();
  }, [user]);

  const isAdmin = role === "admin";

  const value = useMemo(
    () => ({
      user,
      role,
      isAdmin,
      status,
      isAuthenticated: status === "authenticated",
      isLoading,
      error: authError,
      login,
      signup,
      logout,
    }),
    [authError, isAdmin, isLoading, login, logout, signup, status, user, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

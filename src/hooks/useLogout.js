// src/hooks/useLogout.js
import { useNavigate } from "react-router-dom";
import { clearToken } from "../api/http";
import { CartApi } from "../api/coreApi";
import { useAuth } from "../context/AuthContext";

export default function useLogout() {
  const navigate = useNavigate();
  const auth = useAuth?.();

  return async function logout() {
    try {
      // 1) Limpia token y carrito guardado
      clearToken();
      try { CartApi?.clearStoredCartId?.(); } catch {}

      // 2) Si tu AuthContext expone logout(), úsalo
      if (auth?.logout) {
        await auth.logout();
      } else {
        // Fallback: si no tienes logout(), fuerza estado “sin sesión”
        auth?.setStatus?.("unauthenticated");
        auth?.setUser?.(null);
      }
    } finally {
      // 3) Redirige al home
      navigate("/", { replace: true });
    }
  };
}

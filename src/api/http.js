// src/api/http.js
// Cliente base usando miniAxios (tu mini axios crea instancias compatibles con axios)

import { axios } from "../lib/miniAxios";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? "THEHUB_TOKEN";

// ✅ URLs completas a Xano (sin proxy). Cambia los GROUP_ID por los tuyos:
const CORE_BASE_FALLBACK = "https://x8ki-letl-twmt.n7.xano.io/api:Ekf2eplz";
const AUTH_BASE_FALLBACK = "https://x8ki-letl-twmt.n7.xano.io/api:Ekf2eplz";

// Si prefieres variables .env, estas tienen prioridad:
const coreBaseURL = import.meta.env.VITE_XANO_CORE_BASE ?? CORE_BASE_FALLBACK;
const authBaseURL = import.meta.env.VITE_XANO_AUTH_BASE ?? AUTH_BASE_FALLBACK;

function getStoredToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function persistToken(token) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}
export function setToken(t) { persistToken(t); }
export function getToken() { return getStoredToken(); }
export function clearToken() { persistToken(null); }

let unauthorizedSubscribers = new Set();
export function onUnauthorized(cb) {
  if (typeof cb !== "function") return () => {};
  unauthorizedSubscribers.add(cb);
  return () => unauthorizedSubscribers.delete(cb);
}

export const httpAuth = axios.create({ baseURL: authBaseURL, withCredentials: false });
export const httpCore = axios.create({ baseURL: coreBaseURL, withCredentials: false });

function applyInterceptors(instance) {
  instance.interceptors.request.use((config) => {
    const token = getStoredToken();
    config.headers = config.headers ?? {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (config.data && !(config.data instanceof FormData) && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  });

  instance.interceptors.response.use(
    (r) => r,
    (error) => {
      if (error?.response?.status === 401) {
        clearToken();
        unauthorizedSubscribers.forEach((cb) => { try { cb(error); } catch {} });
      }
      throw error;
    }
  );
}
applyInterceptors(httpAuth);
applyInterceptors(httpCore);

console.log("[http] CORE base:", httpCore.defaults.baseURL);
console.log("[http] AUTH base:", httpAuth.defaults.baseURL);

export { TOKEN_KEY };

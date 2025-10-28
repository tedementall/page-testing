// src/lib/miniAxios.js

/* =========================
 * URL builder + params
 * ========================= */
function buildURL(baseURL = "", url = "", params) {
  let target;

  if (baseURL && baseURL.startsWith("/")) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    target = new URL((baseURL + (url || "")).replace(/\/+/g, "/"), origin);
  } else if (baseURL && /^https?:/i.test(baseURL)) {
    target = new URL(url || "", baseURL);
  } else if (/^https?:/i.test(url)) {
    target = new URL(url);
  } else {
    const fallbackBase =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    target = new URL(url || "", fallbackBase);
  }

  if (params && typeof params === "object") {
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((x) => target.searchParams.append(k, x));
        else target.searchParams.set(k, v);
      });
  }

  return target.toString();
}

/* =========================
 * Auth token (Bearer)
 * ========================= */
const TOKEN_KEY = "token";
let _token =
  (typeof localStorage !== "undefined" && localStorage.getItem(TOKEN_KEY)) || null;

function setToken(t) {
  _token = t || null;
  if (typeof localStorage !== "undefined") {
    if (_token) localStorage.setItem(TOKEN_KEY, _token);
    else localStorage.removeItem(TOKEN_KEY);
  }
}
function getToken() {
  return _token;
}
function clearToken() {
  setToken(null);
}

/* =========================
 * Headers helper
 * ========================= */
function ensureHeaders(headers) {
  const result = new Headers();
  // Bearer por defecto si existe token y no fue seteado manualmente
  if (_token && !headers?.Authorization && !headers?.authorization) {
    result.set("Authorization", `Bearer ${_token}`);
  }
  if (!headers) return result;
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === "undefined" || value === null) return;
    result.set(key, value);
  });
  return result;
}

/* =========================
 * mini Axios
 * ========================= */
function createAxiosInstance(defaultConfig = {}) {
  const requestInterceptors = [];
  const responseInterceptors = [];

  const instance = {
    defaults: { ...defaultConfig },
    interceptors: {
      request: {
        use(onFulfilled, onRejected) {
          requestInterceptors.push({ onFulfilled, onRejected });
          return requestInterceptors.length - 1;
        },
      },
      response: {
        use(onFulfilled, onRejected) {
          responseInterceptors.push({ onFulfilled, onRejected });
          return responseInterceptors.length - 1;
        },
      },
    },

    async request(config = {}) {
      let requestConfig = {
        method: "get",
        headers: {},
        withCredentials: false,
        ...instance.defaults,
        ...config,
      };

      // request interceptors
      for (const { onFulfilled, onRejected } of requestInterceptors) {
        if (!onFulfilled) continue;
        try {
          requestConfig = await onFulfilled(requestConfig);
        } catch (err) {
          if (onRejected) requestConfig = await onRejected(err);
          else throw err;
        }
      }

      const { baseURL = instance.defaults.baseURL ?? "", params, data, body } =
        requestConfig;

      const url = buildURL(baseURL, requestConfig.url ?? "", params);
      const method = (requestConfig.method || "get").toUpperCase();
      const headers = ensureHeaders(requestConfig.headers);

      let payload = body ?? data;

      // si es objeto normal -> JSON; si es FormData, no tocar headers
      if (payload && typeof payload === "object" && !(payload instanceof FormData)) {
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
        if (headers.get("Content-Type")?.includes("application/json")) {
          payload = JSON.stringify(payload);
        }
      }

      const fetchOptions = {
        method,
        headers,
        body: ["GET", "HEAD"].includes(method) ? undefined : payload,
        credentials: requestConfig.withCredentials ? "include" : "omit",
      };

      const response = await fetch(url, fetchOptions);

      const contentType = response.headers.get("Content-Type") || "";
      let responseData;

      if (contentType.includes("application/json")) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else if (
        contentType.includes("application/octet-stream") ||
        contentType.includes("image/")
      ) {
        responseData = await response.blob();
      } else if (contentType.includes("text/")) {
        responseData = await response.text();
      } else {
        try {
          responseData = await response.text();
        } catch {
          responseData = null;
        }
      }

      let axiosResponse = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        config: requestConfig,
        request: null,
      };

      if (!response.ok) {
        const axiosError = new Error(
          `Request failed with status code ${response.status}`
        );
        axiosError.response = axiosResponse;
        axiosError.config = requestConfig;
        axiosError.isAxiosError = true;

        for (const { onRejected } of responseInterceptors) {
          if (!onRejected) continue;
          try {
            const maybe = await onRejected(axiosError);
            if (maybe !== undefined) return maybe;
          } catch (error) {
            throw error;
          }
        }
        throw axiosError;
      }

      // response interceptors
      for (const { onFulfilled } of responseInterceptors) {
        if (onFulfilled) {
          axiosResponse = await onFulfilled(axiosResponse);
        }
      }

      return axiosResponse;
    },

    get(url, config) {
      return instance.request({ ...config, method: "get", url });
    },
    delete(url, config) {
      return instance.request({ ...config, method: "delete", url });
    },
    post(url, data, config) {
      return instance.request({ ...config, method: "post", url, data });
    },
    put(url, data, config) {
      return instance.request({ ...config, method: "put", url, data });
    },
    patch(url, data, config) {
      return instance.request({ ...config, method: "patch", url, data });
    },
  };

  return instance;
}

/* =========================
 * Export: instancia lista
 * ========================= */
const DEFAULT_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) || "";

const api = createAxiosInstance({ baseURL: DEFAULT_BASE });

// helpers de token disponibles desde la instancia
api.setToken = setToken;
api.getToken = getToken;
api.clearToken = clearToken;

const axios = {
  create: (config) => createAxiosInstance(config),
};

export default api; // uso: import api from "../lib/miniAxios";
export { createAxiosInstance, axios, buildURL, setToken, getToken, clearToken };

// === src/lib/miniAxios.js ===
// Cliente Axios minimalista compatible con Xano + Bearer Tokens (sin cookies)

function buildURL(baseURL = "", url = "", params) {
  let target;
  if (baseURL) {
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
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((entry) => target.searchParams.append(key, entry));
        } else {
          target.searchParams.set(key, value);
        }
      });
  }

  return target.toString();
}

function ensureHeaders(headers) {
  const result = new Headers();
  if (!headers) return result;
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === "undefined") return;
    result.set(key, value);
  });
  return result;
}

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
        withCredentials: false, // 🚫 sin cookies (evita CORS con Bearer)
        ...instance.defaults,
        ...config,
      };

      // Interceptores de request
      for (const { onFulfilled, onRejected } of requestInterceptors) {
        if (!onFulfilled) continue;
        try {
          requestConfig = await onFulfilled(requestConfig);
        } catch (error) {
          if (onRejected) {
            requestConfig = await onRejected(error);
          } else {
            throw error;
          }
        }
      }

      const { baseURL = instance.defaults.baseURL ?? "", params, data, body } = requestConfig;
      const url = buildURL(baseURL, requestConfig.url ?? "", params);
      const method = (requestConfig.method || "get").toUpperCase();
      const headers = ensureHeaders(requestConfig.headers);
      let payload = body ?? data;

      // JSON automático (si no es FormData)
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
        credentials: "same-origin", // ✅ no envía cookies a cross-origin
      };

      const response = await fetch(url, fetchOptions);

      // Parse inteligente según content-type
      const contentType = response.headers.get("Content-Type") || "";
      let responseData;

      if (contentType.includes("application/json")) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else if (contentType.includes("application/octet-stream") || contentType.includes("image/")) {
        responseData = await response.blob();
      } else if (contentType.includes("text/")) {
        responseData = await response.text();
      } else {
        // fallback
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

      // Errores
      if (!response.ok) {
        const axiosError = new Error(`Request failed with status code ${response.status}`);
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

      // Interceptores de response
      for (const { onFulfilled } of responseInterceptors) {
        if (onFulfilled) {
          axiosResponse = await onFulfilled(axiosResponse);
        }
      }

      return axiosResponse;
    },

    // Helpers
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

// Export estilo Axios
const axios = {
  create: (config) => createAxiosInstance(config),
};

export default axios;
export { createAxiosInstance };

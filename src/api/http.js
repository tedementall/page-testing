import axios from "../lib/miniAxios" // 👈 usamos tu cliente personalizado

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? "THEHUB_TOKEN"

let unauthorizedSubscribers = new Set()

function getStoredToken() {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error("Error leyendo el token desde localStorage", error)
    return null
  }
}

function persistToken(token) {
  if (typeof window === "undefined") return
  try {
    if (!token) {
      window.localStorage.removeItem(TOKEN_KEY)
    } else {
      window.localStorage.setItem(TOKEN_KEY, token)
    }
  } catch (error) {
    console.error("Error guardando el token en localStorage", error)
  }
}

export function setToken(token) {
  persistToken(token)
}

export function getToken() {
  return getStoredToken()
}

export function clearToken() {
  persistToken(null)
}

export function onUnauthorized(callback) {
  if (typeof callback !== "function") return () => {}
  unauthorizedSubscribers.add(callback)
  return () => {
    unauthorizedSubscribers.delete(callback)
  }
}

// URLs base desde .env (Vite)
const authBaseURL = import.meta.env.VITE_XANO_AUTH_BASE ?? "https://x8ki-let1-twmt.n7.xano.io"
const coreBaseURL = import.meta.env.VITE_XANO_CORE_BASE ?? "https://x8ki-let1-twmt.n7.xano.io"

// --- Instancias basadas en miniAxios ---
const httpAuth = axios.create({
  baseURL: authBaseURL,
  withCredentials: false, // 🚫 no enviamos cookies (solo Bearer)
})

const httpCore = axios.create({
  baseURL: coreBaseURL,
  withCredentials: false,
})

// --- Interceptores (adaptados al sistema miniAxios) ---
function applyInterceptors(instance) {
  // Agrega token automáticamente
  instance.interceptors.request.use((config) => {
    const token = getStoredToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Manejo de errores (401 → logout)
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        clearToken()
        unauthorizedSubscribers.forEach((callback) => {
          try {
            callback(error)
          } catch (callbackError) {
            console.error("Error en callback de unauthorized", callbackError)
          }
        })
      }
      throw error
    }
  )
}

applyInterceptors(httpAuth)
applyInterceptors(httpCore)

export { httpAuth, httpCore, TOKEN_KEY }

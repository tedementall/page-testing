import axios from "../lib/miniAxios"

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

// 👇 CAMBIA ESTAS LÍNEAS - Usa las variables correctas del .env
const authBaseURL = import.meta.env.VITE_XANO_AUTH_BASE ?? "/xano-auth"
const coreBaseURL = import.meta.env.VITE_XANO_CORE_BASE ?? "/xano-core"

const httpAuth = axios.create({
  baseURL: authBaseURL,
  withCredentials: false,
})

const httpCore = axios.create({
  baseURL: coreBaseURL,
  withCredentials: false,
})

function applyInterceptors(instance) {
  // Agrega token automáticamente
  instance.interceptors.request.use((config) => {
    const token = getStoredToken()
    
    config.headers = config.headers ?? {}
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (config.data && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  })

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
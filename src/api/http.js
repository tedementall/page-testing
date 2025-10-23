import axios from "axios"

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? "THEHUB_TOKEN"

let unauthorizedSubscribers = new Set()

function getStoredToken() {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error("Error reading auth token from storage", error)
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
    console.error("Error saving auth token to storage", error)
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

const authBaseURL = import.meta.env.VITE_XANO_AUTH_BASE
const coreBaseURL = import.meta.env.VITE_XANO_CORE_BASE

const httpAuth = axios.create({
  baseURL: authBaseURL
})

const httpCore = axios.create({
  baseURL: coreBaseURL
})

function applyInterceptors(instance) {
  instance.interceptors.request.use((config) => {
    const token = getStoredToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
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
            console.error("Error in unauthorized subscriber", callbackError)
          }
        })
      }
      return Promise.reject(error)
    }
  )
}

applyInterceptors(httpAuth)
applyInterceptors(httpCore)

export { httpAuth, httpCore, TOKEN_KEY }

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import * as AuthApi from "../api/authApi"
import { getToken, onUnauthorized } from "../api/http"

const AuthContext = createContext(null)

// --- La función para extraer errores está bien ---
function extractErrorMessage(error, fallback) {
  if (!error) return fallback
  const responseData = error?.response?.data
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData
  }
  if (responseData && typeof responseData === "object") {
    if (typeof responseData.message === "string" && responseData.message.trim()) {
      return responseData.message
    }
    if (typeof responseData.error === "string" && responseData.error.trim()) {
      return responseData.error
    }
    if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      const firstError = responseData.errors[0]
      if (typeof firstError === "string") {
        return firstError
      }
      if (firstError && typeof firstError.message === "string") {
        return firstError.message
      }
    }
    if (typeof responseData.detail === "string" && responseData.detail.trim()) {
      return responseData.detail
    }
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message
  }

  return fallback
}

// --- El cálculo del estado inicial está bien ---
const initialStatus = (() => {
  try {
    return getToken() ? "checking" : "unauthenticated"
  } catch (error) {
    return "unauthenticated"
  }
})()

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  // --- INICIO DE LA REVERSIÓN ---
  // Volvemos a los valores iniciales originales
  const [user, setUser] = useState(null); // <-- Vuelve a null
  const [status, setStatus] = useState(initialStatus); // <-- Vuelve a initialStatus
  const [isLoading, setIsLoading] = useState(initialStatus === "checking"); // <-- Vuelve a esto
  // --- FIN DE LA REVERSIÓN ---

  const [authError, setAuthError] = useState(null)

  const applyLogout = useCallback(() => {
    AuthApi.logout()
    setUser(null)
    setStatus("unauthenticated")
    setIsLoading(false)
  }, [])

  // Este useEffect para manejar 401 está bien
  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setAuthError("Tu sesión expiró. Inicia sesión nuevamente.")
      applyLogout()
      navigate("/login", {
        replace: true,
        state: { from: location.pathname }
      })
    })
    return unsubscribe
  }, [applyLogout, location.pathname, navigate])

  // Este useEffect verifica el token al cargar la app
  useEffect(() => {
    let cancelled = false
    const token = getToken()

    // Corrección del bucle infinito (evita verificar en /login)
    if (location.pathname === "/login") {
      setStatus("unauthenticated")
      setIsLoading(false)
      return;
    }

    // Si no hay token, no hacemos nada
    if (!token) {
      setStatus("unauthenticated")
      setIsLoading(false)
      return () => {
        cancelled = true
      }
    }

    // Si hay token, intentamos obtener el perfil
    setIsLoading(true)
    setStatus("checking")

    AuthApi.me()
      .then((profile) => {
        if (cancelled) return
        setUser(profile)
        setStatus("authenticated")
        setAuthError(null)
      })
      .catch((error) => {
        if (cancelled) return
        const message = extractErrorMessage(error, "Tu sesión expiró. Inicia sesión nuevamente.")
        setAuthError(message)

        // Corrección: Solo redirige si el error es 401
        if (error?.response?.status === 401) {
          applyLogout()
          navigate("/login", {
            replace: true,
            state: { from: location.pathname }
          })
        } else {
          // Si es otro error (CORS, red, etc.), solo borra el token
          applyLogout()
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [applyLogout, location.pathname, navigate]) // El array de dependencias vuelve a la normalidad

  // --- El resto de las funciones (login, signup, logout) están bien ---

  const login = useCallback(
    async (credentials) => {
      setIsLoading(true)
      setStatus("checking")
      setAuthError(null)
      try {
        await AuthApi.login(credentials)
        const profile = await AuthApi.me()
        setUser(profile)
        setStatus("authenticated")
        return profile // Devolvemos el perfil para la redirección de roles
      } catch (error) {
        const message = extractErrorMessage(error, "No pudimos iniciar sesión. Verifica tus credenciales.")
        setAuthError(message)
        applyLogout()
        throw new Error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [applyLogout]
  )

  const signup = useCallback(
    async (payload) => {
      setIsLoading(true)
      setStatus("checking")
      setAuthError(null)
      try {
        await AuthApi.signup(payload)
        const profile = await AuthApi.me()
        setUser(profile)
        setStatus("authenticated")
        return profile
      } catch (error) {
        const message = extractErrorMessage(error, "No pudimos crear tu cuenta. Inténtalo nuevamente.")
        setAuthError(message)
        applyLogout()
        throw new Error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [applyLogout]
  )

  const logout = useCallback(() => {
    setAuthError(null)
    applyLogout()
    navigate("/login", { replace: true })
  }, [applyLogout, navigate])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isLoading,
      error: authError,
      login,
      signup,
      logout
    }),
    [authError, isLoading, login, logout, signup, status, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
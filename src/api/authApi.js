import { clearToken, httpAuth, setToken } from "./http"

function resolveIdentifierPayload({ identifier, email, username, password, ...rest }) {
  const payload = { ...rest }
  if (!password) {
    throw new Error("La contraseña es obligatoria")
  }
  payload.password = password

  const trimmedIdentifier = identifier?.trim()
  if (email?.trim()) {
    payload.email = email.trim()
  } else if (username?.trim()) {
    payload.username = username.trim()
  } else if (trimmedIdentifier) {
    if (trimmedIdentifier.includes("@")) {
      payload.email = trimmedIdentifier
    } else {
      payload.username = trimmedIdentifier
    }
  }

  return payload
}

function extractToken(data) {
  if (!data) return null
  if (typeof data === "string") return data
  if (data.authToken) return data.authToken
  if (data.token) return data.token
  return null
}

export async function login(credentials) {
  const payload = resolveIdentifierPayload(credentials)
  const { data } = await httpAuth.post("/auth/login", payload)
  const token = extractToken(data)
  if (token) {
    setToken(token)
  }
  return data
}

export async function signup(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Datos inválidos para el registro")
  }
  const { data } = await httpAuth.post("/auth/signup", payload)
  const token = extractToken(data)
  if (token) {
    setToken(token)
  }
  return data
}

export async function me() {
  const { data } = await httpAuth.get("/auth/me")
  return data
}

export function logout() {
  clearToken()
}

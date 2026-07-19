import { api, setToken } from './client'

/**
 * Real JWT auth against Spring Boot's AuthController:
 *   POST /api/auth/register  { username, email, password } -> AuthResponse
 *   POST /api/auth/login     { email, password }            -> AuthResponse
 * AuthResponse = { token, userId, username, email }
 *
 * Both are permitAll() in SecurityConfig, so no token is needed to call
 * them. Every other endpoint requires the returned token as a Bearer header
 * (handled centrally in client.js).
 */

export async function signup({ username, email, password }) {
  const auth = await api.post('/api/auth/register', { username, email, password })
  setToken(auth.token)
  return auth // { token, userId, username, email }
}

export async function login({ email, password }) {
  const auth = await api.post('/api/auth/login', { email, password })
  setToken(auth.token)
  return auth
}

export function clearSession() {
  setToken(null)
}

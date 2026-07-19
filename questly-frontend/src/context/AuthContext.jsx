import React, { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { getToken } from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'questly_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only restore a session if we still have a JWT — the user object alone
    // isn't proof of anything, the token is what the backend checks.
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && getToken()) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setLoading(false)
  }, [])

  function persist(auth) {
    // auth = { token, userId, username, email } — setToken() already ran
    // inside api/auth.js, we just keep the display fields for the UI.
    const u = { userId: auth.userId, username: auth.username, email: auth.email }
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }

  async function login(email, password) {
    const auth = await authApi.login({ email, password })
    persist(auth)
    return auth
  }

  async function signup(username, email, password) {
    const auth = await authApi.signup({ username, email, password })
    persist(auth)
    return auth
  }

  function logout() {
    authApi.clearSession()
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

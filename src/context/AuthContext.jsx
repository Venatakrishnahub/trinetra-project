import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('trinetra_token'))
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('trinetra_user')) } catch { return null }
  })

  const login = (token, userData) => {
    localStorage.setItem('trinetra_token', token)
    localStorage.setItem('trinetra_user',  JSON.stringify(userData))
    setToken(token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('trinetra_token')
    localStorage.removeItem('trinetra_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

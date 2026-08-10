import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [role, setRole] = useState(localStorage.getItem('currentRole') || 'PATIENT')

  const login = ({ accessToken, userRole }) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('currentRole', userRole)
    setToken(accessToken)
    setRole(userRole)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentRole')
    setToken('')
    setRole('PATIENT')
  }

  const value = useMemo(() => ({ token, role, login, logout }), [token, role])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

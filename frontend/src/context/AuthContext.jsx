import { createContext, useContext, useState, useEffect } from 'react'

// Crear el contexto de autenticación
const AuthContext = createContext()

// Proveedor de autenticación
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verificar si hay usuario en localStorage al cargar la app
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch (err) {
        console.error('Error al parsear usuario:', err)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  // Función de login
  const login = (userData) => {
    try {
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      setError(null)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Función de logout
  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    setError(null)
  }

  // Función para actualizar perfil
  const updateProfile = (updatedUser) => {
    try {
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setError(null)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

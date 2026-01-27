import { createContext, useContext, useState } from 'react'

// Crear contexto de publicaciones
const PublicacionesContext = createContext()

// Proveedor de publicaciones
export function PublicacionesProvider({ children }) {
  const [publicaciones, setPublicaciones] = useState([])
  const [filtros, setFiltros] = useState({
    tipo: '',
    criptomoneda: '',
    metodo_pago: '',
    ubicacion: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Función para obtener publicaciones (de la API)
  const fetchPublicaciones = async () => {
    setIsLoading(true)
    try {
      // TODO: Reemplazar con llamada real a la API
      // const response = await fetch('/api/publicaciones')
      // const data = await response.json()
      // setPublicaciones(data)
      
      // Por ahora usamos datos mock
      setPublicaciones([])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para crear una publicación
  const crearPublicacion = async (datosPublicacion) => {
    setIsLoading(true)
    try {
      // TODO: Hacer POST a la API
      // const response = await fetch('/api/publicaciones', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(datosPublicacion)
      // })
      // const nuevaPublicacion = await response.json()
      // setPublicaciones([...publicaciones, nuevaPublicacion])
      
      console.log('Publicación creada:', datosPublicacion)
      setError(null)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Función para obtener una publicación por ID
  const obtenerPublicacion = async (id) => {
    setIsLoading(true)
    try {
      // TODO: Hacer GET a /api/publicaciones/:id
      console.log('Obteniendo publicación:', id)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para actualizar filtros
  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros({ ...filtros, ...nuevosFiltros })
  }

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      tipo: '',
      criptomoneda: '',
      metodo_pago: '',
      ubicacion: '',
    })
  }

  const value = {
    publicaciones,
    filtros,
    isLoading,
    error,
    fetchPublicaciones,
    crearPublicacion,
    obtenerPublicacion,
    actualizarFiltros,
    limpiarFiltros,
  }

  return (
    <PublicacionesContext.Provider value={value}>
      {children}
    </PublicacionesContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function usePublicaciones() {
  const context = useContext(PublicacionesContext)
  if (!context) {
    throw new Error('usePublicaciones debe usarse dentro de PublicacionesProvider')
  }
  return context
}

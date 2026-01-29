import { createContext, useContext, useState } from 'react'
import api from '../api/client'

// Mapear fila de la API al formato que usa el frontend
function mapPublicacionFromApi(row) {
  if (!row) return null
  const imagenes = row.imagenes || []
  const imagenPrincipal = Array.isArray(imagenes) && imagenes.length > 0
    ? (imagenes.find((i) => i?.esPrincipal)?.url || imagenes[0]?.url)
    : null
  return {
    id: row.id_02,
    usuario_id: row.usuario_id_02,
    username: row.username_00 || row.username,
    tipo: row.tipo_02,
    criptomoneda: row.criptomoneda_02,
    cantidad: row.cantidad_02,
    precio_unitario: row.precio_unitario_02,
    moneda_fiat: row.moneda_fiat_02,
    metodos_pago: row.metodos_pago_02 || [],
    descripcion: row.descripcion_02,
    ubicacion: row.ubicacion_02,
    estado: row.estado_02,
    created_at: row.created_at_02,
    imagenes: imagenes,
    imagen_principal: imagenPrincipal
  }
}

// Crear contexto de publicaciones
const PublicacionesContext = createContext()

// Proveedor de publicaciones
export function PublicacionesProvider({ children }) {
  const [publicaciones, setPublicaciones] = useState([])
  const [publicacionDetalle, setPublicacionDetalle] = useState(null)
  const [filtros, setFiltros] = useState({
    tipo: '',
    criptomoneda: '',
    metodo_pago: '',
    ubicacion: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPublicaciones = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.tipo) params.set('tipo', filtros.tipo)
      if (filtros.criptomoneda) params.set('criptomoneda', filtros.criptomoneda)
      const { data } = await api.get(`/api/publicaciones?${params.toString()}`)
      const list = (data.publicaciones || []).map(mapPublicacionFromApi)
      setPublicaciones(list)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      setPublicaciones([])
    } finally {
      setIsLoading(false)
    }
  }

  const crearPublicacion = async (datosPublicacion) => {
    setIsLoading(true)
    try {
      await api.post('/api/publicaciones', {
        tipo_02: datosPublicacion.tipo,
        criptomoneda_02: datosPublicacion.criptomoneda,
        cantidad_02: parseFloat(datosPublicacion.cantidad),
        precio_unitario_02: parseFloat(datosPublicacion.precio_unitario),
        moneda_fiat_02: datosPublicacion.moneda_fiat || 'USD',
        metodos_pago_02: Array.isArray(datosPublicacion.metodos_pago) ? datosPublicacion.metodos_pago : [],
        descripcion_02: datosPublicacion.descripcion || null,
        ubicacion_02: datosPublicacion.ubicacion || null
      })
      setError(null)
      await fetchPublicaciones()
      return true
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const obtenerPublicacion = async (id) => {
    setIsLoading(true)
    try {
      const { data } = await api.get(`/api/publicaciones/${id}`)
      const pub = mapPublicacionFromApi(data.publicacion)
      setPublicacionDetalle(pub)
      setError(null)
      return pub
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      setPublicacionDetalle(null)
      return null
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
    publicacionDetalle,
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

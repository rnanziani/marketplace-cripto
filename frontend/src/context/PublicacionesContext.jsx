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
  const [misPublicaciones, setMisPublicaciones] = useState([])

  const fetchPublicaciones = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.tipo) params.set('tipo', filtros.tipo)
      if (filtros.criptomoneda) params.set('criptomoneda', filtros.criptomoneda)
      if (filtros.metodo_pago) params.set('metodo_pago', filtros.metodo_pago)
      if (filtros.ubicacion?.trim()) params.set('ubicacion', filtros.ubicacion.trim())
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

  /** Actualizar una publicación (PUT). Acepta objeto con campos en formato API (tipo_02, etc.) o frontend (tipo, etc.). Retorna { success, errorMessage } */
  const actualizarPublicacion = async (id, datos) => {
    try {
      const body = {
        tipo_02: datos.tipo_02 ?? datos.tipo,
        criptomoneda_02: datos.criptomoneda_02 ?? datos.criptomoneda,
        cantidad_02: datos.cantidad_02 ?? (datos.cantidad != null ? parseFloat(datos.cantidad) : undefined),
        precio_unitario_02: datos.precio_unitario_02 ?? (datos.precio_unitario != null ? parseFloat(datos.precio_unitario) : undefined),
        moneda_fiat_02: datos.moneda_fiat_02 ?? datos.moneda_fiat,
        metodos_pago_02: datos.metodos_pago_02 ?? datos.metodos_pago,
        descripcion_02: datos.descripcion_02 ?? datos.descripcion,
        ubicacion_02: datos.ubicacion_02 ?? datos.ubicacion,
        estado_02: datos.estado_02 ?? datos.estado
      }
      const clean = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined))
      if (Object.keys(clean).length === 0) return { success: false, errorMessage: 'Sin campos para actualizar' }
      await api.put(`/api/publicaciones/${id}`, clean)
      setError(null)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      setError(msg)
      return { success: false, errorMessage: msg }
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

  /** Obtener las publicaciones del usuario autenticado (requiere token). */
  const fetchMisPublicaciones = async (username = '') => {
    setIsLoading(true)
    try {
      const { data } = await api.get('/api/publicaciones/mis-publicaciones')
      const list = (data.publicaciones || []).map((row) =>
        mapPublicacionFromApi({ ...row, username_00: username })
      )
      setMisPublicaciones(list)
      setError(null)
      return list
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      setMisPublicaciones([])
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    publicaciones,
    publicacionDetalle,
    misPublicaciones,
    filtros,
    isLoading,
    error,
    fetchPublicaciones,
    fetchMisPublicaciones,
    crearPublicacion,
    obtenerPublicacion,
    actualizarPublicacion,
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

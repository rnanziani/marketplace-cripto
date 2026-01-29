import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePublicaciones } from '../context/PublicacionesContext'
import './DetallePublicacion.css'

function DetallePublicacion() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { publicacionDetalle, obtenerPublicacion, isLoading, error } = usePublicaciones()

  useEffect(() => {
    if (id) obtenerPublicacion(id)
  }, [id])

  const publicacion = publicacionDetalle
  const isOwner = isAuthenticated && user && publicacion && user.id === publicacion.usuario_id
  const imagenes = publicacion?.imagenes || []
  const imagenPrincipal = publicacion?.imagen_principal || (imagenes[0]?.url)

  if (isLoading && !publicacion) {
    return (
      <div className="detalle-publicacion-container">
        <p>Cargando...</p>
      </div>
    )
  }
  if (error && !publicacion) {
    return (
      <div className="detalle-publicacion-container">
        <p className="error-message">{error}</p>
        <Link to="/publicaciones">← Volver a Publicaciones</Link>
      </div>
    )
  }
  if (!publicacion) {
    return (
      <div className="detalle-publicacion-container">
        <p>Publicación no encontrada.</p>
        <Link to="/publicaciones">← Volver a Publicaciones</Link>
      </div>
    )
  }

  return (
    <div className="detalle-publicacion-container">
      <Link to="/publicaciones" className="btn-volver">
        ← Volver a Publicaciones
      </Link>

      <div className="detalle-grid">
        <div className="detalle-imagenes">
          <div className="imagen-principal">
            <img src={imagenPrincipal || 'https://via.placeholder.com/600'} alt={publicacion.criptomoneda} />
          </div>
          {imagenes.length > 1 && (
            <div className="imagenes-miniaturas">
              {imagenes.map((img, idx) => (
                <img key={img?.id || idx} src={img?.url} alt={`Imagen ${idx + 1}`} />
              ))}
            </div>
          )}
        </div>

        <div className="detalle-info">
          <div className="badge-header">
            <span className={`badge ${(publicacion.tipo || '').toLowerCase()}`}>
              {publicacion.tipo}
            </span>
            <span className={`estado ${(publicacion.estado || '').toLowerCase()}`}>
              {publicacion.estado}
            </span>
          </div>

          <h1>{publicacion.criptomoneda} - {publicacion.cantidad}</h1>
          
          <div className="precio-info">
            <p className="precio-unitario">
              {publicacion.precio_unitario} {publicacion.moneda_fiat} por unidad
            </p>
            <p className="precio-total">
              Total: {(parseFloat(publicacion.cantidad) * parseFloat(publicacion.precio_unitario)).toFixed(2)} {publicacion.moneda_fiat}
            </p>
          </div>

          <div className="detalle-section">
            <h3>Descripción</h3>
            <p>{publicacion.descripcion || 'Sin descripción'}</p>
          </div>

          <div className="detalle-section">
            <h3>Métodos de Pago</h3>
            <ul className="metodos-pago-list">
              {(publicacion.metodos_pago || []).map((metodo, index) => (
                <li key={index}>{metodo}</li>
              ))}
            </ul>
          </div>

          <div className="detalle-section">
            <h3>Ubicación</h3>
            <p>{publicacion.ubicacion || 'No especificada'}</p>
          </div>

          <div className="vendedor-info">
            <h3>Vendedor</h3>
            <div className="vendedor-details">
              <p><strong>Username:</strong> {publicacion.username}</p>
            </div>
          </div>

          {isAuthenticated && !isOwner && (
            <div className="acciones">
              <button className="btn-contactar">Contactar Vendedor</button>
              <button className="btn-transaccion">Realizar Transacción</button>
            </div>
          )}

          {isOwner && (
            <div className="acciones">
              <button className="btn-editar">Editar Publicación</button>
              <button className="btn-pausar">Pausar/Activar</button>
              <button className="btn-eliminar">Eliminar</button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="acciones">
              <Link to="/login" className="btn-login-required">
                Inicia sesión para contactar al vendedor
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetallePublicacion

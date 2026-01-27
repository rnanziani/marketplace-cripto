import { useParams, Link } from 'react-router-dom'
import './DetallePublicacion.css'

function DetallePublicacion() {
  const { id } = useParams()

  // TODO: Obtener publicación desde la API usando el id
  const publicacion = {
    id: 1,
    tipo: 'VENTA',
    criptomoneda: 'BTC',
    cantidad: '0.5',
    precio_unitario: '45000',
    moneda_fiat: 'USD',
    metodos_pago: ['Transferencia Bancaria', 'PayPal'],
    descripcion: 'Vendo Bitcoin de forma segura. Transacciones verificadas.',
    ubicacion: 'Santiago, Chile',
    estado: 'ACTIVO',
    username: 'vendedor123',
    imagenes: [
      { id: 1, url: 'https://via.placeholder.com/600', es_principal: true },
      { id: 2, url: 'https://via.placeholder.com/600', es_principal: false }
    ],
    vendedor: {
      id: 2,
      username: 'vendedor123',
      reputacion: 4.5,
      kyc_verificado: true
    }
  }

  const isAuthenticated = false // TODO: Obtener del contexto
  const isOwner = false // TODO: Verificar si el usuario es el dueño

  return (
    <div className="detalle-publicacion-container">
      <Link to="/publicaciones" className="btn-volver">
        ← Volver a Publicaciones
      </Link>

      <div className="detalle-grid">
        <div className="detalle-imagenes">
          <div className="imagen-principal">
            <img src={publicacion.imagenes[0].url} alt={publicacion.criptomoneda} />
          </div>
          {publicacion.imagenes.length > 1 && (
            <div className="imagenes-miniaturas">
              {publicacion.imagenes.map(img => (
                <img key={img.id} src={img.url} alt={`Imagen ${img.id}`} />
              ))}
            </div>
          )}
        </div>

        <div className="detalle-info">
          <div className="badge-header">
            <span className={`badge ${publicacion.tipo.toLowerCase()}`}>
              {publicacion.tipo}
            </span>
            <span className={`estado ${publicacion.estado.toLowerCase()}`}>
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
            <p>{publicacion.descripcion}</p>
          </div>

          <div className="detalle-section">
            <h3>Métodos de Pago</h3>
            <ul className="metodos-pago-list">
              {publicacion.metodos_pago.map((metodo, index) => (
                <li key={index}>{metodo}</li>
              ))}
            </ul>
          </div>

          <div className="detalle-section">
            <h3>Ubicación</h3>
            <p>{publicacion.ubicacion}</p>
          </div>

          <div className="vendedor-info">
            <h3>Vendedor</h3>
            <div className="vendedor-details">
              <p><strong>Username:</strong> {publicacion.vendedor.username}</p>
              <p><strong>Reputación:</strong> {publicacion.vendedor.reputacion} ⭐</p>
              <p><strong>KYC:</strong> {publicacion.vendedor.kyc_verificado ? '✓ Verificado' : 'Pendiente'}</p>
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

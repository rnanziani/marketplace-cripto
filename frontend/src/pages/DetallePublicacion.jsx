import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { usePublicaciones } from '../context/PublicacionesContext'
import api from '../api/client'
import { getPublicationImageUrl } from '../utils/cryptoImages'
import './DetallePublicacion.css'

function DetallePublicacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { publicacionDetalle, obtenerPublicacion, actualizarPublicacion, isLoading, error } = usePublicaciones()

  const [cantidad, setCantidad] = useState('')
  const [loadingTransaccion, setLoadingTransaccion] = useState(false)
  const [errorTransaccion, setErrorTransaccion] = useState(null)
  const [showContactar, setShowContactar] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [loadingMensajes, setLoadingMensajes] = useState(false)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviandoMensaje, setEnviandoMensaje] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState(null)
  const [loadingAccion, setLoadingAccion] = useState(false)
  const [destinatarioMensaje, setDestinatarioMensaje] = useState(null)

  useEffect(() => {
    if (id) obtenerPublicacion(id)
  }, [id])

  const publicacion = publicacionDetalle
  const isOwner = isAuthenticated && user && publicacion && Number(user.id) === Number(publicacion.usuario_id)
  const imagenes = publicacion?.imagenes || []
  const imagenPrincipal = publicacion?.imagen_principal || (imagenes[0]?.url)
  const cantidadMax = publicacion ? parseFloat(publicacion.cantidad) : 0

  const fetchMensajes = async () => {
    if (!publicacion?.id) return
    setLoadingMensajes(true)
    setErrorMensaje(null)
    try {
      const { data } = await api.get(`/api/mensajes?publicacion_id=${publicacion.id}`)
      setMensajes(data.mensajes || [])
    } catch (err) {
      setErrorMensaje(err.response?.data?.message || err.message)
      setMensajes([])
    } finally {
      setLoadingMensajes(false)
    }
  }

  useEffect(() => {
    if (showContactar && publicacion?.id) fetchMensajes()
  }, [showContactar, publicacion?.id])

  const contactosParaResponder = (mensajes || [])
    .filter((m) => Number(m.destinatario_id_05) === Number(user?.id))
    .reduce((acc, m) => {
      if (!acc.some((c) => c.id === m.remitente_id_05)) {
        acc.push({ id: m.remitente_id_05, username: m.remitente_username })
      }
      return acc
    }, [])

  const mensajesOrdenados = [...(mensajes || [])].sort(
    (a, b) => new Date(a.created_at_05) - new Date(b.created_at_05)
  )

  const handleRealizarTransaccion = async (e) => {
    e.preventDefault()
    const num = parseFloat(cantidad)
    if (!cantidad || isNaN(num) || num <= 0) {
      setErrorTransaccion('Indica una cantidad válida.')
      return
    }
    if (num > cantidadMax) {
      setErrorTransaccion(`Cantidad disponible: ${cantidadMax}`)
      return
    }
    setLoadingTransaccion(true)
    setErrorTransaccion(null)
    try {
      const { data } = await api.post('/api/transacciones', {
        publicacion_id_04: publicacion.id,
        cantidad_04: num
      })
      const transaccionId = data.transaccion?.id_04
      if (transaccionId) {
        await Swal.fire({
          icon: 'success',
          title: 'Transacción creada',
          text: 'Serás redirigido a los detalles de la transacción.',
          confirmButtonColor: '#2563eb',
          timer: 1500,
          timerProgressBar: true
        })
        navigate(`/transacciones/${transaccionId}`)
        return
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se recibió el ID de la transacción.',
        confirmButtonColor: '#dc2626'
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al crear la transacción'
      Swal.fire({
        icon: 'error',
        title: 'Error al crear transacción',
        text: msg,
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setLoadingTransaccion(false)
    }
  }

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()
    const texto = nuevoMensaje.trim()
    const destinatarioId = isOwner ? (destinatarioMensaje || contactosParaResponder[0]?.id) : publicacion?.usuario_id
    if (!texto || !destinatarioId || !publicacion?.id) return
    if (Number(destinatarioId) === Number(user?.id)) {
      Swal.fire({
        icon: 'warning',
        title: 'No puedes enviarte un mensaje',
        text: 'Esta es tu propia publicación. Los mensajes son para contactar a otros usuarios.',
        confirmButtonColor: '#2563eb'
      })
      return
    }
    if (isOwner && contactosParaResponder.length > 1 && !destinatarioMensaje) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona destinatario',
        text: 'Tienes varios contactos. Elige a quién responder.',
        confirmButtonColor: '#2563eb'
      })
      return
    }
    setEnviandoMensaje(true)
    setErrorMensaje(null)
    try {
      await api.post('/api/mensajes', {
        destinatario_id_05: destinatarioId,
        publicacion_id_05: publicacion.id,
        contenido_05: texto
      })
      setNuevoMensaje('')
      await fetchMensajes()
      Swal.fire({
        icon: 'success',
        title: 'Mensaje enviado',
        text: isOwner ? 'Tu respuesta ha sido enviada.' : 'Tu mensaje ha sido enviado al vendedor.',
        confirmButtonColor: '#2563eb',
        timer: 2000,
        timerProgressBar: true
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar',
        text: msg || 'No se pudo enviar el mensaje.',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setEnviandoMensaje(false)
    }
  }

  const handlePausarActivar = async () => {
    if (!publicacion?.id) return
    const nuevoEstado = publicacion.estado === 'ACTIVO' ? 'PAUSADO' : 'ACTIVO'
    const accion = nuevoEstado === 'PAUSADO' ? 'pausar' : 'activar'
    setLoadingAccion(true)
    const { success, errorMessage } = await actualizarPublicacion(publicacion.id, { estado_02: nuevoEstado })
    setLoadingAccion(false)
    if (success) {
      obtenerPublicacion(publicacion.id)
      Swal.fire({
        icon: 'success',
        title: nuevoEstado === 'PAUSADO' ? 'Publicación pausada' : 'Publicación activada',
        text: nuevoEstado === 'PAUSADO' ? 'Tu publicación ha sido pausada y no será visible para otros usuarios.' : 'Tu publicación está activa nuevamente.',
        confirmButtonColor: '#2563eb',
        timer: 2500,
        timerProgressBar: true
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: `Error al ${accion}`,
        text: errorMessage || 'No se pudo cambiar el estado de la publicación.',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  const handleEliminar = async () => {
    if (!publicacion?.id) return
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar publicación?',
      text: 'Esta acción no se puede deshacer. La publicación será eliminada permanentemente.',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return
    setLoadingAccion(true)
    try {
      await api.delete(`/api/publicaciones/${publicacion.id}`)
      await Swal.fire({
        icon: 'success',
        title: 'Publicación eliminada',
        text: 'Tu publicación ha sido eliminada correctamente.',
        confirmButtonColor: '#2563eb',
        timer: 2000,
        timerProgressBar: true
      })
      navigate('/publicaciones')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: msg || 'No se pudo eliminar la publicación.',
        confirmButtonColor: '#dc2626'
      })
      setLoadingAccion(false)
    }
  }

  const handleEditar = () => {
    navigate(`/publicaciones/${publicacion.id}/editar`)
  }

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
            <img
              src={imagenPrincipal || getPublicationImageUrl(publicacion)}
              alt={`${publicacion.criptomoneda} - ${publicacion.cantidad}`}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'https://via.placeholder.com/600?text=CRYPTO'
              }}
            />
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

          {isAuthenticated && !isOwner && publicacion.estado === 'ACTIVO' && (
            <div className="acciones">
              <section className="detalle-transaccion-form" aria-labelledby="titulo-realizar">
                <h3 id="titulo-realizar">Realizar Transacción</h3>
                <form onSubmit={handleRealizarTransaccion} className="form-cantidad">
                  <label htmlFor="cantidad-transaccion">
                    Cantidad ({publicacion.criptomoneda}) — disponible: {cantidadMax}
                  </label>
                  <input
                    id="cantidad-transaccion"
                    type="number"
                    min="0.00000001"
                    step="any"
                    max={cantidadMax}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 0.5"
                    disabled={loadingTransaccion}
                    aria-describedby={errorTransaccion ? 'error-transaccion' : undefined}
                  />
                  {errorTransaccion && (
                    <p id="error-transaccion" className="form-error" role="alert">
                      {errorTransaccion}
                    </p>
                  )}
                  <button type="submit" className="btn-transaccion" disabled={loadingTransaccion}>
                    {loadingTransaccion ? 'Creando...' : 'Realizar Transacción'}
                  </button>
                </form>
              </section>

              <div className="detalle-contactar">
                <button
                  type="button"
                  className="btn-contactar"
                  onClick={() => setShowContactar(!showContactar)}
                  aria-expanded={showContactar}
                  aria-controls="panel-mensajes-publicacion"
                >
                  {showContactar ? 'Ocultar mensajes' : 'Contactar Vendedor'}
                </button>
                <div
                  id="panel-mensajes-publicacion"
                  className="mensajes-panel"
                  hidden={!showContactar}
                  aria-label="Mensajes con el vendedor"
                >
                  {loadingMensajes ? (
                    <p className="mensajes-loading">Cargando mensajes...</p>
                  ) : (
                    <>
                      <ul className="mensajes-lista">
                        {mensajesOrdenados.length === 0 && <li className="mensaje-vacio">Aún no hay mensajes.</li>}
                        {mensajesOrdenados.map((m) => {
                          const esMio = m.remitente_id_05 === user.id
                          const otroNombre = esMio ? m.destinatario_username : m.remitente_username
                          return (
                            <li key={m.id_05} className={`mensaje-item ${esMio ? 'mensaje-propio' : ''}`}>
                              <span className="mensaje-autor">{esMio ? 'Tú' : otroNombre}</span>
                              <p className="mensaje-contenido">{m.contenido_05}</p>
                              <time className="mensaje-fecha" dateTime={m.created_at_05}>
                                {m.created_at_05 ? new Date(m.created_at_05).toLocaleString() : ''}
                              </time>
                            </li>
                          )
                        })}
                      </ul>
                      <form onSubmit={handleEnviarMensaje} className="form-mensaje">
                        {contactosParaResponder.length > 1 && (
                          <div className="form-group">
                            <label htmlFor="destinatario-mensaje">Responder a</label>
                            <select
                              id="destinatario-mensaje"
                              value={destinatarioMensaje || ''}
                              onChange={(e) => setDestinatarioMensaje(e.target.value ? parseInt(e.target.value) : null)}
                            >
                              <option value="">Selecciona un contacto</option>
                              {contactosParaResponder.map((c) => (
                                <option key={c.id} value={c.id}>{c.username}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <label htmlFor="nuevo-mensaje-texto">Escribe tu mensaje</label>
                        <textarea
                          id="nuevo-mensaje-texto"
                          value={nuevoMensaje}
                          onChange={(e) => setNuevoMensaje(e.target.value)}
                          placeholder="Hola, me interesa esta publicación..."
                          rows={3}
                          maxLength={1000}
                          disabled={enviandoMensaje}
                          aria-describedby={errorMensaje ? 'error-mensaje' : undefined}
                        />
                        {errorMensaje && (
                          <p id="error-mensaje" className="form-error" role="alert">{errorMensaje}</p>
                        )}
                        <button type="submit" className="btn-enviar-mensaje" disabled={enviandoMensaje || !nuevoMensaje.trim()}>
                          {enviandoMensaje ? 'Enviando...' : 'Enviar'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {isOwner && (
            <div className="acciones">
              <button
                type="button"
                className="btn-editar"
                onClick={handleEditar}
                disabled={loadingAccion}
              >
                Editar Publicación
              </button>
              <button
                type="button"
                className="btn-pausar"
                onClick={handlePausarActivar}
                disabled={loadingAccion}
              >
                {loadingAccion ? 'Procesando...' : publicacion.estado === 'ACTIVO' ? 'Pausar' : 'Activar'}
              </button>
              <button
                type="button"
                className="btn-eliminar"
                onClick={handleEliminar}
                disabled={loadingAccion}
              >
                Eliminar
              </button>

              <div className="detalle-contactar detalle-contactar-owner">
                <button
                  type="button"
                  className="btn-contactar"
                  onClick={() => setShowContactar(!showContactar)}
                  aria-expanded={showContactar}
                  aria-controls="panel-mensajes-publicacion"
                >
                  {showContactar ? 'Ocultar mensajes' : 'Ver mensajes'}
                </button>
                <div
                  id="panel-mensajes-publicacion"
                  className="mensajes-panel"
                  hidden={!showContactar}
                  aria-label="Mensajes de la publicación"
                >
                  {loadingMensajes ? (
                    <p className="mensajes-loading">Cargando mensajes...</p>
                  ) : (
                    <>
                      <ul className="mensajes-lista">
                        {mensajesOrdenados.length === 0 && <li className="mensaje-vacio">Aún no hay mensajes.</li>}
                        {mensajesOrdenados.map((m) => {
                          const esMio = m.remitente_id_05 === user.id
                          const otroNombre = esMio ? m.destinatario_username : m.remitente_username
                          return (
                            <li key={m.id_05} className={`mensaje-item ${esMio ? 'mensaje-propio' : ''}`}>
                              <span className="mensaje-autor">{esMio ? 'Tú' : otroNombre}</span>
                              <p className="mensaje-contenido">{m.contenido_05}</p>
                              <time className="mensaje-fecha" dateTime={m.created_at_05}>
                                {m.created_at_05 ? new Date(m.created_at_05).toLocaleString() : ''}
                              </time>
                            </li>
                          )
                        })}
                      </ul>
                      <form onSubmit={handleEnviarMensaje} className="form-mensaje">
                        {contactosParaResponder.length > 1 && (
                          <div className="form-group">
                            <label htmlFor="destinatario-mensaje-owner">Responder a</label>
                            <select
                              id="destinatario-mensaje-owner"
                              value={destinatarioMensaje || ''}
                              onChange={(e) => setDestinatarioMensaje(e.target.value ? parseInt(e.target.value) : null)}
                            >
                              <option value="">Selecciona un contacto</option>
                              {contactosParaResponder.map((c) => (
                                <option key={c.id} value={c.id}>{c.username}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <label htmlFor="nuevo-mensaje-texto-owner">Escribe tu mensaje</label>
                        <textarea
                          id="nuevo-mensaje-texto-owner"
                          value={nuevoMensaje}
                          onChange={(e) => setNuevoMensaje(e.target.value)}
                          placeholder="Responde al interesado..."
                          rows={3}
                          maxLength={1000}
                          disabled={enviandoMensaje}
                          aria-describedby={errorMensaje ? 'error-mensaje-owner' : undefined}
                        />
                        {errorMensaje && (
                          <p id="error-mensaje-owner" className="form-error" role="alert">{errorMensaje}</p>
                        )}
                        <button type="submit" className="btn-enviar-mensaje" disabled={enviandoMensaje || !nuevoMensaje.trim()}>
                          {enviandoMensaje ? 'Enviando...' : 'Enviar'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
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

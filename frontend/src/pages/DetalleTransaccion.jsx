import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import './DetalleTransaccion.css'

function DetalleTransaccion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [transaccion, setTransaccion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actualizando, setActualizando] = useState(false)
  const [errorAccion, setErrorAccion] = useState(null)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [hashTransaccion, setHashTransaccion] = useState('')
  const [calificacion, setCalificacion] = useState(null)
  const [enviandoCalificacion, setEnviandoCalificacion] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [loadingMensajes, setLoadingMensajes] = useState(false)
  const [showMensajes, setShowMensajes] = useState(false)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviandoMensaje, setEnviandoMensaje] = useState(false)

  useEffect(() => {
    if (!id || !isAuthenticated) return
    setLoading(true)
    setError(null)
    api
      .get(`/api/transacciones/${id}`)
      .then(({ data }) => {
        setTransaccion(data.transaccion)
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message)
        setTransaccion(null)
      })
      .finally(() => setLoading(false))
  }, [id, isAuthenticated])

  useEffect(() => {
    if (showMensajes && transaccion?.publicacion_id_04) {
      setLoadingMensajes(true)
      api
        .get(`/api/mensajes?publicacion_id=${transaccion.publicacion_id_04}`)
        .then(({ data }) => setMensajes(data.mensajes || []))
        .catch(() => setMensajes([]))
        .finally(() => setLoadingMensajes(false))
    }
  }, [showMensajes, transaccion?.publicacion_id_04])

  if (!isAuthenticated) {
    return (
      <div className="detalle-transaccion-container">
        <p>Debes iniciar sesión para ver esta transacción.</p>
        <Link to="/login">Iniciar sesión</Link>
      </div>
    )
  }

  if (loading && !transaccion) {
    return (
      <div className="detalle-transaccion-container">
        <p>Cargando transacción...</p>
      </div>
    )
  }

  if (error && !transaccion) {
    return (
      <div className="detalle-transaccion-container">
        <p className="detalle-transaccion-error" role="alert">{error}</p>
        <Link to="/perfil">← Volver al perfil</Link>
      </div>
    )
  }

  if (!transaccion) {
    return (
      <div className="detalle-transaccion-container">
        <p>Transacción no encontrada.</p>
        <Link to="/perfil">← Volver al perfil</Link>
      </div>
    )
  }

  const esComprador = user.id === transaccion.comprador_id_04
  const esVendedor = user.id === transaccion.vendedor_id_04
  const estado = transaccion.estado_04 || ''
  const puedeActualizarEstado =
    (estado === 'PENDIENTE' || estado === 'EN_ESPERA_PAGO') && (esComprador || esVendedor)
  const puedeCalificar =
    estado === 'COMPLETADA' &&
    ((esComprador && transaccion.calificacion_vendedor_04 == null) ||
      (esVendedor && transaccion.calificacion_comprador_04 == null))
  const otroUsuario = esComprador ? transaccion.vendedor_username : transaccion.comprador_username
  const destinatarioId = esComprador ? transaccion.vendedor_id_04 : transaccion.comprador_id_04

  const handleActualizarEstado = async (e) => {
    e.preventDefault()
    if (!nuevoEstado) return
    setActualizando(true)
    setErrorAccion(null)
    const body = { estado_04: nuevoEstado }
    if (nuevoEstado === 'COMPLETADA' && hashTransaccion.trim()) {
      body.hash_transaccion_04 = hashTransaccion.trim()
    }
    try {
      await api.put(`/api/transacciones/${id}/estado`, body)
      const { data } = await api.get(`/api/transacciones/${id}`)
      setTransaccion(data.transaccion)
      setNuevoEstado('')
      setHashTransaccion('')
    } catch (err) {
      setErrorAccion(err.response?.data?.message || err.message)
    } finally {
      setActualizando(false)
    }
  }

  const handleCalificar = async (e) => {
    e.preventDefault()
    if (calificacion == null || calificacion < 1 || calificacion > 5) return
    setEnviandoCalificacion(true)
    setErrorAccion(null)
    const body = esComprador
      ? { calificacion_vendedor_04: calificacion }
      : { calificacion_comprador_04: calificacion }
    try {
      await api.post(`/api/transacciones/${id}/calificar`, body)
      const { data } = await api.get(`/api/transacciones/${id}`)
      setTransaccion(data.transaccion)
      setCalificacion(null)
    } catch (err) {
      setErrorAccion(err.response?.data?.message || err.message)
    } finally {
      setEnviandoCalificacion(false)
    }
  }

  const recargarMensajes = async () => {
    if (!transaccion?.publicacion_id_04) return
    const { data } = await api.get(`/api/mensajes?publicacion_id=${transaccion.publicacion_id_04}`)
    setMensajes(data.mensajes || [])
  }

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()
    const texto = nuevoMensaje.trim()
    if (!texto || !destinatarioId || !transaccion.publicacion_id_04) return
    setEnviandoMensaje(true)
    try {
      await api.post('/api/mensajes', {
        destinatario_id_05: destinatarioId,
        publicacion_id_05: transaccion.publicacion_id_04,
        contenido_05: texto
      })
      setNuevoMensaje('')
      await recargarMensajes()
    } finally {
      setEnviandoMensaje(false)
    }
  }

  return (
    <div className="detalle-transaccion-container">
      <Link to="/perfil" className="detalle-transaccion-volver">
        ← Volver al perfil
      </Link>

      <header className="detalle-transaccion-header">
        <h1>Transacción #{transaccion.id_04}</h1>
        <span className={`detalle-transaccion-estado estado-${estado.toLowerCase().replace('_', '-')}`}>
          {estado.replace('_', ' ')}
        </span>
      </header>

      <section className="detalle-transaccion-section" aria-labelledby="titulo-resumen">
        <h2 id="titulo-resumen">Resumen</h2>
        <dl className="detalle-transaccion-dl">
          <dt>Criptomoneda</dt>
          <dd>{transaccion.criptomoneda_02}</dd>
          <dt>Cantidad</dt>
          <dd>{transaccion.cantidad_04}</dd>
          <dt>Precio unitario</dt>
          <dd>
            {transaccion.precio_unitario_02} {transaccion.moneda_fiat_02}
          </dd>
          <dt>Total</dt>
          <dd className="detalle-transaccion-total">
            {transaccion.precio_total_04} {transaccion.moneda_fiat_02}
          </dd>
          <dt>Comprador</dt>
          <dd>{transaccion.comprador_username}</dd>
          <dt>Vendedor</dt>
          <dd>{transaccion.vendedor_username}</dd>
        </dl>
      </section>

      {puedeActualizarEstado && (
        <section className="detalle-transaccion-section detalle-transaccion-acciones" aria-labelledby="titulo-estado">
          <h2 id="titulo-estado">Actualizar estado</h2>
          <form onSubmit={handleActualizarEstado} className="form-estado">
            <label htmlFor="nuevo-estado">Nuevo estado</label>
            <select
              id="nuevo-estado"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              disabled={actualizando}
            >
              <option value="">Seleccionar...</option>
              {estado === 'PENDIENTE' && (
                <>
                  <option value="EN_ESPERA_PAGO">En espera de pago</option>
                  <option value="CANCELADA">Cancelar</option>
                </>
              )}
              {estado === 'EN_ESPERA_PAGO' && (
                <>
                  <option value="COMPLETADA">Completada</option>
                  <option value="CANCELADA">Cancelar</option>
                </>
              )}
            </select>
            {nuevoEstado === 'COMPLETADA' && (
              <>
                <label htmlFor="hash-transaccion">Hash de transacción (opcional)</label>
                <input
                  id="hash-transaccion"
                  type="text"
                  value={hashTransaccion}
                  onChange={(e) => setHashTransaccion(e.target.value)}
                  placeholder="Hash en blockchain"
                  disabled={actualizando}
                />
              </>
            )}
            {errorAccion && (
              <p className="form-error" role="alert">
                {errorAccion}
              </p>
            )}
            <button type="submit" className="btn-actualizar" disabled={actualizando || !nuevoEstado}>
              {actualizando ? 'Actualizando...' : 'Actualizar'}
            </button>
          </form>
        </section>
      )}

      {puedeCalificar && (
        <section className="detalle-transaccion-section" aria-labelledby="titulo-calificar">
          <h2 id="titulo-calificar">
            Calificar a {esComprador ? transaccion.vendedor_username : transaccion.comprador_username}
          </h2>
          <form onSubmit={handleCalificar} className="form-calificar">
            <label htmlFor="calificacion">Calificación (1-5)</label>
            <select
              id="calificacion"
              value={calificacion ?? ''}
              onChange={(e) => setCalificacion(e.target.value ? parseInt(e.target.value, 10) : null)}
              disabled={enviandoCalificacion}
            >
              <option value="">Seleccionar...</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'estrella' : 'estrellas'}
                </option>
              ))}
            </select>
            {errorAccion && (
              <p className="form-error" role="alert">
                {errorAccion}
              </p>
            )}
            <button type="submit" className="btn-calificar" disabled={enviandoCalificacion || calificacion == null}>
              {enviandoCalificacion ? 'Enviando...' : 'Enviar calificación'}
            </button>
          </form>
        </section>
      )}

      {estado === 'COMPLETADA' && transaccion.calificacion_comprador_04 != null && transaccion.calificacion_vendedor_04 != null && (
        <p className="detalle-transaccion-calificaciones">
          Calificación comprador: {transaccion.calificacion_comprador_04} · Calificación vendedor:{' '}
          {transaccion.calificacion_vendedor_04}
        </p>
      )}

      <section className="detalle-transaccion-section detalle-transaccion-mensajes">
        <button
          type="button"
          className="btn-toggle-mensajes"
          onClick={() => setShowMensajes(!showMensajes)}
          aria-expanded={showMensajes}
          aria-controls="panel-mensajes-transaccion"
        >
          {showMensajes ? 'Ocultar mensajes' : `Mensajes con ${otroUsuario}`}
        </button>
        <div
          id="panel-mensajes-transaccion"
          className="mensajes-panel"
          hidden={!showMensajes}
          aria-label="Mensajes de la transacción"
        >
          {loadingMensajes ? (
            <p className="mensajes-loading">Cargando mensajes...</p>
          ) : (
            <>
              <ul className="mensajes-lista">
                {mensajes.length === 0 && <li className="mensaje-vacio">Aún no hay mensajes.</li>}
                {[...mensajes]
                  .sort((a, b) => new Date(a.created_at_05) - new Date(b.created_at_05))
                  .map((m) => {
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
                <label htmlFor="nuevo-mensaje-transaccion">Escribe tu mensaje</label>
                <textarea
                  id="nuevo-mensaje-transaccion"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  rows={3}
                  maxLength={1000}
                  disabled={enviandoMensaje}
                />
                <button
                  type="submit"
                  className="btn-enviar-mensaje"
                  disabled={enviandoMensaje || !nuevoMensaje.trim()}
                >
                  {enviandoMensaje ? 'Enviando...' : 'Enviar'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <p className="detalle-transaccion-link-publicacion">
        <Link to={`/publicaciones/${transaccion.publicacion_id_04}`}>Ver publicación original</Link>
      </p>
    </div>
  )
}

export default DetalleTransaccion

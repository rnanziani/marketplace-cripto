import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePublicaciones } from '../context/PublicacionesContext'
import api from '../api/client'
import { getPublicationImageUrl } from '../utils/cryptoImages'
import './Perfil.css'

const TABS = {
  publicaciones: 'publicaciones',
  transacciones: 'transacciones',
  mensajes: 'mensajes'
}

function Perfil() {
  const { user } = useAuth()
  const { misPublicaciones, fetchMisPublicaciones, isLoading: loadingPublicaciones } = usePublicaciones()

  const [tabActivo, setTabActivo] = useState(TABS.publicaciones)
  const [transacciones, setTransacciones] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [loadingTransacciones, setLoadingTransacciones] = useState(false)
  const [loadingMensajes, setLoadingMensajes] = useState(false)
  const [errorTab, setErrorTab] = useState(null)

  if (!user) {
    return <div>Cargando...</div>
  }

  const usuario = {
    id: user.id,
    username: user.username,
    email: user.email,
    telefono: user.telefono || 'No especificado',
    pais: user.pais || 'No especificado',
    kyc_verificado: user.kyc_verificado || false,
    created_at: new Date().toLocaleDateString()
  }

  const fetchTransacciones = async () => {
    setLoadingTransacciones(true)
    setErrorTab(null)
    try {
      const { data } = await api.get('/api/transacciones')
      setTransacciones(data.transacciones || [])
    } catch (err) {
      setErrorTab(err.response?.data?.message || err.message)
      setTransacciones([])
    } finally {
      setLoadingTransacciones(false)
    }
  }

  const fetchMensajes = async () => {
    setLoadingMensajes(true)
    setErrorTab(null)
    try {
      const { data } = await api.get('/api/mensajes')
      setMensajes(data.mensajes || [])
    } catch (err) {
      setErrorTab(err.response?.data?.message || err.message)
      setMensajes([])
    } finally {
      setLoadingMensajes(false)
    }
  }

  useEffect(() => {
    if (tabActivo === TABS.publicaciones) {
      fetchMisPublicaciones(user.username)
    } else if (tabActivo === TABS.transacciones) {
      fetchTransacciones()
    } else if (tabActivo === TABS.mensajes) {
      fetchMensajes()
    }
  }, [tabActivo])

  const handleTabClick = (tab) => {
    setTabActivo(tab)
  }

  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300?text=CRYPTO'

  const renderMisPublicaciones = () => {
    if (loadingPublicaciones) return <p className="perfil-tab-loading">Cargando tus publicaciones...</p>
    if (misPublicaciones.length === 0) {
      return (
        <div className="perfil-tab-empty">
          <p>No tienes publicaciones aún.</p>
          <Link to="/publicaciones/crear" className="perfil-tab-link">Crear publicación</Link>
        </div>
      )
    }
    return (
      <div className="perfil-publicaciones-grid">
        {misPublicaciones.map((pub) => (
          <Link
            key={pub.id}
            to={`/publicaciones/${pub.id}`}
            className="perfil-publicacion-card"
          >
            <div className="perfil-publicacion-imagen">
              <img
                src={getPublicationImageUrl(pub)}
                alt={`${pub.criptomoneda} - ${pub.cantidad}`}
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE }}
              />
              <span className={`perfil-badge ${(pub.estado || '').toLowerCase()}`}>{pub.estado || pub.tipo}</span>
            </div>
            <div className="perfil-publicacion-info">
              <h3>{pub.criptomoneda} – {pub.cantidad}</h3>
              <p className="perfil-precio">{pub.precio_unitario} {pub.moneda_fiat}</p>
              <p className="perfil-metodos">{Array.isArray(pub.metodos_pago) ? pub.metodos_pago.join(', ') : '—'}</p>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  const renderTransacciones = () => {
    if (loadingTransacciones) return <p className="perfil-tab-loading">Cargando transacciones...</p>
    if (errorTab) return <p className="perfil-tab-error" role="alert">{errorTab}</p>
    if (transacciones.length === 0) {
      return <p className="perfil-tab-empty">No tienes transacciones aún.</p>
    }
    return (
      <ul className="perfil-list" aria-label="Lista de transacciones">
        {transacciones.map((t) => (
          <li key={t.id_04} className="perfil-list-item perfil-transaccion">
            <Link to={`/transacciones/${t.id_04}`} className="perfil-transaccion-link">
              <div className="perfil-transaccion-main">
                <span className="perfil-transaccion-cripto">{t.criptomoneda_02}</span>
                <span className="perfil-transaccion-cantidad">{t.cantidad_04}</span>
                <span className="perfil-transaccion-precio">{t.precio_total_04} (total)</span>
                <span className={`perfil-transaccion-estado estado-${(t.estado_04 || '').toLowerCase()}`}>
                  {t.estado_04}
                </span>
              </div>
              <p className="perfil-transaccion-detail">
                {user.id === t.comprador_id_04 ? 'Compra a' : 'Venta a'}{' '}
                {user.id === t.comprador_id_04 ? t.vendedor_username : t.comprador_username}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  const renderMensajes = () => {
    if (loadingMensajes) return <p className="perfil-tab-loading">Cargando mensajes...</p>
    if (errorTab) return <p className="perfil-tab-error" role="alert">{errorTab}</p>
    if (mensajes.length === 0) {
      return <p className="perfil-tab-empty">No tienes mensajes aún.</p>
    }
    return (
      <ul className="perfil-list" aria-label="Lista de mensajes">
        {mensajes.map((m) => {
          const esRemitente = m.remitente_id_05 === user.id
          const otroUsuario = esRemitente ? m.destinatario_username : m.remitente_username
          return (
            <li key={m.id_05} className="perfil-list-item perfil-mensaje">
              <p className="perfil-mensaje-meta">
                {esRemitente ? 'Enviado a' : 'Recibido de'} <strong>{otroUsuario}</strong>
                {m.publicacion_id_05 && (
                  <Link to={`/publicaciones/${m.publicacion_id_05}`} className="perfil-mensaje-link">
                    · Ver publicación
                  </Link>
                )}
              </p>
              <p className="perfil-mensaje-contenido">{m.contenido_05}</p>
              <time className="perfil-mensaje-fecha" dateTime={m.created_at_05}>
                {m.created_at_05 ? new Date(m.created_at_05).toLocaleString() : ''}
              </time>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <button type="button" className="btn-edit">Editar Perfil</button>
      </div>

      <div className="perfil-content">
        <section className="perfil-section">
          <h2>Información Personal</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Username</label>
              <p>{usuario.username}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{usuario.email}</p>
            </div>
            <div className="info-item">
              <label>Teléfono</label>
              <p>{usuario.telefono}</p>
            </div>
            <div className="info-item">
              <label>País</label>
              <p>{usuario.pais}</p>
            </div>
            <div className="info-item">
              <label>Estado KYC</label>
              <p className={usuario.kyc_verificado ? 'verified' : 'pending'}>
                {usuario.kyc_verificado ? '✓ Verificado' : 'Pendiente'}
              </p>
            </div>
            <div className="info-item">
              <label>Miembro desde</label>
              <p>{usuario.created_at}</p>
            </div>
          </div>
        </section>

        <section className="perfil-section">
          <h2>Wallet</h2>
          <div className="wallet-info">
            <div className="info-item">
              <label>Dirección</label>
              <p className="wallet-address">0x1234567890abcdef...</p>
            </div>
            <div className="info-item">
              <label>Saldo Disponible</label>
              <p className="wallet-balance">0.00000000 BTC</p>
            </div>
          </div>
        </section>

        <section className="perfil-section">
          <h2>Estadísticas</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>5</h3>
              <p>Publicaciones Activas</p>
            </div>
            <div className="stat-card">
              <h3>12</h3>
              <p>Transacciones Completadas</p>
            </div>
            <div className="stat-card">
              <h3>4.8</h3>
              <p>Calificación Promedio</p>
            </div>
          </div>
        </section>

        <section className="perfil-actions" role="tablist" aria-label="Secciones del perfil">
          <button
            type="button"
            role="tab"
            aria-selected={tabActivo === TABS.publicaciones}
            aria-controls="panel-publicaciones"
            id="tab-publicaciones"
            className={`btn-action ${tabActivo === TABS.publicaciones ? 'btn-action-active' : ''}`}
            onClick={() => handleTabClick(TABS.publicaciones)}
          >
            Mis Publicaciones
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tabActivo === TABS.transacciones}
            aria-controls="panel-transacciones"
            id="tab-transacciones"
            className={`btn-action ${tabActivo === TABS.transacciones ? 'btn-action-active' : ''}`}
            onClick={() => handleTabClick(TABS.transacciones)}
          >
            Mis Transacciones
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tabActivo === TABS.mensajes}
            aria-controls="panel-mensajes"
            id="tab-mensajes"
            className={`btn-action ${tabActivo === TABS.mensajes ? 'btn-action-active' : ''}`}
            onClick={() => handleTabClick(TABS.mensajes)}
          >
            Mensajes
          </button>
        </section>

        <div
          id="panel-publicaciones"
          role="tabpanel"
          aria-labelledby="tab-publicaciones"
          hidden={tabActivo !== TABS.publicaciones}
          className="perfil-tab-panel"
        >
          <h3 className="perfil-tab-title">Mis Publicaciones</h3>
          {renderMisPublicaciones()}
        </div>
        <div
          id="panel-transacciones"
          role="tabpanel"
          aria-labelledby="tab-transacciones"
          hidden={tabActivo !== TABS.transacciones}
          className="perfil-tab-panel"
        >
          <h3 className="perfil-tab-title">Mis Transacciones</h3>
          {renderTransacciones()}
        </div>
        <div
          id="panel-mensajes"
          role="tabpanel"
          aria-labelledby="tab-mensajes"
          hidden={tabActivo !== TABS.mensajes}
          className="perfil-tab-panel"
        >
          <h3 className="perfil-tab-title">Mensajes</h3>
          {renderMensajes()}
        </div>
      </div>
    </div>
  )
}

export default Perfil

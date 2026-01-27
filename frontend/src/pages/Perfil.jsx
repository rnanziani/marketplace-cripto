import { useAuth } from '../context/AuthContext'
import './Perfil.css'

function Perfil() {
  const { user } = useAuth()

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

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <button className="btn-edit">Editar Perfil</button>
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

        <section className="perfil-actions">
          <button className="btn-action">Mis Publicaciones</button>
          <button className="btn-action">Mis Transacciones</button>
          <button className="btn-action">Mensajes</button>
        </section>
      </div>
    </div>
  )
}

export default Perfil

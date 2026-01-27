import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Marketplace de Criptomonedas</h1>
        <p>Compra y vende criptomonedas de forma segura y directa</p>
        <div className="hero-actions">
          <Link to="/publicaciones" className="btn-primary-large">
            Ver Publicaciones
          </Link>
          <Link to="/registro" className="btn-secondary-large">
            Crear Cuenta
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>Características</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Seguro</h3>
            <p>Transacciones verificadas y protegidas</p>
          </div>
          <div className="feature-card">
            <h3>Rápido</h3>
            <p>Compras y ventas instantáneas</p>
          </div>
          <div className="feature-card">
            <h3>Confiable</h3>
            <p>Sistema de calificaciones y verificación KYC</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Marketplace Cripto</h1>
        </Link>
        
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">Hola, {user?.username}</span>
              <Link to="/publicaciones/crear" className="nav-link">
                Crear Publicación
              </Link>
              <Link to="/perfil" className="nav-link">
                Mi Perfil
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn-primary">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header

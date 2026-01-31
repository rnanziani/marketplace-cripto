import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import './Login.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    // Validación básica
    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? 'Email requerido' : '',
        password: !formData.password ? 'Contraseña requerida' : ''
      })
      return
    }

    setIsLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', {
        email_00: formData.email,
        password_hash_00: formData.password
      })
      const userData = {
        id: data.usuario.id,
        email: data.usuario.email,
        username: data.usuario.username,
        telefono: data.usuario.telefono,
        pais: data.usuario.pais,
        kycVerificado: data.usuario.kycVerificado,
        createdAt: data.usuario.createdAt,
        token: data.token
      }
      if (login(userData, data.token)) {
        navigate('/perfil')
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || error.message
      setErrors({ submit: msg })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar Sesión</h1>
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email o Username</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              aria-required="true"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              aria-required="true"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" name="remember" />
              Recordarme
            </label>
            <Link to="/olvidar-contrasena" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="register-link">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

export default Login

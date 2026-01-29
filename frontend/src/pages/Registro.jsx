import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import './Registro.css'

function Registro() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    pais: '',
    aceptaTerminos: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validaciones
    if (!formData.email) newErrors.email = 'Email requerido'
    if (!formData.username) newErrors.username = 'Username requerido'
    if (!formData.password) newErrors.password = 'Contraseña requerida'
    if (formData.password.length < 8) newErrors.password = 'Mínimo 8 caracteres'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debes aceptar los términos'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const { data } = await api.post('/api/auth/registro', {
        email_00: formData.email,
        username_00: formData.username,
        password_hash_00: formData.password,
        telefono_00: formData.telefono || null,
        pais_00: formData.pais || null
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
    <div className="registro-container">
      <div className="registro-card">
        <h1>Crear Cuenta</h1>
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <form onSubmit={handleSubmit} className="registro-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
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
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              aria-required="true"
              className={errors.username ? 'input-error' : ''}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              aria-required="true"
              className={errors.password ? 'input-error' : ''}
            />
            <small>Mínimo 8 caracteres</small>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              aria-required="true"
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pais">País</label>
            <select
              id="pais"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
            >
              <option value="">Selecciona un país</option>
              <option value="Chile">Chile</option>
              <option value="Argentina">Argentina</option>
              <option value="México">México</option>
              <option value="Colombia">Colombia</option>
              <option value="España">España</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleChange}
                required
              />
              Acepto los términos y condiciones *
            </label>
            {errors.aceptaTerminos && <span className="error-text">{errors.aceptaTerminos}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="login-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default Registro

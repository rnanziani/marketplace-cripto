import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/client'
import './Login.css'

function RestablecerContrasena() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tokenFromUrl = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!tokenFromUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'Enlace inválido',
        text: 'Falta el token de recuperación. Solicita un nuevo enlace.',
        confirmButtonColor: '#2563eb'
      })
    }
  }, [tokenFromUrl])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!tokenFromUrl) {
      Swal.fire({
        icon: 'error',
        title: 'Token requerido',
        text: 'El enlace de recuperación no es válido. Solicita uno nuevo.',
        confirmButtonColor: '#dc2626'
      })
      return
    }

    if (!formData.password || formData.password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña inválida',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Las contraseñas no coinciden',
        text: 'Verifica que ambas contraseñas sean iguales.',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    setIsLoading(true)
    try {
      await api.post('/api/auth/reset-password', {
        token: tokenFromUrl,
        password_hash_00: formData.password
      })
      await Swal.fire({
        icon: 'success',
        title: 'Contraseña restablecida',
        text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
        confirmButtonColor: '#2563eb',
        timer: 2500,
        timerProgressBar: true
      })
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      Swal.fire({
        icon: 'error',
        title: 'Error al restablecer',
        text: msg || 'No se pudo restablecer la contraseña. El enlace pudo haber expirado.',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!tokenFromUrl) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Restablecer contraseña</h1>
          <p className="error-message">El enlace de recuperación no es válido o ha expirado.</p>
          <p className="register-link">
            <Link to="/olvidar-contrasena">Solicitar nuevo enlace</Link>
          </p>
          <p className="register-link">
            <Link to="/login">← Volver a Iniciar sesión</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Nueva contraseña</h1>
        <p className="forgot-password-text">
          Ingresa tu nueva contraseña (mínimo 6 caracteres).
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Nueva contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
              aria-required="true"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              minLength={6}
              required
              aria-required="true"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>

        <p className="register-link">
          <Link to="/login">← Volver a Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default RestablecerContrasena

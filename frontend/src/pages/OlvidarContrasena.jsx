import { useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/client'
import './Login.css'

function OlvidarContrasena() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [resetLink, setResetLink] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailTrim = email.trim()
    if (!emailTrim) {
      Swal.fire({
        icon: 'warning',
        title: 'Email requerido',
        text: 'Indica el email de tu cuenta.',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    setIsLoading(true)
    try {
      const { data } = await api.post('/api/auth/forgot-password', {
        email_00: emailTrim,
        frontend_base_url: window.location.origin
      })
      setEnviado(true)
      if (data.resetLink) {
        setResetLink(data.resetLink)
      }
      Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: data.message,
        confirmButtonColor: '#2563eb'
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      Swal.fire({
        icon: 'error',
        title: err.response?.status === 404 ? 'Email no encontrado' : 'Error',
        text: msg || 'No se pudo procesar la solicitud.',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>¿Olvidaste tu contraseña?</h1>
        <p className="forgot-password-text">
          Ingresa el email de tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email de tu cuenta</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                aria-required="true"
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        ) : (
          <div className="forgot-password-success">
            <p>Revisa tu correo electrónico.</p>
            {resetLink && (
              <div className="reset-link-dev">
                <p><strong>Modo desarrollo:</strong> Copia este enlace para restablecer tu contraseña:</p>
                <a href={resetLink} className="reset-link-url">{resetLink}</a>
              </div>
            )}
          </div>
        )}

        <p className="register-link">
          <Link to="/login">← Volver a Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default OlvidarContrasena

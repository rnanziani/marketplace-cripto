import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { usePublicaciones } from '../context/PublicacionesContext'
import './CrearPublicacion.css'

const metodosPagoDisponibles = [
  'Transferencia Bancaria',
  'PayPal',
  'Efectivo',
  'Zelle',
  'Wise',
  'Otro'
]

function EditarPublicacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { publicacionDetalle, obtenerPublicacion, actualizarPublicacion, isLoading } = usePublicaciones()

  const [formData, setFormData] = useState({
    tipo: 'VENTA',
    criptomoneda: '',
    cantidad: '',
    precio_unitario: '',
    moneda_fiat: 'USD',
    metodos_pago: [],
    descripcion: '',
    ubicacion: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) obtenerPublicacion(id)
  }, [id])

  useEffect(() => {
    if (publicacionDetalle) {
      setFormData({
        tipo: publicacionDetalle.tipo || 'VENTA',
        criptomoneda: publicacionDetalle.criptomoneda || '',
        cantidad: String(publicacionDetalle.cantidad ?? ''),
        precio_unitario: String(publicacionDetalle.precio_unitario ?? ''),
        moneda_fiat: publicacionDetalle.moneda_fiat || 'USD',
        metodos_pago: Array.isArray(publicacionDetalle.metodos_pago) ? publicacionDetalle.metodos_pago : [],
        descripcion: publicacionDetalle.descripcion || '',
        ubicacion: publicacionDetalle.ubicacion || ''
      })
    }
  }, [publicacionDetalle])

  const isOwner = isAuthenticated && user && publicacionDetalle && user.id === publicacionDetalle.usuario_id

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox'
      ? (e.target.checked
          ? [...formData.metodos_pago, e.target.value]
          : formData.metodos_pago.filter(m => m !== e.target.value))
      : e.target.value

    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.criptomoneda) newErrors.criptomoneda = 'Criptomoneda requerida'
    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      newErrors.cantidad = 'Cantidad válida requerida'
    }
    if (!formData.precio_unitario || parseFloat(formData.precio_unitario) <= 0) {
      newErrors.precio_unitario = 'Precio válido requerido'
    }
    if (formData.metodos_pago.length === 0) {
      newErrors.metodos_pago = 'Selecciona al menos un método de pago'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    const { success, errorMessage } = await actualizarPublicacion(id, {
      tipo: formData.tipo,
      criptomoneda: formData.criptomoneda,
      cantidad: formData.cantidad,
      precio_unitario: formData.precio_unitario,
      moneda_fiat: formData.moneda_fiat,
      metodos_pago: formData.metodos_pago,
      descripcion: formData.descripcion,
      ubicacion: formData.ubicacion
    })
    setIsSubmitting(false)
    if (success) {
      await Swal.fire({
        icon: 'success',
        title: 'Cambios guardados',
        text: 'Tu publicación ha sido actualizada correctamente.',
        confirmButtonColor: '#2563eb',
        timer: 2000,
        timerProgressBar: true
      })
      navigate(`/publicaciones/${id}`)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: errorMessage || 'No se pudieron guardar los cambios.',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  const handleCancel = () => {
    navigate(`/publicaciones/${id}`)
  }

  if (isLoading && !publicacionDetalle) {
    return (
      <div className="crear-publicacion-container">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!publicacionDetalle) {
    return (
      <div className="crear-publicacion-container">
        <p>Publicación no encontrada.</p>
        <button type="button" onClick={() => navigate('/publicaciones')}>Volver a Publicaciones</button>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="crear-publicacion-container">
        <p>No tienes permiso para editar esta publicación.</p>
        <button type="button" onClick={() => navigate(`/publicaciones/${id}`)}>Volver al detalle</button>
      </div>
    )
  }

  return (
    <div className="crear-publicacion-container">
      <div className="crear-publicacion-card">
        <h1>Editar Publicación</h1>

        <form onSubmit={handleSubmit} className="crear-publicacion-form">
          <div className="form-group">
            <label htmlFor="tipo">Tipo de Operación *</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="VENTA">Venta</option>
              <option value="COMPRA">Compra</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="criptomoneda">Criptomoneda *</label>
            <select
              id="criptomoneda"
              name="criptomoneda"
              value={formData.criptomoneda}
              onChange={handleChange}
              required
              className={errors.criptomoneda ? 'input-error' : ''}
            >
              <option value="">Selecciona una criptomoneda</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="BNB">Binance Coin (BNB)</option>
              <option value="ADA">Cardano (ADA)</option>
              <option value="XRP">Ripple (XRP)</option>
              <option value="XLM">Stellar (XLM)</option>
              <option value="XDC">XinFin (XDC)</option>
              <option value="HBAR">Hedera Hashgraph (HBAR)</option>
              <option value="IOTA">IOTA (IOTA)</option>
              <option value="ALGO">Algorand (ALGO)</option>
              <option value="ZBCN">Zebec (ZBCN)</option>
            </select>
            {errors.criptomoneda && <span className="error-text">{errors.criptomoneda}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cantidad">Cantidad *</label>
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                step="0.00000001"
                min="0"
                required
                className={errors.cantidad ? 'input-error' : ''}
              />
              {errors.cantidad && <span className="error-text">{errors.cantidad}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="precio_unitario">Precio Unitario *</label>
              <input
                type="number"
                id="precio_unitario"
                name="precio_unitario"
                value={formData.precio_unitario}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className={errors.precio_unitario ? 'input-error' : ''}
              />
              {errors.precio_unitario && <span className="error-text">{errors.precio_unitario}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="moneda_fiat">Moneda Fiat *</label>
            <select
              id="moneda_fiat"
              name="moneda_fiat"
              value={formData.moneda_fiat}
              onChange={handleChange}
              required
            >
              <option value="USD">USD - Dólar Estadounidense</option>
              <option value="EUR">EUR - Euro</option>
              <option value="CLP">CLP - Peso Chileno</option>
              <option value="ARS">ARS - Peso Argentino</option>
              <option value="MXN">MXN - Peso Mexicano</option>
            </select>
          </div>

          <div className="form-group">
            <label>Métodos de Pago *</label>
            <div className="checkbox-group-grid">
              {metodosPagoDisponibles.map(metodo => (
                <label key={metodo} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={metodo}
                    checked={formData.metodos_pago.includes(metodo)}
                    onChange={handleChange}
                    name="metodos_pago"
                  />
                  {metodo}
                </label>
              ))}
            </div>
            {errors.metodos_pago && <span className="error-text">{errors.metodos_pago}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="5"
              placeholder="Describe tu publicación..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="ubicacion">Ubicación</label>
            <input
              type="text"
              id="ubicacion"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              placeholder="Ej: Santiago, Chile"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarPublicacion

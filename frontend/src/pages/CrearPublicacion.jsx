import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePublicaciones } from '../context/PublicacionesContext'
import './CrearPublicacion.css'

function CrearPublicacion() {
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
  const [isLoading, setIsLoading] = useState(false)
  const { crearPublicacion } = usePublicaciones()
  const navigate = useNavigate()

  const metodosPagoDisponibles = [
    'Transferencia Bancaria',
    'PayPal',
    'Efectivo',
    'Zelle',
    'Wise',
    'Otro'
  ]

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

    // Validaciones
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

    setIsLoading(true)
    try {
      const success = await crearPublicacion(formData)
      if (success) {
        navigate('/publicaciones')
      }
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/publicaciones')
  }

  return (
    <div className="crear-publicacion-container">
      <div className="crear-publicacion-card">
        <h1>Crear Publicación</h1>
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
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

          <div className="form-group">
            <label>Imágenes *</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="file-input"
            />
            <small>Mínimo 1 imagen, máximo 5. Marca una como principal.</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Publicando...' : 'Publicar'}
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

export default CrearPublicacion

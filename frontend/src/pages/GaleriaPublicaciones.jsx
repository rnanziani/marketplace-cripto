import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePublicaciones } from '../context/PublicacionesContext'
import './GaleriaPublicaciones.css'

function GaleriaPublicaciones() {
  const { publicaciones, filtros, isLoading, actualizarFiltros, limpiarFiltros, fetchPublicaciones } = usePublicaciones()

  useEffect(() => {
    fetchPublicaciones()
  }, [])

  const handleFilterChange = (e) => {
    actualizarFiltros({
      [e.target.name]: e.target.value
    })
  }

  // Mock de datos para demostración
  const publicacionesMock = [
    {
      id: 1,
      tipo: 'VENTA',
      criptomoneda: 'BTC',
      cantidad: '0.5',
      precio_unitario: '45000',
      moneda_fiat: 'USD',
      metodos_pago: ['Transferencia', 'PayPal'],
      ubicacion: 'Santiago, Chile',
      username: 'vendedor123',
      imagen_principal: 'https://via.placeholder.com/300'
    },
    {
      id: 2,
      tipo: 'COMPRA',
      criptomoneda: 'ETH',
      cantidad: '2.0',
      precio_unitario: '3000',
      moneda_fiat: 'USD',
      metodos_pago: ['PayPal'],
      ubicacion: 'Buenos Aires, Argentina',
      username: 'trader456',
      imagen_principal: 'https://via.placeholder.com/300'
    }
  ]

  const displayPublicaciones = publicaciones.length > 0 ? publicaciones : publicacionesMock

  return (
    <div className="galeria-container">
      <h1>Publicaciones</h1>

      <div className="filtros-section">
        <h2>Filtros</h2>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              name="tipo"
              value={filtros.tipo}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="COMPRA">Compra</option>
              <option value="VENTA">Venta</option>
            </select>
          </div>

          <div className="filtro-group">
            <label htmlFor="criptomoneda">Criptomoneda</label>
            <select
              id="criptomoneda"
              name="criptomoneda"
              value={filtros.criptomoneda}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="BTC">Bitcoin</option>
              <option value="ETH">Ethereum</option>
              <option value="USDT">Tether</option>
            </select>
          </div>

          <div className="filtro-group">
            <label htmlFor="metodo_pago">Método de Pago</label>
            <select
              id="metodo_pago"
              name="metodo_pago"
              value={filtros.metodo_pago}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="Transferencia">Transferencia</option>
              <option value="PayPal">PayPal</option>
              <option value="Efectivo">Efectivo</option>
            </select>
          </div>

          <div className="filtro-group">
            <label htmlFor="ubicacion">Ubicación</label>
            <input
              type="text"
              id="ubicacion"
              name="ubicacion"
              value={filtros.ubicacion}
              onChange={handleFilterChange}
              placeholder="Buscar ubicación..."
            />
          </div>
        </div>
        <button className="btn-limpiar" onClick={limpiarFiltros}>
          Limpiar Filtros
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Cargando publicaciones...</div>
      ) : (
        <div className="publicaciones-grid">
          {displayPublicaciones.map(publicacion => (
            <Link
              key={publicacion.id}
              to={`/publicaciones/${publicacion.id}`}
              className="publicacion-card"
            >
              <div className="publicacion-imagen">
                <img src={publicacion.imagen_principal} alt={publicacion.criptomoneda} />
                <span className={`badge ${publicacion.tipo.toLowerCase()}`}>
                  {publicacion.tipo}
                </span>
              </div>
              <div className="publicacion-info">
                <h3>{publicacion.criptomoneda} - {publicacion.cantidad}</h3>
                <p className="precio">
                  {publicacion.precio_unitario} {publicacion.moneda_fiat}
                </p>
                <p className="metodos-pago">
                  {publicacion.metodos_pago.join(', ')}
                </p>
                <p className="ubicacion">{publicacion.ubicacion}</p>
                <p className="vendedor">Por: {publicacion.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && displayPublicaciones.length === 0 && (
        <div className="sin-resultados">
          <p>No se encontraron publicaciones con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  )
}

export default GaleriaPublicaciones

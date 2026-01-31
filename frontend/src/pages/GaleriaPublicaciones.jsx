import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePublicaciones } from '../context/PublicacionesContext'
import { getPublicationImageUrl } from '../utils/cryptoImages'
import './GaleriaPublicaciones.css'

function GaleriaPublicaciones() {
  const { publicaciones, filtros, isLoading, error, actualizarFiltros, limpiarFiltros, fetchPublicaciones } = usePublicaciones()

  useEffect(() => {
    fetchPublicaciones()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Refetch when filters change
  }, [filtros.tipo, filtros.criptomoneda, filtros.metodo_pago, filtros.ubicacion])

  const handleFilterChange = (e) => {
    actualizarFiltros({
      [e.target.name]: e.target.value
    })
  }

  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300?text=CRYPTO'

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
      username: 'vendedor123'
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
      username: 'trader456'
    }
  ]

  const displayPublicaciones = publicaciones.length > 0 ? publicaciones : publicacionesMock

  return (
    <div className="galeria-container">
      <h1>Publicaciones</h1>

      {error && (
        <div className="galeria-error" role="alert">
          <p>No se pudieron cargar las publicaciones. Verifica que el servidor esté en ejecución.</p>
          <button type="button" className="btn-reintentar" onClick={() => fetchPublicaciones()}>
            Reintentar
          </button>
        </div>
      )}

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
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="PayPal">PayPal</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Zelle">Zelle</option>
              <option value="Wise">Wise</option>
              <option value="Otro">Otro</option>
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
        <button className="btn-limpiar" onClick={() => limpiarFiltros()} type="button">
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
                <img
                  src={getPublicationImageUrl(publicacion)}
                  alt={`${publicacion.criptomoneda} - ${publicacion.cantidad}`}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = PLACEHOLDER_IMAGE
                  }}
                />
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
                  {(publicacion.metodos_pago || []).join(', ')}
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

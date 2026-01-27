import './Card.css'

/**
 * Componente Card reutilizable
 * Props:
 *  - title: string - Título de la card
 *  - children: ReactNode - Contenido de la card
 *  - className: string - Clases CSS adicionales
 *  - onClick: function - Función al hacer click
 */
function Card({ title, children, className = '', onClick }) {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}

export default Card

import './Button.css'

/**
 * Componente Button reutilizable
 * Props:
 *  - children: ReactNode - Texto o contenido del botón
 *  - variant: string - 'primary' | 'secondary' | 'danger' | 'ghost'
 *  - size: string - 'small' | 'medium' | 'large'
 *  - disabled: boolean - Si está deshabilitado
 *  - onClick: function - Función al hacer click
 *  - type: string - 'button' | 'submit' | 'reset'
 *  - className: string - Clases adicionales
 */
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const buttonClass = `btn btn-${variant} btn-${size} ${className}`.trim()

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

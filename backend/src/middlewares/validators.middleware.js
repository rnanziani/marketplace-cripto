import { body, param, validationResult } from 'express-validator'

/**
 * Middleware para manejar los errores de validación
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Error de validación',
      errors: errors.array()
    })
  }
  next()
}

// Validadores para autenticación
export const validateRegistro = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El username debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El username solo puede contener letras, números y guiones bajos'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('telefono')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El teléfono debe tener entre 8 y 20 caracteres'),
  body('pais')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El país no puede exceder 50 caracteres'),
  handleValidationErrors
]

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  handleValidationErrors
]

// Validadores para publicaciones
export const validatePublicacion = [
  body('tipo')
    .isIn(['COMPRA', 'VENTA'])
    .withMessage('El tipo debe ser COMPRA o VENTA'),
  body('criptomoneda')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('La criptomoneda es requerida (máx 10 caracteres)'),
  body('cantidad')
    .isFloat({ min: 0.00000001 })
    .withMessage('La cantidad debe ser un número positivo'),
  body('precio_unitario')
    .isFloat({ min: 0.01 })
    .withMessage('El precio unitario debe ser un número positivo'),
  body('moneda_fiat')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('La moneda fiat debe tener 3 caracteres (ej: USD)'),
  body('metodos_pago')
    .optional()
    .isArray()
    .withMessage('Los métodos de pago deben ser un array'),
  body('descripcion')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('ubicacion')
    .optional()
    .isLength({ max: 255 })
    .withMessage('La ubicación no puede exceder 255 caracteres'),
  handleValidationErrors
]

export const validateUpdatePublicacion = [
  body('estado')
    .optional()
    .isIn(['ACTIVO', 'PAUSADO', 'FINALIZADO', 'CANCELADO'])
    .withMessage('El estado debe ser ACTIVO, PAUSADO, FINALIZADO o CANCELADO'),
  body('precio_unitario')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El precio unitario debe ser un número positivo'),
  body('cantidad')
    .optional()
    .isFloat({ min: 0.00000001 })
    .withMessage('La cantidad debe ser un número positivo'),
  handleValidationErrors
]

// Validadores para transacciones
export const validateTransaccion = [
  body('publicacion_id')
    .isInt({ min: 1 })
    .withMessage('El ID de publicación debe ser un número entero positivo'),
  body('cantidad')
    .isFloat({ min: 0.00000001 })
    .withMessage('La cantidad debe ser un número positivo'),
  handleValidationErrors
]

export const validateCalificacion = [
  body('calificacion')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un número entre 1 y 5'),
  body('tipo')
    .isIn(['comprador', 'vendedor'])
    .withMessage('El tipo debe ser "comprador" o "vendedor"'),
  handleValidationErrors
]

// Validadores para mensajes
export const validateMensaje = [
  body('destinatario_id')
    .isInt({ min: 1 })
    .withMessage('El ID del destinatario debe ser un número entero positivo'),
  body('publicacion_id')
    .isInt({ min: 1 })
    .withMessage('El ID de publicación debe ser un número entero positivo'),
  body('contenido')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El contenido del mensaje es requerido (máx 1000 caracteres)'),
  handleValidationErrors
]

// Validador para parámetros de ID
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  handleValidationErrors
]

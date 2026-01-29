import { body, validationResult } from 'express-validator'

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

/**
 * Validaciones para el registro de usuarios
 */
export const validateRegistro = [
  body('email_00')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('username_00')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El username debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El username solo puede contener letras, números y guiones bajos'),
  body('password_hash_00')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('telefono_00')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El teléfono debe tener entre 8 y 20 caracteres'),
  body('pais_00')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El país no puede tener más de 50 caracteres'),
  handleValidationErrors
]

/**
 * Validaciones para el login
 */
export const validateLogin = [
  body('email_00')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password_hash_00')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  handleValidationErrors
]

/**
 * Validaciones para crear una publicación
 */
export const validatePublicacion = [
  body('tipo_02')
    .isIn(['COMPRA', 'VENTA'])
    .withMessage('El tipo debe ser COMPRA o VENTA'),
  body('criptomoneda_02')
    .notEmpty()
    .withMessage('La criptomoneda es requerida')
    .isLength({ max: 10 })
    .withMessage('La criptomoneda no puede tener más de 10 caracteres'),
  body('cantidad_02')
    .isFloat({ min: 0.00000001 })
    .withMessage('La cantidad debe ser mayor a 0'),
  body('precio_unitario_02')
    .isFloat({ min: 0.01 })
    .withMessage('El precio unitario debe ser mayor a 0'),
  body('moneda_fiat_02')
    .optional()
    .isLength({ max: 3 })
    .withMessage('La moneda fiat no puede tener más de 3 caracteres'),
  body('metodos_pago_02')
    .optional()
    .isArray()
    .withMessage('Los métodos de pago deben ser un array'),
  body('descripcion_02')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede tener más de 1000 caracteres'),
  body('ubicacion_02')
    .optional()
    .isLength({ max: 255 })
    .withMessage('La ubicación no puede tener más de 255 caracteres'),
  handleValidationErrors
]

/**
 * Validaciones para crear una transacción
 */
export const validateTransaccion = [
  body('publicacion_id_04')
    .isInt({ min: 1 })
    .withMessage('El ID de publicación debe ser un número entero válido'),
  body('cantidad_04')
    .isFloat({ min: 0.00000001 })
    .withMessage('La cantidad debe ser mayor a 0'),
  handleValidationErrors
]

/**
 * Validaciones para enviar un mensaje
 */
export const validateMensaje = [
  body('destinatario_id_05')
    .isInt({ min: 1 })
    .withMessage('El ID del destinatario debe ser un número entero válido'),
  body('publicacion_id_05')
    .isInt({ min: 1 })
    .withMessage('El ID de publicación debe ser un número entero válido'),
  body('contenido_05')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El contenido del mensaje debe tener entre 1 y 1000 caracteres'),
  handleValidationErrors
]

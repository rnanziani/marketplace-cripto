import jwt from 'jsonwebtoken'
import pool from '../database/db.js'

/**
 * Middleware para verificar el token JWT en las peticiones
 * Extrae el token del header Authorization y valida que sea válido
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token no proporcionado',
        message: 'Debes incluir un token en el header Authorization'
      })
    }

    // El formato debe ser: "Bearer <token>"
    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        error: 'Formato de token inválido',
        message: 'El formato debe ser: Bearer <token>'
      })
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secret_key_muy_segura')

    // Verificar que el usuario existe en la base de datos
    const result = await pool.query(
      'SELECT id_00, email_00, username_00, kyc_verificado_00 FROM tbl_00_usuarios WHERE id_00 = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El token es válido pero el usuario no existe'
      })
    }

    // Agregar la información del usuario al request para usarla en los controladores
    req.user = {
      id: result.rows[0].id_00,
      email: result.rows[0].email_00,
      username: result.rows[0].username_00,
      kycVerificado: result.rows[0].kyc_verificado_00
    }

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente'
      })
    }
    console.error('Error en verifyToken:', error)
    return res.status(500).json({
      error: 'Error al verificar el token',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Middleware opcional para verificar que el usuario tenga KYC verificado
 */
export const verifyKYC = (req, res, next) => {
  if (!req.user.kycVerificado) {
    return res.status(403).json({
      error: 'KYC no verificado',
      message: 'Debes verificar tu identidad (KYC) para realizar esta acción'
    })
  }
  next()
}

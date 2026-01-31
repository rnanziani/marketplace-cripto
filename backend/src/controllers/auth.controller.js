import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../database/db.js'

/**
 * Controlador para registrar un nuevo usuario
 */
export const registro = async (req, res) => {
  try {
    const { email_00, username_00, password_hash_00, telefono_00, pais_00 } = req.body

    // Verificar si el email ya existe
    const emailExists = await pool.query(
      'SELECT id_00 FROM tbl_00_usuarios WHERE email_00 = $1',
      [email_00]
    )

    if (emailExists.rows.length > 0) {
      return res.status(409).json({
        error: 'Email ya registrado',
        message: 'Este email ya está en uso'
      })
    }

    // Verificar si el username ya existe
    const usernameExists = await pool.query(
      'SELECT id_00 FROM tbl_00_usuarios WHERE username_00 = $1',
      [username_00]
    )

    if (usernameExists.rows.length > 0) {
      return res.status(409).json({
        error: 'Username ya registrado',
        message: 'Este username ya está en uso'
      })
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password_hash_00, salt)

    // Insertar el nuevo usuario
    const result = await pool.query(
      `INSERT INTO tbl_00_usuarios 
       (email_00, username_00, password_hash_00, telefono_00, pais_00) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id_00, email_00, username_00, telefono_00, pais_00, kyc_verificado_00, created_at_00`,
      [email_00, username_00, hashedPassword, telefono_00 || null, pais_00 || null]
    )

    const usuario = result.rows[0]

    // Generar token JWT
    const token = jwt.sign(
      { userId: usuario.id_00, email: usuario.email_00 },
      process.env.JWT_SECRET || 'tu_secret_key_muy_segura',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario.id_00,
        email: usuario.email_00,
        username: usuario.username_00,
        telefono: usuario.telefono_00,
        pais: usuario.pais_00,
        kycVerificado: usuario.kyc_verificado_00,
        createdAt: usuario.created_at_00
      },
      token
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({
      error: 'Error al registrar usuario',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para iniciar sesión
 */
export const login = async (req, res) => {
  try {
    const { email_00, password_hash_00 } = req.body

    // Buscar el usuario por email
    const result = await pool.query(
      'SELECT id_00, email_00, username_00, password_hash_00, telefono_00, pais_00, kyc_verificado_00, created_at_00 FROM tbl_00_usuarios WHERE email_00 = $1',
      [email_00]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      })
    }

    const usuario = result.rows[0]

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password_hash_00, usuario.password_hash_00)

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      })
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: usuario.id_00, email: usuario.email_00 },
      process.env.JWT_SECRET || 'tu_secret_key_muy_segura',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login exitoso',
      usuario: {
        id: usuario.id_00,
        email: usuario.email_00,
        username: usuario.username_00,
        telefono: usuario.telefono_00,
        pais: usuario.pais_00,
        kycVerificado: usuario.kyc_verificado_00,
        createdAt: usuario.created_at_00
      },
      token
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({
      error: 'Error al iniciar sesión',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para verificar el token y obtener información del usuario
 */
export const verificar = async (req, res) => {
  try {
    // El middleware verifyToken ya validó el token y agregó req.user
    const result = await pool.query(
      'SELECT id_00, email_00, username_00, telefono_00, pais_00, kyc_verificado_00, created_at_00 FROM tbl_00_usuarios WHERE id_00 = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      })
    }

    const usuario = result.rows[0]

    res.json({
      message: 'Token válido',
      usuario: {
        id: usuario.id_00,
        email: usuario.email_00,
        username: usuario.username_00,
        telefono: usuario.telefono_00,
        pais: usuario.pais_00,
        kycVerificado: usuario.kyc_verificado_00,
        createdAt: usuario.created_at_00
      }
    })
  } catch (error) {
    console.error('Error en verificar:', error)
    res.status(500).json({
      error: 'Error al verificar token',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Solicitar recuperación de contraseña. Genera un token y lo guarda.
 * En producción se enviaría por email; en desarrollo se retorna el link.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email_00 } = req.body

    if (!email_00 || !email_00.trim()) {
      return res.status(400).json({
        error: 'Email requerido',
        message: 'Indica el email de tu cuenta'
      })
    }

    const emailNorm = email_00.trim().toLowerCase()
    const usuarioResult = await pool.query(
      'SELECT id_00, email_00 FROM tbl_00_usuarios WHERE LOWER(email_00) = $1',
      [emailNorm]
    )

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Email no encontrado',
        message: 'No existe ninguna cuenta con ese email'
      })
    }

    const usuario = usuarioResult.rows[0]

    await pool.query(
      'DELETE FROM tbl_00_password_reset_tokens WHERE usuario_id_06 = $1',
      [usuario.id_00]
    )

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await pool.query(
      `INSERT INTO tbl_00_password_reset_tokens (usuario_id_06, token_06, expires_at_06)
       VALUES ($1, $2, $3)`,
      [usuario.id_00, token, expiresAt]
    )

    const baseUrl = req.body.frontend_base_url || req.headers.origin || 'http://localhost:5173'
    const resetLink = `${baseUrl.replace(/\/$/, '')}/restablecer-contrasena?token=${token}`

    res.json({
      message: 'Si el email existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.',
      resetLink: process.env.NODE_ENV === 'production' ? undefined : resetLink
    })
  } catch (error) {
    console.error('Error en forgotPassword:', error)
    res.status(500).json({
      error: 'Error al procesar solicitud',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Restablecer contraseña con el token recibido.
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password_hash_00 } = req.body

    if (!token || !password_hash_00) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Token y nueva contraseña son requeridos'
      })
    }

    if (password_hash_00.length < 6) {
      return res.status(400).json({
        error: 'Contraseña inválida',
        message: 'La contraseña debe tener al menos 6 caracteres'
      })
    }

    const tokenResult = await pool.query(
      `SELECT prt.usuario_id_06, prt.expires_at_06
       FROM tbl_00_password_reset_tokens prt
       WHERE prt.token_06 = $1`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Token inválido',
        message: 'El enlace de recuperación no es válido o ya fue usado'
      })
    }

    const { usuario_id_06, expires_at_06 } = tokenResult.rows[0]

    if (new Date(expires_at_06) < new Date()) {
      await pool.query('DELETE FROM tbl_00_password_reset_tokens WHERE token_06 = $1', [token])
      return res.status(400).json({
        error: 'Token expirado',
        message: 'El enlace ha caducado. Solicita uno nuevo.'
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password_hash_00, salt)

    await pool.query(
      'UPDATE tbl_00_usuarios SET password_hash_00 = $1 WHERE id_00 = $2',
      [hashedPassword, usuario_id_06]
    )

    await pool.query('DELETE FROM tbl_00_password_reset_tokens WHERE token_06 = $1', [token])

    res.json({
      message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.'
    })
  } catch (error) {
    console.error('Error en resetPassword:', error)
    res.status(500).json({
      error: 'Error al restablecer contraseña',
      message: 'Error interno del servidor'
    })
  }
}

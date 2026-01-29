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

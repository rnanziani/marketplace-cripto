import bcrypt from 'bcryptjs'
import pool from '../database/db.js'

/**
 * Controlador para obtener el perfil del usuario autenticado
 */
export const getPerfil = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_00, email_00, username_00, telefono_00, pais_00, kyc_verificado_00, created_at_00 
       FROM tbl_00_usuarios 
       WHERE id_00 = $1`,
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
    console.error('Error en getPerfil:', error)
    res.status(500).json({
      error: 'Error al obtener perfil',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para actualizar el perfil del usuario autenticado
 */
export const updatePerfil = async (req, res) => {
  try {
    const { username_00, telefono_00, pais_00, password_hash_00 } = req.body
    const updates = []
    const values = []
    let paramCount = 1

    // Construir la consulta dinámicamente según los campos proporcionados
    if (username_00 !== undefined) {
      // Verificar que el username no esté en uso por otro usuario
      const usernameExists = await pool.query(
        'SELECT id_00 FROM tbl_00_usuarios WHERE username_00 = $1 AND id_00 != $2',
        [username_00, req.user.id]
      )

      if (usernameExists.rows.length > 0) {
        return res.status(409).json({
          error: 'Username ya en uso',
          message: 'Este username ya está siendo usado por otro usuario'
        })
      }

      updates.push(`username_00 = $${paramCount++}`)
      values.push(username_00)
    }

    if (telefono_00 !== undefined) {
      updates.push(`telefono_00 = $${paramCount++}`)
      values.push(telefono_00)
    }

    if (pais_00 !== undefined) {
      updates.push(`pais_00 = $${paramCount++}`)
      values.push(pais_00)
    }

    if (password_hash_00 !== undefined) {
      // Hashear la nueva contraseña
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password_hash_00, salt)
      updates.push(`password_hash_00 = $${paramCount++}`)
      values.push(hashedPassword)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Sin campos para actualizar',
        message: 'Debes proporcionar al menos un campo para actualizar'
      })
    }

    values.push(req.user.id)

    const query = `
      UPDATE tbl_00_usuarios 
      SET ${updates.join(', ')} 
      WHERE id_00 = $${paramCount}
      RETURNING id_00, email_00, username_00, telefono_00, pais_00, kyc_verificado_00, created_at_00
    `

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      })
    }

    const usuario = result.rows[0]

    res.json({
      message: 'Perfil actualizado exitosamente',
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
    console.error('Error en updatePerfil:', error)
    res.status(500).json({
      error: 'Error al actualizar perfil',
      message: 'Error interno del servidor'
    })
  }
}

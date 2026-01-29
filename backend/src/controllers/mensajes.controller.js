import pool from '../database/db.js'

/**
 * Controlador para enviar un mensaje
 */
export const enviarMensaje = async (req, res) => {
  try {
    const { destinatario_id_05, publicacion_id_05, contenido_05 } = req.body

    // Verificar que el destinatario existe
    const destinatarioExists = await pool.query(
      'SELECT id_00 FROM tbl_00_usuarios WHERE id_00 = $1',
      [destinatario_id_05]
    )

    if (destinatarioExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Destinatario no encontrado',
        message: 'El usuario destinatario no existe'
      })
    }

    // Verificar que no se esté enviando un mensaje a sí mismo
    if (destinatario_id_05 === req.user.id) {
      return res.status(400).json({
        error: 'Operación inválida',
        message: 'No puedes enviarte un mensaje a ti mismo'
      })
    }

    // Verificar que la publicación existe
    const publicacionExists = await pool.query(
      'SELECT id_02 FROM tbl_02_publicaciones WHERE id_02 = $1',
      [publicacion_id_05]
    )

    if (publicacionExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Publicación no encontrada',
        message: 'La publicación no existe'
      })
    }

    // Insertar el mensaje
    const result = await pool.query(
      `INSERT INTO tbl_05_mensajes 
       (remitente_id_05, destinatario_id_05, publicacion_id_05, contenido_05) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [req.user.id, destinatario_id_05, publicacion_id_05, contenido_05]
    )

    res.status(201).json({
      message: 'Mensaje enviado exitosamente',
      mensaje: result.rows[0]
    })
  } catch (error) {
    console.error('Error en enviarMensaje:', error)
    res.status(500).json({
      error: 'Error al enviar mensaje',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para listar los mensajes del usuario autenticado
 */
export const listarMensajes = async (req, res) => {
  try {
    const { publicacion_id, conversacion_con, limit = 50, offset = 0 } = req.query

    let query = `
      SELECT 
        m.*,
        r.username_00 as remitente_username,
        d.username_00 as destinatario_username,
        p.criptomoneda_02,
        p.tipo_02
      FROM tbl_05_mensajes m
      LEFT JOIN tbl_00_usuarios r ON m.remitente_id_05 = r.id_00
      LEFT JOIN tbl_00_usuarios d ON m.destinatario_id_05 = d.id_00
      LEFT JOIN tbl_02_publicaciones p ON m.publicacion_id_05 = p.id_02
      WHERE (m.remitente_id_05 = $1 OR m.destinatario_id_05 = $1)
    `
    const queryParams = [req.user.id]
    let paramCount = 2

    if (publicacion_id) {
      query += ` AND m.publicacion_id_05 = $${paramCount++}`
      queryParams.push(publicacion_id)
    }

    if (conversacion_con) {
      // Filtrar mensajes de una conversación específica
      query += ` AND (
        (m.remitente_id_05 = $1 AND m.destinatario_id_05 = $${paramCount}) OR
        (m.remitente_id_05 = $${paramCount} AND m.destinatario_id_05 = $1)
      )`
      queryParams.push(parseInt(conversacion_con))
      paramCount++
    }

    query += ` ORDER BY m.created_at_05 DESC`
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, queryParams)

    res.json({
      mensajes: result.rows,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Error en listarMensajes:', error)
    res.status(500).json({
      error: 'Error al listar mensajes',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para marcar un mensaje como leído
 */
export const marcarComoLeido = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que el mensaje existe y el usuario es el destinatario
    const mensajeExists = await pool.query(
      'SELECT destinatario_id_05 FROM tbl_05_mensajes WHERE id_05 = $1',
      [id]
    )

    if (mensajeExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Mensaje no encontrado',
        message: 'El mensaje no existe'
      })
    }

    if (mensajeExists.rows[0].destinatario_id_05 !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo puedes marcar como leídos los mensajes que recibiste'
      })
    }

    // Actualizar el estado de leído
    const result = await pool.query(
      `UPDATE tbl_05_mensajes 
       SET leido_05 = true 
       WHERE id_05 = $1 
       RETURNING *`,
      [id]
    )

    res.json({
      message: 'Mensaje marcado como leído',
      mensaje: result.rows[0]
    })
  } catch (error) {
    console.error('Error en marcarComoLeido:', error)
    res.status(500).json({
      error: 'Error al marcar mensaje como leído',
      message: 'Error interno del servidor'
    })
  }
}

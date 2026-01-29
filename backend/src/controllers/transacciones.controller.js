import pool from '../database/db.js'

/**
 * Controlador para crear una nueva transacción
 */
export const crearTransaccion = async (req, res) => {
  try {
    const { publicacion_id_04, cantidad_04 } = req.body

    // Obtener información de la publicación
    const publicacionResult = await pool.query(
      `SELECT usuario_id_02, tipo_02, cantidad_02, precio_unitario_02, estado_02 
       FROM tbl_02_publicaciones 
       WHERE id_02 = $1`,
      [publicacion_id_04]
    )

    if (publicacionResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Publicación no encontrada',
        message: 'La publicación no existe'
      })
    }

    const publicacion = publicacionResult.rows[0]

    // Validar que la publicación esté activa
    if (publicacion.estado_02 !== 'ACTIVO') {
      return res.status(400).json({
        error: 'Publicación no disponible',
        message: 'La publicación no está activa'
      })
    }

    // Validar que no sea el mismo usuario
    if (publicacion.usuario_id_02 === req.user.id) {
      return res.status(400).json({
        error: 'Operación inválida',
        message: 'No puedes crear una transacción con tu propia publicación'
      })
    }

    // Validar cantidad disponible
    if (parseFloat(cantidad_04) > parseFloat(publicacion.cantidad_02)) {
      return res.status(400).json({
        error: 'Cantidad insuficiente',
        message: 'La cantidad solicitada excede la disponible'
      })
    }

    // Calcular precio total
    const precioTotal = parseFloat(cantidad_04) * parseFloat(publicacion.precio_unitario_02)

    // Determinar comprador y vendedor según el tipo de publicación
    let compradorId, vendedorId
    if (publicacion.tipo_02 === 'VENTA') {
      // Si la publicación es de VENTA, el usuario autenticado es el comprador
      compradorId = req.user.id
      vendedorId = publicacion.usuario_id_02
    } else {
      // Si la publicación es de COMPRA, el usuario autenticado es el vendedor
      compradorId = publicacion.usuario_id_02
      vendedorId = req.user.id
    }

    // Crear la transacción
    const result = await pool.query(
      `INSERT INTO tbl_04_transacciones 
       (comprador_id_04, vendedor_id_04, publicacion_id_04, cantidad_04, precio_total_04, estado_04) 
       VALUES ($1, $2, $3, $4, $5, 'PENDIENTE') 
       RETURNING *`,
      [compradorId, vendedorId, publicacion_id_04, cantidad_04, precioTotal]
    )

    // Actualizar la cantidad disponible de la publicación
    const nuevaCantidad = parseFloat(publicacion.cantidad_02) - parseFloat(cantidad_04)
    if (nuevaCantidad <= 0) {
      // Si no queda cantidad, marcar como finalizada
      await pool.query(
        'UPDATE tbl_02_publicaciones SET estado_02 = $1 WHERE id_02 = $2',
        ['FINALIZADO', publicacion_id_04]
      )
    } else {
      // Actualizar la cantidad
      await pool.query(
        'UPDATE tbl_02_publicaciones SET cantidad_02 = $1 WHERE id_02 = $2',
        [nuevaCantidad, publicacion_id_04]
      )
    }

    res.status(201).json({
      message: 'Transacción creada exitosamente',
      transaccion: result.rows[0]
    })
  } catch (error) {
    console.error('Error en crearTransaccion:', error)
    res.status(500).json({
      error: 'Error al crear transacción',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para listar las transacciones del usuario autenticado
 */
export const listarTransacciones = async (req, res) => {
  try {
    const { estado, tipo, limit = 20, offset = 0 } = req.query

    let query = `
      SELECT 
        t.*,
        c.username_00 as comprador_username,
        v.username_00 as vendedor_username,
        p.criptomoneda_02,
        p.tipo_02 as publicacion_tipo
      FROM tbl_04_transacciones t
      LEFT JOIN tbl_00_usuarios c ON t.comprador_id_04 = c.id_00
      LEFT JOIN tbl_00_usuarios v ON t.vendedor_id_04 = v.id_00
      LEFT JOIN tbl_02_publicaciones p ON t.publicacion_id_04 = p.id_02
      WHERE (t.comprador_id_04 = $1 OR t.vendedor_id_04 = $1)
    `
    const queryParams = [req.user.id]
    let paramCount = 2

    if (estado) {
      query += ` AND t.estado_04 = $${paramCount++}`
      queryParams.push(estado)
    }

    if (tipo) {
      if (tipo === 'COMPRAS') {
        query += ` AND t.comprador_id_04 = $1`
      } else if (tipo === 'VENTAS') {
        query += ` AND t.vendedor_id_04 = $1`
      }
    }

    query += ` ORDER BY t.created_at_04 DESC`
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, queryParams)

    res.json({
      transacciones: result.rows,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Error en listarTransacciones:', error)
    res.status(500).json({
      error: 'Error al listar transacciones',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para actualizar el estado de una transacción
 */
export const updateEstadoTransaccion = async (req, res) => {
  try {
    const { id } = req.params
    const { estado_04, hash_transaccion_04 } = req.body

    // Validar estado
    const estadosValidos = ['PENDIENTE', 'EN_ESPERA_PAGO', 'COMPLETADA', 'CANCELADA', 'DISPUTA']
    if (!estadosValidos.includes(estado_04)) {
      return res.status(400).json({
        error: 'Estado inválido',
        message: `El estado debe ser uno de: ${estadosValidos.join(', ')}`
      })
    }

    // Verificar que la transacción existe y pertenece al usuario
    const transaccionExists = await pool.query(
      'SELECT comprador_id_04, vendedor_id_04, estado_04 FROM tbl_04_transacciones WHERE id_04 = $1',
      [id]
    )

    if (transaccionExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Transacción no encontrada',
        message: 'La transacción no existe'
      })
    }

    const transaccion = transaccionExists.rows[0]

    // Verificar que el usuario es parte de la transacción
    if (transaccion.comprador_id_04 !== req.user.id && transaccion.vendedor_id_04 !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permiso para actualizar esta transacción'
      })
    }

    // Construir la actualización
    const updates = [`estado_04 = $1`]
    const values = [estado_04]
    let paramCount = 2

    if (hash_transaccion_04 !== undefined) {
      updates.push(`hash_transaccion_04 = $${paramCount++}`)
      values.push(hash_transaccion_04)
    }

    values.push(id)

    const query = `
      UPDATE tbl_04_transacciones 
      SET ${updates.join(', ')} 
      WHERE id_04 = $${paramCount}
      RETURNING *
    `

    const result = await pool.query(query, values)

    res.json({
      message: 'Estado de transacción actualizado exitosamente',
      transaccion: result.rows[0]
    })
  } catch (error) {
    console.error('Error en updateEstadoTransaccion:', error)
    res.status(500).json({
      error: 'Error al actualizar estado de transacción',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para calificar una transacción
 */
export const calificarTransaccion = async (req, res) => {
  try {
    const { id } = req.params
    const { calificacion_comprador_04, calificacion_vendedor_04 } = req.body

    // Verificar que la transacción existe y está completada
    const transaccionExists = await pool.query(
      'SELECT comprador_id_04, vendedor_id_04, estado_04 FROM tbl_04_transacciones WHERE id_04 = $1',
      [id]
    )

    if (transaccionExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Transacción no encontrada',
        message: 'La transacción no existe'
      })
    }

    const transaccion = transaccionExists.rows[0]

    if (transaccion.estado_04 !== 'COMPLETADA') {
      return res.status(400).json({
        error: 'Transacción no completada',
        message: 'Solo puedes calificar transacciones completadas'
      })
    }

    // Verificar que el usuario es parte de la transacción
    if (transaccion.comprador_id_04 !== req.user.id && transaccion.vendedor_id_04 !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permiso para calificar esta transacción'
      })
    }

    // Validar calificaciones (1-5)
    if (calificacion_comprador_04 !== undefined) {
      if (calificacion_comprador_04 < 1 || calificacion_comprador_04 > 5) {
        return res.status(400).json({
          error: 'Calificación inválida',
          message: 'La calificación debe estar entre 1 y 5'
        })
      }
      // Solo el comprador puede calificar al vendedor
      if (transaccion.comprador_id_04 !== req.user.id) {
        return res.status(403).json({
          error: 'No autorizado',
          message: 'Solo el comprador puede calificar al vendedor'
        })
      }
    }

    if (calificacion_vendedor_04 !== undefined) {
      if (calificacion_vendedor_04 < 1 || calificacion_vendedor_04 > 5) {
        return res.status(400).json({
          error: 'Calificación inválida',
          message: 'La calificación debe estar entre 1 y 5'
        })
      }
      // Solo el vendedor puede calificar al comprador
      if (transaccion.vendedor_id_04 !== req.user.id) {
        return res.status(403).json({
          error: 'No autorizado',
          message: 'Solo el vendedor puede calificar al comprador'
        })
      }
    }

    // Actualizar las calificaciones
    const updates = []
    const values = []
    let paramCount = 1

    if (calificacion_comprador_04 !== undefined) {
      updates.push(`calificacion_comprador_04 = $${paramCount++}`)
      values.push(calificacion_comprador_04)
    }

    if (calificacion_vendedor_04 !== undefined) {
      updates.push(`calificacion_vendedor_04 = $${paramCount++}`)
      values.push(calificacion_vendedor_04)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Sin calificaciones para actualizar',
        message: 'Debes proporcionar al menos una calificación'
      })
    }

    values.push(id)

    const query = `
      UPDATE tbl_04_transacciones 
      SET ${updates.join(', ')} 
      WHERE id_04 = $${paramCount}
      RETURNING *
    `

    const result = await pool.query(query, values)

    res.json({
      message: 'Calificación actualizada exitosamente',
      transaccion: result.rows[0]
    })
  } catch (error) {
    console.error('Error en calificarTransaccion:', error)
    res.status(500).json({
      error: 'Error al calificar transacción',
      message: 'Error interno del servidor'
    })
  }
}

import pool from '../database/db.js'

/**
 * Controlador para listar todas las publicaciones (con filtros opcionales)
 */
export const listarPublicaciones = async (req, res) => {
  try {
    const { tipo, criptomoneda, estado, metodo_pago, ubicacion, limit = 20, offset = 0 } = req.query

    let query = `
      SELECT 
        p.id_02,
        p.usuario_id_02,
        u.username_00,
        p.tipo_02,
        p.criptomoneda_02,
        p.cantidad_02,
        p.precio_unitario_02,
        p.moneda_fiat_02,
        p.metodos_pago_02,
        p.descripcion_02,
        p.ubicacion_02,
        p.estado_02,
        p.created_at_02,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id_03,
              'url', i.url_imagen_03,
              'esPrincipal', i.es_principal_03
            )
          ) FILTER (WHERE i.id_03 IS NOT NULL),
          '[]'::json
        ) as imagenes
      FROM tbl_02_publicaciones p
      LEFT JOIN tbl_00_usuarios u ON p.usuario_id_02 = u.id_00
      LEFT JOIN tbl_03_imagenes_publicaciones i ON p.id_02 = i.publicacion_id_03
      WHERE 1=1
    `
    const queryParams = []
    let paramCount = 1

    if (tipo) {
      query += ` AND p.tipo_02 = $${paramCount++}`
      queryParams.push(tipo)
    }

    if (criptomoneda) {
      query += ` AND p.criptomoneda_02 = $${paramCount++}`
      queryParams.push(criptomoneda)
    }

    if (estado) {
      query += ` AND p.estado_02 = $${paramCount++}`
      queryParams.push(estado)
    } else {
      // Por defecto, solo mostrar publicaciones activas
      query += ` AND p.estado_02 = 'ACTIVO'`
    }

    if (metodo_pago && metodo_pago.trim()) {
      query += ` AND EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.metodos_pago_02, '{}')) AS m(metodo)
        WHERE LOWER(m.metodo) = LOWER($${paramCount})
      )`
      queryParams.push(metodo_pago.trim())
      paramCount++
    }

    if (ubicacion && ubicacion.trim()) {
      query += ` AND p.ubicacion_02 ILIKE $${paramCount++}`
      queryParams.push(`%${ubicacion.trim()}%`)
    }

    query += ` GROUP BY p.id_02, u.username_00`
    query += ` ORDER BY p.created_at_02 DESC`
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, queryParams)

    res.json({
      publicaciones: result.rows,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Error en listarPublicaciones:', error)
    res.status(500).json({
      error: 'Error al listar publicaciones',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para obtener el detalle de una publicación
 */
export const getPublicacion = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT 
        p.id_02,
        p.usuario_id_02,
        u.username_00,
        u.email_00,
        p.tipo_02,
        p.criptomoneda_02,
        p.cantidad_02,
        p.precio_unitario_02,
        p.moneda_fiat_02,
        p.metodos_pago_02,
        p.descripcion_02,
        p.ubicacion_02,
        p.estado_02,
        p.created_at_02,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id_03,
              'url', i.url_imagen_03,
              'esPrincipal', i.es_principal_03
            )
          ) FILTER (WHERE i.id_03 IS NOT NULL),
          '[]'::json
        ) as imagenes
      FROM tbl_02_publicaciones p
      LEFT JOIN tbl_00_usuarios u ON p.usuario_id_02 = u.id_00
      LEFT JOIN tbl_03_imagenes_publicaciones i ON p.id_02 = i.publicacion_id_03
      WHERE p.id_02 = $1
      GROUP BY p.id_02, u.username_00, u.email_00`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Publicación no encontrada',
        message: 'La publicación no existe'
      })
    }

    res.json({
      publicacion: result.rows[0]
    })
  } catch (error) {
    console.error('Error en getPublicacion:', error)
    res.status(500).json({
      error: 'Error al obtener publicación',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para crear una nueva publicación
 */
export const crearPublicacion = async (req, res) => {
  try {
    const {
      tipo_02,
      criptomoneda_02,
      cantidad_02,
      precio_unitario_02,
      moneda_fiat_02 = 'USD',
      metodos_pago_02,
      descripcion_02,
      ubicacion_02,
      imagenes
    } = req.body

    // Insertar la publicación
    const result = await pool.query(
      `INSERT INTO tbl_02_publicaciones 
       (usuario_id_02, tipo_02, criptomoneda_02, cantidad_02, precio_unitario_02, 
        moneda_fiat_02, metodos_pago_02, descripcion_02, ubicacion_02) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        req.user.id,
        tipo_02,
        criptomoneda_02,
        cantidad_02,
        precio_unitario_02,
        moneda_fiat_02,
        metodos_pago_02 || [],
        descripcion_02 || null,
        ubicacion_02 || null
      ]
    )

    const publicacion = result.rows[0]

    // Si hay imágenes, insertarlas
    if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      for (let i = 0; i < imagenes.length; i++) {
        await pool.query(
          `INSERT INTO tbl_03_imagenes_publicaciones 
           (publicacion_id_03, url_imagen_03, es_principal_03) 
           VALUES ($1, $2, $3)`,
          [publicacion.id_02, imagenes[i].url, i === 0] // La primera imagen es principal
        )
      }
    }

    // Obtener la publicación completa con imágenes
    const publicacionCompleta = await pool.query(
      `SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id_03,
              'url', i.url_imagen_03,
              'esPrincipal', i.es_principal_03
            )
          ) FILTER (WHERE i.id_03 IS NOT NULL),
          '[]'::json
        ) as imagenes
      FROM tbl_02_publicaciones p
      LEFT JOIN tbl_03_imagenes_publicaciones i ON p.id_02 = i.publicacion_id_03
      WHERE p.id_02 = $1
      GROUP BY p.id_02`,
      [publicacion.id_02]
    )

    res.status(201).json({
      message: 'Publicación creada exitosamente',
      publicacion: publicacionCompleta.rows[0]
    })
  } catch (error) {
    console.error('Error en crearPublicacion:', error)
    res.status(500).json({
      error: 'Error al crear publicación',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para actualizar una publicación (solo el dueño)
 */
export const updatePublicacion = async (req, res) => {
  try {
    const { id } = req.params
    const {
      tipo_02,
      criptomoneda_02,
      cantidad_02,
      precio_unitario_02,
      moneda_fiat_02,
      metodos_pago_02,
      descripcion_02,
      ubicacion_02,
      estado_02
    } = req.body

    // Verificar que la publicación existe y pertenece al usuario
    const publicacionExists = await pool.query(
      'SELECT usuario_id_02 FROM tbl_02_publicaciones WHERE id_02 = $1',
      [id]
    )

    if (publicacionExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Publicación no encontrada',
        message: 'La publicación no existe'
      })
    }

    if (publicacionExists.rows[0].usuario_id_02 !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo puedes actualizar tus propias publicaciones'
      })
    }

    // Construir la consulta de actualización
    const updates = []
    const values = []
    let paramCount = 1

    if (tipo_02 !== undefined) {
      updates.push(`tipo_02 = $${paramCount++}`)
      values.push(tipo_02)
    }
    if (criptomoneda_02 !== undefined) {
      updates.push(`criptomoneda_02 = $${paramCount++}`)
      values.push(criptomoneda_02)
    }
    if (cantidad_02 !== undefined) {
      updates.push(`cantidad_02 = $${paramCount++}`)
      values.push(cantidad_02)
    }
    if (precio_unitario_02 !== undefined) {
      updates.push(`precio_unitario_02 = $${paramCount++}`)
      values.push(precio_unitario_02)
    }
    if (moneda_fiat_02 !== undefined) {
      updates.push(`moneda_fiat_02 = $${paramCount++}`)
      values.push(moneda_fiat_02)
    }
    if (metodos_pago_02 !== undefined) {
      updates.push(`metodos_pago_02 = $${paramCount++}`)
      values.push(metodos_pago_02)
    }
    if (descripcion_02 !== undefined) {
      updates.push(`descripcion_02 = $${paramCount++}`)
      values.push(descripcion_02)
    }
    if (ubicacion_02 !== undefined) {
      updates.push(`ubicacion_02 = $${paramCount++}`)
      values.push(ubicacion_02)
    }
    if (estado_02 !== undefined) {
      updates.push(`estado_02 = $${paramCount++}`)
      values.push(estado_02)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Sin campos para actualizar',
        message: 'Debes proporcionar al menos un campo para actualizar'
      })
    }

    values.push(id)

    const query = `
      UPDATE tbl_02_publicaciones 
      SET ${updates.join(', ')} 
      WHERE id_02 = $${paramCount}
      RETURNING *
    `

    const result = await pool.query(query, values)

    res.json({
      message: 'Publicación actualizada exitosamente',
      publicacion: result.rows[0]
    })
  } catch (error) {
    console.error('Error en updatePublicacion:', error)
    res.status(500).json({
      error: 'Error al actualizar publicación',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para eliminar una publicación (solo el dueño)
 */
export const deletePublicacion = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que la publicación existe y pertenece al usuario
    const publicacionExists = await pool.query(
      'SELECT usuario_id_02 FROM tbl_02_publicaciones WHERE id_02 = $1',
      [id]
    )

    if (publicacionExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Publicación no encontrada',
        message: 'La publicación no existe'
      })
    }

    if (publicacionExists.rows[0].usuario_id_02 !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo puedes eliminar tus propias publicaciones'
      })
    }

    // Eliminar la publicación (las imágenes se eliminan en cascada)
    await pool.query('DELETE FROM tbl_02_publicaciones WHERE id_02 = $1', [id])

    res.json({
      message: 'Publicación eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error en deletePublicacion:', error)
    res.status(500).json({
      error: 'Error al eliminar publicación',
      message: 'Error interno del servidor'
    })
  }
}

/**
 * Controlador para obtener las publicaciones del usuario autenticado
 */
export const misPublicaciones = async (req, res) => {
  try {
    const { estado, limit = 20, offset = 0 } = req.query

    let query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id_03,
              'url', i.url_imagen_03,
              'esPrincipal', i.es_principal_03
            )
          ) FILTER (WHERE i.id_03 IS NOT NULL),
          '[]'::json
        ) as imagenes
      FROM tbl_02_publicaciones p
      LEFT JOIN tbl_03_imagenes_publicaciones i ON p.id_02 = i.publicacion_id_03
      WHERE p.usuario_id_02 = $1
    `
    const queryParams = [req.user.id]
    let paramCount = 2

    if (estado) {
      query += ` AND p.estado_02 = $${paramCount++}`
      queryParams.push(estado)
    }

    query += ` GROUP BY p.id_02`
    query += ` ORDER BY p.created_at_02 DESC`
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, queryParams)

    res.json({
      publicaciones: result.rows,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Error en misPublicaciones:', error)
    res.status(500).json({
      error: 'Error al obtener mis publicaciones',
      message: 'Error interno del servidor'
    })
  }
}

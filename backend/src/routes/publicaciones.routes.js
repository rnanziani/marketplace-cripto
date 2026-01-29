import express from 'express'
import {
  listarPublicaciones,
  getPublicacion,
  crearPublicacion,
  updatePublicacion,
  deletePublicacion,
  misPublicaciones
} from '../controllers/publicaciones.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { validatePublicacion } from '../middlewares/validation.middleware.js'

const router = express.Router()

// GET /api/publicaciones - Listar publicaciones (público, no requiere auth)
router.get('/', listarPublicaciones)

// GET /api/publicaciones/mis-publicaciones - Mis publicaciones (requiere auth)
router.get('/mis-publicaciones', verifyToken, misPublicaciones)

// GET /api/publicaciones/:id - Obtener detalle de publicación (público)
router.get('/:id', getPublicacion)

// POST /api/publicaciones - Crear publicación (requiere auth)
router.post('/', verifyToken, validatePublicacion, crearPublicacion)

// PUT /api/publicaciones/:id - Actualizar publicación (requiere auth)
router.put('/:id', verifyToken, updatePublicacion)

// DELETE /api/publicaciones/:id - Eliminar publicación (requiere auth)
router.delete('/:id', verifyToken, deletePublicacion)

export default router

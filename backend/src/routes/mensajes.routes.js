import express from 'express'
import {
  enviarMensaje,
  listarMensajes,
  marcarComoLeido
} from '../controllers/mensajes.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { validateMensaje } from '../middlewares/validation.middleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// POST /api/mensajes - Enviar mensaje
router.post('/', validateMensaje, enviarMensaje)

// GET /api/mensajes - Listar mensajes del usuario
router.get('/', listarMensajes)

// PUT /api/mensajes/:id/leido - Marcar mensaje como leído
router.put('/:id/leido', marcarComoLeido)

export default router

import express from 'express'
import {
  crearTransaccion,
  listarTransacciones,
  getTransaccion,
  updateEstadoTransaccion,
  calificarTransaccion
} from '../controllers/transacciones.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { validateTransaccion } from '../middlewares/validation.middleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// POST /api/transacciones - Crear transacción
router.post('/', validateTransaccion, crearTransaccion)

// GET /api/transacciones - Listar transacciones del usuario
router.get('/', listarTransacciones)

// GET /api/transacciones/:id - Obtener una transacción
router.get('/:id', getTransaccion)

// PUT /api/transacciones/:id/estado - Actualizar estado de transacción
router.put('/:id/estado', updateEstadoTransaccion)

// POST /api/transacciones/:id/calificar - Calificar transacción
router.post('/:id/calificar', calificarTransaccion)

export default router

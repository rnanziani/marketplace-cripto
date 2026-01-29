import express from 'express'
import { getPerfil, updatePerfil } from '../controllers/usuarios.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// GET /api/usuarios/perfil - Obtener perfil del usuario autenticado
router.get('/perfil', getPerfil)

// PUT /api/usuarios/perfil - Actualizar perfil del usuario autenticado
router.put('/perfil', updatePerfil)

export default router

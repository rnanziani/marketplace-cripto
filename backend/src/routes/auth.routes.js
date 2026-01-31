import express from 'express'
import { registro, login, verificar, forgotPassword, resetPassword } from '../controllers/auth.controller.js'
import { validateRegistro, validateLogin } from '../middlewares/validation.middleware.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

// POST /api/auth/registro - Registro de nuevo usuario
router.post('/registro', validateRegistro, registro)

// POST /api/auth/login - Inicio de sesión
router.post('/login', validateLogin, login)

// GET /api/auth/verificar - Verificar token (requiere autenticación)
router.get('/verificar', verifyToken, verificar)

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', forgotPassword)

// POST /api/auth/reset-password - Restablecer contraseña con token
router.post('/reset-password', resetPassword)

export default router

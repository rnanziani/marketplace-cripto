import express from 'express'
const router = express.Router()

// TODO: Implementar controladores
// POST /api/auth/registro
router.post('/registro', (req, res) => {
  res.json({ message: 'Endpoint de registro - Por implementar' })
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  res.json({ message: 'Endpoint de login - Por implementar' })
})

// GET /api/auth/verificar
router.get('/verificar', (req, res) => {
  res.json({ message: 'Endpoint de verificación - Por implementar' })
})

export default router

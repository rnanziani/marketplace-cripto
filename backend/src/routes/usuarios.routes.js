import express from 'express'
const router = express.Router()

// TODO: Implementar middleware de autenticación
// TODO: Implementar controladores

// GET /api/usuarios/perfil
router.get('/perfil', (req, res) => {
  res.json({ message: 'Endpoint de perfil - Por implementar' })
})

// PUT /api/usuarios/perfil
router.put('/perfil', (req, res) => {
  res.json({ message: 'Endpoint de actualizar perfil - Por implementar' })
})

export default router

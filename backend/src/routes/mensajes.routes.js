import express from 'express'
const router = express.Router()

// TODO: Implementar middleware de autenticación
// TODO: Implementar controladores

// POST /api/mensajes
router.post('/', (req, res) => {
  res.json({ message: 'Endpoint de enviar mensaje - Por implementar' })
})

// GET /api/mensajes
router.get('/', (req, res) => {
  res.json({ message: 'Endpoint de listar mensajes - Por implementar' })
})

// PUT /api/mensajes/:id/leido
router.put('/:id/leido', (req, res) => {
  res.json({ message: 'Endpoint de marcar como leído - Por implementar' })
})

export default router

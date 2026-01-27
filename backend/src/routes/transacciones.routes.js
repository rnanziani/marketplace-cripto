import express from 'express'
const router = express.Router()

// TODO: Implementar middleware de autenticación
// TODO: Implementar controladores

// POST /api/transacciones
router.post('/', (req, res) => {
  res.json({ message: 'Endpoint de crear transacción - Por implementar' })
})

// GET /api/transacciones
router.get('/', (req, res) => {
  res.json({ message: 'Endpoint de listar transacciones - Por implementar' })
})

// PUT /api/transacciones/:id/estado
router.put('/:id/estado', (req, res) => {
  res.json({ message: 'Endpoint de actualizar estado - Por implementar' })
})

// POST /api/transacciones/:id/calificar
router.post('/:id/calificar', (req, res) => {
  res.json({ message: 'Endpoint de calificar - Por implementar' })
})

export default router

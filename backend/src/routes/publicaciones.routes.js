import express from 'express'
const router = express.Router()

// TODO: Implementar middleware de autenticación
// TODO: Implementar controladores

// GET /api/publicaciones
router.get('/', (req, res) => {
  res.json({ message: 'Endpoint de listar publicaciones - Por implementar' })
})

// GET /api/publicaciones/:id
router.get('/:id', (req, res) => {
  res.json({ message: 'Endpoint de detalle de publicación - Por implementar' })
})

// POST /api/publicaciones
router.post('/', (req, res) => {
  res.json({ message: 'Endpoint de crear publicación - Por implementar' })
})

// PUT /api/publicaciones/:id
router.put('/:id', (req, res) => {
  res.json({ message: 'Endpoint de actualizar publicación - Por implementar' })
})

// DELETE /api/publicaciones/:id
router.delete('/:id', (req, res) => {
  res.json({ message: 'Endpoint de eliminar publicación - Por implementar' })
})

// GET /api/publicaciones/mis-publicaciones
router.get('/mis-publicaciones', (req, res) => {
  res.json({ message: 'Endpoint de mis publicaciones - Por implementar' })
})

export default router

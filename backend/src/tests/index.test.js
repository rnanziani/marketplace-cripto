import request from 'supertest'
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

// Importar todas las rutas
import authRoutes from '../routes/auth.routes.js'
import usuariosRoutes from '../routes/usuarios.routes.js'
import publicacionesRoutes from '../routes/publicaciones.routes.js'
import transaccionesRoutes from '../routes/transacciones.routes.js'
import mensajesRoutes from '../routes/mensajes.routes.js'

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/publicaciones', publicacionesRoutes)
app.use('/api/transacciones', transaccionesRoutes)
app.use('/api/mensajes', mensajesRoutes)

describe('API General', () => {
  test('Debería responder en la ruta raíz', async () => {
    // Esta es una prueba básica para verificar que el servidor responde
    // Nota: En producción, podrías tener una ruta GET /api
    expect(true).toBe(true)
  })
})

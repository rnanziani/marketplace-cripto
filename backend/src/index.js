import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import dotenv from 'dotenv'

// Importar rutas
import authRoutes from './routes/auth.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import publicacionesRoutes from './routes/publicaciones.routes.js'
import transaccionesRoutes from './routes/transacciones.routes.js'
import mensajesRoutes from './routes/mensajes.routes.js'

// Importar conexión a base de datos
import { testConnection } from './database/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS: en producción permitir el origen del frontend (Netlify, etc.)
const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
    : true,
  credentials: true
}
app.use(helmet())
app.use(cors(corsOptions))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/publicaciones', publicacionesRoutes)
app.use('/api/transacciones', transaccionesRoutes)
app.use('/api/mensajes', mensajesRoutes)

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API Marketplace Cripto - Hito 3',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      publicaciones: '/api/publicaciones',
      transacciones: '/api/transacciones',
      mensajes: '/api/mensajes'
    }
  })
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Probar conexión a la base de datos al iniciar
testConnection()

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📚 API disponible en http://localhost:${PORT}/api`)
})

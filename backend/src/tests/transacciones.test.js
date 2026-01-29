import request from 'supertest'
import express from 'express'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

import transaccionesRoutes from '../routes/transacciones.routes.js'

const app = express()
app.use(express.json())
app.use('/api/transacciones', transaccionesRoutes)

describe('Rutas de Transacciones', () => {
  let authToken1 = ''
  let authToken2 = ''
  let publicacionId = null

  beforeAll(async () => {
    // Crear dos usuarios de prueba
    const authApp = express()
    authApp.use(express.json())
    const authRoutes = (await import('../routes/auth.routes.js')).default
    authApp.use('/api/auth', authRoutes)

    const publicacionesApp = express()
    publicacionesApp.use(express.json())
    const publicacionesRoutes = (await import('../routes/publicaciones.routes.js')).default
    publicacionesApp.use('/api/publicaciones', publicacionesRoutes)

    // Usuario 1 (vendedor)
    const user1 = {
      email_00: `vendedor${Date.now()}@test.com`,
      username_00: `vendedor${Date.now()}`,
      password_hash_00: 'password123'
    }

    const registro1 = await request(authApp)
      .post('/api/auth/registro')
      .send(user1)

    const login1 = await request(authApp)
      .post('/api/auth/login')
      .send({
        email_00: user1.email_00,
        password_hash_00: user1.password_hash_00
      })

    authToken1 = login1.body.token

    // Crear publicación
    const publicacion = {
      tipo_02: 'VENTA',
      criptomoneda_02: 'BTC',
      cantidad_02: 1.0,
      precio_unitario_02: 50000,
      moneda_fiat_02: 'USD',
      descripcion_02: 'Venta de Bitcoin'
    }

    const pubResponse = await request(publicacionesApp)
      .post('/api/publicaciones')
      .set('Authorization', `Bearer ${authToken1}`)
      .send(publicacion)

    publicacionId = pubResponse.body.publicacion.id_02

    // Usuario 2 (comprador)
    const user2 = {
      email_00: `comprador${Date.now()}@test.com`,
      username_00: `comprador${Date.now()}`,
      password_hash_00: 'password123'
    }

    const registro2 = await request(authApp)
      .post('/api/auth/registro')
      .send(user2)

    const login2 = await request(authApp)
      .post('/api/auth/login')
      .send({
        email_00: user2.email_00,
        password_hash_00: user2.password_hash_00
      })

    authToken2 = login2.body.token
  })

  describe('POST /api/transacciones', () => {
    test('Debería crear transacción exitosamente (201)', async () => {
      const response = await request(app)
        .post('/api/transacciones')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          publicacion_id_04: publicacionId,
          cantidad_04: 0.5
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('transaccion')
      expect(response.body.transaccion.cantidad_04).toBe('0.5')
    })

    test('Debería fallar sin autenticación (401)', async () => {
      const response = await request(app)
        .post('/api/transacciones')
        .send({
          publicacion_id_04: publicacionId,
          cantidad_04: 0.5
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
    })

    test('Debería fallar con publicación inexistente (404)', async () => {
      const response = await request(app)
        .post('/api/transacciones')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          publicacion_id_04: 99999,
          cantidad_04: 0.5
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
    })

    test('Debería fallar con datos inválidos (400)', async () => {
      const response = await request(app)
        .post('/api/transacciones')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          publicacion_id_04: 'invalid',
          cantidad_04: -1
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/transacciones', () => {
    test('Debería listar transacciones exitosamente (200)', async () => {
      const response = await request(app)
        .get('/api/transacciones')
        .set('Authorization', `Bearer ${authToken2}`)
        .expect('Content-Type', /json/)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('transacciones')
      expect(response.body).toHaveProperty('total')
      expect(Array.isArray(response.body.transacciones)).toBe(true)
    })

    test('Debería fallar sin autenticación (401)', async () => {
      const response = await request(app)
        .get('/api/transacciones')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
    })
  })
})

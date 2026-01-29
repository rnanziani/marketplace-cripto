import request from 'supertest'
import express from 'express'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

import publicacionesRoutes from '../routes/publicaciones.routes.js'

const app = express()
app.use(express.json())
app.use('/api/publicaciones', publicacionesRoutes)

describe('Rutas de Publicaciones', () => {
  let authToken = ''
  let publicacionId = null

  // Primero necesitamos crear un usuario y obtener un token
  beforeAll(async () => {
    // Crear usuario de prueba
    const authApp = express()
    authApp.use(express.json())
    const authRoutes = (await import('../routes/auth.routes.js')).default
    authApp.use('/api/auth', authRoutes)

    const testUser = {
      email_00: `testpub${Date.now()}@test.com`,
      username_00: `testuserpub${Date.now()}`,
      password_hash_00: 'password123'
    }

    // Registrar usuario
    await request(authApp)
      .post('/api/auth/registro')
      .send(testUser)

    // Hacer login
    const loginResponse = await request(authApp)
      .post('/api/auth/login')
      .send({
        email_00: testUser.email_00,
        password_hash_00: testUser.password_hash_00
      })

    authToken = loginResponse.body.token
  })

  describe('GET /api/publicaciones', () => {
    test('Debería listar publicaciones exitosamente (200)', async () => {
      const response = await request(app)
        .get('/api/publicaciones')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('publicaciones')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('limit')
      expect(response.body).toHaveProperty('offset')
      expect(Array.isArray(response.body.publicaciones)).toBe(true)
    })

    test('Debería filtrar publicaciones por tipo (200)', async () => {
      const response = await request(app)
        .get('/api/publicaciones?tipo=VENTA')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('publicaciones')
    })

    test('Debería filtrar publicaciones por criptomoneda (200)', async () => {
      const response = await request(app)
        .get('/api/publicaciones?criptomoneda=BTC')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('publicaciones')
    })
  })

  describe('POST /api/publicaciones', () => {
    test('Debería crear una publicación exitosamente (201)', async () => {
      const nuevaPublicacion = {
        tipo_02: 'VENTA',
        criptomoneda_02: 'BTC',
        cantidad_02: 0.5,
        precio_unitario_02: 50000,
        moneda_fiat_02: 'USD',
        metodos_pago_02: ['Transferencia bancaria', 'PayPal'],
        descripcion_02: 'Venta de Bitcoin',
        ubicacion_02: 'Santiago, Chile'
      }

      const response = await request(app)
        .post('/api/publicaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(nuevaPublicacion)
        .expect('Content-Type', /json/)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('publicacion')
      expect(response.body.publicacion.tipo_02).toBe('VENTA')
      expect(response.body.publicacion.criptomoneda_02).toBe('BTC')
      
      publicacionId = response.body.publicacion.id_02
    })

    test('Debería fallar sin autenticación (401)', async () => {
      const response = await request(app)
        .post('/api/publicaciones')
        .send({
          tipo_02: 'VENTA',
          criptomoneda_02: 'BTC',
          cantidad_02: 0.5,
          precio_unitario_02: 50000
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    test('Debería fallar con datos inválidos (400)', async () => {
      const response = await request(app)
        .post('/api/publicaciones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo_02: 'INVALIDO',
          criptomoneda_02: '',
          cantidad_02: -1,
          precio_unitario_02: 0
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/publicaciones/:id', () => {
    test('Debería obtener detalle de publicación exitosamente (200)', async () => {
      if (publicacionId) {
        const response = await request(app)
          .get(`/api/publicaciones/${publicacionId}`)
          .expect('Content-Type', /json/)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('publicacion')
        expect(response.body.publicacion.id_02).toBe(publicacionId)
      }
    })

    test('Debería fallar con ID inexistente (404)', async () => {
      const response = await request(app)
        .get('/api/publicaciones/99999')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Publicación no encontrada')
    })
  })

  describe('PUT /api/publicaciones/:id', () => {
    test('Debería actualizar publicación exitosamente (200)', async () => {
      if (publicacionId) {
        const response = await request(app)
          .put(`/api/publicaciones/${publicacionId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            descripcion_02: 'Descripción actualizada',
            precio_unitario_02: 51000
          })
          .expect('Content-Type', /json/)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message')
        expect(response.body).toHaveProperty('publicacion')
      }
    })

    test('Debería fallar sin autenticación (401)', async () => {
      if (publicacionId) {
        const response = await request(app)
          .put(`/api/publicaciones/${publicacionId}`)
          .send({
            descripcion_02: 'Descripción actualizada'
          })
          .expect('Content-Type', /json/)

        expect(response.status).toBe(401)
      }
    })
  })

  describe('DELETE /api/publicaciones/:id', () => {
    test('Debería eliminar publicación exitosamente (200)', async () => {
      if (publicacionId) {
        const response = await request(app)
          .delete(`/api/publicaciones/${publicacionId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect('Content-Type', /json/)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message')
      }
    })

    test('Debería fallar sin autenticación (401)', async () => {
      const response = await request(app)
        .delete('/api/publicaciones/1')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
    })
  })
})

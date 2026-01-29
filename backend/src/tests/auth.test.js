import request from 'supertest'
import express from 'express'
import dotenv from 'dotenv'

// Configurar dotenv para tests
dotenv.config({ path: '.env.test' })

// Importar la app (necesitamos exportarla desde index.js)
// Por ahora, vamos a crear una app de prueba
import authRoutes from '../routes/auth.routes.js'

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

describe('Rutas de Autenticación', () => {
  let testUser = {
    email_00: `test${Date.now()}@test.com`,
    username_00: `testuser${Date.now()}`,
    password_hash_00: 'password123',
    telefono_00: '123456789',
    pais_00: 'Chile'
  }

  let authToken = ''

  describe('POST /api/auth/registro', () => {
    test('Debería registrar un nuevo usuario exitosamente (201)', async () => {
      const response = await request(app)
        .post('/api/auth/registro')
        .send(testUser)
        .expect('Content-Type', /json/)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('usuario')
      expect(response.body).toHaveProperty('token')
      expect(response.body.usuario.email_00).toBe(testUser.email_00)
      expect(response.body.usuario.username_00).toBe(testUser.username_00)
    })

    test('Debería fallar con email duplicado (409)', async () => {
      const response = await request(app)
        .post('/api/auth/registro')
        .send(testUser)
        .expect('Content-Type', /json/)

      expect(response.status).toBe(409)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Email ya registrado')
    })

    test('Debería fallar con datos inválidos (400)', async () => {
      const response = await request(app)
        .post('/api/auth/registro')
        .send({
          email_00: 'email-invalido',
          username_00: 'ab', // Muy corto
          password_hash_00: '123' // Muy corta
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('errors')
    })

    test('Debería fallar sin datos requeridos (400)', async () => {
      const response = await request(app)
        .post('/api/auth/registro')
        .send({})
        .expect('Content-Type', /json/)

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    test('Debería hacer login exitosamente (200)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email_00: testUser.email_00,
          password_hash_00: testUser.password_hash_00
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('usuario')
      expect(response.body).toHaveProperty('token')
      expect(response.body.usuario.email_00).toBe(testUser.email_00)
      
      // Guardar el token para otros tests
      authToken = response.body.token
    })

    test('Debería fallar con credenciales incorrectas (401)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email_00: testUser.email_00,
          password_hash_00: 'password-incorrecta'
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Credenciales inválidas')
    })

    test('Debería fallar con email que no existe (401)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email_00: 'noexiste@test.com',
          password_hash_00: 'password123'
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    test('Debería fallar con datos inválidos (400)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email_00: 'email-invalido',
          password_hash_00: ''
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/auth/verificar', () => {
    test('Debería verificar token válido (200)', async () => {
      const response = await request(app)
        .get('/api/auth/verificar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('usuario')
      expect(response.body.usuario.email_00).toBe(testUser.email_00)
    })

    test('Debería fallar sin token (401)', async () => {
      const response = await request(app)
        .get('/api/auth/verificar')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Token no proporcionado')
    })

    test('Debería fallar con token inválido (401)', async () => {
      const response = await request(app)
        .get('/api/auth/verificar')
        .set('Authorization', 'Bearer token-invalido')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })
})

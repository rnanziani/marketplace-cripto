import request from 'supertest'
import express from 'express'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

import usuariosRoutes from '../routes/usuarios.routes.js'

const app = express()
app.use(express.json())
app.use('/api/usuarios', usuariosRoutes)

describe('Rutas de Usuarios', () => {
  let authToken = ''
  let testUser = null

  beforeAll(async () => {
    // Crear usuario de prueba
    const authApp = express()
    authApp.use(express.json())
    const authRoutes = (await import('../routes/auth.routes.js')).default
    authApp.use('/api/auth', authRoutes)

    testUser = {
      email_00: `testuser${Date.now()}@test.com`,
      username_00: `testuser${Date.now()}`,
      password_hash_00: 'password123'
    }

    // Registrar usuario
    const registroResponse = await request(authApp)
      .post('/api/auth/registro')
      .send(testUser)

    testUser.id = registroResponse.body.usuario.id

    // Hacer login
    const loginResponse = await request(authApp)
      .post('/api/auth/login')
      .send({
        email_00: testUser.email_00,
        password_hash_00: testUser.password_hash_00
      })

    authToken = loginResponse.body.token
  })

  describe('GET /api/usuarios/perfil', () => {
    test('Debería obtener perfil exitosamente (200)', async () => {
      const response = await request(app)
        .get('/api/usuarios/perfil')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('usuario')
      expect(response.body.usuario.email_00).toBe(testUser.email_00)
      expect(response.body.usuario.username_00).toBe(testUser.username_00)
    })

    test('Debería fallar sin autenticación (401)', async () => {
      const response = await request(app)
        .get('/api/usuarios/perfil')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Token no proporcionado')
    })

    test('Debería fallar con token inválido (401)', async () => {
      const response = await request(app)
        .get('/api/usuarios/perfil')
        .set('Authorization', 'Bearer token-invalido')
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/usuarios/perfil', () => {
    test('Debería actualizar perfil exitosamente (200)', async () => {
      const response = await request(app)
        .put('/api/usuarios/perfil')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          telefono_00: '987654321',
          pais_00: 'Argentina'
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('usuario')
      expect(response.body.usuario.telefono_00).toBe('987654321')
      expect(response.body.usuario.pais_00).toBe('Argentina')
    })

    test('Debería actualizar username exitosamente (200)', async () => {
      const nuevoUsername = `nuevouser${Date.now()}`
      const response = await request(app)
        .put('/api/usuarios/perfil')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username_00: nuevoUsername
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(200)
      expect(response.body.usuario.username_00).toBe(nuevoUsername)
    })

    test('Debería fallar sin autenticación (401)', async () => {
      const response = await request(app)
        .put('/api/usuarios/perfil')
        .send({
          telefono_00: '123456789'
        })
        .expect('Content-Type', /json/)

      expect(response.status).toBe(401)
    })

    test('Debería fallar sin campos para actualizar (400)', async () => {
      const response = await request(app)
        .put('/api/usuarios/perfil')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect('Content-Type', /json/)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })
})

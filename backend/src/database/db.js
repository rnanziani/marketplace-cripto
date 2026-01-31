import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Función para detectar si estamos en Render (usa DATABASE_URL) o en local
function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    // Render, Heroku, etc.
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // necesario para Render gratuito
      }
    }
  }

  // Configuración local (con variables separadas)
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'marketplacecripto',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
}

const pool = new Pool(getDatabaseConfig())

pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente inactivo', err)
  process.exit(-1)
})

export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now)
    
    if (process.env.DATABASE_URL) {
      console.log('🔌 Usando DATABASE_URL (modo producción)')
    } else {
      console.log(`📊 Base de datos: ${process.env.DB_NAME || 'marketplacecripto'}`)
      console.log(`👤 Usuario: ${process.env.DB_USER || 'postgres'}`)
    }
    return true
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message)
    console.error('\n🔍 Información de diagnóstico:')
    if (process.env.DATABASE_URL) {
      console.error(`   DATABASE_URL: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`)
    } else {
      console.error(`   Host: ${process.env.DB_HOST || 'localhost'}`)
      console.error(`   Puerto: ${process.env.DB_PORT || 5432}`)
      console.error(`   Base de datos: ${process.env.DB_NAME || 'marketplacecripto'}`)
      console.error(`   Usuario: ${process.env.DB_USER || 'postgres'}`)
      console.error(`   Contraseña: ${process.env.DB_PASSWORD ? '***configurada***' : 'NO CONFIGURADA'}`)
    }
    console.error('\n💡 Soluciones:')
    console.error('   1. Verifica credenciales en .env')
    console.error('   2. Asegúrate de que PostgreSQL esté corriendo')
    return false
  }
}

export default pool
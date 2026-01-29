import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'marketplacecripto',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Manejo de errores del pool
pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente inactivo', err)
  process.exit(-1)
})

// Función para probar la conexión
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now)
    console.log(`📊 Base de datos: ${process.env.DB_NAME || 'marketplacecripto'}`)
    console.log(`👤 Usuario: ${process.env.DB_USER || 'postgres'}`)
    return true
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message)
    console.error('\n🔍 Información de diagnóstico:')
    console.error(`   Host: ${process.env.DB_HOST || 'localhost'}`)
    console.error(`   Puerto: ${process.env.DB_PORT || 5432}`)
    console.error(`   Base de datos: ${process.env.DB_NAME || 'marketplacecripto'}`)
    console.error(`   Usuario: ${process.env.DB_USER || 'postgres'}`)
    console.error(`   Contraseña: ${process.env.DB_PASSWORD ? '***configurada***' : 'NO CONFIGURADA'}`)
    console.error('\n💡 Soluciones:')
    console.error('   1. Verifica que la contraseña en .env coincida con la de PostgreSQL')
    console.error('   2. Verifica que PostgreSQL esté corriendo')
    console.error('   3. Prueba la conexión desde DBeaver o psql para confirmar las credenciales')
    return false
  }
}

// Exportar el pool para usar en los controladores
export default pool

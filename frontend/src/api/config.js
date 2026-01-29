/**
 * Configuración de la API para desarrollo y producción.
 * En desarrollo (Vite): usa proxy a localhost:3000 o VITE_API_URL.
 * En producción: debe definirse VITE_API_URL en el servicio de deploy (Netlify, etc.).
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export { API_BASE_URL }

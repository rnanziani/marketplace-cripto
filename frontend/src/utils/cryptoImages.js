/**
 * Utilidad para obtener la URL de la imagen de una criptomoneda.
 * Las imágenes deben estar en: frontend/public/crypto/
 * 
 * Convención de nombres (minúsculas):
 * - BTC → btc.jpg / btc.jpeg
 * - ETH → eth.jpg / eth.jpeg
 * - XRP → xrp.jpg / xrp.jpeg
 * - etc.
 * 
 * Formatos: .jpg, .jpeg, .png, .svg, .webp
 */

const CRYPTO_IMAGES = ['btc', 'eth', 'xrp', 'usdt', 'bnb', 'ada']

/**
 * Devuelve la URL de la imagen de la criptomoneda.
 * Configurado para .jpg (también funciona con .jpeg si renombras).
 * 
 * @param {string} criptomoneda - Código de la cripto (ej: 'BTC', 'XRP')
 * @returns {string} - Ruta a la imagen
 */
export function getCryptoImagePath(criptomoneda) {
  if (!criptomoneda) return null
  const code = criptomoneda.toLowerCase()
  return `/crypto/${code}.jpeg`
}

/**
 * Devuelve la URL de imagen a usar para una publicación.
 * Prioridad: imagen_principal de la API > imagen local por criptomoneda > placeholder
 * 
 * @param {object} publicacion - Objeto con imagen_principal y criptomoneda
 * @returns {string} - URL de la imagen a mostrar
 */
export function getPublicationImageUrl(publicacion) {
  // Si tiene imagen de la API (upload del usuario), usarla
  if (publicacion?.imagen_principal && !publicacion.imagen_principal.includes('placeholder')) {
    return publicacion.imagen_principal
  }
  // Usar imagen local de la criptomoneda
  const cryptoPath = getCryptoImagePath(publicacion?.criptomoneda)
  return cryptoPath || 'https://via.placeholder.com/300?text=CRYPTO'
}

export { CRYPTO_IMAGES }

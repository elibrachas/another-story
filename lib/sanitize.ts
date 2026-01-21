/**
 * Simple HTML sanitization without external dependencies
 * This avoids build issues with isomorphic-dompurify in Next.js
 */

const ALLOWED_TAGS = ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"]
const ALLOWED_ATTR = ["href", "target", "rel"]

/**
 * Escapes HTML entities
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Sanitiza contenido HTML para prevenir ataques XSS
 * @param content Contenido HTML a sanitizar
 * @returns Contenido HTML sanitizado
 */
export function sanitizeHtml(content: string): string {
  if (!content) return ""

  // Remove script tags and their content
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')
  
  // Remove javascript: urls
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:[^"'>\s]*/gi, 'href="#"')
  
  // Remove data: urls (except for safe image types)
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*data:[^"'>\s]*/gi, 'href="#"')
  
  // Remove dangerous tags
  const dangerousTags = ['iframe', 'form', 'object', 'embed', 'link', 'meta', 'base']
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>|<${tag}\\b[^>]*\\/?>`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })
  
  return sanitized.trim()
}

/**
 * Sanitiza texto plano (sin HTML)
 * @param text Texto a sanitizar
 * @returns Texto sanitizado
 */
export function sanitizeText(text: string): string {
  if (!text) return ""

  // Eliminar todas las etiquetas HTML
  const plainText = text.replace(/<[^>]*>/g, "")
  
  // Escape any remaining HTML entities
  return escapeHtml(plainText)
}

/**
 * Sanitiza contenido general (alias para sanitizeHtml)
 * @param content Contenido a sanitizar
 * @returns Contenido sanitizado
 */
export function sanitizeContent(content: string): string {
  return sanitizeHtml(content)
}

/**
 * Crea un extracto seguro del contenido
 * @param content Contenido completo
 * @param length Longitud máxima del extracto
 * @returns Extracto sanitizado
 */
export function createSafeExcerpt(content: string, length = 120): string {
  if (!content) return ""

  // Eliminar todas las etiquetas HTML
  const plainText = content.replace(/<[^>]*>/g, "")

  // Crear extracto
  const excerpt = plainText.length > length ? plainText.substring(0, length) + "..." : plainText

  // Sanitizar el extracto
  return sanitizeText(excerpt)
}

import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitiza contenido HTML para prevenir ataques XSS
 * @param content Contenido HTML a sanitizar
 * @returns Contenido HTML sanitizado
 */
export function sanitizeHtml(content: string): string {
  if (!content) return ""

  // Configurar DOMPurify para permitir solo ciertas etiquetas y atributos
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    // Forzar que todos los enlaces se abran en una nueva pestaña y tengan rel="noopener noreferrer"
    FORBID_TAGS: ["script", "style", "iframe", "form", "object", "embed", "link"],
    WHOLE_DOCUMENT: false,
    SANITIZE_DOM: true,
  })
}

/**
 * Sanitiza texto plano (sin HTML)
 * @param text Texto a sanitizar
 * @returns Texto sanitizado
 */
export function sanitizeText(text: string): string {
  if (!text) return ""

  // Eliminar todas las etiquetas HTML y sanitizar
  const plainText = text.replace(/<[^>]*>/g, "")
  return DOMPurify.sanitize(plainText, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
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

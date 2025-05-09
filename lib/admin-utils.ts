/**
 * Lista de correos electrónicos autorizados como administradores
 */
const ADMIN_EMAILS = ["bracciaforte@gmail.com", "metu26@gmail.com"]

/**
 * Verifica si un correo electrónico está autorizado como administrador
 * @param email Correo electrónico a verificar
 * @returns true si el correo está autorizado como administrador, false en caso contrario
 */
export function isAuthorizedAdmin(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

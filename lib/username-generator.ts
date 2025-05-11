// Lista de adjetivos para generar nombres de usuario
const adjectives = [
  "Anónimo",
  "Misterioso",
  "Secreto",
  "Invisible",
  "Oculto",
  "Discreto",
  "Incógnito",
  "Desconocido",
  "Enigmático",
  "Reservado",
  "Sigiloso",
  "Encubierto",
  "Velado",
  "Confidencial",
  "Privado",
  "Silencioso",
  "Sutil",
  "Cauteloso",
  "Prudente",
  "Astuto",
]

// Lista de sustantivos para generar nombres de usuario
const nouns = [
  "Narrador",
  "Testigo",
  "Observador",
  "Cronista",
  "Relator",
  "Contador",
  "Vocero",
  "Mensajero",
  "Informante",
  "Revelador",
  "Denunciante",
  "Expositor",
  "Comunicador",
  "Portavoz",
  "Reportero",
  "Corresponsal",
  "Escritor",
  "Redactor",
  "Autor",
  "Historiador",
]

/**
 * Genera un nombre de usuario aleatorio
 * @returns Un nombre de usuario aleatorio
 */
export function generateUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]

  // Generar un número aleatorio de dos dígitos (10-99)
  const number = Math.floor(Math.random() * 90) + 10

  // Siempre añadir el número de dos dígitos al final
  return `${adjective}${noun}${number}`
}

/**
 * Genera un nombre de usuario único verificando contra la base de datos
 * @param supabase Cliente de Supabase
 * @returns Un nombre de usuario único
 */
export async function generateUniqueUsername(supabase: any): Promise<string> {
  let isUnique = false
  let username = ""

  while (!isUnique) {
    username = generateUsername()

    // Verificar si el nombre de usuario ya existe
    const { data } = await supabase.from("profiles").select("username").eq("username", username).single()

    isUnique = !data
  }

  return username
}

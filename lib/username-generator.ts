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

// Lista de números para añadir aleatoriedad
const numbers = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

/**
 * Genera un nombre de usuario aleatorio
 * @returns Un nombre de usuario aleatorio
 */
export function generateUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.random() > 0.5 ? numbers[Math.floor(Math.random() * numbers.length)] : ""

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

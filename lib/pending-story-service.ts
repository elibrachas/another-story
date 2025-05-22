// Tipo para la historia pendiente
export interface PendingStory {
  title: string
  content: string
  industry: string
  isAnonymous: boolean
  selectedTags: string[]
  customTags: string[]
  createdAt: number // Timestamp para saber cuándo se creó
  email?: string // Email asociado si está disponible
}

// Clave para almacenar en localStorage
const PENDING_STORY_KEY = "pending_story"
const PENDING_STORY_EMAIL_KEY = "pending_story_email"

// Guardar una historia pendiente
export function savePendingStory(story: Omit<PendingStory, "createdAt">): void {
  try {
    const pendingStory: PendingStory = {
      ...story,
      createdAt: Date.now(),
    }
    localStorage.setItem(PENDING_STORY_KEY, JSON.stringify(pendingStory))
    console.log("Historia pendiente guardada localmente")
  } catch (error) {
    console.error("Error al guardar historia pendiente:", error)
  }
}

// Obtener una historia pendiente
export function getPendingStory(): PendingStory | null {
  try {
    const pendingStoryJson = localStorage.getItem(PENDING_STORY_KEY)
    if (!pendingStoryJson) return null

    const pendingStory = JSON.parse(pendingStoryJson) as PendingStory

    // Verificar si la historia ha expirado (7 días)
    const expirationTime = 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos
    if (Date.now() - pendingStory.createdAt > expirationTime) {
      clearPendingStory()
      return null
    }

    return pendingStory
  } catch (error) {
    console.error("Error al obtener historia pendiente:", error)
    return null
  }
}

// Eliminar una historia pendiente
export function clearPendingStory(): void {
  try {
    localStorage.removeItem(PENDING_STORY_KEY)
    console.log("Historia pendiente eliminada")
  } catch (error) {
    console.error("Error al eliminar historia pendiente:", error)
  }
}

// Guardar el email asociado a una historia pendiente
export function savePendingStoryEmail(email: string): void {
  try {
    localStorage.setItem(PENDING_STORY_EMAIL_KEY, email)
  } catch (error) {
    console.error("Error al guardar email de historia pendiente:", error)
  }
}

// Obtener el email asociado a una historia pendiente
export function getPendingStoryEmail(): string | null {
  try {
    return localStorage.getItem(PENDING_STORY_EMAIL_KEY)
  } catch (error) {
    console.error("Error al obtener email de historia pendiente:", error)
    return null
  }
}

// Eliminar el email asociado a una historia pendiente
export function clearPendingStoryEmail(): void {
  try {
    localStorage.removeItem(PENDING_STORY_EMAIL_KEY)
  } catch (error) {
    console.error("Error al eliminar email de historia pendiente:", error)
  }
}

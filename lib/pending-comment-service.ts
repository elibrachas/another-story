// Tipo para el comentario pendiente
export interface PendingComment {
  storyId: string
  content: string
  isAnonymous: boolean
  createdAt: number // Timestamp para saber cuándo se creó
}

// Clave para almacenar en localStorage
const PENDING_COMMENT_KEY = "pending_comment"

// Guardar un comentario pendiente
export function savePendingComment(comment: Omit<PendingComment, "createdAt">): void {
  try {
    const pendingComment: PendingComment = {
      ...comment,
      createdAt: Date.now(),
    }
    localStorage.setItem(PENDING_COMMENT_KEY, JSON.stringify(pendingComment))
    console.log("Comentario pendiente guardado localmente")
  } catch (error) {
    console.error("Error al guardar comentario pendiente:", error)
  }
}

// Obtener un comentario pendiente
export function getPendingComment(): PendingComment | null {
  try {
    const pendingCommentJson = localStorage.getItem(PENDING_COMMENT_KEY)
    if (!pendingCommentJson) return null

    const pendingComment = JSON.parse(pendingCommentJson) as PendingComment

    // Verificar si el comentario ha expirado (1 hora)
    const expirationTime = 60 * 60 * 1000 // 1 hora en milisegundos
    if (Date.now() - pendingComment.createdAt > expirationTime) {
      clearPendingComment()
      return null
    }

    return pendingComment
  } catch (error) {
    console.error("Error al obtener comentario pendiente:", error)
    return null
  }
}

// Eliminar un comentario pendiente
export function clearPendingComment(): void {
  try {
    localStorage.removeItem(PENDING_COMMENT_KEY)
    console.log("Comentario pendiente eliminado")
  } catch (error) {
    console.error("Error al eliminar comentario pendiente:", error)
  }
}

// Verificar si hay un comentario pendiente para una historia específica
export function hasPendingCommentForStory(storyId: string): boolean {
  const pendingComment = getPendingComment()
  return pendingComment?.storyId === storyId
}

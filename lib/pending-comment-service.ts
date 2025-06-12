export interface PendingComment {
  storyId: string
  content: string
  isAnonymous: boolean
  createdAt: number
}

const PENDING_COMMENT_KEY = "pending_comment"
const PENDING_COMMENT_SUBMISSION_KEY = "pending_comment_submission"

export function savePendingComment(comment: Omit<PendingComment, "createdAt">): void {
  try {
    const pendingComment: PendingComment = {
      ...comment,
      createdAt: Date.now(),
    }
    localStorage.setItem(PENDING_COMMENT_KEY, JSON.stringify(pendingComment))
  } catch (error) {
    console.error("Error al guardar comentario pendiente:", error)
  }
}

export function getPendingComment(): PendingComment | null {
  try {
    const json = localStorage.getItem(PENDING_COMMENT_KEY)
    if (!json) return null

    const pending = JSON.parse(json) as PendingComment

    const expirationTime = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - pending.createdAt > expirationTime) {
      clearPendingComment()
      return null
    }

    return pending
  } catch (error) {
    console.error("Error al obtener comentario pendiente:", error)
    return null
  }
}

export function clearPendingComment(): void {
  try {
    localStorage.removeItem(PENDING_COMMENT_KEY)
  } catch (error) {
    console.error("Error al eliminar comentario pendiente:", error)
  }
}

export function setPendingCommentSubmissionFlag(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(PENDING_COMMENT_SUBMISSION_KEY, "true")
    } else {
      localStorage.removeItem(PENDING_COMMENT_SUBMISSION_KEY)
    }
  } catch (error) {
    console.error("Error al establecer flag de envío pendiente de comentario:", error)
  }
}

export function getPendingCommentSubmissionFlag(): boolean {
  try {
    return localStorage.getItem(PENDING_COMMENT_SUBMISSION_KEY) === "true"
  } catch (error) {
    console.error("Error al obtener flag de envío pendiente de comentario:", error)
    return false
  }
}

export function clearPendingCommentSubmissionFlag(): void {
  try {
    localStorage.removeItem(PENDING_COMMENT_SUBMISSION_KEY)
  } catch (error) {
    console.error("Error al limpiar flag de envío pendiente de comentario:", error)
  }
}

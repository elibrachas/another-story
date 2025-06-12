export interface PendingVote {
  type: 'story' | 'comment'
  id: string
  storyId?: string
}

const PENDING_VOTE_KEY = 'pending_vote'

export function savePendingVote(vote: PendingVote): void {
  try {
    localStorage.setItem(PENDING_VOTE_KEY, JSON.stringify(vote))
  } catch (error) {
    console.error('Error al guardar voto pendiente:', error)
  }
}

export function getPendingVote(): PendingVote | null {
  try {
    const json = localStorage.getItem(PENDING_VOTE_KEY)
    if (!json) return null
    return JSON.parse(json) as PendingVote
  } catch (error) {
    console.error('Error al obtener voto pendiente:', error)
    return null
  }
}

export function clearPendingVote(): void {
  try {
    localStorage.removeItem(PENDING_VOTE_KEY)
  } catch (error) {
    console.error('Error al limpiar voto pendiente:', error)
  }
}

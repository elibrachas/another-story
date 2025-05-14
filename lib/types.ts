export type Story = {
  id: string
  title: string
  content: string
  excerpt?: string
  author: string
  display_name?: string | null
  industry: string
  upvotes: number
  created_at: string
  published: boolean
  user_id?: string
  tags?: Tag[]
  country?: string // Añadimos el país a las historias
}

export type Comment = {
  id: string
  story_id: string
  user_id?: string
  content: string
  author: string
  display_name?: string | null
  upvotes: number
  created_at: string
}

export type AdminComment = Comment & {
  story_title: string
  approved: boolean
}

export type Tag = {
  id: string
  name: string
  description?: string
  created_at?: string
  count?: number // Número de veces que se ha usado la etiqueta
}

export type Profile = {
  id: string
  display_name?: string
  username?: string
  bio?: string
  website?: string
  created_at?: string
  updated_at?: string
  country?: string // Añadimos el campo country
}

export type AdminUser = {
  id: string
  email: string
  username?: string
  created_at: string
  is_admin: boolean
  is_banned: boolean
  stories_count: number
  comments_count: number
}

export type AdminStats = {
  total_stories: number
  pending_stories: number
  total_comments: number
  pending_comments: number
  total_users: number
  new_users_today: number
  total_upvotes: number
  upvotes_today: number
}

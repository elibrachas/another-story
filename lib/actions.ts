"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateUniqueUsername } from "@/lib/username-generator"

export async function createInitialProfile() {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No user found")
    }

    // Verificar si ya existe un perfil para este usuario
    const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (existingProfile) {
      return { success: true } // El perfil ya existe, no es necesario hacer nada
    }

    // Generar un nombre de usuario único
    const username = await generateUniqueUsername(supabase)

    // Crear el perfil inicial
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username: username,
    })

    if (error) {
      console.error("Error creating initial profile:", error)
      throw new Error("Failed to create initial profile")
    }

    revalidatePath("/profile") // O cualquier otra ruta relevante
    return { success: true }
  } catch (error) {
    console.error("Error in createInitialProfile action:", error)
    return { success: false, error: "Failed to create initial profile" }
  }
}

export async function submitStory({
  title,
  content,
  industry,
  isAnonymous,
  tags,
  customTags,
}: {
  title: string
  content: string
  industry: string
  isAnonymous: boolean
  tags: string[]
  customTags: string[]
}) {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No session found")
    }

    const author = isAnonymous ? "Anónimo" : session.user.email || "Anónimo"
    const userId = session.user.id

    // Insertar la historia
    const { data: storyData, error: storyError } = await supabase
      .from("stories")
      .insert({
        title,
        content,
        author,
        industry,
        user_id: userId,
        published: false, // Las historias se envían como no publicadas para revisión
      })
      .select()
      .single()

    if (storyError) {
      console.error("Error submitting story:", storyError)
      throw new Error("Failed to submit story")
    }

    const storyId = storyData.id

    // Asignar etiquetas predefinidas
    if (tags && tags.length > 0) {
      const storyTags = tags.map((tagId) => ({ story_id: storyId, tag_id: tagId }))

      const { error: tagsError } = await supabase.from("story_tags").insert(storyTags)

      if (tagsError) {
        console.error("Error assigning tags to story:", tagsError)
        throw new Error("Failed to assign tags to story")
      }
    }

    // Crear y asignar etiquetas personalizadas
    if (customTags && customTags.length > 0) {
      for (const tagName of customTags) {
        // Verificar si la etiqueta ya existe (para evitar duplicados)
        const { data: existingTag } = await supabase.from("tags").select("*").eq("name", tagName).single()

        let tagId: string

        if (existingTag) {
          // Si la etiqueta existe, usar su ID
          tagId = existingTag.id
        } else {
          // Si no existe, crear la etiqueta
          const { data: newTag, error: newTagError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select()
            .single()

          if (newTagError) {
            console.error("Error creating custom tag:", newTagError)
            throw new Error("Failed to create custom tag")
          }

          tagId = newTag.id
        }

        // Asignar la etiqueta a la historia
        const { error: customTagError } = await supabase.from("story_tags").insert({ story_id: storyId, tag_id: tagId })

        if (customTagError) {
          console.error("Error assigning custom tag to story:", customTagError)
          throw new Error("Failed to assign custom tag to story")
        }
      }
    }

    revalidatePath("/")
    revalidatePath("/submit")
    return { success: true }
  } catch (error) {
    console.error("Error in submitStory action:", error)
    return { success: false, error: "Failed to submit story" }
  }
}

export async function submitComment({
  storyId,
  content,
  isAnonymous,
}: { storyId: string; content: string; isAnonymous: boolean }) {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No session found")
    }

    const author = isAnonymous ? "Anónimo" : session.user.email || "Anónimo"
    const userId = session.user.id

    const { error } = await supabase.from("comments").insert({
      story_id: storyId,
      user_id: userId,
      content,
      author,
    })

    if (error) {
      console.error("Error submitting comment:", error)
      throw new Error("Failed to submit comment")
    }

    revalidatePath(`/story/${storyId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in submitComment action:", error)
    return { success: false, error: "Failed to submit comment" }
  }
}

export async function upvoteStory(storyId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No session found")
    }

    const userId = session.user.id

    // Verificar si el usuario ya votó por esta historia
    const { data: existingVote } = await supabase
      .from("story_upvotes")
      .select("*")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .single()

    if (existingVote) {
      // El usuario ya votó, no hacer nada
      return { success: true }
    }

    // Incrementar el contador de votos en la tabla de historias
    const { error: upvoteError } = await supabase
      .from("stories")
      .update({ upvotes: () => "upvotes + 1" })
      .eq("id", storyId)

    if (upvoteError) {
      console.error("Error upvoting story:", upvoteError)
      throw new Error("Failed to upvote story")
    }

    // Registrar el voto del usuario en la tabla de votos
    const { error: voteRecordError } = await supabase.from("story_upvotes").insert({
      story_id: storyId,
      user_id: userId,
    })

    if (voteRecordError) {
      console.error("Error recording vote:", voteRecordError)
      throw new Error("Failed to record vote")
    }

    revalidatePath("/")
    revalidatePath(`/story/${storyId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in upvoteStory action:", error)
    return { success: false, error: "Failed to upvote story" }
  }
}

export async function upvoteComment(commentId: string, storyId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No session found")
    }

    const userId = session.user.id

    // Verificar si el usuario ya votó por este comentario
    const { data: existingVote } = await supabase
      .from("comment_upvotes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (existingVote) {
      // El usuario ya votó, no hacer nada
      return { success: true }
    }

    // Incrementar el contador de votos en la tabla de comentarios
    const { error: upvoteError } = await supabase
      .from("comments")
      .update({ upvotes: () => "upvotes + 1" })
      .eq("id", commentId)

    if (upvoteError) {
      console.error("Error upvoting comment:", upvoteError)
      throw new Error("Failed to upvote comment")
    }

    // Registrar el voto del usuario en la tabla de votos
    const { error: voteRecordError } = await supabase.from("comment_upvotes").insert({
      comment_id: commentId,
      user_id: userId,
    })

    if (voteRecordError) {
      console.error("Error recording vote:", voteRecordError)
      throw new Error("Failed to record vote")
    }

    revalidatePath(`/story/${storyId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in upvoteComment action:", error)
    return { success: false, error: "Failed to upvote comment" }
  }
}

export async function updateProfile({
  displayName,
  bio,
  website,
  regenerateUsername,
}: { displayName?: string; bio?: string; website?: string; regenerateUsername?: boolean }) {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No session found")
    }

    const userId = session.user.id

    const updateData: { display_name?: string; bio?: string; website?: string; username?: string } = {}

    if (displayName !== undefined) {
      updateData.display_name = displayName
    }
    if (bio !== undefined) {
      updateData.bio = bio
    }
    if (website !== undefined) {
      updateData.website = website
    }

    if (regenerateUsername) {
      const username = await generateUniqueUsername(supabase)
      updateData.username = username
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

    if (error) {
      console.error("Error updating profile:", error)
      throw new Error("Failed to update profile")
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error in updateProfile action:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

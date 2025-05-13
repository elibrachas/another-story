"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Función para enviar una historia
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

    const userId = session.user.id

    // Verificar si el usuario es administrador y obtener su perfil
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("admin, username, display_name")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error checking profile:", profileError)
      throw new Error("Failed to check user profile")
    }

    const isAdmin = profileData?.admin || false
    const username = profileData?.username || "Anónimo"
    const displayName = profileData?.display_name || null

    // Si no es administrador, verificar el límite diario de historias
    if (!isAdmin) {
      // Obtener la fecha actual en formato ISO (YYYY-MM-DD)
      const today = new Date().toISOString().split("T")[0]

      // Consultar cuántas historias ha publicado el usuario hoy
      const { data: storiesCount, error: countError } = await supabase
        .from("stories")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)

      if (countError) {
        console.error("Error counting daily stories:", countError)
        throw new Error("Failed to check daily story limit")
      }

      // Verificar si el usuario ha alcanzado el límite diario (3 historias)
      if ((storiesCount?.length || 0) >= 3) {
        return {
          success: false,
          error: "Has alcanzado el límite de 3 historias por día. Intenta de nuevo mañana.",
        }
      }
    }

    // Usar el nombre de usuario o "Anónimo" si se seleccionó anónimo
    const author = isAnonymous ? "Anónimo" : username

    // Insertar la historia con el nombre visible si existe y no es anónimo
    const { data: storyData, error: storyError } = await supabase
      .from("stories")
      .insert({
        title,
        content,
        author,
        display_name: isAnonymous ? null : displayName, // Incluir el nombre visible si no es anónimo
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

// Función para dar upvote a una historia
export async function upvoteStory(storyId: string) {
  const supabase = createServerActionClient({ cookies })
  console.log(`[upvoteStory] Iniciando proceso para story_id: ${storyId}`)

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("[upvoteStory] No hay sesión activa")
      throw new Error("No session found")
    }

    const userId = session.user.id
    console.log(`[upvoteStory] Usuario: ${userId}`)

    // Verificar si el usuario ya votó por esta historia
    console.log(`[upvoteStory] Verificando si el usuario ya votó`)
    const { data: existingVote, error: checkError } = await supabase
      .from("upvotes")
      .select("*")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 es el código para "no se encontró ningún registro"
      console.error("[upvoteStory] Error al verificar voto existente:", checkError)
      return { success: false, error: "Error al verificar voto existente" }
    }

    // Si el usuario ya votó, no hacer nada y devolver éxito
    if (existingVote) {
      console.log("[upvoteStory] El usuario ya había votado por esta historia")
      return { success: true, alreadyVoted: true }
    }

    // Simplemente insertar el voto - el trigger se encargará de actualizar el contador
    console.log(`[upvoteStory] Registrando voto en la tabla upvotes`)
    const { error: insertError } = await supabase.from("upvotes").insert({
      story_id: storyId,
      user_id: userId,
    })

    if (insertError) {
      console.error("[upvoteStory] Error al registrar voto:", insertError)
      return { success: false, error: "Error al registrar el voto" }
    }

    // Obtener el nuevo contador de votos
    console.log(`[upvoteStory] Obteniendo contador actualizado`)
    const { data: updatedStory, error: fetchError } = await supabase
      .from("stories")
      .select("upvotes")
      .eq("id", storyId)
      .single()

    if (fetchError) {
      console.error("[upvoteStory] Error al obtener contador actualizado:", fetchError)
    } else {
      console.log(`[upvoteStory] Nuevo contador: ${updatedStory?.upvotes}`)
    }

    // Revalidar las rutas para que se actualicen los datos
    console.log(`[upvoteStory] Revalidando rutas`)
    revalidatePath("/")
    revalidatePath(`/story/${storyId}`)

    return {
      success: true,
      newUpvoteCount: updatedStory?.upvotes || null,
    }
  } catch (error) {
    console.error("[upvoteStory] Error general:", error)
    return { success: false, error: "Error al procesar el voto" }
  }
}

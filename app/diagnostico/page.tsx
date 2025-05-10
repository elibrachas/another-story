"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function DiagnosticoPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [profileInfo, setProfileInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingWrite, setIsTestingWrite] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error al obtener la sesión:", error)
          setSessionInfo({ error: error.message })
        } else {
          setSessionInfo(data.session)

          if (data.session?.user?.id) {
            // Obtener información del perfil
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.session.user.id)
              .single()

            if (profileError) {
              console.error("Error al obtener el perfil:", profileError)
              setProfileInfo({ error: profileError.message })
            } else {
              setProfileInfo(profileData)
            }
          }
        }
      } catch (error) {
        console.error("Error inesperado:", error)
        setSessionInfo({ error: "Error inesperado al verificar la sesión" })
      }
    }

    checkSession()
  }, [supabase])

  const testReadConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Intentar leer datos de la tabla stories
      const { data, error } = await supabase.from("stories").select("id, title").limit(1)

      if (error) {
        console.error("Error al leer datos:", error)
        setTestResult(`Error de lectura: ${error.message}`)
      } else {
        setTestResult(`Lectura exitosa. Datos: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setTestResult("Error inesperado al probar la conexión de lectura")
    } finally {
      setIsLoading(false)
    }
  }

  const testWriteConnection = async () => {
    if (!sessionInfo?.user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para probar la escritura",
        variant: "destructive",
      })
      return
    }

    setIsTestingWrite(true)
    setTestResult(null)

    try {
      // Crear un registro temporal para probar la escritura
      const testData = {
        title: `Test ${new Date().toISOString()}`,
        content: "Este es un test de conexión",
        author: "Sistema de Diagnóstico",
        industry: "Tecnología",
        user_id: sessionInfo.user.id,
        published: false,
      }

      const { data, error } = await supabase.from("stories").insert(testData).select()

      if (error) {
        console.error("Error al escribir datos:", error)
        setTestResult(`Error de escritura: ${error.message}`)
      } else {
        setTestResult(`Escritura exitosa. ID creado: ${data[0]?.id}`)

        // Eliminar el registro de prueba
        const { error: deleteError } = await supabase.from("stories").delete().eq("id", data[0]?.id)

        if (deleteError) {
          console.error("Error al eliminar registro de prueba:", deleteError)
        }
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setTestResult("Error inesperado al probar la conexión de escritura")
    } finally {
      setIsTestingWrite(false)
    }
  }

  const testAdminApproval = async () => {
    if (!profileInfo?.admin) {
      toast({
        title: "Error",
        description: "Debes ser administrador para probar esta función",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      // Crear una historia de prueba
      const testData = {
        title: `Historia de prueba ${new Date().toISOString()}`,
        content: "Esta es una historia de prueba para verificar la aprobación",
        author: "Sistema de Diagnóstico",
        industry: "Tecnología",
        user_id: sessionInfo.user.id,
        published: false,
      }

      // Insertar la historia
      const { data: storyData, error: storyError } = await supabase.from("stories").insert(testData).select()

      if (storyError) {
        console.error("Error al crear historia de prueba:", storyError)
        setTestResult(`Error al crear historia de prueba: ${storyError.message}`)
        return
      }

      const storyId = storyData[0]?.id

      // Intentar aprobar la historia
      const { data, error } = await supabase.from("stories").update({ published: true }).eq("id", storyId).select()

      if (error) {
        console.error("Error al aprobar historia:", error)
        setTestResult(`Error al aprobar historia: ${error.message}`)
      } else {
        setTestResult(`Aprobación exitosa. Historia actualizada: ${JSON.stringify(data)}`)

        // Eliminar la historia de prueba
        const { error: deleteError } = await supabase.from("stories").delete().eq("id", storyId)

        if (deleteError) {
          console.error("Error al eliminar historia de prueba:", deleteError)
        }
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setTestResult("Error inesperado al probar la aprobación de historias")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Diagnóstico de Conexión Supabase</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información de Sesión</CardTitle>
          <CardDescription>Datos de la sesión actual</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionInfo ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">{JSON.stringify(sessionInfo, null, 2)}</pre>
          ) : (
            <p>Cargando información de sesión...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Perfil</CardTitle>
          <CardDescription>Datos del perfil del usuario</CardDescription>
        </CardHeader>
        <CardContent>
          {profileInfo ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">{JSON.stringify(profileInfo, null, 2)}</pre>
          ) : (
            <p>Cargando información de perfil...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pruebas de Conexión</CardTitle>
          <CardDescription>Verificar la conexión con Supabase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testReadConnection} disabled={isLoading}>
              Probar Lectura
            </Button>
            <Button onClick={testWriteConnection} disabled={isTestingWrite}>
              Probar Escritura
            </Button>
            {profileInfo?.admin && (
              <Button onClick={testAdminApproval} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                Probar Aprobación Admin
              </Button>
            )}
          </div>

          {testResult && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Resultado:</h3>
              <p className="whitespace-pre-wrap">{testResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

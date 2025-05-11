"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"

export default function DebugUpvotesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { session } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    // Redirigir si no hay sesión
    if (!session) {
      router.push("/")
      return
    }

    async function fetchDebugData() {
      try {
        setLoading(true)
        const response = await fetch("/api/debug/upvotes")

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("Error fetching debug data:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchDebugData()
  }, [session, router])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Cargando información de depuración...</h1>
        <div className="animate-pulse h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="animate-pulse h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="animate-pulse h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Error al cargar información de depuración</h1>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Depuración de Upvotes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tabla upvotes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Total de registros: {data?.upvotes?.count || 0}</p>

            <h3 className="font-semibold mt-4 mb-2">Últimos 10 registros:</h3>
            {data?.upvotes?.records?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">ID</th>
                      <th className="text-left py-2">Story ID</th>
                      <th className="text-left py-2">User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upvotes.records.map((record: any) => (
                      <tr key={record.id} className="border-b">
                        <td className="py-2">{record.id}</td>
                        <td className="py-2">{record.story_id}</td>
                        <td className="py-2">{record.user_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No hay registros en la tabla upvotes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabla stories (primeros 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.stories?.records?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">ID</th>
                      <th className="text-left py-2">Título</th>
                      <th className="text-left py-2">Upvotes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stories.records.map((story: any) => (
                      <tr key={story.id} className="border-b">
                        <td className="py-2">{story.id}</td>
                        <td className="py-2">{story.title}</td>
                        <td className="py-2">{story.upvotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No hay historias disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tus upvotes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Total de historias que has votado: {data?.userUpvotes?.count || 0}</p>

          {data?.userUpvotes?.storyIds?.length > 0 ? (
            <div>
              <h3 className="font-semibold mt-4 mb-2">IDs de historias votadas:</h3>
              <div className="flex flex-wrap gap-2">
                {data.userUpvotes.storyIds.map((storyId: string) => (
                  <span key={storyId} className="bg-gray-700 px-2 py-1 rounded text-sm">
                    {storyId}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No has votado por ninguna historia</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4">
        <Button onClick={() => window.location.reload()}>Actualizar datos</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Volver a la página principal
        </Button>
      </div>
    </div>
  )
}

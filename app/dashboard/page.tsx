import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tu Panel</h1>
        <Link href="/submit">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Historia
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tus Historias</CardTitle>
          <CardDescription>Gestiona tus historias enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          {stories && stories.length > 0 ? (
            <div className="divide-y">
              {stories.map((story) => (
                <div key={story.id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{story.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Enviada el {new Date(story.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          story.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        }`}
                      >
                        {story.published ? "Publicada" : "Pendiente de Revisión"}
                      </span>
                      {story.published && (
                        <Link href={`/story/${story.id}`}>
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aún no has enviado ninguna historia.</p>
              <Link href="/submit">
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Comparte tu Primera Historia</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

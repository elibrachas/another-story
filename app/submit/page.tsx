import { SubmitForm } from "@/components/submit-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllTags } from "@/lib/supabase-server"

export default async function SubmitPage() {
  const tags = await getAllTags()

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Comparte tu Historia</CardTitle>
          <CardDescription>
            Tu historia será revisada antes de ser publicada. Todas las historias son anónimas por defecto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmitForm tags={tags} />
        </CardContent>
      </Card>
    </div>
  )
}

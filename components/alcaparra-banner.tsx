import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export function AlcaparraBanner() {
  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
              Recomendado
            </span>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Pasa el filtro ATS y destaca en la entrevista
        </h3>

        <p className="text-muted-foreground text-sm mb-4 flex-grow">
          Optimiza tu CV para ATS, haz match con el puesto y practica entrevistas con IA. Sin inventar datos.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="https://www.alcaparra.co/" target="_blank" rel="noopener noreferrer" className="w-full">
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
            >
              Analizar mi CV
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <span className="text-xs text-center text-muted-foreground">
            3 creditos gratis - sin tarjeta
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

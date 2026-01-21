import { Button } from "@/components/ui/button"
import { FileText, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export function AlcaparraStoryBanner() {
  return (
    <div className="w-full rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start md:items-center gap-3 flex-1">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg shrink-0">
            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                Recomendado
              </span>
            </div>
            <p className="text-sm md:text-base font-medium text-foreground">
              Optimiza tu CV para ATS y practica entrevistas con IA
            </p>
            <p className="text-xs text-muted-foreground mt-1 hidden md:block">
              3 creditos gratis - sin tarjeta
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-stretch md:items-end gap-1">
          <Link 
            href="https://www.alcaparra.co/?utm_source=cronicas_laborales&utm_medium=story_banner&utm_campaign=story_page" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button 
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-medium"
              size="sm"
            >
              Analizar mi CV
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <span className="text-xs text-center md:text-right text-muted-foreground md:hidden">
            3 creditos gratis - sin tarjeta
          </span>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, Linkedin, Youtube } from "lucide-react"

export const metadata = {
  title: "Sobre Nosotros | Crónicas Laborales",
  description: "Conoce más sobre Crónicas Laborales y su misión",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const themeColor = [
  { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  { media: "(prefers-color-scheme: dark)", color: "#000000" },
]

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Acerca de Crónicas Laborales</h1>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h2 className="text-2xl font-semibold mt-8 mb-4">¿Por qué creé este sitio?</h2>
        <p>
          En el ámbito laboral todos hemos vivido o escuchado situaciones que nos dejan desconcertados, frustrados o
          incluso dolidos. Como trabajadora y emprendedora, he experimentado y conocido de cerca cómo las dinámicas
          tóxicas pueden afectar profundamente a las personas y a sus carreras profesionales.
        </p>
        <p>
          Empecé contando algunas de estas historias en TikTok, pero rápidamente me llegaron muchas más de las que podía
          compartir en videos. Por eso decidí crear "Crónicas Laborales", un espacio seguro y anónimo donde todas estas
          historias reales puedan ser publicadas, permitiéndonos reflexionar y aprender juntos. Creo firmemente en que
          hablar sobre estas experiencias no solo ayuda a quienes las han vivido, sino que también impulsa un cambio
          positivo en la cultura laboral.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Sobre mí</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
          <div className="w-full md:w-1/3 max-w-[250px] mx-auto md:mx-0">
            <img src="/images/eliana.jpeg" alt="Eliana Bracciaforte" className="rounded-lg shadow-md w-full h-auto" />
          </div>
          <div className="w-full md:w-2/3">
            <p>
              Eliana Bracciaforte es emprendedora en tecnología y una de las voces más influyentes del mundo del trabajo
              y el liderazgo en América Latina. Cofundó Workana, la plataforma de trabajo independiente más grande de la
              región. Tiene doble titulación en Administración de Empresas, un MBA del IAE Business School y es
              profesora de Liderazgo en la Universidad de San Andrés. Fue oradora en TEDx Córdoba (Argentina) en 2019 y
              apareció en la portada de la revista Forbes (Argentina) en abril de 2023. Como miembro de la comunidad
              LGBT, aboga por la diversidad y la inclusión en el mundo de los negocios. Además, es fanática de los
              videojuegos, la lectura y el cine.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Nuestra Misión</h2>
        <p>Nuestra misión es crear un espacio seguro donde las personas puedan:</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Compartir experiencias laborales negativas sin miedo a represalias</li>
          <li>Encontrar apoyo en una comunidad que ha pasado por situaciones similares</li>
          <li>Aprender a identificar entornos laborales tóxicos</li>
          <li>Descubrir estrategias para afrontar situaciones difíciles en el trabajo</li>
          <li>Contribuir a crear conciencia sobre problemas laborales comunes</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Privacidad y Anonimato</h2>
        <p>Entendemos la importancia de proteger tu identidad cuando compartes experiencias sensibles. Por eso:</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Utilizamos nombres de usuario generados aleatoriamente</li>
          <li>Nunca mostramos información personal identificable</li>
          <li>Recomendamos omitir detalles específicos que puedan identificar a personas o empresas</li>
          <li>Moderamos el contenido para eliminar información sensible</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Normas de la Comunidad</h2>
        <p>Para mantener un espacio seguro y constructivo, pedimos a todos los usuarios que:</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Sean respetuosos en sus comentarios</li>
          <li>Eviten mencionar nombres reales de personas o empresas</li>
          <li>Se abstengan de usar lenguaje discriminatorio o abusivo</li>
          <li>Compartan experiencias verídicas y no ficticias</li>
          <li>Respeten la privacidad de los demás usuarios</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Conecta conmigo</h2>
        <p>
          Si tienes preguntas, sugerencias o inquietudes sobre la plataforma, o simplemente quieres seguir mi contenido,
          te invito a conectar conmigo en mis redes sociales. Allí comparto regularmente reflexiones sobre el mundo
          laboral, liderazgo y emprendimiento.
        </p>

        <div className="flex flex-wrap gap-4 my-4">
          <a
            href="https://www.tiktok.com/@elibrachas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-brand-tiktok"
            >
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
            </svg>
            TikTok
          </a>
          <a
            href="https://www.instagram.com/elibrachas/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <Instagram size={20} />
            Instagram
          </a>
          <a
            href="https://www.youtube.com/@elibrachas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <Youtube size={20} />
            YouTube
          </a>
          <a
            href="https://www.linkedin.com/in/bracciaforte/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <Linkedin size={20} />
            LinkedIn
          </a>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Explorar Historias
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

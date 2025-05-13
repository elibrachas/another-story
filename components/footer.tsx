import Link from "next/link"
import { Instagram, Linkedin, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Crónicas Laborales. Todos los derechos reservados.
            </p>
          </div>

          {/* Links apilados en móvil, en línea en desktop */}
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6 items-center md:items-start">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Historias
            </Link>
            <Link href="/sobre-nosotros" className="text-sm text-muted-foreground hover:text-foreground">
              Sobre nosotros
            </Link>
            <Link href="/politica-de-privacidad" className="text-sm text-muted-foreground hover:text-foreground">
              Política de Privacidad
            </Link>
            <Link href="/politica-de-cookies" className="text-sm text-muted-foreground hover:text-foreground">
              Política de Cookies
            </Link>
            <Link href="/terminos-de-servicio" className="text-sm text-muted-foreground hover:text-foreground">
              Términos de Servicio
            </Link>
          </div>

          {/* Iconos de redes sociales */}
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a
              href="https://www.tiktok.com/@elibrachas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-purple-500 transition-colors"
              aria-label="TikTok"
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
            </a>
            <a
              href="https://www.instagram.com/elibrachas/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-purple-500 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.youtube.com/@elibrachas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-purple-500 transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/bracciaforte/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-purple-500 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Crónicas Laborales. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Historias
            </Link>
            <Link href="/acerca-de" className="text-sm text-muted-foreground hover:text-foreground">
              Acerca de
            </Link>
            <Link href="/politica-de-privacidad" className="text-sm text-muted-foreground hover:text-foreground">
              Política de Privacidad
            </Link>
            <Link href="/terminos-de-servicio" className="text-sm text-muted-foreground hover:text-foreground">
              Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

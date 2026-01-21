import Link from "next/link"
import { createServerComponentClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import { UserNav } from "@/components/user-nav"

export async function Navbar() {
  const supabase = createServerComponentClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">Crónicas de Trabajos Tóxicos</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Inicio
            </Link>
            <Link href="/acerca-de" className="text-sm font-medium transition-colors hover:text-primary">
              Acerca de
            </Link>
          </nav>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <div className="hidden md:block">
            <SearchBar />
          </div>
          {session ? (
            <>
              <Link href="/nueva-historia">
                <Button>Compartir Historia</Button>
              </Link>
              <UserNav session={session} />
            </>
          ) : (
            <Link href="/auth">
              <Button>Iniciar Sesión</Button>
            </Link>
          )}
        </div>
      </div>
      <div className="md:hidden border-t py-2">
        <div className="container mx-auto px-4">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}

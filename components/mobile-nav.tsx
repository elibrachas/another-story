"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { SearchBar } from "@/components/search-bar"

interface MobileNavProps {
  session: any | null
  isAdmin: boolean
}

export function MobileNav({ session, isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col gap-4 pt-8">
        <nav className="flex flex-col gap-4">
          <Link href="/" onClick={() => setOpen(false)} className="text-sm font-medium">
            Historias
          </Link>
          <Link href="/sobre-nosotros" onClick={() => setOpen(false)} className="text-sm font-medium">
            Sobre nosotros
          </Link>
          <Link
            href="https://www.galernaweb.com/productos/renuncio-eliana-bracciaforte/?utm_source=cronicaslaborales&utm_medium=topmenu&utm_campaign=renuncio"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="text-sm font-medium"
          >
            Mi libro: RENUNCIO
          </Link>
          {session && (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium">
              Panel
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="text-sm font-medium">
              Admin
            </Link>
          )}
        </nav>
        <div>
          <SearchBar />
        </div>
      </SheetContent>
    </Sheet>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LoginDialog } from "@/components/login-dialog"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User, Shield } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"
import { SearchBar } from "@/components/search-bar"
import { useTheme } from "next-themes"

export default function Header() {
  const { session, supabase } = useSupabase()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { theme } = useTheme()

  // Verificar si el usuario actual es administrador
  useEffect(() => {
    async function checkAdminStatus() {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

          if (error) {
            console.error("Error al verificar estado de administrador:", error)
            setIsAdmin(false)
            return
          }

          setIsAdmin(data?.is_admin || false)
        } catch (error) {
          console.error("Error al verificar estado de administrador:", error)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [session, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo_cronicas.png"
            alt="Crónicas Laborales Logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="font-bold text-xl hidden sm:inline">Crónicas Laborales</span>
        </Link>

        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Historias
          </Link>
          <Link href="/acerca-de" className="text-sm font-medium transition-colors hover:text-primary">
            Acerca de
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchBar />
          </div>
          <ModeToggle />

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white">
                    {session.user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:inline">Cuenta</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Panel
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowLoginDialog(true)}>
                Iniciar sesión
              </Button>
              <Link href="/auth">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="md:hidden border-t py-2">
        <div className="container mx-auto px-4">
          <SearchBar />
        </div>
      </div>
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </header>
  )
}

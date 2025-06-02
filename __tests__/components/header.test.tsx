import type React from "react"
import { render, screen } from "@testing-library/react"
import Header from "@/components/header"

// Mock de los hooks y componentes necesarios
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock("@/lib/supabase-provider", () => ({
  useSupabase: () => ({
    session: null,
    supabase: {
      auth: {
        signOut: jest.fn(),
      },
    },
  }),
}))

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: jest.fn(),
  }),
}))

describe("Header Component", () => {
  it("renders the logo and site name", () => {
    render(<Header />)

    // Verificar que el logo y el nombre del sitio estén presentes
    expect(screen.getByAltText("Crónicas Laborales Logo")).toBeInTheDocument()
    expect(screen.getByText("Crónicas Laborales")).toBeInTheDocument()
  })

  it("renders navigation links", () => {
    render(<Header />)

    // Verificar que los enlaces de navegación estén presentes
    expect(screen.getByText("Historias")).toBeInTheDocument()
    expect(screen.getByText("Sobre nosotros")).toBeInTheDocument()
  })

  it("renders login buttons when user is not authenticated", () => {
    render(<Header />)

    // Verificar que los botones de inicio de sesión estén presentes
    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument()
    expect(screen.getByText("Registrarse")).toBeInTheDocument()
  })
})

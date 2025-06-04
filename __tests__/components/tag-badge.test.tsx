import type React from "react"
import { render, screen } from "@testing-library/react"
import { TagBadge } from "@/components/tag-badge"

// Mock de next/link para simplificar el DOM en pruebas
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe("TagBadge", () => {
  test("renderiza correctamente el nombre de la etiqueta", () => {
    render(<TagBadge tag={{ id: "acoso", name: "Acoso" }} />)
    expect(screen.getByText("Acoso")).toBeInTheDocument()
  })

  test("enlaza hacia la página correcta", () => {
    render(<TagBadge tag={{ id: "123", name: "Discriminación" }} />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/tags/123")
  })

  test("aplica las clases de estilo por defecto", () => {
    const { container } = render(<TagBadge tag={{ id: "1", name: "Mobbing" }} />)
    const badge = container.querySelector("div")
    expect(badge).toHaveClass(
      "bg-purple-800",
      "text-purple-100",
      "hover:bg-purple-700",
      "border-purple-700",
      "cursor-pointer"
    )
  })
})

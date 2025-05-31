import { render, screen } from "@testing-library/react"
import { TagBadge } from "@/components/tag-badge"

describe("TagBadge", () => {
  test("renderiza correctamente el nombre de la etiqueta", () => {
    render(<TagBadge tag={{ id: "acoso", name: "Acoso" }} />)
    expect(screen.getByText("Acoso")).toBeInTheDocument()
  })

  test("enlaza a la ruta correcta", () => {
    render(<TagBadge tag={{ id: "discriminacion", name: "Discriminación" }} />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/tags/discriminacion")
  })

  test("aplica las clases de estilo predeterminadas", () => {
    const { container } = render(<TagBadge tag="Mobbing" />)
    const badge = container.querySelector("a > div")
    expect(badge).toHaveClass("bg-purple-800")
    expect(badge).toHaveClass("border-purple-700")
  })
})

import { render, screen } from "@testing-library/react"
import { TagBadge } from "@/components/tag-badge"

describe("TagBadge", () => {
  test("renderiza correctamente el nombre de la etiqueta", () => {
    render(<TagBadge name="Acoso" />)
    expect(screen.getByText("Acoso")).toBeInTheDocument()
  })

  test("aplica la clase de tamaño correcta", () => {
    const { container } = render(<TagBadge name="Discriminación" size="sm" />)
    // Verificamos que el elemento tenga la clase de tamaño pequeño
    expect(container.firstChild).toHaveClass("text-xs")
  })

  test("aplica la variante correcta", () => {
    const { container } = render(<TagBadge name="Mobbing" variant="outline" />)
    // Verificamos que el elemento tenga la clase de variante outline
    expect(container.firstChild).toHaveClass("border")
  })
})

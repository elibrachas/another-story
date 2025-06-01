import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SubmitForm } from "@/components/submit-form"
import { submitStory } from "@/lib/actions"

// Mock de Select para simplificar la interacción en pruebas
jest.mock("@/components/ui/select", () => {
  const React = require("react")
  return {
    Select: ({ value, onValueChange, children, ...props }: any) => (
      <select
        value={value}
        onChange={(e) => onValueChange && onValueChange((e.target as HTMLSelectElement).value)}
        {...props}
      >
        {children}
      </select>
    ),
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: ({ placeholder }: any) => (
      <option value="" disabled>
        {placeholder}
      </option>
    ),
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => (
      <option value={value}>{children}</option>
    ),
  }
})

// Mock de las dependencias
jest.mock("@/lib/actions", () => ({
  submitStory: jest.fn(),
}))

// Mock para el router de Next.js
const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock para el hook de toast
const mockToast = jest.fn()
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

// Mock para el proveedor de Supabase
jest.mock("@/lib/supabase-provider", () => ({
  useSupabase: () => ({
    session: { user: { id: "test-user-id" } },
  }),
}))

describe("SubmitForm", () => {
  const mockTags = [
    { id: "1", name: "Acoso", count: 10 },
    { id: "2", name: "Discriminación", count: 5 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("muestra errores de validación cuando faltan campos obligatorios", async () => {
    render(<SubmitForm tags={mockTags} />)

    // Intentar enviar el formulario sin completar campos obligatorios
    fireEvent.click(screen.getByText("Enviar Historia"))

    // Verificar que se muestran los mensajes de error
    await waitFor(() => {
      expect(screen.getByText("El título es obligatorio")).toBeInTheDocument()
      expect(screen.getByText("El contenido de la historia es obligatorio")).toBeInTheDocument()
      expect(screen.getByText("Debes seleccionar una industria")).toBeInTheDocument()
    })

    // Verificar que no se llamó a submitStory
    expect(submitStory).not.toHaveBeenCalled()
  })

  test("envía el formulario correctamente cuando todos los campos están completos", async () => {
    // Mock de respuesta exitosa
    ;(submitStory as jest.Mock).mockResolvedValue({ success: true })

    render(<SubmitForm tags={mockTags} />)

    // Completar los campos obligatorios
    fireEvent.change(
      screen.getByPlaceholderText("Dale a tu historia un título impactante"),
      {
        target: { value: "Mi historia tóxica" },
      },
    )

    // Seleccionar industria
    const industrySelect = screen.getByRole("combobox")
    fireEvent.change(industrySelect, { target: { value: "Tecnología" } })

    // Completar el contenido
    fireEvent.change(
      screen.getByPlaceholderText("Comparte tu experiencia..."),
      {
        target: { value: "Contenido de la historia..." },
      },
    )

    // Enviar el formulario
    fireEvent.click(screen.getByText("Enviar Historia"))

    // Verificar que se llamó a submitStory con los parámetros correctos
    await waitFor(() => {
      expect(submitStory).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Mi historia tóxica",
          content: "Contenido de la historia...",
          industry: "Tecnología",
          isAnonymous: false,
        }),
      )
    })

    // Verificar que se muestra el mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText("¡Historia enviada con éxito!")).toBeInTheDocument()
    })
  })
})

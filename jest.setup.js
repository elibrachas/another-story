// Importa las extensiones de Jest para DOM
import "@testing-library/jest-dom"

// Mock para Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock para el proveedor de Supabase
jest.mock("@/lib/supabase-provider", () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        signOut: jest.fn().mockResolvedValue({}),
      },
    },
    session: null,
  }),
}))

// Mock para el hook de toast
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Silencia los warnings de console.error durante las pruebas
const originalConsoleError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("React does not recognize the") ||
      args[0].includes("Warning: An update to") ||
      args[0].includes("Warning: validateDOMNesting"))
  ) {
    return
  }
  originalConsoleError(...args)
}

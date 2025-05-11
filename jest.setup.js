// Importa las extensiones de Jest para DOM
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// Mock global para window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock para Next.js router
jest.mock("next/navigation", () => require("./__mocks__/next-navigation-mock.js"))

// Mock para el proveedor de Supabase
jest.mock("@/lib/supabase-provider", () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        signOut: jest.fn().mockResolvedValue({}),
      },
      from: () => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((callback) => Promise.resolve(callback({ data: [], error: null }))),
      }),
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

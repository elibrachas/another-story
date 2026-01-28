import { submitStory } from "@/lib/actions"

const createServerClientMock = jest.fn()

jest.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => createServerClientMock(...args),
}))

jest.mock("next/headers", () => ({
  cookies: () => ({
    getAll: jest.fn().mockReturnValue([]),
    set: jest.fn(),
  }),
}))

type SupabaseBuilderResult = {
  data: { id: string } | null
  error: null
}

const createBuilder = (result: SupabaseBuilderResult) => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue(result),
  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  then: (resolve: (value: SupabaseBuilderResult) => void, reject: (reason?: unknown) => void) =>
    Promise.resolve(result).then(resolve, reject),
})

const createSupabaseMock = () => {
  const builderResult = { data: { id: "story-123" }, error: null }
  return {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn().mockImplementation(() => createBuilder(builderResult)),
  }
}

describe("submitStory", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("submits a story when getUser returns a user", async () => {
    const supabaseMock = createSupabaseMock()
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    })
    supabaseMock.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    createServerClientMock.mockReturnValue(supabaseMock)

    const formData = new FormData()
    formData.append("title", "Test Story")
    formData.append(
      "content",
      "Este es un contenido de prueba suficientemente largo para pasar la validacion.",
    )
    formData.append("tags", "[]")

    const result = await submitStory(formData)

    expect(result.success).toBe(true)
  })

  it("falls back to session when getUser fails", async () => {
    const supabaseMock = createSupabaseMock()
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Auth session missing" },
    })
    supabaseMock.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: "user-456" } } },
      error: null,
    })
    createServerClientMock.mockReturnValue(supabaseMock)

    const formData = new FormData()
    formData.append("title", "Historia con fallback")
    formData.append(
      "content",
      "Contenido suficientemente largo para validar el flujo de autenticacion con fallback.",
    )
    formData.append("tags", "[]")

    const result = await submitStory(formData)

    expect(result.success).toBe(true)
  })

  it("returns auth error when no session is available", async () => {
    const supabaseMock = createSupabaseMock()
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Auth session missing" },
    })
    supabaseMock.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    createServerClientMock.mockReturnValue(supabaseMock)

    const formData = new FormData()
    formData.append("title", "Historia sin sesion")
    formData.append(
      "content",
      "Contenido suficientemente largo para validar el flujo sin sesion autenticada.",
    )
    formData.append("tags", "[]")

    const result = await submitStory(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Debes estar autenticado para enviar una historia")
  })
})

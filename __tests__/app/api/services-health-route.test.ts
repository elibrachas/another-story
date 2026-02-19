import { GET } from "@/app/api/services/v1/health/route"

describe("GET /api/services/v1/health", () => {
  it("returns service health payload", async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      ok: true,
      service: "invoice-extractor",
      version: "v1",
    })
  })
})

import { verifyServiceToken } from "@/lib/services/auth/service-token"

describe("verifyServiceToken", () => {
  const originalToken = process.env.SERVICE_API_TOKEN

  afterEach(() => {
    process.env.SERVICE_API_TOKEN = originalToken
  })

  it("returns true when bearer token is valid", () => {
    process.env.SERVICE_API_TOKEN = "test-secret-token"
    expect(verifyServiceToken("Bearer test-secret-token")).toBe(true)
  })

  it("returns false when bearer token is invalid", () => {
    process.env.SERVICE_API_TOKEN = "test-secret-token"
    expect(verifyServiceToken("Bearer wrong-token")).toBe(false)
  })

  it("returns false when token is missing", () => {
    process.env.SERVICE_API_TOKEN = "test-secret-token"
    expect(verifyServiceToken(null)).toBe(false)
  })
})

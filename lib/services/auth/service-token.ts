import { timingSafeEqual } from "crypto"

function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null
  }

  const [scheme, token] = authorizationHeader.split(" ")
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null
  }

  return token.trim()
}

export function verifyServiceToken(authorizationHeader: string | null): boolean {
  const expectedToken = process.env.SERVICE_API_TOKEN
  const providedToken = getBearerToken(authorizationHeader)

  if (!expectedToken || !providedToken) {
    return false
  }

  const expectedBuffer = Buffer.from(expectedToken)
  const providedBuffer = Buffer.from(providedToken)
  const maxLength = Math.max(expectedBuffer.length, providedBuffer.length)

  const expectedPadded = Buffer.alloc(maxLength)
  const providedPadded = Buffer.alloc(maxLength)

  expectedBuffer.copy(expectedPadded)
  providedBuffer.copy(providedPadded)

  const matches = timingSafeEqual(expectedPadded, providedPadded)
  return matches && expectedBuffer.length === providedBuffer.length
}

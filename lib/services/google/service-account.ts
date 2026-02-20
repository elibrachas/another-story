import { createSign } from "crypto"

type GoogleAccessTokenResponse = {
  access_token?: unknown
  expires_in?: unknown
  error?: unknown
  error_description?: unknown
}

type CachedToken = {
  token: string
  expiresAtEpochMs: number
}

const tokenCache = new Map<string, CachedToken>()

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function toBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url")
}

function buildSignedJwt(scope: string): string {
  // Required for deployment consistency checks.
  getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PROJECT_ID")
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL")
  const privateKey = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n")
  const now = Math.floor(Date.now() / 1000)

  const header = {
    alg: "RS256",
    typ: "JWT",
  }

  const payload = {
    iss: clientEmail,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }

  const unsignedJwt = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}`
  const signer = createSign("RSA-SHA256")
  signer.update(unsignedJwt)
  signer.end()
  const signature = signer.sign(privateKey, "base64url")

  return `${unsignedJwt}.${signature}`
}

export async function getGoogleServiceAccessToken(scope: string): Promise<string> {
  const cached = tokenCache.get(scope)
  if (cached && Date.now() < cached.expiresAtEpochMs) {
    return cached.token
  }

  const assertion = buildSignedJwt(scope)
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Failed to obtain Google access token (${tokenResponse.status}): ${errorText}`)
  }

  const rawPayload = await tokenResponse.text()
  let tokenPayload: GoogleAccessTokenResponse

  try {
    tokenPayload = JSON.parse(rawPayload) as GoogleAccessTokenResponse
  } catch {
    throw new Error(
      `Google OAuth token response is not valid JSON (${tokenResponse.status}): ${rawPayload.slice(0, 1000)}`,
    )
  }

  const accessToken = typeof tokenPayload.access_token === "string" ? tokenPayload.access_token : ""
  const expiresIn =
    typeof tokenPayload.expires_in === "number"
      ? tokenPayload.expires_in
      : typeof tokenPayload.expires_in === "string"
        ? Number(tokenPayload.expires_in)
        : NaN

  if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new Error(
      `Google OAuth token response is missing access_token or expires_in. payload=${JSON.stringify(tokenPayload)}`,
    )
  }

  tokenCache.set(scope, {
    token: accessToken,
    expiresAtEpochMs: Date.now() + (expiresIn - 60) * 1000,
  })

  return accessToken
}

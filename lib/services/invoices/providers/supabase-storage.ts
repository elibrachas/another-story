import { createClient } from "@supabase/supabase-js"

export type DownloadedStorageFile = {
  buffer: Buffer
  mimeType: string
}

let cachedClient: ReturnType<typeof createClient> | null = null

function getSupabaseStorageClient() {
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error("Missing required environment variable: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY")
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return cachedClient
}

function normalizeStorageObjectPath(bucket: string, rawPath: string): string {
  let normalized = rawPath.trim()
  if (!normalized) {
    throw new Error("storage_path is required")
  }

  normalized = normalized.replace(/\\/g, "/")
  try {
    normalized = decodeURIComponent(normalized)
  } catch {
    // keep raw value when path is not URI-encoded
  }
  normalized = normalized.split("?")[0] ?? normalized
  normalized = normalized.split("#")[0] ?? normalized

  if (/^https?:\/\//i.test(normalized)) {
    const url = new URL(normalized)
    normalized = url.pathname
  }

  normalized = normalized.replace(/^\/+/, "")

  const pathPrefixes = [
    "storage/v1/object/public/",
    "storage/v1/object/authenticated/",
    "storage/v1/object/sign/",
    "storage/v1/object/",
    "storage/files/buckets/",
  ]

  for (const prefix of pathPrefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length)
      break
    }
  }

  const bucketPrefix = `${bucket}/`
  if (normalized.startsWith(bucketPrefix)) {
    normalized = normalized.slice(bucketPrefix.length)
  }

  const bucketsPrefix = `buckets/${bucket}/`
  if (normalized.startsWith(bucketsPrefix)) {
    normalized = normalized.slice(bucketsPrefix.length)
  }

  normalized = normalized.replace(/^\/+/, "")
  if (normalized === bucket) {
    throw new Error("storage_path must include the object name (not only the bucket path)")
  }
  if (!normalized) {
    throw new Error("storage_path resolved to an empty object path")
  }

  return normalized
}

export async function downloadPdfFromSupabaseStorage(
  storageBucket: string,
  storagePath: string,
): Promise<DownloadedStorageFile> {
  const bucket = storageBucket.trim()
  if (!bucket) {
    throw new Error("storage_bucket is required")
  }

  const objectPath = normalizeStorageObjectPath(bucket, storagePath)
  const client = getSupabaseStorageClient()
  const { data, error } = await client.storage.from(bucket).download(objectPath)

  if (error || !data) {
    const statusCode =
      error && typeof error === "object" && "status" in error && typeof error.status === "number"
        ? error.status
        : "unknown"
    const message = error?.message || "unknown storage error"
    throw new Error(
      `Failed to download file from Supabase Storage (${statusCode}) [bucket=${bucket}, path=${objectPath}]: ${message}`,
    )
  }

  const fileBuffer = Buffer.from(await data.arrayBuffer())
  if (fileBuffer.length === 0) {
    throw new Error(`Downloaded file from Supabase Storage is empty [bucket=${bucket}, path=${objectPath}]`)
  }

  return {
    buffer: fileBuffer,
    mimeType: data.type || "application/pdf",
  }
}

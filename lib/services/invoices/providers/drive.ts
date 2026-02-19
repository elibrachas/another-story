import { getGoogleServiceAccessToken } from "@/lib/services/google/service-account"

export type DownloadedDriveFile = {
  buffer: Buffer
  mimeType: string
}

export async function downloadPdfFromGoogleDrive(fileId: string): Promise<DownloadedDriveFile> {
  if (!fileId) {
    throw new Error("drive_file_id is required")
  }

  const scope = process.env.GOOGLE_DRIVE_SCOPE || "https://www.googleapis.com/auth/drive.readonly"
  const accessToken = await getGoogleServiceAccessToken(scope)
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to download file from Google Drive (${response.status}): ${errorText}`)
  }

  const mimeType = response.headers.get("content-type") || "application/pdf"
  const fileBuffer = Buffer.from(await response.arrayBuffer())
  if (fileBuffer.length === 0) {
    throw new Error("Downloaded file from Google Drive is empty")
  }

  return {
    buffer: fileBuffer,
    mimeType,
  }
}

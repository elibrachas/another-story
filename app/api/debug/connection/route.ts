import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "online",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Error al verificar conexión",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

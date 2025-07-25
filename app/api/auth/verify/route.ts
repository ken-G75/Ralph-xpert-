import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "ralph-xpert-secret-key-2025"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as any

    return NextResponse.json({
      success: true,
      data: { username: decoded.username, loginTime: decoded.loginTime },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
  }
}

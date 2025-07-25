import { type NextRequest, NextResponse } from "next/server"
import { validateAdmin } from "@/lib/db"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "ralph-xpert-secret-key-2025"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 })
    }

    const isValid = validateAdmin(username, password)

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = sign({ username, loginTime: new Date().toISOString() }, JWT_SECRET, { expiresIn: "24h" })

    const response = NextResponse.json({
      success: true,
      data: { username, token },
      message: "Login successful",
    })

    // Set HTTP-only cookie
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

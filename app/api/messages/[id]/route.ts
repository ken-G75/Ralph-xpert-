import { type NextRequest, NextResponse } from "next/server"
import { getMessages, saveMessage } from "@/lib/db"

export async function GET() {
  try {
    const messages = getMessages()
    return NextResponse.json({
      success: true,
      data: messages,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nom, email, telephone, sujet, message } = await request.json()

    if (!nom || !email || !sujet || !message) {
      return NextResponse.json({ success: false, error: "Required fields are missing" }, { status: 400 })
    }

    const newMessage = saveMessage({
      nom,
      email,
      telephone: telephone || "",
      sujet,
      message,
    })

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: "Message saved successfully",
    })
  } catch (error) {
    console.error("Save message error:", error)
    return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 })
  }
}

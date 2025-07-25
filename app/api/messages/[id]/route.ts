import { type NextRequest, NextResponse } from "next/server"
import { updateMessage, deleteMessage } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const { id } = params

    const updated = updateMessage(id, updates)

    if (!updated) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Message updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update message" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const deleted = deleteMessage(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete message" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { updateContact, deleteContact } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nom, numeroComplet } = await request.json()
    const { id } = params

    if (!nom || !numeroComplet) {
      return NextResponse.json({ success: false, error: "Name and number are required" }, { status: 400 })
    }

    const updated = updateContact(id, {
      nom: `${nom} (RXP)`,
      numeroComplet,
    })

    if (!updated) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Contact updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update contact" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const deleted = deleteContact(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete contact" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getContacts, saveContact, deleteAllContacts } from "@/lib/db"

export async function GET() {
  try {
    const contacts = getContacts()
    return NextResponse.json({
      success: true,
      data: contacts,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nom, codePays, numero } = await request.json()

    if (!nom || !codePays || !numero) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Add (RXP) suffix automatically
    const contactData = {
      nom: `${nom} (RXP)`,
      numeroComplet: `${codePays} ${numero}`,
    }

    const newContact = saveContact(contactData)

    return NextResponse.json({
      success: true,
      data: newContact,
      message: "Contact saved successfully",
    })
  } catch (error) {
    console.error("Save contact error:", error)
    return NextResponse.json({ success: false, error: "Failed to save contact" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    deleteAllContacts()
    return NextResponse.json({
      success: true,
      message: "All contacts deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete contacts" }, { status: 500 })
  }
}

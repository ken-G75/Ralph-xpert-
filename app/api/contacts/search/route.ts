import { type NextRequest, NextResponse } from "next/server"
import { getContacts } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ success: false, error: "Search query is required" }, { status: 400 })
    }

    const contacts = getContacts()
    const filteredContacts = contacts.filter(
      (contact) => contact.nom.toLowerCase().includes(query.toLowerCase()) || contact.numeroComplet.includes(query),
    )

    return NextResponse.json({
      success: true,
      data: filteredContacts,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to search contacts" }, { status: 500 })
  }
}

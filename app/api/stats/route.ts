import { NextResponse } from "next/server"
import { getContacts, getMessages } from "@/lib/db"
import type { Stats } from "@/lib/types"

export async function GET() {
  try {
    const contacts = getContacts()
    const messages = getMessages()

    const today = new Date().toDateString()

    const todayContacts = contacts.filter((c) => new Date(c.timestamp).toDateString() === today).length

    const todayMessages = messages.filter((m) => new Date(m.timestamp).toDateString() === today).length

    const readMessages = messages.filter((m) => m.read).length
    const readRate = messages.length > 0 ? Math.round((readMessages / messages.length) * 100) : 0

    const stats: Stats = {
      totalContacts: contacts.length,
      totalMessages: messages.length,
      newMessages: messages.filter((m) => !m.read).length,
      readMessages,
      todayContacts,
      todayMessages,
      readRate,
    }

    // Get recent contacts for homepage
    const recentContacts = contacts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
      .map((contact) => ({
        nom: contact.nom,
        numero: contact.numeroComplet,
      }))

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        recentEntries: recentContacts,
        objectifPourcent: Math.min(Math.round((contacts.length / 2000) * 100), 100),
      },
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
  }
}

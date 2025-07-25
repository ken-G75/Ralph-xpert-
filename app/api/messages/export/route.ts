import { NextResponse } from "next/server"
import { generateMessagesCSV } from "@/lib/db"

export async function GET() {
  try {
    const csvContent = generateMessagesCSV()

    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ralph_xpert_messages_${new Date().toISOString().split("T")[0]}.csv"`,
        "Cache-Control": "no-cache",
      },
    })

    return response
  } catch (error) {
    console.error("CSV generation error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate CSV file" }, { status: 500 })
  }
}

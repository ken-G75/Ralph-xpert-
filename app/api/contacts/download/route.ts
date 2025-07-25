import { NextResponse } from "next/server"
import { generateVCF } from "@/lib/db"

export async function GET() {
  try {
    const vcfContent = generateVCF()

    const response = new NextResponse(vcfContent, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="ralph_xpert_contacts_${new Date().toISOString().split("T")[0]}.vcf"`,
        "Cache-Control": "no-cache",
      },
    })

    return response
  } catch (error) {
    console.error("VCF generation error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate VCF file" }, { status: 500 })
  }
}

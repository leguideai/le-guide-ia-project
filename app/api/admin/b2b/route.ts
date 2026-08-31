import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: b2bRequests, error } = await supabaseServer
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("B2B requests fetch warning:", error.message)
      return NextResponse.json({ success: true, requests: [] })
    }

    const mapped = (b2bRequests || []).map((r: any) => ({
      ...r,
      sector: r.sector || r.service_type || "Formation B2B",
      employees: r.employees || r.company_size || "10-50",
      needs: r.needs || r.message || "Formation & Audit IA",
      phone: r.phone || ""
    }))

    return NextResponse.json({ success: true, requests: mapped })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { requestId, status } = await req.json()

    if (!requestId || !status) {
      return NextResponse.json({ error: "requestId et status requis." }, { status: 400 })
    }

    // Map French or display status to valid DB constraint if needed
    const statusMap: Record<string, string> = {
      "Nouveau": "new",
      "Contacté": "contacted",
      "Devis Envoyé": "quoted",
      "Gagné": "won",
      "Perdu": "lost"
    }
    const dbStatus = statusMap[status] || status

    const { data, error } = await supabaseServer
      .from("service_requests")
      .update({ status: dbStatus })
      .eq("id", requestId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: data, message: `Statut B2B mis à jour : ${status}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

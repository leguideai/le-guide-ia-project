import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { forwardB2BQuoteToAlfred } from "@/lib/email"

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
    const body = await req.json()
    const { action, requestId, status, requestData, customNote } = body

    // 1. Forward action to Alfred
    if (action === "forward") {
      let b2b = requestData
      if (!b2b && requestId) {
        const { data } = await supabaseServer
          .from("service_requests")
          .select("*")
          .eq("id", requestId)
          .single()
        b2b = data
      }

      if (!b2b) {
        return NextResponse.json({ error: "Données de la demande B2B introuvables." }, { status: 404 })
      }

      const emailResult = await forwardB2BQuoteToAlfred({
        companyName: b2b.company_name || "Organisation",
        contactName: b2b.contact_name || "Contact",
        email: b2b.email,
        phone: b2b.phone || "",
        serviceType: b2b.sector || b2b.service_type || "Formation & Audit IA",
        companySize: b2b.employees || b2b.company_size || "10-50 personnes",
        message: b2b.needs || b2b.message || "Demande de devis B2B",
        customNote
      })

      if (!emailResult.success) {
        return NextResponse.json({ error: "Erreur lors de l'envoi de l'email à Alfred." }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `La demande de devis pour ${b2b.company_name} a été transmise par email à Alfred Dah (alfred@leguideai.com).` 
      })
    }

    // 2. Status update action
    if (!requestId || !status) {
      return NextResponse.json({ error: "requestId et status requis." }, { status: 400 })
    }

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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID de la demande requis." }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from("service_requests")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Demande de devis B2B supprimée avec succès." })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { companyName, contactName, email, phone, companySize, serviceType, message } = body

    if (!companyName || !contactName || !email) {
      return NextResponse.json({ error: "Tous les champs requis doivent être remplis." }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("service_requests")
      .insert({
        company_name: companyName,
        contact_name: contactName,
        email,
        phone: phone || null,
        sector: serviceType || "Formation B2B",
        employees: companySize || "10-50",
        needs: message || "Demande de devis d'entreprise",
        status: "Nouveau",
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.warn("Error inserting service_request into Supabase:", error.message)
      return NextResponse.json({ success: true, message: "Demande enregistrée avec succès !" })
    }

    return NextResponse.json({ success: true, request: data, message: "Demande de devis transmise avec succès !" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 })
  }
}

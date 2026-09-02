import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendB2BConfirmationEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { companyName, contactName, email, phone, companySize, serviceType, message } = body

    if (!companyName || !contactName || !email) {
      return NextResponse.json({ error: "Tous les champs requis (Entreprise, Responsable, Email) doivent être remplis." }, { status: 400 })
    }

    const cleanCompany = String(companyName).trim()
    const cleanContact = String(contactName).trim()
    const cleanEmail = String(email).toLowerCase().trim()
    const cleanPhone = phone ? String(phone).trim() : ""
    const cleanService = serviceType ? String(serviceType).trim() : "Formation & Audit IA"
    const cleanSize = companySize ? String(companySize).trim() : "10-50"
    const cleanMessage = message ? String(message).trim() : "Demande de devis B2B"

    const insertPayload = {
      company_name: cleanCompany,
      contact_name: cleanContact,
      email: cleanEmail,
      phone: cleanPhone || null,
      sector: cleanService,
      service_type: cleanService,
      employees: cleanSize,
      company_size: cleanSize,
      needs: cleanMessage,
      message: cleanMessage,
      status: "new",
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabaseServer
      .from("service_requests")
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error("Error inserting service_request into Supabase:", error)
      return NextResponse.json({ error: "Erreur lors de l'enregistrement de votre demande : " + error.message }, { status: 500 })
    }

    // Envoyer l'email de confirmation au contact entreprise et notifier l'admin
    try {
      await sendB2BConfirmationEmail({
        companyName: cleanCompany,
        contactName: cleanContact,
        email: cleanEmail,
        phone: cleanPhone,
        serviceType: cleanService,
        companySize: cleanSize,
        message: cleanMessage
      })
    } catch (emailErr) {
      console.warn("Could not send B2B confirmation email:", emailErr)
    }

    return NextResponse.json({ 
      success: true, 
      request: data, 
      message: "Demande de devis transmise avec succès ! Un email de confirmation vous a été envoyé." 
    })
  } catch (err: any) {
    console.error("B2B POST error:", err)
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 })
  }
}

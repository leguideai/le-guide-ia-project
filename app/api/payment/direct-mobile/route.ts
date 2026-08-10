import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  try {
    const { courseSlug, courseTitle, price, fullName, email, whatsapp, country, transactionRef, mobileOperator } = await req.json()

    if (!email || !fullName || !courseSlug) {
      return NextResponse.json({ message: "Champs obligatoires manquants." }, { status: 400 })
    }

    const refCommand = `LGI-MM-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Save registration in Supabase
    const { data: registration, error: regError } = await supabaseServer
      .from("registrations")
      .upsert({
        full_name: fullName,
        email: email.toLowerCase(),
        whatsapp,
        country,
        source: "checkout_mobile_direct",
        status: "inscrit",
      }, { onConflict: "email" })
      .select("id")
      .single()

    if (regError) {
      console.error("Error creating registration:", regError)
    }

    // Save payment record in Supabase
    const { data: payment, error: payError } = await supabaseServer
      .from("payments")
      .insert({
        registration_id: registration?.id || null,
        amount: price || 99000,
        currency: "XOF",
        method: `mobile_direct_${mobileOperator || "wave"}`,
        status: "pending_verification",
        transaction_ref: transactionRef || refCommand,
      })
      .select("id")
      .single()

    if (payError) {
      console.error("Error creating payment record:", payError)
    }

    // Send confirmation email via Resend if available
    if (resend) {
      try {
        await resend.emails.send({
          from: "Le Guide IA <contact@leguideai.com>",
          to: [email.toLowerCase()],
          subject: `Confirmation de votre demande d'inscription - ${courseTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
              <h2 style="color: #0284c7;">Merci pour votre inscription à Le Guide IA !</h2>
              <p>Bonjour <strong>${fullName}</strong>,</p>
              <p>Nous avons bien reçu votre confirmation de dépôt <strong>Mobile Money (${mobileOperator || "Wave / Orange Money"})</strong> avec la référence : <code>${transactionRef || "N/A"}</code>.</p>
              <div style="background-color: #f1f5f9; padding: 16px; rounded: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Récapitulatif de votre commande :</h4>
                <ul>
                  <li><strong>Formation :</strong> ${courseTitle}</li>
                  <li><strong>Montant :</strong> ${price ? price.toLocaleString() : "99 000"} FCFA</li>
                  <li><strong>Référence de transaction :</strong> ${transactionRef || refCommand}</li>
                </ul>
              </div>
              <p>Votre accès à l'Espace Membre Dashboard est activé. Vous pouvez dès maintenant accéder au sommaire et aux ressources du Bootcamp.</p>
              <p style="margin-top: 30px;"><a href="https://leguideai.com/dashboard" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accéder à mon Espace Membre</a></p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="font-size: 12px; color: #64748b;">Le Guide IA — Équipe Support & Formation</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error("Failed to send direct mobile email:", emailErr)
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://leguideai.com")

    return NextResponse.json({
      success: true,
      ref: refCommand,
      redirectUrl: `${baseUrl}/checkout/success?ref=${refCommand}&method=mobile_direct`,
    })

  } catch (error: any) {
    console.error("Mobile Direct payment error:", error)
    return NextResponse.json({ message: error.message || "Erreur serveur." }, { status: 500 })
  }
}

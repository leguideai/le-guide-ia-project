import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { sendPaymentConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, dial, whatsapp, country, method } = body as {
      name: string;
      email: string;
      dial: string;
      whatsapp: string;
      country: string;
      method: string;
    };

    if (!name?.trim() || !email?.trim() || !dial || !whatsapp?.trim() || !country || !method) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const fullWhatsapp = `${dial}${whatsapp.replace(/\D/g, "")}`;
    const supabase = createServerClient();

    const { data: byEmail } = await supabase
      .from("registrations")
      .select("id, status")
      .eq("email", trimmedEmail)
      .maybeSingle();

    const { data: byPhone } = !byEmail
      ? await supabase
          .from("registrations")
          .select("id, status")
          .eq("whatsapp", fullWhatsapp)
          .maybeSingle()
      : { data: null };

    const existing = byEmail ?? byPhone;
    let registrationId: string;

    if (existing) {
      await supabase.from("registrations").update({ status: "chaud" }).eq("id", existing.id);
      registrationId = existing.id;
    } else {
      const { data: newReg, error: regError } = await supabase
        .from("registrations")
        .insert({ full_name: name.trim(), email: trimmedEmail, whatsapp: fullWhatsapp, country: country || null, source: "site", status: "chaud" })
        .select("id")
        .single();

      if (regError || !newReg) {
        console.error("Supabase registration error:", regError);
        return NextResponse.json({ error: "Erreur lors de la création de l inscription." }, { status: 500 });
      }
      registrationId = newReg.id;
    }

    const { error: payError } = await supabase.from("payments").insert({
      registration_id: registrationId,
      method,
      status: "pending",
      currency: "XOF",
    });

    if (payError) {
      console.error("Supabase payment error:", payError);
      return NextResponse.json({ error: "Erreur lors de l enregistrement du paiement." }, { status: 500 });
    }

    // Envoi de l'email de confirmation de réception de paiement
    await sendPaymentConfirmationEmail(name.trim(), trimmedEmail, method);

    return NextResponse.json({ success: true, message: "Paiement enregistré pour vérification. Un email de confirmation vous a été envoyé." });
  } catch (error: unknown) {
    console.error("Payment confirmation error:", error);
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

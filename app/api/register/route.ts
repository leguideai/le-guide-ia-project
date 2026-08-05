import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { sendRegistrationEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, dial, whatsapp, country, profil } = body as {
      name: string;
      email: string;
      dial: string;
      whatsapp: string;
      country: string;
      profil: string;
    };

    if (!name?.trim() || !email?.trim() || !dial || !whatsapp?.trim() || !profil) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const fullWhatsapp = `${dial}${whatsapp.replace(/\D/g, "")}`;
    const supabase = createServerClient();

    const { data: byEmail } = await supabase
      .from("registrations")
      .select("id, email, whatsapp, profil")
      .eq("email", trimmedEmail)
      .maybeSingle();

    const { data: byPhone } = !byEmail
      ? await supabase
          .from("registrations")
          .select("id, email, whatsapp, profil")
          .eq("whatsapp", fullWhatsapp)
          .maybeSingle()
      : { data: null };

    const existing = byEmail ?? byPhone;

    if (existing) {
      if (!existing.profil) {
        await supabase.from("registrations").update({ profil }).eq("id", existing.id);
        return NextResponse.json({ success: true, message: "Votre profil a été mis à jour avec succès." });
      }
      if (existing.email === trimmedEmail) {
        return NextResponse.json({ error: "Cette adresse email est déjà inscrite au Bootcamp.", field: "email" }, { status: 409 });
      }
      return NextResponse.json({ error: "Ce numéro WhatsApp est déjà inscrit au Bootcamp.", field: "whatsapp" }, { status: 409 });
    }

    const { error } = await supabase.from("registrations").insert({
      full_name: name.trim(),
      email: trimmedEmail,
      whatsapp: fullWhatsapp,
      country: country || null,
      profil,
      source: "site",
      status: "inscrit",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Une erreur est survenue lors de l inscription." }, { status: 500 });
    }

    // Envoi de l'email de confirmation via Resend
    await sendRegistrationEmail(name.trim(), trimmedEmail);

    return NextResponse.json({ success: true, message: "Inscription enregistrée avec succès. Un email de confirmation vous a été envoyé." });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

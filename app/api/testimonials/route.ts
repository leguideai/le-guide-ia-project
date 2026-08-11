import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

const DEFAULT_TESTIMONIALS = [
  {
    id: "1",
    name: "Sanson Alfred Dah",
    role: "Auditeur CISA & Expert IA",
    country: "Burkina Faso",
    text: "Le Bootcamp m'a permis d'automatiser 60% des tâches répétitives de mon cabinet. Un gain de temps inestimable pour mes audits."
  },
  {
    id: "2",
    name: "Khadija Sy",
    role: "Directrice E-Marketing",
    country: "Sénégal",
    text: "Grâce aux fiches de prompts et à la maîtrise de ChatGPT & Midjourney, nous avons multiplié notre création de contenu par 4 en 1 mois."
  },
  {
    id: "3",
    name: "Marc-Aurèle Kouassi",
    role: "Consultant & Formateur",
    country: "Côte d'Ivoire",
    text: "Une formation 100% pratique ! Les replays et l'accès à l'Espace Membre me permettent de réviser chaque atelier à mon rythme."
  },
  {
    id: "4",
    name: "Amadou Sow",
    role: "Entrepreneur Tech",
    country: "Mali",
    text: "L'intégration des agents IA métiers avec Make m'a aidé à structurer l'assistance client de ma startup en moins de 48 heures."
  }
]

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: true })

    if (error || !data || data.length === 0) {
      return NextResponse.json({ testimonials: DEFAULT_TESTIMONIALS })
    }

    return NextResponse.json({ testimonials: data })
  } catch (err) {
    return NextResponse.json({ testimonials: DEFAULT_TESTIMONIALS })
  }
}

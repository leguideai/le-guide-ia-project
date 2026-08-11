import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

const DEFAULT_FAQS = [
  {
    id: "1",
    category: "pricing",
    question: "Quels sont les moyens de paiement acceptés pour s'inscrire ?",
    answer: "Nous acceptons les paiements Mobile Money (Orange Money, Wave, Moov, MTN), les cartes bancaires (Visa, Mastercard) ainsi que les virements bancaires B2B."
  },
  {
    id: "2",
    category: "program",
    question: "Dois-je avoir des connaissances en programmation pour suivre le Bootcamp ?",
    answer: "Aucun prérequis technique n'est nécessaire ! Le Bootcamp est 100% axé sur l'utilisation des outils No-Code et d'IA générative prêts à l'emploi (ChatGPT, Claude, Canva IA, Midjourney, Make)."
  },
  {
    id: "3",
    category: "logistics",
    question: "Que se passe-t-il si je rate une session en direct sur Google Meet ?",
    answer: "Toutes les sessions en direct sont enregistrées en Haute Définition et rendues disponibles dans votre Espace Membre sous 2 heures avec accès illimité."
  },
  {
    id: "4",
    category: "guarantee",
    question: "Est-ce qu'un certificat officiel est délivré à la fin du Bootcamp ?",
    answer: "Oui, un Certificat Officiel d'Aptitude IA & Automatisation signé par Alfred Dah est délivré à chaque apprenant ayant validé ses travaux pratiques."
  }
]

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("faqs")
      .select("*")
      .order("created_at", { ascending: true })

    if (error || !data || data.length === 0) {
      return NextResponse.json({ faqs: DEFAULT_FAQS })
    }

    return NextResponse.json({ faqs: data })
  } catch (err) {
    return NextResponse.json({ faqs: DEFAULT_FAQS })
  }
}

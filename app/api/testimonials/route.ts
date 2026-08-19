import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

const DEFAULT_TESTIMONIALS = [
  {
    id: "1",
    name: "John Tate",
    role: "Lead Cyber Security Analyst at City of Nicos",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    text: "J’ai étudié aux côtés d’Alfred et peux témoigner de son dynamisme et de son expertise exceptionnels. À la croisée de la gouvernance de l’IA et de la formation des dirigeants, il allie certification CISA, rigueur et sens de l’implémentation. Sa capacité à traduire des concepts complexes en recommandations pratiques est remarquable. Je le recommande sans réserve à toute organisation cherchant un leader en IA."
  },
  {
    id: "2",
    name: "W. Nadine Mariam YODA",
    role: "Executive Officer | Senior Business Advisor | Operations | Supply Chain",
    avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
    text: "J’ai participé au Bootcamp organisé par Alfred Dah et cette formation a déjà transformé ma manière de travailler. J’ai particulièrement apprécié son professionnalisme, sa générosité dans le partage des connaissances et son souci de voir les autres grandir. Je recommande très fortement LE GUIDE IA à tous ceux qui veulent faire de l’IA un tremplin professionnel ou d'affaires."
  },
  {
    id: "3",
    name: "Marilyne OUEDRAOGO",
    role: "Entrepreneure",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    text: "Alfred sait transformer une idée en opportunité concrète et rendre l’IA accessible et utile. Son accompagnement m'a permis de structurer mon Business Model Canvas, mon Business Plan et de clarifier ma proposition de valeur. Sa pédagogie, son sens stratégique et ses conseils pratiques sont de précieux atouts. Je le recommande vivement à tout entrepreneur souhaitant exploiter l'IA."
  },
  {
    id: "4",
    name: "Emmanuel YODA",
    role: "Professionnel / Participant au Bootcamp",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    text: "J’ai suivi une formation en IA animée par l’Expert Alfred Dah. J’ai particulièrement apprécié sa maîtrise des outils, sa pédagogie et sa capacité à vulgariser des concepts complexes avec des cas concrets. Sa générosité dans le partage d'expérience est remarquable. Je le recommande vivement pour apprendre à utiliser l’IA efficacement."
  },
  {
    id: "5",
    name: "Rachidatou Kaboré",
    role: "Analyste / Professionnelle",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    text: "Le Bootcamp Pro IA & Business est l’une des formations les plus concrètes que j’ai suivies. Chaque session débouche sur un livrable opérationnel et réutilisable : workflow automatisé, optimisation LinkedIn, stratégie sur-mesure. On repart avec des outils directement applicables dans son travail. Je recommande sincèrement Alfred Dah à tous les professionnels."
  },
  {
    id: "6",
    name: "Salamata Ouedraogo",
    role: "Senior Education Specialist",
    avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
    text: "En tant que IT Manager sur le projet PRD POCY, Alfred s’est distingué par son expertise technique solide, sa rigueur et son sens des responsabilités. Il sait concevoir des solutions efficaces, sécuriser les systèmes et accompagner les équipes avec pédagogie. Un manager visionnaire alliant leadership et innovation que je recommande vivement."
  },
  {
    id: "7",
    name: "Alain SEHR SEHR, M.Sc., SFPC",
    role: "Professionnel / Participant au Bootcamp",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    text: "Alfred Dah est l’un des formateurs les plus inspirants qu'il m'ait été donné de rencontrer. Au-delà du contenu technique d'excellence, il sait pousser chaque participant à dépasser ses limites et à appliquer concrètement l'IA. J'ai terminé ce Bootcamp avec une confiance renouvelée et des compétences immédiatement activables. Une recommandation absolue !"
  },
  {
    id: "8",
    name: "Cheikh Amadou Ba",
    role: "IT Strategy & Cybersecurity Consultant | Former Regional IT Leader (USAID)",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    text: "Ayant collaboré avec Alfred chez USAID, j’ai pu apprécier sa gestion exemplaire des systèmes critiques. Aujourd'hui, il applique cette même rigueur pour orienter les organisations vers les cas d'usage IA à forte valeur ajoutée. Il allie expertise technique, sécurité et efficacité opérationnelle. Je le recommande fortement."
  },
  {
    id: "9",
    name: "P. Landry K. KORAHIRE",
    role: "Information Security Officer | GAZ Sud | ISO 27001 LI & LA",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    text: "J’ai eu le plaisir de travailler avec Alfred : une personne rigoureuse, hautement professionnelle et engagée. Son esprit d’équipe, son sens des responsabilités et son expertise technique en font un collaborateur particulièrement fiable. Je le recommande sans hésiter."
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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, role, country, text, avatar_url } = body

    if (!name || !text) {
      return NextResponse.json({ message: "Le nom et le texte du témoignage sont obligatoires." }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("testimonials")
      .insert({
        name,
        role: role || "",
        country: country || "",
        text,
        avatar_url: avatar_url || null,
        image: avatar_url || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, testimonial: data })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Erreur serveur." }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name, role, country, text, avatar_url } = body

    if (!id || !name || !text) {
      return NextResponse.json({ message: "ID, nom et texte sont requis." }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("testimonials")
      .update({
        name,
        role: role || "",
        country: country || "",
        text,
        avatar_url: avatar_url || null,
        image: avatar_url || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, testimonial: data })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Erreur serveur." }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "ID manquant." }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from("testimonials")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Erreur serveur." }, { status: 500 })
  }
}

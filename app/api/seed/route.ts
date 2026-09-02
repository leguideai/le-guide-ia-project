import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  return seedDatabase()
}

export async function POST() {
  return seedDatabase()
}

async function seedDatabase() {
  try {
    // 1. Seed Bootcamps (courses)
    const initialCourses: any[] = [
      {
        slug: "initiation-free",
        title: "Initiation IA & ChatGPT Pratique (Gratuit)",
        description: "Module de découverte pour acquérir les fondations du prompting, configurer vos outils et décupler votre productivité au quotidien.",
        price: 0,
        currency: "FCFA",
        badge: "ACCÈS GRATUIT",
        thumbnail: "/images/initiation_free_thumb.jpg",
        poster: "/images/initiation_free_thumb.jpg",
        pdf_url: "/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf",
        format: "100% En Ligne",
        certificate: "Accès Gratuit",
        sequence_order: 1,
        dates: "Accès Immédiat 24h/7j",
        status: "active",
        skills: [
          "Découverte des fondamentaux du Prompt Engineering",
          "Configuration de votre environnement d'outils IA",
          "Guide des meilleurs cas d'usage de ChatGPT en entreprise",
          "Accès aux fiches PDF d'initiation téléchargeables"
        ],
        features: [
          "Cours d'introduction pratique en accès immédiat dans l'Espace Membre",
          "Découverte des fondamentaux du Prompt Engineering",
          "Guide des meilleurs cas d'usage de ChatGPT en entreprise",
          "Accès aux fiches PDF d'initiation téléchargeables"
        ]
      },
      {
        slug: "bootcamp-pro-2",
        title: "Bootcamp IA & Carrière",
        description: "Conçu pour les professionnels en poste, cadres et consultants voulant transformer l'IA en avantage concret dans leur travail quotidien et leur trajectoire de carrière.",
        price: 99000,
        currency: "FCFA",
        badge: "INTENSIF & DIRECT",
        thumbnail: "/images/bootcamp_pro_thumb.jpg",
        poster: "/images/bootcamp_pro_poster.jpg",
        pdf_url: "https://voxqivzzskbttytyklnn.supabase.co/storage/v1/object/public/resources-files/programmes/1786475706651_Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf",
        format: "100% En Ligne (14h en direct)",
        certificate: "Certificat Officiel LE GUIDE IA",
        sequence_order: 1,
        dates: "31 Août au 5 Septembre 2026",
        status: "active",
        skills: [
          "Système de travail IA personnalisé, configuré et opérationnel",
          "Bibliothèque de prompts professionnels adaptée à votre poste",
          "Bibliothèque de modèles d'emails, rapports et synthèses prêts à l'emploi",
          "Premier workflow automatisé, testé et fonctionnel (Make / n8n)",
          "CV compatible ATS et profil LinkedIn optimisés et publiés",
          "Plan de carrière IA sur 90 jours + Certificat officiel"
        ],
        features: [
          "Système de travail IA personnalisé, configuré et opérationnel",
          "Bibliothèque de prompts professionnels adaptée à votre poste",
          "Bibliothèque de modèles d'emails, rapports et synthèses professionnels",
          "Premier workflow automatisé, testé et fonctionnel (Make / n8n)",
          "CV compatible ATS et profil LinkedIn optimisés et publiés",
          "Plan de carrière IA sur 90 jours + Certificat officiel"
        ]
      },
      {
        slug: "bootcamp-business-exec",
        title: "Bootcamp IA & Business",
        description: "Pour entrepreneurs, fondateurs et dirigeants souhaitant structurer leur modèle économique, automatiser leur prospection et accélérer leurs ventes avec l'IA.",
        price: 149000,
        currency: "FCFA",
        badge: "EXCLUSIVE MANAGERS",
        thumbnail: "/images/bootcamp_business_thumb.jpg",
        poster: "/images/bootcamp_business_poster.jpg",
        pdf_url: "https://voxqivzzskbttytyklnn.supabase.co/storage/v1/object/public/resources-files/programmes/1786799298400_Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf",
        format: "100% En Ligne (Direct + Masterclass Dirigeants)",
        certificate: "Certificat Exécutif Business LE GUIDE IA",
        sequence_order: 2,
        dates: "14 au 19 Septembre 2026",
        status: "active",
        skills: [
          "Business Model Canvas finalisé et testé avec l'IA",
          "Business Plan professionnel structuré pour investisseurs & banques",
          "Bibliothèque de 100+ prompts stratégiques Business & Vente",
          "Workflow d'automatisation de tâches & prospection (Make / n8n)",
          "Stratégie de contenu & Plan éditorial 30 jours prêt à publier",
          "Roadmap Business IA sur 90 jours + Certificat officiel"
        ],
        features: [
          "Business Model Canvas finalisé et testé avec l'IA",
          "Business Plan professionnel structuré pour investisseurs & banques",
          "Bibliothèque de 100+ prompts stratégiques Business & Vente",
          "Workflow d'automatisation de tâches & prospection (Make / n8n)",
          "Stratégie de contenu & Plan éditorial 30 jours prêt à publier",
          "Roadmap Business IA sur 90 jours + Certificat officiel"
        ]
      }
    ]

    for (const course of initialCourses) {
      const { data: existing } = await supabaseServer
        .from("courses")
        .select("id")
        .eq("slug", course.slug)
        .maybeSingle()

      if (!existing) {
        await supabaseServer.from("courses").insert(course)
      } else {
        await supabaseServer.from("courses").update(course).eq("id", existing.id)
      }
    }

    // Fetch created courses to get IDs
    const { data: courses } = await supabaseServer.from("courses").select("id, slug")
    const proCourseId = courses?.find(c => c.slug === "bootcamp-pro-2")?.id
    const freeCourseId = courses?.find(c => c.slug === "initiation-free")?.id

    // 2. Seed Lessons
    if (proCourseId) {
      const proLessons = [
        {
          course_id: proCourseId,
          title: "Mindset IA & Fondations du Prompting",
          duration: "2h 30m",
          video_url: "https://www.youtube.com/embed/L_LUpnjgPso",
          pdf_url: "/images/bootcamp_business_poster.jpg",
          sequence_order: 1,
          module_name: "Module 01 — Les Bases du Prompting"
        },
        {
          course_id: proCourseId,
          title: "Maîtrise de ChatGPT & Claude 3.5 pour la Rédaction",
          duration: "2h 15m",
          video_url: "https://www.youtube.com/embed/L_LUpnjgPso",
          pdf_url: "/images/initiation_free_poster.jpg",
          sequence_order: 2,
          module_name: "Module 02 — Rédaction & Ingestion de Documents"
        },
        {
          course_id: proCourseId,
          title: "Création Visuelle avec Canva IA & Midjourney v6",
          duration: "2h 45m",
          video_url: "https://www.youtube.com/embed/L_LUpnjgPso",
          pdf_url: "/images/bootcamp_pro_thumb.jpg",
          sequence_order: 3,
          module_name: "Module 03 — Génération d'Images & Design"
        },
        {
          course_id: proCourseId,
          title: "Automatisation & Workflows IA avec Make.com",
          duration: "2h 30m",
          video_url: "https://www.youtube.com/embed/L_LUpnjgPso",
          pdf_url: "/images/bootcamp_business_thumb.jpg",
          sequence_order: 4,
          module_name: "Module 04 — Automatisation No-Code"
        }
      ]

      for (const les of proLessons) {
        const { data: existing } = await supabaseServer
          .from("lessons")
          .select("id")
          .eq("course_id", proCourseId)
          .eq("sequence_order", les.sequence_order)
          .maybeSingle()

        if (!existing) {
          await supabaseServer.from("lessons").insert(les)
        }
      }
    }

    if (freeCourseId) {
      const freeLessons = [
        {
          course_id: freeCourseId,
          title: "Configuration de ChatGPT & Premiers Pas",
          duration: "25m",
          video_url: "https://www.youtube.com/embed/L_LUpnjgPso",
          pdf_url: "/images/initiation_free_thumb.jpg",
          sequence_order: 1,
          module_name: "Module Gratuit — Découverte"
        }
      ]

      for (const les of freeLessons) {
        const { data: existing } = await supabaseServer
          .from("lessons")
          .select("id")
          .eq("course_id", freeCourseId)
          .eq("sequence_order", les.sequence_order)
          .maybeSingle()

        if (!existing) {
          await supabaseServer.from("lessons").insert(les)
        }
      }
    }

    // 3. Seed Resources (Prompts)
    const initialResources = [
      {
        slug: "prompt-linkedin",
        title: "Optimisation de profil LinkedIn Pro & ATS",
        category: "Productivité & Rédaction",
        type: "Prompt",
        tier: "Membre Premium",
        prompt_text: `Agis en tant qu'expert en personal branding et rédacteur LinkedIn professionnel. Rédige 3 titres percutants (max 220 caractères) avec mots-clés ATS et une section Infos captivante.`,
        file_url: "/images/bootcamp_pro_thumb.jpg"
      },
      {
        slug: "prompt-marketing-b2b",
        title: "Email de prospection commerciale B2B",
        category: "Marketing & Vente",
        type: "Prompt",
        tier: "Membre Premium",
        prompt_text: `Rédige un email de prospection froide B2B concis (moins de 150 mots) axé sur la valeur et la résolution de problème.`,
        file_url: "/images/bootcamp_business_thumb.jpg"
      },
      {
        slug: "ex-excel-data",
        title: "Devoir à Rendre : Analyse de Données Financières d'Entreprise",
        category: "Exercices & Devoirs",
        type: "Devoir",
        tier: "Membre Premium",
        prompt_text: `Projet pratique obligatoire à soumettre : importez le jeu de données Excel de 1 000 ventes dans ChatGPT, générez les graphiques financiers et soumettez votre rapport.`,
        file_url: "/images/initiation_free_thumb.jpg"
      },
      {
        slug: "ex-make-blueprint",
        title: "Cas Pratique : Workflow de Prospection Automatisée sur Make.com",
        category: "Automatisation",
        type: "Blueprint",
        tier: "Membre Premium",
        prompt_text: `Configurez le scénario Make.com fourni, activez les Webhooks d'emails et effectuez un test d'envoi en direct.`,
        file_url: "/images/bootcamp_pro_thumb.jpg"
      },
      {
        slug: "bonus-midjourney",
        title: "Vidéo Bonus : Masterclass Midjourney v6 & Photoréalisme",
        category: "Génération Visuelle",
        type: "Vidéo Masterclass",
        tier: "Gratuit",
        prompt_text: `Tutoriel exclusif de 45 minutes pour générer des visuels publicitaires hyper-réalistes et maîtriser les paramètres --ar, --stylize et --cref.`,
        file_url: "/images/bootcamp_business_thumb.jpg"
      },
      {
        slug: "bp-agence-ia",
        title: "Business Plan — Agence de Services & Automatisations IA",
        category: "Business Plan",
        type: "Document",
        tier: "Membre Premium",
        prompt_text: `Plan d'affaires stratégique complet pour lancer une agence d'intégration IA pour PME : offre de services, tarification retainer et projections financières.`,
        file_url: "/templates/Business_Plan_Agence_IA_Template.docx"
      },
      {
        slug: "bp-aviculture",
        title: "Modèle de Business Plan - Aviculture Moderne",
        category: "Business Plan",
        type: "Document",
        tier: "Gratuit",
        prompt_text: `Structure complète d'un projet d'élevage de poulets de chair et pondeuses au Burkina Faso.`,
        file_url: "/templates/Business_Plan_Aviculture_Burkina_Faso_Template.docx"
      },
      {
        slug: "prompt-ultime-redaction",
        title: "Prompt Ultime de Rédaction de Rapports & Synthèses B2B",
        category: "Productivité & Rédaction",
        type: "Prompt",
        tier: "Membre Premium",
        prompt_text: `Tu es un expert en rédaction exécutive. Analyse le texte ci-joint et génère un rapport structuré comprenant : 1. Résumé exécutif en 3 puces, 2. Analyse d'impact stratégique, 3. Recommandations concrètes d'actions prioritaires.`,
        file_url: "/images/bootcamp_pro_thumb.jpg"
      },
      {
        slug: "kit-prompt-midjourney-v6",
        title: "Kit d'Ingénierie de Prompt pour Génération d'Images Midjourney v6",
        category: "Génération Visuelle",
        type: "Blueprint",
        tier: "Gratuit",
        prompt_text: `/imagine prompt: professional corporate portrait of an African entrepreneur working with AI tech interface, cinematic lighting, 8k resolution, photorealistic, shot on 85mm lens --ar 16:9 --v 6.0`,
        file_url: "/images/bootcamp_business_thumb.jpg"
      }
    ]

    for (const res of initialResources) {
      const { data: existing } = await supabaseServer
        .from("resources")
        .select("id")
        .eq("slug", res.slug)
        .maybeSingle()

      if (!existing) {
        await supabaseServer.from("resources").insert(res)
      }
    }

    // 3.b Seed AI Tools
    const initialTools = [
      {
        slug: "chatgpt-openai",
        name: "ChatGPT (OpenAI)",
        category: "Modèles IA & Raisonnement",
        role: "Génération de texte, Prompt Engineering avancé, Personas & Assistants sur-mesure.",
        icon: "🤖",
        image: "/images/tools/chatgpt.png"
      },
      {
        slug: "claude-anthropic",
        name: "Claude (Anthropic)",
        category: "Modèles IA & Raisonnement",
        role: "Rédaction complexe, analyse fine de documents, logique stratégique & synthèses.",
        icon: "🧠",
        image: "/images/tools/claude.png"
      },
      {
        slug: "google-gemini",
        name: "Google Gemini",
        category: "Modèles IA & Raisonnement",
        role: "Traitement multimodal, analyse d'images & intégration écosystème Workspace.",
        icon: "💎",
        image: "/images/tools/gemini.png"
      },
      {
        slug: "perplexity-ai",
        name: "Perplexity AI",
        category: "Modèles IA & Recherche",
        role: "Recherche web temps réel augmentée, vérification rigoureuse des sources & veille.",
        icon: "🔍",
        image: "/images/tools/perplexity.png"
      },
      {
        slug: "google-notebooklm",
        name: "Google NotebookLM",
        category: "Modèles IA & Recherche",
        role: "Création de bases de connaissances privées, interrogation de PDF & podcasts audio.",
        icon: "📚",
        image: "/images/tools/notebooklm.png"
      },
      {
        slug: "linkedin-ats",
        name: "LinkedIn & Optimisation ATS",
        category: "Employabilité & Visibilité",
        role: "Refonte de profil moderne, franchissement des filtres ATS recruteurs & marque personnelle.",
        icon: "💼",
        image: "/images/tools/linkedin.png"
      }
    ]

    for (const tool of initialTools) {
      const { data: existing } = await supabaseServer
        .from("ai_tools")
        .select("id")
        .eq("slug", tool.slug)
        .maybeSingle()

      if (!existing) {
        await supabaseServer.from("ai_tools").insert(tool)
      }
    }

    // 4. Seed Live Session
    const { data: existingLive } = await supabaseServer.from("live_sessions").select("id").limit(1)
    if (!existingLive || existingLive.length === 0) {
      await supabaseServer.from("live_sessions").insert({
        title: "Bootcamp IA Pro 2 — Session Directe Quotidienne",
        scheduled_at: "2026-08-22T19:00:00Z",
        meet_url: "https://meet.google.com/leguideai-bootcamp-live",
        whatsapp_url: "https://chat.whatsapp.com/leguideai-bootcamp",
        status: "upcoming"
      })
    }

    // 5. Seed Site Settings
    const defaultSettings = [
      { key: "announcement_text", value: "BOOTCAMP IA PRO 2 — Direct Live du 31 Août au 6 Septembre 2026. Inscriptions ouvertes !" },
      { key: "announcement_cta", value: "Réserver ma place (149 000 FCFA) →" },
      { key: "vsl_youtube_url", value: "https://www.youtube.com/embed/0DjfVGtWtDA?rel=0&modestbranding=1" },
      { key: "hero_badge", value: "CO-CRÉEZ VOTRE AVENIR PROFESSIONNEL" },
      { key: "hero_title", value: "Maîtrisez l'IA. Transformez votre carrière et votre business." },
      { key: "hero_subtitle", value: "Formation intensive en ligne · 100% en français · Cas africains & diaspora. Apprenez à maîtriser ChatGPT, Claude, Gemini, Perplexity, NotebookLM, Make et n8n avec Alfred Dah." },
      { key: "hero_dates", value: "31 Août – 6 Sept 2026" },
      { key: "hero_time", value: "19h00 GMT" },
      { key: "hero_promo_price", value: "149,900 F CFA" },
      { key: "hero_normal_price", value: "250,000 F CFA" },
      { key: "whatsapp_number", value: "+226 0505 0577" },
      { key: "hero_poster_url", value: "/images/bootcamp_pro_poster.jpg" }
    ]

    for (const setting of defaultSettings) {
      await supabaseServer.from("site_settings").upsert(setting, { onConflict: "key" })
    }

    // 6. Seed Testimonials
    const initialTestimonials = [
      {
        name: "John Tate",
        role: "Lead Cyber Security Analyst at City of Nicos",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        text: "J’ai étudié aux côtés d’Alfred et peux témoigner de son dynamisme et de son expertise exceptionnels. À la croisée de la gouvernance de l’IA et de la formation des dirigeants, il allie rigueur et sens de l’implémentation. Sa capacité à traduire des concepts complexes en recommandations pratiques est remarquable. Je le recommande sans réserve à toute organisation cherchant un leader en IA."
      },
      {
        name: "W. Nadine Mariam YODA",
        role: "Executive Officer | Senior Business Advisor | Operations | Supply Chain",
        avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
        text: "J’ai participé au Bootcamp organisé par Alfred Dah et cette formation a déjà transformé ma manière de travailler. J’ai particulièrement apprécié son professionnalisme, sa générosité dans le partage des connaissances et son souci de voir les autres grandir. Je recommande très fortement LE GUIDE IA à tous ceux qui veulent faire de l’IA un tremplin professionnel ou d'affaires."
      },
      {
        name: "Marilyne OUEDRAOGO",
        role: "Entrepreneure",
        avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        text: "Alfred sait transformer une idée en opportunité concrète et rendre l’IA accessible et utile. Son accompagnement m'a permis de structurer mon Business Model Canvas, mon Business Plan et de clarifier ma proposition de valeur. Sa pédagogie, son sens stratégique et ses conseils pratiques sont de précieux atouts. Je le recommande vivement à tout entrepreneur souhaitant exploiter l'IA."
      },
      {
        name: "Emmanuel YODA",
        role: "Professionnel / Participant au Bootcamp",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        text: "J’ai suivi une formation en IA animée par l’Expert Alfred Dah. J’ai particulièrement apprécié sa maîtrise des outils, sa pédagogie et sa capacité à vulgariser des concepts complexes avec des cas concrets. Sa générosité dans le partage d'expérience est remarquable. Je le recommande vivement pour apprendre à utiliser l’IA efficacement."
      },
      {
        name: "Rachidatou Kaboré",
        role: "Analyste / Professionnelle",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        text: "Le Bootcamp Pro IA & Business est l’une des formations les plus concrètes que j’ai suivies. Chaque session débouche sur un livrable opérationnel et réutilisable : workflow automatisé, optimisation LinkedIn, stratégie sur-mesure. On repart avec des outils directement applicables dans son travail. Je recommande sincèrement Alfred Dah à tous les professionnels."
      },
      {
        name: "Salamata Ouedraogo",
        role: "Senior Education Specialist",
        avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
        text: "En tant que IT Manager sur le projet PRD POCY, Alfred s’est distingué par son expertise technique solide, sa rigueur et son sens des responsabilités. Il sait concevoir des solutions efficaces, sécuriser les systèmes et accompagner les équipes avec pédagogie. Un manager visionnaire alliant leadership et innovation que je recommande vivement."
      },
      {
        name: "Alain SEHR SEHR, M.Sc., SFPC",
        role: "Professionnel / Participant au Bootcamp",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        text: "Alfred Dah est l’un des formateurs les plus inspirants qu'il m'ait été donné de rencontrer. Au-delà du contenu technique d'excellence, il sait pousser chaque participant à dépasser ses limites et à appliquer concrètement l'IA. J'ai terminé ce Bootcamp avec une confiance renouvelée et des compétences immédiatement activables. Une recommandation absolue !"
      },
      {
        name: "Cheikh Amadou Ba",
        role: "IT Strategy & Cybersecurity Consultant | Former Regional IT Leader (USAID)",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        text: "Ayant collaboré avec Alfred chez USAID, j’ai pu apprécier sa gestion exemplaire des systèmes critiques. Aujourd'hui, il applique cette même rigueur pour orienter les organisations vers les cas d'usage IA à forte valeur ajoutée. Il allie expertise technique, sécurité et efficacité opérationnelle. Je le recommande fortement."
      },
      {
        name: "P. Landry K. KORAHIRE",
        role: "Information Security Officer | GAZ Sud | ISO 27001 LI & LA",
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        text: "J’ai eu le plaisir de travailler avec Alfred : une personne rigoureuse, hautement professionnelle et engagée. Son esprit d’équipe, son sens des responsabilités et son expertise technique en font un collaborateur particulièrement fiable. Je le recommande sans hésiter."
      }
    ]

    for (const t of initialTestimonials) {
      const { data: existing } = await supabaseServer
        .from("testimonials")
        .select("id")
        .eq("name", t.name)
        .maybeSingle()

      if (!existing) {
        await supabaseServer.from("testimonials").insert(t)
      }
    }

    // 7. Seed FAQs
    const initialFaqs = [
      {
        category: "program",
        question: "Dois-je avoir des compétences en programmation pour suivre vos formations ?",
        answer: "Absolument aucun prérequis technique n'est requis. Nos Bootcamps et Masterclasses sont 100% axés sur les outils No-Code, les modèles de langage et l'IA générative appliquée (ChatGPT, Claude 3.5 Sonnet, Gemini, Midjourney, Canva IA, Make et n8n). Chaque concept est expliqué pas à pas avec des cas pratiques immédiatement applicables à votre métier ou entreprise."
      },
      {
        category: "program",
        question: "Quelle est la différence entre vos Bootcamps interactifs et vos Masterclasses vidéos ?",
        answer: "Nos Bootcamps sont des programmes intensifs en direct avec nos formateurs experts (dont Alfred Dah), comprenant des ateliers pratiques en temps réel, des devoirs corrigés et des sessions de questions/réponses en direct. Les Masterclasses vidéos sont des formations enregistrées en auto-formation que vous pouvez suivre à votre propre rythme depuis votre Espace Membre."
      },
      {
        category: "program",
        question: "De quel matériel ou logiciel ai-je besoin pour participer aux cours ?",
        answer: "Un simple ordinateur portable (ou smartphone/tablette) et une connexion Internet stable suffisent. Pour tous les outils d'IA utilisés durant nos formations (ChatGPT, Claude, Canva, etc.), nous vous formons sur les versions gratuites avant d'envisager des abonnements payants optionnels."
      },
      {
        category: "program",
        question: "Les formations et ressources sont-elles adaptées au contexte économique africain ?",
        answer: "Oui, c'est l'ADN même du Guide IA. Tous nos cas d'usage, modèles de business plans, prompts métiers et stratégies d'automatisation sont conçus sur mesure pour répondre aux réalités économiques et professionnelles en Afrique francophone et de la diaspora (recrutement, commerce, marketing local, finance, etc.)."
      },
      {
        category: "pricing",
        question: "Quels sont les moyens de paiement acceptés sur la plateforme ?",
        answer: "Nous proposons des solutions de paiement ultra-flexibles adaptées à chaque pays : Mobile Money instantané (Orange Money, Wave, Moov Money), cartes bancaires internationales (Visa, Mastercard) et virements bancaires professionnels (B2B) avec émission de facture proforma."
      },
      {
        category: "pricing",
        question: "Quand et comment ai-je accès à mon espace de formation après mon paiement ?",
        answer: "Pour les paiements par carte bancaire, votre accès est activé automatiquement et instantanément. Pour les règlements par Mobile Money ou Virement, notre équipe administrative valide manuellement votre transaction sous 24 heures et vous recevez un email de confirmation dès l'activation de vos accès."
      },
      {
        category: "pricing",
        question: "Mon accès à l'Espace Membre et aux contenus est-il limité dans le temps ?",
        answer: "Non, votre accès est illimité et à vie. Vous conservez un accès permanent à tous vos cours achetés, aux supports de formation, aux modèles téléchargeables ainsi qu'à toutes les futures mises à jour des cours sans aucun abonnement récurrent ni frais supplémentaire."
      },
      {
        category: "guarantee",
        question: "Délivrez-vous un certificat officiel à la fin de la formation ?",
        answer: "Oui. Chaque apprenant ayant suivi l'intégralité des modules et validé ses projets pratiques reçoit un Certificat Officiel d'Aptitude & Compétences IA émis par Le Guide IA. Ce certificat vérifiable peut être téléchargé en haute résolution et ajouté directement à votre CV et profil LinkedIn."
      },
      {
        category: "guarantee",
        question: "Comment fonctionne le support et la communauté privée des apprenants ?",
        answer: "Dès votre inscription, vous intégrez notre communauté privée WhatsApp d'apprenants et de professionnels. Vous pouvez y poser toutes vos questions techniques, échanger avec vos pairs, partager vos projets et bénéficier d'une assistance directe de nos formateurs tout au long de votre apprentissage."
      },
      {
        category: "guarantee",
        question: "Est-il possible d'inscrire plusieurs collaborateurs ou d'organiser une formation sur mesure pour mon entreprise ?",
        answer: "Tout à fait. Nous proposons des offres d'accompagnement B2B et des sessions privées intra-entreprises adaptées aux objectifs spécifiques de vos équipes (marketing, finance, direction, RH). Vous pouvez nous contacter directement par email à alfred@leguideai.com ou sur WhatsApp au +226 05 05 05 77 pour recevoir un devis personnalisé."
      }
    ]

    for (const faq of initialFaqs) {
      const { data: existing } = await supabaseServer
        .from("faqs")
        .select("id")
        .eq("question", faq.question)
        .maybeSingle()

      if (!existing) {
        await supabaseServer.from("faqs").insert(faq)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Base de données Supabase initialisée et alimentée à 100% avec les Bootcamps, Leçons, Prompts, Paramètres, Témoignages et FAQ !"
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur de seeding Supabase" }, { status: 500 })
  }
}

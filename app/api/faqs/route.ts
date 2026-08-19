import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

const DEFAULT_FAQS = [
  {
    id: "1",
    category: "program",
    question: "Dois-je avoir des compétences en programmation pour suivre vos formations ?",
    answer: "Absolument aucun prérequis technique n'est requis. Nos Bootcamps et Masterclasses sont 100% axés sur les outils No-Code, les modèles de langage et l'IA générative appliquée (ChatGPT, Claude 3.5 Sonnet, Gemini, Midjourney, Canva IA, Make et n8n). Chaque concept est expliqué pas à pas avec des cas pratiques immédiatement applicables à votre métier ou entreprise."
  },
  {
    id: "2",
    category: "program",
    question: "Quelle est la différence entre vos Bootcamps interactifs et vos Masterclasses vidéos ?",
    answer: "Nos Bootcamps sont des programmes intensifs en direct avec nos formateurs experts (dont Alfred Dah), comprenant des ateliers pratiques en temps réel, des devoirs corrigés et des sessions de questions/réponses en direct. Les Masterclasses vidéos sont des formations enregistrées en auto-formation que vous pouvez suivre à votre propre rythme depuis votre Espace Membre."
  },
  {
    id: "3",
    category: "program",
    question: "De quel matériel ou logiciel ai-je besoin pour participer aux cours ?",
    answer: "Un simple ordinateur portable (ou smartphone/tablette) et une connexion Internet stable suffisent. Pour tous les outils d'IA utilisés durant nos formations (ChatGPT, Claude, Canva, etc.), nous vous formons sur les versions gratuites avant d'envisager des abonnements payants optionnels."
  },
  {
    id: "4",
    category: "program",
    question: "Les formations et ressources sont-elles adaptées au contexte économique africain ?",
    answer: "Oui, c'est l'ADN même du Guide IA. Tous nos cas d'usage, modèles de business plans, prompts métiers et stratégies d'automatisation sont conçus sur mesure pour répondre aux réalités économiques et professionnelles en Afrique francophone et de la diaspora (recrutement, commerce, marketing local, finance, etc.)."
  },
  {
    id: "5",
    category: "pricing",
    question: "Quels sont les moyens de paiement acceptés sur la plateforme ?",
    answer: "Nous proposons des solutions de paiement ultra-flexibles adaptées à chaque pays : Mobile Money instantané (Orange Money, Wave, MTN MoMo, Moov Money), cartes bancaires internationales (Visa, Mastercard) et virements bancaires professionnels (B2B) avec émission de facture proforma."
  },
  {
    id: "6",
    category: "pricing",
    question: "Quand et comment ai-je accès à mon espace de formation après mon paiement ?",
    answer: "Pour les paiements par carte bancaire, votre accès est activé automatiquement et instantanément. Pour les règlements par Mobile Money ou Virement, notre équipe administrative valide manuellement votre transaction sous 24 heures et vous recevez vos identifiants d'accès complets ainsi qu'un email de confirmation."
  },
  {
    id: "7",
    category: "pricing",
    question: "Mon accès à l'Espace Membre et aux contenus est-il limité dans le temps ?",
    answer: "Non, votre accès est illimité et à vie. Vous conservez un accès permanent à tous vos cours achetés, aux supports de formation, aux modèles téléchargeables ainsi qu'à toutes les futures mises à jour des cours sans aucun abonnement récurrent ni frais supplémentaire."
  },
  {
    id: "8",
    category: "guarantee",
    question: "Délivrez-vous un certificat officiel à la fin de la formation ?",
    answer: "Oui. Chaque apprenant ayant suivi l'intégralité des modules et validé ses projets pratiques reçoit un Certificat Officiel d'Aptitude & Compétences IA émis par Le Guide IA. Ce certificat vérifiable peut être téléchargé en haute résolution et ajouté directement à votre CV et profil LinkedIn."
  },
  {
    id: "9",
    category: "guarantee",
    question: "Comment fonctionne le support et la communauté privée des apprenants ?",
    answer: "Dès votre inscription, vous intégrez notre communauté privée WhatsApp d'apprenants et de professionnels. Vous pouvez y poser toutes vos questions techniques, échanger avec vos pairs, partager vos projets et bénéficier d'une assistance directe de nos formateurs tout au long de votre apprentissage."
  },
  {
    id: "10",
    category: "guarantee",
    question: "Est-il possible d'inscrire plusieurs collaborateurs ou d'organiser une formation sur mesure pour mon entreprise ?",
    answer: "Tout à fait. Nous proposons des offres d'accompagnement B2B et des sessions privées intra-entreprises adaptées aux objectifs spécifiques de vos équipes (marketing, finance, direction, RH). Vous pouvez nous contacter directement par email à alfred@leguideai.com ou sur WhatsApp au +226 05 05 05 77 pour recevoir un devis personnalisé."
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

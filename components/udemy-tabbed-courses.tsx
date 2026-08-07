"use client"

import { useState } from "react"
import Link from "next/link"
import { Play, Star, Clock, ArrowRight, Sparkles, X, Tv, ShieldCheck, CheckCircle2 } from "lucide-react"

interface CourseCard {
  id: string
  title: string
  subtitle: string
  duration: string
  rating: string
  reviews: string
  instructor: string
  source: "youtube" | "supabase"
  videoUrl: string
  thumbnail: string
  badge: string
  price: string
  href: string
}

export function UdemyTabbedCourses() {
  const [activeTab, setActiveTab] = useState("initiation")
  const [selectedVideo, setSelectedVideo] = useState<CourseCard | null>(null)

  const tabs = [
    { id: "initiation", label: "Initiation IA & Productivité" },
    { id: "business", label: "Business Model & Plan" },
    { id: "automation", label: "Automatisation Make & n8n" },
    { id: "career", label: "CV, LinkedIn & Emploi" },
    { id: "replays", label: "Replays Bootcamps Live" },
  ]

  const tabContent: Record<string, CourseCard[]> = {
    initiation: [
      {
        id: "init-1",
        title: "Mindset IA & Configuration de ChatGPT, Claude et Gemini",
        subtitle: "Adopter les bonnes habitudes et créer votre environnement de travail moderne.",
        duration: "25 min",
        rating: "4.9",
        reviews: "320 avis",
        instructor: "Alfred Dah",
        source: "youtube",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/initiation_free_thumb.jpg",
        badge: "Module 1 · Vidéo HD",
        price: "Gratuit (0 FCFA)",
        href: "/register-account"
      },
      {
        id: "init-2",
        title: "Les 5 Règles d'Or du Prompting Professionnel",
        subtitle: "Formuler des prompts structurés pour multiplier par 4 votre vitesse d'exécution.",
        duration: "35 min",
        rating: "4.9",
        reviews: "410 avis",
        instructor: "Alfred Dah",
        source: "youtube",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_pro_thumb.jpg",
        badge: "Module 2 · Tutoriel",
        price: "Gratuit (0 FCFA)",
        href: "/register-account"
      },
      {
        id: "init-3",
        title: "Recherche & Synthèse Instantanée avec Perplexity et NotebookLM",
        subtitle: "Analyser des dizaines de PDF et documents stratégiques sans perte de temps.",
        duration: "40 min",
        rating: "4.8",
        reviews: "190 avis",
        instructor: "Alfred Dah",
        source: "supabase",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_business_thumb.jpg",
        badge: "Session 1 Replay",
        price: "Accès Membre",
        href: "/dashboard"
      }
    ],
    business: [
      {
        id: "biz-1",
        title: "Créer son Business Model Canvas assisté par l'IA",
        subtitle: "Transformer une idée en modèle économique clair, cohérent et testable.",
        duration: "2h 00m",
        rating: "5.0",
        reviews: "150 avis",
        instructor: "Alfred Dah",
        source: "supabase",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_business_thumb.jpg",
        badge: "Session 3 Live",
        price: "99 000 FCFA",
        href: "/checkout/bootcamp-ia-pro"
      },
      {
        id: "biz-2",
        title: "Construire un Business Plan Professionnel pour Investisseurs",
        subtitle: "Étude de marché, prévisions financières et analyse des risques avec l'IA.",
        duration: "1h 50m",
        rating: "4.9",
        reviews: "115 avis",
        instructor: "Alfred Dah",
        source: "supabase",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_pro_thumb.jpg",
        badge: "Session 4 Live",
        price: "99 000 FCFA",
        href: "/checkout/bootcamp-ia-pro"
      },
      {
        id: "biz-3",
        title: "Valider ses Segments Clients & Offre Commerciale",
        subtitle: "Définir la proposition de valeur et tester les hypothèses sur le marché.",
        duration: "45 min",
        rating: "4.8",
        reviews: "88 avis",
        instructor: "Alfred Dah",
        source: "youtube",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/initiation_free_thumb.jpg",
        badge: "Extrait Atelier",
        price: "Offert",
        href: "/register-account"
      }
    ],
    automation: [
      {
        id: "auto-1",
        title: "Initiation à l'Automatisation No-Code avec Make & n8n",
        subtitle: "Construire son premier workflow automatisé pour réduire les tâches répétitives.",
        duration: "1h 15m",
        rating: "4.9",
        reviews: "210 avis",
        instructor: "Alfred Dah",
        source: "supabase",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_pro_thumb.jpg",
        badge: "Module 6 · Intensive",
        price: "99 000 FCFA",
        href: "/checkout/bootcamp-ia-pro"
      },
      {
        id: "auto-2",
        title: "Automatisation de la Gestion des Emails & Rapports Métiers",
        subtitle: "Produire automatiquement vos comptes rendus et réponses clients.",
        duration: "55 min",
        rating: "4.9",
        reviews: "175 avis",
        instructor: "Alfred Dah",
        source: "youtube",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/initiation_free_thumb.jpg",
        badge: "Session 5 Live",
        price: "Accès Membre",
        href: "/dashboard"
      },
      {
        id: "auto-3",
        title: "Connecter vos Outils IA à Google Sheets et WhatsApp",
        subtitle: "Workflow de messagerie et de données sans aucune ligne de code.",
        duration: "50 min",
        rating: "5.0",
        reviews: "130 avis",
        instructor: "Alfred Dah",
        source: "supabase",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_business_thumb.jpg",
        badge: "Cas Pratique",
        price: "199 000 FCFA",
        href: "/checkout/bootcamp-ia-business"
      }
    ],
    career: [
      {
        id: "car-1",
        title: "Refonte du CV Moderne & Optimisation pour Filtres ATS",
        subtitle: "Passer les algorithmes de recrutement et captiver l'attention en 10 secondes.",
        duration: "40 min",
        rating: "4.9",
        reviews: "290 avis",
        instructor: "Alfred Dah",
        source: "youtube",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/initiation_free_thumb.jpg",
        badge: "Module 7 · Emploi",
        price: "Gratuit",
        href: "/register-account"
      },
      {
        id: "car-2",
        title: "Positionnement & Marque Personnelle sur LinkedIn avec l'IA",
        subtitle: "Transformer votre profil en aimant à opportunités et clients d'affaires.",
        duration: "1h 10m",
        rating: "5.0",
        reviews: "340 avis",
        instructor: "Alfred Dah",
        source: "supabase",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_pro_thumb.jpg",
        badge: "Module 7 · Intensive",
        price: "99 000 FCFA",
        href: "/checkout/bootcamp-ia-pro"
      },
      {
        id: "car-3",
        title: "Générer un Plan Éditorial de 30 Jours Prêt à Publier",
        subtitle: "Publier du contenu à forte valeur ajoutée sans blocage de la page blanche.",
        duration: "50 min",
        rating: "4.9",
        reviews: "160 avis",
        instructor: "Alfred Dah",
        source: "youtube",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_business_thumb.jpg",
        badge: "Module 8 · Ventes",
        price: "Accès Membre",
        href: "/dashboard"
      }
    ],
    replays: [
      {
        id: "rep-1",
        title: "Replay Intégral — Bootcamp IA Pro Session 1 & 2",
        subtitle: "Les 4 heures de cours en direct live enregistrées en Haute Définition.",
        duration: "4h 00m",
        rating: "5.0",
        reviews: "480 avis",
        instructor: "Alfred Dah",
        source: "supabase",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_pro_thumb.jpg",
        badge: "Replay HD Live",
        price: "Inclus Bootcamp",
        href: "/checkout/bootcamp-ia-pro"
      },
      {
        id: "rep-2",
        title: "Replay Intégral — Session Intensive Week-end (Modules 6 à 9)",
        subtitle: "Les 8h d'immersion du samedi et dimanche avec ateliers et livrables.",
        duration: "8h 00m",
        rating: "5.0",
        reviews: "220 avis",
        instructor: "Alfred Dah",
        source: "supabase",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/bootcamp_business_thumb.jpg",
        badge: "Masterclass Exec",
        price: "Inclus Bootcamp",
        href: "/checkout/bootcamp-ia-business"
      },
      {
        id: "rep-3",
        title: "Clôture, Roadmap 90 Jours & Remise du Certificat Officiel",
        subtitle: "Construire son plan d'exécution personnalisé et faire valider ses acquis.",
        duration: "1h 30m",
        rating: "4.9",
        reviews: "195 avis",
        instructor: "Alfred Dah",
        source: "youtube",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        thumbnail: "/images/initiation_free_thumb.jpg",
        badge: "Module 9",
        price: "Offert Membres",
        href: "/register-account"
      }
    ]
  }

  const currentCards = tabContent[activeTab] || tabContent["initiation"]

  return (
    <section className="py-16 bg-slate-950/60 border-t border-border/50" id="parcours">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        {/* Left-Aligned Header (Udemy Style) */}
        <div className="space-y-3 text-left">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            TUTORIELS VIDÉOS PRATIQUES
          </span>
          <h2 className="font-heading text-2xl md:text-4xl font-black text-foreground tracking-tight">
            Tutoriels & Extraits Vidéos Bootcamp
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
            Découvrez nos cours et petits tutoriels vidéo pour prendre en main l'Intelligence Artificielle.
          </p>
        </div>

        {/* Tabbar Navigation (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-2 border-b border-border/70 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-card/40 border-border/60 text-muted-foreground hover:bg-card/80 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3 Video Cards Grid (Scrollable on Mobile, Grid on Desktop) */}
        <div className="flex overflow-x-auto snap-x no-scrollbar pb-4 gap-4 md:grid md:grid-cols-3 md:pb-0">
          {currentCards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border border-border/80 bg-card/60 overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all shadow-xl backdrop-blur-xl group shrink-0 w-[280px] sm:w-[320px] md:w-auto snap-center"
            >
              {/* Card Image Container with Play Overlay */}
              <div className="relative aspect-video overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setSelectedVideo(card)}>
                <img
                  src={card.thumbnail}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                  <div className="size-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform border border-white/20">
                    <Play className="size-5 fill-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block font-medium">Formateur</span>
                    <span className="text-xs font-bold text-foreground">{card.instructor}</span>
                  </div>

                  <button
                    onClick={() => setSelectedVideo(card)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold px-3 py-1.5 text-xs transition-all border border-primary/20 cursor-pointer"
                  >
                    <span>Aperçu vidéo</span>
                    <Play className="size-3.5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Video Modal Preview */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl rounded-3xl border border-primary/40 bg-slate-900 overflow-hidden shadow-2xl space-y-4 p-4 md:p-6">
            
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-widest">
                  {selectedVideo.badge} · Aperçu de la formation
                </span>
                <h3 className="text-sm md:text-base font-bold text-white leading-tight">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="size-8 rounded-full bg-card hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/80 bg-black">
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-300">
                <span>Accédez à l'intégralité des 15h de Bootcamp & replays HD</span>
              </div>

              <Link
                href={selectedVideo.href}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-2.5 text-xs shadow-lg transition-all"
              >
                <span>Rejoindre le Bootcamp complet</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </section>
  )
}


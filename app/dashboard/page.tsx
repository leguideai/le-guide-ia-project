"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  BookOpen,
  Download,
  Award,
  FileText,
  User,
  LogOut,
  Bell,
  Sparkles,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Save,
  Loader2,
  ExternalLink
} from "lucide-react"

type TabType = "overview" | "courses" | "resources" | "certificates" | "invoices" | "profile"

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Profile Form state
  const [fullName, setFullName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [sector, setSector] = useState("")

  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Fallback for preview/testing if no active auth session
        setUser({ email: "membre@leguideai.com", user_metadata: { full_name: "Apprenant Le Guide IA" } })
        setFullName("Apprenant Le Guide IA")
        setLoading(false)
        return
      }

      setUser(session.user)
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle()

      if (userProfile) {
        setProfile(userProfile)
        setFullName(userProfile.full_name || session.user.user_metadata?.full_name || "")
        setWhatsapp(userProfile.whatsapp || session.user.user_metadata?.whatsapp || "")
        setCountry(userProfile.country || "")
        setCity(userProfile.city || "")
        setSector(userProfile.sector || "")
      } else {
        setFullName(session.user.user_metadata?.full_name || "")
        setWhatsapp(session.user.user_metadata?.whatsapp || "")
      }
      setLoading(false)
    }

    loadUserData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setSavingProfile(true)
    setSaveSuccess(false)

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        email: user.email,
        whatsapp,
        country,
        city,
        sector,
        updated_at: new Date().toISOString(),
      })

    setSavingProfile(false)
    if (!error) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const navItems = [
    { id: "overview", label: "Vue globale", icon: LayoutDashboard },
    { id: "courses", label: "Mes Formations", icon: BookOpen, badge: "1" },
    { id: "resources", label: "Mes Ressources", icon: Download, badge: "12" },
    { id: "certificates", label: "Mes Certificats", icon: Award },
    { id: "invoices", label: "Mes Factures", icon: FileText },
    { id: "profile", label: "Mon Profil", icon: User },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/40 backdrop-blur-xl p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/Logo%20avatar.png" alt="Logo" className="size-8 rounded-lg object-cover" />
              <span className="font-heading text-base font-extrabold tracking-tight">
                LE GUIDE <span className="text-primary">IA</span>
              </span>
            </Link>
            <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20 uppercase">
              PRO
            </span>
          </div>

          {/* User badge */}
          <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30 shrink-0">
              {(fullName || user?.email || "U").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{fullName || "Membre Premium"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <ExternalLink className="size-3.5" />
            <span>Voir le site public</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-6xl mx-auto w-full">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Ravi de vous revoir, {fullName.split(" ")[0] || "Membre"} 👋
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Bienvenue dans votre espace membre LE GUIDE IA. Accédez à vos formations et ressources.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Membre Actif
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold">Formations actives</span>
                  <BookOpen className="size-4 text-primary" />
                </div>
                <p className="font-heading text-2xl font-extrabold text-foreground">1</p>
                <p className="text-[10px] text-muted-foreground">Bootcamp PRO 2</p>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold">Progression globale</span>
                  <Sparkles className="size-4 text-amber-400" />
                </div>
                <p className="font-heading text-2xl font-extrabold text-foreground">0%</p>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[0%]" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold">Prochain Live</span>
                  <Clock className="size-4 text-emerald-400" />
                </div>
                <p className="font-heading text-sm font-bold text-foreground">31 Août 2026</p>
                <p className="text-[10px] text-muted-foreground">Session 1 — Mindset & ChatGPT</p>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold">Certificats</span>
                  <Award className="size-4 text-indigo-400" />
                </div>
                <p className="font-heading text-2xl font-extrabold text-foreground">0 / 1</p>
                <p className="text-[10px] text-muted-foreground">En attente de complétion</p>
              </div>
            </div>

            {/* Bootcamp Banner Card */}
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-3 max-w-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
                  Bootcamp PRO 2
                </span>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Formation Intelligence Artificielle Pratique
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  7 Sessions intensives avec Alfred Dah. Du 31 Août au 6 Septembre 2026. Préparez-vous à transformer votre productivité.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("courses")}
                className="shrink-0 flex items-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-3 text-xs shadow-lg transition-all cursor-pointer"
              >
                <PlayCircle className="size-4" />
                <span>Accéder au cours</span>
              </button>
            </div>

            {/* Resources Teaser */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-foreground">Ressources recommandées pour vous</h3>
                <button onClick={() => setActiveTab("resources")} className="text-xs text-primary font-bold hover:underline">Voir tout →</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { title: "100+ Prompts ChatGPT Pro", cat: "Prompts", size: "2.4 MB" },
                  { title: "Guide complet Midjourney v6", cat: "Guide", size: "4.1 MB" },
                  { title: "Modèle Business Plan IA", cat: "Template", size: "1.8 MB" },
                ].map((res, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card/40 p-4 flex flex-col justify-between space-y-3 hover:border-primary/30 transition-colors">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-secondary text-muted-foreground font-bold px-2 py-0.5 rounded-full uppercase">{res.cat}</span>
                      <h4 className="font-heading text-xs font-bold text-foreground mt-1">{res.title}</h4>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                      <span>PDF · {res.size}</span>
                      <button onClick={() => setActiveTab("resources")} className="text-primary font-bold flex items-center gap-1 hover:underline">
                        <Download className="size-3" /> Télécharger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSES */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Mes Formations</h1>
              <p className="text-xs text-muted-foreground mt-1">Retrouvez vos cours, les enregistrements vidéo et les exercices.</p>
            </div>

            <div className="rounded-3xl border border-border bg-card/50 overflow-hidden space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">SESSION EN DIRECT & REPLAYS</span>
                  <h3 className="font-heading text-lg font-bold text-foreground">Bootcamp PRO 2 — IA Pratique & Avancée</h3>
                  <p className="text-xs text-muted-foreground">Instructeur : Alfred Dah (Auditeur CISA & Expert IA)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">0% Complété</span>
                  <div className="w-32 bg-secondary h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-primary h-full w-[0%]" />
                  </div>
                </div>
              </div>

              {/* Module List */}
              <div className="space-y-3">
                {[
                  { num: "01", title: "Mindset IA & Fondations du Prompting", status: "À venir le 31/08", duration: "2h 30m" },
                  { num: "02", title: "Maîtrise de ChatGPT & Claude pour la Rédaction", status: "À venir le 01/09", duration: "2h 15m" },
                  { num: "03", title: "Création Visuelle avec Canva IA & Midjourney", status: "À venir le 02/09", duration: "2h 45m" },
                  { num: "04", title: "Automatisation & Workflows IA avec Make", status: "À venir le 03/09", duration: "2h 30m" },
                  { num: "05", title: "Analyse de Données & Excel avec l'IA", status: "À venir le 04/09", duration: "2h 00m" },
                  { num: "06", title: "Études de Cas Métiers & Entreprise", status: "À venir le 05/09", duration: "3h 00m" },
                  { num: "07", title: "Session Live Q&R + Évaluation Finale", status: "À venir le 06/09", duration: "2h 00m" },
                ].map((mod) => (
                  <div key={mod.num} className="rounded-2xl border border-border/80 bg-secondary/20 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="size-8 rounded-xl bg-card border border-border flex items-center justify-center font-mono text-xs font-bold text-primary">
                        {mod.num}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{mod.title}</h4>
                        <span className="text-[10px] text-muted-foreground">Durée : {mod.duration}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2.5 py-1 rounded-full font-semibold border border-border">
                      {mod.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RESOURCES */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Bibliothèque de Ressources</h1>
              <p className="text-xs text-muted-foreground mt-1">Téléchargez tous vos templates, guides et prompts exclusifs.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Biblio Prompts ChatGPT Pro", cat: "Prompts", size: "2.4 MB", format: "PDF" },
                { title: "Guide complet Midjourney v6", cat: "Guide", size: "4.1 MB", format: "PDF" },
                { title: "Template Business Plan IA", cat: "Template", size: "1.8 MB", format: "DOCX" },
                { title: "Checklist Audit IA Entreprise", cat: "Audit", size: "850 KB", format: "PDF" },
                { title: "Modèle CV & LinkedIn Optimisé ATS", cat: "Carrière", size: "1.2 MB", format: "DOCX" },
                { title: "Contrat Type Prestataire IA", cat: "Juridique", size: "500 KB", format: "PDF" },
              ].map((res, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card/40 p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
                  <div className="space-y-2">
                    <span className="text-[9px] bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full border border-primary/20 uppercase">
                      {res.cat}
                    </span>
                    <h4 className="font-heading text-sm font-bold text-foreground">{res.title}</h4>
                    <p className="text-[11px] text-muted-foreground">Ressource certifiée réservée aux membres du Bootcamp PRO.</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                    <span className="text-[10px] text-muted-foreground">{res.format} · {res.size}</span>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer">
                      <Download className="size-3.5" /> Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CERTIFICATES */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Mes Certificats</h1>
              <p className="text-xs text-muted-foreground mt-1">Vos attestations et certificats de complétion officiels.</p>
            </div>

            <div className="rounded-3xl border border-border bg-card/40 p-8 text-center space-y-4 max-w-lg mx-auto">
              <div className="inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                <Award className="size-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-foreground">Certificat Bootcamp PRO 2</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Le certificat de réussite sera généré automatiquement dès que vous aurez complété 100% du programme du Bootcamp.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border">
                  Statut : En cours de formation
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INVOICES */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Mes Factures & Paiements</h1>
              <p className="text-xs text-muted-foreground mt-1">Consultez l'historique de vos règlements et téléchargez vos reçus.</p>
            </div>

            <div className="rounded-3xl border border-border bg-card/40 overflow-hidden">
              <div className="p-4 border-b border-border text-xs font-bold text-muted-foreground grid grid-cols-4">
                <span>Description</span>
                <span>Date</span>
                <span>Montant</span>
                <span className="text-right">Statut</span>
              </div>
              <div className="p-4 grid grid-cols-4 text-xs items-center">
                <div>
                  <p className="font-bold text-foreground">Bootcamp PRO 2 — Offre Fondateur</p>
                  <p className="text-[10px] text-muted-foreground">Paiement Mobile Money / Wave</p>
                </div>
                <span className="text-muted-foreground">Août 2026</span>
                <span className="font-mono font-bold text-foreground">149 900 FCFA</span>
                <div className="text-right">
                  <span className="inline-block text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    En cours de vérification
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Mon Profil</h1>
              <p className="text-xs text-muted-foreground mt-1">Mettez à jour vos informations personnelles pour vos certificats et factures.</p>
            </div>

            {saveSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center gap-3 text-xs text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Profil mis à jour avec succès.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="rounded-3xl border border-border bg-card/40 p-6 md:p-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Nom complet (affiché sur le certificat)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Adresse Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-xs text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Numéro WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+226 05 05 05 77"
                  className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80">Pays de résidence</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Burkina Faso, Côte d'Ivoire, France..."
                    className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ouagadougou, Abidjan, Paris..."
                    className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Secteur d'activité / Profession</label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="Entrepreneur, Marketing, RH, Etudiant..."
                  className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 py-2.5 text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer pt-3"
              >
                {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <span>Sauvegarder les modifications</span>
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  )
}

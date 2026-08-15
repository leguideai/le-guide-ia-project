"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { resourcesData, ResourceItem } from "@/lib/resources-data"
import { 
  LayoutDashboard, 
  BookOpen, 
  Download, 
  Award, 
  FileText, 
  User, 
  LogOut, 
  ExternalLink,
  Sparkles,
  Play,
  Check,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  Zap,
  Save,
  Loader2,
  Video,
  FileCheck,
  Printer,
  Copy,
  Search,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Upload,
  DownloadCloudIcon,
  Menu,
  X
} from "lucide-react"

type TabType = "overview" | "courses" | "resources" | "certificates" | "invoices" | "profile"

interface ExerciseDetails {
  type: 'devoir-a-rendre' | 'cas-pratique' | 'qcm' | 'challenge' | 'fichier-entrainement'
  title: string
  deadline: string
  status: 'pending' | 'submitted'
  submissionUrl?: string
}

interface Lesson {
  id: string
  num: string
  title: string
  duration: string
  scheduledDate?: string
  scheduledAt?: string
  targetDate?: string
  videoUrl: string
  pdfUrl?: string
  pdfName?: string
  description: string
  isUpcoming?: boolean
  isLive?: boolean
  hasRecording?: boolean
  meetUrl?: string
  exercise?: ExerciseDetails
}

const DEFAULT_MEET_URL = "https://meet.google.com/leguideai-bootcamp-live"

const BOOTCAMP_LESSONS: Lesson[] = [
  {
    id: "les-01",
    num: "01",
    title: "Mindset IA & Fondations du Prompting",
    duration: "2h 30m",
    scheduledDate: "Samedi 22 Août 2026 • 19h00 - 21h30 GMT",
    targetDate: "2026-08-22T19:00:00Z",
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    pdfUrl: "/images/bootcamp_business_poster.jpg",
    pdfName: "Support_Module1_Mindset_Prompting.pdf",
    description: "Comprendre la logique des LLM, structurer vos instructions (Context, Persona, Task, Output) et éviter les hallucinations.",
    meetUrl: DEFAULT_MEET_URL
  },
  {
    id: "les-02",
    num: "02",
    title: "Maîtrise de ChatGPT & Claude 3.5 pour la Rédaction",
    duration: "2h 15m",
    scheduledDate: "Dimanche 23 Août 2026 • 19h00 - 21h15 GMT",
    targetDate: "2026-08-23T19:00:00Z",
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    pdfUrl: "/images/initiation_free_poster.jpg",
    pdfName: "Cheatsheet_Prompts_Redaction_Pro.pdf",
    description: "Techniques d'ingénierie de prompt avancées pour la rédaction de rapports, emails B2B et stratégies marketing.",
    meetUrl: DEFAULT_MEET_URL
  },
  {
    id: "les-03",
    num: "03",
    title: "Création Visuelle avec Canva IA & Midjourney v6",
    duration: "2h 45m",
    scheduledDate: "Samedi 29 Août 2026 • 19h00 - 21h45 GMT",
    targetDate: "2026-08-29T19:00:00Z",
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    pdfUrl: "/images/bootcamp_pro_thumb.jpg",
    pdfName: "Guide_Design_Midjourney_Canva.pdf",
    description: "Générer des visuels publicitaires professionnels, des logos et des visuels de marque avec l'intelligence artificielle.",
    meetUrl: DEFAULT_MEET_URL
  },
  {
    id: "les-04",
    num: "04",
    title: "Automatisation & Workflows IA avec Make.com",
    duration: "2h 30m",
    scheduledDate: "Dimanche 30 Août 2026 • 19h00 - 21h30 GMT",
    targetDate: "2026-08-30T19:00:00Z",
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    pdfUrl: "/images/bootcamp_business_thumb.jpg",
    pdfName: "Blueprints_Make_Automation.json",
    description: "Connecter vos applications (Gmail, WhatsApp, Google Sheets, ChatGPT) sans coder pour automatiser vos tâches quotidiennes.",
    isUpcoming: true,
    meetUrl: DEFAULT_MEET_URL,
    exercise: {
      type: "cas-pratique",
      title: "Cas Pratique : Test du Scénario Make.com",
      deadline: "Mardi 8 Septembre 2026 à 19h00 GMT",
      status: "pending"
    }
  },
  {
    id: "les-05",
    num: "05",
    title: "Analyse de Données & Excel assisté par l'IA",
    duration: "2h 00m",
    scheduledDate: "Lundi 31 Août 2026 • 19h00 - 21h00 GMT",
    targetDate: "2026-08-31T19:00:00Z",
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    pdfUrl: "/images/initiation_free_thumb.jpg",
    pdfName: "Fichiers_Exercice_Excel_IA.xlsx",
    description: "Utiliser ChatGPT Advanced Data Analysis et Copilot pour traiter des bases de données volumineuses et générer des graphiques.",
    isUpcoming: true,
    meetUrl: DEFAULT_MEET_URL,
    exercise: {
      type: "devoir-a-rendre",
      title: "Devoir à Rendre : Rapport d'Analyse Financière Excel & IA",
      deadline: "Dimanche 6 Septembre 2026 à 23h59 GMT",
      status: "pending"
    }
  },
  {
    id: "les-06",
    num: "06",
    title: "Études de Cas Métiers & Intégration en Entreprise",
    duration: "3h 00m",
    scheduledDate: "Vendredi 4 Septembre 2026 • 19h00 - 22h00 GMT",
    targetDate: "2026-09-04T19:00:00Z",
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    pdfUrl: "/images/b2b_enterprise_thumb.jpg",
    pdfName: "Template_Audit_Gouvernance_IA.pdf",
    description: "Cas pratiques réels d'implémentation de l'IA dans la gestion de projets, le marketing, les RH et les finances.",
    isUpcoming: true,
    meetUrl: DEFAULT_MEET_URL
  },
  {
    id: "les-07",
    num: "07",
    title: "Session Live Q&R + Évaluation Finale",
    duration: "2h 00m",
    scheduledDate: "Samedi 5 Septembre 2026 • 19h00 - 21h00 GMT",
    targetDate: "2026-09-05T19:00:00Z",
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    pdfUrl: "/images/leguideai_official_certificate.jpg",
    pdfName: "Sujet_Evaluation_Finale_Bootcamp.pdf",
    description: "Session de questions/réponses en direct avec Alfred Dah, validation du projet de fin d'étude et obtention du certificat.",
    isUpcoming: true,
    meetUrl: DEFAULT_MEET_URL,
    exercise: {
      type: "devoir-a-rendre",
      title: "Évaluation Finale : Projet d'Intégration IA",
      deadline: "Vendredi 11 Septembre 2026 à 23h59 GMT",
      status: "pending"
    }
  }
]

interface BootcampCourse {
  id: string
  title: string
  subtitle: string
  status: "active" | "upcoming" | "completed"
  dates: string
  instructor: string
  poster: string
  lessons: Lesson[]
}

const ENROLLED_BOOTCAMPS: BootcampCourse[] = [
  {
    id: "bootcamp-pro-2",
    title: "Bootcamp IA Pro 2 — Session Intensive & Live",
    subtitle: "Maîtrisez ChatGPT, Claude 3.5, Canva IA, Midjourney v6 et Make pour décupler votre productivité.",
    status: "active",
    dates: "31 Août - 6 Septembre 2026",
    instructor: "Alfred Dah",
    poster: "/images/bootcamp_pro_thumb.jpg",
    lessons: BOOTCAMP_LESSONS
  },
    {
    id: "bootcamp-business-exec",
    title: "Bootcamp IA Business & Dirigeants (Exec)",
    subtitle: "Gouvernance IA, intégration d'agents IA métiers, sécurité des données et coaching stratégique 1:1.",
    status: "upcoming",
    dates: "15 Septembre - 21 Septembre 2026",
    instructor: "Alfred Dah",
    poster: "/images/bootcamp_business_thumb.png",
    lessons: [
      {
        id: "biz-01",
        num: "01",
        title: "Diagnostic & Gouvernance IA en Entreprise",
        duration: "2h 30m",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        pdfUrl: "/images/bootcamp_business_poster.jpg",
        pdfName: "Cadre_Gouvernance_IA_Exec.pdf",
        description: "Évaluer la maturité IA de votre organisation et fixer les règles de sécurité et conformité des données.",
        isUpcoming: true
      },
      {
        id: "biz-02",
        num: "02",
        title: "Déploiement d'Agents IA Métiers & Coaching 1:1",
        duration: "3h 00m",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        pdfUrl: "/images/b2b_enterprise_thumb.jpg",
        pdfName: "Plan_Deploiement_Agents_IA.pdf",
        description: "Créer des agents virtuels spécialisés pour vos départements RH, Marketing, Ventes et Finances.",
        isUpcoming: true
      }
    ]
  },
  {
    id: "initiation-free",
    title: "Initiation IA & ChatGPT Pratique",
    subtitle: "Prise en main des bases de l'IA générative, écriture des premiers prompts et cas d'usage quotidiens.",
    status: "completed",
    dates: "Accès Illimité",
    instructor: "Alfred Dah",
    poster: "/images/initiation_free_thumb.jpg",
    lessons: [
      {
        id: "init-01",
        num: "01",
        title: "Introduction à l'IA Générative & ChatGPT",
        duration: "1h 15m",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        pdfUrl: "/images/initiation_free_poster.jpg",
        pdfName: "Guide_Initiation_IA_Gratuit.pdf",
        description: "Comprendre le fonctionnement des modèles de langage et créer votre premier compte ChatGPT."
      },
      {
        id: "init-02",
        num: "02",
        title: "Structure d'un Prompt Parfait & Rédaction",
        duration: "1h 30m",
        videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
        pdfUrl: "/images/initiation_free_thumb.jpg",
        pdfName: "Prompts_Essentiels_Bureautique.pdf",
        description: "Formuler des requêtes efficaces pour synthétiser des documents et rédiger vos emails."
      }
    ]
  }
]

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Course Player & Resources State
  const [selectedBootcamp, setSelectedBootcamp] = useState<BootcampCourse | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(BOOTCAMP_LESSONS[0])
  const [resourceSearch, setResourceSearch] = useState("")
  const [selectedBootcampFilter, setSelectedBootcampFilter] = useState<string>("all")
  const [selectedResourceTypeFilter, setSelectedResourceTypeFilter] = useState<string>("all")
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  // Exercise Submission Modal State
  const [submittingExercise, setSubmittingExercise] = useState<{
    id: string
    title: string
    deadline?: string
    allowedTypes?: string
  } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submissionComment, setSubmissionComment] = useState("")
  const [isSubmittingWork, setIsSubmittingWork] = useState(false)
  const [submittedExerciseIds, setSubmittedExerciseIds] = useState<string[]>([])
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState(false)

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!submittingExercise || (!selectedFile && !submissionComment.trim())) return

    setIsSubmittingWork(true)
    setTimeout(() => {
      setIsSubmittingWork(false)
      setSubmittedExerciseIds((prev) => [...prev, submittingExercise.id])
      setSubmissionSuccessMsg(true)
      setTimeout(() => {
        setSubmissionSuccessMsg(false)
        setSubmittingExercise(null)
        setSelectedFile(null)
        setSubmissionComment("")
      }, 2000)
    }, 1200)
  }

  // Profile Form state
  const [fullName, setFullName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [sector, setSector] = useState("")

  // Dynamic Live Countdown Timer State per Session
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const rawTarget = selectedLesson?.scheduledAt || selectedLesson?.targetDate || "2026-08-31T19:00:00Z"
    const targetTimestamp = new Date(rawTarget).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = targetTimestamp - now

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [selectedLesson])

  const [dbCourses, setDbCourses] = useState<any[]>([])
  const [dbLessons, setDbLessons] = useState<any[]>([])
  const [dbBootcampSessions, setDbBootcampSessions] = useState<any[]>([])
  const [dbResources, setDbResources] = useState<any[]>([])
  const [dbLiveSession, setDbLiveSession] = useState<any>(null)
  // userEnrollments stores course UUIDs (stable DB ids, not slugs)
  const [userEnrollments, setUserEnrollments] = useState<string[]>([])
  const [userInvoices, setUserInvoices] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  // A course is accessible if: it's free (price===0) OR its DB uuid / slug is in userEnrollments OR user is admin
  const canAccess = (course: BootcampCourse & { dbId?: string; slug?: string; isFree?: boolean }) =>
    course.isFree ||
    isAdmin ||
    userEnrollments.includes(course.dbId || "") ||
    userEnrollments.includes(course.slug || "")

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login?redirect=/dashboard")
        return
      }
      setUser(user)

      const userEmailClean = user.email?.toLowerCase().trim() || ""

      // 1. Fetch user profile
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (profData) {
        setProfile(profData)
        setFullName(profData.full_name || "")
        setWhatsapp(profData.whatsapp || "")
        setCountry(profData.country || "")
        setCity(profData.city || "")
        setSector(profData.sector || "")

        // Redirection automatique 0-clic vers le Portail Super Admin pour les comptes Admin
        if (profData.role === "admin" || profData.role === "super_admin") {
          const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
          if (params?.get("view") !== "student") {
            setLoading(false)
            router.push("/admin")
            return
          }
        }
      } else {
        setFullName(user.user_metadata?.full_name || "")
      }

      // 2. Fetch dynamic courses from Supabase
      const { data: cData } = await supabase.from("courses").select("*").order("created_at", { ascending: true })
      if (cData && cData.length > 0) setDbCourses(cData)

      // 3. Fetch dynamic lessons from Supabase
      const { data: lData } = await supabase.from("lessons").select("*").order("sequence_order", { ascending: true })
      if (lData && lData.length > 0) setDbLessons(lData)

      // 3b. Fetch dynamic bootcamp sessions from Supabase
      const { data: bsData } = await supabase.from("bootcamp_sessions").select("*").order("session_number", { ascending: true })
      if (bsData && bsData.length > 0) setDbBootcampSessions(bsData)

      // 4. Fetch dynamic resources/prompts from Supabase
      const { data: rData } = await supabase.from("resources").select("*").order("created_at", { ascending: false })
      if (rData && rData.length > 0) setDbResources(rData)

      // 5. Fetch dynamic live session from Supabase
      const { data: liveData } = await supabase.from("live_sessions").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle()
      if (liveData) setDbLiveSession(liveData)

      // 6. Check confirmed payments — store enrolled course UUIDs & fetch user invoices
      const { data: pData } = await supabase
        .from("payments")
        .select("id, amount, currency, method, status, transaction_ref, created_at, registration_id, registrations(email, course_id, course_slug, courses(id, title, price))")
        .eq("status", "confirmed")

      const userPayments = pData?.filter((p: any) =>
        p.registrations?.email?.toLowerCase() === userEmailClean
      ) || []

      const invoices = userPayments.map((p: any) => ({
        id: p.id,
        ref: p.transaction_ref || `FACT-${new Date(p.created_at || Date.now()).getFullYear()}-${p.id.slice(0, 6)}`,
        title: (p.registrations?.courses as any)?.title ? `${(p.registrations?.courses as any)?.title} — Inscription Officielle` : "Bootcamp IA Pro — Inscription Officielle",
        method: p.method || "Paiement Mobile Money / Wave (PayTech)",
        amount: p.amount ? `${Number(p.amount).toLocaleString('fr-FR')} FCFA` : "99 000 FCFA",
        date: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Août 2026"
      }))
      setUserInvoices(invoices)

      // 7. Also fetch paid registrations directly
      const { data: regData } = await supabase
        .from("registrations")
        .select("course_id, course_slug")
        .eq("email", userEmailClean)
        .in("status", ["paye", "confirmed", "active"])

      // 8. Also fetch user_courses table
      const { data: ucData } = await supabase
        .from("user_courses")
        .select("course_slug")
        .eq("user_email", userEmailClean)
        .eq("status", "active")

      const isAdminUser = profData?.role === "admin" || profData?.role === "super_admin"
      setIsAdmin(isAdminUser)

      if (isAdminUser) {
        // Admin sees all courses — store all course IDs & slugs
        setUserEnrollments((cData || []).flatMap((c: any) => [c.id, c.slug]))
      } else {
        // Aggregate all course UUIDs and slugs from payments, registrations, and user_courses
        const fromPayments = userPayments.flatMap((p: any) => [
          p.registrations?.course_id,
          p.registrations?.course_slug,
          p.registrations?.courses?.id,
          p.registrations?.courses?.slug
        ])
        const fromRegs = (regData || []).flatMap((r: any) => [r.course_id, r.course_slug])
        const fromUserCourses = (ucData || []).map((uc: any) => uc.course_slug)

        const allIdentifiers = Array.from(new Set([
          ...fromPayments,
          ...fromRegs,
          ...fromUserCourses
        ])).filter(Boolean) as string[]

        setUserEnrollments(allIdentifiers)
      }

      setLoading(false)
    }

    loadUserData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPromptId(id)
      setTimeout(() => setCopiedPromptId(null), 2500)
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (typeof window !== "undefined") {
      localStorage.clear()
      window.location.href = "/login"
    }
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
          <Sparkles className="size-5 text-primary animate-spin" />
          <span>Chargement de votre Espace Membre...</span>
        </div>
      </div>
    )
  }

  const navItems: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "courses", label: "Mes Formations", icon: BookOpen },
    { id: "resources", label: "Mes Ressources", icon: DownloadCloudIcon },
    { id: "certificates", label: "Mes Certificats", icon: Award },
    { id: "invoices", label: "Mes Factures", icon: FileText },
    { id: "profile", label: "Mon Profil", icon: User },
  ]

  const allResources = dbResources.length > 0 ? dbResources.map((r: any) => ({
    id: r.id,
    bootcampId: "bootcamp-pro-2",
    bootcampName: "Bootcamp IA Pro 2",
    type: r.type === "Prompt" ? "prompt" : r.type === "Blueprint" ? "business-plan" : "exercise",
    title: { fr: r.title, en: r.title },
    desc: { fr: r.category || "Ressource certifiée Le Guide IA", en: r.category || "Ressource certifiée" },
    content: { fr: r.prompt_text || "", en: r.prompt_text || "" },
    fileUrl: r.file_url || undefined,
    downloadUrl: r.file_url || undefined,
    videoUrl: undefined,
    exerciseType: undefined,
    fileSize: "PDF / Fichier Supabase",
    deadline: "Permanent",
    tier: r.tier || "Membre Premium"
  })) : []

  const filteredResources = allResources.filter((r) => {
    const search = resourceSearch.toLowerCase()
    const matchesSearch = r.title.fr.toLowerCase().includes(search) || r.desc.fr.toLowerCase().includes(search)
    const matchesBootcamp = selectedBootcampFilter === "all" || r.bootcampId === selectedBootcampFilter
    const matchesType = selectedResourceTypeFilter === "all" || r.type === selectedResourceTypeFilter
    return matchesSearch && matchesBootcamp && matchesType
  })

  // Map DB courses — keep dbId (uuid) separate, add isFree flag
  const displayedBootcamps = (dbCourses.length > 0 ? dbCourses : []).map((c: any) => ({
    dbId: c.id,                          // stable UUID — never changes
    id: c.slug || c.id,                  // for legacy display refs
    slug: c.slug,
    title: c.title,
    subtitle: c.description,
    status: c.status || "active",
    isFree: Number(c.price) === 0,
    price: c.price,
    slug_checkout: c.slug,
    dates: Number(c.price) === 0 ? "Accès Illimité" : (c.dates || "Session Intensive Live"),
    instructor: c.instructor || "Alfred Dah",
    live_meet_url: c.live_meet_url || "https://meet.google.com/leguideai-bootcamp-live",
    poster: c.thumbnail || c.poster || "/images/bootcamp_pro_thumb.jpg",
    lessons: (() => {
      const courseSessions = dbBootcampSessions.filter(
        (s: any) => s.course_id === c.id || s.course_id === c.slug || s.course_slug === c.slug
      )
      const sourceList = courseSessions.length > 0 ? courseSessions : dbLessons.filter((l: any) => l.course_id === c.id)
      return sourceList.map((s: any, idx: number) => {
        const hasRecording = Boolean((s.recording_url || s.video_url) && (s.recording_url || s.video_url).trim() !== "")
        const isLive = s.status === "live"
        const isUpcoming = s.status === "upcoming" || (!hasRecording && !isLive)

        return {
          id: s.id,
          num: String(s.session_number || s.sequence_order || idx + 1).padStart(2, "0"),
          title: s.title,
          duration: s.scheduled_at
            ? new Date(s.scheduled_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) + " • 19h00 GMT"
            : "2h 00m",
          videoUrl: s.recording_url || s.video_url || null,
          hasRecording,
          isUpcoming,
          isLive,
          meetUrl: s.meet_url || c.live_meet_url,
          homeworkTitle: s.homework_title,
          homeworkDesc: s.homework_description,
          homeworkFileUrl: s.homework_file_url,
          status: s.status || "upcoming",
          scheduledAt: s.scheduled_at,
          pdfUrl: s.homework_file_url || s.pdf_url,
          pdfName: s.homework_title ? `Exercice_${s.homework_title}.pdf` : undefined,
          description: s.description || s.homework_description || "Session de formation pratique"
        }
      })
    })()
  }))

  // Separate enrolled (accessible) vs locked (paid, not yet purchased)
  const enrolledBootcamps = displayedBootcamps.filter((b: any) => canAccess(b))
  const lockedBootcamps = displayedBootcamps.filter((b: any) => !canAccess(b))

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Top Header for Espace Membre */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-950/95 border-b border-border px-4 py-3 flex items-center justify-between backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-7 rounded-lg object-cover" />
          <span className="font-heading text-sm font-black tracking-tight text-white">
            LE GUIDE <span className="text-primary">IA</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <ShieldCheck className="size-3" />
            {navItems.find(i => i.id === activeTab)?.label || "Dashboard"}
          </span>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors"
            aria-label="Menu Espace Membre"
          >
            {mobileSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-50 bg-slate-950/98 backdrop-blur-2xl p-5 overflow-y-auto space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
          {/* User profile */}
          <div className="rounded-2xl border border-border/80 bg-secondary/40 p-3.5 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm border border-white/20 shrink-0 shadow-md">
              {(fullName || user?.email || "U").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold text-foreground truncate">{fullName || "Membre Apprenant"}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <ShieldCheck className="size-3" /> Espace Membre
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType)
                    setMobileSidebarOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary border border-primary/20"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-border/60 space-y-2">
            {(profile?.role === "admin" || profile?.role === "super_admin") && (
              <Link
                href="/admin"
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black text-slate-950 bg-primary shadow-md"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  <span>Portail Super Admin</span>
                </div>
                <ChevronRight className="size-3.5" />
              </Link>
            )}
            <Link
              href="/"
              onClick={() => setMobileSidebarOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              <span>Voir le site public</span>
            </Link>
            <button
              onClick={() => {
                setMobileSidebarOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="size-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation (Fixed full height on desktop) */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card/40 backdrop-blur-xl p-4 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-5">
          
          {/* Brand Logo inside Dashboard Sidebar */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1 hover:opacity-90 transition-opacity">
            <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover" />
            <span className="font-heading text-base font-black tracking-tight text-white">
              LE GUIDE <span className="text-primary">IA</span>
            </span>
          </Link>

          {/* User Profile Summary Card */}
          <div className="rounded-2xl border border-border/80 bg-secondary/40 p-3 flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xs border border-white/20 shrink-0 shadow-md">
              {(fullName || user?.email || "U").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-bold text-foreground truncate">{fullName || "Membre Apprenant"}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <ShieldCheck className="size-3" /> Espace Membre
              </span>
            </div>
          </div>

          {/* Nav Menu */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary border border-primary/20"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-border/60 space-y-2">
          {(profile?.role === "admin" || profile?.role === "super_admin") && (
            <Link
              href="/admin"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-primary hover:opacity-90 shadow-md transition-all"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                <span>Portail Super Admin</span>
              </div>
              <ChevronRight className="size-3.5" />
            </Link>
          )}
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <ExternalLink className="size-3.5" />
            <span>Voir le site public</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto max-w-6xl mx-auto w-full text-left">
        
        {/* Admin Quick Banner */}
        {(profile?.role === "admin" || profile?.role === "super_admin") && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-blue-500/10 border border-primary/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                👑
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Privilèges Administrateur Détectés ({profile.role})</h4>
                <p className="text-xs text-slate-300">Vous êtes connecté en tant que gestionnaire. Ouvrez la console pour gérer les étudiants, cours et paiements.</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg shadow-primary/20"
            >
              Ouvrir le Portail Super Admin →
            </Link>
          </div>
        )}
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Ravi de vous revoir, {fullName.split(" ")[0] || "Apprenant"} 👋
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Bienvenue dans votre Espace Membre LE GUIDE IA. Suivez vos sessions live et téléchargez vos ressources.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Compte Actif
                </span>
              </div>
            </div>

            {/* 1. Live Google Meet & WhatsApp Hub Banner — Dynamique depuis DB */}
            {(() => {
              // Trouver le bootcamp actif auquel l'utilisateur est inscrit (ou à venir le plus proche)
              const activeBootcamp = enrolledBootcamps.find((b: any) => b.status === "active")
                || enrolledBootcamps.find((b: any) => b.status === "upcoming")
                || enrolledBootcamps[0]
              // Utiliser la date de la session live DB si disponible
              const liveDate = dbLiveSession?.scheduled_at || dbLiveSession?.start_time
              const hasLiveAccess = enrolledBootcamps.some((b: any) => !b.isFree)
              return (
              <div className="rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/15 via-card to-card p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/20 px-3 py-1 rounded-full border border-primary/30 flex items-center gap-1.5">
                        <Video className="size-3 animate-pulse text-primary" />
                        DIRECT LIVE{activeBootcamp ? ` · ${activeBootcamp.title.toUpperCase()}` : ""}
                      </span>
                    </div>
                    <h2 className="font-heading text-xl md:text-2xl font-black text-foreground">
                      {dbLiveSession?.title || "Session en Direct Live"}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {dbLiveSession?.description || `Rejoignez ${activeBootcamp?.instructor || "Alfred Dah"} en direct sur Google Meet pour votre cours interactif, exercices pratiques et coaching en temps réel.`}
                    </p>

                    {/* Countdown — vers la date de la session DB ou la prochaine session de la leçon */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        {liveDate ? "Prochaine session dans :" : "Prochaine session :"}
                      </span>
                      {liveDate ? (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/90 border border-primary/40 px-3 py-1.5 min-w-[52px] shadow-lg">
                            <span className="font-heading text-base font-black text-primary font-mono leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Jours</span>
                          </div>
                          <span className="text-primary font-bold text-sm">:</span>
                          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/90 border border-primary/40 px-3 py-1.5 min-w-[52px] shadow-lg">
                            <span className="font-heading text-base font-black text-white font-mono leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Heures</span>
                          </div>
                          <span className="text-primary font-bold text-sm">:</span>
                          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/90 border border-primary/40 px-3 py-1.5 min-w-[52px] shadow-lg">
                            <span className="font-heading text-base font-black text-white font-mono leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Min</span>
                          </div>
                          <span className="text-primary font-bold text-sm">:</span>
                          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/90 border border-amber-500/50 px-3 py-1.5 min-w-[52px] shadow-lg">
                            <span className="font-heading text-base font-black text-amber-400 font-mono leading-none animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="text-[9px] font-bold text-amber-400/80 uppercase mt-0.5">Sec</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Date à annoncer</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    {hasLiveAccess ? (
                      <>
                        <a
                          href={dbLiveSession?.meet_url || activeBootcamp?.live_meet_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-3 text-xs shadow-lg transition-all"
                        >
                          <Video className="size-4" />
                          <span>Rejoindre le Google Meet Live</span>
                        </a>
                        <a
                          href={dbLiveSession?.whatsapp_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold px-5 py-3 text-xs transition-all"
                        >
                          <MessageCircle className="size-4" />
                          <span>Groupe WhatsApp</span>
                        </a>
                      </>
                    ) : (
                      <Link
                        href="/bootcamp"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold px-5 py-3 text-xs transition-all hover:bg-rose-500/30"
                      >
                        <span>🔒 Réserver pour accéder au Live</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              )
            })()}

            {/* 2. Mes Formations Inscrites */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-foreground">Mes Formations</h3>
                <button onClick={() => setActiveTab("courses")} className="text-xs text-primary font-bold hover:underline">Voir tout →</button>
              </div>

              {enrolledBootcamps.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {enrolledBootcamps.map((bootcamp: any) => (
                    <div key={bootcamp.dbId} className="rounded-2xl border border-border bg-card/40 overflow-hidden p-3.5 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors text-left shadow-lg">
                      <div className="space-y-2">
                        {/* Miniature Thumbnail */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-border/60">
                          <img src={bootcamp.poster} alt={bootcamp.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border shadow-md ${
                              bootcamp.isFree ? "bg-emerald-500 text-slate-950 border-emerald-400"
                              : bootcamp.status === "active" ? "bg-emerald-500/90 text-slate-950 border-emerald-400"
                              : bootcamp.status === "completed" ? "bg-blue-600 text-white border-blue-400"
                              : "bg-amber-500 text-slate-950 border-amber-400"
                            }`}>
                              {bootcamp.isFree ? "Gratuit" : bootcamp.status === "active" ? "Actif" : bootcamp.status === "completed" ? "Replays HD" : "À venir"}
                            </span>
                          </div>
                        </div>
                        <h4 className="font-heading text-xs font-bold text-foreground line-clamp-2">{bootcamp.title}</h4>
                        <p className="text-[10px] text-muted-foreground">{bootcamp.dates}</p>
                      </div>
                      <button
                        onClick={() => { setSelectedBootcamp(bootcamp); setSelectedLesson(bootcamp.lessons[0]); setActiveTab("courses") }}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground py-2 rounded-xl border border-primary/20 transition-all cursor-pointer"
                      >
                        <PlayCircle className="size-3.5" />
                        <span>Accéder aux cours</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-card/20 p-5 text-center text-xs text-muted-foreground">
                  Vous n'êtes inscrit à aucune formation pour le moment.
                </div>
              )}
            </div>

            {/* 2b. Formations & Bootcamps Disponibles (Non inscrits) */}
            {lockedBootcamps.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold text-foreground">Formations &amp; Bootcamps Disponibles</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {lockedBootcamps.map((bootcamp: any) => (
                    <div key={bootcamp.dbId} className="rounded-2xl border border-border/40 bg-gradient-to-b from-slate-900/60 to-slate-950/60 overflow-hidden p-3.5 flex flex-col justify-between space-y-3 text-left shadow-lg">
                      <div className="space-y-2">
                        {/* Miniature Thumbnail */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-border/40">
                          <img src={bootcamp.poster} alt={bootcamp.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border bg-primary/20 text-primary border-primary/30 shadow-md">
                              Formule Payante
                            </span>
                          </div>
                        </div>
                        <h4 className="font-heading text-xs font-bold text-foreground line-clamp-2">{bootcamp.title}</h4>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{bootcamp.dates}</span>
                          <span className="font-bold text-primary font-mono">{bootcamp.price}</span>
                        </div>
                      </div>
                      <a
                        href={`/bootcamp?course=${bootcamp.slug}`}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-primary-foreground bg-primary hover:opacity-90 py-2 rounded-xl transition-all shadow-md"
                      >
                        <span>Réserver ma place →</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Dernières sessions — depuis DB, premier bootcamp actif inscrit */}
            {(() => {
              const activeBootcamp = enrolledBootcamps.find((b: any) => b.status === "active" || b.status === "upcoming") || enrolledBootcamps[0]
              const recentLessons = activeBootcamp?.lessons?.slice(0, 3) || []
              if (!activeBootcamp || recentLessons.length === 0) return null
              return (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Dernières sessions — {activeBootcamp.title}
                  </h3>
                  <button
                    onClick={() => { setSelectedBootcamp(activeBootcamp); setActiveTab("courses") }}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Accéder au lecteur complet →
                  </button>
                </div>

                <div className="grid gap-3">
                  {recentLessons.map((lesson: any) => (
                    <div
                      key={lesson.id}
                      className="rounded-2xl border border-border/80 bg-card/40 p-4 flex items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="size-7 rounded-xl bg-card border border-border flex items-center justify-center font-mono text-xs font-bold text-primary">
                          {lesson.num}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{lesson.title}</h4>
                          <span className="text-[10px] text-muted-foreground">
                            Durée : {lesson.duration}
                            {lesson.videoUrl ? " · ✓ Replay disponible" : " · Session à venir"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelectedBootcamp(activeBootcamp); setSelectedLesson(lesson); setActiveTab("courses") }}
                        className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-xl border border-primary/20 transition-all cursor-pointer shrink-0"
                      >
                        <Play className="size-3 fill-current" />
                        <span>{lesson.videoUrl ? "Regarder le Replay" : "Consulter"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              )
            })()}

          </div>
        )}

        {/* TAB 2: COURSES (Enrolled Bootcamps List & Interactive Video Player) */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            {selectedBootcamp === null ? (
              /* Master View: List of Enrolled Bootcamps */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <div>
                    <h1 className="font-heading text-2xl font-bold text-foreground">Mes Formations & Bootcamps Inscrits</h1>
                    <p className="text-xs text-muted-foreground mt-1">Sélectionnez une formation pour accéder au lien, supports PDF et exercices pratiques.</p>
                  </div>
                </div>

                {/* ─── Formations accessibles ─── */}
                {enrolledBootcamps.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-base font-bold text-foreground">Mes formations actives</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {enrolledBootcamps.map((bootcamp: any) => (
                        <div
                          key={bootcamp.dbId}
                          className="rounded-3xl border border-border/80 bg-card/40 overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-all shadow-xl group text-left"
                        >
                          <div className="space-y-3 p-5">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-border/60 mb-2">
                              <img src={bootcamp.poster} alt={bootcamp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute top-2.5 left-2.5">
                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md shadow-md border ${
                                  bootcamp.isFree ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                  : bootcamp.status === "active" ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                  : bootcamp.status === "completed" ? "bg-blue-600 text-white border-blue-400"
                                  : "bg-amber-500 text-slate-950 border-amber-400"
                                }`}>
                                  {bootcamp.isFree ? "Gratuit" : bootcamp.status === "active" ? "Actif" : bootcamp.status === "completed" ? "Replays HD" : "À venir"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{bootcamp.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{bootcamp.subtitle}</p>
                            </div>
                            <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
                              <div><strong>Dates :</strong> {bootcamp.dates}</div>
                              <div><strong>Formateur :</strong> {bootcamp.instructor}</div>
                            </div>
                          </div>
                          <div className="p-5 pt-0">
                            <button
                              onClick={() => { setSelectedBootcamp(bootcamp); setSelectedLesson(bootcamp.lessons[0]) }}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold py-2.5 text-xs shadow-md transition-all cursor-pointer"
                            >
                              <PlayCircle className="size-4" />
                              <span>Accéder à la formation</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Formations disponibles à l'achat ─── */}
                {lockedBootcamps.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading text-base font-bold text-foreground">Autres formations disponibles</h2>
                      <span className="text-[10px] font-bold text-muted-foreground bg-secondary/60 border border-border px-2.5 py-1 rounded-full">Non inscrit</span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {lockedBootcamps.map((bootcamp: any) => (
                        <div
                          key={bootcamp.dbId}
                          className="rounded-3xl border border-border/40 bg-gradient-to-b from-slate-900/40 to-slate-950/60 overflow-hidden flex flex-col justify-between transition-all shadow-xl text-left"
                        >
                          <div className="space-y-3 p-5">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-border/40 mb-2">
                              <img src={bootcamp.poster} alt={bootcamp.title} className="w-full h-full object-cover" />
                              <div className="absolute top-2.5 left-2.5">
                                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-md shadow-md border bg-primary/20 text-primary border-primary/30">Formule Payante</span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <h3 className="font-heading text-base font-bold text-foreground leading-snug">{bootcamp.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{bootcamp.subtitle}</p>
                            </div>
                            <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
                              <div><strong>Dates :</strong> {bootcamp.dates}</div>
                              <div><strong>Formateur :</strong> {bootcamp.instructor}</div>
                            </div>
                          </div>
                          <div className="p-5 pt-0">
                            <a
                              href={`/bootcamp?course=${bootcamp.slug}`}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold py-2.5 text-xs shadow-md transition-all"
                            >
                              <span>Réserver ma place →</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Detail View: Video Player & Lessons for selectedBootcamp */
              <div className="space-y-6">
                {/* Top Bar with Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <button
                    onClick={() => setSelectedBootcamp(null)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <ChevronRight className="size-4 rotate-180" />
                    <span>← Retour à toutes mes formations</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase">
                      {selectedBootcamp.title}
                    </span>
                  </div>
                </div>

                {/* Main Course Player Frame */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Left: Active Video Player or Upcoming Session Countdown */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-border shadow-2xl">
                      {selectedBootcamp.status === "upcoming" || selectedLesson.isUpcoming ? (
                        /* Upcoming Session Countdown Frame (No video iframe) */
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-amber-500/20">
                          <div className="size-14 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-lg">
                            <Clock className="size-7 animate-pulse" />
                          </div>
                          <div className="space-y-1.5 max-w-md">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                              SESSION LIVE À VENIR
                            </span>
                            <h3 className="font-heading text-lg md:text-xl font-bold text-white">
                              {selectedLesson.title}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Cette session aura lieu en direct sur Google Meet ({
                                selectedLesson.scheduledAt
                                  ? new Date(selectedLesson.scheduledAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " à " + new Date(selectedLesson.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                                  : selectedLesson.scheduledDate || selectedBootcamp.dates
                              }). Le replay HD sera accessible immédiatement après la session.
                            </p>
                          </div>

                          {/* Live Ticking Countdown Timer */}
                          <div className="flex items-center gap-2 pt-2">
                            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-amber-500/40 px-3.5 py-2 min-w-[55px] shadow-lg">
                              <span className="font-heading text-base font-black text-amber-400 font-mono leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Jours</span>
                            </div>
                            <span className="text-amber-400 font-bold text-sm">:</span>
                            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-amber-500/40 px-3.5 py-2 min-w-[55px] shadow-lg">
                              <span className="font-heading text-base font-black text-white font-mono leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Heures</span>
                            </div>
                            <span className="text-amber-400 font-bold text-sm">:</span>
                            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-amber-500/40 px-3.5 py-2 min-w-[55px] shadow-lg">
                              <span className="font-heading text-base font-black text-white font-mono leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Min</span>
                            </div>
                            <span className="text-amber-400 font-bold text-sm">:</span>
                            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-amber-500/40 px-3.5 py-2 min-w-[55px] shadow-lg">
                              <span className="font-heading text-base font-black text-amber-400 font-mono leading-none animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                              <span className="text-[9px] font-bold text-amber-400/80 uppercase mt-0.5">Sec</span>
                            </div>
                          </div>

                          <a
                            href={selectedLesson.meetUrl || DEFAULT_MEET_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 text-xs shadow-lg shadow-emerald-500/20 transition-all mt-2 cursor-pointer"
                          >
                            <Video className="size-4" />
                            <span>Rejoindre la Session Live sur Google Meet</span>
                          </a>
                        </div>
                      ) : (
                        /* Completed/Replay Video Player (iframe) */
                        <iframe
                          src={`${selectedLesson.videoUrl}?autoplay=0`}
                          title={selectedLesson.title}
                          className="w-full h-full border-none"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>

                    <div className="rounded-3xl border border-border bg-card/40 p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 uppercase">
                              Module {selectedLesson.num}
                            </span>
                            {selectedLesson.scheduledDate && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                <Calendar className="size-3" />
                                <span>{selectedLesson.scheduledDate}</span>
                              </span>
                            )}
                          </div>
                          <h2 className="font-heading text-lg font-bold text-foreground">
                            {selectedLesson.title}
                          </h2>
                        </div>

                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                          selectedLesson.isLive
                            ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                            : selectedLesson.isUpcoming
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {selectedLesson.isLive ? "🟢 En Direct Maintenant" : selectedLesson.isUpcoming ? "🕒 Session à venir" : "🎬 Replay Disponible"}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {selectedLesson.description}
                      </p>

                      {/* PDF Attachment (Available ONLY for past/completed sessions) */}
                      <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-3">
                        {selectedLesson.pdfName ? (
                          selectedLesson.isUpcoming || selectedBootcamp.status === "upcoming" ? (
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                              <FileText className="size-4 text-muted-foreground/60" />
                              <span>Support PDF du cours : <strong className="text-amber-400 font-bold">🔒 Disponible immédiatement après la session live</strong></span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                <FileText className="size-4 text-purple-400" />
                                <span>Support PDF du cours : {selectedLesson.pdfName}</span>
                              </div>
                              <a
                                href={selectedLesson.pdfUrl || "#"}
                                download
                                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer shrink-0"
                              >
                                <Download className="size-3.5" />
                                <span>Télécharger (PDF)</span>
                              </a>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">Aucun support PDF attaché pour ce module.</span>
                        )}
                      </div>

                      {/* Exercise & Homework Submission Section */}
                      {selectedLesson.exercise && (
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 mt-3 text-left">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                {selectedLesson.exercise.type === 'devoir-a-rendre' ? '📝 Devoir à rendre' : selectedLesson.exercise.type === 'cas-pratique' ? '💼 Cas Pratique Métier' : '⚡ Challenge Prompt'}
                              </span>
                              <h4 className="text-xs font-bold text-foreground">{selectedLesson.exercise.title}</h4>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                              <Clock className="size-3.5" />
                              <span>Date limite : {selectedLesson.exercise.deadline}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shrink-0 ${
                              submittedExerciseIds.includes(selectedLesson.exercise.title) || selectedLesson.exercise.status === 'submitted'
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}>
                              {submittedExerciseIds.includes(selectedLesson.exercise.title) || selectedLesson.exercise.status === 'submitted' ? "✓ Travail Soumis sur la plateforme" : "⏳ En attente de rendu"}
                            </span>

                            <button
                              onClick={() => setSubmittingExercise({
                                id: selectedLesson.exercise!.title,
                                title: selectedLesson.exercise!.title,
                                deadline: selectedLesson.exercise!.deadline
                              })}
                              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 text-xs shadow-md transition-all cursor-pointer"
                            >
                              <Upload className="size-3.5" />
                              <span>{submittedExerciseIds.includes(selectedLesson.exercise.title) ? "Modifier mon rendu" : "Soumettre ma réponse sur la plateforme"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Modules & Lessons Playlist for selectedBootcamp */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h3 className="font-heading text-sm font-bold text-foreground">Sommaire de la formation</h3>
                      <span className="text-xs font-bold text-muted-foreground">{selectedBootcamp.lessons.length} sessions</span>
                    </div>

                    <div className="space-y-2 max-h-[640px] lg:max-h-[680px] overflow-y-auto scrollbar-thin pr-1.5 pb-6">
                      {selectedBootcamp.lessons.map((lesson) => {
                        const isSelected = selectedLesson.id === lesson.id
                        const isUpcoming = lesson.isUpcoming || selectedBootcamp.status === "upcoming"

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? "bg-primary/10 border-primary shadow-md"
                                : "bg-card/40 border-border/80 hover:bg-card/70"
                            }`}
                          >
                            <div className="size-7 rounded-xl bg-card border border-border flex items-center justify-center font-mono text-xs font-bold text-primary shrink-0 mt-0.5">
                              {lesson.num}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1 flex-wrap">
                                <Clock className="size-3" />
                                <span>{lesson.duration}</span>
                                <span>·</span>
                                <span className={lesson.isLive ? "text-red-400 font-bold animate-pulse" : lesson.isUpcoming ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                                  {lesson.isLive ? "En Direct" : lesson.isUpcoming ? "À venir" : "Replay HD"}
                                </span>
                              </div>
                              {lesson.scheduledDate && (
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400/90 mt-1">
                                  <Calendar className="size-3 shrink-0 text-emerald-400" />
                                  <span className="truncate">{lesson.scheduledDate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESOURCES (1-Click Copy, Downloads & Bonus Media) */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Bibliothèque de Ressources Apprenants</h1>
                <p className="text-xs text-muted-foreground mt-1">Accédez à tous vos prompts, business plans, exercices pratiques et vidéos bonus classés par Bootcamp.</p>
              </div>

              <div className="relative w-full max-w-xs">
                <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Rechercher une ressource..."
                  className="w-full rounded-xl border border-border bg-input/40 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 border border-border/80 p-4 rounded-2xl">
              {/* Filter 1: Bootcamp Selection */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Rattachement par Bootcamp :</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedBootcampFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      selectedBootcampFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tous mes Bootcamps
                  </button>
                  {ENROLLED_BOOTCAMPS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBootcampFilter(b.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        selectedBootcampFilter === b.id ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {b.title.split("—")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: Type Selection */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Type de ressource :</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "Tous" },
                    { id: "prompt", label: "Prompts" },
                    { id: "business-plan", label: "Business Plans" },
                    { id: "exercise", label: "Exercices & Fichiers" },
                    { id: "bonus-video", label: "Vidéos Bonus" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedResourceTypeFilter(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedResourceTypeFilter === t.id ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-3xl p-6">
                <p className="text-xs text-muted-foreground">Aucune ressource ne correspond à vos filtres actuels.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredResources.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-border/80 bg-card/40 p-6 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors shadow-lg text-left">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          item.type === 'prompt'
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : item.type === 'business-plan'
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : item.type === 'exercise'
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {item.type === 'prompt' ? "Prompt Métier" : item.type === 'business-plan' ? "Business Plan" : item.type === 'exercise' ? "Exercice & Fichier" : "Vidéo Bonus"}
                        </span>

                        {item.bootcampName && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                            {item.bootcampName}
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading text-base font-bold text-foreground">{item.title.fr}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc.fr}</p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-border/40">
                      {item.type === 'bonus-video' ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-border shadow-md">
                          <iframe
                            src={`${item.videoUrl}?autoplay=0`}
                            title={item.title.fr}
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl bg-slate-950/80 border border-border/60 p-3 max-h-36 overflow-y-auto text-[11px] font-mono text-slate-300 whitespace-pre-wrap scrollbar-thin select-all">
                          {item.content.fr}
                        </div>
                      )}

                      {item.type === 'prompt' && (
                        <button
                          onClick={() => handleCopyPrompt(item.id, item.content.fr)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold py-2.5 text-xs shadow-md transition-all cursor-pointer"
                        >
                          {copiedPromptId === item.id ? <Check className="size-4 stroke-[3]" /> : <Copy className="size-4" />}
                          <span>{copiedPromptId === item.id ? "Prompt Copié !" : "Copier le Prompt"}</span>
                        </button>
                      )}

                      {item.type === 'business-plan' && (
                        <a
                          href={`https://wa.me/22675757273?text=Bonjour%20Le%20Guide%20IA%2C%20je%20suis%20membre%20et%20souhaite%20recevoir%20le%20modele%20de%20Business%20Plan%20complet%20pour%20:%20${encodeURIComponent(item.title.fr)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs shadow-md transition-all"
                        >
                          <Download className="size-4" />
                          <span>Télécharger le Business Plan (DOCX / PDF)</span>
                        </a>
                      )}

                      {item.type === 'exercise' && (
                        <div className="space-y-2">
                          {item.deadline && (
                            <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 gap-2">
                              <span className="flex items-center gap-1.5">
                                <Clock className="size-3.5 text-amber-400" />
                                <span>Date limite de rendu : {item.deadline}</span>
                              </span>
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                                {item.exerciseType === 'devoir-a-rendre' ? '📝 Devoir à rendre' : '💼 Cas Pratique'}
                              </span>
                            </div>
                          )}

                          <div className="grid gap-2 sm:grid-cols-2">
                            <a
                              href={item.downloadUrl || "#"}
                              download
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground font-bold py-2.5 text-xs border border-border shadow-sm transition-all"
                            >
                              <Download className="size-3.5 text-primary" />
                              <span>Télécharger Sujet ({item.fileSize || "PDF"})</span>
                            </a>

                            <button
                              onClick={() => setSubmittingExercise({
                                id: item.id,
                                title: item.title.fr,
                                deadline: item.deadline
                              })}
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 text-xs shadow-md transition-all cursor-pointer"
                            >
                              <Upload className="size-3.5" />
                              <span>{submittedExerciseIds.includes(item.id) ? "✓ Rendu Soumis" : "Soumettre sur la plateforme"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CERTIFICATES */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Mes Certificats Officiels</h1>
              <p className="text-xs text-muted-foreground mt-1">Générez et vérifiez vos attestations certifiées délivrées par LE GUIDE IA.</p>
            </div>

            <div className="rounded-3xl border border-primary/30 bg-card/40 p-8 text-center space-y-5 max-w-xl mx-auto shadow-2xl">
              <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30 shadow-inner">
                <Award className="size-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-heading text-xl font-extrabold text-foreground">Certificat Officiel — Bootcamp IA Pro 2</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Attestation de compétences délivrée par Alfred Dah (Auditeur CISA &amp; Expert IA). Valide pour LinkedIn et valorisation professionnelle.
                </p>
              </div>

              <div className="pt-2 flex flex-col items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Statut : Certificat Validé &amp; Délivré
                </span>

                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-black px-6 py-3 text-xs shadow-lg transition-all cursor-pointer"
                >
                  <FileCheck className="size-4" />
                  <span>Visualiser &amp; Imprimer mon Certificat</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INVOICES */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Mes Factures &amp; Reçus</h1>
              <p className="text-xs text-muted-foreground mt-1">Téléchargez vos factures d'achat et reçus d'inscription officiels.</p>
            </div>

            <div className="rounded-3xl border border-border bg-card/40 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-border bg-secondary/30 text-xs font-bold text-muted-foreground grid grid-cols-4">
                <span>Description</span>
                <span>Date</span>
                <span>Montant</span>
                <span className="text-right">Action / Statut</span>
              </div>

              {(() => {
                if (userInvoices.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                      <p className="font-bold text-foreground">Aucune facture enregistrée dans Supabase</p>
                      <p>Les factures et reçus d'inscription officiels apparaîtront automatiquement ici dès qu'un versement est confirmé.</p>
                    </div>
                  )
                }

                return userInvoices.map((inv: any) => (
                  <div key={inv.id} className="p-4 grid grid-cols-4 text-xs items-center border-b border-border/40 hover:bg-slate-900/30 transition-colors">
                    <div>
                      <p className="font-bold text-foreground">{inv.title}</p>
                      <p className="text-[10px] text-muted-foreground">{inv.method}</p>
                    </div>
                    <span className="text-muted-foreground">{inv.date}</span>
                    <span className="font-mono font-bold text-foreground">{inv.amount}</span>
                    <div className="text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv)
                          setIsInvoiceModalOpen(true)
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl"
                      >
                        <Download className="size-3.5" />
                        <span>Télécharger (PDF)</span>
                      </button>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Mon Profil Apprenant</h1>
              <p className="text-xs text-muted-foreground mt-1">Vos coordonnées officielles affichées sur vos certificats et factures.</p>
            </div>

            {saveSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center gap-3 text-xs text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Profil mis à jour avec succès.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="rounded-3xl border border-border bg-card/40 p-6 md:p-8 space-y-4 shadow-xl">
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
                  placeholder="+226 75 75 72 73"
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
                className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 py-3 text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <span>Sauvegarder les modifications</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Official Certificate Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-primary/30 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl text-left relative overflow-hidden">
            <div className="border-4 border-amber-500/40 p-6 rounded-2xl bg-slate-950 text-center space-y-4 relative">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-heading text-sm font-black tracking-tight text-white">LE GUIDE <span className="text-primary">IA</span></span>
                <span className="text-[10px] font-mono text-muted-foreground">ID : CERT-2026-{user?.id?.substring(0, 6) || "9876"}</span>
              </div>

              <div className="space-y-2 py-4">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-extrabold">CERTIFICAT DE RÉUSSITE OFFICIEL</span>
                <p className="text-xs text-muted-foreground">Ce certificat est décerné à</p>
                <h2 className="font-heading text-2xl md:text-3xl font-black text-white">{fullName || "NOM DE L'APPRENANT"}</h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Pour avoir complété avec succès le programme intensif de formation professionnelle
                  <strong className="text-primary block mt-1">BOOTCAMP IA PRO 2 — MAÎTRISE DE L'IA PRATIQUE</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs">
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">Formateur &amp; Auditeur</span>
                  <span className="font-bold text-white">Alfred Dah (CISA)</span>
                </div>
                <div className="size-14 rounded-lg bg-white p-1 flex items-center justify-center">
                  <img src="/Logo%20avatar.png" alt="QR" className="size-12 object-cover rounded" />
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">Date de délivrance</span>
                  <span className="font-bold text-white">6 Septembre 2026</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs shadow-md"
              >
                <Printer className="size-4" />
                <span>Imprimer / Sauvegarder (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-border rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-white">Facture Officielle / Reçu</h3>
                <span className="text-[10px] text-muted-foreground font-mono">Réf: {selectedInvoice?.ref || "FACT-2026-0899"}</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">PAYÉ</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client :</span>
                <span className="font-bold text-white">{fullName || user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Désignation :</span>
                <span className="font-bold text-white">{selectedInvoice?.title || "Bootcamp IA Pro 2"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moyen de règlement :</span>
                <span className="font-bold text-white">{selectedInvoice?.method || "Mobile Money / Wave"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date de règlement :</span>
                <span className="font-bold text-white">{selectedInvoice?.date || "Août 2026"}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-sm">
                <span className="font-bold text-white">Montant Total :</span>
                <span className="font-bold text-primary font-mono">{selectedInvoice?.amount || "99 000 FCFA"}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-white"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs"
              >
                <Printer className="size-4" />
                <span>Imprimer la facture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Platform Homework Submission Modal */}
      {submittingExercise && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-primary/40 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl text-left relative overflow-hidden">
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  SOUMISSION D'EXERCICE SUR LA PLATEFORME
                </span>
                <h3 className="font-heading text-lg font-bold text-white">
                  {submittingExercise.title}
                </h3>
                {submittingExercise.deadline && (
                  <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 pt-0.5">
                    <Clock className="size-3.5" />
                    <span>Date limite de rendu : {submittingExercise.deadline}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSubmittingExercise(null)
                  setSelectedFile(null)
                  setSubmissionComment("")
                }}
                className="text-muted-foreground hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submissionSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="size-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="size-8 stroke-[2.5]" />
                </div>
                <h4 className="font-heading text-xl font-bold text-white">Travail Soumis avec Succès !</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Votre fichier et vos notes ont été enregistrés sur la plateforme. Votre formateur (Alfred Dah) examinera votre rendu sous 48h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                {/* File Upload Drop Area */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    1. Sélectionner votre fichier (PDF, Vidéo MP4, Excel XLSX, Word DOCX, JSON, ZIP)
                  </label>
                  <div className="relative border-2 border-dashed border-primary/30 hover:border-primary bg-slate-950/60 p-6 rounded-2xl text-center space-y-3 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xlsx,.xls,.mp4,.mov,.avi,.json,.zip,.rar"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSelectedFile(e.target.files[0])
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="size-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto">
                      <Upload className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {selectedFile ? selectedFile.name : "Cliquez ou glissez-déposez votre fichier de travail ici"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {selectedFile
                          ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Type: ${selectedFile.type || "Fichier"}`
                          : "Formats acceptés : PDF, Vidéo MP4/MOV, Excel, DOCX, JSON, ZIP (Max 500 MB)"}
                      </p>
                    </div>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="relative z-20 text-[10px] text-rose-400 hover:underline font-bold cursor-pointer"
                      >
                        Changer / Supprimer ce fichier
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Comments for Instructor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    2. Remarques ou explications complémentaires pour le formateur (Optionnel)
                  </label>
                  <textarea
                    rows={3}
                    value={submissionComment}
                    onChange={(e) => setSubmissionComment(e.target.value)}
                    placeholder="Décrivez succinctement la méthodologie ou les hypothèses utilisées pour cet exercice..."
                    className="w-full rounded-xl border border-border bg-input/40 p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittingExercise(null)
                      setSelectedFile(null)
                      setSubmissionComment("")
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-white transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingWork || (!selectedFile && !submissionComment.trim())}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-black px-6 py-2.5 text-xs shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isSubmittingWork ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    <span>{isSubmittingWork ? "Envoi en cours..." : "Valider et soumettre mon travail"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

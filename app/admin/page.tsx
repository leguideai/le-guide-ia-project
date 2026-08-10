"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { 
  ShieldAlert, ShieldCheck, Users, DollarSign, BookOpen, FileCheck, 
  Building2, Download, CheckCircle2, XCircle, Clock, Search, RefreshCw, 
  Upload, ExternalLink, Award, Mail, ArrowRight, UserPlus, Filter, Plus,
  Edit3, Trash2, Video, Calendar, Sparkles, Layers, FileText, Lock
} from "lucide-react"

interface BootcampCourse {
  id?: string
  title: string
  slug: string
  subtitle: string
  price: string
  original_price?: string
  badge: string
  category: string
  status: "published" | "draft" | "archived"
  poster: string
  dates: string
  instructor: string
  live_meet_url?: string
}

interface ResourceItem {
  id?: string
  title: string
  description: string
  category: string
  access_level: "Gratuit" | "Membre Premium"
  download_url?: string
  prompt_text?: string
  downloads_count?: number
}

interface LiveSession {
  id?: string
  title: string
  course_slug: string
  meet_url: string
  replay_url?: string
  scheduled_at: string
  status: "upcoming" | "live" | "completed"
}

interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  role: "student" | "admin" | "super_admin"
  created_at: string
}

interface PaymentRecord {
  id: string
  registration_id?: string
  amount: number
  currency: string
  method: string
  status: string
  transaction_ref?: string
  created_at: string
  registrations?: {
    full_name?: string
    email?: string
    whatsapp?: string
    country?: string
    source?: string
  }
}

interface SubmissionRecord {
  id: string
  user_email: string
  lesson_title?: string
  exercise_type?: string
  submission_url?: string
  status: string
  score?: number
  feedback?: string
  created_at: string
}

interface B2BRecord {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone?: string
  sector?: string
  employees?: string
  needs?: string
  status: string
  created_at: string
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"kpi" | "courses" | "resources" | "lives" | "payments" | "users" | "submissions" | "b2b" | "export">("kpi")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>("super_admin")
  const [unauthorized, setUnauthorized] = useState(false)

  // Data states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalRegistrations: 0,
    proRegistrations: 0,
    totalStudents: 0,
    pendingPaymentsCount: 0,
    pendingSubmissions: 0,
    b2bCount: 0
  })

  const [courses, setCourses] = useState<BootcampCourse[]>([])
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [lives, setLives] = useState<LiveSession[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([])
  const [b2bRequests, setB2bRequests] = useState<B2BRecord[]>([])

  // Filters & Notice
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)

  // Modals Creation States
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [courseForm, setCourseForm] = useState<Partial<BootcampCourse>>({
    title: "",
    slug: "",
    subtitle: "",
    price: "99 000 FCFA",
    original_price: "150 000 FCFA",
    badge: "OFFRE FONDATEUR",
    category: "Bootcamp",
    status: "published",
    poster: "/images/bootcamp_pro_thumb.jpg",
    dates: "31 Août - 6 Septembre 2026",
    instructor: "Alfred Dah",
    live_meet_url: "https://meet.google.com/xyz-abc-def"
  })

  const [showResourceModal, setShowResourceModal] = useState(false)
  const [resourceForm, setResourceForm] = useState<Partial<ResourceItem>>({
    title: "",
    description: "",
    category: "Productivity",
    access_level: "Membre Premium",
    prompt_text: "",
    download_url: ""
  })

  const [showLiveModal, setShowLiveModal] = useState(false)
  const [liveForm, setLiveForm] = useState<Partial<LiveSession>>({
    title: "Session Live #01 — Stratégies d'Automation IA",
    course_slug: "bootcamp-pro-2",
    meet_url: "https://meet.google.com/xyz-abc-def",
    replay_url: "",
    scheduled_at: new Date().toISOString(),
    status: "upcoming"
  })

  // Manual Enroll Form
  const [enrollEmail, setEnrollEmail] = useState("")
  const [enrollCourse, setEnrollCourse] = useState("bootcamp-pro-2")

  // Storage Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  // Grading modal state
  const [gradingSub, setGradingSub] = useState<SubmissionRecord | null>(null)
  const [gradeScore, setGradeScore] = useState<number>(18)
  const [gradeFeedback, setGradeFeedback] = useState("")

  useEffect(() => {
    checkAdminAccess()
    fetchAllData()
  }, [])

  async function checkAdminAccess() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        window.location.href = "/login?redirect=/admin"
        return
      }

      setCurrentUser(session.user)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle()

      if (profile?.role) {
        setUserRole(profile.role)
        if (profile.role !== "admin" && profile.role !== "super_admin") {
          setUnauthorized(true)
        }
      }
    } catch (e) {
      console.warn("Check admin access error:", e)
    }
  }

  async function fetchAllData() {
    setLoading(true)
    try {
      // 1. Stats
      const resStats = await fetch("/api/admin/stats")
      const dataStats = await resStats.json()
      if (dataStats.stats) setStats(dataStats.stats)

      // 2. Courses
      const resCourses = await fetch("/api/admin/courses")
      const dataCourses = await resCourses.json()
      if (dataCourses.courses) setCourses(dataCourses.courses)

      // 3. Resources
      const resRes = await fetch("/api/admin/resources")
      const dataRes = await resRes.json()
      if (dataRes.resources) setResources(dataRes.resources)

      // 4. Lives
      const resLives = await fetch("/api/admin/lives")
      const dataLives = await resLives.json()
      if (dataLives.lives) setLives(dataLives.lives)

      // 5. Users
      const resUsers = await fetch("/api/admin/users")
      const dataUsers = await resUsers.json()
      if (dataUsers.users) setUsers(dataUsers.users)

      // 6. Payments
      const resPay = await fetch("/api/admin/payments")
      const dataPay = await resPay.json()
      if (dataPay.payments) setPayments(dataPay.payments)

      // 7. Submissions
      const resSub = await fetch("/api/admin/submissions")
      const dataSub = await resSub.json()
      if (dataSub.submissions) setSubmissions(dataSub.submissions)

      // 8. B2B
      const resB2b = await fetch("/api/admin/b2b")
      const dataB2b = await resB2b.json()
      if (dataB2b.requests) setB2bRequests(dataB2b.requests)
    } catch (err) {
      console.error("Fetch admin data error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Create or Update Bootcamp Course
  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault()
    setProcessingId("save_course")
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm)
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message || "Bootcamp sauvegardé dans Supabase !")
        setShowCourseModal(false)
        fetchAllData()
      } else {
        alert(data.error || "Erreur de sauvegarde")
      }
    } catch (err) {
      alert("Erreur de communication serveur")
    } finally {
      setProcessingId(null)
    }
  }

  // Delete Course
  async function handleDeleteCourse(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce Bootcamp ?")) return
    try {
      const res = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showNotice("Bootcamp supprimé avec succès.")
        fetchAllData()
      }
    } catch (e) {
      alert("Erreur lors de la suppression")
    }
  }

  // Create or Update Resource Item
  async function handleSaveResource(e: React.FormEvent) {
    e.preventDefault()
    setProcessingId("save_resource")
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceForm)
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message || "Ressource enregistrée dans Supabase !")
        setShowResourceModal(false)
        fetchAllData()
      }
    } catch (err) {
      alert("Erreur d'enregistrement ressource")
    } finally {
      setProcessingId(null)
    }
  }

  // Create or Update Live Session
  async function handleSaveLive(e: React.FormEvent) {
    e.preventDefault()
    setProcessingId("save_live")
    try {
      const res = await fetch("/api/admin/lives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(liveForm)
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message || "Session Live programmée !")
        setShowLiveModal(false)
        fetchAllData()
      }
    } catch (err) {
      alert("Erreur d'enregistrement du live")
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Role Change
  async function handleRoleChange(userId: string, newRole: string) {
    setProcessingId(userId)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_role", userId, role: newRole })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(`Rôle mis à jour : ${newRole}`)
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour du rôle")
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Manual Enrollment
  async function handleManualEnroll(e: React.FormEvent) {
    e.preventDefault()
    if (!enrollEmail) return
    setProcessingId("enroll")
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enroll_course", userEmail: enrollEmail, courseSlug: enrollCourse })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message)
        setEnrollEmail("")
        fetchAllData()
      }
    } catch (err) {
      alert("Erreur d'inscription manuelle")
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Payment Status Update (1-Click Approve / Reject Mobile Money)
  async function handlePaymentStatus(paymentId: string, status: "confirmed" | "rejected") {
    setProcessingId(paymentId)
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(status === "confirmed" ? "Paiement confirmé ! Accès débloqué & Email d'accès délivré." : "Paiement rejeté.")
        setPayments(payments.map(p => p.id === paymentId ? { ...p, status } : p))
        fetchAllData()
      }
    } catch (err) {
      alert("Erreur de mise à jour du paiement")
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Submissions Grading
  async function handleGradeSubmission() {
    if (!gradingSub) return
    setProcessingId(gradingSub.id)
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: gradingSub.id,
          status: "graded",
          score: gradeScore,
          feedback: gradeFeedback
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice("Devoir évalué avec succès !")
        setGradingSub(null)
        setSubmissions(submissions.map(s => s.id === gradingSub.id ? { ...s, status: "graded", score: gradeScore, feedback: gradeFeedback } : s))
      }
    } catch (err) {
      alert("Erreur de correction")
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Supabase Storage Upload
  async function handleFileUpload() {
    if (!uploadFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("bucket", "courses-pdf")
      formData.append("folder", "handouts")

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        setUploadedUrl(data.url)
        showNotice("Fichier hébergé avec succès dans Supabase Storage !")
      } else {
        alert(data.error || "Erreur téléversement")
      }
    } catch (err) {
      alert("Erreur de téléversement")
    } finally {
      setUploading(false)
    }
  }

  // Export CSV function
  function exportRegistrationsCSV() {
    if (!payments.length) return
    const headers = ["Nom", "Email", "WhatsApp", "Pays", "Montant", "Methode", "Statut_Paiement", "Date"]
    const rows = payments.map(p => [
      `"${p.registrations?.full_name || 'N/A'}"`,
      `"${p.registrations?.email || 'N/A'}"`,
      `"${p.registrations?.whatsapp || 'N/A'}"`,
      `"${p.registrations?.country || 'N/A'}"`,
      `"${p.amount || 0} ${p.currency || 'XOF'}"`,
      `"${p.method || 'N/A'}"`,
      `"${p.status}"`,
      `"${new Date(p.created_at).toLocaleDateString('fr-FR')}"`
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `inscriptions_bootcamp_leguideai_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function showNotice(msg: string) {
    setNoticeMessage(msg)
    setTimeout(() => setNoticeMessage(null), 5000)
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="size-16 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert className="size-8 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-white font-heading">Accès Restreint Super Admin</h1>
        <p className="text-sm text-slate-400 max-w-md">
          Vous devez posséder les privilèges <strong>super_admin</strong> ou <strong>admin</strong> pour accéder à cette interface.
        </p>
        <Link href="/dashboard" className="px-6 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-sm hover:opacity-90 transition-opacity">
          Retour au Dashboard Apprenant
        </Link>
      </div>
    )
  }

  const filteredPayments = payments.filter(p => {
    const matchesSearch = searchQuery === "" || 
      p.registrations?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.registrations?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transaction_ref?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = paymentFilter === "all" || p.status === paymentFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row selection:bg-primary/30">
      
      {/* Notice Toast */}
      {noticeMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-sm">{noticeMessage}</span>
        </div>
      )}

      {/* Left Vertical Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl p-4 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1 hover:opacity-90 transition-opacity">
            <span className="font-heading font-black text-xl text-white tracking-wider">
              LE GUIDE <span className="text-primary">IA</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
              SUPER ADMIN
            </span>
          </Link>

          {/* Admin Profile Summary Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary text-slate-950 flex items-center justify-center font-black text-xs border border-white/20 shrink-0 shadow-md">
              {(currentUser?.email || "AD").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-bold text-white truncate">{currentUser?.email?.split("@")[0] || "Alfred Dah"}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <ShieldCheck className="size-3" /> {userRole || "super_admin"}
              </span>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-5">
            
            {/* Section 1: ANALYTIQUES & FINANCES */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Analytiques & Ventes</p>
              <button
                onClick={() => setActiveTab("kpi")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "kpi" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="size-4 shrink-0" />
                  <span>Vue d'Ensemble & KPIs</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("payments")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "payments" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="size-4 shrink-0" />
                  <span>Inscriptions & Paiements</span>
                </div>
                {stats.pendingPaymentsCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                    {stats.pendingPaymentsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Section 2: GESTION DU CONTENU */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Gestion du Contenu</p>
              <button
                onClick={() => setActiveTab("courses")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "courses" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="size-4 shrink-0" />
                  <span>Bootcamps & Leçons</span>
                </div>
                <span className="text-[10px] opacity-75">({courses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("resources")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "resources" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="size-4 shrink-0" />
                  <span>Bibliothèque Prompts</span>
                </div>
                <span className="text-[10px] opacity-75">({resources.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("lives")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "lives" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Video className="size-4 shrink-0" />
                  <span>Directs Google Meet</span>
                </div>
              </button>
            </div>

            {/* Section 3: APPRENANTS & DEVOIRS */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Apprenants & Devoirs</p>
              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "users" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="size-4 shrink-0" />
                  <span>Membres & Rôles RBAC</span>
                </div>
                <span className="text-[10px] opacity-75">({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("submissions")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "submissions" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="size-4 shrink-0" />
                  <span>Devoirs sur 20</span>
                </div>
                {stats.pendingSubmissions > 0 && (
                  <span className="bg-blue-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full">
                    {stats.pendingSubmissions}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("b2b")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "b2b" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="size-4 shrink-0" />
                  <span>Devis B2B Entreprises</span>
                </div>
                <span className="text-[10px] opacity-75">({stats.b2bCount})</span>
              </button>
            </div>

            {/* Section 4: OUTILS & FICHIERS */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Outils & Exports</p>
              <button
                onClick={() => setActiveTab("export")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "export" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Download className="size-4 shrink-0" />
                  <span>Exportation CSV</span>
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Sidebar Footer Links */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <Link
            href="/dashboard?view=student"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <BookOpen className="size-3.5" />
            <span>Espace Membre Apprenant</span>
          </Link>
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <ExternalLink className="size-3.5" />
            <span>Voir le site public</span>
          </Link>
        </div>
      </aside>

      {/* Main Workspace Workspace */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-left">
        {/* Workspace Top Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white uppercase tracking-tight">
              {activeTab === "kpi" && "Vue d'Ensemble & KPIs Financiers"}
              {activeTab === "courses" && "Gestion des Bootcamps & Leçons"}
              {activeTab === "resources" && "Bibliothèque de Prompts & Templates"}
              {activeTab === "lives" && "Sessions Live Google Meet & Replays"}
              {activeTab === "payments" && "Inscriptions & Validation Mobile Money"}
              {activeTab === "users" && "Gestion des Membres & Rôles RBAC"}
              {activeTab === "submissions" && "Correction des Devoirs sur 20"}
              {activeTab === "b2b" && "Demandes de Devis B2B Entreprises"}
              {activeTab === "export" && "Exportation des Données CSV"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Console d'Administration Super Admin — Le Guide IA
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAllData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs font-bold flex items-center gap-2"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Rafraîchir
            </button>
          </div>
        </div>

        {/* TAB 1: KPI OVERVIEW */}
        {activeTab === "kpi" && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</span>
                  <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="size-5" />
                  </div>
                </div>
                <div className="font-heading text-3xl font-black text-white">
                  {stats.totalRevenue.toLocaleString()} <span className="text-sm font-normal text-emerald-400">FCFA</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Paiements validés PayTech & Mobile Money</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inscrits</span>
                  <div className="size-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                    <Users className="size-5" />
                  </div>
                </div>
                <div className="font-heading text-3xl font-black text-white">
                  {stats.totalRegistrations} <span className="text-sm font-normal text-slate-400">apprenants</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Apprenants inscrits sur les Bootcamps</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paiements à valider</span>
                  <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <Clock className="size-5" />
                  </div>
                </div>
                <div className="font-heading text-3xl font-black text-amber-400">
                  {stats.pendingPaymentsCount} <span className="text-sm font-normal text-slate-400">en attente</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Dépôts Mobile Money Direct à vérifier</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Devis B2B Entreprises</span>
                  <div className="size-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <Building2 className="size-5" />
                  </div>
                </div>
                <div className="font-heading text-3xl font-black text-white">
                  {stats.b2bCount} <span className="text-sm font-normal text-slate-400">demandes</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Opportunités B2B d'entreprises</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="size-5 text-primary" />
                  Inscription Manuelle d'un Apprenant
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ajoutez manuellement un participant ayant effectué son versement hors plateforme pour lui débloquer immédiatement l'accès au Bootcamp.
                </p>
                <form onSubmit={handleManualEnroll} className="space-y-3 pt-2">
                  <input
                    type="email"
                    required
                    placeholder="Adresse Email du participant"
                    value={enrollEmail}
                    onChange={e => setEnrollEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none"
                  />
                  <select
                    value={enrollCourse}
                    onChange={e => setEnrollCourse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none"
                  >
                    <option value="bootcamp-pro-2">Bootcamp IA Pro 2 (99 000 FCFA)</option>
                    <option value="bootcamp-business-exec">Bootcamp IA Business Exec (199 000 FCFA)</option>
                    <option value="initiation-free">Initiation IA & ChatGPT (Gratuit)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={processingId === "enroll"}
                    className="w-full py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    {processingId === "enroll" ? "Inscription en cours..." : "Valider l'Inscription et Débloquer Accès"}
                  </button>
                </form>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <Download className="size-5 text-emerald-400" />
                    Émargement & Reporting CSV
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Téléchargez instantanément la liste complète de tous les participants inscrits avec leurs numéros WhatsApp et statuts de versement pour l'émargement des direct Google Meet.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={exportRegistrationsCSV}
                    className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-sm hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="size-4" />
                    Exporter le Fichier CSV (Excel / Google Sheets)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSES & BOOTCAMPS CRUD */}
        {activeTab === "courses" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">Gestion & Création des Bootcamps</h2>
                <p className="text-xs text-slate-400">Créez et publiez de nouvelles offres de formation visibles sur le site et l'espace membre.</p>
              </div>
              <button
                onClick={() => {
                  setCourseForm({
                    title: "",
                    slug: `bootcamp-ia-${Date.now().toString().slice(-4)}`,
                    subtitle: "",
                    price: "99 000 FCFA",
                    original_price: "150 000 FCFA",
                    badge: "OFFRE FONDATEUR",
                    category: "Bootcamp",
                    status: "published",
                    poster: "/images/bootcamp_pro_thumb.jpg",
                    dates: "Sessions Intensives Live",
                    instructor: "Alfred Dah",
                    live_meet_url: "https://meet.google.com/xyz-abc-def"
                  })
                  setShowCourseModal(true)
                }}
                className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Plus className="size-4" />
                Créer un Nouveau Bootcamp
              </button>
            </div>

            {/* Courses List */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map(c => (
                <div key={c.id || c.slug} className="p-5 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img src={c.poster || "/images/bootcamp_pro_thumb.jpg"} alt={c.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                          {c.badge}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-base leading-snug">{c.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{c.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
                      <span className="font-bold text-emerald-400">{c.price}</span>
                      <span className="text-slate-500 line-through text-[10px]">{c.original_price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => { setCourseForm(c); setShowCourseModal(true) }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 flex items-center justify-center gap-1"
                    >
                      <Edit3 className="size-3" /> Modifier
                    </button>
                    {c.id && (
                      <button
                        onClick={() => handleDeleteCourse(c.id!)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        title="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Course Modal */}
            {showCourseModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="size-5 text-primary" />
                    {courseForm.id ? "Editer la Formation" : "Créer une Nouvelle Formation"}
                  </h3>

                  <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Titre du Bootcamp</label>
                        <input
                          type="text"
                          required
                          value={courseForm.title}
                          onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Slug URL (ex: bootcamp-ia-pro-3)</label>
                        <input
                          type="text"
                          required
                          value={courseForm.slug}
                          onChange={e => setCourseForm({ ...courseForm, slug: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Description / Sous-titre</label>
                      <textarea
                        rows={2}
                        value={courseForm.subtitle}
                        onChange={e => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Prix Promo (FCFA)</label>
                        <input
                          type="text"
                          value={courseForm.price}
                          onChange={e => setCourseForm({ ...courseForm, price: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-bold text-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Prix Standard (Barré)</label>
                        <input
                          type="text"
                          value={courseForm.original_price}
                          onChange={e => setCourseForm({ ...courseForm, original_price: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Badge Promotionnel</label>
                        <input
                          type="text"
                          value={courseForm.badge}
                          onChange={e => setCourseForm({ ...courseForm, badge: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Image Poster URL (Supabase Storage)</label>
                        <input
                          type="text"
                          value={courseForm.poster}
                          onChange={e => setCourseForm({ ...courseForm, poster: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Lien Google Meet (Direct Live)</label>
                        <input
                          type="text"
                          value={courseForm.live_meet_url}
                          onChange={e => setCourseForm({ ...courseForm, live_meet_url: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowCourseModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={processingId === "save_course"}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:opacity-90"
                      >
                        Enregistrer dans Supabase
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROMPTS & RESOURCES CRUD */}
        {activeTab === "resources" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">Bibliothèque de Prompts & Templates</h2>
                <p className="text-xs text-slate-400">Ajoutez des guides, templates et prompts réutilisables réservés aux membres.</p>
              </div>
              <button
                onClick={() => {
                  setResourceForm({
                    title: "",
                    description: "",
                    category: "Productivity",
                    access_level: "Membre Premium",
                    prompt_text: "",
                    download_url: ""
                  })
                  setShowResourceModal(true)
                }}
                className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Plus className="size-4" />
                Ajouter une Ressource
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map(r => (
                <div key={r.id || r.title} className="p-5 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {r.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        r.access_level === "Gratuit" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {r.access_level}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base leading-snug">{r.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{r.downloads_count || 0} téléchargements</span>
                    <button
                      onClick={() => { setResourceForm(r); setShowResourceModal(true) }}
                      className="text-primary hover:underline font-bold"
                    >
                      Éditer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resource Modal */}
            {showResourceModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    Ajouter / Éditer une Ressource
                  </h3>

                  <form onSubmit={handleSaveResource} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Titre de la Ressource / Prompt</label>
                      <input
                        type="text"
                        required
                        value={resourceForm.title}
                        onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Catégorie</label>
                        <select
                          value={resourceForm.category}
                          onChange={e => setResourceForm({ ...resourceForm, category: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                        >
                          <option value="Productivity">Productivité</option>
                          <option value="Automation">Automation Make/n8n</option>
                          <option value="Marketing">Marketing & Copywriting</option>
                          <option value="Leadership">Leadership & Exec</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Niveau d'Accès</label>
                        <select
                          value={resourceForm.access_level}
                          onChange={e => setResourceForm({ ...resourceForm, access_level: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                        >
                          <option value="Membre Premium">Membre Premium</option>
                          <option value="Gratuit">Gratuit (Lead Gen)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Texte du Prompt Parfait</label>
                      <textarea
                        rows={3}
                        value={resourceForm.prompt_text}
                        onChange={e => setResourceForm({ ...resourceForm, prompt_text: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-primary font-mono text-[11px]"
                      />
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowResourceModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={processingId === "save_resource"}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:opacity-90"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LIVE GOOGLE MEET SESSIONS */}
        {activeTab === "lives" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">Planning des Directs Google Meet</h2>
                <p className="text-xs text-slate-400">Programmez les visioconférences et déposez les liens de replays HD.</p>
              </div>
              <button
                onClick={() => {
                  setLiveForm({
                    title: "Session Live Intensive #01",
                    course_slug: "bootcamp-pro-2",
                    meet_url: "https://meet.google.com/xyz-abc-def",
                    replay_url: "",
                    scheduled_at: new Date().toISOString(),
                    status: "upcoming"
                  })
                  setShowLiveModal(true)
                }}
                className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Plus className="size-4" />
                Programmer un Direct
              </button>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Session Live</th>
                    <th className="p-4">Date & Heure</th>
                    <th className="p-4">Lien Google Meet</th>
                    <th className="p-4">Replay HD</th>
                    <th className="p-4 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {lives.map(l => (
                    <tr key={l.id || l.title} className="hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-white">{l.title}</td>
                      <td className="p-4 text-slate-300">{new Date(l.scheduled_at).toLocaleString("fr-FR")}</td>
                      <td className="p-4 font-mono text-primary truncate max-w-xs">{l.meet_url}</td>
                      <td className="p-4 text-slate-400">{l.replay_url ? "Replay Disponible" : "En attente du direct"}</td>
                      <td className="p-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {lives.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Aucun direct programmé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Live Modal */}
            {showLiveModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <Video className="size-5 text-primary" />
                    Programmer une Session Live Google Meet
                  </h3>

                  <form onSubmit={handleSaveLive} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Titre du Live</label>
                      <input
                        type="text"
                        required
                        value={liveForm.title}
                        onChange={e => setLiveForm({ ...liveForm, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Lien de la Réunion Google Meet</label>
                      <input
                        type="text"
                        required
                        value={liveForm.meet_url}
                        onChange={e => setLiveForm({ ...liveForm, meet_url: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Date & Heure du Direct (GMT)</label>
                      <input
                        type="datetime-local"
                        value={liveForm.scheduled_at?.slice(0, 16)}
                        onChange={e => setLiveForm({ ...liveForm, scheduled_at: new Date(e.target.value).toISOString() })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowLiveModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={processingId === "save_live"}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:opacity-90"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: INSCRIPIIONS & PAIEMENTS MOBILE MONEY */}
        {activeTab === "payments" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-3 size-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher un Nom, Email, Référence..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="size-4 text-slate-400" />
                <select
                  value={paymentFilter}
                  onChange={e => setPaymentFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:border-primary outline-none"
                >
                  <option value="all">Tous les Statuts</option>
                  <option value="pending_verification">À vérifier (Mobile Money)</option>
                  <option value="confirmed">Confirmés</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>

            {/* Payments Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Participant</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Méthode & Réf</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions 1-Clic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white">
                          {p.registrations?.full_name || "Prospect Direct"}
                        </td>
                        <td className="p-4 space-y-0.5">
                          <div className="text-slate-200">{p.registrations?.email || "N/A"}</div>
                          <div className="text-[10px] text-slate-400">{p.registrations?.whatsapp || "N/A"} ({p.registrations?.country || "FR"})</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          {p.amount ? p.amount.toLocaleString() : "99 000"} {p.currency || "XOF"}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-200 uppercase">{p.method}</span>
                          {p.transaction_ref && (
                            <div className="text-[10px] font-mono text-slate-400">Réf: {p.transaction_ref}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            p.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                            p.status === "pending_verification" ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse" :
                            "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {p.status === "pending_verification" ? "À vérifier" : p.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {new Date(p.created_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {p.status !== "confirmed" && (
                            <button
                              onClick={() => handlePaymentStatus(p.id, "confirmed")}
                              disabled={processingId === p.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400 transition-colors shadow-md"
                            >
                              Valider & Envoyer Accès
                            </button>
                          )}
                          {p.status === "pending_verification" && (
                            <button
                              onClick={() => handlePaymentStatus(p.id, "rejected")}
                              disabled={processingId === p.id}
                              className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px] hover:bg-red-500/30 transition-colors"
                            >
                              Rejeter
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          Aucune transaction trouvée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: USERS & RBAC ROLES */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Utilisateur</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Rôle Actuel RBAC</th>
                      <th className="p-4">Date d'inscription</th>
                      <th className="p-4 text-right">Changer Rôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white">{u.full_name || "Utilisateur Anonyme"}</td>
                        <td className="p-4 text-slate-300">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            u.role === "super_admin" ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                            u.role === "admin" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                            "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {u.role || "student"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => handleRoleChange(u.id, "student")}
                            disabled={processingId === u.id || u.role === "student"}
                            className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 text-[10px] font-bold"
                          >
                            Student
                          </button>
                          <button
                            onClick={() => handleRoleChange(u.id, "admin")}
                            disabled={processingId === u.id || u.role === "admin"}
                            className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 disabled:opacity-40 text-[10px] font-bold"
                          >
                            Admin
                          </button>
                          <button
                            onClick={() => handleRoleChange(u.id, "super_admin")}
                            disabled={processingId === u.id || u.role === "super_admin"}
                            className="px-2 py-1 rounded bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 disabled:opacity-40 text-[10px] font-bold"
                          >
                            Super Admin
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: DEVOIRS & SUBMISSIONS */}
        {activeTab === "submissions" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Apprenant</th>
                      <th className="p-4">Exercice</th>
                      <th className="p-4">Fichier / Rendu</th>
                      <th className="p-4">Note & Statut</th>
                      <th className="p-4 text-right">Évaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {submissions.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white">{s.user_email}</td>
                        <td className="p-4 text-slate-300">{s.lesson_title || "Exercice Module 01"}</td>
                        <td className="p-4">
                          {s.submission_url ? (
                            <a href={s.submission_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="size-3" /> Voir le document soumis
                            </a>
                          ) : (
                            <span className="text-slate-500">Texte soumis</span>
                          )}
                        </td>
                        <td className="p-4">
                          {s.score !== undefined && s.score !== null ? (
                            <span className="font-bold text-emerald-400">{s.score}/20 (Validé)</span>
                          ) : (
                            <span className="text-amber-400 font-bold">À corriger</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => { setGradingSub(s); setGradeScore(s.score || 18); setGradeFeedback(s.feedback || "") }}
                            className="px-3 py-1.5 rounded-lg bg-primary text-slate-950 font-bold text-[11px] hover:opacity-90"
                          >
                            Noter le Devoir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          Aucun devoir en attente de correction.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grading Modal */}
            {gradingSub && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
                  <h3 className="font-heading text-lg font-bold text-white">Évaluation du Devoir</h3>
                  <p className="text-xs text-slate-400">Pour : <strong>{gradingSub.user_email}</strong></p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Note attribuée (/20)</label>
                      <input
                        type="number"
                        max={20}
                        min={0}
                        value={gradeScore}
                        onChange={e => setGradeScore(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-bold text-lg outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Feedback du Formateur Alfred Dah</label>
                      <textarea
                        rows={3}
                        value={gradeFeedback}
                        onChange={e => setGradeFeedback(e.target.value)}
                        placeholder="Commentaires personnalisés pour l'apprenant..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setGradingSub(null)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleGradeSubmission}
                      disabled={processingId === gradingSub.id}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                    >
                      Enregistrer la Note
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: DEMANDES B2B */}
        {activeTab === "b2b" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Entreprise & Contact</th>
                      <th className="p-4">Email / Tél</th>
                      <th className="p-4">Secteur & Effectif</th>
                      <th className="p-4">Besoins</th>
                      <th className="p-4">Statut Lead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {b2bRequests.map(b => (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white">{b.company_name}</div>
                          <div className="text-slate-400 text-[11px]">{b.contact_name}</div>
                        </td>
                        <td className="p-4">
                          <div>{b.email}</div>
                          <div className="text-slate-400">{b.phone || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <div>{b.sector || "Général"}</div>
                          <div className="text-slate-400 text-[10px]">{b.employees || "10-50"} employés</div>
                        </td>
                        <td className="p-4 max-w-xs text-slate-300 truncate">{b.needs || "Formation & Audit IA"}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            {b.status || "Nouveau"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {b2bRequests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          Aucune demande de devis B2B enregistrée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: EXPORT CSV */}
        {activeTab === "export" && (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-6 animate-fadeIn">
            <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Download className="size-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="font-heading text-xl font-bold text-white">Exportation Intégrale des Participants</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Générez le fichier CSV d'émargement contenant les Noms, Emails, Numéros WhatsApp, Pays, Montants versés et Références de transaction pour l'organisation des direct Google Meet.
              </p>
            </div>
            <button
              onClick={exportRegistrationsCSV}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors shadow-xl"
            >
              Télécharger le Fichier CSV (.csv)
            </button>
          </div>
        )}

      </main>
    </div>
  )
}

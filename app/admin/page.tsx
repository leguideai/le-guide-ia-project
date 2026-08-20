"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { FileUploadField } from "@/components/ui/file-upload-field"
import { formatVideoEmbedUrl, HeroVslVideo } from "@/components/vsl-hero-video"
import { FormationItem, FormationCategory } from "@/lib/formations-data"
import { 
  ShieldAlert, ShieldCheck, Users, DollarSign, BookOpen, FileCheck, 
  Building2, Download, CheckCircle2, XCircle, Clock, Search, RefreshCw, 
  ExternalLink, Award, Mail, ArrowRight, UserPlus, Filter, Plus,
  Edit3, Trash2, Video, Calendar, Sparkles, Layers, FileText, Lock,
  ArrowUp, ArrowDown, Eye, MessageCircle, LogOut, Shuffle, Play, Menu, X,
  Bot, Film, ShoppingBag, Zap, CalendarCheck, Quote, MessageSquare, Star
} from "lucide-react"
import { BootcampCalendar, CalendarEvent } from "@/components/bootcamp-calendar"
import { AnalyticsChart } from "@/components/analytics-chart"

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  )
}

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
  thumbnail?: string
  pdf_url?: string
  format?: string
  certificate?: string
  sequence_order?: number
  dates?: string
  start_date?: string
  end_date?: string
  offer_start_date?: string
  offer_end_date?: string
  offer_badge_text?: string
  session_count?: number
  instructor?: string
  live_meet_url?: string
  whatsapp_url?: string
  features?: any
  skills?: any
}

interface BootcampSession {
  id?: string
  course_id: string
  course_slug?: string
  session_number: number
  title: string
  description?: string
  scheduled_at: string
  ends_at?: string
  meet_url?: string
  recording_url?: string
  homework_title?: string
  homework_description?: string
  homework_file_url?: string
  homework_deadline?: string
  status: "upcoming" | "live" | "completed"
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

interface TestimonialItem {
  id?: string
  name: string
  role: string
  country?: string
  text: string
  avatar_url?: string
  image?: string
  rating?: number
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"kpi" | "courses" | "formations" | "resources" | "lives" | "newsletter" | "testimonials" | "payments" | "users" | "submissions" | "b2b" | "export" | "settings">("kpi")
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
  const [formations, setFormations] = useState<FormationItem[]>([])
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [aiTools, setAiTools] = useState<any[]>([])
  const [lives, setLives] = useState<LiveSession[]>([])
  const [allSessions, setAllSessions] = useState<BootcampSession[]>([])
  const [showCohortModal, setShowCohortModal] = useState(false)
  const [cohortForm, setCohortForm] = useState({ courseId: "", startDate: "" })
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([])
  const [newSubscriberEmail, setNewSubscriberEmail] = useState("")
  const [addingSubscriber, setAddingSubscriber] = useState(false)
  const [broadcastForm, setBroadcastForm] = useState({
    subject: "",
    title: "",
    bodyHtml: "",
    includePlatformMembers: false,
    isTest: false
  })
  const [sendingBroadcast, setSendingBroadcast] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<any>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([])
  const [b2bRequests, setB2bRequests] = useState<B2BRecord[]>([])
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [showTestimonialModal, setShowTestimonialModal] = useState(false)
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null)
  const [savingTestimonial, setSavingTestimonial] = useState(false)
  const [testimonialSearch, setTestimonialSearch] = useState("")
  const [testimonialForm, setTestimonialForm] = useState<TestimonialItem>({
    name: "",
    role: "",
    country: "",
    text: "",
    avatar_url: "",
    rating: 5
  })

  // Filters & Notice
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)

  // Payment Edit & Delete State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null)
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    id: "",
    registration_id: "",
    full_name: "",
    email: "",
    whatsapp: "",
    country: "",
    amount: 0,
    currency: "XOF",
    method: "Mobile Money",
    transaction_ref: "",
    status: "pending_verification"
  })

  // Formations Modals & Form State
  const [showFormationModal, setShowFormationModal] = useState(false)
  const [editingFormation, setEditingFormation] = useState<FormationItem | null>(null)
  const [featuresText, setFeaturesText] = useState("")
  const [formationCategories, setFormationCategories] = useState<FormationCategory[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<FormationCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState<Partial<FormationCategory>>({
    label: "",
    slug: "",
    icon: "sparkles",
    order_index: 1,
    is_active: true
  })
  const [formationForm, setFormationForm] = useState<Partial<FormationItem>>({
    title: "",
    slug: "",
    tagline: "",
    description: "",
    badge: "Nouveau",
    tool_icon: "chatgpt",
    category_slug: "",
    thumbnail: "",
    instructor: "Alfred Dah",
    rating: 5,
    reviews_count: "",
    duration: "",
    modules_count: "",
    prompts_count: "",
    price: 0,
    original_price: "",
    currency: "FCFA",
    features: [],
    stats: [],
    testimonial: undefined,
    order_index: 1,
    is_active: true
  })

  // Modals Creation States
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [courseForm, setCourseForm] = useState<Partial<BootcampCourse>>({
    title: "",
    slug: "",
    subtitle: "",
    price: "",
    original_price: "",
    badge: "Nouveau",
    category: "Bootcamp",
    status: "published",
    thumbnail: "",
    poster: "",
    pdf_url: "",
    format: "100% En Ligne",
    certificate: "Certificat Officiel",
    sequence_order: 1,
    dates: "",
    start_date: "",
    end_date: "",
    offer_start_date: "",
    offer_end_date: "",
    offer_badge_text: "",
    session_count: 0,
    instructor: "Alfred Dah",
    live_meet_url: "",
    whatsapp_url: ""
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (typeof window !== "undefined") {
      localStorage.clear()
      window.location.href = "/login"
    }
  }

  // Sessions live par bootcamp
  const [bootcampSessions, setBootcampSessions] = useState<BootcampSession[]>([])
  const [selectedCourseForSessions, setSelectedCourseForSessions] = useState<BootcampCourse | null>(null)
  const [showSessionModal, setShowSessionModal] = useState(false)

  // Details Modal State
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<BootcampCourse | null>(null)
  const [detailsSessions, setDetailsSessions] = useState<BootcampSession[]>([])
  const [detailsEnrolledCount, setDetailsEnrolledCount] = useState<number>(0)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  async function openCourseDetails(c: BootcampCourse) {
    setSelectedCourseDetails(c)
    setShowDetailsModal(true)
    setLoadingDetails(true)
    setDetailsSessions([])
    setDetailsEnrolledCount(0)

    try {
      // 1. Fetch sessions
      let query = supabase.from("bootcamp_sessions").select("*")
      if (c.id && c.slug) {
        query = query.or(`course_id.eq.${c.id},course_id.eq.${c.slug},course_slug.eq.${c.slug}`)
      } else if (c.id) {
        query = query.or(`course_id.eq.${c.id},course_id.eq.${c.slug}`)
      } else {
        query = query.eq("course_slug", c.slug)
      }
      let { data: sessData } = await query.order("session_number", { ascending: true })

      setDetailsSessions(sessData || [])

      // 2. Fetch enrolled count from registrations
      let regQuery = supabase.from("registrations").select("id", { count: "exact", head: true })
      if (c.id && c.slug) {
        regQuery = regQuery.or(`course_id.eq.${c.id},course_slug.eq.${c.slug}`)
      } else if (c.id) {
        regQuery = regQuery.eq("course_id", c.id)
      } else {
        regQuery = regQuery.eq("course_slug", c.slug)
      }
      const { count } = await regQuery
      setDetailsEnrolledCount(count || 0)
    } catch (err) {
      console.error("Error fetching details:", err)
    } finally {
      setLoadingDetails(false)
    }
  }

  async function openCourseSessions(c: BootcampCourse) {
    setSelectedCourseForSessions(c)

    let query = supabase.from("bootcamp_sessions").select("*")
    if (c.id && c.slug) {
      query = query.or(`course_id.eq.${c.id},course_id.eq.${c.slug},course_slug.eq.${c.slug}`)
    } else if (c.id) {
      query = query.or(`course_id.eq.${c.id},course_id.eq.${c.slug}`)
    } else {
      query = query.eq("course_slug", c.slug)
    }
    let { data: sessData } = await query.order("session_number", { ascending: true })

    const fetched = sessData || []
    setBootcampSessions(fetched)
    setSessionForm({
      session_number: fetched.length + 1,
      title: "",
      description: "",
      scheduled_at: "",
      ends_at: "",
      meet_url: c.live_meet_url || "",
      recording_url: "",
      homework_title: "",
      homework_description: "",
      homework_file_url: "",
      homework_deadline: "",
      status: "upcoming"
    })
    setShowSessionModal(true)
  }
  const [sessionForm, setSessionForm] = useState<Partial<BootcampSession>>({
    session_number: 1,
    title: "",
    description: "",
    scheduled_at: "",
    ends_at: "",
    meet_url: "",
    recording_url: "",
    homework_title: "",
    homework_description: "",
    homework_file_url: "",
    homework_deadline: "",
    status: "upcoming"
  })

  const handleUploadCoursePoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingPoster(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", "course-posters")
      formData.append("folder", "posters")

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()

      if (data.url) {
        setCourseForm(prev => ({ ...prev, poster: data.url }))
        setNoticeMessage("Affiche de formation téléversée avec succès dans Supabase !")
      } else {
        alert(data.error || "Erreur de téléversement.")
      }
    } catch (err: any) {
      alert("Erreur lors du téléversement: " + err.message)
    } finally {
      setUploadingPoster(false)
    }
  }

  const [showResourceModal, setShowResourceModal] = useState(false)
  const [resourceForm, setResourceForm] = useState<Partial<ResourceItem>>({
    title: "",
    description: "",
    category: "",
    access_level: "Gratuit",
    prompt_text: "",
    download_url: ""
  })

  const [showLiveModal, setShowLiveModal] = useState(false)
  const [liveForm, setLiveForm] = useState<Partial<LiveSession>>({
    title: "",
    course_slug: "",
    meet_url: "",
    replay_url: "",
    scheduled_at: "",
    status: "upcoming"
  })

  // Manual Enroll Form
  const [enrollEmail, setEnrollEmail] = useState("")
  const [enrollFullName, setEnrollFullName] = useState("")
  const [enrollCourse, setEnrollCourse] = useState("")
  const [enrollPaymentMethod, setEnrollPaymentMethod] = useState("")
  const [enrollTransactionRef, setEnrollTransactionRef] = useState("")
  const [enrollSendEmail, setEnrollSendEmail] = useState(true)
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)

  // Storage Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  // Grading modal state
  const [gradingSub, setGradingSub] = useState<SubmissionRecord | null>(null)
  const [gradeScore, setGradeScore] = useState<number>(0)
  const [gradeFeedback, setGradeFeedback] = useState("")

  // Site Settings state
  const [siteSettings, setSiteSettings] = useState<any>({
    announcement_text: "",
    announcement_cta: "",
    vsl_youtube_url: "",
    vsl_videos_pool: "",
    hero_badge: "",
    hero_title: "",
    hero_subtitle: "",
    hero_dates: "",
    hero_time: "",
    hero_format: "",
    hero_sessions: "",
    hero_promo_price: "",
    hero_normal_price: "",
    whatsapp_number: "",
    hero_poster_url: "",
    hero_programme_url: ""
  })
  const [savingSettings, setSavingSettings] = useState(false)

  // VSL Videos Pool state
  const [vslVideosList, setVslVideosList] = useState<HeroVslVideo[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showVslModal, setShowVslModal] = useState(false)
  const [editingVslIdx, setEditingVslIdx] = useState<number | null>(null)
  const [vslForm, setVslForm] = useState<HeroVslVideo>({
    id: "",
    title: "",
    video_url: "",
    badge: "Témoignage Apprenant",
    author_name: "",
    author_role: "",
    is_active: true
  })

  function handleOpenAddVslVideo() {
    setEditingVslIdx(null)
    setVslForm({
      id: "vsl-" + Date.now(),
      title: "",
      video_url: "",
      badge: "Témoignage Apprenant",
      author_name: "",
      author_role: "",
      is_active: true
    })
    setShowVslModal(true)
  }

  function handleOpenEditVslVideo(v: HeroVslVideo, idx: number) {
    setEditingVslIdx(idx)
    setVslForm({ ...v })
    setShowVslModal(true)
  }

  async function handleSaveVslVideo(e: React.FormEvent) {
    e.preventDefault()
    if (!vslForm.title || !vslForm.video_url) {
      alert("Veuillez renseigner le titre et le lien/fichier vidéo.")
      return
    }

    const formattedUrl = formatVideoEmbedUrl(vslForm.video_url)
    const updatedVideo: HeroVslVideo = {
      ...vslForm,
      video_url: formattedUrl,
      id: vslForm.id || "vsl-" + Date.now()
    }

    let updatedList: HeroVslVideo[] = []
    if (editingVslIdx !== null) {
      updatedList = [...vslVideosList]
      updatedList[editingVslIdx] = updatedVideo
    } else {
      updatedList = [...vslVideosList, updatedVideo]
    }

    setVslVideosList(updatedList)
    const newSettings = {
      ...siteSettings,
      vsl_videos_pool: JSON.stringify(updatedList),
      vsl_youtube_url: updatedList[0]?.video_url || siteSettings.vsl_youtube_url
    }
    setSiteSettings(newSettings)
    setShowVslModal(false)

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings })
      })
      showNotice("Vidéo VSL / Témoignage enregistré et actif !")
    } catch (e) {}
  }

  async function handleDeleteVslVideo(idx: number) {
    if (!confirm("Voulez-vous supprimer cette vidéo de la rotation ?")) return
    const updatedList = vslVideosList.filter((_, i) => i !== idx)
    setVslVideosList(updatedList)
    const newSettings = {
      ...siteSettings,
      vsl_videos_pool: JSON.stringify(updatedList),
      vsl_youtube_url: updatedList[0]?.video_url || siteSettings.vsl_youtube_url
    }
    setSiteSettings(newSettings)

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings })
      })
      showNotice("Vidéo supprimée de la rotation.")
    } catch (e) {}
  }

  async function handleToggleVslActive(idx: number) {
    const updatedList = [...vslVideosList]
    updatedList[idx].is_active = !updatedList[idx].is_active
    setVslVideosList(updatedList)
    const newSettings = {
      ...siteSettings,
      vsl_videos_pool: JSON.stringify(updatedList)
    }
    setSiteSettings(newSettings)

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings })
      })
    } catch (e) {}
  }

  useEffect(() => {
    checkAdminAccess()
    fetchAllData()
  }, [])

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const payloadSettings = {
        ...siteSettings,
        vsl_videos_pool: JSON.stringify(vslVideosList)
      }
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payloadSettings })
      })
      const data = await res.json()
      if (data.success) {
        showNotice("Configuration du site enregistrée et immédiatement active sur la landing page !")
      } else {
        alert("Erreur lors de l'enregistrement : " + (data.error || ""))
      }
    } catch (err) {
      alert("Erreur réseau lors de l'enregistrement des paramètres")
    } finally {
      setSavingSettings(false)
    }
  }

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

      // 2. Courses (Bootcamps Live)
      const resCourses = await fetch("/api/admin/courses")
      const dataCourses = await resCourses.json()
      if (dataCourses.courses) setCourses(dataCourses.courses)

      // 2.b Formations Vidéos (À la demande)
      const resFormations = await fetch("/api/admin/formations")
      const dataFormations = await resFormations.json()
      if (dataFormations.formations) setFormations(dataFormations.formations)
      if (dataFormations.categories) setFormationCategories(dataFormations.categories)

      // 3. Resources (Prompts & Blueprints)
      const resRes = await fetch("/api/admin/resources")
      const dataRes = await resRes.json()
      if (dataRes.resources) setResources(dataRes.resources)

      // 3.b AI Tools
      const resTools = await fetch("/api/admin/tools")
      const dataTools = await resTools.json()
      if (dataTools.tools) setAiTools(dataTools.tools)

      // 4. Lives
      const resLives = await fetch("/api/admin/lives")
      const dataLives = await resLives.json()
      if (dataLives.lives) setLives(dataLives.lives)

      // 4.b Bootcamp Sessions for Calendar
      const { data: allSess } = await supabase.from("bootcamp_sessions").select("*").order("session_number", { ascending: true })
      if (allSess) setAllSessions(allSess)

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

      // 9. Site Settings
      const resSettings = await fetch("/api/admin/settings")
      const dataSettings = await resSettings.json()
      if (dataSettings.settings) setSiteSettings(dataSettings.settings)

      // 10. Newsletter Subscribers
      const resNews = await fetch("/api/newsletter")
      const dataNews = await resNews.json()
      if (dataNews.subscribers) setNewsletterSubscribers(dataNews.subscribers)

      // 11. Testimonials
      const resTestimonials = await fetch("/api/testimonials")
      const dataTestimonials = await resTestimonials.json()
      if (dataTestimonials.testimonials) setTestimonials(dataTestimonials.testimonials)
    } catch (err) {
      console.error("Fetch admin data error:", err)
    } finally {
      setLoading(false)
    }
  }

  function handleOpenAddTestimonial() {
    setEditingTestimonialId(null)
    setTestimonialForm({
      name: "",
      role: "",
      country: "",
      text: "",
      avatar_url: "",
      rating: 5
    })
    setShowTestimonialModal(true)
  }

  function handleOpenEditTestimonial(t: TestimonialItem) {
    setEditingTestimonialId(t.id || null)
    setTestimonialForm({
      id: t.id,
      name: t.name,
      role: t.role || "",
      country: t.country || "",
      text: t.text,
      avatar_url: t.avatar_url || t.image || "",
      rating: t.rating || 5
    })
    setShowTestimonialModal(true)
  }

  async function handleSaveTestimonial(e: React.FormEvent) {
    e.preventDefault()
    if (!testimonialForm.name.trim() || !testimonialForm.text.trim()) {
      alert("Veuillez renseigner au minimum le nom et le texte du témoignage.")
      return
    }

    setSavingTestimonial(true)
    try {
      if (editingTestimonialId) {
        const res = await fetch("/api/testimonials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTestimonialId,
            name: testimonialForm.name,
            role: testimonialForm.role,
            country: testimonialForm.country,
            text: testimonialForm.text,
            avatar_url: testimonialForm.avatar_url || null,
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Erreur lors de la modification")
        setNoticeMessage("Témoignage mis à jour avec succès !")
      } else {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: testimonialForm.name,
            role: testimonialForm.role,
            country: testimonialForm.country,
            text: testimonialForm.text,
            avatar_url: testimonialForm.avatar_url || null,
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Erreur lors de l'ajout")
        setNoticeMessage("Nouveau témoignage ajouté avec succès !")
      }

      setShowTestimonialModal(false)
      setEditingTestimonialId(null)
      const resRefresh = await fetch("/api/testimonials")
      const dataRefresh = await resRefresh.json()
      if (dataRefresh.testimonials) setTestimonials(dataRefresh.testimonials)
    } catch (err: any) {
      alert("Erreur: " + err.message)
    } finally {
      setSavingTestimonial(false)
    }
  }

  async function handleDeleteTestimonial(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce témoignage ?")) return
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur de suppression")
      setTestimonials(prev => prev.filter(t => t.id !== id))
      setNoticeMessage("Témoignage supprimé avec succès.")
    } catch (err: any) {
      alert("Erreur: " + err.message)
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

  // Reorder Course (Up / Down)
  async function handleMoveCourse(course: BootcampCourse, direction: "up" | "down") {
    const currentIndex = courses.findIndex(c => (c.id && c.id === course.id) || c.slug === course.slug)
    if (currentIndex === -1) return
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= courses.length) return

    const newCourses = [...courses]
    const temp = newCourses[currentIndex]
    newCourses[currentIndex] = newCourses[targetIndex]
    newCourses[targetIndex] = temp

    const updatedCurrent = { ...newCourses[currentIndex], sequence_order: currentIndex + 1 }
    const updatedTarget = { ...newCourses[targetIndex], sequence_order: targetIndex + 1 }
    newCourses[currentIndex] = updatedCurrent
    newCourses[targetIndex] = updatedTarget

    setCourses(newCourses)

    try {
      await Promise.all([
        fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCurrent)
        }),
        fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTarget)
        })
      ])
      showNotice("Ordre d'affichage des bootcamps mis à jour !")
      await fetchAllData()
    } catch (e) {
      console.error("Reorder error:", e)
    }
  }

  // ================= FORMATIONS VIDÉOS (À LA DEMANDE) =================
  function openNewFormation() {
    setEditingFormation(null)
    setFormationForm({
      title: "",
      slug: "",
      tagline: "",
      description: "",
      badge: "Nouveau",
      tool_icon: "chatgpt",
      thumbnail: "/images/formation_chatgpt_thumb.jpg",
      instructor: "Alfred Dah · Expert IA & Automatisation",
      rating: 4.9,
      reviews_count: "150+ avis",
      duration: "10h de vidéo",
      modules_count: "20 leçons",
      prompts_count: "100+ prompts",
      price: 39000,
      original_price: "69 000 FCFA",
      currency: "FCFA",
      features: [
        "Modules complets et cas pratiques guidés étape par étape",
        "Méthodes et prompts réutilisables immédiatement",
        "Modèles et templates à télécharger",
        "Accès à vie et mises à jour continues"
      ],
      stats: [
        { label: "Parties", value: "4" },
        { label: "Leçons vidéo", value: "20" },
        { label: "De contenu", value: "10h" }
      ],
      testimonial: {
        quote: "Une formation claire, immédiatement applicable avec des résultats concrets dès la première semaine.",
        author_name: "Jean Kouassi",
        author_role: "Directeur de Projet",
        avatar_initials: "JK",
        rating: 5
      },
      order_index: formations.length + 1,
      is_active: true
    })
    setFeaturesText("Modules complets et cas pratiques guidés étape par étape\nMéthodes et prompts réutilisables immédiatement\nModèles et templates à télécharger\nAccès à vie et mises à jour continues")
    setShowFormationModal(true)
  }

  function openEditFormation(f: FormationItem) {
    setEditingFormation(f)
    setFormationForm(f)
    setFeaturesText((f.features || []).join("\n"))
    setShowFormationModal(true)
  }

  async function handleSaveFormation(e: React.FormEvent) {
    e.preventDefault()
    setProcessingId("save_formation")
    try {
      const parsedFeatures = featuresText.split("\n").map(l => l.trim()).filter(Boolean)
      const payload = {
        ...formationForm,
        features: parsedFeatures.length > 0 ? parsedFeatures : formationForm.features
      }
      const res = await fetch("/api/admin/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", formation: payload })
      })
      const data = await res.json()
      if (data.success) {
        showNotice("Formation vidéo enregistrée avec succès !")
        setShowFormationModal(false)
        if (data.formations) setFormations(data.formations)
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

  async function handleDeleteFormation(f: FormationItem) {
    if (!confirm(`Voulez-vous vraiment supprimer la formation "${f.title}" ?`)) return
    try {
      const res = await fetch("/api/admin/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", formationId: f.id, formationSlug: f.slug })
      })
      const data = await res.json()
      if (data.success) {
        showNotice("Formation supprimée.")
        if (data.formations) setFormations(data.formations)
        fetchAllData()
      }
    } catch (e) {
      alert("Erreur lors de la suppression")
    }
  }

  async function handleToggleFormationActive(f: FormationItem) {
    try {
      const res = await fetch("/api/admin/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_active", formationId: f.id, formationSlug: f.slug })
      })
      const data = await res.json()
      if (data.success && data.formations) {
        setFormations(data.formations)
        showNotice(f.is_active ? "Formation masquée du site public" : "Formation activée sur le site public")
      }
    } catch (e) {}
  }

  // ================= CATÉGORIES DE FORMATIONS CRUD =================
  function openNewCategory() {
    setEditingCategory(null)
    setCategoryForm({
      label: "",
      slug: "",
      icon: "sparkles",
      order_index: formationCategories.length + 1,
      is_active: true
    })
    setShowCategoryModal(true)
  }

  function openEditCategory(cat: FormationCategory) {
    setEditingCategory(cat)
    setCategoryForm(cat)
    setShowCategoryModal(true)
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryForm.label || !categoryForm.slug) return
    setProcessingId("save_category")
    try {
      const res = await fetch("/api/admin/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_category", category: categoryForm })
      })
      const data = await res.json()
      if (data.success) {
        showNotice("Catégorie enregistrée avec succès !")
        setShowCategoryModal(false)
        if (data.categories) setFormationCategories(data.categories)
      } else {
        alert(data.error || "Erreur de sauvegarde de la catégorie")
      }
    } catch (e) {
      alert("Erreur réseau lors de la sauvegarde de la catégorie")
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDeleteCategory(cat: FormationCategory) {
    if (!confirm(`Voulez-vous vraiment supprimer la catégorie "${cat.label}" ?`)) return
    try {
      const res = await fetch("/api/admin/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_category", categoryId: cat.id, categorySlug: cat.slug })
      })
      const data = await res.json()
      if (data.success && data.categories) {
        showNotice("Catégorie supprimée.")
        setFormationCategories(data.categories)
      }
    } catch (e) {
      alert("Erreur lors de la suppression de la catégorie")
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
        body: JSON.stringify({
          action: "enroll_course",
          userEmail: enrollEmail,
          userName: enrollFullName,
          courseSlug: enrollCourse,
          paymentMethod: enrollPaymentMethod,
          transactionRef: enrollTransactionRef,
          sendEmail: enrollSendEmail
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message)
        setEnrollEmail("")
        setEnrollFullName("")
        setEnrollPaymentMethod("")
        setEnrollTransactionRef("")
        setEnrollSendEmail(true)
        setShowEmailSuggestions(false)
        fetchAllData()
      } else {
        alert(data.error || "Erreur lors de l'inscription manuelle.")
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

  // Open Edit Payment Modal
  function handleOpenEditPayment(payment: PaymentRecord) {
    setEditingPayment(payment)
    setPaymentForm({
      id: payment.id,
      registration_id: payment.registration_id || "",
      full_name: payment.registrations?.full_name || "",
      email: payment.registrations?.email || "",
      whatsapp: payment.registrations?.whatsapp || "",
      country: payment.registrations?.country || "",
      amount: payment.amount || 0,
      currency: payment.currency || "XOF",
      method: payment.method || "Mobile Money",
      transaction_ref: payment.transaction_ref || "",
      status: payment.status || "pending_verification"
    })
    setShowPaymentModal(true)
  }

  // Save / Update Payment & Registration
  async function handleSavePayment(e: React.FormEvent) {
    e.preventDefault()
    setSavingPayment(true)
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm)
      })
      const data = await res.json()
      if (data.success) {
        showNotice("Inscription & Paiement mis à jour avec succès !")
        setShowPaymentModal(false)
        fetchAllData()
      } else {
        alert(data.error || "Erreur lors de la mise à jour.")
      }
    } catch (err: any) {
      alert("Erreur de communication : " + err.message)
    } finally {
      setSavingPayment(false)
    }
  }

  // Delete Payment & Registration
  async function handleDeletePayment(paymentId: string, registrationId?: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette inscription et son paiement ? Cette action est irréversible.")) return
    setProcessingId(paymentId)
    try {
      const url = registrationId 
        ? `/api/admin/payments?id=${paymentId}&registration_id=${registrationId}`
        : `/api/admin/payments?id=${paymentId}`
      const res = await fetch(url, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showNotice("Inscription & Paiement supprimés avec succès.")
        setPayments(prev => prev.filter(p => p.id !== paymentId))
        fetchAllData()
      } else {
        alert(data.error || "Erreur lors de la suppression")
      }
    } catch (err: any) {
      alert("Erreur de suppression : " + err.message)
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

  // Compute Calendar Events for Admin Dashboard
  const adminCalendarEvents = useMemo(() => {
    const rawEvents = (allSessions || []).map((s: BootcampSession) => {
      const course = courses.find(c => c.id === s.course_id || c.slug === s.course_slug || c.slug === s.course_id)
      const dateStr = s.scheduled_at 
        ? String(s.scheduled_at).split("T")[0]
        : "2026-08-31"

      const isBusiness = Number(course?.price) >= 140000 || 
        String(course?.slug || "").includes("business") || 
        String(s.title || "").toLowerCase().includes("business")

      return {
        id: s.id || `sess-${s.session_number}-${dateStr}`,
        courseId: s.course_id || course?.id || "",
        courseSlug: s.course_slug || course?.slug || "",
        courseTitle: course?.title || s.title || "Session Live",
        track: isBusiness ? ("business" as const) : ("carriere" as const),
        eventType: "session" as const,
        sessionNumber: s.session_number,
        title: s.title,
        description: s.description || "",
        date: dateStr,
        startTime: s.scheduled_at && s.scheduled_at.includes("T") ? s.scheduled_at.split("T")[1].slice(0, 5) : "19:00",
        endTime: s.ends_at && s.ends_at.includes("T") ? s.ends_at.split("T")[1].slice(0, 5) : "21:00",
        instructor: course?.instructor || "Alfred Dah",
        meetUrl: s.meet_url || course?.live_meet_url,
        recordingUrl: s.recording_url,
        whatsappUrl: course?.whatsapp_url,
        status: s.status || "upcoming"
      }
    })

    const cohortLaunches = courses
      .filter(c => c.start_date)
      .map(c => {
        const isBusiness = Number(c.price) >= 140000 || String(c.slug || "").includes("business") || String(c.title || "").toLowerCase().includes("business")
        const dateStr = String(c.start_date).split("T")[0]
        return {
          id: `launch-${c.id || c.slug}-${dateStr}`,
          courseId: c.id || c.slug,
          courseSlug: c.slug,
          courseTitle: c.title,
          track: isBusiness ? ("business" as const) : ("carriere" as const),
          eventType: "bootcamp_launch" as const,
          title: `🚀 Rentrée Officielle — ${c.title}`,
          description: c.subtitle || "Lancement officiel de la cohorte.",
          date: dateStr,
          duration: `${c.session_count || 7} Jours Intensifs`,
          startTime: "19:00",
          endTime: "21:00",
          instructor: c.instructor || "Alfred Dah",
          status: "upcoming" as const
        }
      })

    return [...cohortLaunches, ...rawEvents]
  }, [allSessions, courses])

  // Generate Cohort Handler for Admin
  async function handleGenerateCohort(courseId: string, startDateStr: string) {
    const course = courses.find(c => c.id === courseId || c.slug === courseId) || courses[0]
    if (!course || !startDateStr) return

    const start = new Date(startDateStr)
    const sessionCount = course.session_count && Number(course.session_count) > 0 ? Number(course.session_count) : 7
    
    // Check if course has lessons defined in Supabase
    let courseLessons: string[] = []
    if (Array.isArray((course as any).lessons) && (course as any).lessons.length > 0) {
      courseLessons = (course as any).lessons.map((l: any) => typeof l === "string" ? l : (l.title || `Module`))
    }

    const payload = Array.from({ length: sessionCount }, (_, idx) => {
      const cur = new Date(start)
      cur.setDate(start.getDate() + idx)
      const datePart = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`
      const sched = `${datePart}T19:00:00Z`
      const end = `${datePart}T21:00:00Z`

      const sessionTitle = courseLessons[idx] 
        ? `Session ${idx + 1} : ${courseLessons[idx]}`
        : `Session ${idx + 1} : ${course.title} — Module ${idx + 1}`

      return {
        course_id: course.id || course.slug,
        course_slug: course.slug,
        session_number: idx + 1,
        title: sessionTitle,
        description: `Session intensive en direct avec ${course.instructor || "le formateur"} sur Google Meet.`,
        scheduled_at: sched,
        ends_at: end,
        meet_url: course.live_meet_url || "https://meet.google.com",
        status: "upcoming"
      }
    })

    try {
      const { data, error } = await supabase.from("bootcamp_sessions").insert(payload).select()
      if (!error && data) {
        setAllSessions(prev => [...prev, ...data])
        showNotice(`Cohorte de ${sessionCount} sessions générée avec succès pour ${course.title} !`)
        setShowCohortModal(false)
      } else {
        showNotice("Erreur lors de la création de la cohorte.")
      }
    } catch (e) {
      showNotice("Erreur réseau lors de la génération.")
    }
  }

  // Newsletter Actions
  async function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault()
    if (!broadcastForm.subject || !broadcastForm.bodyHtml) return
    setSendingBroadcast(true)
    setBroadcastResult(null)
    try {
      const res = await fetch("/api/admin/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(broadcastForm)
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setBroadcastResult(data)
        showNotice(`Diffusion envoyée avec succès à ${data.sentCount} destinataire(s) via alfred@leguideai.com !`)
      } else {
        showNotice(data.message || "Erreur lors de l'envoi de la diffusion.")
      }
    } catch (err) {
      showNotice("Erreur réseau lors de la diffusion.")
    } finally {
      setSendingBroadcast(false)
    }
  }

  async function handleAddSubscriber(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubscriberEmail || !newSubscriberEmail.includes("@")) return
    setAddingSubscriber(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newSubscriberEmail, source: "admin_manual" })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showNotice(`Abonné "${newSubscriberEmail}" enregistré avec succès !`)
        setNewSubscriberEmail("")
        const rNews = await fetch("/api/newsletter")
        const dNews = await rNews.json()
        if (dNews.subscribers) setNewsletterSubscribers(dNews.subscribers)
      } else {
        showNotice(data.message || "Erreur lors de l'enregistrement.")
      }
    } catch (err) {
      showNotice("Erreur réseau.")
    } finally {
      setAddingSubscriber(false)
    }
  }

  async function handleDeleteSubscriber(sub: any) {
    if (!confirm(`Supprimer l'abonné "${sub.email}" de la newsletter ?`)) return
    try {
      const res = await fetch(`/api/newsletter?id=${sub.id || ""}&email=${encodeURIComponent(sub.email)}`, {
        method: "DELETE"
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setNewsletterSubscribers(prev => prev.filter(s => s.email !== sub.email && s.id !== sub.id))
        showNotice("Abonné supprimé.")
      } else {
        showNotice(data.message || "Erreur de suppression.")
      }
    } catch (e) {
      showNotice("Erreur réseau.")
    }
  }

  // Audience Computation
  const newsletterEmailSet = useMemo(() => {
    return new Set(newsletterSubscribers.map(s => s.email?.toLowerCase().trim()).filter(Boolean))
  }, [newsletterSubscribers])

  const nonSubscribedMembers = useMemo(() => {
    const emails = new Set<string>()
    users.forEach(u => {
      if (u.email) {
        const em = u.email.toLowerCase().trim()
        if (!newsletterEmailSet.has(em)) emails.add(em)
      }
    })
    payments.forEach(p => {
      const em = p.registrations?.email?.toLowerCase().trim()
      if (em && !newsletterEmailSet.has(em)) emails.add(em)
    })
    return Array.from(emails)
  }, [users, payments, newsletterEmailSet])

  const totalBroadcastRecipients = broadcastForm.includePlatformMembers
    ? newsletterSubscribers.length + nonSubscribedMembers.length
    : newsletterSubscribers.length

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="size-16 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert className="size-8 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 font-heading">Accès Restreint Super Admin</h1>
        <p className="text-sm text-slate-500 max-w-md">
          Vous devez posséder les privilèges <strong>super_admin</strong> ou <strong>admin</strong> pour accéder à cette interface.
        </p>
        <Link href="/dashboard" className="px-6 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-sm hover:opacity-90 transition-opacity">
          Retour au Dashboard Apprenant
        </Link>
      </div>
    )
  }

  const filteredPayments = payments.filter(p => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = !q || 
      p.registrations?.full_name?.toLowerCase().includes(q) ||
      p.registrations?.email?.toLowerCase().includes(q) ||
      p.registrations?.whatsapp?.toLowerCase().includes(q) ||
      p.registrations?.country?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q) ||
      p.transaction_ref?.toLowerCase().includes(q)

    const matchesFilter = paymentFilter === "all" || 
      p.status === paymentFilter || 
      (paymentFilter === "pending_verification" && (p.status === "pending" || p.status === "pending_verification")) ||
      (paymentFilter === "rejected" && (p.status === "rejected" || p.status === "failed"))
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 font-sans flex flex-col md:flex-row selection:bg-primary/30">
      
      {/* Notice Toast */}
      {noticeMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-sm">{noticeMessage}</span>
        </div>
      )}

      {/* Mobile Top Navigation Bar (Phone & Tablet) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 border-b border-slate-200 shadow-2xs px-4 py-3 flex items-center justify-between backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/Logo%20avatar.png"
            alt="Logo Le Guide IA"
            className="size-7 rounded-lg object-cover shadow-xs"
          />
          <span className="font-heading font-black text-lg text-slate-800 tracking-wider">
            LE GUIDE <span className="text-primary">IA</span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="size-9 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="size-9 rounded-xl bg-primary text-slate-950 flex items-center justify-center shadow-lg font-bold cursor-pointer transition-all active:scale-95"
            aria-label="Ouvrir le menu d'administration"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white/98 backdrop-blur-2xl flex flex-col justify-between p-5 overflow-y-auto animate-fadeIn">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                <img
                  src="/Logo%20avatar.png"
                  alt="Logo Le Guide IA"
                  className="size-8 rounded-lg object-cover shadow-xs"
                />
                <span className="font-heading font-black text-xl text-slate-800">
                  LE GUIDE <span className="text-primary">IA</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  Admin
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="size-9 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Admin Profile Info */}
            <div className="rounded-2xl border border-slate-200/90 bg-[#F4F6F8] p-3.5 flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary text-slate-950 flex items-center justify-center font-black text-xs border border-white/20 shrink-0">
                {(currentUser?.email || "AD").substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.email || "Administrateur"}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <ShieldCheck className="size-3" /> {userRole || "admin"}
                </span>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-4 text-left">
              {/* Section 1 */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Analytiques & Ventes</p>
                <button
                  onClick={() => { setActiveTab("kpi"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "kpi" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="size-4 shrink-0" />
                    <span>Dashboard & KPIs</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab("payments"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "payments" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="size-4 shrink-0" />
                    <span>Inscriptions</span>
                  </div>
                  {stats.pendingPaymentsCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full">
                      {stats.pendingPaymentsCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Section 2 */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Gestion du Contenu</p>
                <button
                  onClick={() => { setActiveTab("courses"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "courses" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="size-4 shrink-0" />
                    <span>Bootcamps</span>
                  </div>
                  <span className="text-[10px] opacity-75">({courses.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab("formations"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "formations" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="size-4 shrink-0 text-primary" />
                    <span>Formations Vidéos</span>
                  </div>
                  <span className="text-[10px] opacity-75">({formations.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab("resources"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "resources" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="size-4 shrink-0" />
                    <span>Bibliothèque</span>
                  </div>
                  <span className="text-[10px] opacity-75">({resources.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab("lives"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "lives" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="size-4 shrink-0" />
                    <span>Calendrier & Directs</span>
                  </div>
                  <span className="text-[10px] opacity-75">({adminCalendarEvents.length})</span>
                </button>
              </div>

              {/* Section 3 */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Apprenants & Devoirs</p>
                <button
                  onClick={() => { setActiveTab("users"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "users" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="size-4 shrink-0" />
                    <span>Membres & Rôles</span>
                  </div>
                  <span className="text-[10px] opacity-75">({users.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab("submissions"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "submissions" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="size-4 shrink-0" />
                    <span>Devoirs</span>
                  </div>
                  {stats.pendingSubmissions > 0 && (
                    <span className="bg-rose-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full">
                      {stats.pendingSubmissions}
                    </span>
                  )}
                </button>
              </div>

              {/* Section 4 */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Organisation</p>
                <button
                  onClick={() => { setActiveTab("newsletter"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "newsletter" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="size-4 shrink-0" />
                    <span>Newsletter & Diffusion</span>
                  </div>
                  <span className="text-[10px] opacity-75">({newsletterSubscribers.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab("testimonials"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "testimonials" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Quote className="size-4 shrink-0" />
                    <span>Avis & Témoignages</span>
                  </div>
                  <span className="text-[10px] opacity-75">({testimonials.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab("b2b"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "b2b" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="size-4 shrink-0" />
                    <span>Demandes B2B</span>
                  </div>
                  {stats.b2bCount > 0 && (
                    <span className="bg-primary text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full">
                      {stats.b2bCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "settings" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="size-4 shrink-0" />
                    <span>Paramètres</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab("export"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "export" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="size-4 shrink-0" />
                    <span>Exports</span>
                  </div>
                </button>
              </div>

              {/* Logout Mobile */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="size-4 shrink-0" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Left - Fixed on viewport) */}
      <aside className="w-64 border-r border-slate-200 bg-white backdrop-blur-xl p-4 hidden md:flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-30">
        <div className="space-y-6 text-left">
          {/* Logo & Platform Info */}
          <Link href="/" className="flex items-center gap-3 px-2 group">
            <img
              src="/Logo%20avatar.png"
              alt="Logo Le Guide IA"
              className="size-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-heading font-black text-sm text-slate-800 tracking-wide block">LE GUIDE IA</span>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">ADMIN PORTAL</span>
            </div>
          </Link>

          {/* Nav Categories */}
          <div className="space-y-4">
            {/* Section 1: ANALYTIQUES & REVENUS */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Analytiques & Ventes</p>
              <button
                onClick={() => setActiveTab("kpi")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "kpi" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="size-4 shrink-0" />
                  <span>Dashboard & KPIs</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("payments")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "payments" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="size-4 shrink-0" />
                  <span>Inscriptions</span>
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
                  activeTab === "courses" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="size-4 shrink-0" />
                  <span>Bootcamps</span>
                </div>
                <span className="text-[10px] opacity-75">({courses.length})</span>
              </button>

              {/* <button
                onClick={() => setActiveTab("formations")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "formations" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="size-4 shrink-0 text-primary" />
                  <span>Formations Vidéos</span>
                </div>
                <span className="text-[10px] opacity-75">({formations.length})</span>
              </button> */}

              <button
                onClick={() => setActiveTab("resources")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "resources" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="size-4 shrink-0" />
                  <span>Bibliothèque</span>
                </div>
                <span className="text-[10px] opacity-75">({resources.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("lives")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "lives" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="size-4 shrink-0" />
                  <span>Calendrier & Directs</span>
                </div>
                <span className="text-[10px] opacity-75">({adminCalendarEvents.length})</span>
              </button>
            </div>

            {/* Section 3: APPRENANTS & DEVOIRS */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Apprenants & Devoirs</p>
              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "users" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="size-4 shrink-0" />
                  <span>Membres & Rôles</span>
                </div>
                <span className="text-[10px] opacity-75">({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("submissions")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "submissions" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="size-4 shrink-0" />
                  <span>Correction Devoirs</span>
                </div>
                {stats.pendingSubmissions > 0 && (
                  <span className="bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full">
                    {stats.pendingSubmissions}
                  </span>
                )}
              </button>
            </div>

            {/* Section 4: ORGANISATION */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Organisation</p>
              <button
                onClick={() => setActiveTab("newsletter")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "newsletter" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0" />
                  <span>Newsletter & Diffusion</span>
                </div>
                <span className="text-[10px] opacity-75">({newsletterSubscribers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("testimonials")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "testimonials" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Quote className="size-4 shrink-0" />
                  <span>Avis & Témoignages</span>
                </div>
                <span className="text-[10px] opacity-75">({testimonials.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("b2b")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "b2b" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="size-4 shrink-0" />
                  <span>Demandes B2B</span>
                </div>
                {stats.b2bCount > 0 && (
                  <span className="bg-primary text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                    {stats.b2bCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "settings" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="size-4 shrink-0" />
                  <span>Paramètres</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("export")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "export" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Download className="size-4 shrink-0" />
                  <span>Exports</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* User Info & Signout */}
        <div className="pt-4 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F4F6F8] border border-slate-200/80">
            <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-slate-900 text-xs font-black shrink-0">
              {(currentUser?.email || "AD").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.email || "Administrateur"}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <ShieldCheck className="size-3" /> {userRole || "admin"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-all cursor-pointer bg-white"
          >
            <LogOut className="size-3.5 text-rose-500" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-3 sm:p-6 md:p-10 space-y-6 sm:space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-left">
        {/* Workspace Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200">
          <div>
            <h1 className="font-heading text-lg sm:text-2xl font-bold text-slate-800 uppercase tracking-tight">
              {activeTab === "kpi" && "Vue d'Ensemble & KPIs Financiers"}
              {activeTab === "courses" && "Gestion des Bootcamps (Lives)"}
              {activeTab === "formations" && "Gestion des Formations Vidéos (À la demande)"}
              {activeTab === "resources" && "Bibliothèque de Prompts & Templates"}
              {activeTab === "lives" && "Sessions Live & Replays"}
              {activeTab === "payments" && "Inscriptions & Validation"}
              {activeTab === "users" && "Gestion des Membres & Rôles RBAC"}
              {activeTab === "submissions" && "Correction des Devoirs"}
              {activeTab === "b2b" && "Demandes de Devis B2B Entreprises"}
              {activeTab === "settings" && "Paramètres du Site"}
              {/* {activeTab === "export" && "Exportation des Données"} */}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Console d'Administration Admin — Le Guide IA
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button 
              onClick={fetchAllData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-xs text-slate-700 hover:text-white hover:border-slate-700 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Rafraîchir</span>
            </button>
          </div>
        </div>

        {/* TAB 1: KPI OVERVIEW */}
        {activeTab === "kpi" && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {/* KPI Cards Grid */}
            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Chiffre d'Affaires</span>
                  <div className="size-9 sm:size-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                    <DollarSign className="size-4 sm:size-5" />
                  </div>
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-black text-slate-800">
                  {stats.totalRevenue.toLocaleString()} <span className="text-xs sm:text-sm font-bold text-emerald-700">FCFA</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 sm:mt-2">Paiements validés PayTech & Mobile Money</p>
              </div>

              <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inscrits</span>
                  <div className="size-9 sm:size-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                    <Users className="size-4 sm:size-5" />
                  </div>
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-black text-slate-800">
                  {stats.totalRegistrations} <span className="text-xs sm:text-sm font-normal text-slate-500">apprenants</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 sm:mt-2">Apprenants inscrits sur les Bootcamps</p>
              </div>

              <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Paiements à valider</span>
                  <div className="size-9 sm:size-10 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
                    <Clock className="size-4 sm:size-5" />
                  </div>
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-black text-amber-800">
                  {stats.pendingPaymentsCount} <span className="text-xs sm:text-sm font-normal text-slate-500">en attente</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 sm:mt-2">Dépôts Mobile Money Direct à vérifier</p>
              </div>

              <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Devis B2B Entreprises</span>
                  <div className="size-9 sm:size-10 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
                    <Building2 className="size-4 sm:size-5" />
                  </div>
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-black text-slate-800">
                  {stats.b2bCount} <span className="text-xs sm:text-sm font-normal text-slate-500">demandes</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 sm:mt-2">Opportunités B2B d'entreprises</p>
              </div>
            </div>

            {/* Live Analytics & Traffic Chart */}
            <AnalyticsChart />

            {/* Quick Actions: Inscription Manuelle */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 max-w-3xl">
              <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                Inscription Manuelle d'un Apprenant
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inscrivez manuellement un étudiant, attribuez un mode de règlement et générez immédiatement un reçu/facture dans son espace membre.
              </p>

              <form onSubmit={handleManualEnroll} className="space-y-3 pt-2">
                {/* Email avec Autocomplétion Suggerée des Élèves */}
                <div className="relative">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Email de l'apprenant * (suggestion automatique)</label>
                  <input
                    type="email"
                    required
                    placeholder="Tapez l'adresse email du participant..."
                    value={enrollEmail}
                    onChange={e => {
                      setEnrollEmail(e.target.value)
                      setShowEmailSuggestions(true)
                    }}
                    onFocus={() => setShowEmailSuggestions(true)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                  />

                  {/* Suggestions Dropdown */}
                  {showEmailSuggestions && enrollEmail.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-700 rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-1 text-xs">
                      {(() => {
                        const query = enrollEmail.toLowerCase()
                        const matches = users.filter(u =>
                          u.email?.toLowerCase().includes(query) || u.full_name?.toLowerCase().includes(query)
                        )
                        if (matches.length === 0) {
                          return (
                            <div className="p-2.5 text-slate-500 text-center italic text-[11px]">
                              Aucun compte élève existant ne correspond à "{enrollEmail}". L'inscription créera un nouveau reçu et un compte d'accès pour cet email.
                            </div>
                          )
                        }
                        return matches.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setEnrollEmail(u.email || "")
                              if (u.full_name) setEnrollFullName(u.full_name)
                              setShowEmailSuggestions(false)
                            }}
                            className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between transition-colors"
                          >
                            <div>
                              <span className="font-bold text-slate-800 block">{u.full_name || "Élève sans nom"}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{u.email}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {u.role}
                            </span>
                          </button>
                        ))
                      })()}
                    </div>
                  )}
                </div>

                {/* Nom complet de l'apprenant */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nom complet du participant (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Jean Dupont (recommandé pour personnaliser l'email et le certificat)"
                    value={enrollFullName}
                    onChange={e => setEnrollFullName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                  />
                </div>

                {/* Sélection du Bootcamp dynamique */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Bootcamp concerné *</label>
                  <select
                    value={enrollCourse}
                    onChange={e => setEnrollCourse(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                  >
                    <option value="">Sélectionner une formation...</option>
                    {courses.map(c => (
                      <option key={c.id || c.slug} value={c.slug}>
                        {c.title} {c.price ? `(${c.price})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mode de règlement & Référence (Optionnels) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Moyen de paiement (Optionnel)</label>
                    <select
                      value={enrollPaymentMethod}
                      onChange={e => setEnrollPaymentMethod(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    >
                      <option value="">Sélectionner un moyen (optionnel)</option>
                      <option value="Wave Mobile Money">Wave</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="Moov Money">Moov Money</option>
                      <option value="MTN Mobile Money">MTN Mobile Money</option>
                      <option value="Virement Bancaire">Virement Bancaire</option>
                      <option value="Espèces / Cash">Espèces / Cash</option>
                      <option value="Offert / Gratuit">Offert / Gratuit</option>
                      <option value="Carte Bancaire">Carte Bancaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Référence Transaction (Optionnel)</label>
                    <input
                      type="text"
                      placeholder="ex: Ref Wave, OM, N° Virement"
                      value={enrollTransactionRef}
                      onChange={e => setEnrollTransactionRef(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500 font-mono"
                    />
                  </div>
                </div>

                {/* Checkbox Envoyer Email de confirmation */}
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200/80 cursor-pointer text-xs text-slate-700 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={enrollSendEmail}
                    onChange={e => setEnrollSendEmail(e.target.checked)}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                  <Mail className="size-4 text-primary shrink-0" />
                  <span>Envoyer automatiquement l'email de confirmation d'inscription et d'accès</span>
                </label>

                <button
                  type="submit"
                  disabled={processingId === "enroll"}
                  className="w-full py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-sm hover:opacity-90 transition-opacity mt-2 shadow-lg shadow-primary/10 cursor-pointer"
                >
                  {processingId === "enroll" ? "Inscription & Envoi de l'email..." : "Valider l'Inscription et Débloquer Accès"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: COURSES & BOOTCAMPS CRUD */}
        {activeTab === "courses" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Créez et publiez de nouvelles offres de formation visibles sur le site et l'espace membre.</p>
              </div>
              <button
                onClick={() => {
                  setCourseForm({
                    title: "",
                    slug: "",
                    subtitle: "",
                    price: "",
                    original_price: "",
                    badge: "Nouveau",
                    category: "Bootcamp",
                    status: "published",
                    poster: "",
                    thumbnail: "",
                    dates: "",
                    start_date: "",
                    end_date: "",
                    session_count: 0,
                    whatsapp_url: "",
                    instructor: "Alfred Dah",
                    live_meet_url: ""
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
              {courses.map((c, idx) => (
                <div key={c.id || c.slug} className="p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs backdrop-blur-xl flex flex-col justify-between space-y-4 relative group hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="space-y-3 cursor-pointer" onClick={() => openCourseDetails(c)}>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={c.thumbnail || c.poster || "/images/bootcamp_pro_thumb.jpg"} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                        <span className="bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200 shadow-xs px-2 py-0.5 rounded-md text-[10px] font-black">
                          #{c.sequence_order || idx + 1}
                        </span>
                        {c.badge && (
                          <span className="bg-primary text-slate-950 px-2 py-0.5 rounded-md text-[9px] font-black uppercase shadow-xs">
                            {c.badge}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-white text-slate-900 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-lg border border-white/40 flex items-center gap-1.5 scale-95 group-hover:scale-100 transition-transform">
                          <Eye className="size-3.5 text-primary" /> Voir les Détails
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-primary transition-colors">{c.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{c.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-200">
                      <span className="font-extrabold text-emerald-700">{c.price}</span>
                      <span className="text-slate-400 line-through text-[10px]">{c.original_price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                      <button
                        onClick={() => handleMoveCourse(c, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Déplacer vers le haut"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveCourse(c, "down")}
                        disabled={idx === courses.length - 1}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Déplacer vers le bas"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => openCourseDetails(c)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-200 flex items-center justify-center gap-1"
                      title="Voir les détails"
                    >
                      <Eye className="size-3.5 text-primary" />
                    </button>
                    <button
                      onClick={() => { setCourseForm(c); setShowCourseModal(true) }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-200 flex items-center justify-center gap-1"
                    >
                      <Edit3 className="size-3" /> Modifier
                    </button>
                    {(c.id || c.slug) && (
                      <button
                        onClick={() => openCourseSessions(c)}
                        className="flex-1 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-primary-foreground flex items-center justify-center gap-1 transition-all"
                        title="Gérer les Sessions Live"
                      >
                        <Calendar className="size-3" /> Sessions
                      </button>
                    )}
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
              <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
                  <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="size-5 text-primary" />
                    {courseForm.id ? "Editer la Formation" : "Créer une Nouvelle Formation"}
                  </h3>

                  <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Titre du Bootcamp</label>
                        <input
                          type="text"
                          required
                          value={courseForm.title}
                          onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Slug URL (ex: bootcamp-ia-pro-3)</label>
                        <input
                          type="text"
                          required
                          value={courseForm.slug}
                          onChange={e => setCourseForm({ ...courseForm, slug: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Description / Sous-titre</label>
                      <textarea
                        rows={2}
                        value={courseForm.subtitle}
                        onChange={e => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Prix Promo (FCFA)</label>
                        <input
                          type="text"
                          value={courseForm.price}
                          onChange={e => setCourseForm({ ...courseForm, price: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-bold text-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Prix Standard (Barré)</label>
                        <input
                          type="text"
                          value={courseForm.original_price}
                          onChange={e => setCourseForm({ ...courseForm, original_price: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Ordre d'Affichage (#)</label>
                        <input
                          type="number"
                          min="1"
                          value={courseForm.sequence_order || 1}
                          onChange={e => setCourseForm({ ...courseForm, sequence_order: parseInt(e.target.value) || 1 })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-bold text-amber-400"
                        />
                      </div>
                    </div>

                    {/* 🔥 Validité de l'Offre Fondateur / Promo */}
                    <div className="bg-white border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          🔥 Validité de l'Offre Fondateur / Promo (Dynamique)
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          Affiché sur l'accueil
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="text-slate-600 block mb-1 font-bold">📅 Début de l'offre</label>
                          <input
                            type="date"
                            value={courseForm.offer_start_date ? courseForm.offer_start_date.substring(0, 10) : ""}
                            onChange={e => setCourseForm({ ...courseForm, offer_start_date: e.target.value })}
                            className="w-full bg-white border border-slate-200/90 shadow-xs rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 block mb-1 font-bold">⏳ Fin de l'offre (Date limite)</label>
                          <input
                            type="date"
                            value={courseForm.offer_end_date ? courseForm.offer_end_date.substring(0, 10) : ""}
                            onChange={e => setCourseForm({ ...courseForm, offer_end_date: e.target.value })}
                            className="w-full bg-white border border-slate-200/90 shadow-xs rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold text-amber-300"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 block mb-1 font-bold">🏷️ Badge / Label Promo</label>
                          <input
                            type="text"
                            placeholder="ex: Offre Fondateur"
                            value={courseForm.offer_badge_text || ""}
                            onChange={e => setCourseForm({ ...courseForm, offer_badge_text: e.target.value })}
                            className="w-full bg-white border border-slate-200/90 shadow-xs rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <FileUploadField
                        label="🖼️ Image Miniature (Vignette affichée sur la fiche)"
                        value={courseForm.thumbnail || ""}
                        onChange={url => setCourseForm({ ...courseForm, thumbnail: url })}
                        accept="image/*"
                        bucket="course-posters"
                        folder="thumbnails"
                        placeholder="https://... ou téléversez une miniature"
                        preview="image"
                        hint="Format recommandé : 16:9 ou carré (ex: 1280×720px)"
                      />
                      <FileUploadField
                        label="📜 Image Affiche Poster (Grand Format 3:4)"
                        value={courseForm.poster || ""}
                        onChange={url => setCourseForm({ ...courseForm, poster: url })}
                        accept="image/*"
                        bucket="course-posters"
                        folder="posters"
                        placeholder="https://... ou téléversez une affiche"
                        preview="image"
                        hint="Format recommandé : 3:4 (ex: 900×1200px)"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Lien Google Meet (Direct Live)</label>
                      <input
                        type="text"
                        value={courseForm.live_meet_url}
                        onChange={e => setCourseForm({ ...courseForm, live_meet_url: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-mono text-[11px]"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Dates / Période (affichage texte)</label>
                        <input
                          type="text"
                          placeholder="ex: 31 Août au 6 Septembre 2026"
                          value={courseForm.dates || ""}
                          onChange={e => setCourseForm({ ...courseForm, dates: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Format de la Session</label>
                        <input
                          type="text"
                          placeholder="ex: 100% En Ligne"
                          value={courseForm.format || ""}
                          onChange={e => setCourseForm({ ...courseForm, format: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Dates structurées */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">📅 Date de début</label>
                        <input
                          type="date"
                          value={courseForm.start_date || ""}
                          onChange={e => setCourseForm({ ...courseForm, start_date: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">📅 Date de fin</label>
                        <input
                          type="date"
                          value={courseForm.end_date || ""}
                          onChange={e => setCourseForm({ ...courseForm, end_date: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold"># Nb de sessions</label>
                        <input
                          type="number"
                          min={1}
                          placeholder="7"
                          value={courseForm.session_count || ""}
                          onChange={e => setCourseForm({ ...courseForm, session_count: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">💬 Lien Groupe WhatsApp</label>
                      <input
                        type="text"
                        placeholder="https://chat.whatsapp.com/..."
                        value={courseForm.whatsapp_url || ""}
                        onChange={e => setCourseForm({ ...courseForm, whatsapp_url: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-mono text-[11px]"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Type de Certificat / Badge</label>
                        <input
                          type="text"
                          placeholder="ex: Certificat Officiel"
                          value={courseForm.certificate || ""}
                          onChange={e => setCourseForm({ ...courseForm, certificate: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <FileUploadField
                        label="📄 PDF du Programme (Upload local ou URL)"
                        value={courseForm.pdf_url || ""}
                        onChange={url => setCourseForm({ ...courseForm, pdf_url: url })}
                        accept=".pdf,application/pdf"
                        bucket="resources-files"
                        folder="programmes"
                        placeholder="https://... ou uploadez le PDF"
                        preview="none"
                        hint="PDF spécifique à cette formule de Bootcamp."
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Avantages / Inclus (1 par ligne)</label>
                        <textarea
                          rows={3}
                          placeholder="7 sessions premium en direct...&#10;Replays vidéo HD...&#10;Certificat officiel..."
                          value={Array.isArray(courseForm.features) ? courseForm.features.join("\n") : (courseForm.features || "")}
                          onChange={e => setCourseForm({ ...courseForm, features: e.target.value.split("\n").filter(Boolean) })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">🎯 Compétences clés acquises (1 par ligne)</label>
                        <textarea
                          rows={3}
                          placeholder="Système de travail IA personnalisé...&#10;Prompt Engineering avancé...&#10;Automatisation Make.com..."
                          value={Array.isArray(courseForm.skills) ? courseForm.skills.join("\n") : (courseForm.skills || "")}
                          onChange={e => setCourseForm({ ...courseForm, skills: e.target.value.split("\n").filter(Boolean) })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowCourseModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-700 font-bold hover:bg-slate-200"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={processingId === "save_course"}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:opacity-90"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ===== MODAL GESTION DES SESSIONS LIVE ===== */}
            {showSessionModal && selectedCourseForSessions && (
              <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 max-w-3xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="size-5 text-primary" />
                      Sessions Live — {selectedCourseForSessions.title}
                    </h3>
                    <button onClick={() => { setShowSessionModal(false); setSelectedCourseForSessions(null); setBootcampSessions([]) }} className="text-slate-600 hover:text-slate-900">✕</button>
                  </div>

                  {/* Liste des sessions existantes */}
                  {bootcampSessions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sessions existantes</h4>
                      <div className="space-y-2">
                        {bootcampSessions.map((s) => (
                          <div key={s.id} className="flex items-center justify-between gap-3 bg-[#F4F6F8] rounded-xl px-4 py-3">
                            <div>
                              <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md mr-2">Session {s.session_number}</span>
                              <span className="text-sm font-bold text-slate-800">{s.title}</span>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "Date non définie"}
                                {s.meet_url && <span className="ml-2 text-primary">• Meet ✓</span>}
                                {s.recording_url && <span className="ml-2 text-emerald-400">• Replay ✓</span>}
                                {s.homework_title && <span className="ml-2 text-amber-400">• Devoir ✓</span>}
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setSessionForm({ ...s })}
                                className="p-1.5 rounded-lg bg-slate-700 text-slate-700 hover:text-white"
                              >
                                <Edit3 className="size-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm("Supprimer cette session ?")) return
                                  await supabase.from("bootcamp_sessions").delete().eq("id", s.id!)
                                  setBootcampSessions(prev => prev.filter(x => x.id !== s.id))
                                }}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formulaire ajout/édition session */}
                  <div className="border-t border-slate-200 pt-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {sessionForm.id ? `Modifier la session #${sessionForm.session_number}` : `Ajouter la session #${bootcampSessions.length + 1}`}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold"># Numéro de session (Auto-généré)</label>
                        <input
                          type="number"
                          readOnly
                          value={sessionForm.id ? sessionForm.session_number : (bootcampSessions.length + 1)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-primary font-bold outline-none cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Titre de la session</label>
                        <input type="text" placeholder="ex: Session 1 — Introduction à l'IA"
                          value={sessionForm.title || ""}
                          onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">📅 Date et heure de début</label>
                        <input type="datetime-local"
                          value={sessionForm.scheduled_at ? sessionForm.scheduled_at.slice(0, 16) : ""}
                          onChange={e => setSessionForm({ ...sessionForm, scheduled_at: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">📅 Date et heure de fin</label>
                        <input type="datetime-local"
                          value={sessionForm.ends_at ? sessionForm.ends_at.slice(0, 16) : ""}
                          onChange={e => setSessionForm({ ...sessionForm, ends_at: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-600 block mb-1 font-bold">🎬 Lien Google Meet (Direct Live)</label>
                        <input type="url" placeholder="https://meet.google.com/..."
                          value={sessionForm.meet_url || ""}
                          onChange={e => setSessionForm({ ...sessionForm, meet_url: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-mono text-[11px]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-600 block mb-1 font-bold">📺 Lien enregistrement replay (rend le replay immédiatement disponible)</label>
                        <input type="url" placeholder="https://youtube.com/... ou vimeo.com/..."
                          value={sessionForm.recording_url || ""}
                          onChange={e => setSessionForm({ ...sessionForm, recording_url: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">📚 Titre du devoir</label>
                        <input type="text" placeholder="ex: Créez votre premier prompt..."
                          value={sessionForm.homework_title || ""}
                          onChange={e => setSessionForm({ ...sessionForm, homework_title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">⏰ Date limite du devoir</label>
                        <input type="datetime-local"
                          value={sessionForm.homework_deadline ? sessionForm.homework_deadline.slice(0, 16) : ""}
                          onChange={e => setSessionForm({ ...sessionForm, homework_deadline: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-600 block mb-1 font-bold">Description du devoir</label>
                        <textarea rows={2} placeholder="Décrivez le travail demandé aux étudiants..."
                          value={sessionForm.homework_description || ""}
                          onChange={e => setSessionForm({ ...sessionForm, homework_description: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      {/* Téléversement du Fichier du Devoir (PDF ou Image) */}
                      <div className="sm:col-span-2">
                        <FileUploadField
                          label="📄 Fichier Sujet du Devoir / Exercice (PDF ou Image - Upload Supabase)"
                          value={sessionForm.homework_file_url || ""}
                          onChange={url => setSessionForm({ ...sessionForm, homework_file_url: url })}
                          accept=".pdf,image/*,application/pdf"
                          bucket="resources-files"
                          folder="homeworks"
                          placeholder="https://... ou téléversez le sujet d'exercice"
                          preview="none"
                          hint="Document ou image du sujet d'exercice téléchargé par les étudiants."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-600 block mb-1 font-bold">Statut de la session</label>
                        <select
                          value={sessionForm.status || "upcoming"}
                          onChange={e => setSessionForm({ ...sessionForm, status: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        >
                          <option value="upcoming">🕒 À venir</option>
                          <option value="live">🟢 En Direct Maintenant</option>
                          <option value="completed">✅ Terminée</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {sessionForm.id && (
                        <button
                          type="button"
                          onClick={() => setSessionForm({
                            session_number: bootcampSessions.length + 1,
                            title: "",
                            description: "",
                            scheduled_at: "",
                            ends_at: "",
                            meet_url: selectedCourseForSessions?.live_meet_url || "",
                            recording_url: "",
                            homework_title: "",
                            homework_description: "",
                            homework_file_url: "",
                            homework_deadline: "",
                            status: "upcoming"
                          })}
                          className="py-2.5 px-4 rounded-xl bg-slate-700 text-slate-200 font-bold text-xs hover:bg-slate-600"
                        >
                          + Nouvelle session
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!sessionForm.title || !sessionForm.scheduled_at) { alert("Titre et date de début requis."); return }
                          const targetCourseId = selectedCourseForSessions!.id || selectedCourseForSessions!.slug
                          const targetCourseSlug = selectedCourseForSessions!.slug
                          const autoNum = sessionForm.id ? sessionForm.session_number : (bootcampSessions.length + 1)

                          const payload: any = {
                            ...sessionForm,
                            course_id: targetCourseId,
                            course_slug: targetCourseSlug,
                            session_number: autoNum
                          }

                          if (sessionForm.id) {
                            const { error } = await supabase.from("bootcamp_sessions").update(payload).eq("id", sessionForm.id)
                            if (!error) {
                              setBootcampSessions(prev => prev.map(s => s.id === sessionForm.id ? { ...s, ...payload } as BootcampSession : s))
                              showNotice("Session mise à jour !")
                            } else {
                              alert("Erreur de mise à jour: " + error.message)
                            }
                          } else {
                            const { data, error } = await supabase.from("bootcamp_sessions").insert([payload]).select().single()
                            if (!error && data) {
                              setBootcampSessions(prev => [...prev, data as BootcampSession])
                              setSessionForm({
                                session_number: bootcampSessions.length + 2,
                                title: "",
                                description: "",
                                scheduled_at: "",
                                ends_at: "",
                                meet_url: selectedCourseForSessions?.live_meet_url || "",
                                recording_url: "",
                                homework_title: "",
                                homework_description: "",
                                homework_file_url: "",
                                homework_deadline: "",
                                status: "upcoming"
                              })
                              showNotice("Session ajoutée avec succès !")
                            } else {
                              alert("Erreur d'ajout: " + error?.message)
                            }
                          }
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90"
                      >
                        {sessionForm.id ? "Mettre à jour la session" : "Enregistrer la session"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MODAL D'APERÇU ET DÉTAILS COMPLETS DU BOOTCAMP ===== */}
            {showDetailsModal && selectedCourseDetails && (
              <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl w-full space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl relative">
                  
                  {/* Header Modal */}
                  <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                        <Eye className="size-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                          Aperçu &amp; Fiche Technique
                        </span>
                        <h3 className="font-heading text-xl font-bold text-slate-800 mt-1">
                          {selectedCourseDetails.title}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowDetailsModal(false); setSelectedCourseDetails(null) }}
                      className="text-slate-600 hover:text-slate-900 p-2 rounded-xl bg-slate-800 hover:bg-slate-200 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Banner & Stats */}
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Poster preview */}
                    <div className="md:col-span-1 space-y-3">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xl">
                        <img
                          src={selectedCourseDetails.poster || selectedCourseDetails.thumbnail || "/images/bootcamp_pro_thumb.jpg"}
                          alt={selectedCourseDetails.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="bg-white text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-md text-[10px] font-black">
                            #{selectedCourseDetails.sequence_order || 1}
                          </span>
                          <span className="bg-primary/90 text-slate-950 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                            {selectedCourseDetails.badge}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#F4F6F8] border border-slate-200 rounded-2xl p-3 text-center space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tarif Officiel</span>
                        <div className="flex items-center justify-center gap-3">
                          <span className="font-mono text-lg font-black text-emerald-400">{selectedCourseDetails.price}</span>
                          {selectedCourseDetails.original_price && (
                            <span className="font-mono text-xs text-slate-500 line-through">{selectedCourseDetails.original_price}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Détails & Sessions Info */}
                    <div className="md:col-span-2 space-y-5">
                      {/* Top KPI Cards */}
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="p-3.5 rounded-2xl bg-[#F4F6F8] border border-slate-200 text-center space-y-1">
                          <Users className="size-4 text-primary mx-auto" />
                          <div className="font-bold text-slate-800 text-base font-mono">{detailsEnrolledCount}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Inscrits</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#F4F6F8] border border-slate-200 text-center space-y-1">
                          <Calendar className="size-4 text-emerald-400 mx-auto" />
                          <div className="font-bold text-slate-800 text-base font-mono">{detailsSessions.length} / {selectedCourseDetails.session_count || detailsSessions.length || 0}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Sessions Live</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#F4F6F8] border border-slate-200 text-center space-y-1">
                          <Award className="size-4 text-amber-400 mx-auto" />
                          <div className="font-bold text-slate-800 text-xs truncate">{selectedCourseDetails.instructor || "Non renseigné"}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Instructeur</div>
                        </div>
                      </div>

                      {/* Fiche Descriptive */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                          <BookOpen className="size-4 text-primary" /> Fiche Technique du Bootcamp
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2 text-slate-700">
                          <div><span className="text-slate-500 font-bold">Slug :</span> <span className="font-mono text-primary">{selectedCourseDetails.slug}</span></div>
                          <div><span className="text-slate-500 font-bold">Format :</span> {selectedCourseDetails.format || "100% En Ligne"}</div>
                          <div><span className="text-slate-500 font-bold">Période :</span> {selectedCourseDetails.dates || "Non spécifiée"}</div>
                          <div><span className="text-slate-500 font-bold">Certificat :</span> {selectedCourseDetails.certificate || "Certificat Officiel"}</div>
                        </div>

                        {/* Links preview */}
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          {selectedCourseDetails.live_meet_url && (
                            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-[11px]">
                              <span className="text-slate-500 font-bold flex items-center gap-1.5"><Video className="size-3.5 text-primary" /> Lien Google Meet Live:</span>
                              <a href={selectedCourseDetails.live_meet_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono truncate max-w-[200px]">
                                {selectedCourseDetails.live_meet_url}
                              </a>
                            </div>
                          )}
                          {selectedCourseDetails.whatsapp_url && (
                            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-[11px]">
                              <span className="text-slate-500 font-bold flex items-center gap-1.5"><MessageCircle className="size-3.5 text-emerald-400" /> Groupe WhatsApp:</span>
                              <a href={selectedCourseDetails.whatsapp_url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-mono truncate max-w-[200px]">
                                {selectedCourseDetails.whatsapp_url}
                              </a>
                            </div>
                          )}
                          {selectedCourseDetails.pdf_url && (
                            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-[11px]">
                              <span className="text-slate-500 font-bold flex items-center gap-1.5"><FileText className="size-3.5 text-amber-400" /> Programme PDF:</span>
                              <a href={selectedCourseDetails.pdf_url} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline font-bold">
                                Ouvrir le PDF →
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Features list */}
                        {selectedCourseDetails.features && Array.isArray(selectedCourseDetails.features) && selectedCourseDetails.features.length > 0 && (
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-slate-500 font-bold block mb-1">Inclus dans la formule :</span>
                            <ul className="grid sm:grid-cols-2 gap-1 text-[11px] text-slate-700">
                              {selectedCourseDetails.features.map((feat: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Liste des Sessions Live */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="size-4 text-emerald-400" /> Planning des Sessions Live ({detailsSessions.length})
                          </h4>
                          <button
                            onClick={() => {
                              setShowDetailsModal(false)
                              setSelectedCourseForSessions(selectedCourseDetails)
                              setBootcampSessions(detailsSessions)
                              setShowSessionModal(true)
                            }}
                            className="text-[11px] font-bold text-primary hover:underline"
                          >
                            + Gérer les sessions →
                          </button>
                        </div>

                        {loadingDetails ? (
                          <div className="p-4 text-center text-xs text-slate-500">Chargement des sessions...</div>
                        ) : detailsSessions.length === 0 ? (
                          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                            Aucune session live configurée pour ce bootcamp pour l'instant.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {detailsSessions.map((s) => (
                              <div key={s.id} className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200 flex items-start justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                                      Session {s.session_number}
                                    </span>
                                    <span className="font-bold text-slate-800">{s.title}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-3">
                                    <span>📅 {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "Non planifiée"}</span>
                                    {s.meet_url && <span className="text-primary font-semibold">Meet ✓</span>}
                                    {s.recording_url && <span className="text-emerald-400 font-semibold">Replay Video ✓</span>}
                                  </div>
                                  {s.homework_title && (
                                    <div className="text-[10px] text-amber-300/90 pt-0.5 flex items-center gap-1.5">
                                      <span>📚 Devoir: {s.homework_title}</span>
                                      {s.homework_file_url && (
                                        <a href={s.homework_file_url} target="_blank" rel="noreferrer" className="text-primary underline">
                                          (Fichier sujet)
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ${
                                  s.status === "live" ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                                  : s.status === "completed" ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}>
                                  {s.status === "live" ? "En Direct" : s.status === "completed" ? "Terminée" : "À venir"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Modal Actions */}
                  <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                    <button
                      onClick={() => { setShowDetailsModal(false); setSelectedCourseDetails(null) }}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-700 font-bold text-xs hover:bg-slate-200"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        setSelectedCourseForSessions(selectedCourseDetails)
                        setBootcampSessions(detailsSessions)
                        setSessionForm({
                          session_number: detailsSessions.length + 1,
                          title: "",
                          description: "",
                          scheduled_at: "",
                          ends_at: "",
                          meet_url: selectedCourseDetails.live_meet_url || "",
                          recording_url: "",
                          homework_title: "",
                          homework_description: "",
                          homework_file_url: "",
                          homework_deadline: "",
                          status: "upcoming"
                        })
                        setShowSessionModal(true)
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 text-primary border border-primary/30 font-bold text-xs hover:bg-slate-200 flex items-center gap-1.5"
                    >
                      <Calendar className="size-3.5" /> Gérer les Sessions
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        setCourseForm(selectedCourseDetails)
                        setShowCourseModal(true)
                      }}
                      className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg shadow-primary/20"
                    >
                      <Edit3 className="size-3.5" /> Modifier ce Bootcamp
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2.b: FORMATIONS VIDÉOS (À LA DEMANDE) CRUD */}
        {activeTab === "formations" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  Gérez les masterclasses vidéos asynchrones vendues à l'unité. Vos modifications apparaissent immédiatement sur <Link href="/formations" target="_blank" className="text-primary hover:underline font-bold">/formations</Link> et sur la page d'accueil.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Layers className="size-4 text-primary" />
                  Gérer les Catégories (Tabs)
                </button>
                <button
                  onClick={openNewFormation}
                  className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                >
                  <Plus className="size-4" />
                  Créer une Formation Vidéo
                </button>
              </div>
            </div>

            {/* Category Chips Bar */}
            <div className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Catégories &amp; Onglets Actifs ({formationCategories.length}) :
                </span>
                <button
                  onClick={openNewCategory}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3" /> Ajouter une catégorie
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {formationCategories.map((c) => {
                  const count = formations.filter(f => f.category_slug === c.slug || f.tool_icon === c.slug).length
                  return (
                    <div
                      key={c.id || c.slug}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-200"
                    >
                      <span>{c.label}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-500 font-bold">
                        {count} cours
                      </span>
                      <button
                        onClick={() => openEditCategory(c)}
                        className="text-slate-600 hover:text-slate-900 p-0.5"
                        title="Modifier la catégorie"
                      >
                        <Edit3 className="size-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c)}
                        className="text-rose-400 hover:text-rose-300 p-0.5"
                        title="Supprimer la catégorie"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Formations Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {formations.map((f, idx) => (
                <div 
                  key={f.id || f.slug} 
                  className={`rounded-3xl border bg-white backdrop-blur-xl flex flex-col justify-between overflow-hidden relative transition-all ${
                    f.is_active ? "border-slate-200 hover:border-slate-700" : "border-rose-900/40 opacity-75"
                  }`}
                >
                  {/* Thumbnail Cover 16/9 */}
                  <div className="relative aspect-video w-full overflow-hidden bg-white border-b border-slate-200">
                    <img
                      src={f.thumbnail || "/images/formation_claude_thumb.jpg"}
                      alt={f.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-white text-primary border border-primary/30 backdrop-blur-md shadow-md">
                        {f.badge || "Formation"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border backdrop-blur-md shadow-md ${
                        f.is_active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      }`}>
                        {f.is_active ? "Active" : "Masquée"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-sm text-primary shadow-md shrink-0">
                          {f.tool_icon === "claude" ? <Bot className="size-5 text-[#d97757]" /> :
                           f.tool_icon === "chatgpt" ? <Sparkles className="size-5 text-[#10a37f]" /> :
                           f.tool_icon === "notebook" ? <FileText className="size-5 text-[#4285f4]" /> :
                           f.tool_icon === "linkedin" ? <LinkedinIcon className="size-5 text-[#0a66c2]" /> :
                           <Film className="size-5 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-black text-slate-800 leading-snug">
                            {f.title}
                          </h3>
                          <span className="text-[11px] text-slate-500 font-mono">
                            /{f.slug}
                          </span>
                        </div>
                      </div>

                    {/* Tagline & Description */}
                    {f.tagline && (
                      <p className="text-xs font-bold text-primary">
                        {f.tagline}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {f.description}
                    </p>

                    {/* Metadata Pills */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-700">
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                        ⏱️ {f.duration}
                      </span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                        📚 {f.modules_count}
                      </span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                        ⚡ {f.prompts_count}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="p-3 rounded-2xl bg-[#F4F6F8] border border-slate-200 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-600 block font-semibold">Prix de vente :</span>
                        <span className="font-heading text-lg font-black text-slate-800">
                          {typeof f.price === "number" ? f.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : f.price} FCFA
                        </span>
                      </div>
                      {f.original_price && (
                        <span className="text-xs text-slate-500 line-through font-semibold">
                          {f.original_price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleToggleFormationActive(f)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        f.is_active 
                          ? "text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-white"
                          : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                      }`}
                    >
                      {f.is_active ? "Masquer du site" : "Activer sur le site"}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditFormation(f)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="size-3.5 text-primary" />
                        <span>Modifier</span>
                      </button>

                      <button
                        onClick={() => handleDeleteFormation(f)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Supprimer la formation"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

            {/* Formation Creation / Edition Modal */}
            {showFormationModal && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                        Catalogue Formations
                      </span>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="size-5 text-primary" />
                        {editingFormation ? `Modifier : ${editingFormation.title}` : "Créer une Nouvelle Formation Vidéo"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowFormationModal(false)}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveFormation} className="space-y-6 text-xs text-left">
                    
                    {/* Section 1 : Informations Générales */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                        <FileText className="size-4 text-primary" /> 1. Informations Générales
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Titre de la Formation *</label>
                          <input
                            type="text"
                            required
                            placeholder="ex: Maîtriser Claude 3.7 & Claude Code"
                            value={formationForm.title || ""}
                            onChange={e => setFormationForm({ ...formationForm, title: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Slug Unique *</label>
                          <input
                            type="text"
                            required
                            placeholder="ex: maitriser-claude-ia"
                            value={formationForm.slug || ""}
                            onChange={e => setFormationForm({ ...formationForm, slug: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-white font-mono text-xs outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 font-bold">Accroche / Tagline de Résultat</label>
                        <input
                          type="text"
                          placeholder="ex: Déléguez enfin le travail complexe qui vous prend des heures"
                          value={formationForm.tagline || ""}
                          onChange={e => setFormationForm({ ...formationForm, tagline: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 font-bold">Description Détaillée</label>
                        <textarea
                          rows={3}
                          placeholder="Présentation synthétique des bénéfices concrets pour l'élève..."
                          value={formationForm.description || ""}
                          onChange={e => setFormationForm({ ...formationForm, description: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>

                      {/* Miniature / Affiche 16/9 avec Téléversement Local vers Supabase */}
                      <FileUploadField
                        label="Miniature / Affiche Visuelle 16/9 (Upload local vers Supabase ou URL)"
                        value={formationForm.thumbnail || ""}
                        onChange={url => setFormationForm({ ...formationForm, thumbnail: url })}
                        accept="image/*"
                        bucket="resources-files"
                        folder="formations-thumbnails"
                        placeholder="https://... ou téléversez votre image locale"
                        preview="image"
                        hint="Format 16:9 recommandé (ex: 1280×720px). Téléversez un fichier depuis votre ordinateur ou collez une URL."
                      />

                      <div className="grid gap-3 sm:grid-cols-4">
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Catégorie (Tabs) *</label>
                          <select
                            value={formationForm.category_slug || formationForm.tool_icon || "chatgpt"}
                            onChange={e => setFormationForm({ ...formationForm, category_slug: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 text-xs font-semibold"
                          >
                            {formationCategories.map(cat => (
                              <option key={cat.id || cat.slug} value={cat.slug}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Badge Marketing</label>
                          <select
                            value={formationForm.badge || "Nouveau"}
                            onChange={e => setFormationForm({ ...formationForm, badge: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 text-xs"
                          >
                            <option value="Best-seller">Best-seller</option>
                            <option value="Forte demande">Forte demande</option>
                            <option value="Nouveau">Nouveau</option>
                            <option value="Prospection">Prospection</option>
                            <option value="Recommandé">Recommandé</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Icône Outil</label>
                          <select
                            value={formationForm.tool_icon || "chatgpt"}
                            onChange={e => setFormationForm({ ...formationForm, tool_icon: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 text-xs"
                          >
                            <option value="claude">Claude (Anthropic)</option>
                            <option value="chatgpt">ChatGPT (OpenAI)</option>
                            <option value="notebook">NotebookLM (Google)</option>
                            <option value="linkedin">LinkedIn Pro</option>
                            <option value="make">Make Automation</option>
                            <option value="python">Python IA</option>
                            <option value="gemini">Gemini Pro</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Ordre</label>
                          <input
                            type="number"
                            value={formationForm.order_index || 1}
                            onChange={e => setFormationForm({ ...formationForm, order_index: parseInt(e.target.value) || 1 })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2 : Tarifs & Métadonnées */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                        <DollarSign className="size-4 text-emerald-400" /> 2. Tarifs & Métadonnées
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Prix de Vente (FCFA) *</label>
                          <input
                            type="number"
                            required
                            placeholder="ex: 39000"
                            value={formationForm.price || ""}
                            onChange={e => setFormationForm({ ...formationForm, price: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-bold outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Prix Barré (ex: 69 000 FCFA)</label>
                          <input
                            type="text"
                            placeholder="ex: 69 000 FCFA"
                            value={formationForm.original_price || ""}
                            onChange={e => setFormationForm({ ...formationForm, original_price: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-bold">
                            <input
                              type="checkbox"
                              checked={formationForm.is_active !== false}
                              onChange={e => setFormationForm({ ...formationForm, is_active: e.target.checked })}
                              className="size-4 accent-primary rounded"
                            />
                            <span>Visible sur le catalogue public</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Durée Vidéo</label>
                          <input
                            type="text"
                            placeholder="ex: 12h+ de vidéo"
                            value={formationForm.duration || ""}
                            onChange={e => setFormationForm({ ...formationForm, duration: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Nombre de Leçons / Modules</label>
                          <input
                            type="text"
                            placeholder="ex: 29 leçons"
                            value={formationForm.modules_count || ""}
                            onChange={e => setFormationForm({ ...formationForm, modules_count: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Prompts & Livrables Inclus</label>
                          <input
                            type="text"
                            placeholder="ex: 150+ prompts premium"
                            value={formationForm.prompts_count || ""}
                            onChange={e => setFormationForm({ ...formationForm, prompts_count: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3 : Livrables & Compétences Clés */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-primary" /> 3. Livrables & Compétences Clés (1 par ligne)
                      </h4>
                      <textarea
                        rows={4}
                        placeholder="Insérez un livrable par ligne :&#10;Prompt engineering expert avec la méthode CARTEL&#10;Création de GPTs sur-mesure&#10;Workflows Make prêts à importer"
                        value={featuresText}
                        onChange={e => setFeaturesText(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-sans leading-relaxed"
                      />
                    </div>

                    {/* Section 4 : Témoignage Client Embarqué */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                        <Sparkles className="size-4 text-amber-400" /> 4. Témoignage Client Embarqué
                      </h4>
                      <div>
                        <label className="text-slate-700 block mb-1 font-bold">Citation de l'Élève</label>
                        <textarea
                          rows={2}
                          placeholder="ex: Des exemples concrets qu'on peut appliquer tout de suite dans son travail..."
                          value={formationForm.testimonial?.quote || ""}
                          onChange={e => setFormationForm({
                            ...formationForm,
                            testimonial: { ...formationForm.testimonial, quote: e.target.value, author_name: formationForm.testimonial?.author_name || "Élève" }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Nom Complet de l'Élève</label>
                          <input
                            type="text"
                            placeholder="ex: David Fraisse"
                            value={formationForm.testimonial?.author_name || ""}
                            onChange={e => setFormationForm({
                              ...formationForm,
                              testimonial: { ...formationForm.testimonial, quote: formationForm.testimonial?.quote || "", author_name: e.target.value }
                            })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Rôle / Entreprise</label>
                          <input
                            type="text"
                            placeholder="ex: Consultant Stratégie & IA"
                            value={formationForm.testimonial?.author_role || ""}
                            onChange={e => setFormationForm({
                              ...formationForm,
                              testimonial: { ...formationForm.testimonial, quote: formationForm.testimonial?.quote || "", author_name: formationForm.testimonial?.author_name || "", author_role: e.target.value }
                            })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-700 block mb-1 font-bold">Initiales Avatar</label>
                          <input
                            type="text"
                            placeholder="ex: DF"
                            value={formationForm.testimonial?.avatar_initials || ""}
                            onChange={e => setFormationForm({
                              ...formationForm,
                              testimonial: { ...formationForm.testimonial, quote: formationForm.testimonial?.quote || "", author_name: formationForm.testimonial?.author_name || "", avatar_initials: e.target.value }
                            })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowFormationModal(false)}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={processingId === "save_formation"}
                        className="px-6 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
                      >
                        {processingId === "save_formation" ? "Enregistrement..." : "Enregistrer la Formation"}
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
                <p className="text-xs text-slate-500">Ajoutez des guides, templates et prompts réutilisables réservés aux membres.</p>
              </div>
              <button
                onClick={() => {
                  setResourceForm({
                    title: "",
                    description: "",
                    category: "Productivity",
                    access_level: "Gratuit",
                    prompt_text: "",
                    download_url: ""
                  })
                  setShowResourceModal(true)
                }}
                className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Plus className="size-4" />
                Ajouter une Ressource
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map(r => (
                <div key={r.id || r.title} className="p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs backdrop-blur-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {r.category || "Ressource"}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border ${
                        r.access_level === "Gratuit" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}>
                        {r.access_level || "Gratuit"}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-base leading-snug">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
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
              <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 max-w-lg w-full space-y-4">
                  <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    Ajouter / Éditer une Ressource
                  </h3>

                  <form onSubmit={handleSaveResource} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Titre de la Ressource / Prompt</label>
                      <input
                        type="text"
                        required
                        value={resourceForm.title}
                        onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Catégorie</label>
                        <select
                          value={resourceForm.category}
                          onChange={e => setResourceForm({ ...resourceForm, category: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        >
                          <option value="Productivity">Productivité</option>
                          <option value="Automation">Automation Make/n8n</option>
                          <option value="Marketing">Marketing & Copywriting</option>
                          <option value="Leadership">Leadership & Exec</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Niveau d'Accès</label>
                        <select
                          value={resourceForm.access_level}
                          onChange={e => setResourceForm({ ...resourceForm, access_level: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        >
                          <option value="Membre Premium">Membre Premium</option>
                          <option value="Gratuit">Gratuit (Lead Gen)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Texte du Prompt Parfait</label>
                      <textarea
                        rows={3}
                        value={resourceForm.prompt_text}
                        onChange={e => setResourceForm({ ...resourceForm, prompt_text: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-mono text-[11px]"
                      />
                    </div>

                    <FileUploadField
                      label="Fichier à Télécharger (PDF, DOCX, Blueprint)"
                      value={(resourceForm as any).download_url || ""}
                      onChange={url => setResourceForm({ ...resourceForm, download_url: url })}
                      accept=".pdf,.doc,.docx,.json,.xlsx,.zip,application/*"
                      bucket="resources-files"
                      folder="documents"
                      placeholder="https://... ou téléversez le document"
                      preview="none"
                      hint="Formats supportés : PDF, DOCX, JSON (Blueprint Make.com), XLSX, ZIP"
                    />

                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowResourceModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-700 font-bold hover:bg-slate-200"
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

        {/* TAB 4: LIVE GOOGLE MEET SESSIONS & CALENDAR */}
        {activeTab === "lives" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="size-6 text-primary" />
                  Calendrier &amp; Planning des Sessions Bootcamps
                </h2>
                <p className="text-xs text-slate-500">
                  Définissez les dates des prochaines cohortes de bootcamps.
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => {
                    setCohortForm({
                      courseId: courses[0]?.id || courses[0]?.slug || "",
                      startDate: new Date().toISOString().split("T")[0]
                    })
                    setShowCohortModal(true)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-slate-950 font-black text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
                >
                  <Zap className="size-4" />
                  Générer Cohorte (7 Jours)
                </button>

                <button
                  onClick={() => {
                    setLiveForm({
                      title: "",
                      course_slug: courses[0]?.slug || "",
                      meet_url: courses[0]?.live_meet_url || "",
                      replay_url: "",
                      scheduled_at: new Date().toISOString(),
                      status: "upcoming"
                    })
                    setShowLiveModal(true)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                >
                  <Plus className="size-4" />
                  Programmer un Direct
                </button>
              </div>
            </div>

            {/* Interactive Calendar Component for Admin */}
            <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
              <BootcampCalendar
                events={adminCalendarEvents}
                courses={courses}
                isAdmin={true}
                onAddEvent={(dateStr) => {
                  setLiveForm({
                    title: "",
                    course_slug: courses[0]?.slug || "",
                    meet_url: courses[0]?.live_meet_url || "",
                    replay_url: "",
                    scheduled_at: dateStr ? `${dateStr}T19:00:00.000Z` : new Date().toISOString(),
                    status: "upcoming"
                  })
                  setShowLiveModal(true)
                }}
                onEditEvent={(ev) => {
                  setLiveForm({
                    id: ev.id,
                    title: ev.title,
                    course_slug: ev.courseSlug || courses[0]?.slug || "",
                    meet_url: ev.meetUrl || "",
                    replay_url: ev.recordingUrl || "",
                    scheduled_at: ev.date ? `${ev.date}T19:00:00.000Z` : new Date().toISOString(),
                    status: ev.status
                  })
                  setShowLiveModal(true)
                }}
                onDeleteEvent={async (id) => {
                  try {
                    await supabase.from("bootcamp_sessions").delete().eq("id", id)
                    await supabase.from("live_sessions").delete().eq("id", id)
                    setAllSessions(prev => prev.filter(s => s.id !== id))
                    setLives(prev => prev.filter(l => l.id !== id))
                    showNotice("Session supprimée du calendrier.")
                  } catch (e) {
                    showNotice("Erreur lors de la suppression.")
                  }
                }}
              />
            </div>

            {/* Tabular List of Direct Sessions */}
            <div className="space-y-3 pt-4">
              <h3 className="font-heading text-sm font-bold text-slate-700 uppercase tracking-wider">
                Liste des directes enregistrés ({lives.length})
              </h3>
              <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden backdrop-blur-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#F4F6F8] text-slate-600 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-4">Session Live</th>
                      <th className="p-4">Date &amp; Heure</th>
                      <th className="p-4">Lien Google Meet</th>
                      <th className="p-4">Replay HD</th>
                      <th className="p-4 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {lives.map(l => (
                      <tr key={l.id || l.title} className="hover:bg-[#F4F6F8]/60">
                        <td className="p-4 font-bold text-slate-800">{l.title}</td>
                        <td className="p-4 text-slate-700">{new Date(l.scheduled_at).toLocaleString("fr-FR")}</td>
                        <td className="p-4 font-mono text-primary truncate max-w-xs">{l.meet_url}</td>
                        <td className="p-4 text-slate-500">{l.replay_url ? "Replay Disponible" : "En attente du direct"}</td>
                        <td className="p-4 text-right">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/30">
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
            </div>

            {/* Modal: Generate 7-Day Cohort */}
            {showCohortModal && (
              <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Zap className="size-5 text-[#D4AF37]" />
                      Générer une Cohorte (7 Jours)
                    </h3>
                    <button onClick={() => setShowCohortModal(false)} className="text-slate-600 hover:text-slate-900">✕</button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Sélectionner le Bootcamp</label>
                      <select
                        value={cohortForm.courseId}
                        onChange={(e) => setCohortForm({ ...cohortForm, courseId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-bold outline-none focus:border-primary placeholder:text-slate-500 cursor-pointer"
                      >
                        {courses.map(c => (
                          <option key={c.id || c.slug} value={c.id || c.slug}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Date du Premier Jour (Lundi de la cohorte)</label>
                      <input
                        type="date"
                        value={cohortForm.startDate}
                        onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-bold outline-none focus:border-primary placeholder:text-slate-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 text-[11px] text-slate-500">
                      <p>✨ Cette action va créer automatiquement <strong>7 sessions consécutives</strong> (du jour 1 au jour 7 à 19h00 GMT) avec les programmes et titres officiels.</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCohortModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateCohort(cohortForm.courseId, cohortForm.startDate)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-slate-950 font-black shadow-lg shadow-[#D4AF37]/20 hover:opacity-90 cursor-pointer"
                      >
                        Générer les 7 Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Modal */}
            {showLiveModal && (
              <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 max-w-lg w-full space-y-4">
                  <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Video className="size-5 text-primary" />
                    Programmer une Session Live Google Meet
                  </h3>

                  <form onSubmit={handleSaveLive} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Titre du Live</label>
                      <input
                        type="text"
                        required
                        value={liveForm.title}
                        onChange={e => setLiveForm({ ...liveForm, title: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Lien de la Réunion Google Meet</label>
                      <input
                        type="text"
                        required
                        value={liveForm.meet_url}
                        onChange={e => setLiveForm({ ...liveForm, meet_url: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Date & Heure du Direct (GMT)</label>
                      <input
                        type="datetime-local"
                        value={liveForm.scheduled_at?.slice(0, 16)}
                        onChange={e => setLiveForm({ ...liveForm, scheduled_at: new Date(e.target.value).toISOString() })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                      />
                    </div>

                    <FileUploadField
                      label="Replay Vidéo HD (Upload ou URL YouTube/Supabase)"
                      value={liveForm.replay_url || ""}
                      onChange={url => setLiveForm({ ...liveForm, replay_url: url })}
                      accept="video/*,image/*,.mp4,.webm"
                      bucket="course-replays"
                      folder="replays"
                      placeholder="https://youtube.com/... ou URL du replay HD"
                      preview="none"
                      hint="Collez le lien YouTube ou téléversez le fichier MP4 directement."
                    />

                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowLiveModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-700 font-bold hover:bg-slate-200"
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

        {/* TAB NEWSLETTER & BROADCAST */}
        {activeTab === "newsletter" && (
          <div className="space-y-8 animate-fadeIn text-left">
            
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-800 flex items-center gap-2.5">
                  <Mail className="size-6 text-primary" />
                  Newsletter &amp; Diffusion d'Emails
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Diffusez vos analyses, prompts et dates de bootcamps directement par email via votre adresse configurée.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Expéditeur : {currentUser?.email || "admin@leguideai.com"}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-[#F4F6F8] p-4 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Abonnés Newsletter</span>
                <p className="text-2xl font-black text-slate-800 font-mono">{newsletterSubscribers.length}</p>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold inline-block">100% Abonnés Actifs</span>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-[#F4F6F8] p-4 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Membres Non-Abonnés</span>
                <p className="text-2xl font-black text-blue-700 font-mono">{nonSubscribedMembers.length}</p>
                <span className="text-[10px] text-slate-500">Inscrits sur la plateforme</span>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-[#F4F6F8] p-4 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Serveur d'Envoi</span>
                <p className="text-sm font-bold text-slate-800 font-mono truncate">Resend (Cloudflare DNS)</p>
                <span className="text-[10px] text-slate-500">DKIM &amp; SPF sécurisés</span>
              </div>
            </div>

            {/* 2 Columns: Email Composer + Subscribers List */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              
              {/* Left Column: Email Composer (7 Cols) */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white shadow-xs p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    Rédiger &amp; Diffuser une Campagne
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">Expéditeur : {currentUser?.email || "admin@leguideai.com"}</span>
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">Sujet de l'Email (Objet visible dans la boîte de réception) *</label>
                    <input
                      type="text"
                      required
                      value={broadcastForm.subject}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                      placeholder="Ex: 🔥 Nouvelles Masterclasses IA & Dates du prochain Bootcamp..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">Grand Titre de l'Email</label>
                    <input
                      type="text"
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      placeholder="Ex: Nos dernières astuces et opportunités IA"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">Corps du Message (Supporte HTML &amp; Paragraphes) *</label>
                    <textarea
                      rows={8}
                      required
                      value={broadcastForm.bodyHtml}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, bodyHtml: e.target.value })}
                      placeholder="Rédigez votre message ici..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 font-mono text-xs outline-none focus:border-primary leading-relaxed placeholder:text-slate-500"
                    />
                  </div>

                  {/* Audience Selector & Non-Subscribers Platform Members Option */}
                  <div className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200 space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="include_platform_members"
                        checked={broadcastForm.includePlatformMembers}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, includePlatformMembers: e.target.checked })}
                        className="mt-0.5 size-4 rounded accent-primary cursor-pointer shrink-0"
                      />
                      <label htmlFor="include_platform_members" className="cursor-pointer space-y-0.5 select-none">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Users className="size-3.5 text-blue-500 inline" />
                          Inclure également les membres &amp; apprenants inscrits (Non-abonnés)
                        </span>
                        <span className="text-[11px] text-slate-600 block leading-relaxed">
                          Optionnel : envoyez aussi cette campagne aux utilisateurs inscrits et participants qui ne sont pas encore abonnés à la newsletter (+{nonSubscribedMembers.length} membre{nonSubscribedMembers.length > 1 ? "s" : ""}).
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono">
                        Abonnés Newsletter : <strong className="text-slate-900">{newsletterSubscribers.length}</strong>
                      </span>
                      {broadcastForm.includePlatformMembers ? (
                        <>
                          <span className="text-slate-500 font-bold">+</span>
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                            Membres plateforme : <strong className="text-blue-800">{nonSubscribedMembers.length}</strong>
                          </span>
                          <span className="text-slate-500 font-bold">=</span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                            Total ciblé : <strong className="text-emerald-800">{totalBroadcastRecipients} destinataire(s)</strong>
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">
                          (Diffusion réservée aux {newsletterSubscribers.length} abonnés newsletter)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {broadcastResult && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold space-y-1">
                      <p>✅ Envoi réussi à <strong>{broadcastResult.sentCount}</strong> destinataire(s) !</p>
                      {broadcastResult.failureCount > 0 && (
                        <p className="text-amber-700 text-[11px]">⚠️ {broadcastResult.failureCount} échec(s) de délivrabilité.</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={sendingBroadcast}
                      onClick={async () => {
                        const targetTestEmail = currentUser?.email || "admin@leguideai.com"
                        setSendingBroadcast(true)
                        try {
                          const res = await fetch("/api/admin/newsletter/broadcast", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...broadcastForm, isTest: true, testEmail: targetTestEmail })
                          })
                          const data = await res.json()
                          if (res.ok && data.success) {
                            showNotice(`Email de test envoyé à ${targetTestEmail} !`)
                          } else {
                            showNotice(data.message || "Erreur lors du test.")
                          }
                        } catch (e) {
                          showNotice("Erreur réseau.")
                        } finally {
                          setSendingBroadcast(false)
                        }
                      }}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold transition-all text-xs cursor-pointer shadow-xs"
                    >
                      🧪 Tester vers {currentUser?.email || "mon email"}
                    </button>

                    <button
                      type="submit"
                      disabled={sendingBroadcast || totalBroadcastRecipients === 0}
                      className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-primary hover:opacity-90 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {sendingBroadcast ? (
                        <span>Envoi en cours via Resend...</span>
                      ) : (
                        <>
                          <Mail className="size-4" />
                          <span>
                            {broadcastForm.includePlatformMembers
                              ? `Diffuser aux ${totalBroadcastRecipients} destinataires (${newsletterSubscribers.length} abonnés + ${nonSubscribedMembers.length} membres)`
                              : `Diffuser aux ${newsletterSubscribers.length} abonnés newsletter`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Subscribers Table & Manual Enrollment (5 Cols) */}
              <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs p-5 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-heading text-sm font-bold text-slate-800">
                    Liste des Abonnés ({newsletterSubscribers.length})
                  </h3>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/newsletter")
                      const data = await res.json()
                      if (data.subscribers) setNewsletterSubscribers(data.subscribers)
                      showNotice("Liste des abonnés actualisée.")
                    }}
                    className="text-[11px] text-primary hover:underline font-bold"
                  >
                    Actualiser
                  </button>
                </div>

                {/* Formulaire d'ajout rapide d'un abonné */}
                <form onSubmit={handleAddSubscriber} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Ajouter un email abonné..."
                    value={newSubscriberEmail}
                    onChange={(e) => setNewSubscriberEmail(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-500 outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={addingSubscriber}
                    className="px-3.5 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  >
                    {addingSubscriber ? "..." : "+ Ajouter"}
                  </button>
                </form>

                {newsletterSubscribers.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs bg-white rounded-2xl border border-slate-200/80 p-4">
                    <Mail className="size-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-bold text-slate-700">Aucun abonné enregistré</p>
                    <p className="text-[11px] text-slate-500 mt-1">Inscrivez un email ci-dessus ou via le formulaire footer du site.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {newsletterSubscribers.map((sub: any, idx: number) => (
                      <div
                        key={sub.id || sub.email || idx}
                        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate font-mono text-[11px]">{sub.email}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "Inscrit récemment"}
                            {sub.source ? ` · ${sub.source}` : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Actif
                          </span>
                          <button
                            onClick={() => handleDeleteSubscriber(sub)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer cet abonné"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: INSCRIPTIONS & VALIDATION DES PAIEMENTS */}
        {activeTab === "payments" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Metrics Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs backdrop-blur-md">
              <div className="space-y-1">
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign className="size-5 text-emerald-600 shrink-0" />
                  <span>Inscriptions &amp; Validation des Paiements</span>
                </h3>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Consultez, modifiez, validez en 1-clic ou supprimez les inscriptions et virements Mobile Money.
                </p>
              </div>

              {/* Status Badges Counts */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
                  Total : <strong className="text-slate-900">{payments.length}</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
                  À vérifier : <strong className="text-amber-900">{payments.filter(p => p.status === "pending_verification" || p.status === "pending").length}</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                  Confirmés : <strong className="text-emerald-900">{payments.filter(p => p.status === "confirmed").length}</strong>
                </span>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, tél, référence..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200/90 shadow-xs rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary outline-none transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-3 text-[11px] text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Filter className="size-4 text-slate-500 shrink-0" />
                <select
                  value={paymentFilter}
                  onChange={e => setPaymentFilter(e.target.value)}
                  className="w-full sm:w-auto bg-white border border-slate-200/90 shadow-xs rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:border-primary outline-none cursor-pointer"
                >
                  <option value="all">Tous les Statuts ({payments.length})</option>
                  <option value="pending_verification">À vérifier / Mobile Money ({payments.filter(p => p.status === "pending_verification" || p.status === "pending").length})</option>
                  <option value="confirmed">Confirmés / Payés ({payments.filter(p => p.status === "confirmed").length})</option>
                  <option value="pending">En attente ({payments.filter(p => p.status === "pending").length})</option>
                  <option value="rejected">Rejetés / Échoués ({payments.filter(p => p.status === "rejected" || p.status === "failed").length})</option>
                </select>
              </div>
            </div>

            {/* 1. DESKTOP TABLE VIEW (Visible on Large Screens) */}
            <div className="hidden lg:block rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden backdrop-blur-xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Participant</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Méthode &amp; Réf</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {filteredPayments.map(p => {
                      const cleanPhone = (p.registrations?.whatsapp || "").replace(/[^0-9]/g, "")
                      const initials = (p.registrations?.full_name || "P").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                          {/* Participant */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-primary/15 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 border border-primary/25">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 truncate">{p.registrations?.full_name || "Prospect Direct"}</div>
                                {p.registrations?.source && (
                                  <div className="text-[10px] text-slate-500 truncate">{p.registrations.source}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="p-4 space-y-1">
                            <div className="text-slate-800 font-medium truncate flex items-center gap-1.5">
                              <Mail className="size-3 text-slate-400 shrink-0" />
                              <span className="truncate">{p.registrations?.email || "N/A"}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              {cleanPhone ? (
                                <a 
                                  href={`https://wa.me/${cleanPhone}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                                  title="Contacter sur WhatsApp"
                                >
                                  <MessageCircle className="size-3" />
                                  <span>{p.registrations?.whatsapp}</span>
                                </a>
                              ) : (
                                <span>{p.registrations?.whatsapp || "N/A"}</span>
                              )}
                              {p.registrations?.country && (
                                <span className="text-[10px] text-slate-500 font-mono">({p.registrations.country})</span>
                              )}
                            </div>
                          </td>

                          {/* Montant */}
                          <td className="p-4">
                            <div className="font-mono font-extrabold text-emerald-700 text-sm">
                              {p.amount ? Number(p.amount).toLocaleString("fr-FR") : "0"} {p.currency || "XOF"}
                            </div>
                          </td>

                          {/* Méthode & Réf */}
                          <td className="p-4 space-y-0.5">
                            <span className="font-bold text-slate-800 uppercase text-[11px] block">{p.method}</span>
                            {p.transaction_ref ? (
                              <div className="text-[10px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                                Réf: {p.transaction_ref}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Sans réf</span>
                            )}
                          </td>

                          {/* Statut */}
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${
                              p.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              (p.status === "pending_verification" || p.status === "pending") ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse" :
                              "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {p.status === "confirmed" && <CheckCircle2 className="size-3" />}
                              {(p.status === "pending_verification" || p.status === "pending") && <Clock className="size-3" />}
                              {p.status === "confirmed" ? "Confirmé" : (p.status === "pending_verification" || p.status === "pending") ? "À vérifier" : p.status}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-4 text-slate-500 text-[11px] font-medium">
                            {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {p.status !== "confirmed" && (
                                <button
                                  onClick={() => handlePaymentStatus(p.id, "confirmed")}
                                  disabled={processingId === p.id}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                                  title="Valider le paiement et débloquer les accès"
                                >
                                  <CheckCircle2 className="size-3.5" />
                                  <span>Valider</span>
                                </button>
                              )}
                              {(p.status === "pending_verification" || p.status === "pending") && (
                                <button
                                  onClick={() => handlePaymentStatus(p.id, "rejected")}
                                  disabled={processingId === p.id}
                                  className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                                  title="Rejeter ce paiement"
                                >
                                  Rejeter
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEditPayment(p)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                                title="Modifier l'inscription &amp; paiement"
                              >
                                <Edit3 className="size-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePayment(p.id, p.registration_id)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Supprimer définitivement l'inscription"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          <DollarSign className="size-8 mx-auto text-slate-400 mb-2" />
                          <p className="font-bold text-slate-800 text-xs">Aucune transaction trouvée</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Modifiez vos filtres ou effectuez une autre recherche.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. MOBILE & TABLET CARDS VIEW (Visible on Small/Medium Screens) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
              {filteredPayments.map(p => {
                const cleanPhone = (p.registrations?.whatsapp || "").replace(/[^0-9]/g, "")
                const initials = (p.registrations?.full_name || "P").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                return (
                  <div
                    key={p.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden"
                  >
                    {/* Card Top: Participant + Status */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="size-10 rounded-xl bg-primary/15 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 border border-primary/25">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate" title={p.registrations?.full_name || "Prospect Direct"}>
                              {p.registrations?.full_name || "Prospect Direct"}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {p.registrations?.email || "N/A"}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 inline-flex items-center gap-1 ${
                          p.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          (p.status === "pending_verification" || p.status === "pending") ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse" :
                          "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {p.status === "confirmed" ? "Confirmé" : (p.status === "pending_verification" || p.status === "pending") ? "À vérifier" : p.status}
                        </span>
                      </div>

                      {/* Contact & WhatsApp */}
                      <div className="bg-[#F4F6F8] p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px]">WhatsApp :</span>
                          {cleanPhone ? (
                            <a 
                              href={`https://wa.me/${cleanPhone}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                            >
                              <MessageCircle className="size-3" />
                              <span>{p.registrations?.whatsapp}</span>
                            </a>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px]">Pays :</span>
                          <span className="font-bold text-slate-800 text-[11px]">{p.registrations?.country || "CI"}</span>
                        </div>
                      </div>

                      {/* Montant, Méthode & Ref */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] text-slate-600 block">Montant</span>
                          <span className="font-mono font-bold text-emerald-400 text-xs">
                            {p.amount ? Number(p.amount).toLocaleString("fr-FR") : "49 000"} {p.currency || "XOF"}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] text-slate-600 block">Méthode</span>
                          <span className="font-bold text-slate-200 text-[11px] uppercase truncate block">
                            {p.method}
                          </span>
                        </div>
                      </div>

                      {p.transaction_ref && (
                        <div className="text-[10px] font-mono text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                          <span>Réf:</span>
                          <span className="text-slate-800 font-bold">{p.transaction_ref}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 text-right">
                        Inscrit le {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      {/* 1-Click Validation / Reject buttons if pending */}
                      {p.status !== "confirmed" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePaymentStatus(p.id, "confirmed")}
                            disabled={processingId === p.id}
                            className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="size-3.5" />
                            <span>Valider &amp; Débloquer</span>
                          </button>
                          {(p.status === "pending_verification" || p.status === "pending") && (
                            <button
                              onClick={() => handlePaymentStatus(p.id, "rejected")}
                              disabled={processingId === p.id}
                              className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-xs hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                              Rejeter
                            </button>
                          )}
                        </div>
                      )}

                      {/* Edit & Delete row */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditPayment(p)}
                          className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-200 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Edit3 className="size-3" />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={() => handleDeletePayment(p.id, p.registration_id)}
                          disabled={processingId === p.id}
                          className="flex-1 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Trash2 className="size-3" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredPayments.length === 0 && (
                <div className="col-span-full p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500">
                  <DollarSign className="size-10 mx-auto text-slate-600 mb-3" />
                  <p className="font-bold text-sm text-slate-800">Aucune inscription trouvée</p>
                  <p className="text-xs text-slate-500 mt-1">Modifiez vos critères de recherche ou vos filtres.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: USERS & RBAC ROLES */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Utilisateur</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Rôle Actuel RBAC</th>
                      <th className="p-4">Date d'inscription</th>
                      <th className="p-4 text-right">Changer Rôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{u.full_name || "Utilisateur Anonyme"}</td>
                        <td className="p-4 text-slate-700">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            u.role === "super_admin" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            u.role === "admin" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }`}>
                            {u.role || "student"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center rounded-xl p-1 bg-[#F4F6F8] border border-slate-200/80 gap-1">
                            <button
                              onClick={() => handleRoleChange(u.id, "student")}
                              disabled={processingId === u.id || (u.role || "student") === "student"}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                (u.role || "student") === "student"
                                  ? "bg-slate-800 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
                              }`}
                            >
                              Student
                            </button>
                            <button
                              onClick={() => handleRoleChange(u.id, "admin")}
                              disabled={processingId === u.id || u.role === "admin"}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                u.role === "admin"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
                              }`}
                            >
                              Admin
                            </button>
                            <button
                              onClick={() => handleRoleChange(u.id, "super_admin")}
                              disabled={processingId === u.id || u.role === "super_admin"}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                u.role === "super_admin"
                                  ? "bg-purple-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
                              }`}
                            >
                              Super Admin
                            </button>
                          </div>
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
            <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Apprenant</th>
                      <th className="p-4">Exercice</th>
                      <th className="p-4">Fichier / Rendu</th>
                      <th className="p-4">Note & Statut</th>
                      <th className="p-4 text-right">Évaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {submissions.map(s => (
                      <tr key={s.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{s.user_email}</td>
                        <td className="p-4 text-slate-700">{s.lesson_title || "Exercice Module 01"}</td>
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
              <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 max-w-lg w-full space-y-4">
                  <h3 className="font-heading text-lg font-bold text-slate-800">Évaluation du Devoir</h3>
                  <p className="text-xs text-slate-500">Pour : <strong>{gradingSub.user_email}</strong></p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Note attribuée (/20)</label>
                      <input
                        type="number"
                        max={20}
                        min={0}
                        value={gradeScore}
                        onChange={e => setGradeScore(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold text-lg outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Feedback du Formateur Alfred Dah</label>
                      <textarea
                        rows={3}
                        value={gradeFeedback}
                        onChange={e => setGradeFeedback(e.target.value)}
                        placeholder="Commentaires personnalisés pour l'apprenant..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setGradingSub(null)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-700 font-bold text-xs hover:bg-slate-200"
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
            <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Entreprise & Contact</th>
                      <th className="p-4">Email / Tél</th>
                      <th className="p-4">Secteur & Effectif</th>
                      <th className="p-4">Besoins</th>
                      <th className="p-4">Statut Lead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {b2bRequests.map(b => (
                      <tr key={b.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{b.company_name}</div>
                          <div className="text-slate-500 text-[11px]">{b.contact_name}</div>
                        </td>
                        <td className="p-4">
                          <div>{b.email}</div>
                          <div className="text-slate-500">{b.phone || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <div>{b.sector || "Général"}</div>
                          <div className="text-slate-500 text-[10px]">{b.employees || "10-50"} employés</div>
                        </td>
                        <td className="p-4 max-w-xs text-slate-700 truncate">{b.needs || "Formation & Audit IA"}</td>
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

        {/* TAB: AVIS & TÉMOIGNAGES */}
        {activeTab === "testimonials" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs backdrop-blur-md">
              <div className="space-y-1">
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Quote className="size-5 text-primary shrink-0" />
                  <span>Gestion des Avis & Témoignages</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                    {testimonials.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Ajoutez, modifiez ou supprimez les recommandations affichées sur la page d'accueil et le carrousel.
                </p>
              </div>
              <button
                onClick={handleOpenAddTestimonial}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 shadow-lg shadow-primary/20 cursor-pointer w-full sm:w-auto shrink-0 transition-transform active:scale-95"
              >
                <Plus className="size-4" />
                <span>Nouveau Témoignage</span>
              </button>
            </div>

            {/* Search filter */}
            <div className="flex items-center gap-3 bg-[#F4F6F8] border border-slate-200 rounded-2xl px-4 py-2.5 w-full sm:max-w-md focus-within:border-primary/50 transition-colors">
              <Search className="size-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher par nom, profession ou mot-clé..."
                value={testimonialSearch}
                onChange={e => setTestimonialSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
              />
              {testimonialSearch && (
                <button 
                  onClick={() => setTestimonialSearch("")}
                  className="text-[11px] text-slate-600 hover:text-slate-900 shrink-0"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Testimonials Grid — Fully Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
              {testimonials
                .filter(t => {
                  if (!testimonialSearch.trim()) return true
                  const q = testimonialSearch.toLowerCase()
                  return (
                    t.name?.toLowerCase().includes(q) ||
                    t.role?.toLowerCase().includes(q) ||
                    t.text?.toLowerCase().includes(q)
                  )
                })
                .map((t, idx) => {
                  const avatar = t.avatar_url || t.image
                  const initials = t.name ? t.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "IA"
                  return (
                    <div
                      key={t.id || idx}
                      className="p-4 sm:p-5 rounded-2xl bg-[#F4F6F8] border border-slate-200 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        {/* Header: User details + rating */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {avatar ? (
                              <img
                                src={avatar}
                                alt={t.name}
                                className="size-11 rounded-full object-cover border-2 border-primary/40 shadow-sm shrink-0 bg-white"
                              />
                            ) : (
                              <div className="size-11 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center border-2 border-primary/40 text-xs shrink-0 uppercase">
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-800 truncate" title={t.name}>{t.name}</h4>
                              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5" title={t.role}>
                                {t.role}
                              </p>
                            </div>
                          </div>

                          {/* Stars */}
                          <div className="shrink-0 flex items-center gap-0.5 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="size-2.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        {/* Testimonial quote text */}
                        <p className="break-words text-xs text-slate-700 italic leading-relaxed line-clamp-5 bg-white p-3.5 rounded-xl border border-slate-200 group-hover:border-slate-700 transition-colors">
                          "{t.text}"
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 w-full">
                        <button
                          onClick={() => handleOpenEditTestimonial(t)}
                          className="flex-1 sm:flex-none justify-center px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-200 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Edit3 className="size-3" /> Modifier
                        </button>
                        {t.id && (
                          <button
                            onClick={() => handleDeleteTestimonial(t.id!)}
                            className="flex-1 sm:flex-none justify-center px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-rose-500/20"
                          >
                            <Trash2 className="size-3" /> Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>

            {testimonials.length === 0 && (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500">
                <Quote className="size-10 mx-auto text-slate-600 mb-3" />
                <p className="font-bold text-sm text-slate-800">Aucun avis ou témoignage pour le moment</p>
                <p className="text-xs text-slate-500 mt-1">Cliquez sur "Nouveau Témoignage" pour en ajouter un.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: SITE & HERO LANDING SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fadeIn">
            <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    Éditeur CMS de la Landing Page d'Accueil
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Modifiez le texte du bandeau supérieur, l'URL de la vidéo VSL YouTube, les titres du Hero et les prix promos. Les modifications s'appliquent immédiatement sur le site !
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity shadow-lg"
                >
                  {savingSettings ? "Enregistrement..." : "💾 Enregistrer les Modifications du Site"}
                </button>
              </div>

              {/* Section 1: Top Announcement Bar */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary border-b border-slate-200/80 pb-2">
                  1. Bandeau Supérieur d'Annonce (Header Top Bar)
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Texte d'Annonce Principal</label>
                    <input
                      type="text"
                      value={siteSettings.announcement_text}
                      onChange={e => setSiteSettings({ ...siteSettings, announcement_text: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Texte du Bouton CTA d'Annonce</label>
                    <input
                      type="text"
                      value={siteSettings.announcement_cta}
                      onChange={e => setSiteSettings({ ...siteSettings, announcement_cta: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: VSL Hero Video & Testimonials Pool */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <Video className="size-4" />
                      2. Pool de Vidéos VSL & Témoignages (Aléatoire & Switcher)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Chaque visiteur verra une vidéo choisie aléatoirement parmi les vidéos actives, avec la possibilité de naviguer entre les différents témoignages et présentations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddVslVideo}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-md shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Ajouter une Vidéo / Témoignage</span>
                  </button>
                </div>

                {/* List of configured videos */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {vslVideosList.map((v, vIdx) => {
                    const isDirect = v.video_url?.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) || v.video_url?.includes("supabase.co/storage")
                    return (
                      <div
                        key={v.id || vIdx}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          v.is_active !== false
                            ? "bg-white border-slate-200"
                            : "bg-white border-slate-900 opacity-60"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-slate-600 border border-purple-500/30">
                              {v.badge || "Vidéo"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleVslActive(vIdx)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                  v.is_active !== false
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-[#F4F6F8] text-slate-600 border-slate-700"
                                }`}
                              >
                                {v.is_active !== false ? "✓ Actif (En rotation)" : "Inactif"}
                              </button>
                            </div>
                          </div>

                          <h5 className="font-bold text-xs text-slate-800 line-clamp-2">{v.title}</h5>

                          {v.author_name && (
                            <p className="text-[11px] text-slate-500">
                              Par : <strong className="text-slate-200">{v.author_name}</strong> {v.author_role ? `(${v.author_role})` : ""}
                            </p>
                          )}

                          <div className="p-2 rounded-lg bg-white border border-slate-200/90 shadow-xs text-[10px] font-mono text-slate-500 truncate">
                            {isDirect ? "📁 Fichier direct MP4/Supabase" : "🔴 YouTube Embed / Lien"} : {v.video_url}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => handleOpenEditVslVideo(v, vIdx)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-200 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Edit3 className="size-3 text-primary" />
                            <span>Modifier</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVslVideo(vIdx)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Section 3: Hero Banner Main Content */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-slate-200/80 pb-2">
                  3. Hero Banner Principal (Titres, Dates, Tarifs & Affiche)
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Badge du Hero Banner</label>
                    <input
                      type="text"
                      value={siteSettings.hero_badge}
                      onChange={e => setSiteSettings({ ...siteSettings, hero_badge: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Titre Principal du Hero (H1)</label>
                    <input
                      type="text"
                      value={siteSettings.hero_title}
                      onChange={e => setSiteSettings({ ...siteSettings, hero_title: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Sous-titre explicatif</label>
                  <textarea
                    rows={3}
                    value={siteSettings.hero_subtitle}
                    onChange={e => setSiteSettings({ ...siteSettings, hero_subtitle: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Dates des Directs GMT</label>
                    <input
                      type="text"
                      value={siteSettings.hero_dates}
                      onChange={e => setSiteSettings({ ...siteSettings, hero_dates: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Heure GMT</label>
                    <input
                      type="text"
                      value={siteSettings.hero_time}
                      onChange={e => setSiteSettings({ ...siteSettings, hero_time: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Format (Badge 3ème)</label>
                    <input
                      type="text"
                      placeholder="ex: 🌍 100% En ligne"
                      value={siteSettings.hero_format}
                      onChange={e => setSiteSettings({ ...siteSettings, hero_format: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nb Sessions (Badge 4ème)</label>
                    <input
                      type="text"
                      placeholder="ex: 🎓 7 Sessions intensives"
                      value={siteSettings.hero_sessions}
                      onChange={e => setSiteSettings({ ...siteSettings, hero_sessions: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Prix Promo Affiche (FCFA)</label>
                    <input
                      type="text"
                      value={siteSettings.hero_promo_price}
                      onChange={e => setSiteSettings({ ...siteSettings, hero_promo_price: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Numéro WhatsApp Support</label>
                    <input
                      type="text"
                      value={siteSettings.whatsapp_number}
                      onChange={e => setSiteSettings({ ...siteSettings, whatsapp_number: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FileUploadField
                      label="Affiche Officielle Hero (Upload ou URL)"
                      value={siteSettings.hero_poster_url}
                      onChange={url => setSiteSettings({ ...siteSettings, hero_poster_url: url })}
                      accept="image/*"
                      bucket="course-posters"
                      folder="hero"
                      placeholder="https://... ou téléversez l'affiche"
                      preview="image"
                      hint="Format recommandé : 3:4 · JPG ou PNG"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <FileUploadField
                    label="📄 PDF Programme Bootcamp (Upload ou URL)"
                    value={siteSettings.hero_programme_url}
                    onChange={url => setSiteSettings({ ...siteSettings, hero_programme_url: url })}
                    accept=".pdf,application/pdf"
                    bucket="resources-files"
                    folder="programmes"
                    placeholder="https://... ou téléversez le PDF du programme"
                    preview="none"
                    hint="Ce PDF s'ouvre quand l'utilisateur clique sur « Télécharger le programme » sur la page d'accueil."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-8 py-3 rounded-xl bg-primary text-slate-950 font-bold text-sm hover:opacity-90 transition-opacity shadow-xl"
                >
                  {savingSettings ? "Enregistrement en cours..." : "💾 Enregistrer & Mettre à jour la Landing Page"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 10: EXPORT CSV */}
        {activeTab === "export" && (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center space-y-6 animate-fadeIn">
            <div className="size-16 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto">
              <Download className="size-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="font-heading text-xl font-bold text-slate-800">Exportation Intégrale des Participants</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Générez le fichier CSV d'émargement contenant les Noms, Emails, Numéros WhatsApp, Pays, Montants versés et Références de transaction pour l'organisation des direct Google Meet.
              </p>
            </div>
            <button
              onClick={exportRegistrationsCSV}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors shadow-xl cursor-pointer"
            >
              Télécharger le Fichier CSV (.csv)
            </button>
          </div>
        )}

        {/* MODAL: AJOUTER / MODIFIER UNE VIDÉO VSL OU TÉMOIGNAGE */}
        {showVslModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white shadow-xs p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Video className="size-5 text-slate-600" />
                  {editingVslIdx !== null ? "Modifier la Vidéo / Témoignage" : "Ajouter une Vidéo / Témoignage"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowVslModal(false)}
                  className="size-8 rounded-full bg-slate-800 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveVslVideo} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Titre de la vidéo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Témoignage : Patrick K. - Consultant Stratégie IA"
                    value={vslForm.title}
                    onChange={e => setVslForm({ ...vslForm, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Badge / Catégorie</label>
                    <input
                      type="text"
                      placeholder="Ex: Témoignage Apprenant, Vidéo Officielle, Cas Client..."
                      value={vslForm.badge}
                      onChange={e => setVslForm({ ...vslForm, badge: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Nom de l'intervenant / auteur</label>
                    <input
                      type="text"
                      placeholder="Ex: Alfred Dah, Patrick K., Dr. Traoré..."
                      value={vslForm.author_name || ""}
                      onChange={e => setVslForm({ ...vslForm, author_name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Rôle ou métier de l'auteur (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Diplômé Promo 1 • Consultant Financier"
                    value={vslForm.author_role || ""}
                    onChange={e => setVslForm({ ...vslForm, author_role: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-primary outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <FileUploadField
                    label="Lien Vidéo YouTube OU Téléversement MP4 Supabase *"
                    value={vslForm.video_url}
                    onChange={url => setVslForm({ ...vslForm, video_url: url })}
                    accept="video/*,.mp4,.webm"
                    bucket="resources-files"
                    folder="vsl"
                    placeholder="https://www.youtube.com/watch?v=... ou téléversez un fichier MP4"
                    preview="none"
                    hint="Collez n'importe quel lien YouTube (standard, watch, shorts, embed) ou téléversez votre fichier vidéo directement."
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="vsl_is_active"
                    checked={vslForm.is_active !== false}
                    onChange={e => setVslForm({ ...vslForm, is_active: e.target.checked })}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                  <label htmlFor="vsl_is_active" className="text-xs font-semibold text-slate-200 cursor-pointer">
                    Activer cette vidéo dans la rotation aléatoire d'accueil
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowVslModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg cursor-pointer"
                  >
                    {editingVslIdx !== null ? "Mettre à jour" : "Ajouter au pool de vidéos"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL GESTION DES CATÉGORIES DE FORMATIONS */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Layers className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-black text-slate-800">Catégories &amp; Onglets Formations</h3>
                    <p className="text-xs text-slate-500">Gérez les onglets de filtrage affichés sur l'accueil et sur /formations</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}
                  className="text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Formulaire d'ajout / modification de catégorie */}
                <form onSubmit={handleSaveCategory} className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Sparkles className="size-3.5" />
                    {editingCategory ? `Modifier la catégorie "${editingCategory.label}"` : "Ajouter une nouvelle catégorie"}
                  </h4>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nom de la catégorie (Label de l'onglet) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: DeepSeek & Open Source"
                        value={categoryForm.label || ""}
                        onChange={e => {
                          const val = e.target.value
                          const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]/g, "-")
                          setCategoryForm({ 
                            ...categoryForm, 
                            label: val,
                            slug: editingCategory ? (categoryForm.slug || autoSlug) : autoSlug
                          })
                        }}
                        className="w-full bg-white border border-slate-200/90 shadow-xs rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Slug URL (Identifiant unique) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: deepseek"
                        value={categoryForm.slug || ""}
                        onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        className="w-full bg-white border border-slate-200/90 shadow-xs rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono outline-none focus:border-primary placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Ordre d'affichage</label>
                      <input
                        type="number"
                        value={categoryForm.order_index || 1}
                        onChange={e => setCategoryForm({ ...categoryForm, order_index: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white border border-slate-200/90 shadow-xs rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="cat_is_active"
                        checked={categoryForm.is_active !== false}
                        onChange={e => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                        className="size-4 rounded accent-primary cursor-pointer"
                      />
                      <label htmlFor="cat_is_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        Activer cet onglet sur le site
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null)
                          setCategoryForm({ label: "", slug: "", icon: "sparkles", order_index: formationCategories.length + 1, is_active: true })
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                      >
                        Annuler la modification
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={processingId === "save_category"}
                      className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-black text-xs hover:opacity-90 flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      {processingId === "save_category" ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      <span>{editingCategory ? "Enregistrer les modifications" : "Créer la catégorie"}</span>
                    </button>
                  </div>
                </form>

                {/* Liste des catégories existantes */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Catégories existantes ({formationCategories.length})
                  </h4>

                  <div className="space-y-2">
                    {formationCategories.map((c, idx) => {
                      const count = formations.filter(f => f.category_slug === c.slug || f.tool_icon === c.slug).length
                      return (
                        <div
                          key={c.id || c.slug}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-7 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-xs font-mono font-bold text-primary">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-xs">{c.label}</span>
                                <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded">
                                  /{c.slug}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                {count} formation{count > 1 ? "s" : ""} liée{count > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditCategory(c)}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-xs text-slate-700 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="size-3" /> Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="size-3" /> Supprimer
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-slate-200/90 bg-white/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL GESTION DES TÉMOIGNAGES */}
        {showTestimonialModal && (
          <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
              <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                    <Quote className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-sm sm:text-lg font-black text-slate-800 truncate">
                      {editingTestimonialId ? "Modifier le Témoignage" : "Nouveau Témoignage"}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500">Avis d'apprenant affiché sur le site</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTestimonialModal(false)}
                  className="text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTestimonial} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nom & Prénom de l'apprenant *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean-Yves OUATTARA"
                      value={testimonialForm.name}
                      onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Profession / Titre / Entreprise *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Expert Gouvernance IT · CISA"
                      value={testimonialForm.role}
                      onChange={e => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <FileUploadField
                    label="Photo de profil / Avatar de l'apprenant"
                    value={testimonialForm.avatar_url || ""}
                    onChange={(url) => setTestimonialForm(prev => ({ ...prev, avatar_url: url }))}
                    bucket="course-posters"
                    folder="testimonials"
                    placeholder="https://... ou téléversez une image"
                    accept="image/*"
                    helperText="Format carré recommandé (JPG, PNG, WebP)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Texte / Avis du témoignage *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Saisissez ici le retour d'expérience complet..."
                    value={testimonialForm.text}
                    onChange={e => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowTestimonialModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingTestimonial}
                    className="px-6 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    {savingTestimonial ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    <span>{editingTestimonialId ? "Mettre à jour" : "Enregistrer le témoignage"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL ÉDITION INSCRIPTION & PAIEMENT */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
              <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <DollarSign className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-sm sm:text-lg font-black text-slate-800 truncate">
                      Modifier l'Inscription &amp; Paiement
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500">Mettez à jour les informations du participant ou de la transaction</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSavePayment} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Participant Info */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nom &amp; Prénom du Participant *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean Dupont"
                      value={paymentForm.full_name}
                      onChange={e => setPaymentForm({ ...paymentForm, full_name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Adresse Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: jean.dupont@email.com"
                      value={paymentForm.email}
                      onChange={e => setPaymentForm({ ...paymentForm, email: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* WhatsApp & Country */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Numéro WhatsApp (avec indicatif)</label>
                    <input
                      type="text"
                      placeholder="Ex: +225 0700000000"
                      value={paymentForm.whatsapp}
                      onChange={e => setPaymentForm({ ...paymentForm, whatsapp: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Pays de résidence</label>
                    <input
                      type="text"
                      placeholder="Ex: CI, BF, SN, FR..."
                      value={paymentForm.country}
                      onChange={e => setPaymentForm({ ...paymentForm, country: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Amount & Currency */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Montant *</label>
                    <input
                      type="number"
                      required
                      value={paymentForm.amount}
                      onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Devise</label>
                    <select
                      value={paymentForm.currency}
                      onChange={e => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 cursor-pointer"
                    >
                      <option value="XOF">XOF (FCFA)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Method & Ref */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Méthode de Paiement</label>
                    <input
                      type="text"
                      placeholder="Ex: Wave, Orange Money, Moov, Carte..."
                      value={paymentForm.method}
                      onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Référence de Transaction</label>
                    <input
                      type="text"
                      placeholder="Ex: TX-984729"
                      value={paymentForm.transaction_ref}
                      onChange={e => setPaymentForm({ ...paymentForm, transaction_ref: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono outline-none focus:border-primary placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Statut du Paiement &amp; Accès *</label>
                  <select
                    value={paymentForm.status}
                    onChange={e => setPaymentForm({ ...paymentForm, status: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 cursor-pointer"
                  >
                    <option value="pending_verification">À vérifier (Virement soumis en attente de vérification)</option>
                    <option value="confirmed">Confirmé (Accès activé &amp; Payé)</option>
                    <option value="pending">En attente (Non finalisé)</option>
                    <option value="rejected">Rejeté (Paiement non valide / annulé)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingPayment}
                    className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    {savingPayment ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    <span>Enregistrer les modifications</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

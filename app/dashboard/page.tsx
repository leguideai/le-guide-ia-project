"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { resourcesData, ResourceItem } from "@/lib/resources-data"
import { 
  countries, Country, getCountryFlag, PHONE_RULES, 
  PRIORITY_COUNTRY_CODES, formatPhoneNumber, parsePhoneNumber,
  SECTOR_CATEGORIES, ALL_KNOWN_SECTORS
} from "@/lib/countries"
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
  ChevronDown,
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
  X,
  Mail,
  RefreshCw,
  AlertCircle,
  Radio,
  Tv,
  ArrowRight,
  ArrowRightCircle,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Crown,
  Lock,
  CreditCard,
  Receipt,
  GraduationCap,
  UserCheck
} from "lucide-react"
import { BootcampCalendar, CalendarEvent } from "@/components/bootcamp-calendar"
import { SubscriptionModal } from "@/components/subscription-modal"

type TabType = "overview" | "courses" | "masterclasses" | "resources" | "subscription" | "certificates" | "invoices" | "profile"

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

const DEFAULT_MEET_URL = ""

const BOOTCAMP_LESSONS: Lesson[] = []

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

const ENROLLED_BOOTCAMPS: BootcampCourse[] = []

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dashboard_sidebar_collapsed")
      if (saved !== null) {
        setSidebarCollapsed(saved === "true")
      }
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        const tabParam = params.get("tab")
        if (tabParam && ["overview", "courses", "masterclasses", "resources", "subscription", "profile"].includes(tabParam)) {
          setActiveTab(tabParam as TabType)
        }
      }
    } catch (_) {}
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem("dashboard_sidebar_collapsed", String(next))
      } catch (_) {}
      return next
    })
  }

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRedirectingToAdmin, setIsRedirectingToAdmin] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Email verification barrier state
  const [isEmailUnverified, setIsEmailUnverified] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  // Course Player & Resources State
  const [selectedBootcamp, setSelectedBootcamp] = useState<BootcampCourse | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(BOOTCAMP_LESSONS[0])
  const [resourceSearch, setResourceSearch] = useState("")
  const [selectedBootcampFilter, setSelectedBootcampFilter] = useState<string>("all")
  const [selectedResourceTypeFilter, setSelectedResourceTypeFilter] = useState<string>("all")
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  // Masterclass Space State
  const [masterclassSession, setMasterclassSession] = useState<any>({
    is_active: false,
    title: "Masterclass IA en Direct",
    description: "",
    scheduledAt: "",
    dateDisplay: "",
    thumbnailUrl: "",
    meetUrl: "https://meet.google.com/qvt-gkyh-yuv",
    youtubeLiveUrl: "https://www.youtube.com/@leguideai",
    instructor: "Alfred Dah",
    duration: "1h 30min"
  })
  const [masterclassReplays, setMasterclassReplays] = useState<any[]>([])
  const [isMasterclassRegistered, setIsMasterclassRegistered] = useState(false)
  const [activeMasterclassReplayModal, setActiveMasterclassReplayModal] = useState<any | null>(null)
  const [masterclassCategoryFilter, setMasterclassCategoryFilter] = useState("Tous")
  const [masterclassSearchQuery, setMasterclassSearchQuery] = useState("")
  const [registeringMasterclass, setRegisteringMasterclass] = useState(false)
  const [masterclassRegisterSuccess, setMasterclassRegisterSuccess] = useState<string | null>(null)

  // Abonnement VIP Replays & Prompts State
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)

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
  const [profileCountry, setProfileCountry] = useState<Country>(() => {
    const bf = countries.find(c => c.code === "BF")
    return bf || countries[0]
  })
  const [profilePhone, setProfilePhone] = useState("")
  const [isProfileCountryDropdownOpen, setIsProfileCountryDropdownOpen] = useState(false)
  const [profileCountrySearch, setProfileCountrySearch] = useState("")
  const profileCountryDropdownRef = useRef<HTMLDivElement>(null)

  // Country of Residence Select state
  const [country, setCountry] = useState("")
  const [isCountryResidenceDropdownOpen, setIsCountryResidenceDropdownOpen] = useState(false)
  const [countryResidenceSearch, setCountryResidenceSearch] = useState("")
  const countryResidenceDropdownRef = useRef<HTMLDivElement>(null)

  // Sector of Activity Select state
  const [sector, setSector] = useState("")
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false)
  const [sectorSearch, setSectorSearch] = useState("")
  const sectorDropdownRef = useRef<HTMLDivElement>(null)

  const [city, setCity] = useState("")
  const [profileError, setProfileError] = useState<string | null>(null)

  // Forced Profile Modal Dropdowns
  const [isForcedPhoneCountryOpen, setIsForcedPhoneCountryOpen] = useState(false)
  const [forcedPhoneCountrySearch, setForcedPhoneCountrySearch] = useState("")
  const forcedPhoneCountryRef = useRef<HTMLDivElement>(null)

  const [isForcedResidenceCountryOpen, setIsForcedResidenceCountryOpen] = useState(false)
  const [forcedResidenceCountrySearch, setForcedResidenceCountrySearch] = useState("")
  const forcedResidenceCountryRef = useRef<HTMLDivElement>(null)

  const [isForcedSectorOpen, setIsForcedSectorOpen] = useState(false)
  const [forcedSectorSearch, setForcedSectorSearch] = useState("")
  const forcedSectorRef = useRef<HTMLDivElement>(null)

  // Close all profile dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileCountryDropdownRef.current && !profileCountryDropdownRef.current.contains(event.target as Node)) {
        setIsProfileCountryDropdownOpen(false)
      }
      if (countryResidenceDropdownRef.current && !countryResidenceDropdownRef.current.contains(event.target as Node)) {
        setIsCountryResidenceDropdownOpen(false)
      }
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target as Node)) {
        setIsSectorDropdownOpen(false)
      }
      if (forcedPhoneCountryRef.current && !forcedPhoneCountryRef.current.contains(event.target as Node)) {
        setIsForcedPhoneCountryOpen(false)
      }
      if (forcedResidenceCountryRef.current && !forcedResidenceCountryRef.current.contains(event.target as Node)) {
        setIsForcedResidenceCountryOpen(false)
      }
      if (forcedSectorRef.current && !forcedSectorRef.current.contains(event.target as Node)) {
        setIsForcedSectorOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filtered Country List for Profile with Priority Countries on top
  const filteredProfileCountries = useMemo(() => {
    const search = profileCountrySearch.toLowerCase().trim()
    if (!search) {
      const priorityList = countries.filter(c => PRIORITY_COUNTRY_CODES.includes(c.code))
      const otherList = countries.filter(c => !PRIORITY_COUNTRY_CODES.includes(c.code))
      return [...priorityList, ...otherList]
    }
    return countries.filter(
      c => c.name.toLowerCase().includes(search) || 
           c.dial.includes(search) || 
           c.code.toLowerCase().includes(search)
    )
  }, [profileCountrySearch])

  // Filtered Country List for Residence
  const filteredResidenceCountries = useMemo(() => {
    const search = countryResidenceSearch.toLowerCase().trim()
    if (!search) {
      const priorityList = countries.filter(c => PRIORITY_COUNTRY_CODES.includes(c.code))
      const otherList = countries.filter(c => !PRIORITY_COUNTRY_CODES.includes(c.code))
      return [...priorityList, ...otherList]
    }
    return countries.filter(
      c => c.name.toLowerCase().includes(search) || 
           c.code.toLowerCase().includes(search)
    )
  }, [countryResidenceSearch])

  const selectedResidenceCountryObj = useMemo(() => {
    if (!country) return null
    return countries.find(c => c.name.toLowerCase() === country.toLowerCase() || c.code.toLowerCase() === country.toLowerCase()) || null
  }, [country])

  // Filtered Lists for Forced Modal
  const filteredForcedPhoneCountries = useMemo(() => {
    const search = forcedPhoneCountrySearch.toLowerCase().trim()
    if (!search) {
      const priorityList = countries.filter(c => PRIORITY_COUNTRY_CODES.includes(c.code))
      const otherList = countries.filter(c => !PRIORITY_COUNTRY_CODES.includes(c.code))
      return [...priorityList, ...otherList]
    }
    return countries.filter(
      c => c.name.toLowerCase().includes(search) || 
           c.dial.includes(search) || 
           c.code.toLowerCase().includes(search)
    )
  }, [forcedPhoneCountrySearch])

  const filteredForcedResidenceCountries = useMemo(() => {
    const search = forcedResidenceCountrySearch.toLowerCase().trim()
    if (!search) {
      const priorityList = countries.filter(c => PRIORITY_COUNTRY_CODES.includes(c.code))
      const otherList = countries.filter(c => !PRIORITY_COUNTRY_CODES.includes(c.code))
      return [...priorityList, ...otherList]
    }
    return countries.filter(
      c => c.name.toLowerCase().includes(search) || 
           c.code.toLowerCase().includes(search)
    )
  }, [forcedResidenceCountrySearch])

  const filteredForcedSectorsByCategory = useMemo(() => {
    const search = forcedSectorSearch.toLowerCase().trim()
    if (!search) return SECTOR_CATEGORIES

    return SECTOR_CATEGORIES.map(group => {
      const filteredOptions = group.options.filter(opt => 
        opt.toLowerCase().includes(search) || group.category.toLowerCase().includes(search)
      )
      return {
        ...group,
        options: filteredOptions
      }
    }).filter(group => group.options.length > 0)
  }, [forcedSectorSearch])

  // Filtered Sectors by Category
  const filteredSectorsByCategory = useMemo(() => {
    const search = sectorSearch.toLowerCase().trim()
    if (!search) return SECTOR_CATEGORIES

    return SECTOR_CATEGORIES.map(group => {
      const filteredOptions = group.options.filter(opt => 
        opt.toLowerCase().includes(search) || group.category.toLowerCase().includes(search)
      )
      return {
        ...group,
        options: filteredOptions
      }
    }).filter(group => group.options.length > 0)
  }, [sectorSearch])

  // Profile Phone Validation Rule
  const currentProfilePhoneRule = PHONE_RULES[profileCountry.code]
  const rawProfilePhoneDigits = profilePhone.replace(/\D/g, "")

  const isProfilePhoneValid = useMemo(() => {
    if (!rawProfilePhoneDigits) return true
    if (currentProfilePhoneRule) {
      if (Array.isArray(currentProfilePhoneRule.expectedLength)) {
        return currentProfilePhoneRule.expectedLength.includes(rawProfilePhoneDigits.length)
      }
      return rawProfilePhoneDigits.length === currentProfilePhoneRule.expectedLength
    }
    return rawProfilePhoneDigits.length >= 6 && rawProfilePhoneDigits.length <= 14
  }, [rawProfilePhoneDigits, currentProfilePhoneRule])

  const handleProfilePhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val, profileCountry.code)
    setProfilePhone(formatted)
  }

  const [isAdmin, setIsAdmin] = useState(false)
  const [isProfileSavedInDb, setIsProfileSavedInDb] = useState(false)

  const profileCompletionStats = useMemo(() => {
    const checks = [
      { id: "name", label: "Nom complet officiel", ok: Boolean(fullName && fullName.trim().length >= 2) },
      { id: "phone", label: "Numéro WhatsApp", ok: Boolean(rawProfilePhoneDigits && rawProfilePhoneDigits.length >= 6 && isProfilePhoneValid) },
      { id: "country", label: "Pays de résidence", ok: Boolean(country && country.trim().length > 0) },
      { id: "city", label: "Ville", ok: Boolean(city && city.trim().length > 0) },
      { id: "sector", label: "Secteur / Métier", ok: Boolean(sector && sector.trim().length > 0) }
    ]
    const completedCount = checks.filter(c => c.ok).length
    const percentage = Math.round((completedCount / checks.length) * 100)
    return { checks, completedCount, total: checks.length, percentage }
  }, [fullName, rawProfilePhoneDigits, isProfilePhoneValid, country, city, sector])

  // Dynamic Live Countdown Timer State per Session
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!selectedLesson) return
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
  const [pendingCourses, setPendingCourses] = useState<any[]>([])
  const [userInvoices, setUserInvoices] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  // A course is accessible if: it's free (price===0) OR its DB uuid / slug is in userEnrollments OR user is admin
  const canAccess = (course: BootcampCourse & { dbId?: string; slug?: string; isFree?: boolean; id?: string }) => {
    if (course.isFree || isAdmin) return true
    if (userEnrollments.includes("*") || userEnrollments.includes("all")) return true
    if (course.dbId && userEnrollments.includes(course.dbId)) return true
    if (course.slug && userEnrollments.includes(course.slug)) return true
    if (course.id && userEnrollments.includes(course.id)) return true
    
    // Fuzzy match
    const cSlugNorm = (course.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const cTitleNorm = (course.title || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    return userEnrollments.some(e => {
      if (!e) return false
      const eNorm = e.toLowerCase().replace(/[^a-z0-9]/g, "")
      if (!eNorm) return false
      if (cSlugNorm && (cSlugNorm === eNorm || cSlugNorm.includes(eNorm) || eNorm.includes(cSlugNorm))) return true
      if (cTitleNorm && (cTitleNorm === eNorm || cTitleNorm.includes(eNorm) || eNorm.includes(cTitleNorm))) return true
      if (cSlugNorm.includes("test") && eNorm.includes("test")) return true
      if (!cSlugNorm.includes("test") && !eNorm.includes("test")) {
        if (cSlugNorm.includes("business") && eNorm.includes("business")) return true
        if (cSlugNorm.includes("carriere") && eNorm.includes("carriere")) return true
      }
      return false
    })
  }

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login?redirect=/dashboard")
        return
      }
      setUser(user)

      // Verification de l'email : si le compte n'a pas confirme son email, bloquer l'acces a l'espace membre
      const isConfirmed = Boolean(
        user.email_confirmed_at || 
        (user as any).confirmed_at || 
        user.app_metadata?.provider === "google" ||
        user.user_metadata?.email_verified === true
      )

      if (!isConfirmed) {
        setIsEmailUnverified(true)
        setLoading(false)
        return
      }

      const userEmailClean = user.email?.toLowerCase().trim() || ""

      // 1. Fetch user profile
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      const meta = user.user_metadata || {}
      const initialFullName = profData?.full_name || meta.full_name || meta.name || ""
      const initialRawPhone = profData?.whatsapp || meta.whatsapp || meta.phone || ""
      const initialCountryName = profData?.country || meta.country_name || meta.country || ""
      const initialCity = profData?.city || meta.city || ""
      const initialSector = profData?.sector || meta.sector || ""

      if (profData) {
        setProfile(profData)
        // Redirection automatique 0-clic vers le Portail Super Admin pour les comptes Admin
        if (profData.role === "admin" || profData.role === "super_admin") {
          const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
          if (params?.get("view") !== "student") {
            setIsRedirectingToAdmin(true)
            router.replace("/admin")
            return
          }
        }
      }

      const isDbComplete = Boolean(
        profData &&
        profData.full_name && profData.full_name.trim().length >= 2 &&
        profData.whatsapp && profData.whatsapp.trim().length >= 6 &&
        profData.country && profData.country.trim().length > 0 &&
        profData.city && profData.city.trim().length > 0 &&
        profData.sector && profData.sector.trim().length > 0
      )
      setIsProfileSavedInDb(isDbComplete)

      setFullName(initialFullName)
      setCountry(initialCountryName)
      setCity(initialCity)
      setSector(initialSector)

      // Parse and set phone and country
      if (initialRawPhone) {
        const parsed = parsePhoneNumber(initialRawPhone)
        if (parsed) {
          setProfileCountry(parsed.country)
          setProfilePhone(parsed.localNumber)
        } else {
          const foundC = countries.find(c => c.code === meta.country_code) || 
                         countries.find(c => c.name.toLowerCase() === initialCountryName.toLowerCase())
          if (foundC) {
            setProfileCountry(foundC)
            setProfilePhone(formatPhoneNumber(initialRawPhone, foundC.code))
          } else {
            setProfilePhone(initialRawPhone)
          }
        }
      } else if (meta.country_code) {
        const foundC = countries.find(c => c.code === meta.country_code)
        if (foundC) setProfileCountry(foundC)
      }

      // 2. PARALLEL CONCURRENT FETCH OF ALL DATA (Massive speedup from ~4s to ~300ms)
      const [
        coursesRes,
        lessonsRes,
        bootcampSessionsRes,
        resourcesRes,
        liveSessionRes,
        paymentsRes,
        registrationsRes,
        userCoursesRes,
        enrollRes,
        mcRes,
        subRes
      ] = await Promise.allSettled([
        supabase.from("courses").select("*").order("created_at", { ascending: true }),
        supabase.from("lessons").select("*").order("sequence_order", { ascending: true }),
        supabase.from("bootcamp_sessions").select("*").order("session_number", { ascending: true }),
        supabase.from("resources").select("*").order("created_at", { ascending: false }),
        supabase.from("live_sessions").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("payments").select("id, amount, currency, method, status, transaction_ref, created_at, registration_id, course_id, course_title, registrations(id, email, full_name, course_id, course_slug, courses(id, title, price))"),
        supabase.from("registrations").select("id, course_id, course_slug, status, created_at, notes").eq("email", userEmailClean),
        supabase.from("user_courses").select("id, course_slug, status, created_at").eq("user_email", userEmailClean),
        fetch(`/api/user/enrollments?email=${encodeURIComponent(userEmailClean)}`).then(r => r.json()).catch(() => null),
        fetch(`/api/masterclass?email=${encodeURIComponent(userEmailClean)}`).then(r => r.json()).catch(() => null),
        fetch(`/api/subscriptions?email=${encodeURIComponent(userEmailClean)}`).then(r => r.json()).catch(() => null)
      ])

      // 3. Unpack all responses instantly
      const cData = coursesRes.status === "fulfilled" ? coursesRes.value.data : null
      if (cData && cData.length > 0) setDbCourses(cData)

      const lData = lessonsRes.status === "fulfilled" ? lessonsRes.value.data : null
      if (lData && lData.length > 0) setDbLessons(lData)

      const bsData = bootcampSessionsRes.status === "fulfilled" ? bootcampSessionsRes.value.data : null
      if (bsData && bsData.length > 0) setDbBootcampSessions(bsData)

      const rData = resourcesRes.status === "fulfilled" ? resourcesRes.value.data : null
      if (rData && rData.length > 0) setDbResources(rData)

      const liveData = liveSessionRes.status === "fulfilled" ? liveSessionRes.value.data : null
      if (liveData) setDbLiveSession(liveData)

      const pData = paymentsRes.status === "fulfilled" ? paymentsRes.value.data : null
      const userPayments = (pData || []).filter((p: any) =>
        p.registrations?.email?.toLowerCase() === userEmailClean
      )

      const confirmedPayments = userPayments.filter((p: any) =>
        ["confirmed", "paye", "active"].includes(p.status)
      )

      const invoices = confirmedPayments.map((p: any) => ({
        id: p.id,
        ref: p.transaction_ref || `FACT-${new Date(p.created_at || Date.now()).getFullYear()}-${p.id.slice(0, 6)}`,
        title: (p.registrations?.courses as any)?.title ? `${(p.registrations?.courses as any)?.title} — Inscription Officielle` : "Inscription Officielle",
        method: p.method || "Paiement Mobile Money / Wave (PayTech)",
        amount: p.amount ? `${Number(p.amount).toLocaleString('fr-FR')} FCFA` : "0 FCFA",
        date: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Août 2026"
      }))
      setUserInvoices(invoices)

      const regData = registrationsRes.status === "fulfilled" ? registrationsRes.value.data : null
      const ucData = userCoursesRes.status === "fulfilled" ? userCoursesRes.value.data : null

      const enrollData = enrollRes.status === "fulfilled" ? enrollRes.value : null
      const isUserAdmin = profData?.role === "admin" || profData?.role === "super_admin" || Boolean(enrollData?.isAdmin)

      if (enrollData && enrollData.success) {
        if (isUserAdmin) {
          setIsAdmin(true)
          setUserEnrollments((cData || []).flatMap((c: any) => [c.id, c.slug, c.title]))
          setPendingCourses([])
        } else {
          setUserEnrollments(enrollData.confirmed || [])
          let pendings: any[] = []
          if (Array.isArray(enrollData.pendingDetails) && enrollData.pendingDetails.length > 0) {
            pendings = enrollData.pendingDetails.filter((p: any) => p?.course_slug && !String(p.course_slug).toLowerCase().includes("masterclass"))
          }
          if (pendings.length === 0 && Array.isArray(enrollData.pending)) {
            pendings = enrollData.pending
              .filter((slug: string) => slug && !slug.toLowerCase().includes("masterclass"))
              .map((slug: string) => ({
                course_slug: slug,
                created_at: new Date().toISOString(),
                status: "pending_verification"
              }))
          }

          // Merge with any direct DB registrations or user_courses if API had delay
          const directPendingRegs = (regData || [])
            .filter((r: any) => ["en_attente", "pending", "pending_verification", "inscrit", "a_verifier"].includes(r.status) && !String(r.course_slug || "").toLowerCase().includes("masterclass"))
            .map((r: any) => ({
              course_slug: r.course_slug || r.course_id,
              created_at: r.created_at || new Date().toISOString(),
              status: "pending_verification"
            }))
          
          const directPendingUcs = (ucData || [])
            .filter((uc: any) => ["en_attente", "pending", "pending_verification", "a_verifier"].includes(uc.status) && !String(uc.course_slug || "").toLowerCase().includes("masterclass"))
            .map((uc: any) => ({
              course_slug: uc.course_slug,
              created_at: uc.created_at || new Date().toISOString(),
              status: "pending_verification"
            }))

          const combinedPendings = [...pendings, ...directPendingRegs, ...directPendingUcs]
          const uniquePendings = Array.from(new Map(combinedPendings.map(p => [p.course_slug, p])).values())
          setPendingCourses(uniquePendings)
        }
      } else {
        setIsAdmin(isUserAdmin)
        if (isUserAdmin) {
          setUserEnrollments((cData || []).flatMap((c: any) => [c.id, c.slug]))
          setPendingCourses([])
        } else {
          const fromPayments = confirmedPayments.flatMap((p: any) => [
            p.registrations?.course_id,
            p.registrations?.course_slug,
            p.registrations?.courses?.id,
            p.registrations?.courses?.slug
          ])
          const fromRegs = (regData || [])
            .filter((r: any) => ["paye", "confirmed", "active"].includes(r.status))
            .flatMap((r: any) => [r.course_id, r.course_slug])
          const fromUserCourses = (ucData || [])
            .filter((uc: any) => ["active", "confirmed", "completed"].includes(uc.status))
            .map((uc: any) => uc.course_slug)

          setUserEnrollments(Array.from(new Set([...fromPayments, ...fromRegs, ...fromUserCourses])).filter(Boolean) as string[])
          
          const fallbackPendings = (regData || [])
            .filter((r: any) => ["en_attente", "pending", "pending_verification", "inscrit", "a_verifier"].includes(r.status) && !String(r.course_slug || "").toLowerCase().includes("masterclass"))
            .map((r: any) => ({
              course_slug: r.course_slug || r.course_id,
              created_at: r.created_at || new Date().toISOString(),
              status: "pending_verification"
            }))
          
          const fallbackUcs = (ucData || [])
            .filter((uc: any) => ["en_attente", "pending", "pending_verification", "a_verifier"].includes(uc.status) && !String(uc.course_slug || "").toLowerCase().includes("masterclass"))
            .map((uc: any) => ({
              course_slug: uc.course_slug,
              created_at: uc.created_at || new Date().toISOString(),
              status: "pending_verification"
            }))

          const combinedFallback = [...fallbackPendings, ...fallbackUcs]
          const uniqueFallback = Array.from(new Map(combinedFallback.map(p => [p.course_slug, p])).values())
          setPendingCourses(uniqueFallback)
        }
      }

      const mcData = mcRes.status === "fulfilled" ? mcRes.value : null
      if (mcData?.upcomingSession) setMasterclassSession(mcData.upcomingSession)
      if (mcData?.replays && Array.isArray(mcData.replays)) setMasterclassReplays(mcData.replays)
      
      if (mcData?.isRegistered) {
        setIsMasterclassRegistered(true)
      } else {
        setIsMasterclassRegistered(false)
        if (typeof window !== "undefined") {
          localStorage.removeItem("masterclass_registered")
          localStorage.removeItem("masterclass_registered_email")
        }
      }

      const subData = subRes.status === "fulfilled" ? subRes.value : null
      if (subData) {
        setSubscriptionData(subData)
        if (subData?.isSubscribed && subData.status === "active" && subData.plan !== "bootcamp_vip") {
          setUserInvoices((prev: any[]) => {
            const hasSubInvoice = prev.some((inv: any) => inv.ref === subData.transactionRef || (inv.title && inv.title.includes("VIP")))
            if (!hasSubInvoice) {
              const subInvoice = {
                id: `sub_inv_${subData.transactionRef || Date.now()}`,
                ref: subData.transactionRef || `FACT-VIP-${Date.now().toString().slice(-6)}`,
                title: `Abonnement VIP — ${subData.planLabel || "Pass 3 Mois"}`,
                method: subData.paymentMethod || "Mobile Money",
                amount: `${(subData.amount || 10000).toLocaleString("fr-FR")} FCFA`,
                date: subData.startsAt ? new Date(subData.startsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
              }
              return [subInvoice, ...prev]
            }
            return prev
          })
        }
      }

      setLoading(false)
    }

    loadUserData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRegisterForMasterclass = async () => {
    if (!user?.email) return
    setRegisteringMasterclass(true)
    setMasterclassRegisterSuccess(null)
    try {
      const res = await fetch("/api/masterclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          fullName: profile?.full_name || fullName || user.email.split("@")[0],
          country: profile?.country || country || "CI",
          whatsapp: profile?.whatsapp || user?.user_metadata?.whatsapp || "",
          masterclassId: masterclassSession?.id || "mc_default",
          masterclassTitle: masterclassSession?.title || "Masterclass IA Interactive"
        })
      })
      const data = await res.json()
      if (data.success) {
        setIsMasterclassRegistered(true)
        setMasterclassRegisterSuccess("🎉 Votre place en direct est confirmée ! Vos liens d'accès vous ont été envoyés par email.")
      } else {
        alert(data.error || "Erreur lors de la réservation.")
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message)
    } finally {
      setRegisteringMasterclass(false)
    }
  }

  const handleCopyPrompt = (id: string, text: string) => {
    if (!subscriptionData?.isSubscribed) {
      setIsSubscriptionModalOpen(true)
      return
    }
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

  const handleResendVerification = async () => {
    if (!user?.email) return
    setResendingEmail(true)
    setResendStatus(null)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) {
        setResendStatus(`Erreur : ${error.message}`)
      } else {
        setResendStatus("Email de confirmation renvoyé avec succès ! Vérifiez votre boîte de réception (et vos spams).")
      }
    } catch (err: any) {
      setResendStatus("Impossible de renvoyer l'email pour le moment.")
    } finally {
      setResendingEmail(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setProfileError(null)

    if (!fullName || fullName.trim().length < 2) {
      setProfileError("Veuillez renseigner votre nom complet officiel.")
      return
    }

    if (!rawProfilePhoneDigits || rawProfilePhoneDigits.length < 6 || !isProfilePhoneValid) {
      const expectedText = currentProfilePhoneRule 
        ? currentProfilePhoneRule.formatExample 
        : "entre 6 et 14 chiffres"
      setProfileError(`Numéro WhatsApp invalide pour ${profileCountry.name} (${profileCountry.dial}). Format attendu : ${expectedText}.`)
      return
    }

    if (!country || !country.trim()) {
      setProfileError("Veuillez sélectionner votre pays de résidence.")
      return
    }

    if (!city || !city.trim()) {
      setProfileError("Veuillez indiquer votre ville de résidence.")
      return
    }

    if (!sector || !sector.trim()) {
      setProfileError("Veuillez sélectionner votre secteur d'activité ou métier.")
      return
    }

    setSavingProfile(true)
    setSaveSuccess(false)

    const fullWhatsApp = `${profileCountry.dial}${rawProfilePhoneDigits}`
    const countryToSave = country || profileCountry.name

    try {
      const { error: profErr } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          email: user.email,
          whatsapp: fullWhatsApp,
          country: countryToSave,
          city: city.trim(),
          sector: sector.trim(),
          updated_at: new Date().toISOString(),
        })

      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          whatsapp: fullWhatsApp,
          country_name: countryToSave,
          country_code: profileCountry.code,
          city: city.trim(),
          sector: sector.trim(),
        }
      }).catch(() => {})

      if (profErr) {
        setProfileError(profErr.message)
      } else {
        setProfile((prev: any) => ({
          ...prev,
          full_name: fullName.trim(),
          whatsapp: fullWhatsApp,
          country: countryToSave,
          city: city.trim(),
          sector: sector.trim(),
        }))
        setIsProfileSavedInDb(true)
        setSaveSuccess(true)
        setCountry(countryToSave)
        setTimeout(() => setSaveSuccess(false), 4000)
      }
    } catch (err: any) {
      setProfileError(err?.message || "Une erreur est survenue lors de la sauvegarde.")
    } finally {
      setSavingProfile(false)
    }
  }

  // Compute Dynamic Calendar Events for Client Dashboard (Hook must be called unconditionally)
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const evs: CalendarEvent[] = []

    if (dbBootcampSessions && dbBootcampSessions.length > 0) {
      dbBootcampSessions.forEach((s: any) => {
        const targetCourse = dbCourses.find((c: any) => c.id === s.course_id || c.slug === s.course_slug)
        const dateStr = s.scheduled_at 
          ? String(s.scheduled_at).split("T")[0]
          : s.date 
          ? String(s.date).split("T")[0]
          : "2026-08-31"

        const isBusiness = Number(targetCourse?.price) >= 140000 || 
          String(targetCourse?.slug || "").includes("business") || 
          String(s.title || "").toLowerCase().includes("business")

        // Calcul dynamique du statut de la session
        const now = Date.now()
        const startTime = s.scheduled_at ? new Date(s.scheduled_at).getTime() : NaN
        let endTime = s.ends_at ? new Date(s.ends_at).getTime() : (!isNaN(startTime) ? startTime + 60 * 60 * 1000 : NaN)

        let dynStatus: "upcoming" | "live" | "completed" = s.status || "upcoming"
        if (s.recording_url && s.recording_url.trim().length > 5) {
          dynStatus = "completed"
        } else if (s.status === "completed") {
          dynStatus = "completed"
        } else if (!isNaN(startTime)) {
          if (now < startTime) {
            dynStatus = "upcoming"
          } else if (now >= startTime && (!isNaN(endTime) ? now <= endTime : now <= startTime + 60 * 60 * 1000)) {
            dynStatus = "live"
          } else {
            dynStatus = "completed"
          }
        }

        evs.push({
          id: s.id || `sess-${s.session_number}-${dateStr}`,
          courseId: s.course_id || targetCourse?.id || "bootcamp-pro-2",
          courseSlug: s.course_slug || targetCourse?.slug || "bootcamp-pro-2",
          courseTitle: targetCourse?.title || (isBusiness ? "Bootcamp IA & Business (Exclusive Managers)" : "Bootcamp IA & Carrière"),
          track: isBusiness ? "business" : "carriere",
          sessionNumber: s.session_number || 1,
          title: s.title || `Session #${s.session_number}`,
          description: s.description || "Session intensive interactive en direct avec Alfred Dah sur Google Meet.",
          date: dateStr,
          startTime: s.scheduled_at && s.scheduled_at.includes("T") ? s.scheduled_at.split("T")[1].slice(0, 5) : (s.start_time || "19:00"),
          endTime: s.ends_at && s.ends_at.includes("T") ? s.ends_at.split("T")[1].slice(0, 5) : (s.end_time || "20:30"),
          instructor: targetCourse?.instructor || "Alfred Dah",
          meetUrl: (s.meet_url && s.meet_url.trim() && s.meet_url !== "https://meet.google.com") ? s.meet_url.trim() : (targetCourse?.live_meet_url && targetCourse.live_meet_url.trim() && targetCourse.live_meet_url !== "https://meet.google.com" ? targetCourse.live_meet_url.trim() : ""),
          recordingUrl: s.recording_url,
          whatsappUrl: targetCourse?.whatsapp_url || "https://wa.me/22605050577",
          status: dynStatus
        })
      })
    }

    // Inject Upcoming Official Bootcamp Cohort Launch Dates dynamically from courses
    const upcomingCohorts = dbCourses
      .filter((c: any) => c.start_date)
      .map((c: any) => {
        const isBusiness = Number(c.price) >= 140000 || String(c.slug || "").includes("business") || String(c.title || "").toLowerCase().includes("business")
        const dateStr = String(c.start_date).split("T")[0]
        return {
          id: `cohort-${c.id || c.slug}-${dateStr}`,
          courseId: c.id || c.slug,
          courseSlug: c.slug,
          courseTitle: c.title,
          track: isBusiness ? ("business" as const) : ("carriere" as const),
          eventType: "bootcamp_launch" as const,
          cohortName: `Cohorte ${dateStr}`,
          title: `🚀 Rentrée Officielle — ${c.title}`,
          description: c.subtitle || "Lancement officiel de la cohorte.",
          date: dateStr,
          duration: `${c.session_count || 7} Jours Intensifs`,
          startTime: "19:00",
          endTime: "21:00",
          instructor: c.instructor || "Alfred Dah",
          meetUrl: (c.live_meet_url && c.live_meet_url.trim() && c.live_meet_url !== "https://meet.google.com") ? c.live_meet_url.trim() : "",
          whatsappUrl: c.whatsapp_url || "https://wa.me/22605050577",
          status: "upcoming" as const
        }
      })

    // Combine cohort launch dates with session events (avoiding duplicates)
    const combined = [...upcomingCohorts, ...evs]
    return combined
  }, [dbBootcampSessions, dbCourses])

  const navItems: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "courses", label: "Bootcamps AI", icon: BookOpen },
    { id: "masterclasses", label: "Masterclasses IA", icon: Radio, badge: masterclassSession.is_active ? "En Direct" : undefined },
    { id: "resources", label: "Mes Prompts", icon: DownloadCloudIcon },
    { 
      id: "subscription", 
      label: "Paiements & Abonnements", 
      icon: CreditCard
    },
    // { id: "certificates", label: "Mes Certificats", icon: Award },
    // { id: "invoices", label: "Mes Factures", icon: FileText },
    { id: "profile", label: "Mon Profil", icon: User },
  ]

  const allResources = dbResources
    .filter((r: any) => {
      const rawType = (r.type || "Prompt").toLowerCase()
      return !rawType.includes("vidéo") && !rawType.includes("video")
    })
    .map((r: any) => {
      const rawType = (r.type || "Prompt").toLowerCase()
      const itemType: 'prompt' | 'business-plan' | 'exercise' = 
        rawType.includes("plan") || rawType.includes("document")
          ? "business-plan"
          : rawType.includes("exercice") || rawType.includes("exercise")
          ? "exercise"
          : "prompt"

      return {
        id: r.id,
        bootcampId: r.bootcamp_id || r.course_slug || null,
        bootcampName: r.bootcamp_name || null,
        category: r.category || "Écosystème IA",
        type: itemType,
        title: { fr: r.title, en: r.title },
        desc: { fr: r.description || r.category || "Ressource certifiée Le Guide IA", en: r.description || r.category || "Ressource certifiée" },
        content: { fr: r.prompt_text || r.content || "", en: r.prompt_text || r.content || "" },
        fileUrl: r.file_url || r.download_url || undefined,
        downloadUrl: r.download_url || r.file_url || undefined,
        videoUrl: undefined,
        exerciseType: r.exercise_type || undefined,
        fileSize: r.file_size || "PDF / Fichier Supabase",
        deadline: r.deadline || "Permanent",
        tier: r.tier || r.access_level || ""
      }
    })
    .filter((r: any) => {
      // If resource is specifically locked to a bootcamp cohort, only show if user has access to that bootcamp
      if (r.bootcampId && r.bootcampId !== "all") {
        return isAdmin || userEnrollments.includes(r.bootcampId)
      }
      return true
    })

  const filteredResources = allResources.filter((r) => {
    const search = resourceSearch.toLowerCase()
    const matchesSearch = r.title.fr.toLowerCase().includes(search) || r.desc.fr.toLowerCase().includes(search)
    const matchesType = selectedResourceTypeFilter === "all" || r.type === selectedResourceTypeFilter
    return matchesSearch && matchesType
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
    instructor: c.instructor || "",
    live_meet_url: c.live_meet_url || "",
    poster: c.thumbnail || c.poster || "",
    lessons: (() => {
      const courseSessions = dbBootcampSessions.filter(
        (s: any) => s.course_id === c.id || s.course_id === c.slug || s.course_slug === c.slug
      )
      const sourceList = courseSessions.length > 0 ? courseSessions : dbLessons.filter((l: any) => l.course_id === c.id)
      return sourceList.map((s: any, idx: number) => {
        const hasRecording = Boolean((s.recording_url || s.video_url) && (s.recording_url || s.video_url).trim() !== "")
        
        // Calcul automatique du statut
        const now = Date.now()
        const startTime = s.scheduled_at ? new Date(s.scheduled_at).getTime() : NaN
        let endTime = s.ends_at ? new Date(s.ends_at).getTime() : (!isNaN(startTime) ? startTime + 60 * 60 * 1000 : NaN)

        let dynStatus: "upcoming" | "live" | "completed" = s.status || "upcoming"
        if (hasRecording || s.status === "completed") {
          dynStatus = "completed"
        } else if (!isNaN(startTime)) {
          if (now < startTime) {
            dynStatus = "upcoming"
          } else if (now >= startTime && (!isNaN(endTime) ? now <= endTime : now <= startTime + 60 * 60 * 1000)) {
            dynStatus = "live"
          } else {
            dynStatus = "completed"
          }
        }

        const isLive = dynStatus === "live"
        const isUpcoming = dynStatus === "upcoming"

        return {
          id: s.id,
          num: String(s.session_number || s.sequence_order || idx + 1).padStart(2, "0"),
          title: s.title,
          duration: s.scheduled_at
            ? new Date(s.scheduled_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) + ""
            : "",
          videoUrl: s.recording_url || s.video_url || null,
          hasRecording,
          isUpcoming,
          isLive,
          isCompleted: dynStatus === "completed",
          meetUrl: s.meet_url || c.live_meet_url,
          homeworkTitle: s.homework_title,
          homeworkDesc: s.homework_description,
          homeworkFileUrl: s.homework_file_url,
          status: dynStatus,
          scheduledAt: s.scheduled_at,
          pdfUrl: s.homework_file_url || s.pdf_url,
          pdfName: s.homework_title ? `Exercice_${s.homework_title}.pdf` : undefined,
          description: s.description || s.homework_description || ""
        }
      })
    })()
  }))

  // Separate enrolled (accessible) vs pending (awaiting admin verification) vs locked (not yet registered)
  const isPendingCourse = (b: any) => {
    if (canAccess(b)) return false
    const bSlug = String(b.slug || "").toLowerCase().trim()
    const bSlugNorm = bSlug.replace(/[^a-z0-9]/g, "")
    const bTitleNorm = (b.title || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const bId = String(b.dbId || b.id || "").toLowerCase().trim()
    const bIdNorm = bId.replace(/[^a-z0-9]/g, "")

    return pendingCourses.some((pc: any) => {
      const pSlug = String(pc.course_slug || pc.slug || pc.id || "").toLowerCase().trim()
      const pSlugNorm = pSlug.replace(/[^a-z0-9]/g, "")
      if (!pSlugNorm) return false

      if (bId && (pSlug === bId || pSlugNorm === bIdNorm)) return true
      if (bSlug && (pSlug === bSlug || pSlugNorm === bSlugNorm)) return true
      if (bSlugNorm && pSlugNorm && (bSlugNorm === pSlugNorm || bSlugNorm.includes(pSlugNorm) || pSlugNorm.includes(bSlugNorm))) return true
      if (bTitleNorm && pSlugNorm && (bTitleNorm === pSlugNorm || bTitleNorm.includes(pSlugNorm) || pSlugNorm.includes(bTitleNorm))) return true

      if (bSlugNorm.includes("test") && pSlugNorm.includes("test")) return true
      if (!bSlugNorm.includes("test") && !pSlugNorm.includes("test")) {
        if (bSlugNorm.includes("carriere") && pSlugNorm.includes("carriere")) return true
        if (bSlugNorm.includes("business") && pSlugNorm.includes("business")) return true
      }

      return false
    })
  }

  const enrolledBootcamps = displayedBootcamps.filter((b: any) => canAccess(b))
  const pendingBootcamps = displayedBootcamps.filter((b: any) => isPendingCourse(b))
  const lockedBootcamps = displayedBootcamps.filter((b: any) => !canAccess(b) && !isPendingCourse(b))

  const isSubPending = Boolean(
    !subscriptionData?.isSubscribed && (
      subscriptionData?.status === "pending" ||
      subscriptionData?.status === "pending_verification" ||
      subscriptionData?.status === "en_attente" ||
      subscriptionData?.status === "pending_approval"
    )
  )

  if (isRedirectingToAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="size-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary animate-pulse">
          <ShieldCheck className="size-6" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-200">Redirection vers la Console d'Administration...</p>
          <p className="text-xs text-slate-500">Connexion sécurisée en tant qu'administrateur</p>
        </div>
        <Loader2 className="size-5 text-primary animate-spin mt-1" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] text-slate-800 flex overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-64 border-r border-slate-200 bg-white p-5 flex flex-col justify-between hidden md:flex shrink-0 animate-pulse">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2">
              <div className="size-9 rounded-xl bg-slate-200" />
              <div className="h-5 w-28 bg-slate-200 rounded-md" />
            </div>

            {/* User Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-slate-200 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-3.5 w-24 bg-slate-200 rounded" />
                <div className="h-2.5 w-16 bg-slate-200 rounded-full" />
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="space-y-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center px-3.5 gap-3">
                  <div className="size-4 rounded bg-slate-200 shrink-0" />
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom links */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="h-9 rounded-xl bg-slate-100" />
            <div className="h-9 rounded-xl bg-slate-100" />
          </div>
        </aside>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header Skeleton */}
          <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur px-6 flex items-center justify-between shrink-0 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-5 w-36 bg-slate-200 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-28 bg-slate-200 rounded-xl" />
              <div className="size-8 rounded-xl bg-slate-200" />
            </div>
          </header>

          {/* Dashboard Body Skeleton */}
          <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto animate-pulse">
            {/* Welcome Banner Skeleton */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-2xs">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-xl">
                  <div className="h-3.5 w-32 bg-slate-200 rounded-full" />
                  <div className="h-7 w-72 bg-slate-200 rounded-xl" />
                  <div className="h-4 w-96 bg-slate-100 rounded" />
                </div>
                <div className="flex gap-3 shrink-0">
                  <div className="h-10 w-36 bg-slate-200 rounded-xl" />
                  <div className="h-10 w-36 bg-slate-200 rounded-xl" />
                </div>
              </div>
            </div>

            {/* 4 KPI Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                    <div className="size-8 rounded-xl bg-slate-100" />
                  </div>
                  <div className="h-7 w-16 bg-slate-200 rounded-lg" />
                </div>
              ))}
            </div>

            {/* Main Section Cards Skeleton */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="h-5 w-44 bg-slate-200 rounded" />
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="h-20 bg-slate-50 rounded-2xl border border-slate-100" />
                  <div className="h-20 bg-slate-50 rounded-2xl border border-slate-100" />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
                <div className="h-5 w-36 bg-slate-200 rounded" />
                <div className="h-40 bg-slate-50 rounded-2xl border border-slate-100" />
                <div className="h-10 w-full bg-slate-200 rounded-xl" />
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (isEmailUnverified) {
    return (
      <main className="min-h-screen bg-[#F4F6F8] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover" />
            <span className="font-heading text-lg font-black tracking-tight text-slate-800">
              LE GUIDE <span className="text-primary">IA</span>
            </span>
          </div>

          <div className="rounded-3xl border border-amber-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="size-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center mx-auto text-amber-700">
              <Mail className="size-7 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-xl font-bold text-slate-800">Vérification de votre Email requise</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Un lien d'activation a été envoyé à <strong className="text-primary font-semibold">{user?.email}</strong>. Veuillez cliquer sur ce lien dans votre boîte de réception pour débloquer votre accès à l'Espace Membre.
              </p>
            </div>

            {resendStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${resendStatus.includes("succès") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                {resendStatus}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleResendVerification}
                disabled={resendingEmail}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`size-4 ${resendingEmail ? "animate-spin" : ""}`} />
                <span>{resendingEmail ? "Envoi en cours..." : "Renvoyer l'email de confirmation"}</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                J'ai déjà validé mon email (Actualiser)
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 flex flex-col md:flex-row selection:bg-primary/20">
      {/* Mobile Top Header for Espace Membre */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 border-b border-slate-200 px-4 py-3 flex items-center justify-between backdrop-blur-xl shadow-xs">
        <Link href="/" className="flex items-center gap-2">
          <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-7 rounded-lg object-cover" />
          <span className="font-heading text-sm font-black tracking-tight text-slate-800">
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
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Menu Espace Membre"
          >
            {mobileSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-50 bg-white/98 backdrop-blur-2xl p-5 overflow-y-auto space-y-5 animate-in fade-in slide-in-from-top-4 duration-200 shadow-xl border-b border-slate-200">
          {/* User profile */}
          <div className="rounded-2xl border border-slate-200 bg-[#F4F6F8] p-3.5 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm border border-white/20 shrink-0 shadow-xs">
              {(fullName || user?.email || "U").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold text-slate-800 truncate">{fullName || "Membre Apprenant"}</p>
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
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                      isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary border border-primary/20"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            {(profile?.role === "admin" || profile?.role === "super_admin") && (
              <Link
                href="/admin"
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-white bg-primary shadow-xs"
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
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              <ExternalLink className="size-3.5" />
              <span>Voir le site public</span>
            </Link>
            <button
              onClick={() => {
                setMobileSidebarOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation (Fixed full height on desktop) */}
      <aside className={`hidden md:flex ${sidebarCollapsed ? "w-20 p-3" : "w-64 p-4"} transition-all duration-300 ease-in-out border-r border-slate-200/90 bg-white flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto shadow-xs z-30`}>
        <div className="space-y-5">
          
          {/* Brand Logo inside Dashboard Sidebar + Toggle Button */}
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center flex-col gap-2.5" : "justify-between"} px-1`}>
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity min-w-0" title="LE GUIDE IA — Retour à l'accueil">
              <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-heading text-base font-black tracking-tight text-slate-800 truncate">
                  LE GUIDE <span className="text-primary">IA</span>
                </span>
              )}
            </Link>

            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={sidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
            </button>
          </div>

          {/* User Profile Summary Card */}
          {sidebarCollapsed ? (
            <div className="flex justify-center" title={`${fullName || "Membre Apprenant"} (${user?.email || ""})`}>
              <div className="size-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs border border-white/20 shadow-xs">
                {(fullName || user?.email || "U").substring(0, 2).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/90 bg-[#F4F6F8] p-3 flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs border border-white/20 shrink-0 shadow-xs">
                {(fullName || user?.email || "U").substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-bold text-slate-800 truncate">{fullName || "Membre Apprenant"}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <ShieldCheck className="size-3" /> Espace Membre
                </span>
              </div>
            </div>
          )}

          {/* Nav Menu */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  title={item.label}
                  className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                    <Icon className="size-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                      isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary border border-primary/20"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {sidebarCollapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-white" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-2">
          {(profile?.role === "admin" || profile?.role === "super_admin") && (
            sidebarCollapsed ? (
              <Link
                href="/admin"
                title="Portail Super Admin"
                className="w-full flex items-center justify-center p-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:opacity-90 shadow-xs transition-all"
              >
                <ShieldCheck className="size-4" />
              </Link>
            ) : (
              <Link
                href="/admin"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:opacity-90 shadow-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  <span>Portail Super Admin</span>
                </div>
                <ChevronRight className="size-3.5" />
              </Link>
            )
          )}
          <Link
            href="/"
            title="Voir le site public"
            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "gap-2 px-3.5 py-2"} rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors`}
          >
            <ExternalLink className="size-3.5 shrink-0" />
            {!sidebarCollapsed && <span>Voir le site public</span>}
          </Link>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "gap-2 px-3.5 py-2"} rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer`}
          >
            <LogOut className="size-3.5 shrink-0" />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto max-w-6xl mx-auto w-full text-left bg-[#F4F6F8]">
        
        {/* Admin Quick Banner */}
        {(profile?.role === "admin" || profile?.role === "super_admin") && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                👑
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Privilèges Administrateur Détectés ({profile.role})</h4>
                <p className="text-xs text-slate-500">Vous êtes connecté en tant que gestionnaire. Ouvrez la console pour gérer les étudiants, cours et paiements.</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:opacity-90 transition-opacity whitespace-nowrap shadow-xs"
            >
              Ouvrir le Portail Super Admin →
            </Link>
          </div>
        )}
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h1 className="font-heading text-2xl font-bold text-slate-800">
                  Ravi de vous revoir, {fullName.split(" ")[0] || "Apprenant"} 👋
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Bienvenue dans votre Espace Membre LE GUIDE IA. Retrouvez toutes les dates de vos sessions Google Meet, masterclasses exclusives et prochaines cohortes à venir.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-xs">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Compte Actif
                </span>
              </div>
            </div>

            {/* VIP Pass Banner in Overview (masqué automatiquement une fois abonné/payé) */}
            {!subscriptionData?.isSubscribed && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0b0f19] to-[#1e1b4b] border border-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg text-left">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-400 to-primary text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
                    <Crown className="size-6 fill-slate-950" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        Pass VIP Replays &amp; Prompts
                      </span>
                      {isSubPending ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                          <Clock className="size-3 animate-pulse" />
                          <span>⏳ En cours de validation</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                          Non Abonné
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      {isSubPending
                        ? `Paiement en cours de vérification (${subscriptionData?.planLabel || "Pass VIP"})`
                        : "Accédez à tous les Replays Masterclasses & Prompts IA"}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      {isSubPending
                        ? `Votre virement (Réf: ${subscriptionData?.transactionRef || "Reçu soumis"}) a été reçu. Notre équipe administrative valide vos accès sous 2h à 4h.`
                        : "10 000 FCFA / 3 mois ou 30 000 FCFA / an.Deductible des frais d'inscription au prochain bootcamp."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSubPending
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                        : "bg-gradient-to-r from-primary via-primary to-amber-400 text-slate-950 hover:opacity-95"
                    }`}
                  >
                    {isSubPending ? <Clock className="size-3.5" /> : <Crown className="size-3.5 fill-slate-950" />}
                    <span>{isSubPending ? "Voir l'état de validation" : "Prendre mon Pass VIP"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 0. Notification Formation(s) en attente de validation administrative Mobile Money */}
            {pendingCourses.length > 0 && (
              <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-xs">
                <div className="flex items-start gap-3.5">
                  <Clock className="size-5 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300/80">
                        Vérification sous 24h
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                        {pendingCourses.length === 1 ? "1 formation en cours de validation administrative" : `${pendingCourses.length} formations en cours de validation`}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Votre déclaration de virement Mobile Money est en cours de vérification par l'équipe d'administration Le Guide IA. Vos accès seront automatiquement débloqués dans votre espace membre sous 24h ouvrées.
                    </p>
                  </div>
                </div>

                <a
                  href="https://wa.me/22605050577?text=Bonjour%20Alfred%2C%20je%20viens%20de%20v%C3%A9rifier%20mon%20Dashboard%20et%20je%20souhaite%20acc%C3%A9l%C3%A9rer%20la%20validation%20de%20mon%20virement%20Mobile%20Money."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-all shadow-xs active:scale-95"
                >
                  <MessageCircle className="size-4" />
                  <span>Accélérer sur WhatsApp</span>
                </a>
              </div>
            )}

            {/* Masterclass Live Scrolling / Ticker Banner (Compact, No heavy background) */}
            {masterclassSession?.is_active && (
              <div 
                onClick={() => setActiveTab("masterclasses")}
                className="group w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:border-primary/50 transition-colors cursor-pointer flex items-center gap-3 overflow-hidden shadow-2xs"
              >
                {/* Badge Fixe Gauche */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-wider shrink-0 shadow-2xs ${
                  isMasterclassRegistered ? "bg-emerald-600" : "bg-rose-500"
                }`}>
                  {isMasterclassRegistered ? (
                    <>
                      <CheckCircle2 className="size-3" />
                      <span>INSCRIT</span>
                    </>
                  ) : (
                    <>
                      <span className="size-1.5 rounded-full bg-white animate-ping" />
                      <span>DIRECT</span>
                    </>
                  )}
                </div>

                {/* Conteneur Texte Défilant Continu */}
                <div className="flex-1 overflow-hidden relative">
                  <div className="flex items-center gap-10 whitespace-nowrap animate-ticker text-xs font-semibold text-slate-800">
                    <span className="inline-flex items-center gap-2">
                      <strong className="text-slate-900">{masterclassSession.title}</strong>
                      <span className="text-slate-300">•</span>
                      <span className="text-primary font-bold">{masterclassSession.dateDisplay || "En Direct Prochainement"}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">Animé par {masterclassSession.instructor || "Alfred Dah"}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700 font-bold">
                        {isMasterclassRegistered ? "✓ Place réservée pour vous" : "100% Inclus Membre"}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-2" aria-hidden="true">
                      <strong className="text-slate-900">{masterclassSession.title}</strong>
                      <span className="text-slate-300">•</span>
                      <span className="text-primary font-bold">{masterclassSession.dateDisplay || "En Direct Prochainement"}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">Animé par {masterclassSession.instructor || "Alfred Dah"}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700 font-bold">
                        {isMasterclassRegistered ? "✓ Place réservée pour vous" : "100% Inclus Membre"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Lien Fixe Droite */}
                <div className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform shrink-0">
                  <span className="hidden sm:inline">
                    {isMasterclassRegistered ? "Accéder au direct" : "Rejoindre"}
                  </span>
                  <ChevronRight className="size-4" />
                </div>
              </div>
            )}

            {/* 1. CALENDRIER OFFICIEL DES BOOTCAMPS & DIRECTS */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-heading text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2.5">
                    <Calendar className="size-6 text-primary" />
                    Calendrier Officiel des Bootcamps &amp; Directs
                  </h4>
                </div>
              </div>

              <BootcampCalendar
                events={calendarEvents}
                courses={dbCourses}
                isAdmin={false}
              />
            </div>

          </div>
        )}

        {/* TAB 2: COURSES (Enrolled Bootcamps List & Interactive Video Player) */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            {selectedBootcamp === null ? (
              /* Master View: List of Enrolled Bootcamps */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h1 className="font-heading text-2xl font-bold text-slate-800">Bootcamps AI Inscrits</h1>
                    <p className="text-xs text-slate-500 mt-1">Sélectionnez une formation pour accéder au lien, supports PDF et exercices pratiques.</p>
                  </div>
                </div>

                {/* ─── Formations accessibles ─── */}
                {enrolledBootcamps.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-base font-bold text-slate-800">Bootcamps actives</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {enrolledBootcamps.map((bootcamp: any) => (
                        <div
                          key={bootcamp.dbId}
                          className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all shadow-xs group text-left"
                        >
                          <div className="space-y-3 p-5">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 mb-2">
                              <img src={bootcamp.poster} alt={bootcamp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute top-2.5 left-2.5">
                                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs border ${
                                  bootcamp.isFree ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : bootcamp.status === "active" ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : bootcamp.status === "completed" ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}>
                                  {bootcamp.isFree ? "Gratuit" : bootcamp.status === "active" ? "Actif" : bootcamp.status === "completed" ? "Replays HD" : "À venir"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <h3 className="font-heading text-base font-bold text-slate-800 group-hover:text-primary transition-colors leading-snug">{bootcamp.title}</h3>
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{bootcamp.subtitle}</p>
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                              <div><strong className="text-slate-700">Dates :</strong> {bootcamp.dates}</div>
                              <div><strong className="text-slate-700">Formateur :</strong> {bootcamp.instructor}</div>
                            </div>
                          </div>
                          <div className="p-5 pt-0">
                            <button
                              onClick={() => { 
                                setSelectedBootcamp(bootcamp)
                                if (bootcamp.lessons && bootcamp.lessons.length > 0) {
                                  setSelectedLesson(bootcamp.lessons[0])
                                }
                              }}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-2.5 text-xs shadow-xs transition-all cursor-pointer"
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

                {/* ─── Formations en attente de validation (Mobile Money sous 24h) ─── */}
                {pendingBootcamps.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading text-base font-bold text-slate-800">Formations en cours de validation</h2>
                      <span className="text-[10px] font-black text-amber-900 bg-amber-100/90 border border-amber-300/80 px-2.5 py-1 rounded-full animate-pulse">
                        ⏳ Activation sous 24h
                      </span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {pendingBootcamps.map((bootcamp: any) => (
                        <div
                          key={bootcamp.dbId}
                          className="rounded-3xl border border-amber-200/90 bg-gradient-to-b from-amber-50/50 via-white to-white overflow-hidden flex flex-col justify-between transition-all shadow-xs text-left"
                        >
                          <div className="space-y-3 p-5">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-amber-200/80 mb-2">
                              <img src={bootcamp.poster} alt={bootcamp.title} className="w-full h-full object-cover opacity-80" />
                              <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                                <span className="bg-[#D4AF37] text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 border border-[#F3E5AB]">
                                  <Clock className="size-3.5" />
                                  Vérification administrative
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <h3 className="font-heading text-base font-bold text-slate-800 leading-snug">{bootcamp.title}</h3>
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{bootcamp.subtitle}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                              ⏳ Votre requête est en cours de traitement. Vous recevrez un email de confirmation une fois validée.
                            </div>
                          </div>

                          <div className="p-5 pt-0 space-y-2">
                            <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-100/90 border border-amber-300/80 text-amber-900 font-bold py-2.5 text-xs">
                              <Clock className="size-3.5 animate-pulse text-amber-700" />
                              <span>Validation en cours...</span>
                            </div>

                            <a
                              href={`https://wa.me/22605050577?text=${encodeURIComponent(`Bonjour Alfred, je viens de vérifier mon dashboard pour la formation "${bootcamp.title}". Mon paiement Mobile Money est en cours de validation. Pouvez-vous vérifier mon virement ? Merci !`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2 text-xs transition-all shadow-xs active:scale-95"
                            >
                              <MessageCircle className="size-3.5" />
                              <span>Accélérer sur WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {lockedBootcamps.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading text-base font-bold text-slate-800">Autres bootcamps disponibles</h2>
                      <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">Non inscrit</span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {lockedBootcamps.map((bootcamp: any) => (
                        <div
                          key={bootcamp.dbId}
                          className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden flex flex-col justify-between transition-all shadow-xs hover:shadow-md text-left"
                        >
                          <div className="space-y-3 p-5">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-2">
                              <img src={bootcamp.poster} alt={bootcamp.title} className="w-full h-full object-cover" />
                              <div className="absolute top-2.5 left-2.5">
                                <span className="text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs border bg-primary/10 text-primary border-primary/20">Formule Payante</span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <h3 className="font-heading text-base font-bold text-slate-800 leading-snug">{bootcamp.title}</h3>
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{bootcamp.subtitle}</p>
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                              <div><strong className="text-slate-700">Dates :</strong> {bootcamp.dates}</div>
                              <div><strong className="text-slate-700">Formateur :</strong> {bootcamp.instructor}</div>
                            </div>
                          </div>
                          <div className="p-5 pt-0">
                            <a
                              href={`/bootcamp?course=${bootcamp.slug}`}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-2.5 text-xs shadow-xs transition-all"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <button
                    onClick={() => setSelectedBootcamp(null)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <ChevronRight className="size-4 rotate-180" />
                    <span>← Retour à tous mes Bootcamps</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase">
                      {selectedBootcamp.title}
                    </span>
                  </div>
                </div>

                {/* Check if Bootcamp has sessions configured */}
                {!selectedBootcamp.lessons || selectedBootcamp.lessons.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-8 md:p-12 text-center space-y-6 shadow-xs max-w-3xl mx-auto">
                    <div className="size-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-xs">
                      <Calendar className="size-8 animate-pulse" />
                    </div>
                    <div className="space-y-2 max-w-md mx-auto">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                        Formation confirmée & active
                      </span>
                      <h3 className="font-heading text-xl font-bold text-slate-800">
                        Sessions en cours de programmation
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Vous êtes bien inscrit(e) au <strong>{selectedBootcamp.title}</strong>. L'équipe pédagogique configure actuellement les modules en direct, les horaires et les supports de formation.
                      </p>
                    </div>

                    {selectedBootcamp.dates && (
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200">
                        <Clock className="size-4 text-primary" />
                        <span>Période annoncée : <strong>{selectedBootcamp.dates}</strong></span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      {(selectedBootcamp as any).live_meet_url && (selectedBootcamp as any).live_meet_url.trim() && (selectedBootcamp as any).live_meet_url !== "https://meet.google.com" && (
                        <a
                          href={(selectedBootcamp as any).live_meet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 text-xs shadow-xs transition-all cursor-pointer"
                        >
                          <Video className="size-4" />
                          <span>Rejoindre la Session Google Meet</span>
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedBootcamp(null)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 text-xs transition-all cursor-pointer"
                      >
                        <span>← Revenir à l'accueil</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Main Course Player Frame */
                  (() => {
                    const activeLesson = selectedLesson || selectedBootcamp.lessons[0]

                    return (
                      <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left: Active Video Player or Upcoming Session Countdown */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
                            {selectedBootcamp.status === "upcoming" || activeLesson?.isUpcoming ? (
                              /* Upcoming Session Countdown Frame (No video iframe) */
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-amber-500/20">
                                <div className="size-14 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-sm">
                                  <Clock className="size-7 animate-pulse" />
                                </div>
                                <div className="space-y-1.5 max-w-md">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                    SESSION LIVE À VENIR
                                  </span>
                                  <h3 className="font-heading text-lg md:text-xl font-bold text-white">
                                    {activeLesson?.title}
                                  </h3>
                                  <p className="text-xs text-slate-300 leading-relaxed">
                                    Cette session aura lieu en direct sur Google Meet ({
                                      activeLesson?.scheduledAt
                                        ? new Date(activeLesson.scheduledAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " à " + new Date(activeLesson.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                                        : activeLesson?.scheduledDate || selectedBootcamp.dates
                                    }). Le replay HD sera accessible immédiatement après la session.
                                  </p>
                                </div>

                                {/* Live Ticking Countdown Timer */}
                                <div className="flex items-center gap-2 pt-2">
                                  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-amber-500/40 px-3.5 py-2 min-w-[55px] shadow-sm">
                                    <span className="font-heading text-base font-black text-amber-400 font-mono leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Jours</span>
                                  </div>
                                  <span className="text-amber-400 font-bold text-sm">:</span>
                                  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-amber-500/40 px-3.5 py-2 min-w-[55px] shadow-sm">
                                    <span className="font-heading text-base font-black text-white font-mono leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Heures</span>
                                  </div>
                                  <span className="text-amber-400 font-bold text-sm">:</span>
                                  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-amber-500/40 px-3.5 py-2 min-w-[55px] shadow-sm">
                                    <span className="font-heading text-base font-black text-white font-mono leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Min</span>
                                  </div>
                                  <span className="text-amber-400 font-bold text-sm">:</span>
                                  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-amber-500/40 px-3.5 py-2 min-w-[55px] shadow-sm">
                                    <span className="font-heading text-base font-black text-amber-400 font-mono leading-none animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                    <span className="text-[9px] font-bold text-amber-400/80 uppercase mt-0.5">Sec</span>
                                  </div>
                                </div>

                                {activeLesson?.meetUrl && activeLesson.meetUrl.trim() && activeLesson.meetUrl !== "https://meet.google.com" ? (
                                  <a
                                    href={activeLesson.meetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold px-5 py-2.5 text-xs shadow-xs transition-all mt-2 cursor-pointer"
                                  >
                                    <Video className="size-4" />
                                    <span>Rejoindre la Session Live sur Google Meet</span>
                                  </a>
                                ) : (
                                  <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 font-medium px-4 py-2.5 text-xs mt-2 text-center">
                                    <Video className="size-4 text-amber-400 shrink-0" />
                                    <span>Lien Google Meet disponible avant le début de la session</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Completed/Replay Video Player (iframe) */
                              <iframe
                                src={`${activeLesson?.videoUrl || ""}?autoplay=0`}
                                title={activeLesson?.title || "Session"}
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            )}
                          </div>

                          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 uppercase">
                                    Module {activeLesson?.num || 1}
                                  </span>
                                  {activeLesson?.scheduledDate && (
                                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                      <Calendar className="size-3" />
                                      <span>{activeLesson.scheduledDate}</span>
                                    </span>
                                  )}
                                </div>
                                <h2 className="font-heading text-lg font-bold text-slate-800">
                                  {activeLesson?.title}
                                </h2>
                              </div>

                              <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border ${
                                activeLesson?.isLive
                                  ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                                  : activeLesson?.isUpcoming
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              }`}>
                                {activeLesson?.isLive ? "🟢 En Direct Maintenant" : activeLesson?.isUpcoming ? "🕒 Session à venir" : "🎬 Replay Disponible"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              {activeLesson?.description}
                            </p>

                            {/* PDF Attachment (Available ONLY for past/completed sessions) */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                              {activeLesson?.pdfName ? (
                                activeLesson.isUpcoming || selectedBootcamp.status === "upcoming" ? (
                                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <FileText className="size-4 text-slate-400" />
                                    <span>Support PDF du cours : <strong className="text-amber-700 font-semibold">🔒 Disponible immédiatement après la session live</strong></span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                      <FileText className="size-4 text-purple-600" />
                                      <span>Support PDF du cours : {activeLesson.pdfName}</span>
                                    </div>
                                    <a
                                      href={activeLesson.pdfUrl || "#"}
                                      download
                                      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer shrink-0"
                                    >
                                      <Download className="size-3.5" />
                                      <span>Télécharger (PDF)</span>
                                    </a>
                                  </div>
                                )
                              ) : (
                                <span className="text-xs text-slate-500">Aucun support PDF attaché pour ce module.</span>
                              )}
                            </div>

                            {/* Exercise & Homework Submission Section */}
                            {activeLesson?.exercise && (
                              <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 space-y-3 mt-3 text-left">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300/80">
                                      {activeLesson.exercise.type === 'devoir-a-rendre' ? '📝 Devoir à rendre' : activeLesson.exercise.type === 'cas-pratique' ? '💼 Cas Pratique Métier' : '⚡ Challenge Prompt'}
                                    </span>
                                    <h4 className="text-xs font-bold text-slate-800">{activeLesson.exercise.title}</h4>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
                                    <Clock className="size-3.5" />
                                    <span>Date limite : {activeLesson.exercise.deadline}</span>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                  <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border shrink-0 ${
                                    submittedExerciseIds.includes(activeLesson.exercise.title) || activeLesson.exercise.status === 'submitted'
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : "bg-rose-50 text-rose-800 border-rose-200"
                                  }`}>
                                    {submittedExerciseIds.includes(activeLesson.exercise.title) || activeLesson.exercise.status === 'submitted' ? "✓ Travail Soumis sur la plateforme" : "⏳ En attente de rendu"}
                                  </span>

                                  <button
                                    onClick={() => setSubmittingExercise({
                                      id: activeLesson.exercise!.title,
                                      title: activeLesson.exercise!.title,
                                      deadline: activeLesson.exercise!.deadline
                                    })}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs shadow-2xs transition-all cursor-pointer"
                                  >
                                    <Upload className="size-3.5" />
                                    <span>{submittedExerciseIds.includes(activeLesson.exercise.title) ? "Modifier mon rendu" : "Soumettre ma réponse sur la plateforme"}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Modules & Lessons Playlist for selectedBootcamp */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1">
                            <h3 className="font-heading text-sm font-bold text-slate-800">Sommaire de la formation</h3>
                            <span className="text-xs font-semibold text-slate-500">{selectedBootcamp.lessons.length} sessions</span>
                          </div>

                          <div className="space-y-2 max-h-[640px] lg:max-h-[680px] overflow-y-auto scrollbar-thin pr-1.5 pb-6">
                            {selectedBootcamp.lessons.map((lesson) => {
                              const isSelected = activeLesson?.id === lesson.id

                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => setSelectedLesson(lesson)}
                                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                                    isSelected
                                      ? "bg-primary/10 border-primary shadow-xs"
                                      : "bg-white border-slate-200/90 hover:bg-[#F4F6F8] shadow-2xs"
                                  }`}
                                >
                                  <div className={`size-7 rounded-xl border flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                                    isSelected
                                      ? "bg-primary text-white border-primary"
                                      : "bg-[#F4F6F8] border-slate-200 text-primary"
                                  }`}>
                                    {lesson.num}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? "text-primary" : "text-slate-800"}`}>
                                      {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 flex-wrap">
                                      <Clock className="size-3" />
                                      <span>{lesson.duration}</span>
                                      <span>·</span>
                                      <span className={lesson.isLive ? "text-red-600 font-bold animate-pulse" : lesson.isUpcoming ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                                        {lesson.isLive ? "En Direct" : lesson.isUpcoming ? "À venir" : "Replay HD"}
                                      </span>
                                    </div>
                                    {lesson.scheduledDate && (
                                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 mt-1">
                                        <Calendar className="size-3 shrink-0 text-emerald-600" />
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
                    )
                  })()
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: MASTERCLASSES IA (Directs & Replays) */}
        {activeTab === "masterclasses" && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase">
                    Espace Masterclasses
                  </span>
                </div>
                <h1 className="font-heading text-2xl font-bold text-slate-800 mt-1">
                  Masterclasses IA : Directs & Replays
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Participez aux sessions pratiques en direct animées par Alfred Dah et visionnez tous les replays en streaming HD.
                </p>
              </div>

              <Link
                href="/masterclass"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4F6F8] hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs transition-all shrink-0"
              >
                <span>Voir la page publique</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>

            {/* Notification de confirmation */}
            {masterclassRegisterSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  <span>{masterclassRegisterSuccess}</span>
                </div>
                <button
                  onClick={() => setMasterclassRegisterSuccess(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 1. SECTION PROCHAINE MASTERCLASS EN DIRECT (SI ACTIVE) */}
            {masterclassSession?.is_active ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                  
                  <div className="space-y-4 max-w-2xl text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                      <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                      <span>PROCHAINE SESSION EN DIRECT</span>
                    </div>

                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                      {masterclassSession.title}
                    </h2>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {masterclassSession.description || "Rejoignez Alfred Dah pour 1h30 de formation intensive et interactive en direct."}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Date & Heure</span>
                        <span className="font-bold text-slate-800">{masterclassSession.dateDisplay || "Prochainement"}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Formateur</span>
                        <span className="font-bold text-slate-800">{masterclassSession.instructor || "Alfred Dah"}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Accès Membre</span>
                        <span className="font-bold text-emerald-600">100% Inclus (Gratuit)</span>
                      </div>
                    </div>

                    {/* Actions d'accès : Réservation 1-clic ou Liens Live débloqués */}
                    <div className="pt-2">
                      {isMasterclassRegistered ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                            <span>Votre place est confirmée ! Vos liens d'accès direct sont débloqués :</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <a
                              href={masterclassSession.whatsappGroupUrl || "https://chat.whatsapp.com/leguideai-masterclass"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                            >
                              <MessageCircle className="size-4" />
                              <span>Rejoindre le Groupe WhatsApp</span>
                              <ExternalLink className="size-3.5 opacity-80" />
                            </a>

                            <a
                              href={masterclassSession.youtubeLiveUrl || "https://meet.google.com"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                            >
                              <Video className="size-4" />
                              <span>Rejoindre sur Google Meet</span>
                              <ExternalLink className="size-3.5 opacity-80" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            type="button"
                            disabled={registeringMasterclass}
                            onClick={handleRegisterForMasterclass}
                            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-slate-950 font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            {registeringMasterclass ? (
                              <span>Réservation en cours...</span>
                            ) : (
                              <>
                                <span>Réserver ma place gratuite en 1 clic</span>
                                <ArrowRight className="size-4" />
                              </>
                            )}
                          </button>
                          <p className="text-[11px] text-slate-500">
                            🔒 Cliquez pour confirmer votre inscription et débloquer l'access au masterclass.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Affiche Officielle de la Masterclass (Affichage Intégral Sans Rognage) */}
                  {masterclassSession.thumbnailUrl && (
                    <div className="relative w-full lg:w-72 min-h-[160px] max-h-[220px] rounded-2xl overflow-hidden border border-slate-200 shadow-md shrink-0 bg-slate-950 flex items-center justify-center">
                      <div
                        className="absolute inset-0 bg-cover bg-center blur-lg opacity-30 scale-110 pointer-events-none"
                        style={{ backgroundImage: `url(${masterclassSession.thumbnailUrl})` }}
                      />
                      <img
                        src={masterclassSession.thumbnailUrl}
                        alt={masterclassSession.title}
                        className="relative z-10 w-full h-auto max-h-[220px] object-contain mx-auto"
                      />
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3">
                <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                  <Radio className="size-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800">
                  Prochaine Masterclass en Direct en Préparation
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                  L'équipe pédagogique prépare la prochaine session pratique. En attendant, découvrez et visionnez l'intégralité de nos replays vidéos ci-dessous !
                </p>
              </div>
            )}

            {/* 2. VIDÉOTHÈQUE DES REPLAYS */}
            {masterclassReplays.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-slate-800">
                      Replays des Masterclasses Passées ({masterclassReplays.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Visionnez les démonstrations et méthodologies sans limite de temps.
                    </p>
                  </div>

                  {/* Recherche */}
                  <div className="relative w-full sm:w-64">
                    <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={masterclassSearchQuery}
                      onChange={(e) => setMasterclassSearchQuery(e.target.value)}
                      placeholder="Filtrer les replays..."
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary shadow-2xs"
                    />
                  </div>
                </div>

                {/* Filtres par Catégorie */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {["Tous", "Prompting", "Automatisation", "Création de Contenu", "Business"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMasterclassCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        masterclassCategoryFilter === cat
                          ? "bg-primary text-slate-950 shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grille des Replays */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                  {masterclassReplays
                    .filter(r => {
                      const matchCat = masterclassCategoryFilter === "Tous" || r.category?.toLowerCase() === masterclassCategoryFilter.toLowerCase()
                      const matchQuery = !masterclassSearchQuery || r.title?.toLowerCase().includes(masterclassSearchQuery.toLowerCase()) || r.description?.toLowerCase().includes(masterclassSearchQuery.toLowerCase())
                      return matchCat && matchQuery
                    })
                    .map((replay) => (
                      <div
                        key={replay.id}
                        className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow text-left"
                      >
                        <div 
                          onClick={() => {
                            if (subscriptionData?.isSubscribed) {
                              setActiveMasterclassReplayModal(replay)
                            } else {
                              setIsSubscriptionModalOpen(true)
                            }
                          }}
                          className="relative aspect-video bg-black overflow-hidden cursor-pointer group"
                        >
                          <img
                            src={`https://img.youtube.com/vi/${replay.youtubeId}/hqdefault.jpg`}
                            alt={replay.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e: any) => { e.currentTarget.src = "/Logo avatar.png" }}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                            {subscriptionData?.isSubscribed ? (
                              <div className="size-11 rounded-full bg-primary text-slate-950 flex items-center justify-center pl-0.5 shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="size-5 fill-slate-950" />
                              </div>
                            ) : isSubPending ? (
                              <div className="size-11 rounded-full bg-slate-950/90 border border-amber-400 text-amber-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Clock className="size-5 text-amber-400 animate-pulse" />
                              </div>
                            ) : (
                              <div className="size-11 rounded-full bg-slate-900/90 border border-amber-400 text-amber-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Lock className="size-5 text-amber-400" />
                              </div>
                            )}
                          </div>
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                            {replay.duration || "1h 30min"}
                          </span>
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-primary text-slate-950 text-[10px] font-black uppercase">
                            {replay.category || "Masterclass"}
                          </span>
                          {isSubPending ? (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase flex items-center gap-1 shadow-xs">
                              <Clock className="size-2.5" />
                              <span>⏳ Validation en cours</span>
                            </span>
                          ) : !subscriptionData?.isSubscribed && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase flex items-center gap-1">
                              <Lock className="size-2.5" />
                              <span>Pass VIP Requis</span>
                            </span>
                          )}
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-snug">
                              {replay.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                              {replay.description}
                            </p>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>{replay.instructor || "Alfred Dah"}</span>
                              <span>{replay.date}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (subscriptionData?.isSubscribed) {
                                  setActiveMasterclassReplayModal(replay)
                                } else {
                                  setIsSubscriptionModalOpen(true)
                                }
                              }}
                              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                subscriptionData?.isSubscribed
                                  ? "bg-slate-900 hover:bg-primary hover:text-slate-950 text-white"
                                  : isSubPending
                                  ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
                              }`}
                            >
                              {subscriptionData?.isSubscribed ? (
                                <>
                                  <Play className="size-3.5 fill-current" />
                                  <span>Visionner le Replay HD</span>
                                </>
                              ) : isSubPending ? (
                                <>
                                  <Clock className="size-3.5" />
                                  <span>⏳ En cours de validation (2h-4h)</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="size-3.5" />
                                  <span>Débloquer avec le Pass VIP</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Modal Lecteur Replay YouTube */}
            {activeMasterclassReplayModal && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 truncate max-w-[80%]">
                      <Play className="size-4 text-primary fill-primary" />
                      <span className="truncate">{activeMasterclassReplayModal.title}</span>
                    </div>
                    <button
                      onClick={() => setActiveMasterclassReplayModal(null)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="px-4">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${activeMasterclassReplayModal.youtubeId}?autoplay=1&rel=0`}
                        title={activeMasterclassReplayModal.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>

                  <div className="p-4 pt-0 text-left space-y-1">
                    <p className="text-xs text-slate-600">{activeMasterclassReplayModal.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>Formateur : {activeMasterclassReplayModal.instructor || "Alfred Dah"}</span>
                      <span>Date : {activeMasterclassReplayModal.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: RESOURCES (1-Click Copy, Downloads & Bonus Media - Gated by Subscription) */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="font-heading text-2xl font-bold text-slate-800">Bibliothèque des Prompts</h1>
                <p className="text-xs text-slate-500 mt-1">Accédez à tous vos prompts, business plans, exercices pratiques.</p>
              </div>

              <div className="relative w-full max-w-xs">
                <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Rechercher une ressource..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary shadow-2xs"
                />
              </div>
            </div>

            {/* VIP Pricing & Activation Card if Not Subscribed */}
            {isSubPending ? (
              <div className="rounded-3xl border border-amber-300 bg-amber-50/80 p-6 sm:p-8 shadow-xs space-y-4 text-left animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="size-14 rounded-2xl bg-amber-500/20 text-amber-800 border border-amber-300/80 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                      <Clock className="size-7 text-amber-700 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                          ⏳ Abonnement en cours de validation
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-800 bg-white/70 px-2 py-0.5 rounded-md border border-amber-200">
                          Réf : {subscriptionData?.transactionRef || "Reçu soumis"}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        Votre souscription à la formule {subscriptionData?.planLabel || "Pass VIP"} est enregistrée
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        Notre équipe vérifie actuellement votre justificatif de paiement. Tous les prompts et outils avancés seront automatiquement débloqués sur votre espace sous 2h à 4h.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Clock className="size-4" />
                    <span>Détails du Paiement</span>
                  </button>
                </div>
              </div>
            ) : !subscriptionData?.isSubscribed && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 text-center">
                <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-2xs border border-amber-400/20">
                  <Crown className="size-7 text-amber-500" />
                </div>

                {/* Choix des formules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2 text-left">
                  <div className="p-5 rounded-2xl border-2 border-primary/40 hover:border-primary transition-all bg-white shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase text-slate-500">Pass 3 Mois</span>
                      <div className="text-2xl font-black text-slate-900">
                        {subscriptionData?.pricing?.price3mDisplay || "10 000 FCFA"}
                      </div>
                      <p className="text-xs text-slate-500">Accès illimité pendant 90 jours</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all cursor-pointer text-center shadow-xs"
                    >
                      Choisir le Pass 3 Mois
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl border-2 border-amber-400 bg-amber-50/30 shadow-xs flex flex-col justify-between space-y-4 relative">
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase shadow-xs">
                      Économisez 10 000 F
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase text-amber-700">Pass 1 An (Recommandé)</span>
                      <div className="text-2xl font-black text-slate-900">
                        {subscriptionData?.pricing?.price1yDisplay || "30 000 FCFA"}
                      </div>
                      <p className="text-xs text-slate-500">Accès illimité pendant 365 jours + Mises à jour</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary via-primary to-amber-500 text-slate-950 font-black text-xs hover:opacity-95 transition-all shadow-md cursor-pointer text-center"
                    >
                      Choisir le Pass 1 An
                    </button>
                  </div>
                </div>

                                <div className="space-y-2 max-w-xl mx-auto">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Un pass unique qui débloque tous les outils, la veille stratégique hebdomadaire, les prompts métiers, les replays privés et la prolongation mensuelle en direct.
                  </p>
                </div>

                {/* 6 Avantages officiels du Cercle IA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto pt-1 text-left">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                      <Mail className="size-4 text-primary shrink-0" />
                      <span>Veille IA Hebdo</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Envoyée chaque lundi avec les meilleurs outils &amp; cas d'usage.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                      <Sparkles className="size-4 text-purple-600 shrink-0" />
                      <span>Prompts &amp; Plans</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Nouvelle série de prompts métiers ajoutée chaque mois.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                      <Play className="size-4 text-emerald-600 shrink-0" />
                      <span>Replays Masterclasses</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Accès privé et illimité à toutes les rediffusions HD.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                      <Radio className="size-4 text-rose-600 shrink-0" />
                      <span>Prolongation Live</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Dernier dimanche (16h30-17h30) : échange direct avec Alfred Dah.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                      <Users className="size-4 text-blue-600 shrink-0" />
                      <span>Groupe Fermé</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Communauté exclusive d'entraide.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                      <ArrowRightCircle className="size-4 text-amber-600 shrink-0" />
                      <span>100% Déductible Bootcamp</span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-semibold">Montant déduit à 100% si vous rejoignez un Bootcamp.</p>
                  </div>
                </div>
                
              </div>
            )}

            {/* Filter Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                {[
                  { id: "all", label: "Toutes les ressources" },
                  { id: "prompt", label: "Prompts Métiers" },
                  { id: "business-plan", label: "Business Plans" },
                  { id: "exercise", label: "Exercices & Fichiers" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedResourceTypeFilter(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedResourceTypeFilter === t.id ? "bg-primary text-white shadow-xs" : "bg-[#F4F6F8] border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-500 font-medium hidden sm:block">
                {filteredResources.length} ressource{filteredResources.length > 1 ? "s" : ""} disponible{filteredResources.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-300 rounded-3xl p-6 bg-white">
                <p className="text-xs text-slate-500">Aucune ressource ne correspond à vos filtres actuels.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredResources.map((item) => {
                  const isLocked = !subscriptionData?.isSubscribed

                  return (
                    <div key={item.id} className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-primary/40 hover:shadow-md transition-all shadow-xs text-left">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                            item.type === 'prompt'
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : item.type === 'business-plan'
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}>
                            {item.type === 'prompt' ? "Prompt Métier" : item.type === 'business-plan' ? "Business Plan" : "Exercice & Fichier"}
                          </span>

                          {item.category && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <h4 className="font-heading text-base font-bold text-slate-800">{item.title.fr}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.desc.fr}</p>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-[#F4F6F8] p-3.5 text-left">
                          {isLocked ? (
                            <div className="relative max-h-36 overflow-hidden text-[11px] font-mono leading-relaxed select-none pointer-events-none">
                              {/* Teaser Header Badge */}
                              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1">
                                <Sparkles className="size-3 text-amber-500" />
                                <span>Extrait en clair (Début du prompt) :</span>
                              </div>
                              
                              {/* Crystal Clear Beginning Snippet */}
                              <div className="text-slate-800 font-semibold opacity-100 pb-0.5 whitespace-pre-wrap">
                                {item.content.fr.slice(0, 140)}...
                              </div>

                              {/* Blurred Rest of Prompt (Uncopyable) */}
                              <div className="blur-[6px] opacity-25 select-none pointer-events-none text-slate-500 mt-1 whitespace-pre-wrap">
                                {item.content.fr.slice(140, 320) || "Texte intégral du prompt métier avec consignes, variables de contexte et structure d'exécution..."}
                              </div>

                              {/* Lock Gradient Overlay */}
                              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#F4F6F8] via-[#F4F6F8]/80 to-transparent flex items-end justify-center pb-0.5">
                                <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                                  <Lock className="size-3" />
                                  <span>Suite du prompt &amp; variables réservées au Pass VIP</span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="max-h-36 overflow-y-auto text-[11px] font-mono text-slate-700 whitespace-pre-wrap scrollbar-thin select-all">
                              {item.content.fr}
                            </div>
                          )}
                        </div>

                        {/* Action buttons (Unlocked vs Locked) - Responsive */}
                        {isLocked ? (
                          <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="w-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold py-2.5 px-3 text-xs shadow-sm transition-all cursor-pointer text-center"
                          >
                            <div className="flex items-center gap-1.5 font-black">
                              <Crown className="size-3.5 shrink-0" />
                              <span>Débloquer Tous les Prompts &amp; Replays</span>
                            </div>
                            <span className="text-[10px] opacity-80 sm:border-l sm:border-slate-950/20 sm:pl-2">Dès 10 000 FCFA</span>
                          </button>
                        ) : (
                          <>
                            {item.type === 'prompt' && (
                              <button
                                onClick={() => handleCopyPrompt(item.id, item.content.fr)}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-2.5 text-xs shadow-xs transition-all cursor-pointer"
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
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs shadow-xs transition-all"
                              >
                                <Download className="size-4" />
                                <span>Télécharger le Business Plan (DOCX / PDF)</span>
                              </a>
                            )}

                            {item.type === 'exercise' && (
                              <div className="space-y-2">
                                {item.deadline && (
                                  <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-amber-900 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200 gap-2">
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="size-3.5 text-amber-700" />
                                      <span>Date limite de rendu : {item.deadline}</span>
                                    </span>
                                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                      {item.exerciseType === 'devoir-a-rendre' ? '📝 Devoir à rendre' : '💼 Cas Pratique'}
                                    </span>
                                  </div>
                                )}

                                <div className="grid gap-2 sm:grid-cols-2">
                                  <a
                                    href={item.downloadUrl || "#"}
                                    download
                                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#F4F6F8] hover:bg-slate-200 text-slate-800 font-bold py-2.5 text-xs border border-slate-200 shadow-2xs transition-all"
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
                                    className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 text-xs shadow-2xs transition-all cursor-pointer"
                                  >
                                    <Upload className="size-3.5" />
                                    <span>{submittedExerciseIds.includes(item.id) ? "✓ Rendu Soumis" : "Soumettre sur la plateforme"}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CERTIFICATES */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-slate-800">Mes Certificats Officiels</h1>
              <p className="text-xs text-slate-500 mt-1">Générez et vérifiez vos attestations certifiées délivrées par LE GUIDE IA.</p>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center space-y-5 max-w-xl mx-auto shadow-xs">
              <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                <Award className="size-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-heading text-xl font-bold text-slate-800">Certificat Officiel — Bootcamp IA Pro 2</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Attestation de compétences délivrée par Alfred Dah (Expert IA). Valide pour LinkedIn et valorisation professionnelle.
                </p>
              </div>

              <div className="pt-2 flex flex-col items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                  Statut : Certificat Validé &amp; Délivré
                </span>

                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 text-xs shadow-xs transition-all cursor-pointer"
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
              <h1 className="font-heading text-2xl font-bold text-slate-800">Mes Factures &amp; Reçus</h1>
              <p className="text-xs text-slate-500 mt-1">Téléchargez vos factures d'achat et reçus d'inscription officiels.</p>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-[#F4F6F8] text-xs font-bold text-slate-600 grid grid-cols-4">
                <span>Description</span>
                <span>Date</span>
                <span>Montant</span>
                <span className="text-right">Action / Statut</span>
              </div>

              {(() => {
                if (userInvoices.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                      <p className="font-bold text-slate-700">Aucune facture enregistrée dans Supabase</p>
                      <p>Les factures et reçus d'inscription officiels apparaîtront automatiquement ici dès qu'un versement est confirmé.</p>
                    </div>
                  )
                }

                return userInvoices.map((inv: any) => (
                  <div key={inv.id} className="p-4 grid grid-cols-4 text-xs items-center border-b border-slate-100 hover:bg-[#F4F6F8]/60 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800">{inv.title}</p>
                      <p className="text-[10px] text-slate-500">{inv.method}</p>
                    </div>
                    <span className="text-slate-600">{inv.date}</span>
                    <span className="font-mono font-bold text-slate-800">{inv.amount}</span>
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

        {/* TAB: PAIEMENTS & ABONNEMENTS (REPLAYS, PROMPTS & BOOTCAMPS) */}
        {activeTab === "subscription" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase border border-primary/20">
                    Facturation &amp; Accès
                  </span>
                </div>
                <h1 className="font-heading text-2xl font-bold text-slate-800 mt-1">
                  Paiements, Abonnements &amp; Factures
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Consultez l'état de votre abonnement VIP, l'accès à vos Bootcamps et téléchargez vos reçus et factures d'achat.
                </p>
              </div>
            </div>

            {/* 1. CARTE DE STATUT PRINCIPALE */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              
              {subscriptionData?.isSubscribed ? (
                <div className="space-y-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-400 to-primary text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg">
                        <Crown className="size-8 fill-slate-950" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                            <CheckCircle2 className="size-3 text-emerald-700" />
                            <span>Abonnement Actif &amp; Validé</span>
                          </span>
                          {subscriptionData.hasBootcampAccess && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
                              🎉 Inclus avec votre Bootcamp
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                          {subscriptionData.planLabel || "Pass VIP Replays & Prompts"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Accès illimité à l'intégralité des replays masterclasses et à la bibliothèque complète de prompts IA.
                        </p>
                      </div>
                    </div>

                    {/* Compteur de Jours Restants */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950 text-white shrink-0 border border-slate-800 shadow-md">
                      <div className="text-center px-2">
                        <div className="font-mono text-3xl font-black text-amber-400">
                          {subscriptionData.daysRemaining !== undefined ? subscriptionData.daysRemaining : 365}
                        </div>
                        <div className="text-[10px] font-extrabold uppercase text-slate-400">
                          Jours Restants
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grille de Détails Techniques */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200/90 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Date d'activation</span>
                      <p className="font-bold text-xs text-slate-800">
                        {subscriptionData.startsAt ? new Date(subscriptionData.startsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Aujourd'hui"}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200/90 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Date d'expiration</span>
                      <p className="font-bold text-xs text-emerald-800">
                        {subscriptionData.expiresAt ? new Date(subscriptionData.expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Permanent"}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200/90 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Moyen de paiement</span>
                      <p className="font-bold text-xs text-slate-800">
                        {subscriptionData.paymentMethod || "Mobile Money"}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200/90 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Référence</span>
                      <p className="font-mono font-bold text-xs text-slate-800 truncate">
                        {subscriptionData.transactionRef || "VIP-BOOTCAMP"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : isSubPending ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-4 text-left">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      <Clock className="size-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900 text-[10px] font-black uppercase">
                        <span>⏳ En attente de validation</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800">
                        Paiement Mobile Money en cours de vérification
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Votre demande d'abonnement VIP pour <strong>{subscriptionData?.planLabel || "Pass VIP"}</strong> a bien été enregistrée (Réf: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">{subscriptionData?.transactionRef || "Reçu transmis"}</code>). Notre équipe vérifie votre virement sous 2h à 4h pour activer vos accès.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <a
                      href={`https://wa.me/22675757273?text=${encodeURIComponent(`Bonjour Le Guide IA, je viens de souscrire au Pass VIP (${subscriptionData?.planLabel || ""}, Réf: ${subscriptionData?.transactionRef || ""}) et je souhaite vérifier ma validation.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#22c55e] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#16a34a] transition-all shadow-xs"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Accélérer la validation sur WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#F4F6F8] border border-slate-200/90 text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0 border border-amber-400/20">
                      <Crown className="size-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Aucun abonnement VIP actif</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Vous pouvez souscrire à tout moment depuis l'onglet <strong>« Mes Ressources »</strong> pour débloquer les replays et prompts.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap text-center"
                  >
                    Prendre mon Pass VIP →
                  </button>
                </div>
              )}

            </div>


            {/* 3. HISTORIQUE COMPLET DES PAIEMENTS ET FACTURES (BOOTCAMPS + ABONNEMENTS) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-800">
                    Historique de Tous mes Paiements &amp; Factures
                  </h3>
                  <p className="text-xs text-slate-500">
                    Retrouvez l'ensemble de vos transactions et téléchargez vos reçus d'achat officiels.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 bg-[#F4F6F8] text-xs font-bold text-slate-600 grid grid-cols-4">
                  <span>Description</span>
                  <span>Date</span>
                  <span>Montant</span>
                  <span className="text-right">Action / Reçu</span>
                </div>

                {userInvoices.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                    <Receipt className="size-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">Aucun paiement archivé pour le moment</p>
                    <p>Vos factures d'inscription aux Bootcamps et reçus d'abonnements s'afficheront automatiquement ici dès validation.</p>
                  </div>
                ) : (
                  userInvoices.map((inv: any) => (
                    <div key={inv.id} className="p-4 grid grid-cols-4 text-xs items-center border-b border-slate-100 hover:bg-[#F4F6F8]/60 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800">{inv.title}</p>
                        <p className="text-[10px] text-slate-500">{inv.method}</p>
                      </div>
                      <span className="text-slate-600">{inv.date}</span>
                      <span className="font-mono font-bold text-emerald-800">{inv.amount}</span>
                      <div className="text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv)
                            setIsInvoiceModalOpen(true)
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <Download className="size-3.5" />
                          <span>Facture (PDF)</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>


          </div>
        )}

        {/* TAB 6: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="font-heading text-2xl font-bold text-slate-800">Mon Profil Apprenant</h1>
              <p className="text-xs text-slate-500 mt-1">Vos coordonnées officielles affichées sur vos certificats et factures.</p>
            </div>

            {profileError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-3 text-xs text-rose-800 animate-in fade-in duration-200">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in duration-200">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Profil mis à jour avec succès.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nom complet (affiché sur le certificat)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Mass Diop"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Adresse Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F6F8] px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Numéro WhatsApp avec Drapeaux & Indicatifs Internationaux */}
              <div className="space-y-1.5" ref={profileCountryDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Numéro WhatsApp</label>
                  <span className="text-[10px] text-slate-500">
                    {profileCountry.name} ({profileCountry.dial})
                  </span>
                </div>

                <div className="relative flex items-center">
                  {/* Flag & Dial Selector Button */}
                  <button
                    type="button"
                    onClick={() => setIsProfileCountryDropdownOpen(!isProfileCountryDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-[#F4F6F8] text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-all cursor-pointer shrink-0 z-10"
                    title={`Changer de pays (${profileCountry.name})`}
                  >
                    <span className="text-base leading-none">{getCountryFlag(profileCountry.code)}</span>
                    <span className="font-mono text-slate-700">{profileCountry.dial}</span>
                    <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isProfileCountryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Phone Input */}
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => handleProfilePhoneChange(e.target.value)}
                    placeholder={currentProfilePhoneRule?.placeholder || "70 12 34 56"}
                    className={`w-full rounded-r-xl border bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs ${
                      rawProfilePhoneDigits.length > 0 && isProfilePhoneValid
                        ? "border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        : rawProfilePhoneDigits.length > 0 && !isProfilePhoneValid
                        ? "border-amber-500 focus:ring-1 focus:ring-amber-500"
                        : "border-slate-200 focus:ring-1 focus:ring-primary"
                    }`}
                  />

                  {/* Country Dropdown */}
                  {isProfileCountryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full max-h-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      {/* Search */}
                      <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={profileCountrySearch}
                            onChange={(e) => setProfileCountrySearch(e.target.value)}
                            placeholder="Rechercher un pays ou indicatif..."
                            className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Country List */}
                      <div className="overflow-y-auto divide-y divide-slate-100 text-left">
                        {filteredProfileCountries.map((c) => {
                          const isSelected = c.code === profileCountry.code
                          return (
                            <button
                              key={`${c.code}-${c.dial}`}
                              type="button"
                              onClick={() => {
                                setProfileCountry(c)
                                setIsProfileCountryDropdownOpen(false)
                                setProfileCountrySearch("")
                                if (profilePhone) {
                                  setProfilePhone(formatPhoneNumber(profilePhone, c.code))
                                }
                              }}
                              className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                                isSelected ? "bg-primary/10 text-primary font-bold" : "text-slate-700"
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                <span className="text-base">{getCountryFlag(c.code)}</span>
                                <span className="truncate">{c.name}</span>
                              </span>
                              <span className="font-mono text-slate-500 font-semibold ml-2 shrink-0">
                                {c.dial}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Validation Indicator */}
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  {rawProfilePhoneDigits.length > 0 ? (
                    isProfilePhoneValid ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="size-3" /> Numéro valide pour {profileCountry.name}
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1 font-semibold">
                        <AlertCircle className="size-3" /> {currentProfilePhoneRule ? `Format : ${currentProfilePhoneRule.formatExample} (${rawProfilePhoneDigits.length}/${Array.isArray(currentProfilePhoneRule.expectedLength) ? currentProfilePhoneRule.expectedLength.join(' ou ') : currentProfilePhoneRule.expectedLength})` : "Format incomplet"}
                      </span>
                    )
                  ) : (
                    <span className="text-slate-500">
                      Format conseillé : {currentProfilePhoneRule ? `${profileCountry.dial} ${currentProfilePhoneRule.placeholder}` : `${profileCountry.dial} ...`}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Pays de résidence (Sélecteur avec Drapeaux & Recherche) */}
                <div className="space-y-1.5" ref={countryResidenceDropdownRef}>
                  <label className="text-xs font-semibold text-slate-700">Pays de résidence</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryResidenceDropdownOpen(!isCountryResidenceDropdownOpen)}
                      className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 hover:bg-slate-50 transition-all cursor-pointer text-left shadow-2xs"
                    >
                      <span className="flex items-center gap-2 truncate">
                        {selectedResidenceCountryObj ? (
                          <>
                            <span className="text-base leading-none">{getCountryFlag(selectedResidenceCountryObj.code)}</span>
                            <span className="font-semibold text-slate-800">{selectedResidenceCountryObj.name}</span>
                          </>
                        ) : country ? (
                          <span className="font-semibold text-slate-800">{country}</span>
                        ) : (
                          <span className="text-slate-400">Sélectionnez votre pays...</span>
                        )}
                      </span>
                      <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isCountryResidenceDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Popover Dropdown Pays */}
                    {isCountryResidenceDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full max-h-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                          <div className="relative">
                            <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              value={countryResidenceSearch}
                              onChange={(e) => setCountryResidenceSearch(e.target.value)}
                              placeholder="Rechercher un pays..."
                              className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto divide-y divide-slate-100 text-left">
                          {filteredResidenceCountries.map((c) => {
                            const isSelected = country.toLowerCase() === c.name.toLowerCase() || country.toLowerCase() === c.code.toLowerCase()
                            return (
                              <button
                                key={`res-${c.code}`}
                                type="button"
                                onClick={() => {
                                  setCountry(c.name)
                                  setIsCountryResidenceDropdownOpen(false)
                                  setCountryResidenceSearch("")
                                }}
                                className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                                  isSelected ? "bg-primary/10 text-primary font-bold" : "text-slate-700"
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <span className="text-base">{getCountryFlag(c.code)}</span>
                                  <span className="truncate">{c.name}</span>
                                </span>
                                {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ville */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ouagadougou, Abidjan, Dakar, Paris..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
              </div>

              {/* Secteur d'activité / Profession (Sélecteur par Catégories Design) */}
              <div className="space-y-1.5" ref={sectorDropdownRef}>
                <label className="text-xs font-semibold text-slate-700">Secteur d'activité / Profession</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 hover:bg-slate-50 transition-all cursor-pointer text-left shadow-2xs"
                  >
                    <span className="truncate font-semibold text-slate-800">
                      {sector || <span className="text-slate-400 font-normal">Sélectionnez votre secteur ou métier...</span>}
                    </span>
                    <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isSectorDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Popover Dropdown Secteur */}
                  {isSectorDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full max-h-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                        <div className="relative">
                          <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={sectorSearch}
                            onChange={(e) => setSectorSearch(e.target.value)}
                            placeholder="Rechercher un métier ou domaine..."
                            className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto divide-y divide-slate-100 text-left">
                        {filteredSectorsByCategory.map((group) => (
                          <div key={group.category} className="py-1">
                            {/* Distinct Visible Category Header */}
                            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary bg-[#F4F6F8] sticky top-0 border-y border-slate-100">
                              {group.category}
                            </div>
                            <div className="divide-y divide-slate-100">
                              {group.options.map((opt) => {
                                const isSelected = sector === opt
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setSector(opt)
                                      setIsSectorDropdownOpen(false)
                                      setSectorSearch("")
                                    }}
                                    className={`w-full px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                                      isSelected ? "bg-primary/10 text-primary font-bold" : "text-slate-700"
                                    }`}
                                  >
                                    <span className="truncate">{opt}</span>
                                    {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Champ Précision si Autre secteur ou valeur personnalisée */}
                {(sector === "Autre secteur d'activité" || (sector && !ALL_KNOWN_SECTORS.includes(sector))) && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <input
                      type="text"
                      value={sector === "Autre secteur d'activité" ? "" : sector}
                      onChange={(e) => setSector(e.target.value || "Autre secteur d'activité")}
                      placeholder="Précisez votre profession ou domaine exact..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={savingProfile || (rawProfilePhoneDigits.length > 0 && !isProfilePhoneValid)}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-xl text-left relative overflow-hidden">
            <div className="border-4 border-[#D4AF37] p-6 rounded-2xl bg-amber-50/20 text-center space-y-4 relative">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                <span className="font-heading text-sm font-black tracking-tight text-slate-800">LE GUIDE <span className="text-primary">IA</span></span>
                <span className="text-[10px] font-mono text-slate-500">ID : CERT-2026-{user?.id?.substring(0, 6) || "9876"}</span>
              </div>

              <div className="space-y-2 py-4">
                <span className="text-xs uppercase tracking-widest text-amber-800 font-extrabold">CERTIFICAT DE RÉUSSITE OFFICIEL</span>
                <p className="text-xs text-slate-500">Ce certificat est décerné à</p>
                <h2 className="font-heading text-2xl md:text-3xl font-black text-slate-800">{fullName || "NOM DE L'APPRENANT"}</h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Pour avoir complété avec succès le programme intensif de formation professionnelle
                  <strong className="text-primary block mt-1">BOOTCAMP IA PRO 2 — MAÎTRISE DE L'IA PRATIQUE</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-amber-200/80 text-xs">
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] text-slate-500 block">Formateur &amp; Auditeur</span>
                  <span className="font-bold text-slate-800">Alfred Dah</span>
                </div>
                <div className="size-14 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                  <img src="/Logo%20avatar.png" alt="QR" className="size-12 object-cover rounded" />
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-slate-500 block">Date de délivrance</span>
                  <span className="font-bold text-slate-800">6 Septembre 2026</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-800">Facture Officielle / Reçu</h3>
                <span className="text-[10px] text-slate-500 font-mono">Réf: {selectedInvoice?.ref || "FACT-2026-0899"}</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">PAYÉ</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Client :</span>
                <span className="font-semibold text-slate-800">{fullName || user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Désignation :</span>
                <span className="font-semibold text-slate-800">{selectedInvoice?.title || "Bootcamp IA Pro 2"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Moyen de règlement :</span>
                <span className="font-semibold text-slate-800">{selectedInvoice?.method || "Mobile Money / Wave"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date de règlement :</span>
                <span className="font-semibold text-slate-800">{selectedInvoice?.date || "Août 2026"}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-sm">
                <span className="font-bold text-slate-800">Montant Total :</span>
                <span className="font-bold text-primary font-mono">{selectedInvoice?.amount || "99 000 FCFA"}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-xl text-left relative overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  SOUMISSION D'EXERCICE SUR LA PLATEFORME
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-800">
                  {submittingExercise.title}
                </h3>
                {submittingExercise.deadline && (
                  <p className="text-xs text-amber-900 font-semibold flex items-center gap-1.5 pt-0.5">
                    <Clock className="size-3.5 text-amber-700" />
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
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submissionSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="size-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="size-8 stroke-[2.5]" />
                </div>
                <h4 className="font-heading text-xl font-bold text-slate-800">Travail Soumis avec Succès !</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Votre fichier et vos notes ont été enregistrés sur la plateforme. Votre formateur (Alfred Dah) examinera votre rendu sous 48h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                {/* File Upload Drop Area */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    1. Sélectionner votre fichier (PDF, Vidéo MP4, Excel XLSX, Word DOCX, JSON, ZIP)
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-primary bg-[#F4F6F8] p-6 rounded-2xl text-center space-y-3 transition-colors">
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
                      <p className="text-xs font-bold text-slate-800">
                        {selectedFile ? selectedFile.name : "Cliquez ou glissez-déposez votre fichier de travail ici"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {selectedFile
                          ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Type: ${selectedFile.type || "Fichier"}`
                          : "Formats acceptés : PDF, Vidéo MP4/MOV, Excel, DOCX, JSON, ZIP (Max 500 MB)"}
                      </p>
                    </div>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="relative z-20 text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Changer / Supprimer ce fichier
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Comments for Instructor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    2. Remarques ou explications complémentaires pour le formateur (Optionnel)
                  </label>
                  <textarea
                    rows={3}
                    value={submissionComment}
                    onChange={(e) => setSubmissionComment(e.target.value)}
                    placeholder="Décrivez succinctement la méthodologie ou les hypothèses utilisées pour cet exercice..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary resize-none shadow-2xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittingExercise(null)
                      setSelectedFile(null)
                      setSubmissionComment("")
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingWork || (!selectedFile && !submissionComment.trim())}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer"
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

      {/* Modal d'Abonnement VIP Replays & Prompts */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        user={user}
        sourceContext="dashboard"
        onSuccess={() => {
          setActiveTab("resources")
          if (user?.email) {
            fetch(`/api/subscriptions?email=${encodeURIComponent(user.email)}`)
              .then(r => r.json())
              .then(d => setSubscriptionData(d))
              .catch(() => {})
          }
        }}
      />

      {/* MODAL OBLIGATOIRE DE FINALISATION DU PROFIL (Non-Admins uniquement) */}
      {!loading && user && !isAdmin && profile?.role !== "admin" && profile?.role !== "super_admin" && !isProfileSavedInDb && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden w-full max-w-xl my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 size-36 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="size-3.5" />
                  <span>Étape Obligatoire • Finalisation du Profil</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
                  <span>Complétez votre profil apprenant</span>
                  <span className="text-2xl">🎓</span>
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ces informations sont indispensables pour délivrer vos <strong>certificats officiels</strong>, vous intégrer à votre <strong>groupe WhatsApp de formation</strong> et adapter vos contenus.
                </p>

                {/* Progress Bar */}
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>Progression du profil</span>
                    <span className="text-primary font-bold">{profileCompletionStats.percentage}% ({profileCompletionStats.completedCount}/{profileCompletionStats.total} complétés)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300 rounded-full"
                      style={{ width: `${profileCompletionStats.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4">
              {profileError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* 1. Nom complet */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>1. Nom et Prénoms officiels *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Inscrit sur vos certificats</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Jean-Marc Kouassi"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-medium"
                />
              </div>

              {/* 2. Numéro WhatsApp */}
              <div className="space-y-1" ref={forcedPhoneCountryRef}>
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>2. Numéro WhatsApp actif *</span>
                  <span className="text-[10px] text-slate-500 font-normal">{profileCountry.name} ({profileCountry.dial})</span>
                </label>
                <div className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsForcedPhoneCountryOpen(!isForcedPhoneCountryOpen)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-all cursor-pointer shrink-0 z-10"
                    title={`Changer d'indicatif (${profileCountry.name})`}
                  >
                    <span className="text-base leading-none">{getCountryFlag(profileCountry.code)}</span>
                    <span className="font-mono text-slate-700">{profileCountry.dial}</span>
                    <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isForcedPhoneCountryOpen ? "rotate-180" : ""}`} />
                  </button>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => handleProfilePhoneChange(e.target.value)}
                    placeholder={currentProfilePhoneRule?.placeholder || "70 12 34 56"}
                    className={`w-full rounded-r-xl border bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs ${
                      rawProfilePhoneDigits.length > 0 && isProfilePhoneValid
                        ? "border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        : rawProfilePhoneDigits.length > 0 && !isProfilePhoneValid
                        ? "border-amber-500 focus:ring-1 focus:ring-amber-500"
                        : "border-slate-200 focus:ring-1 focus:ring-primary"
                    }`}
                  />

                  {/* Dropdown Indicatifs */}
                  {isForcedPhoneCountryOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full max-h-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[120] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={forcedPhoneCountrySearch}
                            onChange={(e) => setForcedPhoneCountrySearch(e.target.value)}
                            placeholder="Rechercher un pays ou indicatif..."
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto divide-y divide-slate-100 text-left">
                        {filteredForcedPhoneCountries.map((c) => {
                          const isSelected = c.code === profileCountry.code
                          return (
                            <button
                              key={`fpc-${c.code}-${c.dial}`}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setProfileCountry(c)
                                setIsForcedPhoneCountryOpen(false)
                                setForcedPhoneCountrySearch("")
                                if (profilePhone) {
                                  setProfilePhone(formatPhoneNumber(profilePhone, c.code))
                                }
                              }}
                              className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                                isSelected ? "bg-primary/10 text-primary font-bold" : "text-slate-700"
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                <span className="text-base">{getCountryFlag(c.code)}</span>
                                <span className="truncate">{c.name}</span>
                              </span>
                              <span className="font-mono text-slate-500 font-semibold ml-2 shrink-0">{c.dial}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  {rawProfilePhoneDigits.length > 0 ? (
                    isProfilePhoneValid ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="size-3" /> Numéro valide pour {profileCountry.name}
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1 font-semibold">
                        <AlertCircle className="size-3" /> {currentProfilePhoneRule ? `Format : ${currentProfilePhoneRule.formatExample}` : "Numéro incomplet"}
                      </span>
                    )
                  ) : (
                    <span className="text-slate-500">Nécessaire pour vous inviter au groupe WhatsApp d'entraide</span>
                  )}
                </div>
              </div>

              {/* 3 & 4. Pays et Ville */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Pays de résidence */}
                <div className="space-y-1" ref={forcedResidenceCountryRef}>
                  <label className="text-xs font-bold text-slate-700">3. Pays de résidence *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsForcedResidenceCountryOpen(!isForcedResidenceCountryOpen)}
                      className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 hover:bg-slate-50 transition-all cursor-pointer text-left shadow-2xs"
                    >
                      <span className="flex items-center gap-2 truncate">
                        {selectedResidenceCountryObj ? (
                          <>
                            <span className="text-base leading-none">{getCountryFlag(selectedResidenceCountryObj.code)}</span>
                            <span className="font-semibold text-slate-800">{selectedResidenceCountryObj.name}</span>
                          </>
                        ) : country ? (
                          <span className="font-semibold text-slate-800">{country}</span>
                        ) : (
                          <span className="text-slate-400">Choisir un pays...</span>
                        )}
                      </span>
                      <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isForcedResidenceCountryOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isForcedResidenceCountryOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full max-h-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[120] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                          <div className="relative">
                            <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              value={forcedResidenceCountrySearch}
                              onChange={(e) => setForcedResidenceCountrySearch(e.target.value)}
                              placeholder="Rechercher un pays..."
                              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto divide-y divide-slate-100 text-left">
                          {filteredForcedResidenceCountries.map((c) => {
                            const isSelected = country.toLowerCase() === c.name.toLowerCase() || country.toLowerCase() === c.code.toLowerCase()
                            return (
                              <button
                                key={`frc-${c.code}`}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setCountry(c.name)
                                  setIsForcedResidenceCountryOpen(false)
                                  setForcedResidenceCountrySearch("")
                                }}
                                className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                                  isSelected ? "bg-primary/10 text-primary font-bold" : "text-slate-700"
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <span className="text-base">{getCountryFlag(c.code)}</span>
                                  <span className="truncate">{c.name}</span>
                                </span>
                                {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ville */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">4. Ville de résidence *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ouagadougou, Abidjan..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* 5. Secteur / Profession (Ouvre vers le haut pour ne jamais chevaucher le bouton de validation) */}
              <div className="space-y-1" ref={forcedSectorRef}>
                <label className="text-xs font-bold text-slate-700">5. Secteur d'activité / Profession *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsForcedSectorOpen(!isForcedSectorOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 hover:bg-slate-50 transition-all cursor-pointer text-left shadow-2xs"
                  >
                    <span className="truncate font-semibold text-slate-800">
                      {sector || <span className="text-slate-400 font-normal">Sélectionnez votre domaine d'activité...</span>}
                    </span>
                    <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isForcedSectorOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isForcedSectorOpen && (
                    <div className="absolute bottom-full left-0 mb-1.5 w-full max-h-60 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[120] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                        <div className="relative">
                          <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={forcedSectorSearch}
                            onChange={(e) => setForcedSectorSearch(e.target.value)}
                            placeholder="Rechercher un métier ou domaine..."
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto divide-y divide-slate-100 text-left">
                        {filteredForcedSectorsByCategory.map((group) => (
                          <div key={`fsc-${group.category}`} className="py-1">
                            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary bg-slate-100 sticky top-0">
                              {group.category}
                            </div>
                            <div className="divide-y divide-slate-100">
                              {group.options.map((opt) => {
                                const isSelected = sector === opt
                                return (
                                  <button
                                    key={`fso-${opt}`}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setSector(opt)
                                      setIsForcedSectorOpen(false)
                                      setForcedSectorSearch("")
                                    }}
                                    className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                                      isSelected ? "bg-primary/10 text-primary font-bold" : "text-slate-700"
                                    }`}
                                  >
                                    <span className="truncate">{opt}</span>
                                    {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={savingProfile || profileCompletionStats.completedCount < profileCompletionStats.total}
                  className="w-full py-3.5 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-slate-950 font-bold text-xs shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Enregistrement du profil...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      <span>Valider et Débloquer mon Espace Membre 🚀</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    <span>Données protégées &amp; conformes RGPD</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="size-3" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

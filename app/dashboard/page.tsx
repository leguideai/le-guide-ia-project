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
  AlertCircle
} from "lucide-react"
import { BootcampCalendar, CalendarEvent } from "@/components/bootcamp-calendar"

type TabType = "overview" | "calendar" | "courses" | "resources" | "certificates" | "invoices" | "profile"

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
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
  const [pendingCourses, setPendingCourses] = useState<any[]>([])
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
            setLoading(false)
            router.push("/admin")
            return
          }
        }
      }

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
        title: (p.registrations?.courses as any)?.title ? `${(p.registrations?.courses as any)?.title} — Inscription Officielle` : "Inscription Officielle",
        method: p.method || "Paiement Mobile Money / Wave (PayTech)",
        amount: p.amount ? `${Number(p.amount).toLocaleString('fr-FR')} FCFA` : "0 FCFA",
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

      // 9. Fetch unified confirmed & pending enrollments from API (bypasses RLS)
      try {
        const enrollRes = await fetch(`/api/user/enrollments?email=${encodeURIComponent(userEmailClean)}`)
        const enrollData = await enrollRes.json()

        if (enrollData && enrollData.success) {
          if (enrollData.isAdmin) {
            setIsAdmin(true)
            setUserEnrollments((cData || []).flatMap((c: any) => [c.id, c.slug, c.title]))
            setPendingCourses([])
          } else {
            setUserEnrollments(enrollData.confirmed || [])
            const pendings = (enrollData.pending || []).map((slug: string) => ({
              course_slug: slug,
              created_at: new Date().toISOString(),
              status: "pending_verification"
            }))
            setPendingCourses(pendings)
          }
        } else {
          // Fallback if API fails
          const isAdminUser = profData?.role === "admin" || profData?.role === "super_admin"
          setIsAdmin(isAdminUser)
          if (isAdminUser) {
            setUserEnrollments((cData || []).flatMap((c: any) => [c.id, c.slug]))
          } else {
            const fromPayments = userPayments.flatMap((p: any) => [
              p.registrations?.course_id,
              p.registrations?.course_slug,
              p.registrations?.courses?.id,
              p.registrations?.courses?.slug
            ])
            const fromRegs = (regData || []).flatMap((r: any) => [r.course_id, r.course_slug])
            const fromUserCourses = (ucData || []).map((uc: any) => uc.course_slug)
            setUserEnrollments(Array.from(new Set([...fromPayments, ...fromRegs, ...fromUserCourses])).filter(Boolean) as string[])
          }
        }
      } catch (apiErr) {
        console.warn("Could not sync with /api/user/enrollments:", apiErr)
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

    if (rawProfilePhoneDigits.length > 0 && !isProfilePhoneValid) {
      const expectedText = currentProfilePhoneRule 
        ? currentProfilePhoneRule.formatExample 
        : "entre 6 et 14 chiffres"
      setProfileError(`Numéro WhatsApp invalide pour ${profileCountry.name} (${profileCountry.dial}). Format attendu : ${expectedText}.`)
      return
    }

    setSavingProfile(true)
    setSaveSuccess(false)

    const fullWhatsApp = rawProfilePhoneDigits.length > 0 
      ? `${profileCountry.dial}${rawProfilePhoneDigits}` 
      : ""

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
          startTime: s.start_time || "19:00",
          endTime: s.end_time || "21:00",
          instructor: targetCourse?.instructor || "Alfred Dah",
          meetUrl: s.meet_url || targetCourse?.live_meet_url || "https://meet.google.com",
          recordingUrl: s.recording_url,
          whatsappUrl: targetCourse?.whatsapp_url || "https://wa.me/22605050577",
          status: s.status || "upcoming"
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
          meetUrl: c.live_meet_url || "https://meet.google.com",
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
    { id: "courses", label: "Mes Formations", icon: BookOpen },
    { id: "resources", label: "Mes Ressources", icon: DownloadCloudIcon },
    // { id: "certificates", label: "Mes Certificats", icon: Award },
    // { id: "invoices", label: "Mes Factures", icon: FileText },
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
    tier: r.tier || ""
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
        const isLive = s.status === "live"
        const isUpcoming = s.status === "upcoming" || (!hasRecording && !isLive)

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
          meetUrl: s.meet_url || c.live_meet_url,
          homeworkTitle: s.homework_title,
          homeworkDesc: s.homework_description,
          homeworkFileUrl: s.homework_file_url,
          status: s.status || "upcoming",
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
    const bSlugNorm = (b.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const bTitleNorm = (b.title || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const bId = String(b.dbId || b.id || "")

    return pendingCourses.some((pc: any) => {
      const pSlug = String(pc.course_slug || "").toLowerCase()
      const pSlugNorm = pSlug.replace(/[^a-z0-9]/g, "")
      if (!pSlug) return false
      if (bId && (pSlug === bId || pSlugNorm === bId)) return true
      if (b.slug && (pSlug === b.slug || pSlugNorm === bSlugNorm)) return true
      if (bSlugNorm && pSlugNorm && (bSlugNorm.includes(pSlugNorm) || pSlugNorm.includes(bSlugNorm))) return true
      if (bTitleNorm && pSlugNorm && (bTitleNorm.includes(pSlugNorm) || pSlugNorm.includes(bTitleNorm))) return true
      return false
    })
  }

  const enrolledBootcamps = displayedBootcamps.filter((b: any) => canAccess(b))
  const pendingBootcamps = displayedBootcamps.filter((b: any) => isPendingCourse(b))
  const lockedBootcamps = displayedBootcamps.filter((b: any) => !canAccess(b) && !isPendingCourse(b))

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <Sparkles className="size-5 text-primary animate-spin" />
          <span>Chargement de votre Espace Membre...</span>
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
      <aside className="hidden md:flex w-64 border-r border-slate-200/90 bg-white p-4 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto shadow-xs">
        <div className="space-y-5">
          
          {/* Brand Logo inside Dashboard Sidebar */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1 hover:opacity-90 transition-opacity">
            <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover" />
            <span className="font-heading text-base font-black tracking-tight text-slate-800">
              LE GUIDE <span className="text-primary">IA</span>
            </span>
          </Link>

          {/* User Profile Summary Card */}
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
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
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
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-2">
          {(profile?.role === "admin" || profile?.role === "super_admin") && (
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
          )}
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ExternalLink className="size-3.5" />
            <span>Voir le site public</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Déconnexion</span>
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
                    <h1 className="font-heading text-2xl font-bold text-slate-800">Mes Formations &amp; Bootcamps Inscrits</h1>
                    <p className="text-xs text-slate-500 mt-1">Sélectionnez une formation pour accéder au lien, supports PDF et exercices pratiques.</p>
                  </div>
                </div>

                {/* ─── Formations accessibles ─── */}
                {enrolledBootcamps.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-base font-bold text-slate-800">Mes formations actives</h2>
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
                              onClick={() => { setSelectedBootcamp(bootcamp); setSelectedLesson(bootcamp.lessons[0]) }}
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
                              ⏳ Votre virement Mobile Money est en cours de vérification. Vos vidéos et ressources seront débloquées sous moins de 24h ouvrées.
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
                      <h2 className="font-heading text-base font-bold text-slate-800">Autres formations disponibles</h2>
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
                    <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
                      {selectedBootcamp.status === "upcoming" || selectedLesson.isUpcoming ? (
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
                              {selectedLesson.title}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              Cette session aura lieu en direct sur Google Meet ({
                                selectedLesson.scheduledAt
                                  ? new Date(selectedLesson.scheduledAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " à " + new Date(selectedLesson.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                                  : selectedLesson.scheduledDate || selectedBootcamp.dates
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

                          <a
                            href={selectedLesson.meetUrl || DEFAULT_MEET_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold px-5 py-2.5 text-xs shadow-xs transition-all mt-2 cursor-pointer"
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

                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 uppercase">
                              Module {selectedLesson.num}
                            </span>
                            {selectedLesson.scheduledDate && (
                              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Calendar className="size-3" />
                                <span>{selectedLesson.scheduledDate}</span>
                              </span>
                            )}
                          </div>
                          <h2 className="font-heading text-lg font-bold text-slate-800">
                            {selectedLesson.title}
                          </h2>
                        </div>

                        <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border ${
                          selectedLesson.isLive
                            ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                            : selectedLesson.isUpcoming
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}>
                          {selectedLesson.isLive ? "🟢 En Direct Maintenant" : selectedLesson.isUpcoming ? "🕒 Session à venir" : "🎬 Replay Disponible"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedLesson.description}
                      </p>

                      {/* PDF Attachment (Available ONLY for past/completed sessions) */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        {selectedLesson.pdfName ? (
                          selectedLesson.isUpcoming || selectedBootcamp.status === "upcoming" ? (
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                              <FileText className="size-4 text-slate-400" />
                              <span>Support PDF du cours : <strong className="text-amber-700 font-semibold">🔒 Disponible immédiatement après la session live</strong></span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                <FileText className="size-4 text-purple-600" />
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
                          <span className="text-xs text-slate-500">Aucun support PDF attaché pour ce module.</span>
                        )}
                      </div>

                      {/* Exercise & Homework Submission Section */}
                      {selectedLesson.exercise && (
                        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 space-y-3 mt-3 text-left">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300/80">
                                {selectedLesson.exercise.type === 'devoir-a-rendre' ? '📝 Devoir à rendre' : selectedLesson.exercise.type === 'cas-pratique' ? '💼 Cas Pratique Métier' : '⚡ Challenge Prompt'}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800">{selectedLesson.exercise.title}</h4>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
                              <Clock className="size-3.5" />
                              <span>Date limite : {selectedLesson.exercise.deadline}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border shrink-0 ${
                              submittedExerciseIds.includes(selectedLesson.exercise.title) || selectedLesson.exercise.status === 'submitted'
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}>
                              {submittedExerciseIds.includes(selectedLesson.exercise.title) || selectedLesson.exercise.status === 'submitted' ? "✓ Travail Soumis sur la plateforme" : "⏳ En attente de rendu"}
                            </span>

                            <button
                              onClick={() => setSubmittingExercise({
                                id: selectedLesson.exercise!.title,
                                title: selectedLesson.exercise!.title,
                                deadline: selectedLesson.exercise!.deadline
                              })}
                              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs shadow-2xs transition-all cursor-pointer"
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
                      <h3 className="font-heading text-sm font-bold text-slate-800">Sommaire de la formation</h3>
                      <span className="text-xs font-semibold text-slate-500">{selectedBootcamp.lessons.length} sessions</span>
                    </div>

                    <div className="space-y-2 max-h-[640px] lg:max-h-[680px] overflow-y-auto scrollbar-thin pr-1.5 pb-6">
                      {selectedBootcamp.lessons.map((lesson) => {
                        const isSelected = selectedLesson.id === lesson.id

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
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESOURCES (1-Click Copy, Downloads & Bonus Media) */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="font-heading text-2xl font-bold text-slate-800">Bibliothèque de Ressources Apprenants</h1>
                <p className="text-xs text-slate-500 mt-1">Accédez à tous vos prompts, business plans, exercices pratiques et vidéos bonus classés par Bootcamp.</p>
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

            {/* Filter Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
              {/* Filter 1: Bootcamp Selection */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Rattachement par Bootcamp :</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedBootcampFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedBootcampFilter === "all" ? "bg-primary text-white shadow-xs" : "bg-[#F4F6F8] border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    Tous mes Bootcamps
                  </button>
                  {ENROLLED_BOOTCAMPS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBootcampFilter(b.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedBootcampFilter === b.id ? "bg-primary text-white shadow-xs" : "bg-[#F4F6F8] border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {b.title.split("—")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: Type Selection */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Type de ressource :</span>
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
                        selectedResourceTypeFilter === t.id ? "bg-primary text-white shadow-xs" : "bg-[#F4F6F8] border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
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
              <div className="text-center py-12 border border-dashed border-slate-300 rounded-3xl p-6 bg-white">
                <p className="text-xs text-slate-500">Aucune ressource ne correspond à vos filtres actuels.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredResources.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between space-y-4 hover:border-primary/40 hover:shadow-md transition-all shadow-xs text-left">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                          item.type === 'prompt'
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : item.type === 'business-plan'
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : item.type === 'exercise'
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          {item.type === 'prompt' ? "Prompt Métier" : item.type === 'business-plan' ? "Business Plan" : item.type === 'exercise' ? "Exercice & Fichier" : "Vidéo Bonus"}
                        </span>

                        {item.bootcampName && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                            {item.bootcampName}
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading text-base font-bold text-slate-800">{item.title.fr}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc.fr}</p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {item.type === 'bonus-video' ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xs">
                          <iframe
                            src={`${item.videoUrl}?autoplay=0`}
                            title={item.title.fr}
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl bg-[#F4F6F8] border border-slate-200/90 p-3 max-h-36 overflow-y-auto text-[11px] font-mono text-slate-700 whitespace-pre-wrap scrollbar-thin select-all">
                          {item.content.fr}
                        </div>
                      )}

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
                  Attestation de compétences délivrée par Alfred Dah (Auditeur CISA &amp; Expert IA). Valide pour LinkedIn et valorisation professionnelle.
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
                                    onClick={() => {
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
                  <span className="font-bold text-slate-800">Alfred Dah (CISA)</span>
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
    </div>
  )
}

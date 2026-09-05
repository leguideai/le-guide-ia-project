"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { FileUploadField } from "@/components/ui/file-upload-field"
import { formatVideoEmbedUrl, HeroVslVideo } from "@/components/vsl-hero-video"
import { FormationItem, FormationCategory } from "@/lib/formations-data"
import { 
  ShieldAlert, ShieldCheck, Users, DollarSign, BookOpen, FileCheck, 
  Building2, Download, CheckCircle2, XCircle, Clock, Search, RefreshCw, 
  ExternalLink, Award, Mail, ArrowRight, UserPlus, UserCheck, Filter, Plus,
  Edit3, Trash2, Video, Calendar, Sparkles, Layers, FileText, Lock,
  ArrowUp, ArrowDown, Eye, MessageCircle, LogOut, Shuffle, Play, Menu, X,
  Bot, Film, ShoppingBag, Zap, CalendarCheck, Quote, MessageSquare, Star,
  Image as ImageIcon, Bold, Italic, Underline, List, ListOrdered, Heading2, Heading3,
  Link2, Minus, MousePointerClick, AlertCircle, Code, AlignLeft, Send, Radio,
  ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen, Crown, Check, Save, Copy, Loader2,
  Briefcase, Globe
} from "lucide-react"
import { getCountryFlag, getCountryName } from "@/lib/countries"
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
  course_id?: string
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
  receipt_url?: string
  notes?: string
  course_id?: string
  course_title?: string
  payment_method?: string
  created_at: string
  registrations?: {
    id?: string
    full_name?: string
    email?: string
    whatsapp?: string
    country?: string
    source?: string
    course_id?: string
    course_slug?: string
    notes?: string
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
  service_type?: string
  employees?: string
  company_size?: string
  needs?: string
  message?: string
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
  const [activeTab, setActiveTab] = useState<"kpi" | "courses" | "formations" | "resources" | "lives" | "masterclasses" | "masterclasses_past" | "masterclass_participants" | "masterclass_replays" | "subscriptions" | "newsletter" | "testimonials" | "payments" | "users" | "submissions" | "b2b" | "export" | "settings">("kpi")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>("super_admin")
  const isSuperAdmin = userRole === "super_admin"
  const isFounderSamba = currentUser?.email?.toLowerCase().trim() === "samba@leguideai.com"
  const [unauthorized, setUnauthorized] = useState(false)

  // Subscription management states
  const [adminSubscriptions, setAdminSubscriptions] = useState<any[]>([])
  const [adminSubscriptionStats, setAdminSubscriptionStats] = useState<any>({
    totalActive: 0,
    totalPending: 0,
    totalExpired: 0,
    totalRevenue: 0,
    totalRevenueFormatted: "0 FCFA"
  })
  const [subscriptionPricing, setSubscriptionPricing] = useState<any>({
    price3m: 9000,
    price1y: 29000,
    price3mDisplay: "9 000 FCFA",
    price1yDisplay: "29 000 FCFA"
  })
  const [subStatusFilter, setSubStatusFilter] = useState<"all" | "active" | "pending" | "expired">("all")
  const [subSearchQuery, setSubSearchQuery] = useState("")
  const [showManualSubModal, setShowManualSubModal] = useState(false)
  const [manualSubForm, setManualSubForm] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    country: "Côte d'Ivoire",
    plan: "3_months" as "3_months" | "1_year",
    customDays: ""
  })
  const [savingManualSub, setSavingManualSub] = useState(false)
  const [showPriceEditModal, setShowPriceEditModal] = useState(false)
  const [priceEditForm, setPriceEditForm] = useState({
    price3m: "10000",
    price1y: "30000"
  })
  const [savingPriceEdit, setSavingPriceEdit] = useState(false)
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null)

  // Masterclass states
  const [masterclassSession, setMasterclassSession] = useState<any>({})
  const [masterclassSessions, setMasterclassSessions] = useState<any[]>([])
  const [upcomingMasterclasses, setUpcomingMasterclasses] = useState<any[]>([])
  const [pastMasterclasses, setPastMasterclasses] = useState<any[]>([])
  const [showMasterclassModal, setShowMasterclassModal] = useState(false)
  const [editingMasterclass, setEditingMasterclass] = useState<any | null>(null)
  const [masterclassForm, setMasterclassForm] = useState<any>({
    id: "",
    title: "",
    description: "",
    instructor: "Alfred Dah",
    scheduledAt: "",
    dateDisplay: "",
    thumbnailUrl: "",
    whatsappGroupUrl: "",
    youtubeLiveUrl: "https://meet.google.com",
    duration: "1h 30min",
    status: "upcoming",
    is_active: true
  })
  const [masterclassReplays, setMasterclassReplays] = useState<any[]>([])
  const [masterclassParticipants, setMasterclassParticipants] = useState<any[]>([])
  const [showReplayModal, setShowReplayModal] = useState(false)
  const [editingReplay, setEditingReplay] = useState<any | null>(null)
  const [replayForm, setReplayForm] = useState<any>({
    title: "",
    description: "",
    youtubeUrl: "",
    duration: "1h 30min",
    category: "Prompting",
    instructor: "Alfred Dah",
    date: "",
    is_published: true
  })
  const [masterclassSearch, setMasterclassSearch] = useState("")
  const [savingMasterclassSession, setSavingMasterclassSession] = useState(false)
  const [savingReplay, setSavingReplay] = useState(false)
  const [notifyAllUsersOnSave, setNotifyAllUsersOnSave] = useState(false)
  const [sendingPlatformInvite, setSendingPlatformInvite] = useState(false)
  const [platformInviteStatus, setPlatformInviteStatus] = useState<string | null>(null)
  const [selectedMasterclassFilter, setSelectedMasterclassFilter] = useState<string>("all")
  const [showTargetedEmailModal, setShowTargetedEmailModal] = useState(false)
  const [targetedEmailTarget, setTargetedEmailTarget] = useState<string>("current_live")
  const [targetedEmailType, setTargetedEmailType] = useState<"reminder" | "replay" | "custom">("reminder")
  const [targetedEmailSubject, setTargetedEmailSubject] = useState<string>("")
  const [targetedEmailCustomMessage, setTargetedEmailCustomMessage] = useState<string>("")
  const [targetedEmailTestAddress, setTargetedEmailTestAddress] = useState<string>("")
  const [sendingTargetedEmail, setSendingTargetedEmail] = useState(false)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  const [isManualAddParticipantOpen, setIsManualAddParticipantOpen] = useState(false)
  const [manualParticipantForm, setManualParticipantForm] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    country: "CI",
    masterclassId: "current_live",
    masterclassTitle: ""
  })
  const [addingManualParticipant, setAddingManualParticipant] = useState(false)
  const [refreshingMasterclass, setRefreshingMasterclass] = useState(false)

  // Enrollment states for Samba
  const [showEnrollUsersModal, setShowEnrollUsersModal] = useState(false)
  const [enrollTargetSessionId, setEnrollTargetSessionId] = useState<string>("current_live")
  const [selectedUserIdsToEnroll, setSelectedUserIdsToEnroll] = useState<string[]>([])
  const [enrollSearchQuery, setEnrollSearchQuery] = useState("")
  const [batchEnrollSendEmail, setBatchEnrollSendEmail] = useState(true)
  const [enrollingUsers, setEnrollingUsers] = useState(false)

  // Data states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    bootcampRevenue: 0,
    subscriptionRevenue: 0,
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
  const [cohortForm, setCohortForm] = useState({
    courseId: "",
    startDate: "",
    sessionCount: 6,
    startTime: "19:00",
    durationMinutes: 120
  })
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
  const [editorViewMode, setEditorViewMode] = useState<"write" | "preview">("write")
  const newsletterBodyRef = useRef<HTMLTextAreaElement>(null)

  function insertFormatting(before: string, after: string = "", placeholder: string = "") {
    const textarea = newsletterBodyRef.current
    if (!textarea) {
      setBroadcastForm(prev => ({
        ...prev,
        bodyHtml: (prev.bodyHtml || "") + before + placeholder + after
      }))
      return
    }

    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const currentText = broadcastForm.bodyHtml || ""
    const selectedText = currentText.substring(start, end)
    const replacement = selectedText ? `${before}${selectedText}${after}` : `${before}${placeholder}${after}`

    const nextText = currentText.substring(0, start) + replacement + currentText.substring(end)
    setBroadcastForm(prev => ({ ...prev, bodyHtml: nextText }))

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + (selectedText ? selectedText.length : placeholder.length)
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 50)
  }

  const [sendingBroadcast, setSendingBroadcast] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<any>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([])
  const [b2bRequests, setB2bRequests] = useState<B2BRecord[]>([])
  const [expandedB2bNeeds, setExpandedB2bNeeds] = useState<Record<string, boolean>>({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed")
      if (saved !== null) {
        setSidebarCollapsed(saved === "true")
      }
    } catch (_) {}
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next))
      } catch (_) {}
      return next
    })
  }

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

  // Bootcamp Specific Learners Management State
  const [selectedCourseForLearners, setSelectedCourseForLearners] = useState<BootcampCourse | null>(null)
  const [showLearnersModal, setShowLearnersModal] = useState(false)
  const [learnersSearch, setLearnersSearch] = useState("")
  const [learnersStatusFilter, setLearnersStatusFilter] = useState<"all" | "confirmed" | "pending">("all")
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null)
  const [showManualEnrollModal, setShowManualEnrollModal] = useState(false)
  const [savingManualEnroll, setSavingManualEnroll] = useState(false)
  const [showLearnerEmailSuggestions, setShowLearnerEmailSuggestions] = useState(false)
  const [showLearnerNameSuggestions, setShowLearnerNameSuggestions] = useState(false)
  const [manualEnrollForm, setManualEnrollForm] = useState({
    courseSlug: "",
    fullName: "",
    email: "",
    whatsapp: "",
    paymentMethod: "Wave Mobile Money",
    transactionRef: "",
    amount: "99000",
    receiptUrl: "",
    sendEmail: true
  })

  // Compile all unique platform learners from profiles, users, registrations and payments
  const allLearnerSuggestions = useMemo(() => {
    const map = new Map<string, { email: string; fullName: string; whatsapp: string; avatar?: string }>()

    // 1. From users table (Profiles)
    users.forEach((u: any) => {
      const email = u.email?.toLowerCase().trim()
      if (!email) return
      const name = u.full_name || u.name || u.user_metadata?.full_name || ""
      const phone = u.whatsapp || u.phone || u.user_metadata?.whatsapp || ""
      const avatar = u.avatar_url || ""
      map.set(email, { email, fullName: name, whatsapp: phone, avatar })
    })

    // 2. From payments & registrations
    payments.forEach((p: any) => {
      const r = p.registrations
      const email = (r?.email || p.user_email)?.toLowerCase().trim()
      if (!email) return
      const existing = map.get(email)
      const name = r?.full_name || existing?.fullName || ""
      const phone = r?.whatsapp || p.phone || existing?.whatsapp || ""
      const avatar = existing?.avatar || ""
      map.set(email, { email, fullName: name, whatsapp: phone, avatar })
    })

    return Array.from(map.values())
  }, [users, payments])

  // Filtered suggestions for Email input
  const filteredEmailSuggestions = useMemo(() => {
    const q = (manualEnrollForm.email || "").toLowerCase().trim()
    if (!q) return allLearnerSuggestions.slice(0, 5)
    return allLearnerSuggestions.filter(l =>
      l.email.toLowerCase().includes(q) ||
      l.fullName.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [allLearnerSuggestions, manualEnrollForm.email])

  // Filtered suggestions for Name input
  const filteredNameSuggestions = useMemo(() => {
    const q = (manualEnrollForm.fullName || "").toLowerCase().trim()
    if (!q) return allLearnerSuggestions.slice(0, 5)
    return allLearnerSuggestions.filter(l =>
      l.fullName.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [allLearnerSuggestions, manualEnrollForm.fullName])

  const handleSelectLearnerSuggestion = (l: { email: string; fullName: string; whatsapp: string }) => {
    setManualEnrollForm(prev => ({
      ...prev,
      email: l.email,
      fullName: l.fullName || prev.fullName,
      whatsapp: l.whatsapp || prev.whatsapp
    }))
    setShowLearnerEmailSuggestions(false)
    setShowLearnerNameSuggestions(false)
  }

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

  // Helper pour auto-calculer les dates de session (1 jour par session, 19h00 GMT par défaut, durée 1h30)
  function getDefaultSessionDates(course?: BootcampCourse | null, sessionNum: number = 1) {
    let baseDate: Date | null = null

    // 1. Priorité à course.start_date
    if (course?.start_date) {
      const raw = String(course.start_date).trim()
      const d = new Date(raw.includes("T") ? raw : `${raw}T19:00:00`)
      if (!isNaN(d.getTime())) {
        baseDate = d
      }
    }

    // 2. Si absent, extraire depuis course.dates
    if (!baseDate && course?.dates) {
      const text = String(course.dates).trim()
      const slashMatch = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/)
      if (slashMatch) {
        const day = parseInt(slashMatch[1], 10)
        const month = parseInt(slashMatch[2], 10) - 1
        const year = parseInt(slashMatch[3], 10)
        const d = new Date(year, month, day, 19, 0, 0)
        if (!isNaN(d.getTime())) baseDate = d
      } else {
        const yearMatch = text.match(/\b(202\d)\b/)
        const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear()
        const frenchMonths: { [k: string]: number } = {
          "janv": 0, "janvier": 0,
          "févr": 1, "fevr": 1, "février": 1, "fevrier": 1,
          "mars": 2,
          "avr": 3, "avril": 3,
          "mai": 4,
          "juin": 5,
          "juil": 6, "juillet": 6,
          "août": 7, "aout": 7,
          "sept": 8, "septembre": 8,
          "oct": 9, "octobre": 9,
          "nov": 10, "novembre": 10,
          "déc": 11, "dec": 11, "décembre": 11, "decembre": 11
        }
        const lower = text.toLowerCase()
        let detectedMonth = -1
        for (const [name, mIndex] of Object.entries(frenchMonths)) {
          if (lower.includes(name)) {
            detectedMonth = mIndex
            break
          }
        }
        const dayMatch = text.match(/\b(\d{1,2})\b/)
        if (dayMatch && detectedMonth >= 0) {
          const day = parseInt(dayMatch[1], 10)
          const d = new Date(year, detectedMonth, day, 19, 0, 0)
          if (!isNaN(d.getTime())) baseDate = d
        }
      }
    }

    // 3. Repli : aujourd'hui à 19h00
    if (!baseDate || isNaN(baseDate.getTime())) {
      baseDate = new Date()
      baseDate.setHours(19, 0, 0, 0)
    }

    // Calcul date de la session N : Date de début + (N - 1) jours
    const targetDate = new Date(baseDate)
    targetDate.setDate(targetDate.getDate() + Math.max(0, sessionNum - 1))
    targetDate.setHours(19, 0, 0, 0) // Heure par défaut : 19h00 GMT

    // Durée par défaut : 2h (120 minutes) -> Fin à 21h00 GMT
    const targetEndDate = new Date(targetDate.getTime() + 2 * 60 * 60 * 1000)

    const pad = (n: number) => String(n).padStart(2, "0")
    const formatIsoLocal = (d: Date) => {
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    return {
      scheduled_at: formatIsoLocal(targetDate),
      ends_at: formatIsoLocal(targetEndDate)
    }
  }

  // Calcul dynamique et automatique du statut de la session selon l'heure actuelle
  function getDynamicSessionStatus(session: {
    scheduled_at?: string | null
    ends_at?: string | null
    status?: string | null
    recording_url?: string | null
  }): "upcoming" | "live" | "completed" {
    // Si un replay est déjà enregistré, la session est terminée
    if (session.recording_url && session.recording_url.trim().length > 5) {
      return "completed"
    }

    if (!session.scheduled_at) {
      return (session.status as any) || "upcoming"
    }

    const now = Date.now()
    const startTime = new Date(session.scheduled_at).getTime()
    if (isNaN(startTime)) {
      return (session.status as any) || "upcoming"
    }

    let endTime = session.ends_at ? new Date(session.ends_at).getTime() : NaN
    if (isNaN(endTime)) {
      // Durée par défaut : 120 minutes (2h)
      endTime = startTime + 2 * 60 * 60 * 1000
    }

    if (now < startTime) {
      return "upcoming"
    } else if (now >= startTime && now <= endTime) {
      return "live"
    } else {
      // Date passée -> Terminée automatiquement
      return "completed"
    }
  }

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

      const sessionsFound = (sessData && sessData.length > 0)
        ? sessData
        : allSessions.filter(s => s.course_id === c.id || s.course_id === c.slug || s.course_slug === c.slug)

      setDetailsSessions(sessionsFound || [])

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

    const fetched = (sessData && sessData.length > 0)
      ? sessData
      : allSessions.filter(s => s.course_id === c.id || s.course_id === c.slug || s.course_slug === c.slug)

    setBootcampSessions(fetched)

    const nextNum = fetched.length > 0
      ? Math.max(...fetched.map(s => Number(s.session_number) || 0), 0) + 1
      : 1
    
    const defDates = getDefaultSessionDates(c, nextNum)

    setSessionForm({
      session_number: nextNum,
      title: `Session ${nextNum} — `,
      description: "",
      scheduled_at: defDates.scheduled_at,
      ends_at: defDates.ends_at,
      meet_url: "",
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

  // Manual Enroll Form (Dashboard Tab 1)
  const [enrollEmail, setEnrollEmail] = useState("")
  const [enrollFullName, setEnrollFullName] = useState("")
  const [enrollWhatsapp, setEnrollWhatsapp] = useState("")
  const [enrollCourse, setEnrollCourse] = useState("")
  const [enrollPaymentMethod, setEnrollPaymentMethod] = useState("")
  const [enrollTransactionRef, setEnrollTransactionRef] = useState("")
  const [enrollReceiptUrl, setEnrollReceiptUrl] = useState("")
  const [enrollSendEmail, setEnrollSendEmail] = useState(true)
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)
  const [showEnrollNameSuggestions, setShowEnrollNameSuggestions] = useState(false)

  // Auto-default enrollCourse to currently open/active bootcamp
  useEffect(() => {
    if (courses.length > 0 && !enrollCourse) {
      const activeCourse = courses.find(c => c.status === "published" || (c as any).status === "open" || (c as any).is_active) || courses[0]
      if (activeCourse?.slug) {
        setEnrollCourse(activeCourse.slug)
      }
    }
  }, [courses, enrollCourse])

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
    hero_programme_url: "",
    masterclass_title: "",
    masterclass_description: "",
    masterclass_date: "",
    masterclass_whatsapp_group_url: "",
    masterclass_youtube_url: ""
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

  useEffect(() => {
    if (activeTab === "masterclasses" || activeTab === "masterclasses_past" || activeTab === "masterclass_participants" || activeTab === "masterclass_replays") {
      refreshMasterclassData()
    }
  }, [activeTab])

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
        } else if (profile.role === "admin") {
          setActiveTab(prev => (prev === "kpi" || prev === "users" || prev === "settings" || prev === "export" ? "courses" : prev))
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
      if (dataCourses.courses) {
        setCourses(dataCourses.courses)
        const activeCourse = dataCourses.courses.find((c: any) => c.status === "open" || c.status === "published" || c.is_active) || dataCourses.courses[0]
        if (activeCourse?.slug) {
          setEnrollCourse(prev => prev || activeCourse.slug)
        }
      }

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
      const userEmailQuery = currentUser?.email ? `?requesterEmail=${encodeURIComponent(currentUser.email)}` : ""
      const resUsers = await fetch(`/api/admin/users${userEmailQuery}`)
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

      // 12. Masterclasses
      try {
        const resMaster = await fetch("/api/admin/masterclasses")
        const dataMaster = await resMaster.json()
        if (dataMaster.success) {
          if (dataMaster.upcomingSession) setMasterclassSession(dataMaster.upcomingSession)
          if (dataMaster.sessions) setMasterclassSessions(dataMaster.sessions)
          if (dataMaster.upcomingSessions) setUpcomingMasterclasses(dataMaster.upcomingSessions)
          if (dataMaster.pastSessions) setPastMasterclasses(dataMaster.pastSessions)
          if (dataMaster.replays) setMasterclassReplays(dataMaster.replays)
          if (dataMaster.participants) setMasterclassParticipants(dataMaster.participants)
        }
      } catch (mErr) {
        console.warn("Masterclasses fetch warning:", mErr)
      }

      // 13. Subscriptions VIP (Replays & Prompts)
      try {
        const resSub = await fetch("/api/admin/subscriptions")
        const dataSub = await resSub.json()
        if (dataSub.success) {
          if (dataSub.subscriptions) setAdminSubscriptions(dataSub.subscriptions)
          if (dataSub.stats) setAdminSubscriptionStats(dataSub.stats)
          if (dataSub.pricing) {
            setSubscriptionPricing(dataSub.pricing)
            setPriceEditForm({
              price3m: String(dataSub.pricing.price3m || 10000),
              price1y: String(dataSub.pricing.price1y || 30000)
            })
          }
        }
      } catch (sErr) {
        console.warn("Subscriptions fetch warning:", sErr)
      }
    } catch (err) {
      console.error("Fetch admin data error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Masterclass Handlers
  async function handleSaveMasterclassSession(e: React.FormEvent) {
    e.preventDefault()
    setSavingMasterclassSession(true)
    setPlatformInviteStatus(null)
    try {
      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_session",
          sessionData: masterclassSession
        })
      })
      const data = await res.json()
      if (data.success) {
        if (notifyAllUsersOnSave) {
          // Lancer l'invitation de tous les membres de la plateforme
          handleSendPlatformInvite(false, true)
        } else {
          alert("La Masterclass a été enregistrée avec succès !")
        }
      } else {
        alert(data.error || "Erreur lors de l'enregistrement.")
      }
    } catch (err: any) {
      alert("Erreur : " + err.message)
    } finally {
      setSavingMasterclassSession(false)
    }
  }

  async function handleSendPlatformInvite(isTest = false, fromSave = false) {
    if (!isTest && !fromSave && !confirm("Confirmez-vous l'envoi d'un email d'invitation à TOUS les utilisateurs et membres de la plateforme ?")) {
      return
    }

    setSendingPlatformInvite(true)
    setPlatformInviteStatus(null)

    try {
      const res = await fetch("/api/admin/masterclasses/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "all_platform_users",
          testEmail: isTest ? (currentUser?.email || "alfred@leguideai.com") : undefined
        })
      })

      const data = await res.json()
      if (data.success) {
        setPlatformInviteStatus(`✅ ${data.message}`)
        alert(data.message)
      } else {
        setPlatformInviteStatus(`❌ ${data.error || "Erreur lors de l'envoi des invitations."}`)
        alert(data.error || "Erreur lors de l'envoi.")
      }
    } catch (err: any) {
      setPlatformInviteStatus("❌ Erreur : " + err.message)
      alert("Erreur : " + err.message)
    } finally {
      setSendingPlatformInvite(false)
    }
  }

  function handleOpenAddReplay() {
    setEditingReplay(null)
    setReplayForm({
      title: "",
      description: "",
      youtubeUrl: "",
      duration: "1h 30min",
      category: "Prompting",
      instructor: "Alfred Dah",
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      is_published: true
    })
    setShowReplayModal(true)
  }

  function handleOpenEditReplay(r: any) {
    setEditingReplay(r)
    setReplayForm({
      id: r.id,
      title: r.title || "",
      description: r.description || "",
      youtubeUrl: r.youtubeUrl || (r.youtubeId ? `https://www.youtube.com/watch?v=${r.youtubeId}` : ""),
      duration: r.duration || "1h 30min",
      category: r.category || "Prompting",
      instructor: r.instructor || "Alfred Dah",
      date: r.date || "",
      is_published: r.is_published !== false
    })
    setShowReplayModal(true)
  }

  async function handleSaveReplay(e: React.FormEvent) {
    e.preventDefault()
    if (!replayForm.title || !replayForm.youtubeUrl) {
      alert("Veuillez renseigner le titre et l'URL YouTube.")
      return
    }
    setSavingReplay(true)
    try {
      const action = editingReplay ? "update_replay" : "add_replay"
      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          replayData: editingReplay ? { ...replayForm, id: editingReplay.id } : replayForm
        })
      })
      const data = await res.json()
      if (data.success) {
        if (data.replays) setMasterclassReplays(data.replays)
        setShowReplayModal(false)
      } else {
        alert(data.error || "Erreur lors de l'enregistrement du replay.")
      }
    } catch (err: any) {
      alert("Erreur : " + err.message)
    } finally {
      setSavingReplay(false)
    }
  }

  async function handleDeleteReplay(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce replay ?")) return
    try {
      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_replay", replayId: id })
      })
      const data = await res.json()
      if (data.success) {
        if (data.replays) setMasterclassReplays(data.replays)
      }
    } catch (err: any) {
      alert("Erreur suppression replay: " + err.message)
    }
  }

  async function handleToggleReplayPublish(r: any) {
    try {
      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_replay",
          replayData: { ...r, is_published: !r.is_published }
        })
      })
      const data = await res.json()
      if (data.success && data.replays) {
        setMasterclassReplays(data.replays)
      }
    } catch (err: any) {
      alert("Erreur visibilité replay: " + err.message)
    }
  }

  function handleExportMasterclassParticipants() {
    const listToExport = filteredMasterclassParticipants
    if (listToExport.length === 0) {
      alert("Aucun participant inscrit à exporter pour cette sélection.")
      return
    }
    const headers = ["Nom Complet", "Email", "WhatsApp", "Pays", "Profession / Secteur", "Masterclass", "Date Inscription", "Statut"]
    const rows = listToExport.map(p => [
      `"${(p.full_name || "").replace(/"/g, '""')}"`,
      `"${(p.email || "").replace(/"/g, '""')}"`,
      `"${(p.whatsapp || "").replace(/"/g, '""')}"`,
      `"${(getCountryName(p.country) || p.country || "Côte d'Ivoire").replace(/"/g, '""')}"`,
      `"${(p.sector || "Non spécifié").replace(/"/g, '""')}"`,
      `"${(p.masterclass_title || masterclassSession.title || "Masterclass IA").replace(/"/g, '""')}"`,
      `"${new Date(p.created_at).toLocaleString("fr-FR")}"`,
      `"${p.status || "inscrit"}"`
    ])
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `inscrits_masterclass_${selectedMasterclassFilter}_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function refreshMasterclassData() {
    setRefreshingMasterclass(true)
    try {
      const res = await fetch("/api/admin/masterclasses")
      const data = await res.json()
      if (data.success) {
        if (data.upcomingSession) setMasterclassSession(data.upcomingSession)
        if (data.sessions) setMasterclassSessions(data.sessions)
        if (data.upcomingSessions) setUpcomingMasterclasses(data.upcomingSessions)
        if (data.pastSessions) setPastMasterclasses(data.pastSessions)
        if (data.replays) setMasterclassReplays(data.replays)
        if (data.participants) setMasterclassParticipants(data.participants)
      }
    } catch (mErr) {
      console.warn("Masterclasses refresh warning:", mErr)
    } finally {
      setRefreshingMasterclass(false)
    }
  }

  function handleOpenAddMasterclass() {
    setEditingMasterclass(null)
    setMasterclassForm({})
    setShowMasterclassModal(true)
  }

  function handleOpenEditMasterclass(s: any) {
    setEditingMasterclass(s)
    setMasterclassForm({
      id: s.id,
      title: s.title || "",
      description: s.description || "",
      instructor: s.instructor || "Alfred Dah",
      scheduledAt: s.scheduledAt ? s.scheduledAt.slice(0, 16) : "",
      dateDisplay: s.dateDisplay || "",
      thumbnailUrl: s.thumbnailUrl || "",
      whatsappGroupUrl: s.whatsappGroupUrl || "",
      youtubeLiveUrl: s.youtubeLiveUrl || "https://meet.google.com",
      duration: s.duration || "1h 30min",
      status: s.status || "upcoming",
      is_active: s.is_active !== false
    })
    setShowMasterclassModal(true)
  }

  async function handleSaveMasterclassModal(e: React.FormEvent) {
    e.preventDefault()
    if (!masterclassForm.title) {
      alert("Veuillez renseigner le titre de la Masterclass.")
      return
    }
    setSavingMasterclassSession(true)
    try {
      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_session",
          sessionData: masterclassForm
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowMasterclassModal(false)
        showNotice(data.message || "Masterclass enregistrée avec succès !")
        if (data.sessions) setMasterclassSessions(data.sessions)
        if (data.upcomingSessions) setUpcomingMasterclasses(data.upcomingSessions)
        if (data.pastSessions) setPastMasterclasses(data.pastSessions)
        refreshMasterclassData()
      } else {
        alert(data.error || "Erreur lors de l'enregistrement.")
      }
    } catch (err: any) {
      alert("Erreur : " + err.message)
    } finally {
      setSavingMasterclassSession(false)
    }
  }

  async function handleDeleteMasterclassSession(sessionId: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette Masterclass programmée ?")) return
    try {
      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_session",
          sessionId
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice("Masterclass supprimée avec succès !")
        if (data.sessions) setMasterclassSessions(data.sessions)
        if (data.upcomingSessions) setUpcomingMasterclasses(data.upcomingSessions)
        if (data.pastSessions) setPastMasterclasses(data.pastSessions)
        refreshMasterclassData()
      } else {
        alert(data.error || "Erreur lors de la suppression.")
      }
    } catch (err: any) {
      alert("Erreur : " + err.message)
    }
  }

  async function handleToggleMasterclassStatus(s: any) {
    const newStatus = s.status === "past" ? "upcoming" : "past"
    try {
      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_session_status",
          id: s.id,
          status: newStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(`Statut basculé en « ${newStatus === "past" ? "Passée" : "À Venir"} »`)
        if (data.sessions) setMasterclassSessions(data.sessions)
        if (data.upcomingSessions) setUpcomingMasterclasses(data.upcomingSessions)
        if (data.pastSessions) setPastMasterclasses(data.pastSessions)
        refreshMasterclassData()
      }
    } catch (err: any) {
      alert("Erreur : " + err.message)
    }
  }

  function handleConvertPastSessionToReplay(s: any) {
    setEditingReplay(null)
    setReplayForm({
      title: s.title || "Replay Masterclass",
      description: s.description || "",
      youtubeUrl: s.youtubeLiveUrl || "https://www.youtube.com/@leguideai",
      duration: s.duration || "1h 30min",
      category: "Prompting",
      instructor: s.instructor || "Alfred Dah",
      date: s.dateDisplay || new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      is_published: true
    })
    setShowReplayModal(true)
  }

  async function handleDeleteMasterclassParticipant(participantId: string) {
    if (!confirm("Voulez-vous vraiment supprimer cette inscription à la Masterclass ?")) return
    try {
      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_participant", participantId })
      })
      const data = await res.json()
      if (data.success) {
        setMasterclassParticipants(prev => prev.filter(p => p.id !== participantId))
        showNotice("Inscription supprimée avec succès !")
      } else {
        alert("Erreur suppression: " + (data.error || ""))
      }
    } catch (e: any) {
      alert("Erreur réseau: " + e.message)
    }
  }

  async function handleManualAddMasterclassParticipant(e: React.FormEvent) {
    e.preventDefault()
    if (!manualParticipantForm.email) return
    setAddingManualParticipant(true)
    try {
      let chosenTitle = masterclassSession.title
      if (manualParticipantForm.masterclassId && manualParticipantForm.masterclassId !== "current_live") {
        const found = masterclassReplays.find(r => r.id === manualParticipantForm.masterclassId)
        if (found) chosenTitle = found.title
      }

      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "add_participant", 
          participantData: {
            ...manualParticipantForm,
            masterclassTitle: chosenTitle
          } 
        })
      })
      const data = await res.json()
      if (data.success && data.participant) {
        const parsed = {
          ...data.participant,
          masterclass_id: manualParticipantForm.masterclassId || "current_live",
          masterclass_title: chosenTitle
        }
        setMasterclassParticipants(prev => [parsed, ...prev])
        setIsManualAddParticipantOpen(false)
        setManualParticipantForm({ fullName: "", email: "", whatsapp: "", country: "CI", masterclassId: "current_live", masterclassTitle: "" })
        showNotice("Apprenant inscrit avec succès à la Masterclass !")
      } else {
        alert("Erreur: " + (data.error || ""))
      }
    } catch (err: any) {
      alert("Erreur réseau: " + err.message)
    } finally {
      setAddingManualParticipant(false)
    }
  }

  async function handleBatchEnrollUsers(targetUsersToEnroll?: any[]) {
    if (!isFounderSamba) return
    const usersToEnroll = targetUsersToEnroll || eligibleUnenrolledUsers.filter(u => selectedUserIdsToEnroll.includes(u.id))
    if (usersToEnroll.length === 0) {
      alert("Veuillez sélectionner au moins un apprenant à inscrire.")
      return
    }

    const targetSession = upcomingMasterclasses.find(s => s.id === enrollTargetSessionId) || masterclassSession
    const sessionTitle = targetSession?.title || "Masterclass IA en Direct"

    setEnrollingUsers(true)
    try {
      const res = await fetch("/api/admin/masterclasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_enroll_users",
          sessionId: enrollTargetSessionId,
          sessionTitle: sessionTitle,
          sendEmail: batchEnrollSendEmail,
          requesterEmail: currentUser?.email,
          users: usersToEnroll.map((u: any) => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            whatsapp: u.whatsapp,
            country: u.country,
            sector: u.sector,
            city: u.city
          }))
        })
      })

      const data = await res.json()
      if (data.success) {
        if (Array.isArray(data.participants) && data.participants.length > 0) {
          setMasterclassParticipants(prev => {
            const newEmails = new Set(data.participants.map((p: any) => p.email?.toLowerCase().trim()))
            const remaining = prev.filter(p => !newEmails.has(p.email?.toLowerCase().trim()))
            return [...data.participants, ...remaining]
          })
        }
        setSelectedUserIdsToEnroll([])
        setShowEnrollUsersModal(false)
        showNotice(data.message || `${usersToEnroll.length} apprenant(s) inscrit(s) avec succès !`)
        refreshMasterclassData()
      } else {
        alert("Erreur lors de l'inscription : " + (data.error || "Erreur inconnue"))
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message)
    } finally {
      setEnrollingUsers(false)
    }
  }

  async function handleSendTargetedMasterclassEmail(isTest = false) {
    if (isTest) {
      if (!targetedEmailTestAddress || !targetedEmailTestAddress.includes("@")) {
        alert("Veuillez saisir une adresse email valide pour le test.")
        return
      }
      setSendingTestEmail(true)
    } else {
      let targetDesc = "tous les inscrits"
      if (targetedEmailTarget === "current_live") {
        targetDesc = `les apprenants de la Masterclass Actuelle (« ${masterclassSession.title} »)`
      } else if (targetedEmailTarget === "all_platform_users") {
        targetDesc = "TOUS les utilisateurs de la plateforme (Newsletter, Apprenants & Membres)"
      } else if (targetedEmailTarget === "all_masterclasses") {
        targetDesc = "TOUS les apprenants inscrits à l'ensemble des Masterclasses"
      } else {
        const rep = masterclassReplays.find(r => r.id === targetedEmailTarget)
        targetDesc = `les apprenants du Replay « ${rep?.title || targetedEmailTarget} »`
      }

      if (!confirm(`Confirmez-vous l'envoi de cet email à ${targetDesc} ?`)) {
        return
      }
      setSendingTargetedEmail(true)
    }

    try {
      let chosenTitle = masterclassSession.title
      if (targetedEmailTarget !== "current_live" && targetedEmailTarget !== "all_masterclasses" && targetedEmailTarget !== "all_platform_users") {
        const rep = masterclassReplays.find(r => r.id === targetedEmailTarget)
        if (rep) chosenTitle = rep.title
      }

      const res = await fetch("/api/admin/masterclasses/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetedEmailTarget === "all_platform_users" 
            ? "all_platform_users" 
            : targetedEmailTarget === "all_masterclasses" 
            ? "registered_only" 
            : "specific_masterclass",
          masterclassId: targetedEmailTarget,
          masterclassTitle: chosenTitle,
          emailType: targetedEmailType,
          subject: targetedEmailSubject.trim(),
          customMessage: targetedEmailCustomMessage.trim(),
          testEmail: isTest ? targetedEmailTestAddress.trim() : undefined
        })
      })

      const data = await res.json()
      if (data.success) {
        showNotice(data.message || (isTest ? "Email test envoyé !" : "Campagne envoyée avec succès !"))
        if (!isTest) {
          setShowTargetedEmailModal(false)
          setTargetedEmailCustomMessage("")
        }
      } else {
        alert("Erreur: " + (data.error || "Erreur lors de l'envoi."))
      }
    } catch (err: any) {
      alert("Erreur réseau: " + err.message)
    } finally {
      if (isTest) setSendingTestEmail(false)
      else setSendingTargetedEmail(false)
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

  async function handleDeleteB2B(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette demande de devis B2B ?")) return
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/b2b?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showNotice("Demande de devis B2B supprimée avec succès.")
        setB2bRequests(prev => prev.filter(b => b.id !== id))
        setStats(prev => ({ ...prev, b2bCount: Math.max(0, prev.b2bCount - 1) }))
      } else {
        alert(data.error || "Erreur lors de la suppression")
      }
    } catch (err: any) {
      alert("Erreur: " + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleForwardB2B(record: B2BRecord) {
    if (!confirm(`Confirmez-vous l'envoi d'un email de transfert à Alfred Dah (alfred@leguideai.com) pour la demande de devis de "${record.company_name}" ?`)) return
    setProcessingId(`forward_${record.id}`)
    try {
      const res = await fetch("/api/admin/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "forward",
          requestId: record.id,
          requestData: record
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message || `Demande de devis transmise avec succès à Alfred Dah !`)
      } else {
        alert(data.error || "Erreur lors du transfert de l'email")
      }
    } catch (err: any) {
      alert("Erreur de connexion: " + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleUpdateB2BStatus(requestId: string, newStatus: string) {
    setProcessingId(`status_${requestId}`)
    try {
      const res = await fetch("/api/admin/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(`Statut B2B mis à jour : ${newStatus}`)
        setB2bRequests(prev => prev.map(b => b.id === requestId ? { ...b, status: newStatus } : b))
      } else {
        alert(data.error || "Erreur de mise à jour du statut")
      }
    } catch (err: any) {
      alert("Erreur de connexion: " + err.message)
    } finally {
      setProcessingId(null)
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

  // Helper to generate clean URL slug
  function generateCourseSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  // 1-Click Apply Official Bootcamp Template (IA & Carrière vs IA & Business)
  function applyBootcampTemplate(type: "carriere" | "business") {
    const isBusiness = type === "business"
    const nextOrder = courses.length + 1
    const baseSlug = isBusiness ? "bootcamp-ia-business" : "bootcamp-ia-carriere"

    // Check if slug already exists
    let finalSlug = baseSlug
    if (courses.some(c => c.slug === finalSlug)) {
      finalSlug = `${baseSlug}-session-${nextOrder}`
    }

    setCourseForm({
      id: undefined,
      title: isBusiness ? "Bootcamp IA & Business" : "Bootcamp IA & Carrière",
      slug: finalSlug,
      subtitle: isBusiness
        ? "Pour entrepreneurs, fondateurs et dirigeants souhaitant structurer leur modèle économique, automatiser leur entreprise, prospecter plus vite et scaler avec l'IA."
        : "Le Bootcamp IA & Carrière est conçu pour les professionnels, cadres et consultants qui exercent au sein d'une organisation et veulent transformer l'IA en levier concret dans leur travail quotidien et leur trajectoire de carrière.",
      price: isBusiness ? "149 000 FCFA" : "99 000 FCFA",
      original_price: isBusiness ? "199 000 FCFA" : "149 000 FCFA",
      badge: isBusiness ? "Exécutif VIP" : "Intensif",
      category: "Bootcamp",
      status: "published",
      thumbnail: isBusiness ? "/images/bootcamp_business_thumb.jpg" : "/images/bootcamp_pro_thumb.jpg",
      poster: isBusiness ? "/images/bootcamp_business_poster.jpg" : "/images/bootcamp_pro_poster.jpg",
      pdf_url: isBusiness
        ? "https://voxqivzzskbttytyklnn.supabase.co/storage/v1/object/public/resources-files/programmes/1786799298400_Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"
        : "https://voxqivzzskbttytyklnn.supabase.co/storage/v1/object/public/resources-files/programmes/1786475706651_Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf",
      dates: isBusiness ? "Du 28 Septembre au 3 Octobre 2026" : "Du 21 au 26 Septembre 2026",
      format: isBusiness ? "100% En Ligne (Direct Live + Masterclass Dirigeants)" : "100% En Ligne (Direct Live + Replays)",
      session_count: 6,
      sequence_order: nextOrder,
      instructor: "Alfred Dah",
      offer_badge_text: isBusiness ? "Offre Exclusive VIP" : "Offre Spéciale Fondateur",
      live_meet_url: ""
    })
    showNotice(`Modèle « ${isBusiness ? "Bootcamp IA & Business" : "Bootcamp IA & Carrière"} » chargé !`)
  }

  // 1-Click Duplicate Existing Bootcamp
  function handleDuplicateCourse(sourceCourse: BootcampCourse) {
    const isBusiness = 
      Number(sourceCourse.price) >= 140000 || 
      String(sourceCourse.slug || "").toLowerCase().includes("business") || 
      String(sourceCourse.title || "").toLowerCase().includes("business")

    const nextOrder = courses.length + 1
    const baseSlug = isBusiness ? "bootcamp-ia-business" : "bootcamp-ia-carriere"
    const sessionSuffix = `session-${nextOrder}`

    setCourseForm({
      ...sourceCourse,
      id: undefined,
      title: `${sourceCourse.title} (Session ${nextOrder})`,
      slug: `${baseSlug}-${sessionSuffix}`,
      sequence_order: nextOrder,
      badge: sourceCourse.badge || (isBusiness ? "Exécutif VIP" : "Intensif"),
      status: "published"
    })
    setShowCourseModal(true)
    showNotice(`Bootcamp « ${sourceCourse.title} » dupliqué. Ajustez les dates puis enregistrez.`)
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
        showNotice(data.message || "Session enregistrée avec succès !")
        setShowLiveModal(false)
        if (data.session) {
          setAllSessions(prev => {
            const exists = prev.some(s => s.id === data.session.id)
            if (exists) {
              return prev.map(s => s.id === data.session.id ? { ...s, ...data.session } : s)
            }
            return [...prev, data.session]
          })
          setLives(prev => {
            const exists = prev.some(l => l.id === data.session.id)
            if (exists) {
              return prev.map(l => l.id === data.session.id ? { ...l, ...data.session } : l)
            }
            return [...prev, data.session]
          })
        }
        fetchAllData()
      } else {
        alert(data.error || "Erreur lors de l'enregistrement de la session.")
      }
    } catch (err: any) {
      alert("Erreur d'enregistrement : " + (err?.message || "Erreur réseau"))
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Role Change
  async function handleRoleChange(userId: string, newRole: string) {
    const targetUser = users.find(u => u.id === userId)
    const isFounder = targetUser?.email?.toLowerCase() === "samba@leguideai.com"
    const isCurrentFounder = currentUser?.email?.toLowerCase() === "samba@leguideai.com"

    if (isFounder && !isCurrentFounder) {
      alert("Action interdite : Seul le superadmin samba@leguideai.com peut modifier son propre rôle.")
      return
    }

    setProcessingId(userId)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_role",
          userId,
          role: newRole,
          requesterEmail: currentUser?.email
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(`Rôle mis à jour : ${newRole}`)
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
        if (isFounder) {
          setUserRole(newRole)
        }
      } else {
        alert(data.error || "Erreur lors de la mise à jour du rôle")
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour du rôle")
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Delete User (Super Admin only)
  async function handleDeleteUser(userToDelete: any) {
    if (!userToDelete?.id) return

    if (userToDelete?.email?.toLowerCase() === "samba@leguideai.com") {
      alert("Action interdite : Le compte du Super Admin fondateur (samba@leguideai.com) est strictement protégé et immuable.")
      return
    }

    if (userToDelete.id === currentUser?.id || userToDelete.email === currentUser?.email) {
      alert("Action impossible : Vous ne pouvez pas supprimer votre propre compte actuellement connecté.")
      return
    }

    const userName = userToDelete.full_name || userToDelete.email
    const confirmed = confirm(
      `⚠️ ACTION IRRÉVERSIBLE (SUPER ADMIN) :\n\nÊtes-vous sûr de vouloir supprimer définitivement le compte de ${userName} (${userToDelete.email}) ?\n\nCette opération supprimera son compte d'authentification, son profil, ses inscriptions et ses devoirs associés.`
    )
    if (!confirmed) return

    setProcessingId(userToDelete.id)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_user",
          userId: userToDelete.id,
          userEmail: userToDelete.email
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message || `Compte de ${userName} supprimé avec succès.`)
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
      } else {
        alert(data.error || "Erreur lors de la suppression du compte.")
      }
    } catch (err: any) {
      alert("Erreur : " + (err?.message || "Impossible de supprimer l'utilisateur."))
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
          whatsapp: enrollWhatsapp,
          courseSlug: enrollCourse,
          paymentMethod: enrollPaymentMethod,
          transactionRef: enrollTransactionRef,
          receiptUrl: enrollReceiptUrl,
          sendEmail: enrollSendEmail
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message)
        setEnrollEmail("")
        setEnrollFullName("")
        setEnrollWhatsapp("")
        setEnrollCourse("")
        setEnrollPaymentMethod("")
        setEnrollTransactionRef("")
        setEnrollReceiptUrl("")
        setEnrollSendEmail(true)
        setShowEmailSuggestions(false)
        setShowEnrollNameSuggestions(false)
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
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status } : p))
        fetchAllData()
      } else {
        alert(data.error || data.message || "Erreur de mise à jour du paiement")
      }
    } catch (err: any) {
      alert("Erreur de mise à jour du paiement : " + (err?.message || "Erreur réseau"))
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

  // Delete Payment & Registration and revoke course access
  async function handleDeletePayment(paymentId: string, registrationId?: string, paymentEmail?: string, courseSlug?: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette inscription et son paiement ? L'accès au Bootcamp sera révoqué immédiatement.")) return
    setProcessingId(paymentId)
    try {
      const params = new URLSearchParams()
      if (paymentId) params.append("id", paymentId)
      if (registrationId) params.append("registration_id", registrationId)
      if (paymentEmail) params.append("email", paymentEmail)
      if (courseSlug) params.append("course_slug", courseSlug)

      const res = await fetch(`/api/admin/payments?${params.toString()}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showNotice("Inscription & Paiement supprimés avec succès. Accès révoqué.")
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

  // Extract receipt / screenshot URL from payment record
  function getPaymentReceiptUrl(p: PaymentRecord): string | null {
    if (p.receipt_url && p.receipt_url.trim() !== "") return p.receipt_url
    const regNotes = (p.registrations as any)?.notes
    if (regNotes) {
      if (typeof regNotes === "string" && (regNotes.startsWith("http://") || regNotes.startsWith("https://"))) return regNotes
      try {
        const parsed = JSON.parse(regNotes)
        if (parsed?.receipt_url) return parsed.receipt_url
      } catch (e) {}
    }
    if (p.notes) {
      if (typeof p.notes === "string" && (p.notes.startsWith("http://") || p.notes.startsWith("https://"))) return p.notes
      try {
        const parsed = JSON.parse(p.notes)
        if (parsed?.receipt_url) return parsed.receipt_url
      } catch (e) {}
    }
    return null
  }

  // Get list of enrolled learners for a specific bootcamp course (Strict Matching by ID, Slug or Title)
  function getCourseLearners(c: BootcampCourse): PaymentRecord[] {
    const cId = String(c.id || "").toLowerCase().trim()
    const cSlug = String(c.slug || "").toLowerCase().trim()
    const cTitle = String(c.title || "").toLowerCase().trim()

    return payments.filter(p => {
      const payCourseId = String(p.course_id || "").toLowerCase().trim()
      const payCourseTitle = String(p.course_title || "").toLowerCase().trim()
      const regSlug = String((p.registrations as any)?.course_slug || (p as any).course_slug || "").toLowerCase().trim()
      const regId = String((p.registrations as any)?.course_id || "").toLowerCase().trim()

      // 1. Strict exact match on course ID
      if (cId && (payCourseId === cId || regId === cId)) return true

      // 2. Strict exact match on course slug
      if (cSlug && (regSlug === cSlug || payCourseTitle === cSlug)) return true

      // 3. Strict match on full title
      if (cTitle && payCourseTitle && payCourseTitle === cTitle) return true

      // 4. Match via notes metadata if contains exact course_id or course_slug
      const regNotes = (p.registrations as any)?.notes
      if (regNotes) {
        try {
          const parsed = typeof regNotes === "string" ? JSON.parse(regNotes) : regNotes
          if (cId && parsed?.course_id && String(parsed.course_id).toLowerCase().trim() === cId) return true
          if (cSlug && parsed?.course_slug && String(parsed.course_slug).toLowerCase().trim() === cSlug) return true
        } catch (e) {}
      }

      return false
    })
  }

  // Unenroll / Delete learner from specific course
  async function handleUnenrollLearner(p: PaymentRecord, courseSlug?: string) {
    const name = p.registrations?.full_name || p.registrations?.email || "cet apprenant"
    if (!confirm(`Êtes-vous sûr de vouloir désinscrire définitivement ${name} de cette formation ? L'accès au Bootcamp sera révoqué immédiatement.`)) return

    setProcessingId(p.id)
    try {
      const email = p.registrations?.email || ""
      const url = `/api/admin/payments?id=${p.id}&registration_id=${p.registration_id || ""}&email=${encodeURIComponent(email)}&course_slug=${encodeURIComponent(courseSlug || "")}`
      const res = await fetch(url, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showNotice(`${name} a été désinscrit(e) avec succès du Bootcamp.`)
        setPayments(prev => prev.filter(item => item.id !== p.id))
        fetchAllData()
      } else {
        alert(data.error || "Erreur lors de la désinscription.")
      }
    } catch (err: any) {
      alert("Erreur de suppression : " + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Manual Enrollment by Admin (Modal)
  async function handleManualEnrollLearner(e: React.FormEvent) {
    e.preventDefault()
    if (!manualEnrollForm.email) return
    const targetSlug = manualEnrollForm.courseSlug || selectedCourseForLearners?.slug || "bootcamp-ia-pro"
    const targetCourse = courses.find(c => c.slug === targetSlug || c.id === targetSlug) || selectedCourseForLearners

    setSavingManualEnroll(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enroll_course",
          userEmail: manualEnrollForm.email,
          userName: manualEnrollForm.fullName,
          whatsapp: manualEnrollForm.whatsapp,
          courseSlug: targetSlug,
          courseTitle: targetCourse?.title || targetSlug,
          courseId: targetCourse?.id || null,
          paymentMethod: manualEnrollForm.paymentMethod || "Inscription Manuelle (Admin)",
          transactionRef: manualEnrollForm.transactionRef || `ADM-${Date.now().toString().slice(-6)}`,
          amountPaid: manualEnrollForm.amount,
          receiptUrl: manualEnrollForm.receiptUrl,
          sendEmail: manualEnrollForm.sendEmail
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message || `Apprenant ${manualEnrollForm.fullName || manualEnrollForm.email} inscrit avec succès ! Accès activé.`)
        setShowManualEnrollModal(false)
        setManualEnrollForm({
          courseSlug: "",
          fullName: "",
          email: "",
          whatsapp: "",
          paymentMethod: "Wave Mobile Money",
          transactionRef: "",
          amount: "99000",
          receiptUrl: "",
          sendEmail: true
        })
        fetchAllData()
      } else {
        alert(data.error || "Erreur lors de l'inscription manuelle.")
      }
    } catch (err: any) {
      alert("Erreur de communication : " + err.message)
    } finally {
      setSavingManualEnroll(false)
    }
  }

  // =========================================================================
  // ACTIONS GESTION DES ABONNEMENTS VIP (REPLAYS & PROMPTS)
  // =========================================================================

  const handleValidateSubscription = async (subId: string, email?: string) => {
    setProcessingId(subId)
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate_subscription",
          subscriptionId: subId,
          email: email || undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        setAdminSubscriptions(prev => prev.map(s => (s.id === subId || (email && s.email.toLowerCase() === email.toLowerCase())) ? {
          ...s,
          status: "active",
          starts_at: new Date().toISOString(),
          expires_at: data.expiresAt || s.expires_at,
          days_remaining: 90
        } : s))
        showNotice(data.message || "Abonnement VIP validé avec succès !")
        fetchAllData()
      } else {
        alert(data.error || "Erreur lors de la validation.")
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleProlongSubscription = async (subId: string, extraDays: number = 30) => {
    setProcessingId(subId)
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "prolong_subscription",
          subscriptionId: subId,
          extraDays
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice(data.message || `Abonnement prolongé de ${extraDays} jours !`)
        fetchAllData()
      } else {
        alert(data.error || "Erreur lors de la prolongation.")
      }
    } catch (err: any) {
      alert("Erreur : " + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancelSubscription = async (subId: string) => {
    if (!confirm("Voulez-vous vraiment révoquer cet abonnement ?")) return
    setProcessingId(subId)
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel_subscription",
          subscriptionId: subId
        })
      })
      const data = await res.json()
      if (data.success) {
        setAdminSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, status: "cancelled", days_remaining: 0 } : s))
        showNotice("Abonnement révoqué.")
        fetchAllData()
      }
    } catch (_) {}
    finally {
      setProcessingId(null)
    }
  }

  const handleDeleteSubscription = async (subId: string) => {
    if (!confirm("Voulez-vous supprimer définitivement cet enregistrement d'abonnement ?")) return
    setProcessingId(subId)
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_subscription",
          subscriptionId: subId
        })
      })
      const data = await res.json()
      if (data.success) {
        setAdminSubscriptions(prev => prev.filter(s => s.id !== subId))
        showNotice("Enregistrement d'abonnement supprimé.")
        fetchAllData()
      }
    } catch (_) {}
    finally {
      setProcessingId(null)
    }
  }

  const handleSaveManualSub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualSubForm.fullName || !manualSubForm.email) return
    setSavingManualSub(true)
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_manual_subscription",
          ...manualSubForm
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowManualSubModal(false)
        setManualSubForm({ fullName: "", email: "", whatsapp: "", country: "Côte d'Ivoire", plan: "3_months", customDays: "" })
        showNotice("Abonnement actif créé avec succès !")
        fetchAllData()
      } else {
        alert(data.error || "Erreur lors de la création de l'abonnement.")
      }
    } catch (err: any) {
      alert("Erreur : " + err.message)
    } finally {
      setSavingManualSub(false)
    }
  }

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPriceEdit(true)
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_pricing",
          price3m: priceEditForm.price3m,
          price1y: priceEditForm.price1y
        })
      })
      const data = await res.json()
      if (data.success) {
        setSubscriptionPricing(data.pricing)
        setShowPriceEditModal(false)
        showNotice("Prix des abonnements mis à jour avec succès !")
      } else {
        alert(data.error || "Erreur lors de la mise à jour.")
      }
    } catch (err: any) {
      alert("Erreur : " + err.message)
    } finally {
      setSavingPriceEdit(false)
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
        meetUrl: (s.meet_url && s.meet_url.trim() && s.meet_url !== "https://meet.google.com") ? s.meet_url.trim() : (course?.live_meet_url && course.live_meet_url.trim() && course.live_meet_url !== "https://meet.google.com" ? course.live_meet_url.trim() : ""),
        recordingUrl: s.recording_url,
        whatsappUrl: course?.whatsapp_url,
        status: getDynamicSessionStatus(s)
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
  async function handleGenerateCohort(
    courseId: string,
    startDateStr: string,
    customSessionCount?: number,
    startTimeStr: string = "19:00",
    durationMinutes: number = 120
  ) {
    const course = courses.find(c => c.id === courseId || c.slug === courseId) || courses[0]
    if (!course || !startDateStr) return

    const start = new Date(startDateStr)
    const sessionCount = customSessionCount && Number(customSessionCount) > 0
      ? Number(customSessionCount)
      : (cohortForm.sessionCount && Number(cohortForm.sessionCount) > 0 ? Number(cohortForm.sessionCount) : 6)
    
    // Check if course has lessons defined in Supabase
    let courseLessons: string[] = []
    if (Array.isArray((course as any).lessons) && (course as any).lessons.length > 0) {
      courseLessons = (course as any).lessons.map((l: any) => typeof l === "string" ? l : (l.title || `Module`))
    }

    const [startHourStr, startMinStr] = (startTimeStr || "19:00").split(":")
    const startHour = parseInt(startHourStr, 10) || 19
    const startMin = parseInt(startMinStr, 10) || 0
    const duration = Number(durationMinutes) || 120

    const endTotalMinutes = startHour * 60 + startMin + duration
    const endHour = Math.floor(endTotalMinutes / 60) % 24
    const endMin = endTotalMinutes % 60
    const formattedEndTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}:00Z`
    const formattedStartTime = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}:00Z`

    const payload = Array.from({ length: sessionCount }, (_, idx) => {
      const cur = new Date(start)
      cur.setDate(start.getDate() + idx)
      const datePart = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`
      const sched = `${datePart}T${formattedStartTime}`
      const end = `${datePart}T${formattedEndTime}`

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
        meet_url: (course.live_meet_url && course.live_meet_url.trim() && course.live_meet_url !== "https://meet.google.com") ? course.live_meet_url.trim() : null,
        status: "upcoming"
      }
    })

    try {
      // 1. Sauvegarder les sessions dans bootcamp_sessions
      const { data, error } = await supabase.from("bootcamp_sessions").insert(payload).select()
      if (!error && data) {
        setAllSessions(prev => [...prev, ...data])
        
        // 2. Mettre à jour le nombre de sessions du bootcamp dans Supabase
        try {
          if (course.id) {
            await supabase
              .from("courses")
              .update({ 
                session_count: sessionCount,
                dates: `Du ${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au ${new Date(start.getTime() + (sessionCount - 1) * 86400000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
              })
              .eq("id", course.id)
          }

          setCourses(prev => prev.map(c => (c.id === course.id || c.slug === course.slug) ? { ...c, session_count: sessionCount } : c))
        } catch (updateErr) {
          console.warn("Could not update course session count:", updateErr)
        }

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

  // Masterclass Participant Filtering and Counts
  const masterclassCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: masterclassParticipants.length,
      current_live: 0
    }
    masterclassReplays.forEach(r => {
      counts[r.id] = 0
    })

    masterclassParticipants.forEach(p => {
      const pId = p.masterclass_id || "current_live"
      if (counts[pId] !== undefined) {
        counts[pId]++
      } else {
        counts.current_live++
      }
    })

    return counts
  }, [masterclassParticipants, masterclassReplays])

  const filteredMasterclassParticipants = useMemo(() => {
    return masterclassParticipants.filter(p => {
      // 1. Filter by Masterclass selection
      if (selectedMasterclassFilter !== "all") {
        const pId = p.masterclass_id || "current_live"
        const pTitle = (p.masterclass_title || "").toLowerCase()
        if (selectedMasterclassFilter === "current_live") {
          if (pId !== "current_live" && !pTitle.includes(masterclassSession.title.toLowerCase())) {
            return false
          }
        } else {
          const replay = masterclassReplays.find(r => r.id === selectedMasterclassFilter)
          const replayTitle = (replay?.title || "").toLowerCase()
          if (pId !== selectedMasterclassFilter && (!replayTitle || !pTitle.includes(replayTitle))) {
            return false
          }
        }
      }

      // 2. Filter by search query
      if (!masterclassSearch) return true
      const q = masterclassSearch.toLowerCase()
      return (
        (p.full_name || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.whatsapp || "").toLowerCase().includes(q) ||
        (p.masterclass_title || "").toLowerCase().includes(q)
      )
    })
  }, [masterclassParticipants, selectedMasterclassFilter, masterclassSearch, masterclassSession.title, masterclassReplays])

  // Helper ultra-sécurisé pour vérifier si un utilisateur est déjà inscrit à la session ciblée
  const isUserEnrolledInMasterclass = useCallback((email: string | null | undefined, targetSessionId: string) => {
    if (!email) return false
    const norm = email.toLowerCase().trim()

    // 1. Déterminer si la session ciblée est la prochaine Masterclass en direct principale
    const primaryUpcomingId = masterclassSession?.id || upcomingMasterclasses[0]?.id || "current_live"
    const isTargetingPrimaryUpcoming = 
      !targetSessionId ||
      targetSessionId === "current_live" || 
      targetSessionId === "mc_default" || 
      targetSessionId === primaryUpcomingId ||
      (upcomingMasterclasses.length > 0 && targetSessionId === upcomingMasterclasses[0]?.id)

    const targetSession = upcomingMasterclasses.find(s => s.id === targetSessionId) || (masterclassSession?.id === targetSessionId ? masterclassSession : null)
    const targetTitle = (targetSession?.title || masterclassSession?.title || "").toLowerCase().trim()

    // Vérifier dans la liste de tous les participants inscrits
    return masterclassParticipants.some(p => {
      const pEmail = (p.email || "").toLowerCase().trim()
      if (pEmail !== norm) return false

      const pId = p.masterclass_id || "current_live"
      const pTitle = (p.masterclass_title || "").toLowerCase().trim()
      const regList: string[] = Array.isArray(p.parsed_notes?.registered_masterclasses) 
        ? p.parsed_notes.registered_masterclasses 
        : []

      // Correspondance exacte par ID ou dans le tableau d'inscriptions
      if (pId === targetSessionId) return true
      if (regList.includes(targetSessionId)) return true

      // Si la session ciblée est le direct principal à venir
      if (isTargetingPrimaryUpcoming) {
        if (pId === "current_live" || pId === "mc_default" || !p.masterclass_id) return true
        if (pId === primaryUpcomingId) return true
        if (regList.includes("current_live") || regList.includes("mc_default") || regList.includes(primaryUpcomingId)) return true

        // Si l'inscription n'appartient pas explicitement à un replay ou une session passée spécifique,
        // c'est une inscription active au direct à venir !
        const isSpecificPastOrReplay = 
          masterclassReplays.some(r => r.id === pId) || 
          pastMasterclasses.some(ps => ps.id === pId)

        if (!isSpecificPastOrReplay) {
          return true
        }

        // Correspondance par titre de la Masterclass
        if (targetTitle && pTitle && (pTitle.includes(targetTitle) || targetTitle.includes(pTitle))) {
          return true
        }
      } else {
        // Pour une session spécifique différente
        if (targetTitle && pTitle && (pTitle.includes(targetTitle) || targetTitle.includes(pTitle))) {
          return true
        }
      }

      return false
    })
  }, [upcomingMasterclasses, masterclassSession, masterclassParticipants, masterclassReplays, pastMasterclasses])

  // Liste des utilisateurs éligibles non encore inscrits (strictement réservée à samba@leguideai.com)
  const eligibleUnenrolledUsers = useMemo(() => {
    if (!isFounderSamba) return []
    return users.filter(u => {
      const email = (u.email || "").toLowerCase().trim()
      if (!email) return false
      // Exclure samba et tout compte avec rôle admin ou super_admin
      if (email === "samba@leguideai.com") return false
      if (u.role === "admin" || u.role === "super_admin") return false
      // Exclure si déjà inscrit à la session ciblée
      if (isUserEnrolledInMasterclass(email, enrollTargetSessionId)) return false
      return true
    })
  }, [isFounderSamba, users, enrollTargetSessionId, isUserEnrolledInMasterclass])

  // Filtrage par recherche dans le modal d'inscription
  const filteredEligibleUsers = useMemo(() => {
    if (!enrollSearchQuery) return eligibleUnenrolledUsers
    const q = enrollSearchQuery.toLowerCase().trim()
    return eligibleUnenrolledUsers.filter(u => {
      return (
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        ((u as any).whatsapp || "").toLowerCase().includes(q) ||
        ((u as any).country || "").toLowerCase().includes(q) ||
        ((u as any).sector || "").toLowerCase().includes(q)
      )
    })
  }, [eligibleUnenrolledUsers, enrollSearchQuery])

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

  const isSubscriptionPayment = (p: any) => {
    const ref = (p.transaction_ref || "").toUpperCase()
    const title = (p.course_title || "").toLowerCase()
    const regSource = (p.registrations?.source || "").toLowerCase()
    const regSlug = (p.registrations?.course_slug || "").toLowerCase()

    if (
      ref.includes("STRIPE-SUB") ||
      ref.includes("SUB-") ||
      ref.startsWith("SUB") ||
      title.includes("abonnement") ||
      title.includes("pass vip") ||
      title.includes("ressource") ||
      title.includes("replay") ||
      regSource.includes("subscription") ||
      regSlug.includes("subscription") ||
      regSlug === "subscription-vip"
    ) {
      return true
    }

    if (!title.includes("bootcamp") && !title.includes("pro") && (p.amount === 10000 || p.amount === 15000 || p.amount === 30000)) {
      return true
    }

    return false
  }

  const bootcampPayments = payments.filter(p => !isSubscriptionPayment(p))
  const bootcampPendingCount = bootcampPayments.filter(p => p.status === "pending_verification" || p.status === "pending" || p.status === "en_attente").length

  const filteredPayments = bootcampPayments.filter(p => {
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
      
      {/* Notice Toast — Always on top of all modals and backdrops */}
      {noticeMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-slate-900/95 text-white border border-emerald-500/40 font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="size-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="size-4" />
          </div>
          <span className="text-xs md:text-sm font-semibold text-slate-100 max-w-sm sm:max-w-md">{noticeMessage}</span>
          <button
            onClick={() => setNoticeMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
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
              {/* Section 1: Dashboard & KPIs (Super Admin only) */}
              {isSuperAdmin && (
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
                </div>
              )}

              {/* Section 2: Gestion du Contenu */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Gestion du Contenu</p>
                
                {/* Bootcamps & Sous-section Inscriptions */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setActiveTab("courses"); setMobileMenuOpen(false) }}
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

                  <button
                    onClick={() => { setActiveTab("payments"); setMobileMenuOpen(false) }}
                    className={`w-full flex items-center justify-between pl-7 pr-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeTab === "payments" ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="size-3.5 shrink-0" />
                      <span>Inscriptions</span>
                    </div>
                    {bootcampPendingCount > 0 && (
                      <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full">
                        {bootcampPendingCount}
                      </span>
                    )}
                  </button>
                </div>

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
                    <span>Calendrier & Planning</span>
                  </div>
                  <span className="text-[10px] opacity-75">({adminCalendarEvents.length})</span>
                </button>

                {/* Masterclasses (À Venir) */}
                <button
                  onClick={() => { setActiveTab("masterclasses"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "masterclasses" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="size-4 shrink-0 text-rose-500" />
                    <span>Masterclasses (À Venir)</span>
                  </div>
                  <span className="text-[10px] font-bold opacity-75">({upcomingMasterclasses.length})</span>
                </button>

                {/* Sub-nav Sessions Passées */}
                <button
                  onClick={() => { setActiveTab("masterclasses_past"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between pl-7 pr-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === "masterclasses_past"
                      ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 shrink-0" />
                    <span>Sessions Passées</span>
                  </div>
                  <span className="text-[10px] opacity-75">({pastMasterclasses.length})</span>
                </button>

                {/* Sub-nav Inscrits Masterclass */}
                <button
                  onClick={() => { setActiveTab("masterclass_participants"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between pl-7 pr-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === "masterclass_participants"
                      ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5 shrink-0" />
                    <span>Participants & Inscrits</span>
                  </div>
                  <span className="text-[10px] opacity-75">({masterclassParticipants.length})</span>
                </button>

                {/* Sub-nav Replays Masterclass */}
                <button
                  onClick={() => { setActiveTab("masterclass_replays"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between pl-7 pr-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === "masterclass_replays"
                      ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Video className="size-3.5 shrink-0" />
                    <span>Replays</span>
                  </div>
                  <span className="text-[10px] opacity-75">({masterclassReplays.length})</span>
                </button>

                {/* Sub-nav Abonnements Replays & Prompts */}
                <button
                  onClick={() => { setActiveTab("subscriptions"); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center justify-between pl-7 pr-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === "subscriptions"
                      ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Crown className="size-3.5 shrink-0 text-amber-500" />
                    <span>Abonnements VIP</span>
                  </div>
                  {adminSubscriptionStats.totalPending > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] animate-pulse">
                      {adminSubscriptionStats.totalPending} en attente
                    </span>
                  ) : (
                    <span className="text-[10px] opacity-75">({adminSubscriptions.length})</span>
                  )}
                </button>
              </div>

              {/* Section 3: Apprenants & Devoirs */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Apprenants & Devoirs</p>
                {isSuperAdmin && (
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
                )}

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

              {/* Section 4: Organisation */}
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

                {isSuperAdmin && (
                  <>
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
                  </>
                )}
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
      <aside className={`${sidebarCollapsed ? "w-20 p-3" : "w-64 p-4"} transition-all duration-300 ease-in-out border-r border-slate-200 bg-white backdrop-blur-xl hidden md:flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-30`}>
        <div className="space-y-6 text-left">
          {/* Logo & Platform Info + Toggle */}
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center flex-col gap-2.5" : "justify-between"} px-1`}>
            <Link href="/" className="flex items-center gap-3 group min-w-0" title="LE GUIDE IA — Retour à l'accueil">
              <img
                src="/Logo%20avatar.png"
                alt="Logo Le Guide IA"
                className="size-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform shrink-0"
              />
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <span className="font-heading font-black text-sm text-slate-800 tracking-wide block truncate">LE GUIDE IA</span>
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block truncate">ADMIN PORTAL</span>
                </div>
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

          {/* Nav Categories */}
          <div className="space-y-4">
            {/* Section 1: ANALYTIQUES & REVENUS (Super Admin only) */}
            {isSuperAdmin && (
              <div className="space-y-1">
                {!sidebarCollapsed ? (
                  <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Analytiques & Ventes</p>
                ) : (
                  <div className="my-2 border-t border-slate-100" />
                )}
                <button
                  onClick={() => setActiveTab("kpi")}
                  title="Dashboard & KPIs"
                  className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "kpi" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                    <DollarSign className="size-4 shrink-0" />
                    {!sidebarCollapsed && <span>Dashboard & KPIs</span>}
                  </div>
                </button>
              </div>
            )}

            {/* Section 2: GESTION DU CONTENU */}
            <div className="space-y-1">
              {!sidebarCollapsed ? (
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Gestion du Contenu</p>
              ) : (
                <div className="my-2 border-t border-slate-100" />
              )}
              
              {/* Bootcamps */}
              <button
                onClick={() => setActiveTab("courses")}
                title={`Bootcamps (${courses.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "courses" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                  <Layers className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>Bootcamps</span>}
                </div>
                {!sidebarCollapsed && <span className="text-[10px] opacity-75">({courses.length})</span>}
              </button>

              {/* Inscriptions */}
              <button
                onClick={() => setActiveTab("payments")}
                title={`Inscriptions & Paiements ${bootcampPendingCount > 0 ? `(${bootcampPendingCount} en attente)` : ''}`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between pl-7 pr-3.5 py-2"} rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                  activeTab === "payments" 
                    ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"}`}>
                  <FileCheck className="size-3.5 shrink-0" />
                  {!sidebarCollapsed && <span>Inscriptions</span>}
                </div>
                {bootcampPendingCount > 0 && (
                  sidebarCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-500 ring-2 ring-white" />
                  ) : (
                    <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                      {bootcampPendingCount}
                    </span>
                  )
                )}
              </button>

              <button
                onClick={() => setActiveTab("resources")}
                title={`Bibliothèque (${resources.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "resources" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                  <BookOpen className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>Bibliothèque</span>}
                </div>
                {!sidebarCollapsed && <span className="text-[10px] opacity-75">({resources.length})</span>}
              </button>

              <button
                onClick={() => setActiveTab("lives")}
                title={`Calendrier & Planning (${adminCalendarEvents.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "lives" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                  <Calendar className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>Calendrier & Planning</span>}
                </div>
                {!sidebarCollapsed && <span className="text-[10px] opacity-75">({adminCalendarEvents.length})</span>}
              </button>

              {/* Masterclasses (À Venir) */}
              <button
                onClick={() => setActiveTab("masterclasses")}
                title={`Masterclasses à Venir (${upcomingMasterclasses.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "masterclasses" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                  <Radio className="size-4 shrink-0 text-rose-500" />
                  {!sidebarCollapsed && <span>Masterclasses</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] opacity-75">({upcomingMasterclasses.length})</span>
                )}
              </button>

              {/* Sub-nav: Sessions Passées */}
              <button
                onClick={() => setActiveTab("masterclasses_past")}
                title={`Sessions Passées (${pastMasterclasses.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between pl-7 pr-3.5 py-2"} rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                  activeTab === "masterclasses_past" 
                    ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"}`}>
                  <Clock className="size-3.5 shrink-0" />
                  {!sidebarCollapsed && <span>Sessions Passées</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] opacity-75">({pastMasterclasses.length})</span>
                )}
              </button>

              {/* Sub-nav: Inscrits / Participants */}
              <button
                onClick={() => setActiveTab("masterclass_participants")}
                title={`Participants Masterclasses (${masterclassParticipants.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between pl-7 pr-3.5 py-2"} rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                  activeTab === "masterclass_participants" 
                    ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"}`}>
                  <Users className="size-3.5 shrink-0" />
                  {!sidebarCollapsed && <span>Participants & Inscrits</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] opacity-75">({masterclassParticipants.length})</span>
                )}
              </button>

              {/* Sub-nav: Replays */}
              <button
                onClick={() => setActiveTab("masterclass_replays")}
                title={`Replays Masterclasses (${masterclassReplays.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between pl-7 pr-3.5 py-2"} rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                  activeTab === "masterclass_replays" 
                    ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"}`}>
                  <Video className="size-3.5 shrink-0" />
                  {!sidebarCollapsed && <span>Replays</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] opacity-75">({masterclassReplays.length})</span>
                )}
              </button>

              {/* Sub-nav: Abonnements Replays & Prompts */}
              <button
                onClick={() => setActiveTab("subscriptions")}
                title={`Abonnements VIP Replays & Prompts (${adminSubscriptions.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between pl-7 pr-3.5 py-2"} rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                  activeTab === "subscriptions" 
                    ? "bg-primary/15 text-slate-950 font-bold border-l-2 border-primary" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"}`}>
                  <Crown className="size-3.5 shrink-0 text-amber-500" />
                  {!sidebarCollapsed && <span>Abonnements VIP</span>}
                </div>
                {!sidebarCollapsed && (
                  adminSubscriptionStats.totalPending > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] animate-pulse">
                      {adminSubscriptionStats.totalPending}
                    </span>
                  ) : (
                    <span className="text-[10px] opacity-75">({adminSubscriptions.length})</span>
                  )
                )}
              </button>
            </div>

            {/* Section 3: APPRENANTS & DEVOIRS */}
            <div className="space-y-1">
              {!sidebarCollapsed ? (
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Apprenants & Devoirs</p>
              ) : (
                <div className="my-2 border-t border-slate-100" />
              )}
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab("users")}
                  title={`Membres & Rôles (${users.length})`}
                  className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                    activeTab === "users" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                    <Users className="size-4 shrink-0" />
                    {!sidebarCollapsed && <span>Membres & Rôles</span>}
                  </div>
                  {!sidebarCollapsed && <span className="text-[10px] opacity-75">({users.length})</span>}
                </button>
              )}

              <button
                onClick={() => setActiveTab("submissions")}
                title={`Correction Devoirs ${stats.pendingSubmissions > 0 ? `(${stats.pendingSubmissions} en attente)` : ''}`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "submissions" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                  <FileCheck className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>Correction Devoirs</span>}
                </div>
                {stats.pendingSubmissions > 0 && (
                  sidebarCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  ) : (
                    <span className="bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full">
                      {stats.pendingSubmissions}
                    </span>
                  )
                )}
              </button>
            </div>

            {/* Section 4: ORGANISATION */}
            <div className="space-y-1">
              {!sidebarCollapsed ? (
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Organisation</p>
              ) : (
                <div className="my-2 border-t border-slate-100" />
              )}
              <button
                onClick={() => setActiveTab("newsletter")}
                title={`Newsletter & Diffusion (${newsletterSubscribers.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "newsletter" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                  <Mail className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>Newsletter & Diffusion</span>}
                </div>
                {!sidebarCollapsed && <span className="text-[10px] opacity-75">({newsletterSubscribers.length})</span>}
              </button>

              <button
                onClick={() => setActiveTab("testimonials")}
                title={`Avis & Témoignages (${testimonials.length})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "testimonials" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                  <Quote className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>Avis & Témoignages</span>}
                </div>
                {!sidebarCollapsed && <span className="text-[10px] opacity-75">({testimonials.length})</span>}
              </button>

              <button
                onClick={() => setActiveTab("b2b")}
                title={`Demandes B2B (${stats.b2bCount})`}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "b2b" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                  <Building2 className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>Demandes B2B</span>}
                </div>
                {stats.b2bCount > 0 && (
                  sidebarCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-white" />
                  ) : (
                    <span className="bg-primary text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                      {stats.b2bCount}
                    </span>
                  )
                )}
              </button>

              {isSuperAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab("settings")}
                    title="Paramètres"
                    className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "settings" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                      <Award className="size-4 shrink-0" />
                      {!sidebarCollapsed && <span>Paramètres</span>}
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("export")}
                    title="Exports"
                    className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "export" ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                      <Download className="size-4 shrink-0" />
                      {!sidebarCollapsed && <span>Exports</span>}
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Info & Signout */}
        <div className="pt-4 border-t border-slate-200 space-y-2.5">
          {sidebarCollapsed ? (
            <div className="flex justify-center" title={`${currentUser?.email || "Administrateur"} (${userRole || "admin"})`}>
              <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-slate-900 text-xs font-black shrink-0">
                {(currentUser?.email || "AD").substring(0, 2).toUpperCase()}
              </div>
            </div>
          ) : (
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
          )}

          <button
            onClick={handleLogout}
            title="Déconnexion"
            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-2" : "justify-center gap-2 px-3 py-2"} rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-all cursor-pointer bg-white`}
          >
            <LogOut className="size-3.5 text-rose-500 shrink-0" />
            {!sidebarCollapsed && <span>Déconnexion</span>}
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
              {activeTab === "lives" && "Calendrier & Planning des Sessions Bootcamps"}
              {activeTab === "masterclasses" && "Masterclasses — Sessions à Venir"}
              {activeTab === "masterclasses_past" && "Masterclasses — Sessions Passées & Historique"}
              {activeTab === "masterclass_participants" && "Masterclasses — Participants & Inscrits"}
              {activeTab === "masterclass_replays" && "Masterclasses — Replays & Rediffusions"}
              {activeTab === "subscriptions" && "Abonnements VIP (Replays Masterclasses & Prompts)"}
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

        {/* ACCESS RESTRICTED NOTICE FOR ADMIN ON SUPER_ADMIN TABS */}
        {!isSuperAdmin && (activeTab === "kpi" || activeTab === "users" || activeTab === "settings" || activeTab === "export") && (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
            <div className="size-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="size-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Accès Réservé au Super Admin</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cette rubrique est réservée exclusivement au Super Administrateur (Fondateur / Direction).
            </p>
            <button
              onClick={() => setActiveTab("courses")}
              className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 cursor-pointer shadow-lg shadow-primary/20"
            >
              Retour aux Bootcamps
            </button>
          </div>
        )}

        {/* TAB 1: KPI OVERVIEW (Super Admin only) */}
        {activeTab === "kpi" && isSuperAdmin && (
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
                  {stats.totalRevenue.toLocaleString("fr-FR")} <span className="text-xs sm:text-sm font-bold text-emerald-700">FCFA</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 sm:mt-2 text-[11px] text-slate-500 font-medium flex-wrap">
                  <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                    Bootcamps : <span className="text-emerald-700">{(stats.bootcampRevenue || 0).toLocaleString("fr-FR")} F</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                    Abonnements : <span className="text-amber-700">{(stats.subscriptionRevenue || 0).toLocaleString("fr-FR")} F</span>
                  </span>
                </div>
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

              <form onSubmit={handleManualEnroll} className="space-y-3.5 pt-2">
                {/* Nom complet avec suggestions */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">Nom complet du participant</label>
                    {allLearnerSuggestions.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {allLearnerSuggestions.length} membre{allLearnerSuggestions.length > 1 ? "s" : ""} enregistré{allLearnerSuggestions.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: Jean Dupont"
                    value={enrollFullName}
                    onFocus={() => setShowEnrollNameSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowEnrollNameSuggestions(false), 200)}
                    onChange={e => {
                      setEnrollFullName(e.target.value)
                      setShowEnrollNameSuggestions(true)
                    }}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary focus:bg-white outline-none transition-colors"
                  />

                  {/* Name Suggestions Dropdown */}
                  {showEnrollNameSuggestions && (
                    (() => {
                      const q = enrollFullName.toLowerCase().trim()
                      const matches = q
                        ? allLearnerSuggestions.filter(l => l.fullName.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)).slice(0, 5)
                        : allLearnerSuggestions.slice(0, 5)
                      if (matches.length === 0) return null
                      return (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                            <span>Membres suggérés</span>
                            <button type="button" onClick={() => setShowEnrollNameSuggestions(false)} className="text-slate-400 hover:text-slate-600">
                              <X className="size-3" />
                            </button>
                          </div>
                          {matches.map((l, idx) => {
                            const initials = (l.fullName || l.email || "A").substring(0, 2).toUpperCase()
                            return (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() => {
                                  setEnrollFullName(l.fullName || "")
                                  setEnrollEmail(l.email || "")
                                  if (l.whatsapp) setEnrollWhatsapp(l.whatsapp)
                                  setShowEnrollNameSuggestions(false)
                                  setShowEmailSuggestions(false)
                                }}
                                className="w-full text-left p-2.5 hover:bg-emerald-50/70 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="size-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-200">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-slate-800 text-xs block truncate">{l.fullName || "Sans nom renseigné"}</span>
                                    <span className="text-[10px] text-slate-500 font-mono truncate block">{l.email}</span>
                                  </div>
                                </div>
                                {l.whatsapp && (
                                  <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                    {l.whatsapp}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })()
                  )}
                </div>

                {/* Email avec Autocomplétion Suggerée des Élèves */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">Email de l'apprenant *</label>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Sparkles className="size-3" /> Remplissage automatique
                    </span>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="jean.dupont@email.com"
                    value={enrollEmail}
                    onFocus={() => setShowEmailSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
                    onChange={e => {
                      const val = e.target.value
                      setEnrollEmail(val)
                      const matched = allLearnerSuggestions.find(l => l.email.toLowerCase() === val.toLowerCase().trim())
                      if (matched) {
                        if (matched.fullName) setEnrollFullName(matched.fullName)
                        if (matched.whatsapp) setEnrollWhatsapp(matched.whatsapp)
                      }
                      setShowEmailSuggestions(true)
                    }}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary focus:bg-white outline-none font-mono transition-colors"
                  />

                  {/* Suggestions Dropdown */}
                  {showEmailSuggestions && (
                    (() => {
                      const q = enrollEmail.toLowerCase().trim()
                      const matches = q
                        ? allLearnerSuggestions.filter(l => l.email.toLowerCase().includes(q) || l.fullName.toLowerCase().includes(q)).slice(0, 5)
                        : allLearnerSuggestions.slice(0, 5)
                      if (matches.length === 0) return null
                      return (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                            <span>Apprenants suggérés (Cliquer pour préremplir)</span>
                            <button type="button" onClick={() => setShowEmailSuggestions(false)} className="text-slate-400 hover:text-slate-600">
                              <X className="size-3" />
                            </button>
                          </div>
                          {matches.map((l, idx) => {
                            const initials = (l.fullName || l.email || "A").substring(0, 2).toUpperCase()
                            return (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() => {
                                  setEnrollEmail(l.email || "")
                                  if (l.fullName) setEnrollFullName(l.fullName)
                                  if (l.whatsapp) setEnrollWhatsapp(l.whatsapp)
                                  setShowEmailSuggestions(false)
                                  setShowEnrollNameSuggestions(false)
                                }}
                                className="w-full text-left p-2.5 hover:bg-emerald-50/70 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="size-7 rounded-lg bg-primary/20 text-slate-900 font-bold text-[10px] flex items-center justify-center shrink-0 border border-primary/30">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-slate-800 text-xs block truncate">{l.fullName || "Utilisateur sans nom"}</span>
                                    <span className="text-[10px] text-slate-500 font-mono truncate block">{l.email}</span>
                                  </div>
                                </div>
                                {l.whatsapp && (
                                  <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                    {l.whatsapp}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })()
                  )}
                </div>

                {/* N° WhatsApp & Bootcamp concerné */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">N° WhatsApp (avec indicatif)</label>
                    <input
                      type="tel"
                      placeholder="+226 75 00 00 00"
                      value={enrollWhatsapp}
                      onChange={e => setEnrollWhatsapp(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary focus:bg-white outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Bootcamp concerné *</label>
                    <select
                      value={enrollCourse}
                      onChange={e => setEnrollCourse(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary focus:bg-white outline-none transition-colors cursor-pointer"
                    >
                      <option value="">Sélectionner une formation...</option>
                      {courses.map(c => (
                        <option key={c.id || c.slug} value={c.slug}>
                          {c.title} {c.price ? `(${c.price})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mode de règlement & Référence (Optionnels) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Moyen de paiement (Optionnel)</label>
                    <select
                      value={enrollPaymentMethod}
                      onChange={e => setEnrollPaymentMethod(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary focus:bg-white outline-none transition-colors cursor-pointer"
                    >
                      <option value="">Sélectionner un moyen (optionnel)</option>
                      <option value="Wave Mobile Money">Wave</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="Moov Money">Moov Money</option>
                      <option value="Virement Bancaire">Virement Bancaire</option>
                      <option value="Espèces / Cash">Espèces / Cash</option>
                      <option value="Offert / Gratuit">Offert / Gratuit</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Référence Transaction (Optionnel)</label>
                    <input
                      type="text"
                      placeholder="ex: Ref Wave, OM, N° Virement"
                      value={enrollTransactionRef}
                      onChange={e => setEnrollTransactionRef(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary focus:bg-white outline-none font-mono transition-colors"
                    />
                  </div>
                </div>

                {/* Preuve de virement / Reçu Upload */}
                <div>
                  <FileUploadField
                    label="Preuve de virement / Reçu Mobile Money (Optionnel)"
                    value={enrollReceiptUrl || ""}
                    onChange={url => setEnrollReceiptUrl(url)}
                    accept="image/*,application/pdf"
                    bucket="courses-pdf"
                    folder="receipts"
                    placeholder="Sélectionnez ou glissez la capture du reçu..."
                    hint="Formats acceptés : PNG, JPG, JPEG, PDF (max 10MB)"
                  />
                </div>

                {/* Checkbox Envoyer Email de confirmation */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={enrollSendEmail}
                    onChange={e => setEnrollSendEmail(e.target.checked)}
                    className="size-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <Mail className="size-4 text-emerald-700 shrink-0" />
                  <span className="text-[11px] text-emerald-900 font-medium leading-tight">
                    Envoyer automatiquement l'email officiel de confirmation et d'accès à l'espace membre.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={processingId === "enroll"}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="size-4" />
                  <span>{processingId === "enroll" ? "Inscription & Envoi de l'email..." : "Valider l'Inscription et Débloquer Accès"}</span>
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
              {courses.map((c, idx) => {
                const isCurBusiness = 
                  Number(c.price) >= 140000 || 
                  String(c.slug || "").toLowerCase().includes("business") || 
                  String(c.title || "").toLowerCase().includes("business")

                return (
                  <div key={c.id || c.slug} className={`p-5 rounded-3xl border ${isCurBusiness ? "border-amber-200/90 hover:border-amber-400" : "border-blue-200/90 hover:border-blue-400"} bg-white shadow-xs backdrop-blur-xl flex flex-col justify-between space-y-4 relative group hover:shadow-md transition-all`}>
                    <div className="space-y-3 cursor-pointer" onClick={() => openCourseDetails(c)}>
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={c.thumbnail || c.poster || (isCurBusiness ? "/images/bootcamp_business_thumb.jpg" : "/images/bootcamp_pro_thumb.jpg")} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 flex-wrap">
                          <span className="bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200 shadow-xs px-2 py-0.5 rounded-md text-[10px] font-black">
                            #{c.sequence_order || idx + 1}
                          </span>
                          {isCurBusiness ? (
                            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md text-[9px] font-black uppercase shadow-xs flex items-center gap-1">
                              💼 Business
                            </span>
                          ) : (
                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase shadow-xs flex items-center gap-1">
                              🚀 Carrière
                            </span>
                          )}
                          {c.badge && (
                            <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase shadow-xs">
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
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-primary transition-colors">{c.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{c.subtitle}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-200">
                        <span className="font-extrabold text-emerald-700">{c.price}</span>
                        <span className="text-slate-400 line-through text-[10px]">{c.original_price}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      {/* Primary Button: View & Manage Learners for this Bootcamp */}
                      <button
                        onClick={() => {
                          setSelectedCourseForLearners(c)
                          setShowLearnersModal(true)
                          setLearnersSearch("")
                          setLearnersStatusFilter("all")
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl ${isCurBusiness ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white font-black text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer group/btn`}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="size-4 text-white/80" />
                          <span>Gérer les Apprenants</span>
                        </div>
                        <span className="bg-white/20 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                          {getCourseLearners(c).length} inscrit{getCourseLearners(c).length > 1 ? "s" : ""}
                        </span>
                      </button>

                      {/* Primary Actions Grid: Modifier, Dupliquer, Sessions */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => { setCourseForm(c); setShowCourseModal(true) }}
                          className="py-2 px-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Modifier les informations"
                        >
                          <Edit3 className="size-3 shrink-0" />
                          <span className="truncate">Modifier</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateCourse(c)}
                          className="py-2 px-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Dupliquer ce Bootcamp (Nouvelle Session)"
                        >
                          <Copy className="size-3 text-blue-600 shrink-0" />
                          <span className="truncate">Dupliquer</span>
                        </button>
                        {(c.id || c.slug) && (
                          <button
                            onClick={() => openCourseSessions(c)}
                            className="py-2 px-1 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-primary-foreground flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Gérer les Sessions Live"
                          >
                            <Calendar className="size-3 shrink-0" />
                            <span className="truncate">Sessions</span>
                          </button>
                        )}
                      </div>

                      {/* Secondary Toolbar: Reorder, Preview & Delete */}
                      <div className="flex items-center justify-between gap-1.5 pt-0.5">
                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-0.5">
                          <button
                            onClick={() => handleMoveCourse(c, "up")}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Déplacer vers le haut"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveCourse(c, "down")}
                            disabled={idx === courses.length - 1}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Déplacer vers le bas"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />
                          <button
                            onClick={() => openCourseDetails(c)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                            title="Voir les détails complets"
                          >
                            <Eye className="size-3.5 text-primary" />
                            <span className="text-[10px] font-bold hidden xs:inline">Aperçu</span>
                          </button>
                        </div>

                        {isSuperAdmin && c.id && (
                          <button
                            onClick={() => handleDeleteCourse(c.id!)}
                            className="py-1.5 px-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Supprimer ce Bootcamp (Super Admin)"
                          >
                            <Trash2 className="size-3.5 shrink-0" />
                            <span className="text-[10px] font-bold">Supprimer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Course Modal */}
            {showCourseModal && (
              <div 
                onClick={(e) => { if (e.target === e.currentTarget) setShowCourseModal(false) }}
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Layers className="size-5 text-primary" />
                      {courseForm.id ? "Éditer la Formation" : "Créer un Nouveau Bootcamp"}
                    </h3>
                    <button 
                      onClick={() => setShowCourseModal(false)}
                      className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* ⚡ Sélecteur Rapide de Modèles / Templates (IA & Carrière vs IA & Business) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-primary" /> Pré-remplir avec un Modèle Officiel (1 Clic)
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Champs 100% modifiables</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => applyBootcampTemplate("carriere")}
                        className="p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs flex items-center gap-1.5">
                            <span>🚀 Bootcamp IA & Carrière</span>
                            <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded">99 000 F</span>
                          </div>
                          <p className="text-[10px] text-blue-700/80 truncate mt-0.5">Cadres, professionnels & salariés</p>
                        </div>
                        <ArrowRight className="size-4 text-blue-500 group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => applyBootcampTemplate("business")}
                        className="p-3 rounded-2xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-950 text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs flex items-center gap-1.5">
                            <span>💼 Bootcamp IA & Business</span>
                            <span className="text-[10px] font-black bg-amber-600 text-white px-1.5 py-0.2 rounded">149 000 F</span>
                          </div>
                          <p className="text-[10px] text-amber-800/80 truncate mt-0.5">Entrepreneurs, dirigeants & VIP</p>
                        </div>
                        <ArrowRight className="size-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Titre du Bootcamp</label>
                        <input
                          type="text"
                          required
                          value={courseForm.title}
                          onChange={e => {
                            const val = e.target.value
                            setCourseForm(prev => ({
                              ...prev,
                              title: val,
                              slug: !prev.id ? generateCourseSlug(val) : prev.slug
                            }))
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-600 font-bold">Slug URL (Identifiant unique)</label>
                          <button
                            type="button"
                            onClick={() => setCourseForm(prev => ({ ...prev, slug: generateCourseSlug(prev.title || "") }))}
                            className="text-[10px] text-primary hover:underline font-bold"
                          >
                            Générer depuis le titre
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={courseForm.slug}
                          onChange={e => setCourseForm({ ...courseForm, slug: generateCourseSlug(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-mono text-[11px]"
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

                    {/* 🔥 Validité de l'Offre Promo */}
                    <div className="bg-white border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          🔥 Validité de l'Offre Promo
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
                            className="w-full bg-white border border-slate-200/90 shadow-xs rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 block mb-1 font-bold">🏷️ Badge / Label Promo</label>
                          <input
                            type="text"
                            placeholder="ex: Offre Promo"
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
                      <label className="text-slate-600 block mb-1 font-bold">
                        Lien Google Meet (Direct Live) <span className="text-slate-400 font-normal">(Optionnel — peut être ajouté plus tard)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://meet.google.com/... (optionnel)"
                        value={courseForm.live_meet_url || ""}
                        onChange={e => setCourseForm({ ...courseForm, live_meet_url: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400 font-mono text-[11px]"
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
              <div 
                onClick={(e) => { if (e.target === e.currentTarget) { setShowSessionModal(false); setSelectedCourseForSessions(null); setBootcampSessions([]); } }}
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
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
                        {bootcampSessions.map((s) => {
                          const dynStatus = getDynamicSessionStatus(s)
                          return (
                            <div key={s.id} className="flex items-center justify-between gap-3 bg-[#F4F6F8] rounded-xl px-4 py-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md">Session {s.session_number}</span>
                                  <span className="text-sm font-bold text-slate-800">{s.title}</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ${
                                    dynStatus === "live"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                                      : dynStatus === "completed"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-blue-50 text-blue-700 border border-blue-200"
                                  }`}>
                                    {dynStatus === "live" ? "🟢 En Direct" : dynStatus === "completed" ? "✅ Terminée" : "🕒 À venir"}
                                  </span>
                                </div>
                                {s.description && (
                                  <p className="text-[11px] text-slate-600 line-clamp-1 italic">{s.description}</p>
                                )}
                                <div className="text-[10px] text-slate-500">
                                  {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "Date non définie"}
                                  {s.meet_url && <span className="ml-2 text-primary">• Meet ✓</span>}
                                  {s.recording_url && <span className="ml-2 text-emerald-400">• Replay ✓</span>}
                                  {s.homework_title && <span className="ml-2 text-amber-400">• Devoir ✓</span>}
                                </div>
                              </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setSessionForm({ ...s })}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                                title="Modifier cette session"
                              >
                                <Edit3 className="size-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm("Supprimer cette session ?")) return
                                  await supabase.from("bootcamp_sessions").delete().eq("id", s.id!)
                                  const updatedList = bootcampSessions.filter(x => x.id !== s.id)
                                  setBootcampSessions(updatedList)
                                  setAllSessions(prev => prev.filter(x => x.id !== s.id))
                                  setDetailsSessions(prev => prev.filter(x => x.id !== s.id))
                                  
                                  const nextNum = updatedList.length > 0
                                    ? Math.max(...updatedList.map(x => Number(x.session_number) || 0), 0) + 1
                                    : 1
                                  const nextDates = getDefaultSessionDates(selectedCourseForSessions, nextNum)
                                  setSessionForm({
                                    session_number: nextNum,
                                    title: `Session ${nextNum} — `,
                                    description: "",
                                    scheduled_at: nextDates.scheduled_at,
                                    ends_at: nextDates.ends_at,
                                    meet_url: "",
                                    recording_url: "",
                                    homework_title: "",
                                    homework_description: "",
                                    homework_file_url: "",
                                    homework_deadline: "",
                                    status: "upcoming"
                                  })
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                                title="Supprimer cette session"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    </div>
                  )}

                  {/* Formulaire ajout/édition session */}
                  <div className="border-t border-slate-200 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-primary" />
                        {sessionForm.id ? `✏️ Modifier la session #${sessionForm.session_number}` : `➕ Ajouter la session #${sessionForm.session_number || (bootcampSessions.length + 1)}`}
                      </h4>
                      <div className="flex items-center gap-2">
                        {sessionForm.id && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextNum = bootcampSessions.length > 0
                                ? Math.max(...bootcampSessions.map(s => Number(s.session_number) || 0), 0) + 1
                                : 1
                              const nextDates = getDefaultSessionDates(selectedCourseForSessions, nextNum)
                              setSessionForm({
                                session_number: nextNum,
                                title: `Session ${nextNum} — `,
                                description: "",
                                scheduled_at: nextDates.scheduled_at,
                                ends_at: nextDates.ends_at,
                                meet_url: "",
                                recording_url: "",
                                homework_title: "",
                                homework_description: "",
                                homework_file_url: "",
                                homework_deadline: "",
                                status: "upcoming"
                              })
                            }}
                            className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                          >
                            + Créer une nouvelle session
                          </button>
                        )}
                        {selectedCourseForSessions?.start_date && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            Début bootcamp: <strong className="text-slate-700">{selectedCourseForSessions.start_date}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold"># Numéro de session (Auto-adapté)</label>
                        <input
                          type="number"
                          min={1}
                          value={sessionForm.session_number || (bootcampSessions.length + 1)}
                          onChange={e => {
                            const num = parseInt(e.target.value) || 1
                            setSessionForm(prev => {
                              if (prev.id) {
                                return { ...prev, session_number: num }
                              }
                              const def = getDefaultSessionDates(selectedCourseForSessions, num)
                              return {
                                ...prev,
                                session_number: num,
                                scheduled_at: def.scheduled_at,
                                ends_at: def.ends_at,
                                title: (!prev.title || prev.title.startsWith("Session ")) ? `Session ${num} — ` : prev.title
                              }
                            })
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-primary font-black text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">Titre de la session *</label>
                        <input type="text" placeholder="ex: Session 1 — Introduction à l'IA & Fondations"
                          value={sessionForm.title || ""}
                          onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400 font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-700 block mb-1.5 font-bold text-xs">
                          📝 Description &amp; Programme détaillé de la session <span className="text-slate-400 font-normal">(Optionnel)</span>
                        </label>
                        <textarea
                          rows={5}
                          placeholder={`Ex:\n- 19h00 : Introduction & Fondamentaux\n- 19h20 : Démonstration live des prompts et cas d'usage\n- 20h00 : Manipulation guidée et exercices pratiques\n- 20h45 : Questions & Réponses`}
                          value={sessionForm.description || ""}
                          onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400 text-xs min-h-[120px] resize-y leading-relaxed font-normal"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          💡 Les retours à la ligne, listes à puces et paragraphes sont fidèlement conservés et affichés dans l'espace membre.
                        </p>
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">📅 Date et heure de début <span className="text-primary font-semibold">(19h00 GMT auto)</span></label>
                        <input type="datetime-local"
                          value={sessionForm.scheduled_at ? sessionForm.scheduled_at.slice(0, 16) : ""}
                          onChange={e => {
                            const newStart = e.target.value
                            let newEnd = sessionForm.ends_at
                            if (newStart) {
                              const startD = new Date(newStart)
                              if (!isNaN(startD.getTime())) {
                                const prevStart = sessionForm.scheduled_at ? new Date(sessionForm.scheduled_at).getTime() : NaN
                                const prevEnd = sessionForm.ends_at ? new Date(sessionForm.ends_at).getTime() : NaN
                                const durationMs = (!isNaN(prevStart) && !isNaN(prevEnd) && prevEnd > prevStart) ? (prevEnd - prevStart) : (2 * 60 * 60 * 1000)
                                const endD = new Date(startD.getTime() + durationMs)
                                const pad = (n: number) => String(n).padStart(2, "0")
                                newEnd = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}T${pad(endD.getHours())}:${pad(endD.getMinutes())}`
                              }
                            }
                            setSessionForm(prev => ({
                              ...prev,
                              scheduled_at: newStart,
                              ends_at: newEnd
                            }))
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-mono text-xs cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">📅 Date et heure de fin</label>
                        <input type="datetime-local"
                          value={sessionForm.ends_at ? sessionForm.ends_at.slice(0, 16) : ""}
                          onChange={e => setSessionForm({ ...sessionForm, ends_at: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-mono text-xs cursor-pointer"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-600 block mb-1 font-bold">
                          🎬 Lien Google Meet (Direct Live) <span className="text-slate-400 font-normal">(Optionnel — peut être complété plus tard)</span>
                        </label>
                        <input type="text" placeholder="https://meet.google.com/... (optionnel)"
                          value={sessionForm.meet_url || ""}
                          onChange={e => setSessionForm({ ...sessionForm, meet_url: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400 font-mono text-[11px]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-600 block mb-1 font-bold">📺 Lien enregistrement replay <span className="text-slate-400 font-normal">(Optionnel — rend le replay disponible immédiatement)</span></label>
                        <input type="url" placeholder="https://youtube.com/... ou vimeo.com/..."
                          value={sessionForm.recording_url || ""}
                          onChange={e => setSessionForm({ ...sessionForm, recording_url: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">📚 Titre du devoir <span className="text-slate-400 font-normal">(Optionnel)</span></label>
                        <input type="text" placeholder="ex: Exercice pratique — Prompt Engineering"
                          value={sessionForm.homework_title || ""}
                          onChange={e => setSessionForm({ ...sessionForm, homework_title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-bold">⏰ Date limite du devoir <span className="text-slate-400 font-normal">(Optionnel)</span></label>
                        <input type="datetime-local"
                          value={sessionForm.homework_deadline ? sessionForm.homework_deadline.slice(0, 16) : ""}
                          onChange={e => setSessionForm({ ...sessionForm, homework_deadline: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-600 block mb-1 font-bold">Description du devoir <span className="text-slate-400 font-normal">(Optionnel)</span></label>
                        <textarea rows={2} placeholder="Consignes de l'exercice pour les étudiants..."
                          value={sessionForm.homework_description || ""}
                          onChange={e => setSessionForm({ ...sessionForm, homework_description: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400"
                        />
                      </div>
                      {/* Téléversement du Fichier du Devoir (PDF ou Image) */}
                      <div className="sm:col-span-2">
                        <FileUploadField
                          label="📄 Fichier Sujet du Devoir / Exercice (PDF ou Image - Optionnel)"
                          value={sessionForm.homework_file_url || ""}
                          onChange={url => setSessionForm({ ...sessionForm, homework_file_url: url })}
                          accept=".pdf,image/*,application/pdf"
                          bucket="resources-files"
                          folder="homeworks"
                          placeholder="https://... ou téléversez le sujet d'exercice"
                          preview="none"
                          hint="Document ou image de consigne à destination des apprenants."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-600 block mb-1 font-bold">Statut de la session</label>
                        <select
                          value={sessionForm.status || "upcoming"}
                          onChange={e => setSessionForm({ ...sessionForm, status: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-medium"
                        >
                          <option value="upcoming">🕒 À venir</option>
                          <option value="live">🟢 En Direct Maintenant</option>
                          <option value="completed">✅ Terminée</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {sessionForm.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            const nextNum = bootcampSessions.length > 0
                              ? Math.max(...bootcampSessions.map(s => Number(s.session_number) || 0), 0) + 1
                              : 1
                            const nextDates = getDefaultSessionDates(selectedCourseForSessions, nextNum)
                            setSessionForm({
                              session_number: nextNum,
                              title: `Session ${nextNum} — `,
                              description: "",
                              scheduled_at: nextDates.scheduled_at,
                              ends_at: nextDates.ends_at,
                              meet_url: "",
                              recording_url: "",
                              homework_title: "",
                              homework_description: "",
                              homework_file_url: "",
                              homework_deadline: "",
                              status: "upcoming"
                            })
                          }}
                          className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          + Nouvelle session
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!sessionForm.title || !sessionForm.scheduled_at) {
                            alert("Veuillez renseigner au minimum le Titre et la Date de début de la session.")
                            return
                          }
                          const targetCourseId = selectedCourseForSessions!.id || selectedCourseForSessions!.slug
                          const targetCourseSlug = selectedCourseForSessions!.slug
                          const chosenNum = Number(sessionForm.session_number) || (bootcampSessions.length + 1)

                          const cleanTimestamp = (val?: string | null) => {
                            if (!val || typeof val !== "string" || !val.trim()) return null
                            return val.trim()
                          }
                          const cleanText = (val?: string | null) => {
                            if (!val || typeof val !== "string" || !val.trim()) return null
                            return val.trim()
                          }

                          const payload: any = {
                            ...sessionForm,
                            course_id: targetCourseId,
                            course_slug: targetCourseSlug,
                            session_number: chosenNum,
                            scheduled_at: cleanTimestamp(sessionForm.scheduled_at),
                            ends_at: cleanTimestamp(sessionForm.ends_at),
                            homework_deadline: cleanTimestamp(sessionForm.homework_deadline),
                            homework_file_url: cleanText(sessionForm.homework_file_url),
                            homework_title: cleanText(sessionForm.homework_title),
                            homework_description: cleanText(sessionForm.homework_description),
                            description: cleanText(sessionForm.description),
                            meet_url: cleanText(sessionForm.meet_url),
                            recording_url: cleanText(sessionForm.recording_url),
                          }

                          if (sessionForm.id) {
                            const { error } = await supabase.from("bootcamp_sessions").update(payload).eq("id", sessionForm.id)
                            if (!error) {
                              const updatedObj = { ...payload, id: sessionForm.id } as BootcampSession
                              const updatedList = bootcampSessions.map(s => s.id === sessionForm.id ? updatedObj : s).sort((a,b) => (a.session_number || 0) - (b.session_number || 0))
                              setBootcampSessions(updatedList)
                              setAllSessions(prev => prev.map(s => s.id === sessionForm.id ? updatedObj : s))
                              setDetailsSessions(prev => prev.map(s => s.id === sessionForm.id ? updatedObj : s))
                              
                              const nextSessionNum = updatedList.length > 0
                                ? Math.max(...updatedList.map(s => Number(s.session_number) || 0), 0) + 1
                                : 1
                              const nextDates = getDefaultSessionDates(selectedCourseForSessions, nextSessionNum)
                              
                              setSessionForm({
                                session_number: nextSessionNum,
                                title: `Session ${nextSessionNum} — `,
                                description: "",
                                scheduled_at: nextDates.scheduled_at,
                                ends_at: nextDates.ends_at,
                                meet_url: "",
                                recording_url: "",
                                homework_title: "",
                                homework_description: "",
                                homework_file_url: "",
                                homework_deadline: "",
                                status: "upcoming"
                              })
                              showNotice(`Session #${chosenNum} mise à jour ! Formulaire prêt pour la session #${nextSessionNum}`)
                            } else {
                              alert("Erreur de mise à jour: " + error.message)
                            }
                          } else {
                            const { data, error } = await supabase.from("bootcamp_sessions").insert([payload]).select().single()
                            if (!error && data) {
                              const updatedList = [...bootcampSessions, data as BootcampSession].sort((a,b) => (a.session_number || 0) - (b.session_number || 0))
                              setBootcampSessions(updatedList)
                              setAllSessions(prev => [...prev, data as BootcampSession])
                              setDetailsSessions(prev => [...prev, data as BootcampSession])
                              
                              const nextSessionNum = updatedList.length > 0
                                ? Math.max(...updatedList.map(s => Number(s.session_number) || 0), 0) + 1
                                : 1
                              const nextDates = getDefaultSessionDates(selectedCourseForSessions, nextSessionNum)
                              
                              setSessionForm({
                                session_number: nextSessionNum,
                                title: `Session ${nextSessionNum} — `,
                                description: "",
                                scheduled_at: nextDates.scheduled_at,
                                ends_at: nextDates.ends_at,
                                meet_url: "",
                                recording_url: "",
                                homework_title: "",
                                homework_description: "",
                                homework_file_url: "",
                                homework_deadline: "",
                                status: "upcoming"
                              })
                              showNotice(`Session #${data.session_number} enregistrée avec succès ! Formulaire prêt pour la session #${nextSessionNum}`)
                            } else {
                              alert("Erreur d'ajout: " + error?.message)
                            }
                          }
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:opacity-90 shadow-md cursor-pointer"
                      >
                        {sessionForm.id ? `Mettre à jour la session #${sessionForm.session_number}` : `+ Enregistrer la session #${sessionForm.session_number || (bootcampSessions.length + 1)}`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MODAL D'APERÇU ET DÉTAILS COMPLETS DU BOOTCAMP ===== */}
            {showDetailsModal && selectedCourseDetails && (
              <div 
                onClick={(e) => { if (e.target === e.currentTarget) { setShowDetailsModal(false); setSelectedCourseDetails(null); } }}
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
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
                            {detailsSessions.map((s) => {
                              const dynStatus = getDynamicSessionStatus(s)
                              return (
                                <div key={s.id} className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200 flex items-start justify-between gap-3 text-xs">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                                        Session {s.session_number}
                                      </span>
                                      <span className="font-bold text-slate-800">{s.title}</span>
                                    </div>
                                    {s.description && (
                                      <p className="text-[11px] text-slate-600 line-clamp-2 pt-0.5">{s.description}</p>
                                    )}
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
                                    dynStatus === "live" ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                                    : dynStatus === "completed" ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-blue-50 text-blue-800 border border-blue-200"
                                  }`}>
                                    {dynStatus === "live" ? "🟢 En Direct" : dynStatus === "completed" ? "✅ Terminée" : "🕒 À venir"}
                                  </span>
                                </div>
                              )
                            })}
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
                          meet_url: "",
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

            {/* ===== MODAL GESTION DES APPRENANTS DU BOOTCAMP ===== */}
            {showLearnersModal && selectedCourseForLearners && (() => {
              const allCourseLearners = getCourseLearners(selectedCourseForLearners)
              const confirmedCount = allCourseLearners.filter(p => p.status === "confirmed").length
              const pendingCount = allCourseLearners.filter(p => p.status === "pending_verification" || p.status === "pending").length
              const totalRevenue = allCourseLearners
                .filter(p => p.status === "confirmed")
                .reduce((acc, p) => acc + (Number(p.amount) || 0), 0)

              const filteredCourseLearners = allCourseLearners.filter(p => {
                const searchLower = learnersSearch.toLowerCase().trim()
                const matchesSearch = !searchLower || 
                  (p.registrations?.full_name || "").toLowerCase().includes(searchLower) ||
                  (p.registrations?.email || "").toLowerCase().includes(searchLower) ||
                  (p.registrations?.whatsapp || "").toLowerCase().includes(searchLower) ||
                  (p.transaction_ref || "").toLowerCase().includes(searchLower)

                if (!matchesSearch) return false

                if (learnersStatusFilter === "confirmed") return p.status === "confirmed"
                if (learnersStatusFilter === "pending") return p.status === "pending_verification" || p.status === "pending"
                return true
              })

              return (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
                  <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-5 sm:p-7 max-w-5xl w-full space-y-5 max-h-[92vh] overflow-y-auto flex flex-col">
                    
                    {/* Modal Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img 
                            src={selectedCourseForLearners.thumbnail || selectedCourseForLearners.poster || "/images/bootcamp_pro_thumb.jpg"} 
                            alt={selectedCourseForLearners.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              Bootcamp Officiel
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              {selectedCourseForLearners.dates || "Session Live"}
                            </span>
                          </div>
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-800 mt-0.5">
                            Apprenants : {selectedCourseForLearners.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setManualEnrollForm({
                              courseSlug: selectedCourseForLearners.slug,
                              fullName: "",
                              email: "",
                              whatsapp: "",
                              paymentMethod: "Wave Mobile Money",
                              transactionRef: "",
                              amount: String(selectedCourseForLearners.price || "99000").replace(/[^0-9]/g, "") || "99000",
                              receiptUrl: "",
                              sendEmail: true
                            })
                            setShowManualEnrollModal(true)
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <UserPlus className="size-3.5" />
                          <span>Inscrire un Apprenant</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowLearnersModal(false)
                            setSelectedCourseForLearners(null)
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                          title="Fermer"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3">
                        <span className="text-[11px] text-slate-500 font-medium block">Total Inscrits</span>
                        <span className="font-heading text-xl font-black text-slate-800 mt-0.5 block">
                          {allCourseLearners.length}
                        </span>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3">
                        <span className="text-[11px] text-emerald-700 font-medium block">Accès Validés</span>
                        <span className="font-heading text-xl font-black text-emerald-700 mt-0.5 block">
                          {confirmedCount}
                        </span>
                      </div>
                      <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3">
                        <span className="text-[11px] text-amber-800 font-medium block">À Valider (Mobile)</span>
                        <span className="font-heading text-xl font-black text-amber-800 mt-0.5 block">
                          {pendingCount}
                        </span>
                      </div>
                      <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-3">
                        <span className="text-[11px] text-blue-700 font-medium block">Revenus Confirmés</span>
                        <span className="font-heading text-base sm:text-lg font-black text-blue-700 mt-0.5 block font-mono">
                          {totalRevenue.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Filters & Search Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <div className="relative w-full sm:w-80">
                        <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Rechercher par nom, email, réf..."
                          value={learnersSearch}
                          onChange={e => setLearnersSearch(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-primary placeholder:text-slate-400"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <button
                          onClick={() => setLearnersStatusFilter("all")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            learnersStatusFilter === "all"
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Tous ({allCourseLearners.length})
                        </button>
                        <button
                          onClick={() => setLearnersStatusFilter("confirmed")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            learnersStatusFilter === "confirmed"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          Validés ({confirmedCount})
                        </button>
                        <button
                          onClick={() => setLearnersStatusFilter("pending")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            learnersStatusFilter === "pending"
                              ? "bg-amber-600 text-white shadow-xs"
                              : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                          }`}
                        >
                          En attente ({pendingCount})
                        </button>
                      </div>
                    </div>

                    {/* Learners Table View */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs flex-1">
                      <div className="overflow-x-auto max-h-[50vh]">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-[#F8FAFC] text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                              <th className="p-3.5">Apprenant</th>
                              <th className="p-3.5">WhatsApp</th>
                              <th className="p-3.5">Date</th>
                              <th className="p-3.5">Montant &amp; Réf</th>
                              <th className="p-3.5 text-center">Preuve (Reçu)</th>
                              <th className="p-3.5">Statut</th>
                              <th className="p-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredCourseLearners.map(p => {
                              const receiptUrl = getPaymentReceiptUrl(p)
                              const cleanPhone = (p.registrations?.whatsapp || "").replace(/[^0-9]/g, "")
                              const initials = (p.registrations?.full_name || "A").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                              const isConfirmed = p.status === "confirmed"
                              const isPending = p.status === "pending_verification" || p.status === "pending"

                              return (
                                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                  {/* Apprenant */}
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className="size-8 rounded-xl bg-primary/15 text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 border border-primary/20">
                                        {initials}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-bold text-slate-800 truncate">
                                          {p.registrations?.full_name || "Apprenant"}
                                        </div>
                                        <div className="text-[11px] text-slate-500 truncate">
                                          {p.registrations?.email || "Email non renseigné"}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* WhatsApp */}
                                  <td className="p-3.5">
                                    {cleanPhone ? (
                                      <a
                                        href={`https://wa.me/${cleanPhone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[11px]"
                                        title="Ouvrir WhatsApp"
                                      >
                                        <MessageCircle className="size-3 text-emerald-600" />
                                        <span>{p.registrations?.whatsapp}</span>
                                      </a>
                                    ) : (
                                      <span className="text-slate-400 text-[11px]">N/A</span>
                                    )}
                                  </td>

                                  {/* Date */}
                                  <td className="p-3.5 text-[11px] text-slate-500 font-mono">
                                    {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                                  </td>

                                  {/* Montant & Ref */}
                                  <td className="p-3.5">
                                    <div className="font-mono font-bold text-slate-800">
                                      {p.amount ? Number(p.amount).toLocaleString("fr-FR") : "0"} {p.currency || "XOF"}
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                                      <span className="truncate max-w-[120px]">{p.transaction_ref || p.method}</span>
                                    </div>
                                  </td>

                                  {/* Preuve Capture (Reçu) */}
                                  <td className="p-3.5 text-center">
                                    {receiptUrl ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewScreenshotUrl(receiptUrl)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/30 font-bold text-[10px] transition-all cursor-pointer shadow-2xs"
                                        title="Voir la capture d'écran du paiement"
                                      >
                                        <ImageIcon className="size-3.5" />
                                        <span>Voir Capture</span>
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">Aucune</span>
                                    )}
                                  </td>

                                  {/* Statut */}
                                  <td className="p-3.5">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                      isConfirmed 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                        : isPending 
                                          ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse" 
                                          : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}>
                                      {isConfirmed ? <CheckCircle2 className="size-3" /> : isPending ? <Clock className="size-3" /> : <XCircle className="size-3" />}
                                      <span>{isConfirmed ? "Actif / Payé" : isPending ? "À Valider" : p.status}</span>
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="p-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Bouton Valider l'accès si en attente */}
                                      {!isConfirmed && (
                                        <button
                                          type="button"
                                          onClick={() => handlePaymentStatus(p.id, "confirmed")}
                                          disabled={processingId === p.id}
                                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                                          title="Valider le paiement et activer les accès au Bootcamp"
                                        >
                                          {processingId === p.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                                          <span>{processingId === p.id ? "Validation..." : "Valider"}</span>
                                        </button>
                                      )}

                                      {/* Bouton Modifier détails & référence */}
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditPayment(p)}
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                        title="Modifier la référence ou le paiement"
                                      >
                                        <Edit3 className="size-3.5" />
                                      </button>

                                      {/* Bouton Désinscrire / Supprimer */}
                                      <button
                                        type="button"
                                        onClick={() => handleUnenrollLearner(p, selectedCourseForLearners.slug)}
                                        disabled={processingId === p.id}
                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                                        title="Désinscrire cet apprenant du Bootcamp"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}

                            {filteredCourseLearners.length === 0 && (
                              <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">
                                  <Users className="size-8 mx-auto text-slate-400 mb-2" />
                                  <p className="font-bold text-slate-800 text-xs">Aucun apprenant trouvé pour cette sélection.</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">Cliquez sur &quot;Inscrire un Apprenant&quot; pour ajouter un participant manuellement.</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })()}

            {/* ===== MODAL INSCRIPTION MANUELLE D'UN APPRENANT ===== */}
            {showManualEnrollModal && selectedCourseForLearners && (
              <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
                      <UserPlus className="size-5 text-emerald-600" />
                      Inscrire un Apprenant au Bootcamp
                    </h3>
                    <button onClick={() => setShowManualEnrollModal(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="size-4" />
                    </button>
                  </div>

                  <form onSubmit={handleManualEnrollLearner} className="space-y-3.5 text-xs">
                    {/* Bootcamp concerné */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Bootcamp concerné *</label>
                      <select
                        value={manualEnrollForm.courseSlug || selectedCourseForLearners.slug}
                        onChange={e => setManualEnrollForm({ ...manualEnrollForm, courseSlug: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:bg-white outline-none transition-colors cursor-pointer"
                      >
                        {courses.map(c => (
                          <option key={c.id || c.slug} value={c.slug}>
                            {c.title} {c.price ? `(${c.price})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nom Complet Input with Suggestions */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 font-bold">Nom complet de l'apprenant *</label>
                        {allLearnerSuggestions.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {allLearnerSuggestions.length} membre{allLearnerSuggestions.length > 1 ? "s" : ""} enregistré{allLearnerSuggestions.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Jean Dupont"
                        value={manualEnrollForm.fullName}
                        onFocus={() => setShowLearnerNameSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowLearnerNameSuggestions(false), 200)}
                        onChange={e => {
                          setManualEnrollForm({ ...manualEnrollForm, fullName: e.target.value })
                          setShowLearnerNameSuggestions(true)
                        }}
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                      />

                      {/* Name Suggestions Dropdown */}
                      {showLearnerNameSuggestions && filteredNameSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                            <span>Membres suggérés</span>
                            <button
                              type="button"
                              onClick={() => setShowLearnerNameSuggestions(false)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                          {filteredNameSuggestions.map((l, idx) => {
                            const initials = (l.fullName || l.email || "A").substring(0, 2).toUpperCase()
                            return (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() => handleSelectLearnerSuggestion(l)}
                                className="w-full text-left px-3 py-2 hover:bg-emerald-50/70 transition-colors flex items-center justify-between gap-2.5 cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="size-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-200">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-800 text-xs truncate group-hover:text-emerald-900">
                                      {l.fullName || "Sans nom renseigné"}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono truncate">
                                      {l.email}
                                    </div>
                                  </div>
                                </div>
                                {l.whatsapp && (
                                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                    {l.whatsapp}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Email Input with Suggestions and Auto-Fill */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 font-bold">Adresse Email de connexion *</label>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Sparkles className="size-3" /> Remplissage automatique
                        </span>
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="jean.dupont@email.com"
                        value={manualEnrollForm.email}
                        onFocus={() => setShowLearnerEmailSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowLearnerEmailSuggestions(false), 200)}
                        onChange={e => {
                          const val = e.target.value
                          setManualEnrollForm(prev => {
                            // Auto-match if exact email typed
                            const matched = allLearnerSuggestions.find(l => l.email.toLowerCase() === val.toLowerCase().trim())
                            if (matched) {
                              return {
                                ...prev,
                                email: val,
                                fullName: matched.fullName || prev.fullName,
                                whatsapp: matched.whatsapp || prev.whatsapp
                              }
                            }
                            return { ...prev, email: val }
                          })
                          setShowLearnerEmailSuggestions(true)
                        }}
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-emerald-600 focus:bg-white font-mono transition-colors"
                      />

                      {/* Email Suggestions Dropdown */}
                      {showLearnerEmailSuggestions && filteredEmailSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                            <span>Apprenants suggérés (Cliquer pour préremplir)</span>
                            <button
                              type="button"
                              onClick={() => setShowLearnerEmailSuggestions(false)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                          {filteredEmailSuggestions.map((l, idx) => {
                            const initials = (l.fullName || l.email || "A").substring(0, 2).toUpperCase()
                            return (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() => handleSelectLearnerSuggestion(l)}
                                className="w-full text-left px-3 py-2 hover:bg-emerald-50/70 transition-colors flex items-center justify-between gap-2.5 cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="size-7 rounded-lg bg-primary/20 text-slate-900 font-bold text-[10px] flex items-center justify-center shrink-0 border border-primary/30">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-800 text-xs truncate group-hover:text-emerald-900">
                                      {l.fullName || "Utilisateur sans nom"}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono truncate">
                                      {l.email}
                                    </div>
                                  </div>
                                </div>
                                {l.whatsapp && (
                                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                    {l.whatsapp}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-700 block mb-1 font-bold">N° WhatsApp (avec indicatif)</label>
                        <input
                          type="tel"
                          placeholder="+226 75 00 00 00"
                          value={manualEnrollForm.whatsapp}
                          onChange={e => setManualEnrollForm({ ...manualEnrollForm, whatsapp: e.target.value })}
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 block mb-1 font-bold">Montant réglé (FCFA)</label>
                        <input
                          type="number"
                          placeholder="99000"
                          value={manualEnrollForm.amount}
                          onChange={e => setManualEnrollForm({ ...manualEnrollForm, amount: e.target.value })}
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-emerald-600 font-mono"
                        />
                      </div>
                    </div>

                    {/* Mode de règlement & Référence */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Moyen de paiement (Optionnel)</label>
                        <select
                          value={manualEnrollForm.paymentMethod}
                          onChange={e => setManualEnrollForm({ ...manualEnrollForm, paymentMethod: e.target.value })}
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:bg-white outline-none transition-colors cursor-pointer"
                        >
                          <option value="Wave Mobile Money">Wave</option>
                          <option value="Orange Money">Orange Money</option>
                          <option value="Moov Money">Moov Money</option>
                          <option value="Virement Bancaire">Virement Bancaire</option>
                          <option value="Espèces / Cash">Espèces / Cash</option>
                          <option value="Offert / Gratuit">Offert / Gratuit</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Référence Transaction (Optionnel)</label>
                        <input
                          type="text"
                          placeholder="ex: Ref Wave, OM, N° Virement"
                          value={manualEnrollForm.transactionRef}
                          onChange={e => setManualEnrollForm({ ...manualEnrollForm, transactionRef: e.target.value })}
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:bg-white outline-none font-mono transition-colors"
                        />
                      </div>
                    </div>

                    {/* Preuve de paiement Upload */}
                    <div>
                      <FileUploadField
                        label="Preuve de virement / Reçu Mobile Money (Optionnel)"
                        value={manualEnrollForm.receiptUrl || ""}
                        onChange={url => setManualEnrollForm(prev => ({ ...prev, receiptUrl: url }))}
                        accept="image/*,application/pdf"
                        bucket="courses-pdf"
                        folder="receipts"
                        placeholder="Sélectionnez ou glissez la capture du reçu..."
                        hint="Formats acceptés : PNG, JPG, JPEG, PDF (max 10MB)"
                      />
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={manualEnrollForm.sendEmail}
                        onChange={e => setManualEnrollForm({ ...manualEnrollForm, sendEmail: e.target.checked })}
                        className="size-4 text-emerald-600 rounded"
                      />
                      <span className="text-[11px] text-emerald-900 font-medium leading-tight">
                        Envoyer automatiquement l'email officiel de confirmation et d'accès à l'espace membre.
                      </span>
                    </label>

                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowManualEnrollModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={savingManualEnroll}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <UserPlus className="size-4" />
                        <span>{savingManualEnroll ? "Inscription en cours..." : "Confirmer l'inscription"}</span>
                      </button>
                    </div>
                  </form>
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
              <div 
                onClick={(e) => { if (e.target === e.currentTarget) setShowResourceModal(false) }}
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
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
                    const defaultCourse = courses.find(c => c.status === "published" || (c as any).status === "open" || (c as any).is_active) || courses[0]
                    setCohortForm({
                      courseId: defaultCourse?.id || defaultCourse?.slug || "",
                      startDate: new Date().toISOString().split("T")[0],
                      sessionCount: defaultCourse?.session_count && Number(defaultCourse.session_count) > 0 ? Number(defaultCourse.session_count) : 6,
                      startTime: "19:00",
                      durationMinutes: 120
                    })
                    setShowCohortModal(true)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-slate-950 font-black text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
                >
                  <Zap className="size-4" />
                  Générer une Cohorte
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

            {/* Modal: Generate Cohort (Configurable Days / Sessions) */}
            {showCohortModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
                      <Zap className="size-5 text-[#D4AF37]" />
                      Générer une Cohorte de Sessions
                    </h3>
                    <button onClick={() => setShowCohortModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">Sélectionner le Bootcamp *</label>
                      <select
                        value={cohortForm.courseId}
                        onChange={(e) => {
                          const selectedC = courses.find(c => c.id === e.target.value || c.slug === e.target.value)
                          setCohortForm({ 
                            ...cohortForm, 
                            courseId: e.target.value,
                            sessionCount: selectedC?.session_count && Number(selectedC.session_count) > 0 ? Number(selectedC.session_count) : (cohortForm.sessionCount || 6)
                          })
                        }}
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold outline-none focus:border-primary focus:bg-white placeholder:text-slate-500 cursor-pointer"
                      >
                        {courses.map(c => (
                          <option key={c.id || c.slug} value={c.id || c.slug}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-700 block mb-1 font-bold">Nombre de Sessions / Jours *</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          required
                          value={cohortForm.sessionCount}
                          onChange={(e) => setCohortForm({ ...cohortForm, sessionCount: parseInt(e.target.value) || 1 })}
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold outline-none focus:border-primary focus:bg-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Par défaut : 6 sessions</span>
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 font-bold">Heure de début (GMT) *</label>
                        <input
                          type="time"
                          required
                          value={cohortForm.startTime || "19:00"}
                          onChange={(e) => setCohortForm({ ...cohortForm, startTime: e.target.value })}
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold outline-none focus:border-primary focus:bg-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Heure de direct</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">Date du Premier Jour (Lancement de la cohorte) *</label>
                      <input
                        type="date"
                        required
                        value={cohortForm.startDate}
                        onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold outline-none focus:border-primary focus:bg-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-1 text-[11px] text-amber-900 leading-relaxed">
                      <p>
                        ✨ Cette action va créer automatiquement <strong>{cohortForm.sessionCount || 6} sessions consécutives</strong> (du Jour 1 au Jour {cohortForm.sessionCount || 6} à {cohortForm.startTime || "19:00"} GMT) et enregistrer ce format pour le Bootcamp sélectionné.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCohortModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateCohort(
                          cohortForm.courseId,
                          cohortForm.startDate,
                          cohortForm.sessionCount,
                          cohortForm.startTime,
                          cohortForm.durationMinutes
                        )}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-slate-950 font-black shadow-lg shadow-[#D4AF37]/20 hover:opacity-90 cursor-pointer"
                      >
                        Générer les {cohortForm.sessionCount || 6} Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Modal */}
            {showLiveModal && (
              <div 
                onClick={(e) => { if (e.target === e.currentTarget) setShowLiveModal(false) }}
                className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
              >
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 max-w-lg w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Video className="size-5 text-primary" />
                      Programmer un bootcamp / Session Live
                    </h3>
                    <button
                      onClick={() => setShowLiveModal(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveLive} className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Formation / Bootcamp associé</label>
                      <select
                        value={liveForm.course_slug || courses[0]?.slug || ""}
                        onChange={e => {
                          const sel = courses.find(c => c.slug === e.target.value || c.id === e.target.value)
                          setLiveForm({
                            ...liveForm,
                            course_slug: sel?.slug || e.target.value,
                            course_id: sel?.id || ""
                          })
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-semibold"
                      >
                        {courses.map(c => (
                          <option key={c.id || c.slug} value={c.slug || c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Titre de la session / Bootcamp</label>
                      <input
                        type="text"
                        required
                        value={liveForm.title || ""}
                        onChange={e => setLiveForm({ ...liveForm, title: e.target.value })}
                        placeholder="Ex: 🚀 Session 1 : Fondamentaux & Prompts Avancés"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">
                        Lien de la Réunion Google Meet <span className="text-slate-400 font-normal">(Optionnel)</span>
                      </label>
                      <input
                        type="text"
                        value={liveForm.meet_url || ""}
                        onChange={e => setLiveForm({ ...liveForm, meet_url: e.target.value })}
                        placeholder="https://meet.google.com/... (optionnel, peut être ajouté plus tard)"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-400 font-mono text-[11px]"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Laissez vide si le lien n'est pas encore défini.
                      </p>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">Date & Heure du Direct (GMT)</label>
                      <input
                        type="datetime-local"
                        required
                        value={liveForm.scheduled_at ? liveForm.scheduled_at.slice(0, 16) : ""}
                        onChange={e => setLiveForm({ ...liveForm, scheduled_at: new Date(e.target.value).toISOString() })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary placeholder:text-slate-500 font-medium"
                      />
                    </div>

                    <FileUploadField
                      label="Replay Vidéo HD (Optionnel - Laisser vide si direct à venir)"
                      value={liveForm.replay_url || ""}
                      onChange={url => setLiveForm({ ...liveForm, replay_url: url })}
                      accept="video/*,image/*,.mp4,.webm"
                      bucket="course-replays"
                      folder="replays"
                      placeholder="https://youtube.com/... ou URL du replay HD (Optionnel)"
                      preview="none"
                      hint="Optionnel. Si non fourni, le bouton de replay ne s'affichera pas dans les détails."
                    />

                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowLiveModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={processingId === "save_live"}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:opacity-90 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === "save_live" ? (
                          <span>Enregistrement en cours...</span>
                        ) : (
                          <span>Enregistrer la session</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: MASTERCLASSES (SESSIONS À VENIR & DIRECT LIVE) */}
        {activeTab === "masterclasses" && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Masterclasses Sub-Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("masterclasses")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-primary text-slate-950 shadow-sm cursor-pointer"
                >
                  <Radio className="size-3.5 text-rose-500" />
                  <span>Sessions à Venir</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px] font-extrabold">
                    {upcomingMasterclasses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclasses_past")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Clock className="size-3.5" />
                  <span>Sessions Passées</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {pastMasterclasses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclass_participants")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Users className="size-3.5" />
                  <span>Participants & Inscrits</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {masterclassParticipants.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclass_replays")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Video className="size-3.5" />
                  <span>Replays</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {masterclassReplays.length}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddMasterclass}
                  className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Programmer une Masterclass</span>
                </button>
              </div>
            </div>

            {/* Section A: Prochaine Masterclass Active (Diffusée aux apprenants) */}
            {masterclassSession && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-primary/10 border border-amber-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                      Prochain Direct Diffusé sur le Site
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditMasterclass(masterclassSession)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="size-3.5" />
                      <span>Modifier cette session</span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-3">
                    <h3 className="font-heading text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      {masterclassSession.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {masterclassSession.description || "Session interactive en direct animée par Alfred Dah."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <Calendar className="size-3.5 text-primary shrink-0" />
                        <span>{masterclassSession.dateDisplay || (masterclassSession.scheduledAt ? new Date(masterclassSession.scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "Date à définir")}</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <Users className="size-3.5 text-blue-600 shrink-0" />
                        <span><strong>{masterclassCounts[masterclassSession.id] || masterclassCounts.current_live || masterclassCounts.mc_default || 0}</strong> apprenants inscrits</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span>Formateur : <strong>{masterclassSession.instructor || "Alfred Dah"}</strong></span>
                      </div>
                    </div>

                    {/* Liens d'accès direct */}
                    <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
                      <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                          <span className="flex items-center gap-1.5">
                            <MessageCircle className="size-3.5 text-emerald-600" />
                            Groupe WhatsApp
                          </span>
                          {masterclassSession.whatsappGroupUrl ? (
                            <a href={masterclassSession.whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1 text-[10px]">
                              Tester <ExternalLink className="size-2.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-amber-600">Non renseigné</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {masterclassSession.whatsappGroupUrl || "Ajoutez le lien du groupe WhatsApp pour les apprenants"}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-blue-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-blue-800">
                          <span className="flex items-center gap-1.5">
                            <Video className="size-3.5 text-blue-600" />
                            Google Meet (Direct Live)
                          </span>
                          {masterclassSession.youtubeLiveUrl ? (
                            <a href={masterclassSession.youtubeLiveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline flex items-center gap-1 text-[10px]">
                              Tester <ExternalLink className="size-2.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-amber-600">Non renseigné</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {masterclassSession.youtubeLiveUrl || "https://meet.google.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side Thumbnail & Broadcast */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="relative min-h-[160px] max-h-[220px] rounded-xl bg-slate-950 overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center">
                      {masterclassSession.thumbnailUrl ? (
                        <>
                          <div
                            className="absolute inset-0 bg-cover bg-center blur-lg opacity-30 scale-110 pointer-events-none"
                            style={{ backgroundImage: `url(${masterclassSession.thumbnailUrl})` }}
                          />
                          <img
                            src={masterclassSession.thumbnailUrl}
                            alt={masterclassSession.title}
                            className="relative z-10 w-full h-auto max-h-[220px] object-contain mx-auto"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full min-h-[160px] flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-4 text-center">
                          <Radio className="size-8 text-rose-500 mb-1" />
                          <span className="text-[10px] font-semibold">Affiche non définie</span>
                        </div>
                      )}
                      <span className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                        {masterclassSession.duration || "1h 30min"}
                      </span>
                    </div>

                    {/* Invitation Broadcast Button */}
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                        <span>✉️ Inviter tous les membres</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={sendingPlatformInvite}
                          onClick={() => handleSendPlatformInvite(false)}
                          className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Mail className="size-3" />
                          <span>{sendingPlatformInvite ? "Envoi..." : "Diffuser email"}</span>
                        </button>
                        <button
                          type="button"
                          disabled={sendingPlatformInvite}
                          onClick={() => handleSendPlatformInvite(true)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-sky-300 text-slate-700 text-xs font-semibold hover:bg-sky-100 cursor-pointer"
                          title="Envoyer un email test à mon adresse"
                        >
                          🧪 Test
                        </button>
                      </div>
                      {platformInviteStatus && (
                        <p className="text-[10px] font-bold text-slate-700">{platformInviteStatus}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section B: Liste de Toutes les Masterclasses Programmées à Venir */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="size-5 text-primary" />
                    <span>Planning des Masterclasses à Venir ({upcomingMasterclasses.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Préconfigurez vos prochaines sessions à l'avance pour planifier vos thématiques et inscriptions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddMasterclass}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>+ Programmer une autre session</span>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingMasterclasses.map((s: any, idx: number) => {
                  const participantCount = masterclassCounts[s.id] || (idx === 0 ? (masterclassCounts.current_live || masterclassCounts.mc_default || 0) : 0)
                  return (
                    <div
                      key={s.id || idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="relative min-h-[150px] max-h-[200px] bg-slate-950 overflow-hidden flex items-center justify-center">
                        {s.thumbnailUrl ? (
                          <>
                            <div
                              className="absolute inset-0 bg-cover bg-center blur-lg opacity-30 scale-110 pointer-events-none"
                              style={{ backgroundImage: `url(${s.thumbnailUrl})` }}
                            />
                            <img
                              src={s.thumbnailUrl}
                              alt={s.title}
                              className="relative z-10 w-full h-auto max-h-[200px] object-contain mx-auto"
                            />
                          </>
                        ) : (
                          <div className="w-full h-full min-h-[150px] flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-slate-400 p-4 text-center">
                            <Radio className="size-8 text-rose-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-300">Masterclass #{idx + 1}</span>
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                          {s.duration || "1h 30min"}
                        </span>
                        <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-primary text-slate-950 text-[10px] font-black uppercase">
                          {idx === 0 ? "🔴 Prochaine Session" : `Session #${idx + 1}`}
                        </span>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-500 mb-1">
                            <span className="flex items-center gap-1 text-primary">
                              <Calendar className="size-3 shrink-0" />
                              {s.dateDisplay || (s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Date à venir")}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold">
                              👥 {participantCount} inscrits
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{s.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{s.description || "Session interactive en direct."}</p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200 text-[11px]">
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Formateur : <strong>{s.instructor || "Alfred Dah"}</strong></span>
                            <button
                              type="button"
                              onClick={() => handleToggleMasterclassStatus(s)}
                              className="text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                            >
                              Marquer comme passée
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMasterclassFilter(s.id)
                                setActiveTab("masterclass_participants")
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold cursor-pointer"
                            >
                              Voir les inscrits
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditMasterclass(s)}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                                title="Modifier"
                              >
                                <Edit3 className="size-3.5" />
                              </button>

                              {upcomingMasterclasses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMasterclassSession(s.id)}
                                  className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MASTERCLASSES PASSÉES & HISTORIQUE */}
        {activeTab === "masterclasses_past" && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Masterclasses Sub-Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("masterclasses")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Radio className="size-3.5 text-rose-500" />
                  <span>Sessions à Venir</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {upcomingMasterclasses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclasses_past")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-primary text-slate-950 shadow-sm cursor-pointer"
                >
                  <Clock className="size-3.5" />
                  <span>Sessions Passées</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px] font-extrabold">
                    {pastMasterclasses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclass_participants")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Users className="size-3.5" />
                  <span>Participants & Inscrits</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {masterclassParticipants.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclass_replays")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Video className="size-3.5" />
                  <span>Replays</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {masterclassReplays.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Sessions Passées Table & Cards */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="size-5 text-slate-600" />
                    <span>Historique des Masterclasses Passées ({pastMasterclasses.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Consultez les sessions achevées, convertissez-les en Replay vidéo pour la vidéothèque publique ou recontactez leurs participants.
                  </p>
                </div>
              </div>

              {pastMasterclasses.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Clock className="size-10 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">Aucune session passée archivée pour le moment.</p>
                  <p className="text-[11px] text-slate-400">Lorsqu'une date de direct est passée ou marquée comme achevée, elle apparaîtra ici.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pastMasterclasses.map((s: any) => {
                    const participantCount = masterclassCounts[s.id] || 0
                    return (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                      >
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-500 mb-1">
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                🕰️ Session passée
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold">
                                👥 {participantCount} participants
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{s.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Diffusée le : <strong>{s.dateDisplay || (s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString("fr-FR") : "—")}</strong>
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{s.description || "Session passée."}</p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-200 text-[11px]">
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleConvertPastSessionToReplay(s)}
                                className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                title="Créer un Replay public à partir de cette session"
                              >
                                <Play className="size-3 fill-white" />
                                <span>Publier en Replay</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMasterclassFilter(s.id)
                                  setActiveTab("masterclass_participants")
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold cursor-pointer"
                                title="Voir les apprenants qui étaient inscrits"
                              >
                                Inscrits
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleMasterclassStatus(s)}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                                title="Reprogrammer en session à venir"
                              >
                                <RefreshCw className="size-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteMasterclassSession(s.id)}
                                className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MASTERCLASSES PARTICIPANTS (APPRENANTS INSCRITS & EMAILING CIBLÉ) */}
        {activeTab === "masterclass_participants" && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Masterclasses Sub-Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("masterclasses")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Radio className="size-3.5 text-rose-500" />
                  <span>Sessions à Venir</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {upcomingMasterclasses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclasses_past")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Clock className="size-3.5" />
                  <span>Sessions Passées</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {pastMasterclasses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclass_participants")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-primary text-slate-950 shadow-sm cursor-pointer"
                >
                  <Users className="size-3.5" />
                  <span>Participants & Inscrits</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px] font-extrabold">
                    {masterclassParticipants.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclass_replays")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Video className="size-3.5" />
                  <span>Replays</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {masterclassReplays.length}
                  </span>
                </button>
              </div>

              {isFounderSamba && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollTargetSessionId(selectedMasterclassFilter !== "all" ? selectedMasterclassFilter : (masterclassSession?.id || "current_live"))
                      setSelectedUserIdsToEnroll([])
                      setEnrollSearchQuery("")
                      setShowEnrollUsersModal(true)
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                    title="Inscrire des apprenants de la plateforme non encore inscrits"
                  >
                    <UserPlus className="size-3.5" />
                    <span>Inscrire des apprenants ({eligibleUnenrolledUsers.length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Registered Participants Table & Targeted Emailing */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              
              {/* 1. Card Top Bar : Title & Primary Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/20 text-slate-900 flex items-center justify-center font-bold">
                      <Users className="size-4 text-slate-900" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-slate-800">
                      Apprenants Inscrits aux Masterclasses
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/15 text-slate-900 border border-primary/30">
                      {filteredMasterclassParticipants.length} {filteredMasterclassParticipants.length > 1 ? "inscrits" : "inscrit"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pl-10.5">
                    Gérez les inscrits, filtrez par session spécifique et diffusez des communications ciblées.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  {isFounderSamba && (
                    <button
                      type="button"
                      onClick={() => {
                        setEnrollTargetSessionId(selectedMasterclassFilter !== "all" ? selectedMasterclassFilter : (masterclassSession?.id || "current_live"))
                        setSelectedUserIdsToEnroll([])
                        setEnrollSearchQuery("")
                        setShowEnrollUsersModal(true)
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Inscrire des apprenants de la plateforme non encore inscrits"
                    >
                      <UserPlus className="size-3.5" />
                      <span>Inscrire des apprenants ({eligibleUnenrolledUsers.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setTargetedEmailTarget(selectedMasterclassFilter === "all" ? "current_live" : selectedMasterclassFilter)
                      setTargetedEmailSubject("")
                      setTargetedEmailCustomMessage("")
                      setShowTargetedEmailModal(true)
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Envoyer un email ciblé aux apprenants de cette Masterclass"
                  >
                    <Mail className="size-3.5" />
                    <span>Contacter les inscrits ({filteredMasterclassParticipants.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={refreshMasterclassData}
                    disabled={refreshingMasterclass}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Actualiser la liste en direct"
                  >
                    <RefreshCw className={`size-3.5 ${refreshingMasterclass ? "animate-spin text-primary" : ""}`} />
                    <span>Actualiser</span>
                  </button>
                </div>
              </div>

              {/* 2. Filter & Search Toolbar (Dedicated Clean Row) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left: Filter and CSV Export */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                    <Filter className="size-3.5 text-slate-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-600 shrink-0">Filtrer par session :</span>
                    <select
                      value={selectedMasterclassFilter}
                      onChange={e => setSelectedMasterclassFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer pr-2 max-w-[260px] truncate"
                    >
                      <option value="all">🌐 Toutes les Masterclasses ({masterclassParticipants.length})</option>
                      
                      {upcomingMasterclasses.length > 0 && (
                        <optgroup label="🔴 Sessions à Venir">
                          {upcomingMasterclasses.map((s, idx) => (
                            <option key={s.id || idx} value={s.id}>
                              {idx === 0 ? "🔴 Prochain direct" : "📅 Session"} : {s.title.length > 28 ? s.title.substring(0, 28) + '...' : s.title} ({masterclassCounts[s.id] || (idx === 0 ? (masterclassCounts.current_live || masterclassCounts.mc_default || 0) : 0)})
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {pastMasterclasses.length > 0 && (
                        <optgroup label="🕰️ Sessions Passées">
                          {pastMasterclasses.map(s => (
                            <option key={s.id} value={s.id}>
                              🕰️ {s.title.length > 28 ? s.title.substring(0, 28) + '...' : s.title} ({masterclassCounts[s.id] || 0})
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {masterclassReplays.length > 0 && (
                        <optgroup label="📼 Replays Vidéo">
                          {masterclassReplays.map(r => (
                            <option key={r.id} value={r.id}>
                              📼 {r.title.length > 28 ? r.title.substring(0, 28) + '...' : r.title} ({masterclassCounts[r.id] || 0})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportMasterclassParticipants}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="size-3.5" />
                    <span>Exporter CSV</span>
                  </button>
                </div>

                {/* Right: Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={masterclassSearch}
                    onChange={e => setMasterclassSearch(e.target.value)}
                    placeholder="Rechercher par nom, email, tél, pays..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-primary shadow-2xs"
                  />
                </div>
              </div>

              {/* 3. Structured Data Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-600">
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Nom Complet</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Adresse Email</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">WhatsApp</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Pays</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Profession / Secteur</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Masterclass Ciblée</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Date Inscription</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center whitespace-nowrap">Statut</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {filteredMasterclassParticipants.map((p) => {
                      const isLiveSession = p.masterclass_id === "current_live" || p.masterclass_id === "mc_default" || !p.masterclass_id || (p.masterclass_title && p.masterclass_title.includes(masterclassSession.title))
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{p.full_name || "—"}</td>
                          <td className="py-3 px-4 font-mono text-primary font-semibold whitespace-nowrap">{p.email}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {p.whatsapp && !p.whatsapp.startsWith("wa_") ? (
                              <a
                                href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                title="Ouvrir la conversation WhatsApp"
                              >
                                <MessageCircle className="size-3 text-emerald-600 shrink-0" />
                                <span>{p.whatsapp}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 font-mono text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800">
                              <span className="text-base leading-none">{getCountryFlag(p.country)}</span>
                              <span>{getCountryName(p.country)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {p.sector && p.sector !== "—" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                <Briefcase className="size-3 text-slate-500 shrink-0" />
                                <span className="truncate max-w-[180px]" title={p.sector}>{p.sector}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Non spécifié</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isLiveSession ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-900 border border-amber-300 max-w-[260px] truncate" title={p.masterclass_title || masterclassSession.title}>
                                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                <span className="truncate">{p.masterclass_title || "Session Direct Actuelle"}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-900 border border-purple-300 max-w-[260px] truncate" title={p.masterclass_title}>
                                <Video className="size-3 text-purple-600 shrink-0" />
                                <span className="truncate">{p.masterclass_title}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(p.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-200">
                              {p.status || "inscrit"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteMasterclassParticipant(p.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Supprimer l'inscription"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}

                    {filteredMasterclassParticipants.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users className="size-8 text-slate-300" />
                            <p className="text-sm font-medium">
                              {selectedMasterclassFilter !== "all" 
                                ? `Aucun apprenant inscrit pour cette Masterclass spécifique.` 
                                : `Aucun apprenant inscrit pour le moment.`}
                            </p>
                            {isFounderSamba && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEnrollTargetSessionId(selectedMasterclassFilter !== "all" ? selectedMasterclassFilter : (masterclassSession?.id || "current_live"))
                                  setSelectedUserIdsToEnroll([])
                                  setEnrollSearchQuery("")
                                  setShowEnrollUsersModal(true)
                                }}
                                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                              >
                                <UserPlus className="size-3.5" />
                                <span>Inscrire des apprenants ({eligibleUnenrolledUsers.length} disponibles)</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Inscription Manuelle d'un Apprenant */}
              {isManualAddParticipantOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <UserPlus className="size-5 text-primary" />
                        <h4 className="font-heading text-sm font-bold text-slate-800">
                          Inscrire Manuellement un Apprenant
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsManualAddParticipantOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <form onSubmit={handleManualAddMasterclassParticipant} className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Masterclass Ciblée *</label>
                        <select
                          value={manualParticipantForm.masterclassId}
                          onChange={e => setManualParticipantForm({ ...manualParticipantForm, masterclassId: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-semibold"
                        >
                          <optgroup label="🔴 Sessions à Venir">
                            {upcomingMasterclasses.map(s => (
                              <option key={s.id} value={s.id}>🔴 {s.title}</option>
                            ))}
                          </optgroup>
                          {pastMasterclasses.length > 0 && (
                            <optgroup label="🕰️ Sessions Passées">
                              {pastMasterclasses.map(s => (
                                <option key={s.id} value={s.id}>🕰️ {s.title}</option>
                              ))}
                            </optgroup>
                          )}
                          {masterclassReplays.length > 0 && (
                            <optgroup label="📼 Replays">
                              {masterclassReplays.map(r => (
                                <option key={r.id} value={r.id}>📼 {r.title}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Nom Complet *</label>
                        <input
                          type="text"
                          required
                          value={manualParticipantForm.fullName}
                          onChange={e => setManualParticipantForm({ ...manualParticipantForm, fullName: e.target.value })}
                          placeholder="Ex: Samba Diop"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Adresse Email *</label>
                        <input
                          type="email"
                          required
                          value={manualParticipantForm.email}
                          onChange={e => setManualParticipantForm({ ...manualParticipantForm, email: e.target.value })}
                          placeholder="Ex: apprenant@gmail.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">WhatsApp</label>
                          <input
                            type="text"
                            value={manualParticipantForm.whatsapp}
                            onChange={e => setManualParticipantForm({ ...manualParticipantForm, whatsapp: e.target.value })}
                            placeholder="+221..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Pays</label>
                          <input
                            type="text"
                            value={manualParticipantForm.country}
                            onChange={e => setManualParticipantForm({ ...manualParticipantForm, country: e.target.value })}
                            placeholder="Sénégal, CI..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setIsManualAddParticipantOpen(false)}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={addingManualParticipant}
                          className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
                        >
                          {addingManualParticipant ? "Inscription..." : "Confirmer l'inscription"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL INSCRIPTION DES APPRENANTS DE LA PLATEFORME (RÉSERVÉ SAMBA) */}
              {showEnrollUsersModal && isFounderSamba && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-fadeIn">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center border border-emerald-500/30">
                          <UserPlus className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading text-base font-bold text-slate-900">
                              Inscrire des Apprenants à la Masterclass
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 border border-amber-500/40">
                              Fondateur Samba
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Sélectionnez les membres de la plateforme non encore inscrits à cette session (les comptes administrateurs sont exclus).
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowEnrollUsersModal(false)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    {/* Masterclass Selection & Stats Bar */}
                    <div className="grid sm:grid-cols-12 gap-3 shrink-0">
                      <div className="sm:col-span-7 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Masterclass à Venir Ciblée :</label>
                        <select
                          value={enrollTargetSessionId}
                          onChange={e => {
                            setEnrollTargetSessionId(e.target.value)
                            setSelectedUserIdsToEnroll([])
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold outline-none focus:border-primary cursor-pointer shadow-2xs"
                        >
                          {upcomingMasterclasses.length > 0 ? (
                            upcomingMasterclasses.map((s, idx) => (
                              <option key={s.id || idx} value={s.id}>
                                {idx === 0 ? "🔴 Prochain direct" : "📅 Session"} : {s.title} ({s.dateDisplay || "Date à venir"})
                              </option>
                            ))
                          ) : (
                            <option value="current_live">🔴 {masterclassSession?.title || "Masterclass IA en Direct"}</option>
                          )}
                        </select>
                      </div>

                      <div className="sm:col-span-5 flex items-center gap-2">
                        <div className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Éligibles non-inscrits</span>
                          <span className="text-base font-black text-emerald-700">{eligibleUnenrolledUsers.length}</span>
                        </div>
                        <div className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Sélectionnés</span>
                          <span className="text-base font-black text-blue-700">{selectedUserIdsToEnroll.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Search & Bulk Select Toolbar */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedUserIdsToEnroll.length === filteredEligibleUsers.length) {
                              setSelectedUserIdsToEnroll([])
                            } else {
                              setSelectedUserIdsToEnroll(filteredEligibleUsers.map(u => u.id))
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          <span>
                            {selectedUserIdsToEnroll.length === filteredEligibleUsers.length && filteredEligibleUsers.length > 0
                              ? "Tout désélectionner"
                              : `Tout sélectionner (${filteredEligibleUsers.length})`}
                          </span>
                        </button>

                        {selectedUserIdsToEnroll.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedUserIdsToEnroll([])}
                            className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                          >
                            Réinitialiser ({selectedUserIdsToEnroll.length})
                          </button>
                        )}
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={enrollSearchQuery}
                          onChange={e => setEnrollSearchQuery(e.target.value)}
                          placeholder="Chercher par nom, email, tél, pays..."
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-primary shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Users List (Scrollable) */}
                    <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[380px] rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white shadow-inner">
                      {filteredEligibleUsers.length === 0 ? (
                        <div className="p-10 text-center space-y-2 text-slate-500">
                          <UserCheck className="size-8 text-slate-400 mx-auto" />
                          <p className="font-bold text-xs">
                            {enrollSearchQuery
                              ? "Aucun apprenant ne correspond à votre recherche."
                              : "Tous les apprenants éligibles de la plateforme sont déjà inscrits à cette session !"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {eligibleUnenrolledUsers.length === 0 && !enrollSearchQuery && "Aucun apprenant restant à inscrire."}
                          </p>
                        </div>
                      ) : (
                        filteredEligibleUsers.map(u => {
                          const isSelected = selectedUserIdsToEnroll.includes(u.id)
                          const initials = (u.full_name || u.email || "AP")
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()

                          return (
                            <div
                              key={u.id}
                              onClick={() => {
                                setSelectedUserIdsToEnroll(prev =>
                                  prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                                )
                              }}
                              className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                isSelected ? "bg-emerald-50/70" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                                />

                                <div className="size-8 rounded-full bg-primary/15 text-slate-900 font-extrabold text-xs flex items-center justify-center shrink-0 border border-primary/30">
                                  {initials}
                                </div>

                                <div className="min-w-0 space-y-0.5 text-left">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900 truncate">
                                      {u.full_name || "Apprenant"}
                                    </span>
                                    {(u as any).country && (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                                        {(u as any).country}
                                      </span>
                                    )}
                                    {(u as any).sector && (
                                      <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                                        • {(u as any).sector}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono flex-wrap">
                                    <span className="text-primary font-semibold">{u.email}</span>
                                    {(u as any).whatsapp && !(u as any).whatsapp.startsWith("wa_") && (
                                      <span className="text-slate-600">📱 {(u as any).whatsapp}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBatchEnrollUsers([u])
                                }}
                                disabled={enrollingUsers}
                                className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                                title="Inscrire uniquement cet apprenant maintenant"
                              >
                                Inscrire seul
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Email Option Toggle */}
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3 shrink-0 text-xs">
                      <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 font-medium">
                        <input
                          type="checkbox"
                          checked={batchEnrollSendEmail}
                          onChange={e => setBatchEnrollSendEmail(e.target.checked)}
                          className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>
                          Envoyer automatiquement l&apos;email de confirmation avec le lien Google Meet et WhatsApp
                        </span>
                      </label>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md shrink-0">
                        Recommandé
                      </span>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowEnrollUsersModal(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        {filteredEligibleUsers.length > 0 && (
                          <button
                            type="button"
                            disabled={enrollingUsers}
                            onClick={() => {
                              if (window.confirm(`Confirmez-vous l'inscription directe de tous les ${filteredEligibleUsers.length} apprenants éligibles à cette Masterclass ?`)) {
                                handleBatchEnrollUsers(filteredEligibleUsers)
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            ⚡ Inscrire TOUS les {filteredEligibleUsers.length} non-inscrits
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={enrollingUsers || selectedUserIdsToEnroll.length === 0}
                          onClick={() => handleBatchEnrollUsers()}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          {enrollingUsers ? (
                            <>
                              <RefreshCw className="size-3.5 animate-spin" />
                              <span>Inscription en cours...</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="size-3.5" />
                              <span>Inscrire la sélection ({selectedUserIdsToEnroll.length})</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* MODAL EMAIL CIBLÉ PAR MASTERCLASS */}
              {showTargetedEmailModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-200">
                          <Mail className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-heading text-base font-bold text-slate-800">
                            Emailing Ciblé Masterclass
                          </h4>
                          <p className="text-xs text-slate-500">
                            Envoyez un email spécifiquement aux apprenants de la Masterclass choisie.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowTargetedEmailModal(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Target selection */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 flex items-center justify-between">
                          <span>1. Destinataires ciblés</span>
                          <span className="text-blue-600 font-extrabold">
                            {targetedEmailTarget === "all_platform_users" 
                              ? `Tous les membres & abonnés` 
                              : targetedEmailTarget === "all_masterclasses"
                              ? `${masterclassParticipants.length} apprenants (toutes masterclasses)`
                              : `${masterclassCounts[targetedEmailTarget] || 0} apprenants ciblés`}
                          </span>
                        </label>
                        <select
                          value={targetedEmailTarget}
                          onChange={e => setTargetedEmailTarget(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-bold"
                        >
                          <optgroup label="🔴 Sessions à Venir">
                            {upcomingMasterclasses.map((s, idx) => (
                              <option key={s.id || idx} value={s.id}>
                                {idx === 0 ? "🔴 Prochain direct" : "📅 Session"} : {s.title} ({masterclassCounts[s.id] || (idx === 0 ? (masterclassCounts.current_live || masterclassCounts.mc_default || 0) : 0)} inscrits)
                              </option>
                            ))}
                          </optgroup>
                          {pastMasterclasses.length > 0 && (
                            <optgroup label="🕰️ Sessions Passées">
                              {pastMasterclasses.map(s => (
                                <option key={s.id} value={s.id}>
                                  🕰️ {s.title} ({masterclassCounts[s.id] || 0} participants)
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {masterclassReplays.length > 0 && (
                            <optgroup label="📼 Replays">
                              {masterclassReplays.map(r => (
                                <option key={r.id} value={r.id}>
                                  📼 {r.title} ({masterclassCounts[r.id] || 0} inscrits)
                                </option>
                              ))}
                            </optgroup>
                          )}
                          <optgroup label="🌐 Diffusion Globale">
                            <option value="all_masterclasses">
                              👥 Tous les inscrits à l'ensemble des Masterclasses ({masterclassParticipants.length} inscrits)
                            </option>
                            <option value="all_platform_users">
                              🌐 Tous les utilisateurs de la plateforme (Newsletter, Apprenants & Membres)
                            </option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Email template / type */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">2. Type d'email &amp; Modèle</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetedEmailType("reminder")
                              setTargetedEmailSubject(`⏰ Rappel Masterclass : ${masterclassSession.title}`)
                            }}
                            className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                              targetedEmailType === "reminder"
                                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <div className="text-[11px] font-black text-emerald-700">⏰ Rappel Direct</div>
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5">Date + Liens Google Meet & WhatsApp</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTargetedEmailType("replay")
                              setTargetedEmailSubject(`📼 Replay disponible : ${masterclassSession.title}`)
                            }}
                            className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                              targetedEmailType === "replay"
                                ? "bg-purple-50 border-purple-500 text-purple-800 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <div className="text-[11px] font-black text-purple-700">📼 Replay & Support</div>
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5">Lien vidéo + Ressources</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTargetedEmailType("custom")
                              setTargetedEmailSubject(`📢 Message important : Masterclass IA`)
                            }}
                            className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                              targetedEmailType === "custom"
                                ? "bg-blue-50 border-blue-500 text-blue-800 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <div className="text-[11px] font-black text-blue-700">✍️ Message Libre</div>
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5">Contenu personnalisé</div>
                          </button>
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Objet de l'email *</label>
                        <input
                          type="text"
                          required
                          value={targetedEmailSubject}
                          onChange={e => setTargetedEmailSubject(e.target.value)}
                          placeholder="Ex: ⏰ Rappel : Début de la Masterclass ce Dimanche à 19h00 GMT"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      {/* Custom Message Body */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">
                          Message personnalisé / Instructions supplémentaires
                        </label>
                        <textarea
                          rows={4}
                          value={targetedEmailCustomMessage}
                          onChange={e => setTargetedEmailCustomMessage(e.target.value)}
                          placeholder="Saisissez ici le texte de votre message ou vos consignes pratiques..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-blue-500 text-xs"
                        />
                      </div>

                      {/* Summary Box */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                        <div className="font-bold text-slate-800">📌 Éléments automatiquement inclus dans cet email :</div>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Prénom personnalisé de l'apprenant</li>
                          <li>Titre de la session : <strong>{masterclassSession.title}</strong></li>
                          {masterclassSession.dateDisplay && <li>Date : <strong>{masterclassSession.dateDisplay}</strong></li>}
                          <li>Bouton d'accès direct <strong>Google Meet</strong></li>
                          <li>Bouton d'accès au <strong>Groupe WhatsApp des Apprenants</strong></li>
                          <li>Signature officielle <strong>Alfred Dah &amp; LE GUIDE IA</strong></li>
                        </ul>
                      </div>

                      {/* Test Send Section */}
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                          <CheckCircle2 className="size-3.5 text-amber-700" />
                          <span>Envoyer un email test (Recommandé avant envoi en masse)</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={targetedEmailTestAddress}
                            onChange={e => setTargetedEmailTestAddress(e.target.value)}
                            placeholder="Votre email (ex: alfred@leguideai.com)"
                            className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendTargetedMasterclassEmail(true)}
                            disabled={sendingTestEmail || !targetedEmailTestAddress}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
                          >
                            {sendingTestEmail ? "Envoi test..." : "Envoyer test"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowTargetedEmailModal(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendTargetedMasterclassEmail(false)}
                        disabled={sendingTargetedEmail}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="size-4" />
                        <span>
                          {sendingTargetedEmail 
                            ? "Envoi en cours..." 
                            : `Diffuser l'email (${targetedEmailTarget === "all_platform_users" ? "Tous les membres" : targetedEmailTarget === "all_masterclasses" ? `${masterclassParticipants.length} inscrits` : `${masterclassCounts[targetedEmailTarget] || 0} ciblés`})`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MASTERCLASSES REPLAYS (VIDÉOTHÈQUE REPLAYS) */}
        {activeTab === "masterclass_replays" && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Masterclasses Sub-Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("masterclasses")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Radio className="size-3.5 text-rose-500" />
                  <span>Sessions à Venir</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {upcomingMasterclasses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclasses_past")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Clock className="size-3.5" />
                  <span>Sessions Passées</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {pastMasterclasses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclass_participants")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  <Users className="size-3.5" />
                  <span>Participants & Inscrits</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                    {masterclassParticipants.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterclass_replays")}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-primary text-slate-950 shadow-sm cursor-pointer"
                >
                  <Video className="size-3.5" />
                  <span>Replays</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px] font-extrabold">
                    {masterclassReplays.length}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenAddReplay}
                className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Ajouter un Replay Vidéo</span>
              </button>
            </div>

            {/* Replays Library (YouTube) */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Play className="size-5 text-primary fill-primary" />
                  <h3 className="font-heading text-base font-bold text-slate-800">
                    Replays &amp; Rediffusions des Masterclasses ({masterclassReplays.length})
                  </h3>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {masterclassReplays.map((rep: any) => (
                  <div
                    key={rep.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${rep.youtubeId}/hqdefault.jpg`}
                        alt={rep.title}
                        className="w-full h-full object-cover"
                        onError={(e: any) => { e.currentTarget.src = "/Logo avatar.png" }}
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                        {rep.duration}
                      </span>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-slate-950 text-[10px] font-black uppercase">
                        {rep.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-2">{rep.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{rep.description}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200 text-[11px]">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>{rep.instructor || "Alfred Dah"}</span>
                          <span>{rep.date}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleReplayPublish(rep)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                              rep.is_published !== false
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {rep.is_published !== false ? "✓ Publié" : "Masqué"}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditReplay(rep)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                              title="Modifier"
                            >
                              <Edit3 className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteReplay(rep.id)}
                              className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL PROGRAMMER / MODIFIER UNE MASTERCLASS */}
        {showMasterclassModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="size-5 text-rose-500" />
                  <h4 className="font-heading text-base font-bold text-slate-800">
                    {editingMasterclass ? "Modifier la Masterclass" : "Programmer une Nouvelle Masterclass"}
                  </h4>
                </div>
                <button
                  onClick={() => setShowMasterclassModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMasterclassModal} className="space-y-4 text-xs">
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Titre de la Masterclass *</label>
                    <input
                      type="text"
                      required
                      value={masterclassForm.title}
                      onChange={e => setMasterclassForm({ ...masterclassForm, title: e.target.value })}
                      placeholder="Ex: Masterclass IA : Automatisation & Agents"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Formateur / Intervenant</label>
                    <input
                      type="text"
                      value={masterclassForm.instructor}
                      onChange={e => setMasterclassForm({ ...masterclassForm, instructor: e.target.value })}
                      placeholder="Alfred Dah"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Date & Heure du Direct *</label>
                    <input
                      type="datetime-local"
                      required
                      value={masterclassForm.scheduledAt}
                      onChange={e => setMasterclassForm({ ...masterclassForm, scheduledAt: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Texte d'affichage de la date</label>
                    <input
                      type="text"
                      value={masterclassForm.dateDisplay}
                      onChange={e => setMasterclassForm({ ...masterclassForm, dateDisplay: e.target.value })}
                      placeholder="Ex: Dimanche 7 Septembre 2026 à 19h00 (GMT)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Description & Thématiques</label>
                  <textarea
                    rows={3}
                    value={masterclassForm.description}
                    onChange={e => setMasterclassForm({ ...masterclassForm, description: e.target.value })}
                    placeholder="Détaillez les points abordés lors de la masterclass..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-primary"
                  />
                </div>

                {/* Miniature / Affiche Upload vers Supabase */}
                <div className="space-y-1.5">
                  <FileUploadField
                    label="Miniature / Affiche Officielle (PNG, JPG, WebP)"
                    value={masterclassForm.thumbnailUrl || ""}
                    onChange={url => setMasterclassForm({ ...masterclassForm, thumbnailUrl: url })}
                    accept="image/*"
                    bucket="resources-files"
                    folder="masterclass"
                    placeholder="https://... ou téléversez l'affiche de la masterclass"
                    preview="image"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">💬 Lien du Groupe WhatsApp</label>
                    <input
                      type="url"
                      value={masterclassForm.whatsappGroupUrl}
                      onChange={e => setMasterclassForm({ ...masterclassForm, whatsappGroupUrl: e.target.value })}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">🎥 Lien Google Meet (Direct Live) *</label>
                    <input
                      type="url"
                      value={masterclassForm.youtubeLiveUrl}
                      onChange={e => setMasterclassForm({ ...masterclassForm, youtubeLiveUrl: e.target.value })}
                      placeholder="https://meet.google.com/xxx-yyyy-zzz"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Statut de la session</label>
                    <select
                      value={masterclassForm.status}
                      onChange={e => setMasterclassForm({ ...masterclassForm, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-bold"
                    >
                      <option value="upcoming">🔴 À Venir (Session active)</option>
                      <option value="past">🕰️ Passée (Archivée)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Durée estimée</label>
                    <input
                      type="text"
                      value={masterclassForm.duration}
                      onChange={e => setMasterclassForm({ ...masterclassForm, duration: e.target.value })}
                      placeholder="1h 30min"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowMasterclassModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingMasterclassSession}
                    className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-primary/90 shadow-md cursor-pointer"
                  >
                    {savingMasterclassSession ? "Enregistrement..." : (editingMasterclass ? "💾 Mettre à jour" : "🚀 Programmer la Masterclass")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB NEWSLETTER & BROADCAST */}
        {activeTab === "newsletter" && (
          <div className="space-y-8 animate-fadeIn text-left">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-800 flex items-center gap-2.5">
                  <Mail className="size-6 text-primary" />
                  Newsletter &amp; Diffusion d'Emails
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Diffusez vos analyses, veilles technologiques, prompts et offres de bootcamps directement par email via votre adresse officielle.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-2 shadow-xs">
                  <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Expéditeur officiel : <strong>Alfred Dah — LE GUIDE IA</strong> (alfred@leguideai.com)</span>
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-[#F8FAFC] p-4 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Abonnés Newsletter</span>
                <p className="text-2xl font-black text-slate-800 font-mono">{newsletterSubscribers.length}</p>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold inline-block">100% Abonnés Actifs</span>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-[#F8FAFC] p-4 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Membres Non-Abonnés</span>
                <p className="text-2xl font-black text-blue-700 font-mono">{nonSubscribedMembers.length}</p>
                <span className="text-[10px] text-slate-500">Inscrits sur la plateforme</span>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-[#F8FAFC] p-4 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Serveur d'Envoi</span>
                <p className="text-sm font-bold text-slate-800 font-mono truncate">Resend (DNS Cloudflare)</p>
                <span className="text-[10px] text-slate-500">DKIM &amp; SPF 100% sécurisés</span>
              </div>
            </div>

            {/* 2 Columns: Email Composer + Subscribers List */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              
              {/* Left Column: Email Composer (7 Cols) */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white shadow-xs p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    Rédiger &amp; Diffuser une Campagne
                  </h3>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditorViewMode("write")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        editorViewMode === "write"
                          ? "bg-white text-slate-800 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      ✍️ Éditeur
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorViewMode("preview")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        editorViewMode === "preview"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      👁️ Aperçu Réel
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Sujet de l'Email (Objet visible dans la boîte de réception) *</label>
                    <input
                      type="text"
                      required
                      value={broadcastForm.subject}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                      placeholder="Ex: 🔥 Nouvelles Masterclasses IA & Dates du prochain Bootcamp..."
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold outline-none focus:border-primary focus:bg-white placeholder:text-slate-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Grand Titre de l'Email (Dans l'entête du message)</label>
                    <input
                      type="text"
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      placeholder="Ex: Nos dernières astuces et opportunités IA de la semaine"
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-primary focus:bg-white placeholder:text-slate-400 transition-colors"
                    />
                  </div>

                  {/* EDITEUR AVEC BARRE D'OUTILS COMPLÈTE OU APERÇU LIVE */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-700 font-bold">Corps du Message (Éditeur Enrichi avec mise en forme) *</label>
                      <span className="text-[11px] text-slate-400">Cliquez sur les outils pour formater votre texte</span>
                    </div>

                    {editorViewMode === "write" ? (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-primary transition-all">
                        {/* Barre d'Outils de Mise en Forme */}
                        <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1">
                          {/* Formatage Texte */}
                          <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200">
                            <button
                              type="button"
                              onClick={() => insertFormatting("<strong>", "</strong>", "texte en gras")}
                              title="Gras (Bold)"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                            >
                              <Bold className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting("<em>", "</em>", "texte en italique")}
                              title="Italique"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <Italic className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting("<u>", "</u>", "texte souligné")}
                              title="Souligné"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <Underline className="size-3.5" />
                            </button>
                          </div>

                          {/* Titres */}
                          <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
                            <button
                              type="button"
                              onClick={() => insertFormatting('<h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin: 20px 0 10px;">', '</h2>\n', 'Titre de section')}
                              title="Titre H2"
                              className="px-2 py-1 rounded-lg hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              H2
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('<h3 style="color: #0284c7; font-size: 15px; font-weight: 700; margin: 16px 0 8px;">', '</h3>\n', 'Sous-titre')}
                              title="Sous-titre H3"
                              className="px-2 py-1 rounded-lg hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              H3
                            </button>
                          </div>

                          {/* Listes */}
                          <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
                            <button
                              type="button"
                              onClick={() => insertFormatting('<ul style="padding-left: 20px; line-height: 1.8; margin: 12px 0;">\n  <li>', '</li>\n  <li>Deuxième point clé</li>\n</ul>\n', 'Premier point')}
                              title="Liste à puces"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <List className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('<ol style="padding-left: 20px; line-height: 1.8; margin: 12px 0;">\n  <li>', '</li>\n  <li>Deuxième étape</li>\n</ol>\n', 'Première étape')}
                              title="Liste numérotée"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <ListOrdered className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('<blockquote style="border-left: 4px solid #0284c7; background: #f0f9ff; padding: 12px 16px; margin: 16px 0; border-radius: 0 10px 10px 0; font-style: italic; color: #0369a1;">', '</blockquote>\n', 'Citation inspirante ou note importante')}
                              title="Citation / Encadré bleu"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <Quote className="size-3.5" />
                            </button>
                          </div>

                          {/* Liens & Boutons CTA */}
                          <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                const url = prompt("Entrez l'adresse du lien (URL) :", "https://leguideai.com")
                                if (url) {
                                  insertFormatting(`<a href="${url}" style="color: #0284c7; text-decoration: underline; font-weight: bold;">`, '</a>', 'Texte du lien')
                                }
                              }}
                              title="Insérer un lien"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Link2 className="size-3.5 text-blue-600" />
                              <span className="text-[10px] font-bold">Lien</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const url = prompt("Lien du bouton CTA :", "https://leguideai.com/bootcamp")
                                const label = prompt("Texte du bouton :", "Découvrir le Bootcamp IA")
                                if (url && label) {
                                  insertFormatting(
                                    `\n<div style="text-align: center; margin: 24px 0;">\n  <a href="${url}" style="display: inline-block; background-color: #0284c7; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px; box-shadow: 0 4px 14px rgba(2,132,199,0.35);">${label} →</a>\n</div>\n`
                                  )
                                }
                              }}
                              title="Insérer un bouton d'action CTA"
                              className="px-2 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 text-slate-900 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                            >
                              <MousePointerClick className="size-3 text-slate-800" />
                              <span>Bouton CTA</span>
                            </button>
                          </div>

                          {/* Encadrés Spéciaux */}
                          <div className="flex items-center gap-0.5 pl-2">
                            <button
                              type="button"
                              onClick={() => insertFormatting(
                                '\n<div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 14px; padding: 16px; margin: 18px 0; color: #166534;">\n  <strong style="font-size: 14px;">💡 Astuce IA :</strong>\n  <p style="margin: 6px 0 0; font-size: 13px; color: #14532d;">',
                                '</p>\n</div>\n',
                                'Votre astuce exclusive ici...'
                              )}
                              title="Encadré Astuce Pro (Vert)"
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                            >
                              <Sparkles className="size-3 text-emerald-600" />
                              <span>Astuce</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => insertFormatting(
                                '\n<div style="background-color: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 14px; padding: 16px; margin: 18px 0; color: #991b1b;">\n  <strong style="font-size: 14px;">⚠️ Important :</strong>\n  <p style="margin: 6px 0 0; font-size: 13px; color: #7f1d1d;">',
                                '</p>\n</div>\n',
                                'Votre rappel important ici...'
                              )}
                              title="Encadré Important (Rouge)"
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                            >
                              <AlertCircle className="size-3 text-rose-600" />
                              <span>Alerte</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => insertFormatting('\n<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />\n')}
                              title="Ligne de séparation"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <Minus className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Textarea de Rédaction */}
                        <textarea
                          ref={newsletterBodyRef}
                          rows={11}
                          required
                          value={broadcastForm.bodyHtml}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, bodyHtml: e.target.value })}
                          placeholder="Rédigez votre message ici en utilisant la barre d'outils ci-dessus ou en tapant directement vos paragraphes..."
                          className="w-full p-4 text-slate-800 font-mono text-xs outline-none leading-relaxed placeholder:text-slate-400 bg-white"
                        />
                      </div>
                    ) : (
                      /* Aperçu Visuel Réel dans la boîte de réception */
                      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 p-4 space-y-3">
                        {/* Simulation Client Email */}
                        <div className="bg-white rounded-xl border border-slate-300 shadow-lg overflow-hidden max-w-xl mx-auto">
                          <div className="bg-slate-50 border-b border-slate-200 p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                              <span><strong>De :</strong> Alfred Dah — LE GUIDE IA &lt;alfred@leguideai.com&gt;</span>
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Email Officiel</span>
                            </div>
                            <div className="text-slate-600"><strong>Répondre à :</strong> alfred@leguideai.com</div>
                            <div className="text-slate-900 font-bold text-sm pt-1">
                              <strong>Objet :</strong> {broadcastForm.subject || "(Sujet non renseigné)"}
                            </div>
                          </div>

                          {/* Email Body Template Rendering */}
                          <div className="p-6 bg-white text-slate-800">
                            <div className="text-center pb-4 mb-4 border-b-2 border-[#0284c7]">
                              <h1 className="text-[#0284c7] m-0 text-xl font-black tracking-tight">LE GUIDE IA</h1>
                              <p className="text-slate-500 text-xs mt-1">La référence de l'Intelligence Artificielle</p>
                            </div>

                            {broadcastForm.title && (
                              <h2 className="text-slate-900 text-lg font-bold mb-4">
                                {broadcastForm.title}
                              </h2>
                            )}

                            <div 
                              className="text-slate-700 text-sm leading-relaxed space-y-3"
                              dangerouslySetInnerHTML={{ 
                                __html: broadcastForm.bodyHtml || "<p className='text-slate-400 italic'>Aucun contenu rédigé pour le moment...</p>" 
                              }}
                            />

                            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
                              <p className="font-bold text-slate-700">Alfred Dah · Fondateur LE GUIDE IA</p>
                              <p>Contact : <a href="mailto:alfred@leguideai.com" className="text-[#0284c7] underline">alfred@leguideai.com</a> | WhatsApp : +226 0505 0577</p>
                              <p className="text-[10px] text-slate-400 pt-2">Vous recevez cet email car vous êtes inscrit(e) sur la plateforme leguideai.com</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Audience Selector & Non-Subscribers Platform Members Option */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
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
                          Inclure également tous les membres &amp; apprenants inscrits (Non-abonnés)
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
                          <Send className="size-4" />
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
                  <h3 className="font-heading text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Users className="size-4 text-emerald-600" />
                    <span>Liste des Abonnés ({newsletterSubscribers.length})</span>
                  </h3>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/newsletter")
                      const data = await res.json()
                      if (data.subscribers) setNewsletterSubscribers(data.subscribers)
                      showNotice("Liste des abonnés actualisée.")
                    }}
                    className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="size-3" />
                    <span>Actualiser</span>
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
                    className="flex-1 bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:bg-white transition-colors"
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
                  <div className="text-center py-10 text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-2">
                    <Mail className="size-8 mx-auto text-slate-400" />
                    <p className="font-bold text-slate-700">Aucun abonné enregistré</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Inscrivez un email ci-dessus ou testez le formulaire au bas de la page d'accueil du site pour voir la liste se remplir automatiquement.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {newsletterSubscribers.map((sub: any, idx: number) => (
                      <div
                        key={sub.id || sub.email || idx}
                        className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 flex items-center justify-between gap-3 text-xs hover:border-primary/40 hover:bg-white transition-colors shadow-2xs"
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

        {/* TAB: ABONNEMENTS VIP (REPLAYS & PROMPTS) */}
        {activeTab === "subscriptions" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase border border-amber-500/20">
                    Monétisation Masterclasses &amp; Prompts
                  </span>
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Crown className="size-5 text-amber-500 fill-amber-500 shrink-0" />
                  <span>Gestion des Abonnements VIP (Replays &amp; Prompts)</span>
                </h3>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Validez les paiements Mobile Money en 1-clic, suivez les jours restants de vos abonnés et ajustez dynamiquement les tarifs publics du pass 3 mois et 1 an.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowPriceEditModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    title="Modifier les tarifs publics (Super Admin)"
                  >
                    <Sparkles className="size-3.5 text-amber-500" />
                    <span>Modifier les Tarifs ({subscriptionPricing.price3mDisplay || "10 000 F"} / {subscriptionPricing.price1yDisplay || "30 000 F"})</span>
                  </button>
                )}

                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowManualSubModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-slate-950 text-xs font-black shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Créer un abonnement manuel (Super Admin)"
                  >
                    <Plus className="size-4" />
                    <span>Créer un Abonnement Manuel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cartes KPI Synthèse */}
            <div className={`grid gap-4 ${isSuperAdmin ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Abonnés Actifs</span>
                  <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="size-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-800">
                  {adminSubscriptionStats.totalActive || 0}
                </div>
                <p className="text-[10px] text-slate-400">Accès ouvert aux replays &amp; prompts</p>
              </div>

              <div className={`p-5 rounded-3xl bg-white border shadow-xs space-y-1 ${
                adminSubscriptionStats.totalPending > 0 ? "border-amber-400 bg-amber-50/20" : "border-slate-200/90"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-700">En Attente de Validation</span>
                  <div className="size-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="size-4 animate-pulse" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-700">
                  {adminSubscriptionStats.totalPending || 0}
                </div>
                <p className="text-[10px] text-amber-700/80">Virements Mobile Money à vérifier</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Expirés / Résiliés</span>
                  <div className="size-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <XCircle className="size-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-700">
                  {adminSubscriptionStats.totalExpired || 0}
                </div>
                <p className="text-[10px] text-slate-400">Accès VIP suspendus</p>
              </div>

              {isSuperAdmin && (
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-md space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Revenus Abonnements</span>
                    <div className="size-8 rounded-xl bg-primary text-slate-950 flex items-center justify-center">
                      <DollarSign className="size-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    {adminSubscriptionStats.totalRevenueFormatted || `${Number(adminSubscriptionStats.totalRevenue || 0).toLocaleString("fr-FR")} FCFA`}
                  </div>
                  <p className="text-[10px] text-slate-400">Collectés via Mobile Money &amp; Stripe</p>
                </div>
              )}
            </div>

            {/* Barre de Recherche et Filtres */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {[
                  { id: "all", label: "Tous", count: adminSubscriptions.length },
                  { id: "pending", label: "En Attente", count: adminSubscriptions.filter(s => s.status === "pending").length },
                  { id: "active", label: "Actifs", count: adminSubscriptions.filter(s => s.status === "active").length },
                  { id: "expired", label: "Expirés", count: adminSubscriptions.filter(s => s.status === "expired" || s.status === "cancelled").length }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSubStatusFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      subStatusFilter === f.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      subStatusFilter === f.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={subSearchQuery}
                  onChange={e => setSubSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, email, réf..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Tableau des Abonnés */}
            <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
              {(() => {
                const filtered = adminSubscriptions
                  .filter(s => {
                    if (subStatusFilter === "all") return true
                    if (subStatusFilter === "pending") return s.status === "pending"
                    if (subStatusFilter === "active") return s.status === "active"
                    if (subStatusFilter === "expired") return s.status === "expired" || s.status === "cancelled"
                    return true
                  })
                  .filter(s => {
                    if (!subSearchQuery.trim()) return true
                    const q = subSearchQuery.toLowerCase()
                    return (
                      s.full_name?.toLowerCase().includes(q) ||
                      s.email?.toLowerCase().includes(q) ||
                      s.whatsapp?.toLowerCase().includes(q) ||
                      s.transaction_ref?.toLowerCase().includes(q)
                    )
                  })

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                      <Crown className="size-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700">Aucun abonnement trouvé</p>
                      <p>Les demandes d'abonnement VIP Mobile Money et Stripe apparaîtront ici.</p>
                    </div>
                  )
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <th className="p-4">Souscripteur</th>
                          <th className="p-4">Formule &amp; Montant</th>
                          <th className="p-4">Paiement &amp; Réf</th>
                          <th className="p-4">Statut &amp; Validité</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map(sub => {
                          const isPending = sub.status === "pending"
                          const isActive = sub.status === "active"
                          const isExpired = sub.status === "expired" || sub.status === "cancelled"

                          return (
                            <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Souscripteur */}
                              <td className="p-4 space-y-1">
                                <div className="font-bold text-slate-800 text-xs">
                                  {sub.full_name || sub.email?.split("@")[0]}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                  <Mail className="size-3 text-slate-400" />
                                  <span>{sub.email}</span>
                                </div>
                                {sub.whatsapp && (
                                  <a
                                    href={`https://wa.me/${sub.whatsapp.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold hover:underline"
                                  >
                                    <MessageCircle className="size-3 text-emerald-600" />
                                    <span>{sub.whatsapp}</span>
                                  </a>
                                )}
                              </td>

                              {/* Formule & Montant */}
                              <td className="p-4 space-y-1">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                  sub.plan === "1_year"
                                    ? "bg-amber-100 text-amber-800 border-amber-300"
                                    : sub.plan === "bootcamp_vip"
                                    ? "bg-purple-100 text-purple-800 border-purple-300"
                                    : "bg-blue-100 text-blue-800 border-blue-300"
                                }`}>
                                  {sub.plan === "1_year" ? "Pass 1 An (365j)" : sub.plan === "bootcamp_vip" ? "VIP Bootcamp" : "Pass 3 Mois (90j)"}
                                </span>
                                <div className="font-mono font-bold text-xs text-slate-800">
                                  {sub.amount ? `${Number(sub.amount).toLocaleString("fr-FR")} FCFA` : (sub.plan === "1_year" ? (subscriptionPricing.price1yDisplay || "29 000 FCFA") : (subscriptionPricing.price3mDisplay || "9 000 FCFA"))}
                                </div>
                              </td>

                              {/* Paiement & Réf */}
                              <td className="p-4 space-y-1">
                                <div className="font-semibold text-slate-700 text-[11px]">
                                  {sub.payment_method || "Mobile Money"}
                                </div>
                                <div className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]" title={sub.transaction_ref}>
                                  Réf: {sub.transaction_ref || "-"}
                                </div>
                                {sub.receipt_url && (
                                  <button
                                    type="button"
                                    onClick={() => setReceiptModalUrl(sub.receipt_url)}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer bg-primary/10 px-2 py-0.5 rounded-md"
                                  >
                                    <ImageIcon className="size-3" />
                                    <span>Voir le reçu</span>
                                  </button>
                                )}
                              </td>

                              {/* Statut & Validité */}
                              <td className="p-4 space-y-1">
                                {isActive ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase border border-emerald-300">
                                    <CheckCircle2 className="size-3 text-emerald-600" />
                                    <span>Actif</span>
                                  </span>
                                ) : isPending ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase border border-amber-300 animate-pulse">
                                    <Clock className="size-3 text-amber-600" />
                                    <span>En Attente</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase border border-rose-300">
                                    <XCircle className="size-3 text-rose-600" />
                                    <span>Expiré</span>
                                  </span>
                                )}

                                <div className="text-[11px] text-slate-500 font-medium">
                                  {isActive ? (
                                    <span className="text-emerald-700 font-bold">
                                      {sub.days_remaining !== undefined ? `${sub.days_remaining} jours restants` : "Actif"}
                                    </span>
                                  ) : (
                                    <span>Fin: {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("fr-FR") : "-"}</span>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="p-4 text-right space-y-1">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {isPending && (
                                    <button
                                      type="button"
                                      disabled={processingId === sub.id}
                                      onClick={() => handleValidateSubscription(sub.id, sub.email)}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                                      title="Valider immédiatement l'accès VIP et envoyer l'email de confirmation"
                                    >
                                      {processingId === sub.id ? <RefreshCw className="size-3 animate-spin" /> : <Check className="size-3 stroke-[3]" />}
                                      <span>Valider le Paiement</span>
                                    </button>
                                  )}

                                  {isActive && isSuperAdmin && (
                                    <button
                                      type="button"
                                      disabled={processingId === sub.id}
                                      onClick={() => handleProlongSubscription(sub.id, 30)}
                                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-all cursor-pointer"
                                      title="Prolonger l'abonnement de +30 jours gratuitement (Super Admin)"
                                    >
                                      +30j
                                    </button>
                                  )}

                                  {isActive && (
                                    <button
                                      type="button"
                                      disabled={processingId === sub.id}
                                      onClick={() => handleCancelSubscription(sub.id)}
                                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-all cursor-pointer"
                                      title="Révoquer l'abonnement"
                                    >
                                      <Lock className="size-3.5" />
                                    </button>
                                  )}

                                  {isSuperAdmin && (
                                    <button
                                      type="button"
                                      disabled={processingId === sub.id}
                                      onClick={() => handleDeleteSubscription(sub.id)}
                                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-all cursor-pointer"
                                      title="Supprimer cet enregistrement (Super Admin)"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </div>

          </div>
        )}

        {/* MODAL CRÉER UN ABONNEMENT MANUEL */}
        {showManualSubModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Crown className="size-4" />
                  </div>
                  <h4 className="font-heading text-base font-bold text-slate-800">
                    Créer un Abonnement VIP Manuel
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualSubModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveManualSub} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nom &amp; Prénom de l'abonné *</label>
                  <input
                    type="text"
                    required
                    value={manualSubForm.fullName}
                    onChange={e => setManualSubForm({ ...manualSubForm, fullName: e.target.value })}
                    placeholder="Ex: Jean Kouassi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email du compte Le Guide IA *</label>
                  <input
                    type="email"
                    required
                    value={manualSubForm.email}
                    onChange={e => setManualSubForm({ ...manualSubForm, email: e.target.value })}
                    placeholder="jean@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Numéro WhatsApp</label>
                    <input
                      type="text"
                      value={manualSubForm.whatsapp}
                      onChange={e => setManualSubForm({ ...manualSubForm, whatsapp: e.target.value })}
                      placeholder="+225 07070707"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Formule d'Abonnement</label>
                    <select
                      value={manualSubForm.plan}
                      onChange={e => setManualSubForm({ ...manualSubForm, plan: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    >
                      <option value="3_months">Pass 3 Mois (90 jours)</option>
                      <option value="1_year">Pass 1 An (365 jours)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Durée personnalisée en jours (Optionnel)</label>
                  <input
                    type="number"
                    value={manualSubForm.customDays}
                    onChange={e => setManualSubForm({ ...manualSubForm, customDays: e.target.value })}
                    placeholder="Laisser vide pour la durée normale du plan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowManualSubModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingManualSub}
                    className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    {savingManualSub ? <RefreshCw className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                    <span>Créer et Activer le Pass VIP</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL MODIFIER LES TARIFS DES ABONNEMENTS */}
        {showPriceEditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-primary/20 text-slate-950 flex items-center justify-center font-bold">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <h4 className="font-heading text-base font-bold text-slate-800">
                    Tarifs Publics des Abonnements
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPriceEditModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Ces tarifs sont appliqués en temps réel sur la page Masterclasses, la bibliothèque de Ressources et dans l'Espace Membre.
                </p>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Prix Formule 3 Mois (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={priceEditForm.price3m}
                    onChange={e => setPriceEditForm({ ...priceEditForm, price3m: e.target.value })}
                    placeholder="9000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-mono font-bold text-sm outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-400">Tarif actuel : {subscriptionPricing.price3mDisplay || "9 000 FCFA"}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Prix Formule 1 An (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={priceEditForm.price1y}
                    onChange={e => setPriceEditForm({ ...priceEditForm, price1y: e.target.value })}
                    placeholder="29000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-mono font-bold text-sm outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-400">Tarif actuel : {subscriptionPricing.price1yDisplay || "29 000 FCFA"}</span>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPriceEditModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingPriceEdit}
                    className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    {savingPriceEdit ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    <span>Enregistrer les Nouveaux Tarifs</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL APERÇU DU REÇU / CAPTURE DE PAIEMENT */}
        {receiptModalUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-4 space-y-3 shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <span className="font-bold text-xs text-slate-800">Preuve de virement Mobile Money</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptModalUrl(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-2xl bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={receiptModalUrl}
                  alt="Preuve de paiement"
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between px-2 pt-1 text-xs">
                <a
                  href={receiptModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="size-3" />
                  <span>Ouvrir en plein écran</span>
                </a>
                <button
                  type="button"
                  onClick={() => setReceiptModalUrl(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Fermer
                </button>
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
                  Total : <strong className="text-slate-900">{bootcampPayments.length}</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
                  À vérifier : <strong className="text-amber-900">{bootcampPayments.filter(p => p.status === "pending_verification" || p.status === "pending").length}</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                  Confirmés : <strong className="text-emerald-900">{bootcampPayments.filter(p => p.status === "confirmed").length}</strong>
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
                  <option value="all">Tous les Statuts ({bootcampPayments.length})</option>
                  <option value="pending_verification">À vérifier / Mobile Money ({bootcampPayments.filter(p => p.status === "pending_verification" || p.status === "pending").length})</option>
                  <option value="confirmed">Confirmés / Payés ({bootcampPayments.filter(p => p.status === "confirmed").length})</option>
                  <option value="pending">En attente ({bootcampPayments.filter(p => p.status === "pending").length})</option>
                  <option value="rejected">Rejetés / Échoués ({bootcampPayments.filter(p => p.status === "rejected" || p.status === "failed").length})</option>
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
                      <th className="p-4 text-center">Preuve (Reçu)</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {filteredPayments.map(p => {
                      // Contact info comes from linked registration (joined by API)
                      const regFullName = p.registrations?.full_name || "Prospect Direct"
                      const regEmail = p.registrations?.email || ""
                      const regPhone = p.registrations?.whatsapp || ""
                      const regCountry = p.registrations?.country || ""
                      const regSource = p.registrations?.source || "checkout"

                      const cleanPhone = regPhone.replace(/[^0-9]/g, "")
                      const initials = regFullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "P"
                      const receiptUrl = getPaymentReceiptUrl(p)
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                          {/* Participant */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-primary/15 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 border border-primary/25">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 truncate">{regFullName}</div>
                                {regSource && (
                                  <div className="text-[10px] text-slate-500 truncate">{regSource}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="p-4 space-y-1">
                            <div className="text-slate-800 font-medium truncate flex items-center gap-1.5">
                              <Mail className="size-3 text-slate-400 shrink-0" />
                              <span className="truncate">{regEmail || "N/A"}</span>
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
                                  <span>{regPhone}</span>
                                </a>
                              ) : (
                                <span>{regPhone || "N/A"}</span>
                              )}
                              {regCountry && (
                                <span className="text-[10px] text-slate-500 font-mono">({regCountry})</span>
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

                          {/* Preuve Capture (Reçu) */}
                          <td className="p-4 text-center">
                            {receiptUrl ? (
                              <button
                                type="button"
                                onClick={() => setPreviewScreenshotUrl(receiptUrl)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/30 font-bold text-[10px] transition-all cursor-pointer shadow-2xs"
                                title="Voir la capture d'écran du reçu de paiement"
                              >
                                <ImageIcon className="size-3.5" />
                                <span>Voir Reçu</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Aucun</span>
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
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                                  title="Valider le paiement et débloquer les accès"
                                >
                                  {processingId === p.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                                  <span>{processingId === p.id ? "Validation..." : "Valider"}</span>
                                </button>
                              )}
                              {(p.status === "pending_verification" || p.status === "pending") && (
                                <button
                                  onClick={() => handlePaymentStatus(p.id, "rejected")}
                                  disabled={processingId === p.id}
                                  className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 disabled:opacity-50 font-bold text-[11px] hover:bg-rose-100 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                                  title="Rejeter ce paiement"
                                >
                                  {processingId === p.id ? <Loader2 className="size-3 animate-spin" /> : null}
                                  <span>{processingId === p.id ? "Rejet..." : "Rejeter"}</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEditPayment(p)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                                title="Modifier l'inscription &amp; paiement"
                              >
                                <Edit3 className="size-3.5" />
                              </button>
                              {isSuperAdmin && (
                                <button
                                  onClick={() => handleDeletePayment(p.id, p.registration_id, (p.registrations as any)?.email, (p.registrations as any)?.course_slug || p.course_title)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Supprimer définitivement l'inscription (Super Admin)"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
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
                const receiptUrl = getPaymentReceiptUrl(p)
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

                      {/* Preuve Capture Button on Mobile */}
                      {receiptUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewScreenshotUrl(receiptUrl)}
                          className="w-full py-2 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/30 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <ImageIcon className="size-4" />
                          <span>Voir la Capture de Paiement (Reçu)</span>
                        </button>
                      )}

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
                            className="flex-1 py-2 rounded-xl bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {processingId === p.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                            <span>{processingId === p.id ? "Validation..." : "Valider & Débloquer"}</span>
                          </button>
                          {(p.status === "pending_verification" || p.status === "pending") && (
                            <button
                              onClick={() => handlePaymentStatus(p.id, "rejected")}
                              disabled={processingId === p.id}
                              className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 disabled:opacity-50 font-bold text-xs hover:bg-red-500/20 transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              {processingId === p.id ? <Loader2 className="size-3 animate-spin" /> : null}
                              <span>{processingId === p.id ? "Rejet..." : "Rejeter"}</span>
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
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeletePayment(p.id, p.registration_id, (p.registrations as any)?.email, (p.registrations as any)?.course_slug || p.course_title)}
                            disabled={processingId === p.id}
                            className="flex-1 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            title="Supprimer définitivement l'inscription (Super Admin)"
                          >
                            <Trash2 className="size-3" />
                            <span>Supprimer</span>
                          </button>
                        )}
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

        {/* TAB 6: USERS & RBAC ROLES (Super Admin only) */}
        {activeTab === "users" && isSuperAdmin && (
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
                      <th className="p-4 text-center">Changer Rôle</th>
                      <th className="p-4 text-right">Action Super Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {users
                      .filter(u => u.email?.toLowerCase() !== "samba@leguideai.com" || currentUser?.email?.toLowerCase() === "samba@leguideai.com")
                      .map(u => (
                        <tr key={u.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                          <td className="p-4 font-bold text-slate-800">
                            {u.full_name || "Utilisateur Anonyme"}
                          </td>
                          <td className="p-4 text-slate-700 font-mono text-[11px]">{u.email}</td>
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
                          <td className="p-4 text-center">
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
                          <td className="p-4 text-right">
                            {u.id === currentUser?.id || u.email === currentUser?.email ? (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                                Votre compte
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={processingId === u.id}
                                onClick={() => handleDeleteUser(u)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                                title={`Supprimer définitivement le compte de ${u.full_name || u.email}`}
                              >
                                {processingId === u.id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                                <span>Supprimer</span>
                              </button>
                            )}
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
              <div 
                onClick={(e) => { if (e.target === e.currentTarget) setGradingSub(null) }}
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
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
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Entreprise & Contact</th>
                      <th className="p-4">Email / Tél</th>
                      <th className="p-4">Service Souhaité</th>
                      <th className="p-4">Effectif</th>
                      <th className="p-4 max-w-sm">Besoins / Cahier des Charges</th>
                      <th className="p-4">Statut Lead</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {b2bRequests.map(b => {
                      const isExpanded = !!expandedB2bNeeds[b.id]
                      const rawNeeds = b.needs || b.message || "Aucune description fournie."

                      return (
                        <tr key={b.id} className="hover:bg-[#F4F6F8]/60 transition-colors align-top">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 text-sm">{b.company_name}</div>
                            <div className="text-slate-600 text-xs font-semibold mt-0.5">{b.contact_name}</div>
                            <div className="text-slate-400 text-[10px] mt-1">{b.created_at ? new Date(b.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}</div>
                          </td>
                          <td className="p-4">
                            <a href={`mailto:${b.email}`} className="font-semibold text-primary hover:underline block text-xs">{b.email}</a>
                            <div className="text-slate-600 font-mono text-[11px] mt-0.5">{b.phone || "Non renseigné"}</div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80">
                              {b.sector || b.service_type || "Formation B2B"}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-bold text-slate-800 text-xs">{b.employees || b.company_size || "10 à 50 personnes"}</div>
                          </td>
                          <td className="p-4 max-w-sm">
                            <div className="space-y-1.5">
                              <div className={`text-slate-700 text-xs leading-relaxed ${isExpanded ? "whitespace-pre-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-200" : "line-clamp-2"}`}>
                                {rawNeeds}
                              </div>
                              {rawNeeds.length > 70 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedB2bNeeds(prev => ({ ...prev, [b.id]: !prev[b.id] }))}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer pt-0.5"
                                >
                                  {isExpanded ? (
                                    <>
                                      <span>Réduire</span>
                                      <ChevronUp className="size-3" />
                                    </>
                                  ) : (
                                    <>
                                      <span>Voir plus</span>
                                      <ChevronDown className="size-3" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={b.status === "Nouveau" ? "new" : b.status || "new"}
                              onChange={e => handleUpdateB2BStatus(b.id, e.target.value)}
                              disabled={processingId === `status_${b.id}`}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border outline-none cursor-pointer ${
                                b.status === "new" || b.status === "Nouveau"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  : b.status === "contacted"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                  : b.status === "quoted"
                                  ? "bg-purple-500/10 text-purple-600 border-purple-500/30"
                                  : b.status === "won"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              <option value="new">Nouveau</option>
                              <option value="contacted">Contacté</option>
                              <option value="quoted">Devis Envoyé</option>
                              <option value="won">Gagné / Signé</option>
                              <option value="lost">Perdu</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Action 1: Transférer à Alfred */}
                              <button
                                onClick={() => handleForwardB2B(b)}
                                disabled={processingId === `forward_${b.id}`}
                                className="size-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-2xs"
                                title="Transférer cette demande à Alfred Dah (alfred@leguideai.com)"
                              >
                                <Send className="size-3.5" />
                              </button>

                              {/* Action 2: Répondre par Email */}
                              <a
                                href={`mailto:${b.email}?subject=${encodeURIComponent(`Proposition de Devis B2B — ${b.company_name}`)}`}
                                className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center justify-center shadow-2xs"
                                title="Envoyer un email au prospect"
                              >
                                <Mail className="size-3.5" />
                              </a>

                              {/* Action 3: Supprimer */}
                              <button
                                onClick={() => handleDeleteB2B(b.id)}
                                disabled={processingId === b.id}
                                className="size-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-2xs"
                                title="Supprimer définitivement cette demande"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {b2bRequests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
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

        {/* TAB 9: SITE & HERO LANDING SETTINGS (Super Admin only) */}
        {activeTab === "settings" && isSuperAdmin && (
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
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Edit3 className="size-3 text-primary" />
                            <span>Modifier</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVslVideo(vIdx)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 text-xs font-semibold transition-all cursor-pointer"
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

              {/* Note d'information sur les Bootcamps et Masterclasses */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Sparkles className="size-4 text-primary" />
                  <span>Gestion Directe des Formations &amp; Masterclasses</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  • <strong>Formations &amp; Bootcamps</strong> : Les tarifs promo, dates, affiches officielles et programmes PDF sont pilotés individuellement dans l'onglet <strong>« Formations &amp; Bootcamps »</strong>.
                </p>
                <p className="text-slate-500 leading-relaxed">
                  • <strong>Masterclasses en Direct</strong> : La programmation des prochaines dates, liens Google Meet, diffusions YouTube et replays sont pilotés dans le menu <strong>« Masterclasses »</strong>.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-8 py-3 rounded-xl bg-primary text-slate-950 font-bold text-sm hover:opacity-90 transition-opacity shadow-xl cursor-pointer"
                >
                  {savingSettings ? "Enregistrement en cours..." : "💾 Enregistrer les Paramètres"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 10: EXPORT CSV (Super Admin only) */}
        {activeTab === "export" && isSuperAdmin && (
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
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setShowVslModal(false) }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
          >
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
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) { setShowCategoryModal(false); setEditingCategory(null); } }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
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
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setShowTestimonialModal(false) }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          >
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
                      placeholder="Ex: Expert Gouvernance IT"
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
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false) }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          >
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

                {/* Receipt Screenshot Preview if available */}
                {editingPayment && getPaymentReceiptUrl(editingPayment) && (
                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                        <img
                          src={getPaymentReceiptUrl(editingPayment)!}
                          alt="Preuve"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 block">Capture d'écran du reçu jointe</span>
                        <span className="text-[10px] text-slate-500 block">Vérifiez les montants déclarés par l'apprenant.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewScreenshotUrl(getPaymentReceiptUrl(editingPayment)!)}
                      className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <Eye className="size-3.5" />
                      <span>Zoomer</span>
                    </button>
                  </div>
                )}

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

        {/* ===== MODAL ZOOM PLEIN ÉCRAN PREUVE DE PAIEMENT (GLOBAL) ===== */}
        {previewScreenshotUrl && (
          <div 
            className="fixed inset-0 z-[999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setPreviewScreenshotUrl(null)}
          >
            <div 
              className="relative bg-white rounded-3xl p-4 sm:p-5 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col space-y-3"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <span>Preuve de Paiement / Reçu Mobile Money</span>
                </h4>
                <div className="flex items-center gap-2">
                  <a
                    href={previewScreenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Ouvrir en taille réelle dans un nouvel onglet"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>Ouvrir l'original</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewScreenshotUrl(null)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center max-h-[72vh] p-2">
                <img
                  src={previewScreenshotUrl}
                  alt="Capture de paiement"
                  className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* MODAL AJOUT / ÉDITION REPLAY MASTERCLASS */}
        {showReplayModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-primary/15 text-slate-950 flex items-center justify-center font-black">
                    <Play className="size-4 fill-slate-950" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-slate-800">
                      {editingReplay ? "Modifier le Replay Masterclass" : "Ajouter un Replay / Vidéo Masterclass"}
                    </h3>
                    <p className="text-[11px] text-slate-500">Lien YouTube intégré sans consommer d'espace disque</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReplayModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveReplay} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Titre de la Masterclass / Session *</label>
                  <input
                    type="text"
                    required
                    value={replayForm.title}
                    onChange={e => setReplayForm({ ...replayForm, title: e.target.value })}
                    placeholder="Ex: Masterclass #4 : Créer son premier Agent IA autonome"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lien YouTube ou ID de la Vidéo *</label>
                  <input
                    type="text"
                    required
                    value={replayForm.youtubeUrl}
                    onChange={e => setReplayForm({ ...replayForm, youtubeUrl: e.target.value })}
                    placeholder="Ex: https://www.youtube.com/watch?v=XXXXX ou https://youtu.be/XXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-400">Le système extrait automatiquement l'identifiant pour la lecture fluide.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Catégorie Thématique</label>
                    <select
                      value={replayForm.category}
                      onChange={e => setReplayForm({ ...replayForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    >
                      <option value="Prompting">Prompting</option>
                      <option value="Automatisation">Automatisation</option>
                      <option value="Création de Contenu">Création de Contenu</option>
                      <option value="Business">Business</option>
                      <option value="Général">Général</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Durée de la vidéo</label>
                    <input
                      type="text"
                      value={replayForm.duration}
                      onChange={e => setReplayForm({ ...replayForm, duration: e.target.value })}
                      placeholder="Ex: 1h 25min"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Formateur / Intervenant</label>
                    <input
                      type="text"
                      value={replayForm.instructor}
                      onChange={e => setReplayForm({ ...replayForm, instructor: e.target.value })}
                      placeholder="Alfred Dah"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Date de diffusion</label>
                    <input
                      type="text"
                      value={replayForm.date}
                      onChange={e => setReplayForm({ ...replayForm, date: e.target.value })}
                      placeholder="Ex: Dimanche 25 Août 2026"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Description courte</label>
                  <textarea
                    rows={2}
                    value={replayForm.description}
                    onChange={e => setReplayForm({ ...replayForm, description: e.target.value })}
                    placeholder="Synthèse des points clés abordés..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_published_checkbox"
                    checked={replayForm.is_published}
                    onChange={e => setReplayForm({ ...replayForm, is_published: e.target.checked })}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                  <label htmlFor="is_published_checkbox" className="font-bold text-slate-700 cursor-pointer">
                    Publier immédiatement ce replay sur la page publique
                  </label>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowReplayModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingReplay}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    {savingReplay ? "Enregistrement..." : editingReplay ? "Mettre à Jour" : "Enregistrer le Replay"}
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

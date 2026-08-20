"use client"

import { useState, useMemo } from "react"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Video, 
  Users, 
  Sparkles, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  MessageCircle,
  X,
  CalendarCheck,
  Zap,
  Info
} from "lucide-react"

export interface CalendarEvent {
  id: string
  courseId: string
  courseSlug?: string
  courseTitle: string
  track: "carriere" | "business" | "formation" | "other"
  eventType?: "bootcamp_launch" | "session" | "workshop" | "exam"
  cohortName?: string
  sessionNumber?: number
  title: string
  description?: string
  date: string // ISO format YYYY-MM-DD or full ISO
  endDate?: string
  startTime?: string // "19:00"
  endTime?: string // "21:00"
  duration?: string // "7 Jours" or "2h"
  instructor?: string // "Alfred Dah"
  meetUrl?: string
  recordingUrl?: string
  whatsappUrl?: string
  status: "upcoming" | "live" | "completed"
  spotsRemaining?: number
  price?: string | number
}

interface BootcampCalendarProps {
  events: CalendarEvent[]
  courses?: { id?: string; title: string; slug?: string; price?: number | string; [key: string]: any }[]
  isAdmin?: boolean
  onAddEvent?: (date?: string) => void
  onEditEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  onGenerateCohort?: (courseId: string, startDate: string) => void
  initialSelectedCourseId?: string
}

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export function BootcampCalendar({
  events = [],
  courses = [],
  isAdmin = false,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onGenerateCohort,
  initialSelectedCourseId = "all"
}: BootcampCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(initialSelectedCourseId)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "launches" | "sessions">("all")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ dateStr: string; events: CalendarEvent[] } | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesCourse = !selectedCourseFilter || selectedCourseFilter === "all" || 
        e.courseId === selectedCourseFilter || e.courseSlug === selectedCourseFilter
      
      const isLaunch = e.eventType === "bootcamp_launch" || e.title.toLowerCase().includes("rentrée") || e.title.toLowerCase().includes("lancement")
      const matchesType = selectedTypeFilter === "all" || 
        (selectedTypeFilter === "launches" && isLaunch) || 
        (selectedTypeFilter === "sessions" && !isLaunch)

      return matchesCourse && matchesType
    })
  }, [events, selectedCourseFilter, selectedTypeFilter])

  // Calendar Grid Computations
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    
    // Day of week for 1st day (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // Convert so Monday = 0, ..., Sunday = 6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1
    if (startingDayOfWeek === -1) startingDayOfWeek = 6

    const totalDaysInMonth = lastDayOfMonth.getDate()
    
    // Days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    const days = []

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i
      const d = new Date(currentYear, currentMonth - 1, dayNum)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
      days.push({
        date: d,
        dateStr,
        dayNum,
        isCurrentMonth: false,
        events: filteredEvents.filter(e => e.date.startsWith(dateStr))
      })
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const d = new Date(currentYear, currentMonth, dayNum)
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
      days.push({
        date: d,
        dateStr,
        dayNum,
        isCurrentMonth: true,
        events: filteredEvents.filter(e => e.date.startsWith(dateStr))
      })
    }

    // Days from next month to complete grid (multiples of 7)
    const remainingDays = 42 - days.length // 6 rows of 7 = 42
    for (let dayNum = 1; dayNum <= remainingDays && days.length < 35; dayNum++) {
      const d = new Date(currentYear, currentMonth + 1, dayNum)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
      days.push({
        date: d,
        dateStr,
        dayNum,
        isCurrentMonth: false,
        events: filteredEvents.filter(e => e.date.startsWith(dateStr))
      })
    }

    return days
  }, [currentYear, currentMonth, filteredEvents])

  // Upcoming Events (sorted chronologically)
  const upcomingEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8)
  }, [filteredEvents])

  const todayStr = useMemo(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  }, [])

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar (Filter, Month Switcher, Action Button) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        
        {/* Left: Filter by course & Type */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary shrink-0" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[240px] truncate shadow-2xs"
            >
              <option value="all">Toutes les formations</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 text-[11px] font-bold shadow-sm">
            <button
              onClick={() => setSelectedTypeFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                selectedTypeFilter === "all" ? "bg-primary text-white font-black shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tout afficher
            </button>
            <button
              onClick={() => setSelectedTypeFilter("launches")}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                selectedTypeFilter === "launches" ? "bg-primary text-white font-black shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🚀 Rentrées</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter("sessions")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                selectedTypeFilter === "sessions" ? "bg-primary text-white font-black shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📅 Directs Live</span>
            </button>
          </div>
        </div>

        {/* Center: Month & Year Navigator */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
            title="Mois précédent"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="min-w-[160px] text-center">
            <h3 className="font-heading text-base font-black text-slate-900">
              {MONTHS_FR[currentMonth]} {currentYear}
            </h3>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
            title="Mois suivant"
          >
            <ChevronRight className="size-4" />
          </button>

          <button
            onClick={handleToday}
            className="text-[11px] font-bold text-primary hover:text-white hover:bg-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Right: Admin Actions or Legend */}
        <div className="flex items-center gap-2.5 justify-end">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              {onAddEvent && (
                <button
                  onClick={() => onAddEvent()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white font-black text-xs hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Nouvelle Session</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-600 shadow-sm" />
                <span>Carrière</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#D4AF37] shadow-sm" />
                <span>Business</span>
              </span>
              <span className="flex items-center gap-1.5 text-primary font-bold">
                <span>🚀 Rentrée</span>
              </span>
            </div>
          )}
        </div>

      </div>

      {/* 2. Full-Width Monthly Calendar Grid */}
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
        
        {/* Day Headers (Lun, Mar, Mer, Jeu, Ven, Sam, Dim) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {DAYS_FR.map((day, idx) => (
            <div
              key={day}
              className={`py-2 text-center text-[11px] font-black uppercase tracking-wider ${
                idx >= 5 ? "text-primary" : "text-slate-500"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((dayItem, idx) => {
            const isToday = dayItem.dateStr === todayStr
            const hasEvents = dayItem.events.length > 0

            return (
              <div
                key={idx}
                onClick={() => {
                  if (hasEvents) {
                    if (dayItem.events.length === 1) {
                      setSelectedEvent(dayItem.events[0])
                    } else {
                      setSelectedDayEvents({ dateStr: dayItem.dateStr, events: dayItem.events })
                    }
                  } else if (isAdmin && onAddEvent) {
                    onAddEvent(dayItem.dateStr)
                  }
                }}
                className={`min-h-[95px] sm:min-h-[120px] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between border transition-all cursor-pointer group relative ${
                  dayItem.isCurrentMonth
                    ? "bg-white border-slate-200 hover:border-primary/60 hover:bg-slate-50/80 shadow-xs"
                    : "bg-slate-50/50 border-transparent opacity-30 hover:opacity-70"
                } ${isToday ? "border-primary bg-primary/5 ring-2 ring-primary/20" : ""} ${
                  hasEvents ? "border-slate-300 shadow-xs" : ""
                }`}
              >
                {/* Top Row: Date Number & Today Indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold size-6 flex items-center justify-center rounded-lg ${
                      isToday
                        ? "bg-primary text-white font-black shadow-md shadow-primary/30"
                        : dayItem.isCurrentMonth
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {dayItem.dayNum}
                  </span>

                  {hasEvents && (
                    <span className="text-[10px] font-black text-slate-600 bg-slate-100 rounded-md px-1.5 py-0.5 border border-slate-200">
                      {dayItem.events.length}
                    </span>
                  )}
                </div>

                {/* Events Badges in Day Cell */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayItem.events.slice(0, 3).map((ev) => {
                    const isBusiness = ev.track === "business" || ev.courseTitle.toLowerCase().includes("business")
                    const isLaunch = ev.eventType === "bootcamp_launch" || ev.title.toLowerCase().includes("rentrée") || ev.title.toLowerCase().includes("lancement")

                    if (isLaunch) {
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEvent(ev)
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black truncate flex items-center gap-1 border shadow-xs transition-all hover:scale-[1.02] ${
                            isBusiness
                              ? "bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-slate-950 border-[#D4AF37]"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-blue-600/20"
                          }`}
                          title={`${ev.courseTitle} - ${ev.title}`}
                        >
                          <span className="size-1.5 rounded-full bg-white animate-ping shrink-0" />
                          <span className="truncate">🚀 RENTRÉE {isBusiness ? "BUSINESS" : "CARRIÈRE"}</span>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(ev)
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold truncate flex items-center gap-1.5 border transition-all hover:scale-[1.02] ${
                          isBusiness
                            ? "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                            : "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100"
                        }`}
                        title={`${ev.courseTitle} - ${ev.title}`}
                      >
                        <span
                          className={`size-1.5 rounded-full shrink-0 ${
                            isBusiness ? "bg-[#D4AF37]" : "bg-blue-600"
                          } ${ev.status === "live" ? "animate-ping" : ""}`}
                        />
                        <span className="truncate">
                          {ev.sessionNumber ? `S#${ev.sessionNumber} · ` : ""}{ev.startTime ? `${ev.startTime} ` : ""}{ev.title}
                        </span>
                      </div>
                    )
                  })}

                  {dayItem.events.length > 3 && (
                    <div className="text-[9px] font-bold text-slate-500 text-center">
                      +{dayItem.events.length - 3} autre(s)
                    </div>
                  )}
                </div>

                {/* Empty state hover hint for admin */}
                {isAdmin && !hasEvents && dayItem.isCurrentMonth && (
                  <div className="opacity-0 group-hover:opacity-100 text-[10px] text-primary font-bold text-center mt-1 transition-opacity">
                    + Session
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>

      {/* 3. Modal: Single Event Details View */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-left">
            
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Header Badge */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedEvent.eventType === "bootcamp_launch" ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-primary to-amber-400 text-slate-950 shadow-sm">
                    🚀 RENTRÉE OFFICIELLE &amp; NOUVELLE COHORTE
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      selectedEvent.track === "business" || selectedEvent.courseTitle.toLowerCase().includes("business")
                        ? "bg-amber-50 text-amber-900 border-amber-300"
                        : "bg-blue-50 text-blue-900 border-blue-300"
                    }`}
                  >
                    {selectedEvent.courseTitle}
                  </span>
                )}

                {selectedEvent.status === "live" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                    <span className="size-1.5 rounded-full bg-rose-600" />
                    SESSION EN DIRECT
                  </span>
                )}
              </div>

              <h3 className="font-heading text-xl font-bold text-slate-900 pt-1">
                {selectedEvent.sessionNumber ? `Session #${selectedEvent.sessionNumber} : ` : ""}{selectedEvent.title}
              </h3>
            </div>

            {/* Details Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <CalendarIcon className="size-4 text-primary" /> {selectedEvent.eventType === "bootcamp_launch" ? "Date de rentrée :" : "Date de la séance :"}
                </span>
                <span className="font-bold text-slate-900">
                  {new Date(selectedEvent.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Clock className="size-4 text-primary" /> Format &amp; Horaires :
                </span>
                <span className="font-bold text-slate-900">
                  {selectedEvent.duration || (selectedEvent.eventType === "bootcamp_launch" ? "7 Jours Intensifs" : "2h")} · {selectedEvent.startTime || "19:00"} {selectedEvent.endTime ? `à ${selectedEvent.endTime}` : ""} GMT
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Users className="size-4 text-primary" /> Formateur principal :
                </span>
                <span className="font-bold text-slate-900">{selectedEvent.instructor || "Formateur non renseigné"}</span>
              </div>
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {selectedEvent.eventType === "bootcamp_launch" ? "Présentation de la cohorte :" : "Objectifs de la session :"}
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {selectedEvent.eventType === "bootcamp_launch" ? (
                <>
                  <a
                    href={selectedEvent.courseSlug ? `/bootcamp?course=${selectedEvent.courseSlug}` : "/bootcamp"}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs hover:opacity-95 transition-all cursor-pointer"
                  >
                    <span>🎟️ Réserver ma place à cette Rentrée</span>
                  </a>
                </>
              ) : (
                <>
                  {selectedEvent.meetUrl && (
                    <a
                      href={selectedEvent.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Video className="size-4" />
                      <span>Rejoindre sur Google Meet</span>
                    </a>
                  )}

                  {selectedEvent.recordingUrl && (
                    <a
                      href={selectedEvent.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-slate-200 bg-[#F4F6F8] hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
                    >
                      <Play className="size-4" />
                      <span>Voir le Replay HD</span>
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Admin Controls inside Modal */}
            {isAdmin && (
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                {onEditEvent && (
                  <button
                    onClick={() => {
                      const ev = selectedEvent
                      setSelectedEvent(null)
                      onEditEvent(ev)
                    }}
                    className="flex items-center gap-1.5 text-primary hover:underline font-bold"
                  >
                    <Edit3 className="size-3.5" /> Modifier cet événement
                  </button>
                )}
                {onDeleteEvent && (
                  <button
                    onClick={() => {
                      if (confirm("Supprimer cette session du calendrier ?")) {
                        onDeleteEvent(selectedEvent.id)
                        setSelectedEvent(null)
                      }
                    }}
                    className="flex items-center gap-1.5 text-rose-600 hover:underline font-bold"
                  >
                    <Trash2 className="size-3.5" /> Supprimer
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. Modal: Multiple Events on Same Day Selection */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedDayEvents(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="text-left space-y-1">
              <h4 className="font-heading text-lg font-bold text-slate-900">
                Sessions du {new Date(selectedDayEvents.dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </h4>
              <p className="text-xs text-slate-500">Sélectionnez une session pour voir les détails ou la rejoindre :</p>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {selectedDayEvents.events.map((ev) => {
                const isBusiness = ev.track === "business" || ev.courseTitle.toLowerCase().includes("business")
                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedDayEvents(null)
                      setSelectedEvent(ev)
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] text-left space-y-1.5 ${
                      isBusiness
                        ? "bg-amber-50/50 border-amber-200 hover:border-amber-400"
                        : "bg-blue-50/50 border-blue-200 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-primary">{ev.courseTitle}</span>
                      <span className="text-[10px] font-mono text-slate-500">{ev.startTime || "19:00 GMT"}</span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900">
                      {ev.sessionNumber ? `Session #${ev.sessionNumber} : ` : ""}{ev.title}
                    </h5>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

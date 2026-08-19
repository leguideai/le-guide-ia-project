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
  sessionNumber?: number
  title: string
  description?: string
  date: string // ISO format YYYY-MM-DD or full ISO
  startTime?: string // "19:00"
  endTime?: string // "21:00"
  duration?: string // "2h"
  instructor?: string // "Alfred Dah"
  meetUrl?: string
  recordingUrl?: string
  whatsappUrl?: string
  status: "upcoming" | "live" | "completed"
}

interface BootcampCalendarProps {
  events: CalendarEvent[]
  courses?: { id: string; title: string; slug?: string; price?: number | string }[]
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
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 7, 19)) // Default around Août 2026
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(initialSelectedCourseId)
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
    if (!selectedCourseFilter || selectedCourseFilter === "all") {
      return events
    }
    return events.filter(e => e.courseId === selectedCourseFilter || e.courseSlug === selectedCourseFilter)
  }, [events, selectedCourseFilter])

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/70 border border-border/80 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
        
        {/* Left: Filter by course */}
        <div className="flex items-center gap-3">
          <Filter className="size-4 text-primary shrink-0" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-950 border border-border/80 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[280px] truncate"
          >
            <option value="all">Toutes les formations & Bootcamps</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Month & Year Navigator */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-border/70 hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Mois précédent"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="min-w-[160px] text-center">
            <h3 className="font-heading text-base font-black text-foreground">
              {MONTHS_FR[currentMonth]} {currentYear}
            </h3>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-border/70 hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Mois suivant"
          >
            <ChevronRight className="size-4" />
          </button>

          <button
            onClick={handleToday}
            className="text-[11px] font-bold text-primary hover:text-primary-foreground hover:bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-slate-950 font-black text-xs hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Nouvelle Session</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-500 shadow-sm" />
                <span>Carrière</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#D4AF37] shadow-sm" />
                <span>Business & Dirigeants</span>
              </span>
            </div>
          )}
        </div>

      </div>

      {/* 2. Full-Width Monthly Calendar Grid */}
      <div className="w-full rounded-3xl border border-border/80 bg-slate-950/80 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl overflow-hidden">
        
        {/* Day Headers (Lun, Mar, Mer, Jeu, Ven, Sam, Dim) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {DAYS_FR.map((day, idx) => (
            <div
              key={day}
              className={`py-2 text-center text-[11px] font-black uppercase tracking-wider ${
                idx >= 5 ? "text-primary/90" : "text-muted-foreground"
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
                className={`min-h-[90px] sm:min-h-[115px] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between border transition-all cursor-pointer group relative ${
                  dayItem.isCurrentMonth
                    ? "bg-slate-900/40 border-border/40 hover:border-primary/50 hover:bg-slate-900/80"
                    : "bg-slate-950/30 border-transparent opacity-30 hover:opacity-70"
                } ${isToday ? "border-primary/80 glow-blue bg-primary/5" : ""} ${
                  hasEvents ? "border-slate-800 shadow-md" : ""
                }`}
              >
                {/* Top Row: Date Number & Today Indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold size-6 flex items-center justify-center rounded-lg ${
                      isToday
                        ? "bg-primary text-slate-950 font-black shadow-md shadow-primary/30"
                        : dayItem.isCurrentMonth
                        ? "text-slate-300"
                        : "text-slate-600"
                    }`}
                  >
                    {dayItem.dayNum}
                  </span>

                  {hasEvents && (
                    <span className="text-[10px] font-black text-muted-foreground bg-slate-800/80 rounded-md px-1.5 py-0.5">
                      {dayItem.events.length}
                    </span>
                  )}
                </div>

                {/* Events Badges in Day Cell */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayItem.events.slice(0, 3).map((ev) => {
                    const isBusiness = ev.track === "business" || ev.courseTitle.toLowerCase().includes("business")
                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(ev)
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold truncate flex items-center gap-1.5 border transition-all hover:scale-[1.02] ${
                          isBusiness
                            ? "bg-[#D4AF37]/20 text-[#ECC86B] border-[#D4AF37]/40 hover:bg-[#D4AF37]/30"
                            : "bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30"
                        }`}
                        title={`${ev.courseTitle} - ${ev.title}`}
                      >
                        <span
                          className={`size-1.5 rounded-full shrink-0 ${
                            isBusiness ? "bg-[#D4AF37]" : "bg-blue-400"
                          } ${ev.status === "live" ? "animate-ping" : ""}`}
                        />
                        <span className="truncate">
                          {ev.sessionNumber ? `S#${ev.sessionNumber} · ` : ""}{ev.startTime ? `${ev.startTime} ` : ""}{ev.title}
                        </span>
                      </div>
                    )
                  })}

                  {dayItem.events.length > 3 && (
                    <div className="text-[9px] font-bold text-muted-foreground text-center">
                      +{dayItem.events.length - 3} autre(s)
                    </div>
                  )}
                </div>

                {/* Empty state hover hint for admin */}
                {isAdmin && !hasEvents && dayItem.isCurrentMonth && (
                  <div className="opacity-0 group-hover:opacity-100 text-[10px] text-primary/80 font-bold text-center mt-1 transition-opacity">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Header Badge */}
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    selectedEvent.track === "business" || selectedEvent.courseTitle.toLowerCase().includes("business")
                      ? "bg-[#D4AF37]/20 text-[#ECC86B] border-[#D4AF37]/40"
                      : "bg-blue-600/20 text-blue-300 border-blue-500/40"
                  }`}
                >
                  {selectedEvent.courseTitle}
                </span>

                {selectedEvent.status === "live" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
                    <span className="size-1.5 rounded-full bg-rose-400" />
                    SESSION EN DIRECT
                  </span>
                )}
              </div>

              <h3 className="font-heading text-xl font-bold text-white pt-1">
                {selectedEvent.sessionNumber ? `Session #${selectedEvent.sessionNumber} : ` : ""}{selectedEvent.title}
              </h3>
            </div>

            {/* Details Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-xs text-left">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CalendarIcon className="size-4 text-primary" /> Date de la séance :
                </span>
                <span className="font-bold text-white">
                  {new Date(selectedEvent.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" /> Horaires Live :
                </span>
                <span className="font-bold text-white">
                  {selectedEvent.startTime || "19:00"} {selectedEvent.endTime ? `à ${selectedEvent.endTime}` : ""} GMT
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="size-4 text-primary" /> Formateur principal :
                </span>
                <span className="font-bold text-white">{selectedEvent.instructor || "Alfred Dah (Auditeur CISA)"}</span>
              </div>
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div className="space-y-1 text-left">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Objectifs de la session :</h5>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {selectedEvent.meetUrl && (
                <a
                  href={selectedEvent.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-primary hover:opacity-90 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all cursor-pointer"
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
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="size-4" />
                  <span>Voir le Replay HD</span>
                </a>
              )}

              {selectedEvent.whatsappUrl && (
                <a
                  href={selectedEvent.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3.5 px-4 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#25D366]/20 transition-all"
                >
                  <MessageCircle className="size-4" />
                  <span>Groupe WhatsApp</span>
                </a>
              )}
            </div>

            {/* Admin Controls inside Modal */}
            {isAdmin && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                {onEditEvent && (
                  <button
                    onClick={() => {
                      const ev = selectedEvent
                      setSelectedEvent(null)
                      onEditEvent(ev)
                    }}
                    className="flex items-center gap-1.5 text-primary hover:underline font-bold"
                  >
                    <Edit3 className="size-3.5" /> Modifier cette session
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
                    className="flex items-center gap-1.5 text-rose-400 hover:underline font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedDayEvents(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="text-left space-y-1">
              <h4 className="font-heading text-lg font-bold text-white">
                Sessions du {new Date(selectedDayEvents.dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </h4>
              <p className="text-xs text-muted-foreground">Sélectionnez une session pour voir les détails ou la rejoindre :</p>
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
                        ? "bg-slate-900/80 border-[#D4AF37]/40 hover:border-[#D4AF37]"
                        : "bg-slate-900/80 border-blue-500/40 hover:border-blue-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-primary">{ev.courseTitle}</span>
                      <span className="text-[10px] font-mono text-slate-400">{ev.startTime || "19:00 GMT"}</span>
                    </div>
                    <h5 className="font-bold text-xs text-white">
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

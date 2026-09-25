/**
 * Utility functions to manage course and bootcamp public visibility,
 * automated expiration handling based on end_date, and member access.
 */

export interface CourseVisibilityStatus {
  isOpenForPublic: boolean
  isExpired: boolean
  isArchived: boolean
  isDraft: boolean
  statusLabel: string
  statusColor: string
}

/**
 * Parses any date string or Date object safely.
 */
export function parseDateSafe(dateValue: any): Date | null {
  if (!dateValue) return null
  if (dateValue instanceof Date) return isNaN(dateValue.getTime()) ? null : dateValue
  
  const str = String(dateValue).trim()
  if (!str) return null

  const d = new Date(str)
  if (!isNaN(d.getTime())) return d

  // If format is DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [day, month, year] = str.split("/").map(Number)
    const parsed = new Date(year, month - 1, day, 23, 59, 59)
    if (!isNaN(parsed.getTime())) return parsed
  }

  return null
}

/**
 * Checks if a course/bootcamp is currently open for public registration on the homepage and catalog.
 * - Free courses are always public.
 * - Expired bootcamps (where end_date is in the past) are automatically hidden from the public.
 * - Manually archived or draft courses are hidden from the public.
 */
export function isCourseOpenForPublic(course: any): boolean {
  if (!course) return false

  // 1. Manual hide / archive flags
  if (course.is_active === false) return false
  if (course.is_hidden === true) return false
  if (course.status === "archived" || course.status === "draft" || course.status === "members_only") {
    return false
  }

  // 2. Free initiation courses are always available publicly
  if (Number(course.price) === 0 || course.isFree) {
    return true
  }

  // 3. Automated check based on end_date
  if (course.end_date) {
    const endDate = parseDateSafe(course.end_date)
    if (endDate) {
      // Set to the end of that day (23:59:59.999) to allow enrollment during the final day
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)

      const now = new Date()
      if (now > endOfDay) {
        return false // Expired -> Automatically hidden from public
      }
    }
  }

  // 4. Default: Visible if status is published/active or unspecified
  return true
}

/**
 * Bootcamp à mettre en avant dans les appels à l'inscription : le plus proche
 * dont la cohorte n'a pas encore démarré. À défaut, le premier cours public.
 */
export function pickUpcomingCourse<T = any>(courses: T[]): T | null {
  const startTime = (c: T) => getCourseStartDate(c)?.getTime() ?? Number.MAX_SAFE_INTEGER
  const upcoming = courses.filter(isRegistrationOpen).sort((a, b) => startTime(a) - startTime(b))
  return upcoming[0] || courses.find(isCourseOpenForPublic) || courses[0] || null
}

/**
 * Returns full visibility details and badge metadata for a course (useful for Admin & UI).
 */
export function getCourseVisibilityStatus(course: any): CourseVisibilityStatus {
  if (!course) {
    return {
      isOpenForPublic: false,
      isExpired: false,
      isArchived: true,
      isDraft: false,
      statusLabel: "Invalide",
      statusColor: "bg-slate-500/10 text-slate-400 border-slate-500/30"
    }
  }

  if (course.status === "draft") {
    return {
      isOpenForPublic: false,
      isExpired: false,
      isArchived: false,
      isDraft: true,
      statusLabel: "Brouillon",
      statusColor: "bg-slate-500/10 text-slate-400 border-slate-500/30"
    }
  }

  if (course.status === "archived" || course.is_active === false || course.is_hidden === true) {
    return {
      isOpenForPublic: false,
      isExpired: false,
      isArchived: true,
      isDraft: false,
      statusLabel: "Masqué / Archivé",
      statusColor: "bg-rose-500/10 text-rose-400 border-rose-500/30"
    }
  }

  if (course.end_date) {
    const endDate = parseDateSafe(course.end_date)
    if (endDate) {
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      const now = new Date()

      if (now > endOfDay) {
        return {
          isOpenForPublic: false,
          isExpired: true,
          isArchived: false,
          isDraft: false,
          statusLabel: "Terminé (Accès Membres & Replays)",
          statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/30"
        }
      }
    }
  }

  return {
    isOpenForPublic: true,
    isExpired: false,
    isArchived: false,
    isDraft: false,
    statusLabel: "En cours / Public",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
  }
}

/* ------------------------------------------------------------------ *
 *  Fermeture des inscriptions au démarrage du bootcamp
 * ------------------------------------------------------------------ */

const FRENCH_MONTHS: Record<string, number> = {
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

/**
 * Date de démarrage d'un bootcamp.
 * Priorité au champ `start_date` ; à défaut, on l'extrait du texte libre
 * `dates` (ex. « 19 au 24 Octobre 2026 »), que l'admin remplit parfois seul.
 */
export function getCourseStartDate(course: any): Date | null {
  if (!course) return null

  if (course.start_date) {
    const raw = String(course.start_date).trim()
    const d = new Date(raw.includes("T") ? raw : `${raw}T00:00:00`)
    if (!isNaN(d.getTime())) return d
  }

  if (course.dates) {
    const text = String(course.dates).trim()

    // Format numérique : 19/10/2026 ou 19-10-2026
    const numeric = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/)
    if (numeric) {
      const d = new Date(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1]))
      if (!isNaN(d.getTime())) return d
    }

    // Format littéral : « 19 au 24 Octobre 2026 »
    const day = text.match(/\b(\d{1,2})\b/)
    const year = text.match(/\b(20\d{2})\b/)
    const monthKey = Object.keys(FRENCH_MONTHS)
      .sort((a, b) => b.length - a.length)
      .find(k => text.toLowerCase().includes(k))

    if (day && monthKey) {
      const d = new Date(
        year ? Number(year[1]) : new Date().getFullYear(),
        FRENCH_MONTHS[monthKey],
        Number(day[1])
      )
      if (!isNaN(d.getTime())) return d
    }
  }

  return null
}

/**
 * Le bootcamp a-t-il démarré ?
 * La bascule se fait à 00h00 le jour de la première session : on ne vend plus
 * une place dans une cohorte déjà lancée.
 * Sans date de début connue, on considère que non (on ne bloque jamais à tort).
 */
export function hasCourseStarted(course: any): boolean {
  const start = getCourseStartDate(course)
  if (!start) return false

  const startOfDay = new Date(start)
  startOfDay.setHours(0, 0, 0, 0)

  return Date.now() >= startOfDay.getTime()
}

/**
 * Les inscriptions publiques sont-elles ouvertes ?
 * = le cours est visible publiquement ET la cohorte n'a pas encore démarré.
 */
export function isRegistrationOpen(course: any): boolean {
  return isCourseOpenForPublic(course) && !hasCourseStarted(course)
}

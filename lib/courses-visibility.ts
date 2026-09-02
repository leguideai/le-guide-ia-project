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

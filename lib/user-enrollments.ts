"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

function normalizeStr(str?: string | null): string {
  if (!str) return ""
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

/**
 * Normalise et vérifie si un cours fait partie d'un set d'identifiants
 */
export function checkIsCourseMatched(targetSet: Set<string>, course: any, allDbCourses: any[] = []): boolean {
  if (!course || !targetSet || targetSet.size === 0) return false

  if (targetSet.has("*") || targetSet.has("all")) return true

  const cId = course.id ? String(course.id).toLowerCase().trim() : ""
  const cSlug = course.slug ? String(course.slug).toLowerCase().trim() : ""
  const cDbId = course.dbId ? String(course.dbId).toLowerCase().trim() : ""
  const cTitleNorm = normalizeStr(course.title)

  if (cId && targetSet.has(cId)) return true
  if (cSlug && targetSet.has(cSlug)) return true
  if (cDbId && targetSet.has(cDbId)) return true
  if (cTitleNorm && targetSet.has(cTitleNorm)) return true

  for (const item of Array.from(targetSet)) {
    const itemNorm = normalizeStr(item)
    if (!itemNorm) continue

    if (item === cId || item === cSlug || item === cDbId) return true

    if (cTitleNorm && (cTitleNorm.includes(itemNorm) || itemNorm.includes(cTitleNorm))) {
      return true
    }

    if (cSlug) {
      const slugClean = normalizeStr(cSlug)
      if (slugClean.includes(itemNorm) || itemNorm.includes(slugClean)) {
        return true
      }
      if (slugClean.includes("test") || itemNorm.includes("test")) {
        if (slugClean.includes("test") && itemNorm.includes("test")) return true
      } else {
        if (slugClean.includes("carriere") && itemNorm.includes("carriere")) return true
        if (slugClean.includes("business") && itemNorm.includes("business")) return true
        if (slugClean.includes("pro") && itemNorm.includes("pro")) return true
      }
    }
  }

  for (const dbC of allDbCourses) {
    const dbCId = dbC.id ? String(dbC.id).toLowerCase().trim() : ""
    const dbCSlug = dbC.slug ? String(dbC.slug).toLowerCase().trim() : ""
    const dbCTitleNorm = normalizeStr(dbC.title)

    const isDbCMatched = (dbCId && targetSet.has(dbCId)) || 
                         (dbCSlug && targetSet.has(dbCSlug)) || 
                         (dbCTitleNorm && targetSet.has(dbCTitleNorm))

    if (isDbCMatched) {
      if (dbCId && (dbCId === cId || dbCId === cDbId)) return true
      if (dbCSlug && dbCSlug === cSlug) return true
      if (dbCTitleNorm && dbCTitleNorm === cTitleNorm) return true
      if (cSlug && dbCSlug && (cSlug === dbCSlug || cSlug.includes(dbCSlug) || dbCSlug.includes(cSlug))) return true
    }
  }

  return false
}

export function checkIsCourseEnrolled(enrolledSet: Set<string>, course: any, allDbCourses: any[] = []): boolean {
  return checkIsCourseMatched(enrolledSet, course, allDbCourses)
}

export function checkIsCoursePending(pendingSet: Set<string>, course: any, allDbCourses: any[] = []): boolean {
  return checkIsCourseMatched(pendingSet, course, allDbCourses)
}

/**
 * Hook React retournant l'état d'inscription (Confirmé & En attente de validation) de l'utilisateur connecté
 */
export function useUserEnrollments() {
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [enrolledSet, setEnrolledSet] = useState<Set<string>>(new Set())
  const [pendingSet, setPendingSet] = useState<Set<string>>(new Set())
  const [pendingList, setPendingList] = useState<any[]>([])
  const [allCourses, setAllCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadEnrollments = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      const storedEmail = typeof window !== "undefined"
        ? (localStorage.getItem("user_email") || localStorage.getItem("member_email") || localStorage.getItem("le_guide_ia_email"))
        : null

      const email = (currentUser?.email || storedEmail || "").toLowerCase().trim()

      if (!currentUser && !storedEmail) {
        setUser(null)
        setIsLoggedIn(false)
        setIsAdmin(false)
        setEnrolledSet(new Set())
        setPendingSet(new Set())
        setPendingList([])
        setLoading(false)
        return
      }

      if (currentUser) {
        setUser(currentUser)
        setIsLoggedIn(true)
      } else if (storedEmail) {
        setUser({ email: storedEmail, isStoredOnly: true })
        setIsLoggedIn(true)
      }

      // Parallel fetch: courses list + user enrollments API
      const [cRes, enrollmentsRes] = await Promise.all([
        supabase.from("courses").select("id, title, slug"),
        fetch(`/api/user/enrollments?email=${encodeURIComponent(email)}`)
      ])

      const fetchedCourses = cRes.data || []
      setAllCourses(fetchedCourses)

      const data = await enrollmentsRes.json()

      if (data && data.success) {
        setIsAdmin(Boolean(data.isAdmin))
        setEnrolledSet(new Set(data.confirmed || []))
        setPendingSet(new Set(data.pending || []))
        setPendingList(data.pendingDetails || [])
      } else {
        // Client fallback if API fails
        const identifiers = new Set<string>()
        const pendings = new Set<string>()

        // Check user_courses
        const { data: ucData } = await supabase
          .from("user_courses")
          .select("course_slug, course_id, status")
          .ilike("user_email", email)

        if (ucData) {
          ucData.forEach((uc: any) => {
            const id = uc.course_slug || (uc.course_id ? String(uc.course_id) : "")
            if (["active", "confirmed", "completed"].includes(uc.status)) {
              identifiers.add(id.toLowerCase())
            } else {
              pendings.add(id.toLowerCase())
            }
          })
        }

        // Check registrations
        const { data: regData } = await supabase
          .from("registrations")
          .select("id, course_id, course_slug, status")
          .ilike("email", email)

        if (regData) {
          regData.forEach((r: any) => {
            const id = r.course_slug || (r.course_id ? String(r.course_id) : "")
            if (["paye", "confirmed", "active"].includes(r.status)) {
              identifiers.add(id.toLowerCase())
            } else if (["pending", "en_attente", "pending_verification", "inscrit", "attente", "a_verifier"].includes(r.status) && !id.toLowerCase().includes("masterclass")) {
              pendings.add(id.toLowerCase())
            }
          })
        }

        setEnrolledSet(identifiers)
        setPendingSet(pendings)
      }
    } catch (err) {
      console.warn("Could not load enrollments:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEnrollments()

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadEnrollments()
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [loadEnrollments])

  const isEnrolledInCourse = (course: any) => {
    if (!isLoggedIn || !user) return false
    return checkIsCourseEnrolled(enrolledSet, course, allCourses)
  }

  const isPendingInCourse = (course: any) => {
    if (!isLoggedIn || !user) return false
    if (isEnrolledInCourse(course)) return false
    return checkIsCoursePending(pendingSet, course, allCourses)
  }

  const getCourseEnrollmentStatus = (course: any): "confirmed" | "pending" | "none" => {
    if (isEnrolledInCourse(course)) return "confirmed"
    if (isPendingInCourse(course)) return "pending"
    return "none"
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    enrolledIds: Array.from(enrolledSet),
    pendingIds: Array.from(pendingSet),
    pendingList,
    isEnrolledInCourse,
    isPendingInCourse,
    getCourseEnrollmentStatus,
    refreshEnrollments: loadEnrollments,
    loading
  }
}



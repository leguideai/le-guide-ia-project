import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

function normalizeStr(str?: string | null): string {
  if (!str) return ""
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const emailParam = searchParams.get("email")?.toLowerCase().trim()

    let userEmail = emailParam || ""
    let userId: string | null = null

    const authHeader = req.headers.get("authorization")
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "")
      if (token) {
        const { data: userData } = await supabaseServer.auth.getUser(token)
        if (userData?.user) {
          userEmail = userData.user.email?.toLowerCase().trim() || userEmail
          userId = userData.user.id
        }
      }
    }

    if (!userEmail) {
      return NextResponse.json({
        success: true,
        isLoggedIn: false,
        isAdmin: false,
        confirmed: [],
        pending: [],
        pendingDetails: []
      })
    }

    // 2. Fetch all courses for identifier mapping
    const { data: dbCourses } = await supabaseServer.from("courses").select("id, title, slug")
    const allCourses = dbCourses || []

    // 3. Check if user is admin
    if (userId) {
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle()

      if (profile?.role === "admin" || profile?.role === "super_admin") {
        const allIds = ["*"]
        allCourses.forEach(c => {
          if (c.id) allIds.push(String(c.id).toLowerCase())
          if (c.slug) allIds.push(String(c.slug).toLowerCase())
          if (c.title) allIds.push(normalizeStr(c.title))
        })
        return NextResponse.json({
          success: true,
          isLoggedIn: true,
          isAdmin: true,
          confirmed: allIds,
          pending: [],
          pendingDetails: []
        })
      }
    }

    const confirmedSet = new Set<string>()
    const pendingSet = new Set<string>()
    const pendingDetails: any[] = []

    const addCourseIdentifiers = (targetSet: Set<string>, idOrSlugOrTitle?: string | null) => {
      if (!idOrSlugOrTitle) return
      const raw = String(idOrSlugOrTitle).trim()
      const lower = raw.toLowerCase()
      const norm = normalizeStr(raw)

      targetSet.add(lower)
      if (norm) targetSet.add(norm)

      const matched = allCourses.find(c =>
        c.id?.toLowerCase() === lower ||
        c.slug?.toLowerCase() === lower ||
        normalizeStr(c.slug) === norm ||
        normalizeStr(c.title) === norm ||
        (norm.includes("carriere") && normalizeStr(c.slug).includes("carriere")) ||
        (norm.includes("business") && normalizeStr(c.slug).includes("business")) ||
        (norm.includes("pro") && normalizeStr(c.slug).includes("pro"))
      )

      if (matched) {
        if (matched.id) targetSet.add(String(matched.id).toLowerCase())
        if (matched.slug) targetSet.add(String(matched.slug).toLowerCase())
        if (matched.title) targetSet.add(normalizeStr(matched.title))
      }
    }

    // 4. Fetch registrations for user
    const { data: userRegs } = await supabaseServer
      .from("registrations")
      .select("id, course_id, course_slug, status, created_at, notes")
      .ilike("email", userEmail)

    const regIdToSlug = new Map<string, string>()

    if (userRegs && userRegs.length > 0) {
      userRegs.forEach(r => {
        let slugOrId = r.course_slug || (r.course_id ? String(r.course_id) : "")
        if (!slugOrId && r.notes) {
          try {
            const parsed = typeof r.notes === "string" ? JSON.parse(r.notes) : r.notes
            if (parsed?.course_slug) slugOrId = parsed.course_slug
          } catch(e) {}
        }

        if (slugOrId) {
          regIdToSlug.set(r.id, slugOrId)
          if (["paye", "confirmed", "active"].includes(r.status)) {
            addCourseIdentifiers(confirmedSet, slugOrId)
          } else {
            addCourseIdentifiers(pendingSet, slugOrId)
            pendingDetails.push({
              course_slug: slugOrId,
              created_at: r.created_at,
              status: r.status,
              source: "registration"
            })
          }
        }
      })
    }

    // 5. Fetch payments
    const { data: allPays } = await supabaseServer
      .from("payments")
      .select("id, amount, currency, method, status, transaction_ref, created_at, registration_id, course_id, course_title")

    if (allPays && allPays.length > 0) {
      allPays.forEach((p: any) => {
        const matchingSlug = p.registration_id ? regIdToSlug.get(p.registration_id) : null
        const targetIdentifier = matchingSlug || p.course_title || (p.course_id ? String(p.course_id) : "")

        if (p.registration_id && regIdToSlug.has(p.registration_id)) {
          if (p.status === "confirmed") {
            addCourseIdentifiers(confirmedSet, targetIdentifier)
          } else {
            addCourseIdentifiers(pendingSet, targetIdentifier)
            pendingDetails.push({
              course_slug: targetIdentifier,
              created_at: p.created_at,
              status: p.status,
              payment_method: p.method,
              amount: p.amount,
              ref: p.transaction_ref
            })
          }
        }
      })
    }

    // 6. Fetch user_courses (both by email and userId)
    let ucQuery = supabaseServer
      .from("user_courses")
      .select("course_slug, course_id, status, created_at, amount_paid, payment_method")

    if (userId) {
      ucQuery = ucQuery.or(`user_email.ilike.${userEmail},user_id.eq.${userId}`)
    } else {
      ucQuery = ucQuery.ilike("user_email", userEmail)
    }

    const { data: userCourses } = await ucQuery

    if (userCourses && userCourses.length > 0) {
      userCourses.forEach((uc: any) => {
        const identifier = uc.course_slug || (uc.course_id ? String(uc.course_id) : "")
        if (["active", "confirmed", "completed"].includes(uc.status)) {
          addCourseIdentifiers(confirmedSet, identifier)
        } else {
          addCourseIdentifiers(pendingSet, identifier)
          pendingDetails.push({
            course_slug: identifier,
            created_at: uc.created_at,
            status: uc.status,
            source: "user_courses"
          })
        }
      })
    }

    Array.from(confirmedSet).forEach(c => pendingSet.delete(c))

    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      isAdmin: false,
      confirmed: Array.from(confirmedSet),
      pending: Array.from(pendingSet),
      pendingDetails
    })
  } catch (error: any) {
    console.error("Error in user enrollments API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

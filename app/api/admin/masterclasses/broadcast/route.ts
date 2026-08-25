import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendMasterclassReminderEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { reminderType = "j_minus_2", customMessage = "", testEmail } = body

    // 1. Récupérer la session active
    const { data: rows } = await supabaseServer
      .from("site_settings")
      .select("key, value")

    const settingsMap: Record<string, string> = {}
    if (rows && rows.length > 0) {
      rows.forEach((r) => {
        if (r.key && r.value !== undefined) {
          settingsMap[r.key] = r.value
        }
      })
    }

    const sessionData = {
      title: settingsMap.masterclass_title || "Masterclass IA Hebdomadaire",
      description: settingsMap.masterclass_description || "",
      scheduledAt: settingsMap.masterclass_date || "",
      dateDisplay: settingsMap.masterclass_date_display || "",
      meetUrl: settingsMap.masterclass_meet_url || "https://meet.google.com/qvt-gkyh-yuv",
      youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://www.youtube.com/@LeGuideIA",
      instructor: "Alfred Dah"
    }

    // 2. Si c'est un envoi de test
    if (testEmail) {
      const result = await sendMasterclassReminderEmail(
        "Testeur Admin",
        testEmail.trim(),
        sessionData,
        reminderType,
        customMessage
      )
      return NextResponse.json({
        success: true,
        message: `Email test envoyé avec succès à ${testEmail}`,
        result
      })
    }

    // 3. Récupérer tous les inscrits à la Masterclass
    const { data: participants, error: regErr } = await supabaseServer
      .from("registrations")
      .select("id, full_name, email")
      .or("course_slug.eq.masterclass-ia,source.eq.masterclass_dimanche")

    if (regErr || !participants || participants.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Aucun participant inscrit trouvé pour cette Masterclass."
      }, { status: 400 })
    }

    let sentCount = 0
    let failedCount = 0

    for (const p of participants) {
      if (p.email && p.email.includes("@")) {
        try {
          const res = await sendMasterclassReminderEmail(
            p.full_name || "Apprenant",
            p.email.trim(),
            sessionData,
            reminderType,
            customMessage
          )
          if (res.success) {
            sentCount++
          } else {
            failedCount++
          }
        } catch (e) {
          console.error(`Failed to send reminder to ${p.email}:`, e)
          failedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Rappels envoyés : ${sentCount} réussis, ${failedCount} échoués sur ${participants.length} inscrits.`,
      sentCount,
      failedCount,
      total: participants.length
    })
  } catch (error: any) {
    console.error("Broadcast masterclass reminder error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

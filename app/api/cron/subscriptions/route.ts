import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { getDaysRemaining } from "@/lib/subscriptions"
import { sendSubscriptionExpiringSoonEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    // Autoriser si pas de secret configuré ou si le token correspond
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(req.url)
      const querySecret = url.searchParams.get("key")
      if (querySecret !== cronSecret) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
      }
    }

    // 1. Récupérer tous les abonnements actifs depuis Supabase
    const { data: dbSubs, error: dbErr } = await supabaseServer
      .from("subscriptions")
      .select("*")
      .eq("status", "active")

    if (dbErr) {
      console.error("Cron subscriptions fetch error:", dbErr)
    }

    const activeList = dbSubs || []
    let expiredCount = 0
    let remindersSentCount = 0

    const now = Date.now()

    for (const sub of activeList) {
      const expiryTime = new Date(sub.expires_at).getTime()
      const days = getDaysRemaining(sub.expires_at)
      const parsedNotes = typeof sub.notes === "string" ? (() => { try { return JSON.parse(sub.notes) } catch (_) { return {} } })() : (sub.notes || {})

      // Cas 1 : Abonnement expiré
      if (expiryTime < now) {
        try {
          await supabaseServer
            .from("subscriptions")
            .update({ status: "expired" })
            .eq("id", sub.id)

          expiredCount++
        } catch (expErr) {
          console.warn("Failed to mark subscription as expired:", expErr)
        }
        continue
      }

      // Cas 2 : Relance à J-7, J-3, J-1 avant expiration
      if (days === 7 || days === 3 || days === 1) {
        const reminderKey = `reminder_${days}d`
        const alreadySent = parsedNotes?.reminders?.[reminderKey]

        if (!alreadySent) {
          try {
            await sendSubscriptionExpiringSoonEmail(
              sub.full_name || "Membre Le Guide IA",
              sub.email,
              sub.plan_label || (sub.plan === "1_year" ? "Pass Annuel (1 An)" : "Pass Trimestriel (3 Mois)"),
              sub.expires_at,
              days
            )

            const updatedNotes = {
              ...parsedNotes,
              reminders: {
                ...(parsedNotes.reminders || {}),
                [reminderKey]: new Date().toISOString()
              }
            }

            await supabaseServer
              .from("subscriptions")
              .update({ notes: JSON.stringify(updatedNotes) })
              .eq("id", sub.id)

            remindersSentCount++
          } catch (mailErr) {
            console.warn(`Failed to send reminder to ${sub.email}:`, mailErr)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: activeList.length,
      expired: expiredCount,
      remindersSent: remindersSentCount,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error("Cron subscriptions error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return GET(req)
}

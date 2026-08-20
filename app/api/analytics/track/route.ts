import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    let body: any = {}
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      body = await req.json()
    } else {
      const text = await req.text()
      try {
        body = JSON.parse(text)
      } catch {
        body = {}
      }
    }

    const {
      path = "/",
      full_path = "/",
      visitor_id = "anon",
      session_id,
      device_type = "desktop",
      referrer = ""
    } = body

    // Ne jamais enregistrer les visites de l'espace admin ou des routes API
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ success: true, ignored: true })
    }

    const userAgent = req.headers.get("user-agent") || ""
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null

    const visitRecord = {
      path,
      full_path,
      visitor_id,
      session_id: session_id || null,
      device_type,
      referrer: referrer || null,
      user_agent: userAgent ? userAgent.substring(0, 255) : null,
      country,
      ip: ip ? ip.substring(0, 45) : null,
      created_at: new Date().toISOString()
    }

    // Insert into Supabase table `site_visits`
    const { error } = await supabaseServer.from("site_visits").insert(visitRecord)

    if (error) {
      // If table does not exist or column error, fallback without blocking
      console.warn("Analytics insert notice (table might need creation):", error.message)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 200 })
  }
}

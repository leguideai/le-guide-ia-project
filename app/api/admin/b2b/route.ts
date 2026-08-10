import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: b2bRequests, error } = await supabaseServer
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("B2B requests fetch warning:", error.message)
      return NextResponse.json({ success: true, requests: [] })
    }

    return NextResponse.json({ success: true, requests: b2bRequests || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { requestId, status } = await req.json()

    if (!requestId || !status) {
      return NextResponse.json({ error: "requestId et status requis." }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("service_requests")
      .update({ status })
      .eq("id", requestId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: data, message: `Statut B2B mis à jour : ${status}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

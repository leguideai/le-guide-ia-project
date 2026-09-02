import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("faqs")
      .select("*")
      .order("created_at", { ascending: true })

    if (error || !data) {
      return NextResponse.json({ faqs: [] })
    }

    return NextResponse.json({ faqs: data })
  } catch (err) {
    return NextResponse.json({ faqs: [] })
  }
}

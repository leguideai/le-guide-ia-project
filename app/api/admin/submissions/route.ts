import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: submissions, error } = await supabaseServer
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Submissions table fetch warning:", error.message)
      return NextResponse.json({ success: true, submissions: [] })
    }

    return NextResponse.json({ success: true, submissions: submissions || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { submissionId, status, score, feedback } = await req.json()

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId requis." }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("submissions")
      .update({
        status: status || "graded",
        score: score || null,
        feedback: feedback || null,
        graded_at: new Date().toISOString()
      })
      .eq("id", submissionId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, submission: data, message: "Devoir noté avec succès." })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

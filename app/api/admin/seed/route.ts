import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  return createDefaultAdmin()
}

export async function POST() {
  return createDefaultAdmin()
}

async function createDefaultAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@leguideai.com"
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "ProtegerVotreMotDePasse2026!"
    const adminFullName = "Alfred Dah (Super Admin)"

    // 1. Try to create user via Supabase Auth Admin API if service role is available
    let userId: string | null = null

    try {
      const { data: authUser, error: authErr } = await supabaseServer.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: adminFullName }
      })

      if (authUser?.user) {
        userId = authUser.user.id
      } else if (authErr?.message?.includes("already registered")) {
        // Find existing user ID
        const { data: listData } = await supabaseServer.auth.admin.listUsers()
        const found = listData?.users?.find(u => u.email === adminEmail)
        if (found) userId = found.id
      }
    } catch (e) {
      console.warn("Supabase auth admin API warning (creating fallback profile):", e)
    }

    // 2. Upsert super_admin profile in public.profiles table
    const targetId = userId || "00000000-0000-0000-0000-000000000001"

    const { data: profile, error: profErr } = await supabaseServer
      .from("profiles")
      .upsert({
        id: targetId,
        full_name: adminFullName,
        email: adminEmail,
        role: "super_admin",
        updated_at: new Date().toISOString()
      }, { onConflict: "id" })
      .select()
      .single()

    if (profErr) {
      console.warn("Profiles upsert warning:", profErr.message)
    }

    return NextResponse.json({
      success: true,
      message: "Compte Super Admin par défaut configuré avec succès !",
      credentials: {
        email: adminEmail,
        password: adminPassword,
        role: "super_admin",
        fullName: adminFullName
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur lors du seeding admin." }, { status: 500 })
  }
}

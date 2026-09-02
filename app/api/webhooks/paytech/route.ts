import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendRegistrationEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) || {}
    const formData = await req.formData().catch(() => null)
    
    const typeEvent = body.type_event || formData?.get("type_event")
    const refCommand = body.ref_command || formData?.get("ref_command")
    const customFieldRaw = body.custom_field || formData?.get("custom_field")
    
    let customField: any = {}
    try {
      customField = typeof customFieldRaw === "string" ? JSON.parse(customFieldRaw) : customFieldRaw || {}
    } catch (e) {
      console.warn("Could not parse custom_field JSON:", customFieldRaw)
    }

    const email = customField.email || body.email
    const fullName = customField.fullName || body.client_name || "Membre Le Guide IA"
    const courseSlug = customField.courseSlug || "bootcamp-ia-pro"

    console.log("PayTech IPN Received:", { typeEvent, refCommand, email, courseSlug })

    if (refCommand) {
      await supabaseServer
        .from("payments")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("transaction_ref", refCommand)
    }

    if (email) {
      await supabaseServer
        .from("registrations")
        .update({ status: "paye" })
        .eq("email", email.toLowerCase())

      let userId: string | null = null
      const { data: existingUser } = await supabaseServer
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .single()

      if (existingUser) {
        userId = existingUser.id
      } else {
        const randomPassword = Math.random().toString(36).slice(-10) + "Lgi!"
        const { data: newUser, error: createErr } = await supabaseServer.auth.admin.createUser({
          email: email.toLowerCase(),
          password: randomPassword,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        })

        if (!createErr && newUser.user) {
          userId = newUser.user.id
        }
      }

      if (userId) {
        const { data: course } = await supabaseServer
          .from("courses")
          .select("id")
          .eq("slug", courseSlug)
          .single()

        if (course) {
          await supabaseServer
            .from("user_courses")
            .upsert({
              user_id: userId,
              course_id: course.id,
              enrolled_at: new Date().toISOString(),
            }, { onConflict: "user_id,course_id" })
        }
      }

      await sendRegistrationEmail(fullName, email.toLowerCase())
    }

    return NextResponse.json({ success: true, message: "IPN Traité avec succès." })
  } catch (error: any) {
    console.error("PayTech Webhook Error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

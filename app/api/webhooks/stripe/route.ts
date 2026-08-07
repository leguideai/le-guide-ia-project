import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendRegistrationEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const payload = await req.text()
    const event = JSON.parse(payload)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const refCommand = session.client_reference_id
      const metadata = session.metadata || {}

      const email = session.customer_email || metadata.email
      const fullName = metadata.fullName || "Membre Le Guide IA"
      const courseSlug = metadata.courseSlug || "bootcamp-ia-pro"

      console.log("Stripe Webhook Received:", { refCommand, email, courseSlug })

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
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Stripe Webhook Error:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

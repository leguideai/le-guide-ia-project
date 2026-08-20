import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const envPath = path.resolve(process.cwd(), ".env.local")
const envContent = fs.readFileSync(envPath, "utf8")
const env = {}
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    let val = match[2] || ""
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
    env[match[1]] = val.trim()
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const email = "sambadiop161@gmail.com"
  const fullName = "Samba Diop"
  const whatsapp = "+221779008090"
  const country = "CI"

  // 1. Get business course
  const { data: businessCourse } = await supabase
    .from("courses")
    .select("id, title, slug")
    .or("slug.eq.bootcamp-business-exec,slug.eq.bootcamp-business,title.ilike.%business%")
    .limit(1)
    .maybeSingle()

  const courseSlug = businessCourse?.slug || "bootcamp-business-exec"
  const courseId = businessCourse?.id || null

  console.log("Business Course:", { courseSlug, courseId })

  // 2. Upsert registration
  const { data: reg, error: regErr } = await supabase
    .from("registrations")
    .upsert({
      full_name: fullName,
      email: email,
      whatsapp: whatsapp,
      country: country,
      source: "checkout_stripe",
      course_slug: courseSlug,
      course_id: courseId,
      status: "paye",
      notes: JSON.stringify({
        course_slug: courseSlug,
        course_title: businessCourse?.title || "Bootcamp IA & Business",
        payment_method: "stripe"
      })
    }, { onConflict: "email" })
    .select()
    .single()

  console.log("Registration updated:", reg, regErr)

  // 3. Link payments
  if (reg?.id) {
    const { data: payUpdate, error: payErr } = await supabase
      .from("payments")
      .update({
        registration_id: reg.id,
        status: "confirmed"
      })
      .eq("method", "stripe")
      .select()

    console.log("Payments linked:", payUpdate?.length, payErr)
  }

  // 4. Activate in user_courses
  const { data: uc, error: ucErr } = await supabase
    .from("user_courses")
    .upsert({
      user_email: email,
      course_slug: courseSlug,
      course_id: courseId,
      status: "active",
      amount_paid: 1,
      payment_method: "stripe",
      updated_at: new Date().toISOString()
    }, { onConflict: "user_email,course_slug" })
    .select()

  console.log("user_courses activated:", uc, ucErr)
}

run()

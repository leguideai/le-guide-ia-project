import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import {
  getR2Config,
  r2PublicUrl,
  createMultipartUpload,
  presignUploadPart,
  completeMultipartUpload,
  abortMultipartUpload,
} from "@/lib/r2"

export const dynamic = "force-dynamic"

// Seules les vidéos sont stockées sur R2 (PDF et images restent sur Supabase Storage)
const VIDEO_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  // Les .mov H.264 sont lus par tous les navigateurs lorsqu'ils sont servis en video/mp4
  mov: "video/mp4",
  webm: "video/webm",
}
const MAX_VIDEO_BYTES = 10 * 1024 ** 3 // 10 Go
const PART_SIZE = 10 * 1024 ** 2 // 10 Mo — R2 exige des morceaux de taille identique (sauf le dernier)
const MAX_PARTS_PER_SIGN = 50

async function requireAdmin(req: Request): Promise<NextResponse | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token) {
    return NextResponse.json({ error: "Session requise. Reconnectez-vous." }, { status: 401 })
  }
  const { data: userData } = await supabaseServer.auth.getUser(token)
  if (!userData?.user) {
    return NextResponse.json({ error: "Session expirée. Reconnectez-vous." }, { status: 401 })
  }
  const { data: profile } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 })
  }
  return null
}

function isValidUploadRef(key: unknown, uploadId: unknown): key is string {
  return typeof key === "string" && key.startsWith("videos/") && !key.includes("..") && typeof uploadId === "string" && uploadId.length > 0
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const cfg = getR2Config()
  if (!cfg) {
    return NextResponse.json(
      { error: "Cloudflare R2 n'est pas configuré (variables R2_* manquantes sur le serveur)." },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()
    const { action } = body

    if (action === "create") {
      const fileName = String(body.fileName || "")
      const size = Number(body.size)
      const ext = fileName.split(".").pop()?.toLowerCase() || ""
      const contentType = VIDEO_TYPES[ext]

      if (!contentType) {
        return NextResponse.json(
          { error: "Format non supporté. Formats acceptés : MP4, MOV, M4V, WEBM." },
          { status: 400 }
        )
      }
      if (!Number.isFinite(size) || size <= 0) {
        return NextResponse.json({ error: "Fichier vide ou taille invalide." }, { status: 400 })
      }
      if (size > MAX_VIDEO_BYTES) {
        return NextResponse.json({ error: "Vidéo trop lourde (10 Go maximum)." }, { status: 400 })
      }

      const folder = String(body.folder || "divers").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 40) || "divers"
      const baseName = fileName
        .slice(0, -(ext.length + 1))
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "video"
      const month = new Date().toISOString().slice(0, 7)
      // Segment aléatoire : les URLs publiques ne sont pas devinables
      const random = crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      const key = `videos/${folder}/${month}/${Date.now()}-${random}-${baseName}.${ext}`

      const uploadId = await createMultipartUpload(cfg, key, contentType)

      return NextResponse.json({
        key,
        uploadId,
        partSize: PART_SIZE,
        url: r2PublicUrl(cfg, key),
      })
    }

    if (action === "sign") {
      const { key, uploadId } = body
      const partNumbers: number[] = Array.isArray(body.partNumbers) ? body.partNumbers : []
      if (!isValidUploadRef(key, uploadId)) {
        return NextResponse.json({ error: "Référence d'upload invalide." }, { status: 400 })
      }
      if (
        partNumbers.length === 0 ||
        partNumbers.length > MAX_PARTS_PER_SIGN ||
        !partNumbers.every(n => Number.isInteger(n) && n >= 1 && n <= 10000)
      ) {
        return NextResponse.json({ error: "Numéros de morceaux invalides." }, { status: 400 })
      }

      const entries = await Promise.all(
        partNumbers.map(async n => [n, await presignUploadPart(cfg, key, uploadId, n)] as const)
      )
      return NextResponse.json({ urls: Object.fromEntries(entries) })
    }

    if (action === "complete") {
      const { key, uploadId } = body
      const parts: { partNumber: number; etag: string }[] = Array.isArray(body.parts) ? body.parts : []
      if (!isValidUploadRef(key, uploadId)) {
        return NextResponse.json({ error: "Référence d'upload invalide." }, { status: 400 })
      }
      if (parts.length === 0 || !parts.every(p => Number.isInteger(p?.partNumber) && typeof p?.etag === "string")) {
        return NextResponse.json({ error: "Liste de morceaux invalide." }, { status: 400 })
      }

      await completeMultipartUpload(cfg, key, uploadId, parts)
      return NextResponse.json({ success: true, url: r2PublicUrl(cfg, key) })
    }

    if (action === "abort") {
      const { key, uploadId } = body
      if (!isValidUploadRef(key, uploadId)) {
        return NextResponse.json({ error: "Référence d'upload invalide." }, { status: 400 })
      }
      await abortMultipartUpload(cfg, key, uploadId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 })
  } catch (error: any) {
    console.error("R2 upload error:", error)
    return NextResponse.json({ error: error.message || "Erreur Cloudflare R2." }, { status: 500 })
  }
}

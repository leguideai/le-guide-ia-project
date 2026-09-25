"use client"

import { supabase } from "@/lib/supabase"

// Upload direct navigateur → Cloudflare R2 en multipart :
// le fichier ne transite jamais par notre serveur (pas de limite Vercel),
// chaque morceau est réessayé indépendamment en cas de coupure réseau.

export const R2_VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.m4v,.mov,.webm"

const CONCURRENCY = 4
const SIGN_BATCH = 20
const MAX_RETRIES = 4

export interface R2UploadProgress {
  loaded: number
  total: number
  percent: number
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/") || /\.(mp4|m4v|mov|webm)$/i.test(file.name)
}

// Jeton relu à chaque appel : Supabase le rafraîchit en arrière-plan (expire après 1 h)
async function callApi(payload: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error("Session expirée. Reconnectez-vous pour téléverser une vidéo.")
  const res = await fetch("/api/admin/r2-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `Erreur serveur (${res.status})`)
  return data
}

function putPart(url: string, blob: Blob, onProgress: (loaded: number) => void, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Téléversement annulé.", "AbortError"))
      return
    }
    const xhr = new XMLHttpRequest()
    const abort = () => xhr.abort()
    signal.addEventListener("abort", abort)
    xhr.onloadend = () => signal.removeEventListener("abort", abort)
    xhr.open("PUT", url)
    xhr.upload.onprogress = e => onProgress(e.loaded)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag")
        if (!etag) {
          reject(Object.assign(
            new Error("ETag illisible : ajoutez « ETag » aux ExposeHeaders de la règle CORS du bucket R2."),
            { fatal: true }
          ))
          return
        }
        resolve(etag)
      } else {
        reject(Object.assign(new Error(`R2 a refusé le morceau (HTTP ${xhr.status})`), { status: xhr.status }))
      }
    }
    xhr.onerror = () => reject(new Error("Coupure réseau (ou règle CORS du bucket R2 manquante pour ce domaine)."))
    xhr.onabort = () => reject(new DOMException("Téléversement annulé.", "AbortError"))
    xhr.send(blob)
  })
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function uploadVideoToR2(
  file: File,
  { folder, onProgress, signal }: { folder?: string; onProgress?: (p: R2UploadProgress) => void; signal: AbortSignal }
): Promise<string> {
  // Contrôleur interne : un échec définitif sur un morceau stoppe aussi les envois en parallèle
  const controller = new AbortController()
  signal.addEventListener("abort", () => controller.abort(), { once: true })

  const { key, uploadId, partSize, url } = await callApi({
    action: "create",
    fileName: file.name,
    size: file.size,
    folder,
  })

  const totalParts = Math.ceil(file.size / partSize)
  const loadedByPart = new Array<number>(totalParts + 1).fill(0)
  const reportProgress = () => {
    const loaded = loadedByPart.reduce((a, b) => a + b, 0)
    onProgress?.({ loaded, total: file.size, percent: Math.min(99, Math.floor((loaded / file.size) * 100)) })
  }

  // URLs pré-signées demandées par lots, à la demande (elles expirent après 1 h)
  const batches = new Map<number, Promise<Record<string, string>>>()
  const getPartUrl = async (partNumber: number): Promise<string> => {
    const batch = Math.floor((partNumber - 1) / SIGN_BATCH)
    if (!batches.has(batch)) {
      const first = batch * SIGN_BATCH + 1
      const partNumbers = Array.from({ length: Math.min(SIGN_BATCH, totalParts - first + 1) }, (_, i) => first + i)
      const request = callApi({ action: "sign", key, uploadId, partNumbers }).then(d => d.urls)
      request.catch(() => batches.delete(batch))
      batches.set(batch, request)
    }
    return (await batches.get(batch)!)[partNumber]
  }

  const parts: { partNumber: number; etag: string }[] = []
  let nextPart = 1

  const uploadPart = async (partNumber: number) => {
    const blob = file.slice((partNumber - 1) * partSize, Math.min(partNumber * partSize, file.size))
    for (let attempt = 0; ; attempt++) {
      try {
        const etag = await putPart(await getPartUrl(partNumber), blob, loaded => {
          loadedByPart[partNumber] = loaded
          reportProgress()
        }, controller.signal)
        loadedByPart[partNumber] = blob.size
        parts.push({ partNumber, etag })
        return
      } catch (err: any) {
        if (controller.signal.aborted || err?.fatal || attempt >= MAX_RETRIES) throw err
        loadedByPart[partNumber] = 0
        // URL expirée : on force une nouvelle signature du lot
        if (err?.status === 403) batches.delete(Math.floor((partNumber - 1) / SIGN_BATCH))
        await wait(1000 * 2 ** attempt)
      }
    }
  }

  const worker = async () => {
    while (nextPart <= totalParts) {
      if (controller.signal.aborted) throw new DOMException("Téléversement annulé.", "AbortError")
      await uploadPart(nextPart++)
    }
  }

  try {
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, totalParts) }, worker))
    await callApi({ action: "complete", key, uploadId, parts })
    onProgress?.({ loaded: file.size, total: file.size, percent: 100 })
    return url
  } catch (err) {
    controller.abort()
    // Libère les morceaux déjà envoyés pour ne pas payer de stockage orphelin
    callApi({ action: "abort", key, uploadId }).catch(() => {})
    throw err
  }
}

// Client Cloudflare R2 (API compatible S3) — usage serveur uniquement.
// Signature AWS SigV4 implémentée avec Web Crypto : aucune dépendance,
// fonctionne aussi bien sur Vercel (Node) que sur Cloudflare Workers.

const REGION = "auto"
const SERVICE = "s3"

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBaseUrl: string
}

export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  const bucket = process.env.R2_BUCKET_NAME?.trim()
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "")

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) return null
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl }
}

export function r2PublicUrl(cfg: R2Config, key: string): string {
  return `${cfg.publicBaseUrl}/${encodeKey(key)}`
}

// ─── Primitives SigV4 ─────────────────────────────────────────────────────────

const encoder = new TextEncoder()

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, "0")).join("")
}

async function sha256Hex(data: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(data)))
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data))
}

// Encodage URI strict RFC 3986 exigé par SigV4
function uriEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
}

function encodeKey(key: string): string {
  return key.split("/").map(uriEncode).join("/")
}

function canonicalQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map(k => `${uriEncode(k)}=${uriEncode(params[k])}`)
    .join("&")
}

function amzDates(now = new Date()) {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
  return { amzDate, dateStamp: amzDate.slice(0, 8) }
}

async function signingKey(secret: string, dateStamp: string): Promise<ArrayBuffer> {
  const kDate = await hmac(encoder.encode(`AWS4${secret}`), dateStamp)
  const kRegion = await hmac(kDate, REGION)
  const kService = await hmac(kRegion, SERVICE)
  return hmac(kService, "aws4_request")
}

async function signature(cfg: R2Config, dateStamp: string, amzDate: string, canonicalRequest: string): Promise<string> {
  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n")
  return toHex(await hmac(await signingKey(cfg.secretAccessKey, dateStamp), stringToSign))
}

function host(cfg: R2Config) {
  return `${cfg.accountId}.r2.cloudflarestorage.com`
}

// URL pré-signée (auth dans la query string) — utilisée par le navigateur pour envoyer
// directement les morceaux de fichier vers R2, sans transiter par notre serveur.
export async function presignUrl(
  cfg: R2Config,
  method: "GET" | "PUT" | "HEAD",
  key: string,
  query: Record<string, string> = {},
  expiresIn = 3600
): Promise<string> {
  const { amzDate, dateStamp } = amzDates()
  const path = `/${cfg.bucket}/${encodeKey(key)}`
  const params: Record<string, string> = {
    ...query,
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${cfg.accessKeyId}/${dateStamp}/${REGION}/${SERVICE}/aws4_request`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  }
  const qs = canonicalQuery(params)
  const canonicalRequest = [method, path, qs, `host:${host(cfg)}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n")
  const sig = await signature(cfg, dateStamp, amzDate, canonicalRequest)
  return `https://${host(cfg)}${path}?${qs}&X-Amz-Signature=${sig}`
}

// Requête signée côté serveur (auth dans l'en-tête Authorization)
async function r2Request(
  cfg: R2Config,
  method: "POST" | "DELETE",
  key: string,
  query: Record<string, string>,
  { body = "", headers = {} }: { body?: string; headers?: Record<string, string> } = {}
): Promise<Response> {
  const { amzDate, dateStamp } = amzDates()
  const path = `/${cfg.bucket}/${encodeKey(key)}`
  const payloadHash = await sha256Hex(body)

  const allHeaders: Record<string, string> = {
    ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v.trim()])),
    host: host(cfg),
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  }
  const signedHeaderNames = Object.keys(allHeaders).sort()
  const canonicalHeaders = signedHeaderNames.map(h => `${h}:${allHeaders[h]}\n`).join("")
  const signedHeaders = signedHeaderNames.join(";")

  const qs = canonicalQuery(query)
  const canonicalRequest = [method, path, qs, canonicalHeaders, signedHeaders, payloadHash].join("\n")
  const sig = await signature(cfg, dateStamp, amzDate, canonicalRequest)

  const { host: _host, ...fetchHeaders } = allHeaders
  return fetch(`https://${host(cfg)}${path}${qs ? `?${qs}` : ""}`, {
    method,
    headers: {
      ...fetchHeaders,
      Authorization: `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${dateStamp}/${REGION}/${SERVICE}/aws4_request, SignedHeaders=${signedHeaders}, Signature=${sig}`,
    },
    body: body || undefined,
  })
}

async function ensureOk(res: Response, operation: string): Promise<string> {
  const text = await res.text()
  if (!res.ok) {
    const code = text.match(/<Code>([^<]+)<\/Code>/)?.[1]
    const message = text.match(/<Message>([^<]+)<\/Message>/)?.[1]
    throw new Error(`R2 ${operation} a échoué (${res.status}${code ? ` ${code}` : ""})${message ? ` : ${message}` : ""}`)
  }
  return text
}

// ─── Upload multipart ─────────────────────────────────────────────────────────

export async function createMultipartUpload(cfg: R2Config, key: string, contentType: string): Promise<string> {
  const res = await r2Request(cfg, "POST", key, { uploads: "" }, {
    headers: {
      "content-type": contentType,
      // Clés uniques (horodatage + aléa) : le fichier ne change jamais, cache long possible
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
  const xml = await ensureOk(res, "CreateMultipartUpload")
  const uploadId = xml.match(/<UploadId>([^<]+)<\/UploadId>/)?.[1]
  if (!uploadId) throw new Error("R2 CreateMultipartUpload : UploadId manquant dans la réponse.")
  return uploadId
}

export function presignUploadPart(cfg: R2Config, key: string, uploadId: string, partNumber: number) {
  return presignUrl(cfg, "PUT", key, { partNumber: String(partNumber), uploadId })
}

export async function completeMultipartUpload(
  cfg: R2Config,
  key: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[]
): Promise<void> {
  const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  const body =
    "<CompleteMultipartUpload>" +
    [...parts]
      .sort((a, b) => a.partNumber - b.partNumber)
      .map(p => `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>${escapeXml(p.etag)}</ETag></Part>`)
      .join("") +
    "</CompleteMultipartUpload>"

  const res = await r2Request(cfg, "POST", key, { uploadId }, { body, headers: { "content-type": "application/xml" } })
  const xml = await ensureOk(res, "CompleteMultipartUpload")
  // S3 peut renvoyer 200 avec une erreur dans le corps
  if (xml.includes("<Error>")) {
    const message = xml.match(/<Message>([^<]+)<\/Message>/)?.[1] || "erreur inconnue"
    throw new Error(`R2 CompleteMultipartUpload a échoué : ${message}`)
  }
}

export async function abortMultipartUpload(cfg: R2Config, key: string, uploadId: string): Promise<void> {
  const res = await r2Request(cfg, "DELETE", key, { uploadId })
  if (!res.ok && res.status !== 404) await ensureOk(res, "AbortMultipartUpload")
}

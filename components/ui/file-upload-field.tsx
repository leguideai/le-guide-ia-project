"use client"

import { useState, useRef } from "react"
import { Upload, X, ExternalLink, FileImage, FileText, Film, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface FileUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  accept?: string
  bucket?: string
  folder?: string
  placeholder?: string
  preview?: "image" | "none"
  hint?: string
  helperText?: string
}

export function FileUploadField({
  label,
  value,
  onChange,
  accept = "image/*",
  bucket = "resources-files",
  folder = "uploads",
  placeholder = "https://... ou téléversez un fichier",
  preview = "image",
  hint,
  helperText
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isImage = accept.startsWith("image")
  const isPdf = accept.includes("pdf") || accept.includes("application")
  const isVideo = accept.includes("video")

  const icon = isImage ? <FileImage className="size-4" /> : isVideo ? <Film className="size-4" /> : <FileText className="size-4" />

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    const targetBucket = bucket || "resources-files"
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const fileName = `${folder}/${Date.now()}_${safeName}`

    try {
      // 1. Tenter l'Upload Direct Client vers Supabase Storage (Bypasse la limite de 4.5MB Vercel)
      try {
        const { data: uploadData, error: uploadErr } = await supabase
          .storage
          .from(targetBucket)
          .upload(fileName, file, {
            contentType: file.type || "application/octet-stream",
            upsert: true
          })

        if (!uploadErr && uploadData?.path) {
          const { data: publicUrlData } = supabase.storage.from(targetBucket).getPublicUrl(fileName)
          if (publicUrlData?.publicUrl) {
            onChange(publicUrlData.publicUrl)
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ""
            return
          }
        }
      } catch (clientErr) {
        console.warn("Client direct upload bypassed, trying server API fallback:", clientErr)
      }

      // 2. Repli vers l'API Serverless si l'upload direct n'a pas pu être finalisé
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", targetBucket)
      formData.append("folder", folder)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      })

      const resText = await res.text()
      let data: any
      try {
        data = JSON.parse(resText)
      } catch (jsonErr) {
        if (res.status === 413 || resText.toLowerCase().includes("too large") || resText.startsWith("Request En")) {
          throw new Error("Ce fichier dépasse la limite autorisée par le serveur Vercel (4.5MB max). Pour une vidéo longue, nous vous conseillons de coller son lien YouTube.")
        }
        throw new Error(`Erreur serveur (${res.status}) : ${resText.slice(0, 100)}`)
      }

      if (data?.url) {
        onChange(data.url)
      } else {
        setError(data?.error || "Erreur lors du téléversement du fichier.")
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "Erreur réseau lors du téléversement.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleClear() {
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2 text-left">
      <label className="text-xs font-bold text-slate-700 block">{label}</label>

      {/* Upload Button */}
      <label className={`flex items-center justify-center gap-2 w-full border border-dashed rounded-xl px-3 py-2.5 text-xs font-bold cursor-pointer transition-all ${
        uploading
          ? "bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed"
          : "bg-[#F4F6F8] hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 border-slate-300 hover:border-primary/60"
      }`}>
        {uploading ? (
          <>
            <div className="size-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            <span>Téléversement direct vers Supabase...</span>
          </>
        ) : (
          <>
            <Upload className="size-4 text-primary" />
            <span>Uploader depuis mon ordinateur</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={uploading}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* URL Input */}
      <div className="relative flex items-center gap-2">
        <div className="absolute left-3 text-slate-400">
          {icon}
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-16 py-2 text-slate-800 outline-none focus:border-primary font-mono text-[11px] placeholder:text-slate-400 shadow-2xs"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <>
              {(isImage || value.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) && (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors" title="Voir l'image">
                  <ExternalLink className="size-3.5" />
                </a>
              )}
              <button type="button" onClick={handleClear} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer" title="Effacer">
                <X className="size-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-start gap-1.5 leading-snug">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Hint */}
      {(hint || helperText) && !error && (
        <p className="text-[10px] text-slate-500">{hint || helperText}</p>
      )}

      {/* Image Preview Compact */}
      {preview === "image" && value && value.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i) && (
        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 group">
          <img
            src={value}
            alt="Aperçu"
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xs"
            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/60 backdrop-blur-xs transition-opacity rounded-xl">
            <a href={value} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-md">
              <ExternalLink className="size-3.5 text-primary" /> Voir en plein écran
            </a>
          </div>
        </div>
      )}

      {/* File Preview (non-image) */}
      {preview !== "image" && value && (
        <div className="flex items-center gap-2 bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2">
          {icon}
          <span className="text-[11px] text-slate-600 font-mono truncate flex-1">{value.split("/").pop()}</span>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary text-[10px] font-bold hover:underline flex items-center gap-1">
            <ExternalLink className="size-3" /> Ouvrir
          </a>
        </div>
      )}
    </div>
  )
}

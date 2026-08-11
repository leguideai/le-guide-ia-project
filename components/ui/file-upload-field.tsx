"use client"

import { useState, useRef } from "react"
import { Upload, X, ExternalLink, FileImage, FileText, Film } from "lucide-react"

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
}

export function FileUploadField({
  label,
  value,
  onChange,
  accept = "image/*",
  bucket = "course-posters",
  folder = "uploads",
  placeholder = "https://... ou téléversez un fichier",
  preview = "image",
  hint
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
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", bucket)
      formData.append("folder", folder)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()

      if (data.url) {
        onChange(data.url)
      } else {
        setError(data.error || "Erreur lors du téléversement.")
      }
    } catch (err: any) {
      setError("Erreur réseau : " + err.message)
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
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-300 block">{label}</label>

      {/* Upload Button */}
      <label className={`flex items-center justify-center gap-2 w-full border border-dashed rounded-xl px-3 py-2.5 text-xs font-bold cursor-pointer transition-all ${
        uploading
          ? "bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed"
          : "bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 hover:text-white border-slate-700 hover:border-primary/50"
      }`}>
        {uploading ? (
          <>
            <div className="size-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            <span>Téléversement vers Supabase...</span>
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
        <div className="absolute left-3 text-slate-500">
          {icon}
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-16 py-2 text-white outline-none focus:border-primary font-mono text-[11px] placeholder:text-slate-600"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <>
              {(isImage || value.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) && (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-primary transition-colors">
                  <ExternalLink className="size-3.5" />
                </a>
              )}
              <button type="button" onClick={handleClear} className="text-slate-500 hover:text-red-400 transition-colors">
                <X className="size-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <X className="size-3" /> {error}
        </p>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="text-[10px] text-slate-500">{hint}</p>
      )}

      {/* Image Preview */}
      {preview === "image" && value && value.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i) && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <img
            src={value}
            alt="Aperçu"
            className="w-full h-full object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/60 transition-opacity">
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-white text-xs font-bold flex items-center gap-1">
              <ExternalLink className="size-3.5" /> Voir en plein écran
            </a>
          </div>
        </div>
      )}

      {/* File Preview (non-image) */}
      {preview !== "image" && value && (
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
          {icon}
          <span className="text-[11px] text-slate-400 font-mono truncate flex-1">{value.split("/").pop()}</span>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary text-[10px] font-bold hover:underline flex items-center gap-1">
            <ExternalLink className="size-3" /> Ouvrir
          </a>
        </div>
      )}
    </div>
  )
}

"use client"

// Affichage d'un replay qui peut être soit une vidéo YouTube (youtubeId),
// soit un fichier vidéo hébergé sur Cloudflare R2 (videoUrl).

export interface ReplayVideoSource {
  title?: string
  youtubeId?: string
  videoUrl?: string
}

export function isDirectVideoUrl(url?: string | null): boolean {
  return Boolean(url && /\.(mp4|m4v|mov|webm|ogg)(\?|#|$)/i.test(url.trim()))
}

export function ReplayThumbnail({ replay, className = "" }: { replay: ReplayVideoSource; className?: string }) {
  if (replay.videoUrl) {
    // Pas de miniature générée : on affiche une image de la vidéo (à 3 s) en ne chargeant que les métadonnées
    return (
      <video
        src={`${replay.videoUrl}#t=3`}
        preload="metadata"
        muted
        playsInline
        className={`w-full h-full object-cover pointer-events-none ${className}`}
      />
    )
  }
  return (
    <img
      src={`https://img.youtube.com/vi/${replay.youtubeId}/hqdefault.jpg`}
      alt={replay.title}
      className={`w-full h-full object-cover ${className}`}
      onError={(e: any) => { e.currentTarget.src = "/Logo avatar.png" }}
    />
  )
}

export function DirectVideoPlayer({ src, autoPlay = false }: { src: string; autoPlay?: boolean }) {
  return (
    <video
      key={src}
      src={src}
      controls
      autoPlay={autoPlay}
      playsInline
      preload="metadata"
      controlsList="nodownload"
      onContextMenu={e => e.preventDefault()}
      className="w-full h-full bg-black"
    />
  )
}

export function ReplayPlayer({ replay }: { replay: ReplayVideoSource }) {
  if (replay.videoUrl) return <DirectVideoPlayer src={replay.videoUrl} autoPlay />
  return (
    <iframe
      src={`https://www.youtube.com/embed/${replay.youtubeId}?autoplay=1&rel=0`}
      title={replay.title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full border-0"
    />
  )
}

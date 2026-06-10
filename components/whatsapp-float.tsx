"use client"

export function WhatsAppFloat() {
  // Lien du groupe WhatsApp fourni
  const href = "https://chat.whatsapp.com/KOzRqZO1HwGKIU3g3d3wYa"

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Rejoindre le groupe WhatsApp Le Guide IA"
      className="fixed bottom-5 right-5 z-50 transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <span className="block size-14 overflow-hidden rounded-full shadow-lg shadow-black/40 sm:size-16">
        <img
          src="/logos/whatsapp.webp"
          alt="Contacter Alfred sur WhatsApp"
          className="size-full scale-[1.35] object-cover"
        />
      </span>
    </a>
  )
}

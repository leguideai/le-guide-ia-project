"use client"

export function WhatsAppFloat() {
  // Numéro WhatsApp d'Alfred Dah (format international sans + ni espaces)
  const phone = "19179035628"
  const message = encodeURIComponent(
    "Bonjour Alfred, je suis intéressé(e) par le Challenge IA Gratuit du Guide IA.",
  )
  const href = `https://wa.me/${phone}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contacter Alfred sur WhatsApp"
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

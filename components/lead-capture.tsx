"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Send, Gift, AlertCircle, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function LeadCapture() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    country: "",
    profession: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    // Check if the user has already registered or closed the popup previously
    const dismissed = localStorage.getItem("lead-capture-dismissed")
    const registered = localStorage.getItem("lead-registered")
    if (dismissed || registered) return

    // Set 60-second timer to show the popup
    const timer = setTimeout(() => {
      // Also verify they haven't clicked a buy button (we can track clicks on elements with href="#tarifs" / "#paiement")
      const clickedBuy = localStorage.getItem("clicked-buy")
      if (!clickedBuy) {
        setIsOpen(true)
      }
    }, 60000)

    // Listen to click events to set 'clicked-buy' flag if they click checkout links
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const closestLink = target.closest("a")
      if (closestLink) {
        const href = closestLink.getAttribute("href")
        if (href === "#tarifs" || href === "#paiement") {
          localStorage.setItem("clicked-buy", "true")
          setIsOpen(false)
        }
      }
    }

    document.addEventListener("click", handleGlobalClick)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("click", handleGlobalClick)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem("lead-capture-dismissed", "true")
  }

  const validate = () => {
    if (!form.name.trim()) return "Veuillez entrer votre prénom."
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Veuillez entrer un email valide."
    if (!form.whatsapp.trim()) return "Veuillez entrer votre numéro WhatsApp."
    if (!form.country.trim()) return "Veuillez indiquer votre pays."
    if (!form.profession.trim()) return "Veuillez indiquer votre profession."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const error = validate()
    if (error) {
      setErrorMsg(error)
      setStatus("error")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    try {
      // Use existing registration API endpoint, with custom profile/source
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          dial: "+226", // default placeholder dial, can extract from phone
          whatsapp: form.whatsapp,
          country: form.country,
          profil: form.profession, // map profession to profile
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setStatus("success")
        localStorage.setItem("lead-registered", "true")
        setTimeout(() => setIsOpen(false), 3000)
      } else {
        setErrorMsg(data.error || "Une erreur est survenue. Veuillez réessayer.")
        setStatus("error")
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Impossible de contacter le serveur.")
      setStatus("error")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>

            {status === "success" ? (
              <div className="text-center py-6">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-4">
                  <CheckCircle2 className="size-6" />
                </span>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Bonus réservé !
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Merci {form.name}, vous recevrez le programme complet et votre bonus par e-mail dans quelques instants.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Gift className="size-5 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Offre Spéciale
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="font-heading text-lg font-bold text-foreground leading-tight">
                    Pas encore prêt ?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recevez le programme complet du Bootcamp PRO + un guide de prompts bonus exclusif directement dans votre boîte mail.
                  </p>
                </div>

                {status === "error" && (
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 flex gap-2 text-xs text-rose-500">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="leadName" className="text-xs font-bold text-foreground/80">Prénom</label>
                  <input
                    id="leadName"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Votre prénom"
                    className="h-9 rounded-lg border border-border bg-input/40 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="leadEmail" className="text-xs font-bold text-foreground/80">Email</label>
                  <input
                    id="leadEmail"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="vous@email.com"
                    className="h-9 rounded-lg border border-border bg-input/40 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="leadWhatsapp" className="text-xs font-bold text-foreground/80">WhatsApp</label>
                  <input
                    id="leadWhatsapp"
                    type="text"
                    required
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="Ex: +226 76 00 00 00"
                    className="h-9 rounded-lg border border-border bg-input/40 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="leadCountry" className="text-xs font-bold text-foreground/80">Pays</label>
                  <input
                    id="leadCountry"
                    type="text"
                    required
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="Votre pays de résidence"
                    className="h-9 rounded-lg border border-border bg-input/40 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {/* Profession */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="leadProfession" className="text-xs font-bold text-foreground/80">Profession / Profil</label>
                  <input
                    id="leadProfession"
                    type="text"
                    required
                    value={form.profession}
                    onChange={(e) => setForm({ ...form, profession: e.target.value })}
                    placeholder="Ex: Consultant, Manager, Étudiant..."
                    className="h-9 rounded-lg border border-border bg-input/40 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-bold px-4 text-xs shadow-md disabled:opacity-50 active:scale-98 transition-all cursor-pointer"
                >
                  <Send className="size-3.5" />
                  {status === "loading" ? "Envoi..." : "Recevoir le programme + bonus"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

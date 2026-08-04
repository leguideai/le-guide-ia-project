"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Send, Lock, AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import { isValidPhoneNumber, getExampleNumber, type CountryCode } from "libphonenumber-js"
import examples from "libphonenumber-js/examples.mobile.json"
import { countries } from "@/lib/countries"
import { cn } from "@/lib/utils"

const dialCodes = Array.from(new Set(countries.map((c) => c.dial))).sort(
  (a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")),
)

function isoForDial(dial: string): CountryCode | undefined {
  return countries.find((c) => c.dial === dial)?.code as CountryCode | undefined
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function maxDigitsForDial(dial: string): number {
  const iso = isoForDial(dial)
  if (!iso) return 15
  const example = getExampleNumber(iso, examples)
  return example ? example.nationalNumber.length : 15
}

interface ResourceOptinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  resourceTitle?: string
}

export function ResourceOptinModal({
  isOpen,
  onClose,
  onSuccess,
  resourceTitle,
}: ResourceOptinModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    dial: "+226",
    whatsapp: "",
    country: "",
    profil: "Professionnel",
  })

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [countrySearchQuery, setCountrySearchQuery] = useState("")
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
  )

  const maxDigits = maxDigitsForDial(form.dial)

  const validate = () => {
    if (!form.name.trim()) return "Veuillez entrer votre prénom et nom."
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Veuillez entrer une adresse email valide."
    if (!form.whatsapp.trim()) return "Veuillez entrer votre numéro WhatsApp."

    const fullPhone = `${form.dial}${form.whatsapp.replace(/[^\d]/g, "")}`
    if (!isValidPhoneNumber(fullPhone)) {
      return `Numéro WhatsApp invalide pour l indicatif ${form.dial}.`
    }

    if (!form.country) return "Veuillez sélectionner votre pays de résidence."
    if (!form.profil) return "Veuillez sélectionner votre profil."
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
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          dial: form.dial,
          whatsapp: form.whatsapp,
          country: form.country,
          profil: form.profil,
          source: "Ressources IA (Déblocage)",
        }),
      })

      const data = await response.json()
      if (response.ok || response.status === 409) {
        setStatus("success")
        localStorage.setItem("leguideia_resources_unlocked", "true")
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1200)
      } else {
        setErrorMsg(data.error || "Une erreur est survenue lors de l enregistrement.")
        setStatus("error")
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Une erreur réseau est survenue. Veuillez réessayer.")
      setStatus("error")
    }
  }

  const inputBase =
    "w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/30 bg-card p-6 md:p-8 shadow-2xl glow-blue"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>

            {status === "success" ? (
              <div className="text-center py-8">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-4 animate-bounce">
                  <CheckCircle2 className="size-8" />
                </span>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Accès débloqué !
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Merci {form.name.split(" ")[0]}. Vous avez désormais accès à l intégralité de nos ressources IA.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Lock className="size-4 shrink-0" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Déblocage Gratuit
                  </span>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground leading-tight">
                    Accédez aux ressources IA
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrez vos coordonnées une seule fois pour débloquer l accès direct aux prompts &amp; modèles de Business Plan.
                  </p>
                  {resourceTitle && (
                    <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs text-primary font-semibold flex items-center gap-2">
                      <Sparkles className="size-4 shrink-0" />
                      <span className="truncate">Ressource : {resourceTitle}</span>
                    </div>
                  )}
                </div>

                {status === "error" && (
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 flex gap-2 text-xs text-rose-500">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="optinName" className="text-xs font-bold text-foreground/80">
                    Nom et Prénom
                  </label>
                  <input
                    id="optinName"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Votre nom complet"
                    className={inputBase}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="optinEmail" className="text-xs font-bold text-foreground/80">
                    Email
                  </label>
                  <input
                    id="optinEmail"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="vous@email.com"
                    className={inputBase}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="optinWhatsapp" className="text-xs font-bold text-foreground/80">
                    Numéro WhatsApp
                  </label>
                  <div className="flex items-center rounded-lg border border-border bg-input/40 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <select
                      id="optinDial"
                      value={form.dial}
                      onChange={(e) => {
                        const nextDial = e.target.value
                        const nextMax = maxDigitsForDial(nextDial)
                        setForm({
                          ...form,
                          dial: nextDial,
                          whatsapp: form.whatsapp.replace(/\D/g, "").slice(0, nextMax),
                        })
                      }}
                      className="shrink-0 rounded-l-lg border-0 border-r border-border bg-transparent py-2 pl-2.5 pr-1 text-xs outline-none text-foreground dark:bg-card"
                    >
                      {dialCodes.map((d) => {
                        const iso = isoForDial(d)
                        return (
                          <option key={d} value={d} className="bg-card text-foreground">
                            {iso ? `${getFlagEmoji(iso)} ` : ""}{d}
                          </option>
                        )
                      })}
                    </select>
                    <input
                      id="optinWhatsapp"
                      type="tel"
                      inputMode="numeric"
                      maxLength={maxDigits}
                      required
                      value={form.whatsapp}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, maxDigits)
                        setForm({ ...form, whatsapp: digits })
                      }}
                      placeholder={"0".repeat(Math.min(maxDigits, 10))}
                      className="w-full min-w-0 rounded-r-lg border-0 bg-transparent px-3 py-2 text-xs outline-none text-foreground"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="optinCountry" className="text-xs font-bold text-foreground/80">
                    Pays de résidence
                  </label>
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      id="optinCountry"
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className={cn(
                        inputBase,
                        "w-full flex items-center justify-between text-left cursor-pointer",
                        !form.country && "text-muted-foreground"
                      )}
                    >
                      <span>
                        {form.country
                          ? `${getFlagEmoji(countries.find((c) => c.name === form.country)?.code || "")} ${form.country}`
                          : "Sélectionnez votre pays"}
                      </span>
                      <span className="pointer-events-none ml-2 text-muted-foreground text-[10px]">▼</span>
                    </button>

                    {isCountryDropdownOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card p-2 text-foreground shadow-2xl backdrop-blur-md">
                        <div className="sticky top-0 bg-card pb-2 z-10">
                          <input
                            type="text"
                            placeholder="Rechercher un pays..."
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                            autoFocus
                          />
                        </div>
                        <ul role="listbox" className="space-y-0.5">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((c) => (
                              <li
                                key={c.code}
                                role="option"
                                onClick={() => {
                                  setForm({ ...form, country: c.name })
                                  setIsCountryDropdownOpen(false)
                                }}
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-primary/20 hover:text-foreground",
                                  form.country === c.name && "bg-primary/35 text-foreground font-semibold"
                                )}
                              >
                                <span>{getFlagEmoji(c.code)}</span>
                                <span>{c.name}</span>
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-center text-xs text-muted-foreground">
                              Aucun pays trouvé
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="optinProfil" className="text-xs font-bold text-foreground/80">
                    Profil / Statut
                  </label>
                  <select
                    id="optinProfil"
                    value={form.profil}
                    onChange={(e) => setForm({ ...form, profil: e.target.value })}
                    className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="Professionnel">Professionnel</option>
                    <option value="Entrepreneur">Entrepreneur</option>
                    <option value="Etudiant">Étudiant</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-bold px-4 text-xs shadow-md disabled:opacity-50 active:scale-98 transition-all cursor-pointer mt-2"
                >
                  <Send className="size-3.5" />
                  {status === "loading" ? "Déblocage en cours..." : "Débloquer toutes les ressources"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

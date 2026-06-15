"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Gift, Check, PartyPopper } from "lucide-react"
import { isValidPhoneNumber, getExampleNumber, type CountryCode } from "libphonenumber-js"
import examples from "libphonenumber-js/examples.mobile.json"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { countries } from "@/lib/countries"

const dialCodes = Array.from(new Set(countries.map((c) => c.dial))).sort(
  (a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")),
)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Pick a representative ISO country for a given dial code so we can look up the
// expected national number length.
function isoForDial(dial: string): CountryCode | undefined {
  return countries.find((c) => c.dial === dial)?.code as CountryCode | undefined
}

// Helper to convert country code (e.g. "CI") to flag emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Maximum number of digits allowed for the national number of a given dial code.
function maxDigitsForDial(dial: string): number {
  const iso = isoForDial(dial)
  if (!iso) return 15
  const example = getExampleNumber(iso, examples)
  return example ? example.nationalNumber.length : 15
}

const whatsappGroups: Record<string, string> = {
  Etudiant: "https://chat.whatsapp.com/KrjNwtCRbL04NQHmIPP4WX",
  Professionnel: "https://chat.whatsapp.com/LKrNkc33XlDBuGlnSqhqLG",
  Entrepreneur: "https://chat.whatsapp.com/BYZv3RupCjeKW6uEGETWEf",
}

function getWhatsAppGroupHref(profil: string): string {
  return whatsappGroups[profil] ?? "https://chat.whatsapp.com/KOzRqZO1HwGKIU3g3d3wYa"
}

const days = [
  { day: "Jour 1", title: "Les fondations de l'IA", desc: "Comprendre et démarrer sans jargon" },
  { day: "Jour 2", title: "CV & LinkedIn boostés par l'IA", desc: "Optimisez votre profil pro" },
  { day: "Jour 3", title: "Productivité & automatisation", desc: "Gagnez des heures chaque semaine" },
  { day: "Jour 4", title: "Créer du contenu & des visuels", desc: "ChatGPT, Claude, Canva IA en action" },
  { day: "Jour 5", title: "Passer à l'action", desc: "Votre plan IA personnalisé" },
]

const perks = [
  "5 lives pratiques avec démos",
  "Communauté WhatsApp active",
  "Exercices & replays inclus",
  "Aucune carte bancaire requise",
]

export function Challenge() {
  return (
    <section id="inscription" className="relative overflow-hidden border-y border-border/60 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-start gap-12 px-4 md:px-8 lg:grid-cols-2">
        {/* Left: program */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground"
          >
            <Gift className="size-4" />
            100% Gratuit · 24 – 28 juin 2026
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl"
          >
            Réservez votre place gratuitement
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty"
          >
            Le Challenge IA Gratuit se déroule du 24 au 28 juin 2026. Inscrivez-vous maintenant pour recevoir les
            informations de participation, rejoindre la communauté et accéder aux exercices.
          </motion.p>
          <div className="mt-8 space-y-3">
            {days.map((d, i) => (
              <motion.div
                key={d.day}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm transition-colors hover:border-primary/40"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-mono text-sm font-bold text-primary ring-1 ring-primary/25">
                  J{i + 1}
                </span>
                <div>
                  <div className="font-semibold">{d.title}</div>
                  <div className="text-sm text-muted-foreground">{d.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:sticky lg:top-28"
        >
          <SignupForm perks={perks} />
        </motion.div>
      </div>
    </section>
  )
}

function SignupForm({ perks }: { perks: string[] }) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    dial: "+226",
    whatsapp: "",
    country: "",
    profil: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
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
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const maxDigits = maxDigitsForDial(values.dial)

  function set(field: string, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }))
  }

  function setWhatsapp(value: string) {
    // keep digits only and cap at the expected length for the selected dial code
    const digits = value.replace(/\D/g, "").slice(0, maxDigits)
    set("whatsapp", digits)
  }

  function setDial(value: string) {
    const nextMax = maxDigitsForDial(value)
    setValues((v) => ({ ...v, dial: value, whatsapp: v.whatsapp.slice(0, nextMax) }))
    if (errors.whatsapp) setErrors((e) => ({ ...e, whatsapp: "" }))
  }

  function validate() {
    const next: Record<string, string> = {}

    if (!values.name.trim()) {
      next.name = "Veuillez saisir votre prénom et nom."
    }

    if (!values.email.trim()) {
      next.email = "Veuillez saisir votre email."
    } else if (!EMAIL_REGEX.test(values.email.trim())) {
      next.email = "Veuillez saisir un email valide (ex : vous@email.com)."
    }

    if (!values.whatsapp.trim()) {
      next.whatsapp = "Veuillez saisir votre numéro WhatsApp."
    } else {
      const full = `${values.dial}${values.whatsapp.replace(/[^\d]/g, "")}`
      if (!isValidPhoneNumber(full)) {
        next.whatsapp = `Numéro invalide pour l'indicatif ${values.dial}.`
      }
    }

    if (!values.country) {
      next.country = "Veuillez sélectionner votre pays."
    }

    if (!values.profil) {
      next.profil = "Veuillez sélectionner votre profil."
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    setServerError("")
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          dial: values.dial,
          whatsapp: values.whatsapp,
          country: values.country,
          profil: values.profil,
          source: "Le Guide AI",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 && data.field) {
          // Duplicate — show the error on the relevant field
          setErrors((prev) => ({ ...prev, [data.field]: data.error }))
        } else {
          setServerError(data.error || "Une erreur est survenue. Veuillez réessayer.")
        }
        return
      }

      setSuccess(true)
    } catch {
      setServerError("Impossible de contacter le serveur. Vérifiez votre connexion internet.")
    } finally {
      setLoading(false)
    }
  }

  const inputBase =
    "rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
  const whatsappGroupHref = getWhatsAppGroupHref(values.profil)

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-primary/40 bg-card p-8 text-center shadow-2xl glow-blue"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="relative">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_28px] shadow-primary/50">
            <PartyPopper className="size-8" />
          </span>
          <h3 className="mt-6 font-heading text-2xl font-extrabold">Inscription confirmée</h3>
          <p className="mt-3 text-pretty text-muted-foreground">
            Bravo {values.name.split(" ")[0]}, votre place au Challenge IA Gratuit est réservée. Vous recevrez
            les informations de participation par email et sur WhatsApp ({values.dial} {values.whatsapp}).
          </p>
          <div className="mt-6 rounded-xl border border-border bg-background/60 p-4 text-left text-sm">
            <p className="font-semibold text-foreground">Prochaines étapes</p>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                Surveillez votre boîte mail ({values.email})
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                Rejoignez la communauté WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                Rendez-vous le 24 juin 2026
              </li>
            </ul>
          </div>
          <a
            href={whatsappGroupHref}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 h-12 w-full gap-2 font-semibold",
            )}
          >
            Rejoindre la communauté WhatsApp
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-8 shadow-2xl glow-blue">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-20 animate-scan bg-gradient-to-b from-primary/15 to-transparent" />
      </div>

      <h3 className="font-heading text-xl font-bold">Je rejoins le Challenge IA Gratuit</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Inscription gratuite. Places limitées pour garantir un accompagnement de qualité.
      </p>

      <ul className="mt-5 space-y-2">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4 shrink-0 text-primary" />
            {p}
          </li>
        ))}
      </ul>

      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Prénom et nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            placeholder="Votre prénom et nom"
            className={cn(inputBase, errors.name ? "border-destructive" : "border-input")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={!!errors.email}
            placeholder="vous@email.com"
            className={cn(inputBase, errors.email ? "border-destructive" : "border-input")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="whatsapp" className="text-sm font-medium">
              WhatsApp
            </label>
            <div
              className={cn(
                "flex items-center rounded-lg border bg-background transition-colors focus-within:border-primary",
                errors.whatsapp ? "border-destructive" : "border-input",
              )}
            >
              <select
                id="dial"
                name="dial"
                required
                value={values.dial}
                onChange={(e) => setDial(e.target.value)}
                aria-label="Indicatif téléphonique"
                className="shrink-0 rounded-l-lg border-0 border-r border-input bg-transparent py-3 pl-3 pr-2 text-sm outline-none"
              >
                {dialCodes.map((d) => {
                  const iso = isoForDial(d)
                  return (
                    <option key={d} value={d}>
                      {iso ? `${getFlagEmoji(iso)} ` : ""}{d}
                    </option>
                  )
                })}
              </select>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                required
                inputMode="numeric"
                maxLength={maxDigits}
                value={values.whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                aria-invalid={!!errors.whatsapp}
                placeholder={"0".repeat(Math.min(maxDigits, 10))}
                className="w-full min-w-0 rounded-r-lg border-0 bg-transparent px-4 py-3 text-sm outline-none"
              />
            </div>
            {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="country" className="text-sm font-medium">
              Pays
            </label>
            <div className="relative" ref={countryDropdownRef}>
              <button
                id="country"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isCountryDropdownOpen}
                onClick={() => {
                  setIsCountryDropdownOpen(!isCountryDropdownOpen)
                  setCountrySearchQuery("")
                }}
                className={cn(
                  inputBase,
                  "w-full flex items-center justify-between text-left cursor-pointer",
                  errors.country ? "border-destructive" : "border-input",
                  !values.country && "text-muted-foreground"
                )}
              >
                <span>
                  {values.country
                    ? `${getFlagEmoji(countries.find((c) => c.name === values.country)?.code || "")} ${values.country}`
                    : "Sélectionnez votre pays"}
                </span>
                <span className="pointer-events-none ml-2 text-muted-foreground text-xs">▼</span>
              </button>

              {isCountryDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card p-2 text-foreground shadow-2xl backdrop-blur-md">
                  <div className="sticky top-0 bg-card pb-2 z-10">
                    <input
                      type="text"
                      placeholder="Rechercher un pays..."
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>
                  <ul role="listbox" className="space-y-0.5">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((c) => (
                        <li
                          key={c.code}
                          role="option"
                          aria-selected={values.country === c.name}
                          onClick={() => {
                            set("country", c.name)
                            setIsCountryDropdownOpen(false)
                          }}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/20 hover:text-foreground",
                            values.country === c.name && "bg-primary/35 text-foreground font-semibold"
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
            {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="profil" className="text-sm font-medium">
            Votre profil
          </label>
          <select
            id="profil"
            name="profil"
            required
            value={values.profil}
            onChange={(e) => set("profil", e.target.value)}
            aria-invalid={!!errors.profil}
            className={cn(inputBase, errors.profil ? "border-destructive" : "border-input")}
          >
            <option value="" disabled>
              Sélectionnez votre profil
            </option>
            <option value="Etudiant">Etudiant</option>
            <option value="Professionnel">Professionnel</option>
            <option value="Entrepreneur">Entrepreneur</option>
            {/* <option value="Chercheur d'emploi">Chercheur d&apos;emploi</option>
            <option value="Formateur/Consultant">Formateur/Consultant</option>
            <option value="Autre">Autre</option> */}
          </select>
          {errors.profil && <p className="text-xs text-destructive">{errors.profil}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants({ size: "lg" }), "mt-2 h-12 text-base font-semibold", loading && "opacity-70 cursor-not-allowed")}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Inscription en cours…
            </span>
          ) : (
            "Je rejoins le Challenge IA Gratuit"
          )}
        </button>
        {serverError && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
            {serverError}
          </p>
        )}
        {submitted && Object.keys(errors).length > 0 && (
          <p className="text-center text-xs text-destructive">
            Veuillez corriger les champs en rouge avant de continuer.
          </p>
        )}
        <p className="text-center text-xs text-muted-foreground">
          Aucune carte bancaire requise. Vous recevrez les informations pratiques après votre inscription.
        </p>
      </form>
    </div>
  )
}

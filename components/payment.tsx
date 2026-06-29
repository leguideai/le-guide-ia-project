"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { CheckCircle2, AlertCircle, Send, Info } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
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

export function Payment() {
  const { t } = useLanguage()

  const [form, setForm] = useState({
    name: "",
    email: "",
    dial: "+226",
    whatsapp: "",
    country: "",
    method: "",
    txCode: "",
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

  const methods = [
    {
      id: "om",
      logo: "/orange_money.png",
      title: t("payment.methods.om.name"),
      zone: t("payment.methods.om.target"),
      detail: t("payment.methods.om.detail"),
      priority: "Priorité 1",
    },
    {
      id: "wave",
      logo: "/wave.png",
      title: t("payment.methods.wave.name"),
      zone: t("payment.methods.wave.target"),
      detail: t("payment.methods.wave.detail"),
      priority: "Priorité 1",
    },
    {
      id: "zelle",
      logo: "/zelle.png",
      title: t("payment.methods.zelle.name"),
      zone: t("payment.methods.zelle.target"),
      detail: t("payment.methods.zelle.detail"),
      priority: "Priorité 1",
    },
    {
      id: "bank",
      logo: "/credit_card.png",
      title: t("payment.methods.bank.name"),
      zone: t("payment.methods.bank.target"),
      detail: t("payment.methods.bank.detail"),
      priority: "Moyenne",
    },
  ]

  const validate = () => {
    if (!form.name.trim()) return t("payment.form.errors.name")
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return t("payment.form.errors.email")
    if (!form.whatsapp.trim()) return t("payment.form.errors.whatsapp")

    // Validate phone number
    const fullPhone = `${form.dial}${form.whatsapp.replace(/[^\d]/g, "")}`
    if (!isValidPhoneNumber(fullPhone)) {
      return t("payment.form.errors.whatsappInvalid").replace("{dial}", form.dial)
    }

    if (!form.country) return t("payment.form.errors.country")
    if (!form.method) return t("payment.form.errors.method")
    if (!form.txCode.trim()) return t("payment.form.errors.txCode")
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
      const response = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          dial: form.dial,
          whatsapp: form.whatsapp,
          country: form.country,
          method: form.method,
          txCode: form.txCode,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setStatus("success")
      } else {
        setErrorMsg(data.error || t("payment.form.errors.server"))
        setStatus("error")
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(t("payment.form.errors.server"))
      setStatus("error")
    }
  }

  const inputBase =
    "w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="paiement">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("payment.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("payment.title")}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("payment.subtitle")}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 items-start mt-12">
          
          {/* Instructions Column */}
          <div className="lg:col-span-7 space-y-6">
            {methods.map((m, idx) => {
              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-border bg-card/45 p-6 flex flex-col sm:flex-row gap-4 items-start backdrop-blur-sm hover:border-primary/20 transition-colors"
                >
                  <span className="flex h-12 w-20 items-center justify-center rounded-xl bg-white p-1.5 shrink-0 border border-border/80">
                    <img src={m.logo} alt={m.title} className="h-full w-full object-contain" />
                  </span>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <h3 className="font-heading text-base font-bold text-foreground">
                        {m.title}
                      </h3>
                      <span className="text-[9px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        {m.zone}
                      </span>
                      {m.priority === "Priorité 1" && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          Prioritaire
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                      {m.detail}
                    </p>
                  </div>
                </div>
              )
            })}

            {/* Visual payment warning */}
            <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 flex gap-3 text-xs leading-relaxed text-muted-foreground">
              <Info className="size-4.5 text-primary shrink-0 mt-0.5" />
              <p>{t("payment.form.warningNote")}</p>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-primary/25 bg-card/45 p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden"
            >
              {status === "success" ? (
                <div className="text-center py-8">
                  <span className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-4">
                    <CheckCircle2 className="size-8" />
                  </span>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    {t("payment.form.successTitle")}
                  </h3>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed text-pretty">
                    {t("payment.form.successDesc").replace("{name}", form.name.split(" ")[0])}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      {t("payment.form.title")}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t("payment.form.subtitle")}
                    </p>
                  </div>

                  {status === "error" && (
                    <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 flex gap-2.5 text-xs text-rose-500">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="paymentName" className="text-xs font-bold text-foreground/80">
                      {t("payment.form.labelName")}
                    </label>
                    <input
                      id="paymentName"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t("payment.form.placeholderName")}
                      className={inputBase}
                    />
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="paymentEmail" className="text-xs font-bold text-foreground/80">
                      {t("payment.form.labelEmail")}
                    </label>
                    <input
                      id="paymentEmail"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={t("payment.form.placeholderEmail")}
                      className={inputBase}
                    />
                  </div>

                  {/* WhatsApp field with dial selector flags */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="paymentWhatsapp" className="text-xs font-bold text-foreground/80">
                      {t("payment.form.labelWhatsapp")}
                    </label>
                    <div
                      className={cn(
                        "flex items-center rounded-lg border bg-input/40 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary border-border"
                      )}
                    >
                      <select
                        id="paymentDial"
                        name="dial"
                        value={form.dial}
                        onChange={(e) => {
                          const nextDial = e.target.value
                          const nextMax = maxDigitsForDial(nextDial)
                          setForm({
                            ...form,
                            dial: nextDial,
                            whatsapp: form.whatsapp.replace(/\D/g, "").slice(0, nextMax)
                          })
                        }}
                        aria-label="Indicatif téléphonique"
                        className="shrink-0 rounded-l-lg border-0 border-r border-border bg-transparent py-2.5 pl-3 pr-2 text-xs outline-none text-foreground dark:bg-card"
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
                        id="paymentWhatsapp"
                        type="tel"
                        inputMode="numeric"
                        maxLength={maxDigits}
                        value={form.whatsapp}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, maxDigits)
                          setForm({ ...form, whatsapp: digits })
                        }}
                        placeholder={"0".repeat(Math.min(maxDigits, 10))}
                        className="w-full min-w-0 rounded-r-lg border-0 bg-transparent px-3 py-2.5 text-xs outline-none text-foreground"
                      />
                    </div>
                  </div>

                  {/* Country Autocomplete Search Field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="paymentCountry" className="text-xs font-bold text-foreground/80">
                      {t("payment.form.labelCountry")}
                    </label>
                    <div className="relative" ref={countryDropdownRef}>
                      <button
                        id="paymentCountry"
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
                            : t("payment.form.placeholderCountry")}
                        </span>
                        <span className="pointer-events-none ml-2 text-muted-foreground text-[10px]">▼</span>
                      </button>

                      {isCountryDropdownOpen && (
                        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card p-2 text-foreground shadow-2xl backdrop-blur-md">
                          <div className="sticky top-0 bg-card pb-2 z-10">
                            <input
                              type="text"
                              placeholder={t("payment.form.searchCountryPlaceholder")}
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
                                  onClick={() => {
                                    setForm({ ...form, country: c.name })
                                    setIsCountryDropdownOpen(false)
                                  }}
                                  className={cn(
                                    "flex items-center gap-2 cursor-pointer rounded-md px-3 py-2 text-xs transition-colors hover:bg-primary/20 hover:text-foreground",
                                    form.country === c.name && "bg-primary/35 text-foreground font-semibold"
                                  )}
                                >
                                  <span>{getFlagEmoji(c.code)}</span>
                                  <span>{c.name}</span>
                                </li>
                              ))
                            ) : (
                              <li className="px-3 py-2 text-center text-xs text-muted-foreground">
                                {t("payment.form.noCountryFound")}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method select */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="paymentMethod" className="text-xs font-bold text-foreground/80">
                      {t("payment.form.labelMethod")}
                    </label>
                    <select
                      id="paymentMethod"
                      value={form.method}
                      onChange={(e) => setForm({ ...form, method: e.target.value })}
                      className="h-10 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="">{t("payment.form.placeholderMethod")}</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="Wave">Wave</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Virement Bancaire">Virement Bancaire</option>
                    </select>
                  </div>

                  {/* Transaction Code field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="paymentTxCode" className="text-xs font-bold text-foreground/80">
                      {t("payment.form.labelTxCode")}
                    </label>
                    <input
                      id="paymentTxCode"
                      type="text"
                      value={form.txCode}
                      onChange={(e) => setForm({ ...form, txCode: e.target.value })}
                      placeholder={t("payment.form.placeholderTxCode")}
                      className={inputBase}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-bold px-4 text-xs shadow-md disabled:opacity-50 active:scale-98 transition-all cursor-pointer mt-2"
                  >
                    <Send className="size-3.5" />
                    {status === "loading" ? t("payment.form.loading") : t("payment.form.cta")}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  )
}

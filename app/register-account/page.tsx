"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { 
  countries, Country, getCountryFlag, PHONE_RULES, 
  PRIORITY_COUNTRY_CODES, formatPhoneNumber 
} from "@/lib/countries"
import { 
  UserPlus, Mail, Lock, User, Phone, AlertCircle, 
  ArrowLeft, CheckCircle2, Eye, EyeOff, Check, X, ShieldCheck,
  ChevronDown, Search, Globe
} from "lucide-react"
import { getAuthRedirect, setAuthRedirect, clearAuthRedirect } from "@/lib/auth-redirect"

export default function RegisterAccountPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    const bf = countries.find(c => c.code === "BF")
    return bf || countries[0]
  })
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [redirectTarget, setRedirectTarget] = useState("/dashboard")

  useEffect(() => {
    const target = getAuthRedirect("/dashboard")
    setRedirectTarget(target)
    if (target && target !== "/dashboard") {
      setAuthRedirect(target)
    }
  }, [])

  // Close country dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filtered Country List with Priority Countries on top
  const filteredCountries = useMemo(() => {
    const search = countrySearch.toLowerCase().trim()
    if (!search) {
      const priorityList = countries.filter(c => PRIORITY_COUNTRY_CODES.includes(c.code))
      const otherList = countries.filter(c => !PRIORITY_COUNTRY_CODES.includes(c.code))
      return [...priorityList, ...otherList]
    }
    return countries.filter(
      c => c.name.toLowerCase().includes(search) || 
           c.dial.includes(search) || 
           c.code.toLowerCase().includes(search)
    )
  }, [countrySearch])

  // Phone Validation Rules for selected country
  const currentPhoneRule = PHONE_RULES[selectedCountry.code]
  const rawPhoneDigits = phoneNumber.replace(/\D/g, "")

  const isPhoneValid = useMemo(() => {
    if (!rawPhoneDigits) return false
    if (currentPhoneRule) {
      if (Array.isArray(currentPhoneRule.expectedLength)) {
        return currentPhoneRule.expectedLength.includes(rawPhoneDigits.length)
      }
      return rawPhoneDigits.length === currentPhoneRule.expectedLength
    }
    return rawPhoneDigits.length >= 6 && rawPhoneDigits.length <= 14
  }, [rawPhoneDigits, currentPhoneRule])

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val, selectedCountry.code)
    setPhoneNumber(formatted)
  }

  // Password Security Strength Checklist
  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    }
  }, [password])

  // Calculate score out of 5
  const strengthScore = useMemo(() => {
    if (!password) return 0
    let score = 0
    if (passwordChecks.minLength) score += 1
    if (passwordChecks.hasUpper) score += 1
    if (passwordChecks.hasLower) score += 1
    if (passwordChecks.hasNumber) score += 1
    if (passwordChecks.hasSpecial) score += 1
    return score
  }, [passwordChecks, password])

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null
    return password === confirmPassword
  }, [password, confirmPassword])

  const isPasswordStrong = strengthScore >= 4 && passwordChecks.minLength

  const getStrengthLabel = () => {
    if (strengthScore <= 1) return { label: "Trop faible", color: "bg-rose-500", text: "text-rose-400", width: "w-1/4" }
    if (strengthScore === 2) return { label: "Faible", color: "bg-orange-500", text: "text-orange-400", width: "w-2/4" }
    if (strengthScore === 3 || strengthScore === 4) return { label: "Bon", color: "bg-amber-400", text: "text-amber-400", width: "w-3/4" }
    return { label: "Très robuste", color: "bg-emerald-500", text: "text-emerald-400", width: "w-full" }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Validation Téléphone selon l'indicatif choisi
    if (!isPhoneValid) {
      const expectedText = currentPhoneRule 
        ? currentPhoneRule.formatExample 
        : "entre 6 et 14 chiffres"
      setError(`Numéro de téléphone invalide pour ${selectedCountry.name} (${selectedCountry.dial}). Format attendu : ${expectedText}.`)
      setLoading(false)
      return
    }

    // 2. Validation Mot de passe fort
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      setLoading(false)
      return
    }

    if (!passwordChecks.hasUpper || !passwordChecks.hasLower) {
      setError("Le mot de passe doit contenir des lettres majuscules et minuscules.")
      setLoading(false)
      return
    }

    if (!passwordChecks.hasNumber) {
      setError("Le mot de passe doit contenir au moins un chiffre (0-9).")
      setLoading(false)
      return
    }

    if (!passwordChecks.hasSpecial) {
      setError("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...).")
      setLoading(false)
      return
    }

    // 3. Validation Confirmation identique
    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.")
      setLoading(false)
      return
    }

    const fullWhatsApp = `${selectedCountry.dial}${rawPhoneDigits}`
    const target = redirectTarget || getAuthRedirect("/dashboard")

    if (target && target !== "/dashboard") {
      setAuthRedirect(target)
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          whatsapp: fullWhatsApp,
          country_code: selectedCountry.code,
          country_name: selectedCountry.name,
        },
        emailRedirectTo: `${window.location.origin}${target}`,
      },
    })

    if (signUpError) {
      const errMsg = signUpError.message.toLowerCase()
      if (errMsg.includes("already registered") || errMsg.includes("user already registered")) {
        setError("Cette adresse email est déjà associée à un compte. Veuillez vous connecter.")
      } else if (errMsg.includes("rate limit") || errMsg.includes("email rate limit exceeded")) {
        setError("Trop de tentatives d'inscription rapprochées. Veuillez patienter 2 à 3 minutes avant de réessayer ou connectez le SMTP Resend dans Supabase.")
      } else if (errMsg.includes("invalid email")) {
        setError("L'adresse email saisie est invalide.")
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
    } else {
      if (data?.session) {
        window.location.href = target
      } else {
        setSuccess(true)
      }
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            <span>Retour au site</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-7 rounded-md object-cover" />
            <span className="font-heading text-sm font-extrabold">LE GUIDE <span className="text-primary">IA</span></span>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Créer un compte</h1>
            <p className="text-xs text-muted-foreground">Accédez à votre espace membre et vos formations certifiantes</p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-3 text-xs text-rose-400 animate-in fade-in duration-200">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Compte créé avec succès !</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Un email de confirmation sécurisé a été envoyé à <strong className="text-primary font-bold">{email}</strong>. Cliquez sur le lien reçu pour valider votre compte.
              </p>
              <Link
                href={`/login${redirectTarget !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-slate-950 font-black py-3 text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4 cursor-pointer"
              >
                Aller à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRegister} autoComplete="off" className="space-y-4">
              {/* Nom Complet (No Autofill) */}
              <div className="space-y-1.5">
                <label htmlFor="user_fullname_field" className="text-xs font-bold text-foreground/80">Nom complet</label>
                <div className="relative">
                  <User className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="user_fullname_field"
                    name="user_fullname_field"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Samba Koné"
                    className="w-full rounded-xl border border-border bg-slate-950/70 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Adresse Email (No Autofill) */}
              <div className="space-y-1.5">
                <label htmlFor="user_email_field" className="text-xs font-bold text-foreground/80">Adresse Email</label>
                <div className="relative">
                  <Mail className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="user_email_field"
                    name="user_email_field"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl border border-border bg-slate-950/70 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Numéro WhatsApp avec Drapeaux & Indicatifs Internationaux */}
              <div className="space-y-1.5" ref={countryDropdownRef}>
                <div className="flex items-center justify-between">
                  <label htmlFor="user_phone_field" className="text-xs font-bold text-foreground/80">
                    Numéro WhatsApp
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedCountry.name} ({selectedCountry.dial})
                  </span>
                </div>

                <div className="relative flex items-center">
                  {/* Country Flag & Dial Selector Button */}
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-l-xl border border-r-0 border-border bg-slate-950/90 text-xs font-bold text-foreground hover:bg-slate-800 transition-all cursor-pointer shrink-0 z-10"
                    title={`Changer de pays (${selectedCountry.name})`}
                  >
                    <span className="text-base leading-none">{getCountryFlag(selectedCountry.code)}</span>
                    <span className="font-mono text-slate-300">{selectedCountry.dial}</span>
                    <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${isCountryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Phone Input */}
                  <input
                    id="user_phone_field"
                    name="user_phone_field"
                    autoComplete="off"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={currentPhoneRule?.placeholder || "70 12 34 56"}
                    className={`w-full rounded-r-xl border bg-slate-950/70 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all ${
                      rawPhoneDigits.length > 0 && isPhoneValid
                        ? "border-emerald-500/60 focus:ring-1 focus:ring-emerald-500"
                        : rawPhoneDigits.length > 0 && !isPhoneValid
                        ? "border-amber-500/60 focus:ring-1 focus:ring-amber-500"
                        : "border-border focus:ring-1 focus:ring-primary"
                    }`}
                  />

                  {/* Country Selection Dropdown Modal */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full max-h-60 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      {/* Search in countries */}
                      <div className="p-2 border-b border-slate-800 sticky top-0 bg-slate-950">
                        <div className="relative">
                          <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            autoComplete="off"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Rechercher un pays ou indicatif..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Country List */}
                      <div className="overflow-y-auto divide-y divide-slate-800/40 text-left">
                        {filteredCountries.map((c) => {
                          const isSelected = c.code === selectedCountry.code
                          const rule = PHONE_RULES[c.code]
                          return (
                            <button
                              key={`${c.code}-${c.dial}`}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c)
                                setIsCountryDropdownOpen(false)
                                setCountrySearch("")
                                // Re-format phone number with new country rule
                                if (phoneNumber) {
                                  setPhoneNumber(formatPhoneNumber(phoneNumber, c.code))
                                }
                              }}
                              className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-900 transition-colors cursor-pointer text-left ${
                                isSelected ? "bg-primary/10 text-primary font-bold" : "text-slate-300"
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                <span className="text-base">{getCountryFlag(c.code)}</span>
                                <span className="truncate">{c.name}</span>
                              </span>
                              <span className="font-mono text-slate-400 font-bold ml-2 shrink-0">
                                {c.dial}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Live validation feedback for phone */}
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  {rawPhoneDigits.length > 0 ? (
                    isPhoneValid ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="size-3" /> Numéro valide pour {selectedCountry.name}
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1 font-semibold">
                        <AlertCircle className="size-3" /> {currentPhoneRule ? `Format : ${currentPhoneRule.formatExample} (${rawPhoneDigits.length}/${Array.isArray(currentPhoneRule.expectedLength) ? currentPhoneRule.expectedLength.join(' ou ') : currentPhoneRule.expectedLength})` : "Format incomplet"}
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      Format conseillé : {currentPhoneRule ? `${selectedCountry.dial} ${currentPhoneRule.placeholder}` : `${selectedCountry.dial} ...`}
                    </span>
                  )}
                </div>
              </div>

              {/* Mot de Passe (No Autofill) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="user_password_field" className="text-xs font-bold text-foreground/80">Mot de passe</label>
                  {password && (
                    <span className={`text-[10px] font-black ${getStrengthLabel().text}`}>
                      {getStrengthLabel().label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="user_password_field"
                    name="user_password_field"
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8+ car., majuscule, chiffre, symbole"
                    className="w-full rounded-xl border border-border bg-slate-950/70 pl-9 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {/* Password Strength Progress Bar */}
                {password && (
                  <div className="space-y-2 pt-1">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthLabel().color} ${getStrengthLabel().width}`}
                      />
                    </div>

                    {/* Criteria Checklist */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground pt-0.5">
                      <span className={`flex items-center gap-1 ${passwordChecks.minLength ? "text-emerald-400 font-bold" : ""}`}>
                        {passwordChecks.minLength ? <Check className="size-3" /> : <X className="size-3 text-slate-600" />}
                        8 caractères min.
                      </span>
                      <span className={`flex items-center gap-1 ${passwordChecks.hasUpper && passwordChecks.hasLower ? "text-emerald-400 font-bold" : ""}`}>
                        {passwordChecks.hasUpper && passwordChecks.hasLower ? <Check className="size-3" /> : <X className="size-3 text-slate-600" />}
                        Majuscule & minuscule
                      </span>
                      <span className={`flex items-center gap-1 ${passwordChecks.hasNumber ? "text-emerald-400 font-bold" : ""}`}>
                        {passwordChecks.hasNumber ? <Check className="size-3" /> : <X className="size-3 text-slate-600" />}
                        Au moins 1 chiffre
                      </span>
                      <span className={`flex items-center gap-1 ${passwordChecks.hasSpecial ? "text-emerald-400 font-bold" : ""}`}>
                        {passwordChecks.hasSpecial ? <Check className="size-3" /> : <X className="size-3 text-slate-600" />}
                        1 symbole (!@#$...)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmer le Mot de Passe (No Autofill) */}
              <div className="space-y-1.5">
                <label htmlFor="user_confirm_password_field" className="text-xs font-bold text-foreground/80">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="user_confirm_password_field"
                    name="user_confirm_password_field"
                    autoComplete="new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    className={`w-full rounded-xl border bg-slate-950/70 pl-9 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all ${
                      passwordsMatch === true
                        ? "border-emerald-500/60 focus:ring-1 focus:ring-emerald-500"
                        : passwordsMatch === false
                        ? "border-rose-500/60 focus:ring-1 focus:ring-rose-500"
                        : "border-border focus:ring-1 focus:ring-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {passwordsMatch === false && (
                  <p className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                    <X className="size-3" /> Les mots de passe ne correspondent pas
                  </p>
                )}
                {passwordsMatch === true && confirmPassword.length > 0 && (
                  <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="size-3" /> Mots de passe identiques
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordStrong || passwordsMatch === false || !isPhoneValid}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-slate-950 font-black py-3 text-xs shadow-lg shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer mt-2"
              >
                <UserPlus className="size-4" />
                {loading ? "Création du compte..." : "Créer mon compte"}
              </button>
            </form>
          )}

          <div className="text-center text-xs text-muted-foreground pt-2">
            Déjà inscrit ?{" "}
            <Link 
              href={`/login${redirectTarget !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`} 
              className="text-primary hover:underline font-bold"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}


"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { countries, Country, parsePhoneNumber, formatPhoneNumber, PHONE_RULES } from "@/lib/countries"
import { getAuthRedirect, clearAuthRedirect, getPendingMasterclassRegistration, clearPendingMasterclassRegistration } from "@/lib/auth-redirect"
import { 
  Sparkles, 
  Check, 
  ChevronDown, 
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  Rocket, 
  GraduationCap, 
  ShieldCheck, 
  X 
} from "lucide-react"

export function GlobalProfileCompletionModal() {
  const pathname = usePathname()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [isDismissed, setIsDismissed] = useState(false)
  const isDismissedRef = useRef(false)

  // Form Fields
  const [fullName, setFullName] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [sector, setSector] = useState("")
  const [profilePhone, setProfilePhone] = useState("")
  const [profileCountry, setProfileCountry] = useState<Country>(() => {
    return countries.find(c => c.code === "BF") || countries[0]
  })

  // Dropdown States
  const [isPhoneCountryOpen, setIsPhoneCountryOpen] = useState(false)
  const [phoneCountrySearch, setPhoneCountrySearch] = useState("")
  const [isResidenceCountryOpen, setIsResidenceCountryOpen] = useState(false)
  const [residenceCountrySearch, setResidenceCountrySearch] = useState("")

  // Form Submission
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const phoneCountryRef = useRef<HTMLDivElement>(null)
  const residenceCountryRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (phoneCountryRef.current && !phoneCountryRef.current.contains(event.target as Node)) {
        setIsPhoneCountryOpen(false)
      }
      if (residenceCountryRef.current && !residenceCountryRef.current.contains(event.target as Node)) {
        setIsResidenceCountryOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Check Profile Completion on any screen
  const checkProfileCompleteness = async (currentUser: any) => {
    if (!currentUser) {
      setUser(null)
      setProfile(null)
      setIsOpen(false)
      setLoading(false)
      return
    }

    try {
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle()

      setUser(currentUser)
      setProfile(profData)

      // Ne pas afficher sur les pages de login et d'administration interne
      const isExcludedPath = pathname.startsWith("/login") || pathname.startsWith("/admin")
      if (isExcludedPath) {
        setIsOpen(false)
        setLoading(false)
        return
      }

      const meta = currentUser.user_metadata || {}
      const curFullName = profData?.full_name || meta.full_name || meta.name || ""
      const curPhone = profData?.whatsapp || meta.whatsapp || meta.phone || ""
      const rawCountry = profData?.country || meta.country_name || meta.country || ""
      const curCity = profData?.city || meta.city || ""
      const curSector = profData?.sector || meta.sector || ""

      // Résolution du pays : si le pays en base est le vieux fallback automatique "CI" alors que le profil n'a jamais été complété
      let initialCountry = ""
      if (rawCountry) {
        const found = countries.find(c => c.name.toLowerCase() === rawCountry.toLowerCase() || c.code.toLowerCase() === rawCountry.toLowerCase())
        if (rawCountry === "CI" && !curCity && !curSector) {
          initialCountry = ""
        } else {
          initialCountry = found ? found.name : rawCountry
        }
      }

      setFullName(curFullName)
      setCountry(initialCountry)
      setCity(curCity)
      setSector(curSector)

      if (curPhone) {
        const parsed = parsePhoneNumber(curPhone)
        if (parsed) {
          setProfileCountry(parsed.country)
          setProfilePhone(parsed.localNumber)
        } else {
          const foundC = countries.find(c => c.code === meta.country_code) || 
                         countries.find(c => c.name.toLowerCase() === initialCountry.toLowerCase())
          if (foundC) {
            setProfileCountry(foundC)
            setProfilePhone(formatPhoneNumber(curPhone, foundC.code))
          } else {
            setProfilePhone(curPhone)
          }
        }
      }

      const isComplete = Boolean(
        profData &&
        profData.full_name && profData.full_name.trim().length >= 2 &&
        profData.whatsapp && profData.whatsapp.trim().length >= 6 &&
        profData.country && profData.country.trim().length > 0 &&
        profData.city && profData.city.trim().length > 0 &&
        profData.sector && profData.sector.trim().length > 0
      )

      // Vérifier si l'utilisateur connecté a déjà ignoré le modal durant sa session active
      let isAlreadyDismissed = false
      try {
        if (currentUser?.id) {
          isAlreadyDismissed = 
            localStorage.getItem(`profile_dismissed_${currentUser.id}`) === "true" ||
            sessionStorage.getItem(`profile_dismissed_${currentUser.id}`) === "true"
        }
      } catch (_) {}

      // Si l'utilisateur a ignoré le modal, ne plus l'afficher tant qu'il ne s'est pas déconnecté puis reconnecté
      if (isAlreadyDismissed || isDismissedRef.current) {
        setIsOpen(false)
      } else {
        setIsOpen(!isComplete)
      }
    } catch (err) {
      console.error("Global profile check error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkProfileCompleteness(session?.user || null)
    })

    // Auth state listener : réinitialise l'état d'affichage uniquement lors d'une déconnexion explicite
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setIsDismissed(false)
        isDismissedRef.current = false
        try {
          const toRemove: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i)
            if (k && (k.startsWith("profile_dismissed_") || k.includes("profile_modal_dismissed"))) {
              toRemove.push(k)
            }
          }
          toRemove.forEach(k => localStorage.removeItem(k))
          sessionStorage.clear()
        } catch (_) {}
      }
      checkProfileCompleteness(session?.user || null)
    })

    // Custom event listener from other components
    const handleProfileUpdated = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        checkProfileCompleteness(session?.user || null)
      })
    }
    window.addEventListener("profile-updated", handleProfileUpdated)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("profile-updated", handleProfileUpdated)
    }
  }, [pathname])

  // Validation helpers
  const rawProfilePhoneDigits = profilePhone.replace(/\D/g, "")
  const currentProfilePhoneRule = PHONE_RULES[profileCountry.code]
  const isProfilePhoneValid = useMemo(() => {
    if (!rawProfilePhoneDigits) return false
    if (currentProfilePhoneRule) {
      if (Array.isArray(currentProfilePhoneRule.expectedLength)) {
        return currentProfilePhoneRule.expectedLength.includes(rawProfilePhoneDigits.length)
      }
      return rawProfilePhoneDigits.length === currentProfilePhoneRule.expectedLength
    }
    return rawProfilePhoneDigits.length >= 6 && rawProfilePhoneDigits.length <= 14
  }, [rawProfilePhoneDigits, currentProfilePhoneRule])

  const profileCompletionStats = useMemo(() => {
    let completedCount = 0
    const total = 5

    if (fullName.trim().length >= 2) completedCount++
    if (rawProfilePhoneDigits.length >= 6 && isProfilePhoneValid) completedCount++
    if (country.trim().length > 0) completedCount++
    if (city.trim().length > 0) completedCount++
    if (sector.trim().length > 0) completedCount++

    const percentage = Math.round((completedCount / total) * 100)
    return { completedCount, total, percentage }
  }, [fullName, rawProfilePhoneDigits, isProfilePhoneValid, country, city, sector])

  const filteredPhoneCountries = useMemo(() => {
    if (!phoneCountrySearch.trim()) return countries
    const q = phoneCountrySearch.toLowerCase().trim()
    return countries.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.dial.includes(q) || 
      c.code.toLowerCase().includes(q)
    )
  }, [phoneCountrySearch])

  const filteredResidenceCountries = useMemo(() => {
    if (!residenceCountrySearch.trim()) return countries
    const q = residenceCountrySearch.toLowerCase().trim()
    return countries.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q)
    )
  }, [residenceCountrySearch])

  const getCountryFlag = (code: string) => {
    if (!code || code.length !== 2) return "🌍"
    const offset = 127397
    return String.fromCodePoint(...code.toUpperCase().split("").map(c => c.charCodeAt(0) + offset))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)

    if (!user) return

    if (!fullName || fullName.trim().length < 2) {
      setProfileError("Veuillez renseigner votre nom complet officiel.")
      return
    }

    if (!rawProfilePhoneDigits || rawProfilePhoneDigits.length < 6 || !isProfilePhoneValid) {
      const expectedText = currentProfilePhoneRule 
        ? currentProfilePhoneRule.formatExample 
        : "entre 6 et 14 chiffres"
      setProfileError(`Numéro WhatsApp invalide pour ${profileCountry.name} (${profileCountry.dial}). Format attendu : ${expectedText}.`)
      return
    }

    if (!country || !country.trim()) {
      setProfileError("Veuillez sélectionner votre pays de résidence.")
      return
    }

    if (!city || !city.trim()) {
      setProfileError("Veuillez indiquer votre ville de résidence.")
      return
    }

    if (!sector || !sector.trim()) {
      setProfileError("Veuillez sélectionner votre profil (Professionnels, Entrepreneurs ou Étudiants).")
      return
    }

    setSavingProfile(true)
    const fullWhatsApp = `${profileCountry.dial}${rawProfilePhoneDigits}`
    const countryToSave = country.trim()

    try {
      const { error: profErr } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          email: user.email,
          whatsapp: fullWhatsApp,
          country: countryToSave,
          city: city.trim(),
          sector: sector.trim(),
          updated_at: new Date().toISOString(),
        })

      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          whatsapp: fullWhatsApp,
          country_name: countryToSave,
          country_code: profileCountry.code,
          city: city.trim(),
          sector: sector.trim(),
        }
      }).catch(() => {})

      if (profErr) {
        setProfileError(profErr.message)
      } else {
        setIsOpen(false)
        if (user?.id) {
          try {
            localStorage.removeItem(`profile_dismissed_${user.id}`)
            sessionStorage.removeItem(`profile_dismissed_${user.id}`)
          } catch (_) {}
        }
        const updatedDetail = {
          full_name: fullName.trim(),
          whatsapp: fullWhatsApp,
          country: countryToSave,
          city: city.trim(),
          sector: sector.trim(),
        }
        window.dispatchEvent(new CustomEvent("profile-updated", {
          detail: updatedDetail
        }))

        // Vérifier si une inscription automatique à la Masterclass est en attente
        const pending = getPendingMasterclassRegistration()
        if (pending.autoRegister && user.email) {
          try {
            await fetch("/api/masterclass", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email.toLowerCase().trim(),
                fullName: fullName.trim(),
                whatsapp: fullWhatsApp,
                country: countryToSave,
                masterclassId: pending.sessionId || "current_live"
              })
            })
          } catch (_) {}
          clearPendingMasterclassRegistration()
        }

        // Redirection vers l'écran d'origine (ex: /masterclass)
        const target = getAuthRedirect(pending.autoRegister ? "/masterclass" : "/dashboard")
        clearAuthRedirect()

        if (pending.autoRegister && pathname !== "/masterclass") {
          window.location.href = "/masterclass"
          return
        }

        if (target && target !== "/dashboard" && pathname !== target) {
          window.location.href = target
        }
      }
    } catch (err: any) {
      setProfileError(err?.message || "Une erreur est survenue lors de l'enregistrement.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleDismiss = async () => {
    setIsDismissed(true)
    isDismissedRef.current = true
    if (user?.id) {
      try {
        localStorage.setItem(`profile_dismissed_${user.id}`, "true")
        sessionStorage.setItem(`profile_dismissed_${user.id}`, "true")
      } catch (_) {}
    }
    setIsOpen(false)

    // Si une inscription Masterclass est en attente, inscrire immédiatement l'apprenant même s'il a ignoré le profil
    const pending = getPendingMasterclassRegistration()
    if (pending.autoRegister && user?.email) {
      try {
        const cleanEmail = user.email.toLowerCase().trim()
        const fullWhatsApp = rawProfilePhoneDigits.length >= 6 
          ? `${profileCountry.dial}${rawProfilePhoneDigits}` 
          : (user.user_metadata?.whatsapp || "")
        await fetch("/api/masterclass", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            fullName: fullName.trim() || user.user_metadata?.full_name || cleanEmail.split("@")[0],
            whatsapp: fullWhatsApp,
            country: country.trim() || undefined,
            masterclassId: pending.sessionId || "current_live"
          })
        })
      } catch (e) {
        console.warn("Auto-registration on modal dismiss error:", e)
      }

      clearPendingMasterclassRegistration()
      clearAuthRedirect()

      if (pathname !== "/masterclass") {
        window.location.href = "/masterclass"
        return
      } else {
        window.dispatchEvent(new CustomEvent("profile-updated"))
      }
    }
  }

  if (loading || !isOpen || !user) return null

  // Ne pas afficher sur les pages de login et d'administration
  if (pathname.startsWith("/login") || pathname.startsWith("/admin")) return null

  return (
    <div 
      onClick={handleDismiss}
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden w-full max-w-xl my-auto animate-in fade-in zoom-in-95 duration-200 text-slate-900 relative"
      >
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
          {/* Close Button X */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Ignorer pour le moment"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>

          <div className="absolute -top-12 -right-12 size-36 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Personnalisation du Profil • Optionnel</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
              <span>Complétez votre profil apprenant</span>
              <span className="text-2xl">🎓</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ces informations facultatives nous permettent d&apos;adapter vos formations, de vous intégrer à votre <strong>groupe WhatsApp</strong> et d&apos;émettre vos <strong>certificats officiels</strong>. Vous pouvez aussi le faire plus tard.
            </p>

            {/* Progress Bar */}
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Progression du profil</span>
                <span className="text-primary font-bold">{profileCompletionStats.percentage}% ({profileCompletionStats.completedCount}/{profileCompletionStats.total} complétés)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${profileCompletionStats.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4">
          {profileError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{profileError}</span>
            </div>
          )}

          {/* 1. Nom complet */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>1. Nom et Prénoms officiels *</span>
              <span className="text-[10px] text-slate-500 font-normal">Inscrit sur vos certificats</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Jean-Marc Kouassi"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-medium"
            />
          </div>

          {/* 2. Numéro WhatsApp */}
          <div className="space-y-1" ref={phoneCountryRef}>
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>2. Numéro WhatsApp actif *</span>
              <span className="text-[10px] text-slate-500 font-normal">{profileCountry.name} ({profileCountry.dial})</span>
            </label>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setIsPhoneCountryOpen(!isPhoneCountryOpen)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-all cursor-pointer shrink-0 z-10"
                title={`Changer d'indicatif (${profileCountry.name})`}
              >
                <span className="text-base leading-none">{getCountryFlag(profileCountry.code)}</span>
                <span className="font-mono text-slate-700">{profileCountry.dial}</span>
                <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isPhoneCountryOpen ? "rotate-180" : ""}`} />
              </button>

              <input
                type="tel"
                required
                value={profilePhone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value, profileCountry.code)
                  setProfilePhone(formatted)
                }}
                placeholder={currentProfilePhoneRule ? currentProfilePhoneRule.formatExample : "01 02 03 04 05"}
                className={`w-full rounded-r-xl border bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 font-mono shadow-2xs ${
                  rawProfilePhoneDigits.length > 0 && !isProfilePhoneValid
                    ? "border-amber-300 focus:ring-amber-500 bg-amber-50/20"
                    : "border-slate-200 focus:ring-primary"
                }`}
              />

              {/* Popover Sélecteur d'Indicatif */}
              {isPhoneCountryOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 max-h-60 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div className="relative">
                      <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={phoneCountrySearch}
                        onChange={(e) => setPhoneCountrySearch(e.target.value)}
                        placeholder="Rechercher un pays ou indicatif..."
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto divide-y divide-slate-100 text-left">
                    {filteredPhoneCountries.map((c) => {
                      const isSelected = profileCountry.code === c.code
                      return (
                        <button
                          key={`fpc-${c.code}`}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setProfileCountry(c)
                            setIsPhoneCountryOpen(false)
                            setPhoneCountrySearch("")
                            if (profilePhone) {
                              setProfilePhone(formatPhoneNumber(profilePhone, c.code))
                            }
                          }}
                          className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                            isSelected ? "bg-primary/10 text-primary font-bold" : "text-slate-700"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="text-base">{getCountryFlag(c.code)}</span>
                            <span className="truncate">{c.name}</span>
                          </span>
                          <span className="font-mono text-slate-400 text-[11px] shrink-0">{c.dial}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3 & 4. Pays et Ville */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pays */}
            <div className="space-y-1" ref={residenceCountryRef}>
              <label className="text-xs font-bold text-slate-700">3. Pays de résidence *</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsResidenceCountryOpen(!isResidenceCountryOpen)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 hover:bg-slate-50 transition-all cursor-pointer text-left shadow-2xs"
                >
                  <span className="truncate font-semibold text-slate-800">
                    {country ? (
                      <span className="flex items-center gap-2">
                        <span>{getCountryFlag(countries.find(c => c.name.toLowerCase() === country.toLowerCase() || c.code.toLowerCase() === country.toLowerCase())?.code || "")}</span>
                        <span>{country}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">Sélectionnez votre pays...</span>
                    )}
                  </span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isResidenceCountryOpen ? "rotate-180" : ""}`} />
                </button>

                {isResidenceCountryOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full max-h-60 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                      <div className="relative">
                        <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={residenceCountrySearch}
                          onChange={(e) => setResidenceCountrySearch(e.target.value)}
                          placeholder="Rechercher un pays..."
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto divide-y divide-slate-100 text-left">
                      {filteredResidenceCountries.map((c) => {
                        const isSelected = country.toLowerCase() === c.name.toLowerCase() || country.toLowerCase() === c.code.toLowerCase()
                        return (
                          <button
                            key={`frc-${c.code}`}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setCountry(c.name)
                              setIsResidenceCountryOpen(false)
                              setResidenceCountrySearch("")
                            }}
                            className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                              isSelected ? "bg-primary/10 text-primary font-bold" : "text-slate-700"
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="text-base">{getCountryFlag(c.code)}</span>
                              <span className="truncate">{c.name}</span>
                            </span>
                            {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ville */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">4. Ville de résidence *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ouagadougou, Abidjan..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* 5. Secteur d'activité / Profession : 3 Options Claires */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>5. Secteur d'activité / Statut *</span>
              <span className="text-[10px] text-slate-500 font-normal">Sélectionnez votre profil</span>
            </label>

            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {[
                { 
                  id: "Professionnels", 
                  label: "Professionnels", 
                  desc: "Salarié, Cadre, Expert", 
                  icon: Briefcase, 
                  color: "text-blue-600 bg-blue-50 border-blue-200" 
                },
                { 
                  id: "Entrepreneurs", 
                  label: "Entrepreneurs", 
                  desc: "Fondateur, Dirigeant, Freelance", 
                  icon: Rocket, 
                  color: "text-amber-600 bg-amber-50 border-amber-200" 
                },
                { 
                  id: "Étudiants", 
                  label: "Étudiants", 
                  desc: "Université, École, Formation", 
                  icon: GraduationCap, 
                  color: "text-emerald-600 bg-emerald-50 border-emerald-200" 
                },
              ].map((item) => {
                const Icon = item.icon
                const isSelected = sector === item.id || (item.id === "Étudiants" && (sector === "Etudiants" || sector.toLowerCase().includes("étudiant") || sector.toLowerCase().includes("etudiant")))
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSector(item.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between relative space-y-1.5 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/40 text-slate-900"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 size-4 rounded-full bg-primary text-slate-950 flex items-center justify-center">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className={`size-8 rounded-xl flex items-center justify-center ${isSelected ? "bg-primary text-slate-950" : item.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">{item.label}</div>
                      <div className="text-[9px] text-slate-500 line-clamp-1">{item.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit & Dismiss Actions */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDismiss}
                className="px-5 py-3 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Plus tard
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="flex-1 py-3 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-slate-950 font-bold text-xs shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Enregistrer mon profil 🚀</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>Données protégées &amp; conformes RGPD</span>
              </span>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-700 hover:underline text-[11px] cursor-pointer"
              >
                Ignorer pour le moment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

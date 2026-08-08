"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Search, Menu, X, ChevronDown, Sparkles, BookOpen, GraduationCap, Building2, User, LogOut } from "lucide-react"

export function UdemyHeader() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check initial user session
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)
    }
    checkUser()

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (typeof window !== "undefined") {
      localStorage.clear()
      window.location.href = "/login"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 border-b border-border/80 backdrop-blur-xl">
      
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-primary/80 via-primary to-amber-500 text-primary-foreground text-[11px] font-extrabold py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="size-3.5 animate-pulse" />
        <span>BOOTCAMP IA PRO 2 — Direct Live du 31 Août au 6 Septembre 2026. Inscriptions ouvertes !</span>
        <Link href="/checkout/bootcamp-ia-pro" className="underline font-black hover:opacity-90 ml-1">
          Réserver ma place (99 000 FCFA) →
        </Link>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
          <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover" />
          <span className="font-heading text-lg font-black tracking-tight text-white">
            LE GUIDE <span className="text-primary">IA</span>
          </span>
        </Link>

        {/* Categories Dropdown */}
        <div
          className="relative hidden md:block group"
          onMouseEnter={() => setCategoriesOpen(true)}
          onMouseLeave={() => setCategoriesOpen(false)}
        >
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors"
          >
            <span>Catégories</span>
            <ChevronDown className="size-3.5 text-muted-foreground group-hover:rotate-180 transition-transform" />
          </button>

          {categoriesOpen && (
            <div className="absolute top-full left-0 pt-2 w-64 z-50">
              <div className="rounded-2xl border border-border bg-card p-3 shadow-2xl space-y-1 backdrop-blur-2xl">
                <Link href="/bootcamp" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground">
                  <GraduationCap className="size-4 text-primary" />
                  <span>Bootcamps IA Live</span>
                </Link>
                <Link href="/ressources" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground">
                  <BookOpen className="size-4 text-purple-400" />
                  <span>Bibliothèque de Prompts</span>
                </Link>
                <Link href="/entreprises" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground">
                  <Building2 className="size-4 text-emerald-400" />
                  <span>Espace Entreprises (B2B)</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar (Udemy Style) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Que voulez-vous apprendre ? (ex: ChatGPT, Prompting, Automation Make...)"
              className="w-full rounded-full border border-border bg-input/40 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Nav Links & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          <Link href="/entreprises" className="hidden lg:inline-block text-xs font-bold text-slate-300 hover:text-white transition-colors">
            Le Guide IA Business
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all">
                <User className="size-3.5" />
                <span>Mon Espace</span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs font-bold text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-white border border-border hover:bg-secondary px-4 py-2 rounded-xl transition-all"
              >
                Se connecter
              </Link>

              <Link
                href="/register-account"
                className="text-xs font-bold text-primary-foreground bg-primary hover:opacity-90 px-4 py-2 rounded-xl shadow-lg transition-all"
              >
                S'inscrire
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white p-2"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          <Link href="/bootcamp" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-foreground">
            Bootcamps IA Live
          </Link>
          <Link href="/ressources" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-foreground">
            Bibliothèque Premium
          </Link>
          <Link href="/entreprises" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-foreground">
            Espace Entreprises (B2B)
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-primary">
                Mon Espace
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="block w-full text-left py-2 text-xs font-bold text-rose-400"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 text-xs font-bold text-white border border-border rounded-xl">
                Se connecter
              </Link>
              <Link href="/register-account" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      )}

    </header>
  )
}

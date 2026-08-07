"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Globe, ShoppingCart, Menu, X, ChevronDown, Sparkles, BookOpen, GraduationCap, UserCheck, Building2, User } from "lucide-react"

export function UdemyHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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
        <div className="relative hidden md:block">
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors"
          >
            <span>Catégories</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {categoriesOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-border bg-card p-3 shadow-2xl space-y-1 z-50 backdrop-blur-2xl">
              <Link href="/bootcamp" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground">
                <GraduationCap className="size-4 text-primary" />
                <span>Bootcamps IA Live (15h)</span>
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
          )}
        </div>

        {/* Search Bar (Udemy Style) */}
        <div className="flex-1 max-w-lg hidden sm:block relative">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 size-4 text-muted-foreground" />
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

          <Link href="/dashboard" className="hidden md:inline-block text-xs font-bold text-slate-300 hover:text-white transition-colors">
            Mon Espace Membre
          </Link>

          {/* Auth CTA Buttons */}
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
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-foreground">
            Mon Espace Membre
          </Link>
        </div>
      )}

    </header>
  )
}

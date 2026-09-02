"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { supabase } from "@/lib/supabase"

export function SiteNav() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const links = [
    { label: "Bootcamps IA", href: "/bootcamp" },
    { label: "Bibliothèque Prompts", href: "/ressources" },
    { label: "Entreprises (B2B)", href: "/entreprises" },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll)

    async function loadUserRole(userId: string) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle()
        if (data?.role) setUserRole(data.role)
      } catch (_) {}
    }

    // Detect Supabase user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user?.id) loadUserRole(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.id) loadUserRole(session.user.id)
      else setUserRole(null)
    })

    return () => {
      window.removeEventListener("scroll", onScroll)
      subscription.unsubscribe()
    }
  }, [])

  const languageToggle = (
    <div className="flex items-center gap-1 rounded-full bg-secondary/60 p-1 ring-1 ring-border/80">
      <button
        type="button"
        onClick={() => setLanguage("fr")}
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-bold uppercase transition-all duration-200 cursor-pointer",
          language === "fr"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-bold uppercase transition-all duration-200 cursor-pointer",
          language === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  )

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border/60 bg-background/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <img
            src="/Logo%20avatar.png"
            alt="Logo Le Guide IA"
            className="size-9 rounded-lg object-cover"
          />
          <span className="font-heading text-lg font-extrabold tracking-tight">
            LE GUIDE <span className="text-primary">IA</span>
          </span>
        </a>

        {/* Desktop Links with Active Route Highlighting */}
        <div className="hidden items-center gap-2 lg:flex">
          {links.map((l) => {
            const isActive = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href))
            return (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  "text-xs transition-all duration-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-sm font-extrabold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 font-medium"
                )}
              >
                {isActive && <span className="size-1.5 rounded-full bg-primary animate-pulse" />}
                <span>{l.label}</span>
              </a>
            )
          })}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {languageToggle}

          {user ? (
            <a
              href={userRole === "admin" || userRole === "super_admin" ? "/admin" : "/dashboard"}
              className="flex items-center gap-2 text-xs font-bold text-primary-foreground bg-primary hover:opacity-90 px-4 py-2 rounded-xl transition-all shadow-md"
            >
              <LayoutDashboard className="size-3.5" />
              <span>{userRole === "admin" || userRole === "super_admin" ? "Portail Admin" : "Mon Dashboard"}</span>
            </a>
          ) : (
            <a
              href="/login"
              className="text-xs font-bold text-foreground bg-secondary/80 hover:bg-secondary border border-border px-3.5 py-2 rounded-xl transition-all"
            >
              Espace Membre
            </a>
          )}

          <a
            href="/checkout/bootcamp-ia-pro"
            className={cn(buttonVariants({ size: "lg" }), "font-semibold shadow-md")}
          >
            S'inscrire au Bootcamp
          </a>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          {languageToggle}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1.5 px-4 py-4">
              {links.map((l) => {
                const isActive = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href))
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm transition-colors flex items-center justify-between",
                      isActive
                        ? "bg-primary/20 text-primary font-extrabold border border-primary/30"
                        : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <span>{l.label}</span>
                    {isActive && <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Actif</span>}
                  </a>
                )
              })}
              
              {user ? (
                <a
                  href={userRole === "admin" || userRole === "super_admin" ? "/admin" : "/dashboard"}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-secondary mt-1"
                >
                  <LayoutDashboard className="size-4" />
                  <span>{userRole === "admin" || userRole === "super_admin" ? "Portail Admin" : "Mon Dashboard"}</span>
                </a>
              ) : (
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-secondary mt-1"
                >
                  Espace Membre
                </a>
              )}

              <a
                href="/checkout/bootcamp-ia-pro"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full font-semibold")}
              >
                S'inscrire au Bootcamp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

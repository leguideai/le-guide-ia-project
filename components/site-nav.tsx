"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

export function SiteNav() {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const links = [
    { label: t("nav.programme"), href: "#programme" },
    { label: t("nav.audience"), href: "#audience" },
    { label: t("nav.tools"), href: "#outils" },
    { label: t("nav.bootcamp"), href: "#parcours" },
    { label: t("nav.register"), href: "#inscription" },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
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
        <a href="#" className="flex items-center gap-2.5">
          <img
            src="/Logo%20avatar.png"
            alt="Logo Le Guide IA"
            className="size-9 rounded-lg object-cover"
          />
          <span className="font-heading text-lg font-extrabold tracking-tight">
            LE GUIDE <span className="text-primary">IA</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {languageToggle}
          <a href="#inscription" className={cn(buttonVariants({ size: "lg" }), "glow-blue font-semibold")}>
            {t("nav.cta")}
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
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#inscription"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full font-semibold")}
              >
                {t("nav.cta")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

"use client"

import { motion } from "motion/react"
import { Mail, CheckCircle2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { usePromoStatus } from "@/lib/use-promo"

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/alfreddah/",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@leguideai",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1crb38psK1/?mibextid=wwXIfr",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
]

function InlineCountdown() {
  const { isExpired, timeLeft, mounted } = usePromoStatus()

  if (!mounted || isExpired) return null

  return (
    <span className="text-amber-500 font-bold ml-1">
      · Expire dans {timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m
    </span>
  )
}

export function CtaFooter() {
  const { t } = useLanguage()
  const { isExpired, mounted } = usePromoStatus()
  const promoActive = mounted ? !isExpired : true

  const waMessage = promoActive
    ? "Bonjour Alfred, je souhaite rejoindre le Bootcamp IA & Carrière (Offre Promo - 99 000 FCFA) et valider mon paiement."
    : "Bonjour Alfred, je souhaite rejoindre le Bootcamp IA & Carrière (149 000 FCFA) et valider mon paiement."

  const links = [
    { label: t("nav.programme"), href: "/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf" },
    { label: t("nav.audience"), href: "/#audience" },
    { label: t("nav.bootcamp"), href: "/#tarifs" },
    // { label: t("nav.testimonials"), href: "/#temoignages" },
    { label: t("nav.services"), href: "/services" },
    { label: t("nav.resources"), href: "/ressources" },
    { label: t("nav.faq"), href: "/#faq" },
  ]

  return (
    <footer className="relative border-t border-border/60 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        
        {/* Section de Clôture Premium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-[#0D1B3E] border border-primary/20 p-8 sm:p-12 shadow-2xl"
        >
          {/* Logo en haut à gauche */}
          <a href="/" className="absolute top-6 left-6 flex items-center gap-2.5 z-20 hover:opacity-90 transition-opacity">
            <img
              src="/Logo%20avatar.png"
              alt="Logo Le Guide IA"
              className="size-8 rounded-lg object-cover"
            />
            <span className="font-heading text-base font-extrabold tracking-tight text-white">
              LE GUIDE <span className="text-primary">IA</span>
            </span>
          </a>

          <div className="grid gap-8 lg:grid-cols-12 items-center relative z-10 pt-8 lg:pt-0">
            {/* Left Content */}
            <div className="lg:col-span-8 text-left">
              <h2 className="font-heading text-2xl font-black leading-tight text-white sm:text-3xl max-w-2xl">
                "{t("ctaFooter.title")}"
              </h2>
              <p className="mt-4 text-sm text-slate-300 max-w-xl">
                {t("ctaFooter.desc")}
              </p>
              
              <div className="mt-8">
                <a
                  href={`https://wa.me/22605050577?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none px-8 text-base shadow-lg shadow-amber-500/10 active:scale-95 transition-transform"
                  )}
                >
                  {t("ctaFooter.ctaPro")}
                </a>
                
                <div className="mt-4 text-xs text-slate-300 flex flex-wrap gap-2 items-center">
                  <span className="font-bold text-white">
                    {promoActive ? t("ctaFooter.founderPrice") : (t("ctaFooter.standardPrice") || "149 000 FCFA · Tarif Normal")}
                  </span>
                  {promoActive && <InlineCountdown />}
                </div>

                {/* Checklist Badges */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    {t("pricing.features.5")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Accès immédiat au groupe WhatsApp
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Certificat officiel
                  </span>
                </div>
              </div>
            </div>

            {/* Right Image (Alfred Dah Portrait) */}
            <div className="lg:col-span-4 hidden lg:block relative">
              <a
                href="https://www.linkedin.com/in/alfreddah/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block overflow-hidden rounded-2xl border border-primary/20 glow-blue bg-slate-950/20 max-w-[280px] ml-auto group cursor-pointer"
                title="Profil LinkedIn d'Alfred Dah"
              >
                <img
                  src="/profile_alfred.jpg"
                  alt="Alfred Dah - Expert IA & Fondateur de Le Guide IA"
                  className="w-full object-cover aspect-[4/5] object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-slate-950/90 border border-sky-500/40 px-2.5 py-1 text-[11px] font-bold text-sky-400 backdrop-blur-md group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </div>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer info links grid */}
        <div className="mt-16 grid gap-10 border-t border-border/40 pt-12 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {/* Column 1 - Brand Info */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-3">
            <a href="/" className="flex items-center gap-2.5">
              <img
                src="/Logo%20avatar.png"
                alt="Logo Le Guide IA"
                className="size-9 rounded-lg object-cover"
              />
              <span className="font-heading text-lg font-extrabold tracking-tight text-white">
                LE GUIDE <span className="text-primary">IA</span>
              </span>
            </a>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Prenez de l'avance sur votre temps grâce à la maîtrise pratique de l'Intelligence Artificielle. Formations et prestations de services sur-mesure.
            </p>
            <span className="text-xs font-semibold text-muted-foreground mt-2">Alfred Dah</span>
          </div>

          {/* Column 2 - Navigation Links */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">
              Navigation
            </span>
            <ul className="flex flex-col items-center sm:items-start gap-3.5 text-xs font-bold uppercase tracking-wider">
              {links.map((l, i) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target={i === 0 ? "_blank" : undefined}
                    rel={i === 0 ? "noopener noreferrer" : undefined}
                    className="text-muted-foreground transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact & Socials */}
          <div className="flex flex-col items-center sm:items-start gap-4 text-sm text-muted-foreground">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">
              Contact & Réseaux
            </span>
            <div className="flex flex-col items-center sm:items-start gap-3">
              <a
                href="mailto:alfred@leguideai.com"
                className="inline-flex items-center gap-2 transition-colors hover:text-white text-xs font-semibold"
              >
                <Mail className="size-4 text-primary" />
                alfred@leguideai.com
              </a>
              <div className="flex items-center gap-2.5 mt-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary bg-card/10 hover:bg-card/30"
                  >
                    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 4 - Visitor Statistics (Flag Counter) & Legal */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">
              Statistiques de visites
            </span>
            <a href="https://info.flagcounter.com/vace" target="_blank" rel="noopener noreferrer" className="block transition-all hover:scale-[1.02] active:scale-95">
              <img
                src="https://s01.flagcounter.com/count/vace/bg_0f172a/txt_ffffff/border_0f172a/columns_2/maxflags_16/viewers_0/labels_0/pageviews_0/flags_0/percent_0/"
                alt="Compteur de Visiteurs"
                className="rounded-lg shadow-md border border-border/30"
              />
            </a>
            {/* Legal links */}
            <ul className="flex flex-col items-center sm:items-start gap-2 text-xs font-semibold mt-1">
              <li>
                <a href="/mentions-legales" className="text-muted-foreground transition-colors hover:text-white">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="/politique-confidentialite" className="text-muted-foreground transition-colors hover:text-white">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/conditions-generales" className="text-muted-foreground transition-colors hover:text-white">
                  Conditions générales de vente
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-muted-foreground">
          {t("ctaFooter.rights").replace("{year}", new Date().getFullYear().toString())}
        </p>
      </div>
    </footer>
  )
}

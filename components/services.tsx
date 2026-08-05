"use client"

import { motion } from "motion/react"
import { Laptop, Briefcase, FileText, TrendingUp, Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Services() {
  const { t } = useLanguage()
  const servicesList = t("services.items") || []

  // Icons map to match index
  const icons = [
    <Laptop className="size-6 text-primary" key="laptop" />,
    <Briefcase className="size-6 text-primary" key="briefcase" />,
    <FileText className="size-6 text-primary" key="filetext" />,
    <TrendingUp className="size-6 text-primary" key="trending" />
  ]

  const whatsappNumber = "22605050577"

  return (
    <section className="py-24 bg-card/5 border-y border-border/50 relative overflow-hidden" id="services">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 translate-x-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full"
          >
            {t("services.tag")}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {t("services.title")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base text-muted-foreground leading-relaxed"
          >
            {t("services.desc")}
          </motion.p>
        </div>

        {/* Services Grid (2 per row) */}
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {servicesList.map((service: any, i: number) => {
            const encodedMsg = encodeURIComponent(service.message || "")
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card/20 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                <div>
                  {/* Service Icon Box */}
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {icons[i] || <Laptop className="size-6 text-primary" />}
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-heading text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 sm:min-h-[56px]">
                    {service.desc}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 mb-8 border-t border-border/40 pt-6">
                    {(service.features || []).map((feat: string, j: number) => (
                      <li className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium" key={j}>
                        <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="size-3 stroke-[3]" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call To Action */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full font-bold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:glow-blue transition-all duration-300 cursor-pointer text-xs uppercase tracking-wider"
                  )}
                >
                  {t("services.cta")}
                </a>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

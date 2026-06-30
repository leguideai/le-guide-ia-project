"use client"

import { motion } from "motion/react"
import { useLanguage } from "@/lib/language-context"

export function Process() {
  const { t } = useLanguage()
  const steps = t("process.steps") || []

  return (
    <section className="py-20 bg-card/5 relative overflow-hidden" id="process">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("process.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("process.title")}
          </h2>
        </div>

        <div className="relative mt-12">
          {/* Connector line for desktop */}
          <div className="absolute top-[45px] left-8 right-8 hidden h-0.5 bg-border lg:block" />
          
          <div className="grid gap-8 lg:grid-cols-6 lg:gap-4">
            {steps.map((s: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step badge */}
                <div className="z-10 flex size-12 items-center justify-center rounded-full border-2 border-border bg-card font-heading text-sm font-black text-primary transition-colors group-hover:border-primary">
                  {s.step}
                </div>
                
                {/* Time badge */}
                <span className="mt-4 rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {s.time}
                </span>
                
                <h3 className="mt-3 font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-[150px]">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

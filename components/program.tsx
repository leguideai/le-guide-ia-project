"use client"

import { motion } from "motion/react"
import { Calendar, Video, Clock } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Program() {
  const { t } = useLanguage()

  const sessions = (t("program.sessions") || []) as Array<{ date: string; session: string; title: string }>

  return (
    <section id="programme" className="relative py-24 bg-card/5">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("program.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("program.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("program.desc")}
          </p>
        </motion.div>

        {/* Vertical timeline */}
        <div className="relative mx-auto mt-16 max-w-3xl">
          {/* vertical track */}
          <div
            className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-primary/5 md:left-1/2 md:-translate-x-1/2"
            aria-hidden="true"
          />
          
          <ul className="space-y-8">
            {sessions.map((s, i) => {
              const left = i % 2 === 0
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="relative pl-14 md:grid md:grid-cols-2 md:gap-x-12 md:pl-0"
                >
                  {/* node on the track */}
                  <span className="absolute left-6 top-5 z-10 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-primary/40 bg-background text-primary shadow-[0_0_15px] shadow-primary/20 md:left-1/2">
                    <Calendar className="size-4" />
                  </span>

                  {/* card */}
                  <div
                    className={`group relative overflow-hidden rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-all hover:border-primary/40 ${
                      left ? "md:col-start-1 md:mr-8 md:text-right" : "md:col-start-2 md:ml-8"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-baseline gap-2 mb-1 justify-start md:group-hover:justify-end">
                      <span className="font-mono text-xs font-bold text-primary">
                        {s.date}
                      </span>
                      <span className="text-[10px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-full font-bold">
                        {s.session}
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {s.title}
                    </h3>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </div>

        {/* Timeline Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-16 max-w-2xl rounded-2xl border border-border/80 bg-card/30 p-6 backdrop-blur-sm text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Video className="size-4 text-primary shrink-0" />
              <span>{t("program.detailsNote")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary shrink-0" />
              <span>{t("program.scheduleNote")}</span>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="#tarifs"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 text-base shadow-lg shadow-amber-500/10 active:scale-95 transition-transform"
          >
            Je rejoins le Bootcamp IA & Carrière
          </a>
        </motion.div>
      </div>
    </section>
  )
}

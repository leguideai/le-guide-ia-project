"use client"

export function UdemyTrustLogos() {
  const tools = [
    { name: "ChatGPT / OpenAI", logo: "🤖 OpenAI ChatGPT" },
    { name: "Claude 3.5 Anthropic", logo: "🧠 Anthropic Claude" },
    { name: "Midjourney v6", logo: "🎨 Midjourney" },
    { name: "Make / Zapier", logo: "⚡ Make Automation" },
    { name: "Canva IA", logo: "✨ Canva AI" },
    { name: "Google Gemini", logo: "💎 Google Gemini" },
  ]

  return (
    <section className="py-10 bg-slate-950/80 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-4 md:px-8 text-left space-y-6">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Outils & Technologies enseignés dans nos Bootcamps
        </p>
        <div className="flex flex-wrap items-center justify-start gap-4 md:gap-6 opacity-90 hover:opacity-100 transition-opacity">
          {tools.map((t, idx) => (
            <span key={idx} className="font-heading text-xs md:text-sm font-black text-slate-300 bg-card/40 border border-border/50 px-4 py-2 rounded-xl backdrop-blur-md">
              {t.logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

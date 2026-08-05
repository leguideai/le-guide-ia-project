"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function RegisterAccountPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          whatsapp,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            <span>Retour au site</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-7 rounded-md object-cover" />
            <span className="font-heading text-sm font-extrabold">LE GUIDE <span className="text-primary">IA</span></span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/60 p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Créer un compte</h1>
            <p className="text-xs text-muted-foreground">Accédez à votre espace membre et vos formations</p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-3 text-xs text-rose-400">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Compte créé avec succès !</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Un email de confirmation vous a été envoyé à <strong className="text-foreground">{email}</strong>. Cliquez sur le lien reçu pour valider votre compte.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground font-bold py-2.5 text-xs shadow-md mt-4"
              >
                Aller à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-bold text-foreground/80">Nom complet</label>
                <div className="relative">
                  <User className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sanson Alfred Dah"
                    className="w-full rounded-xl border border-border bg-input/40 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-foreground/80">Adresse Email</label>
                <div className="relative">
                  <Mail className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl border border-border bg-input/40 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="whatsapp" className="text-xs font-bold text-foreground/80">Numéro WhatsApp</label>
                <div className="relative">
                  <Phone className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+226 05 05 05 77"
                    className="w-full rounded-xl border border-border bg-input/40 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold text-foreground/80">Mot de passe</label>
                <div className="relative">
                  <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    className="w-full rounded-xl border border-border bg-input/40 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold py-2.5 text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer mt-2"
              >
                <UserPlus className="size-4" />
                {loading ? "Inscription en cours..." : "Créer mon compte"}
              </button>
            </form>
          )}

          <div className="text-center text-xs text-muted-foreground pt-2">
            Déjà inscrit ?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

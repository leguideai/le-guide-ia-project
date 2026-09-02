"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { LogIn, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMagicLink, setIsMagicLink] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const redirectTarget = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("redirect") || "/dashboard") : "/dashboard"

    if (isMagicLink) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectTarget}`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage("Lien de connexion envoyé par email. Vérifiez votre boîte de réception.")
      }
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed") || error.message.toLowerCase().includes("not confirmed")) {
        setError("Votre adresse email n'est pas encore confirmée. Veuillez cliquer sur le lien d'activation reçu dans votre boîte de réception (ou dans vos spams).")
      } else if (error.message === "Invalid login credentials") {
        setError("Email ou mot de passe incorrect. Si ce compte n'a pas encore été créé, cliquez sur 'Créer un compte'.")
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else if (data?.session) {
      // Check user role for smart direct redirection
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .maybeSingle()

      if (profile?.role === "admin" || profile?.role === "super_admin" || redirectTarget.includes("admin")) {
        router.replace("/admin")
      } else {
        router.replace(redirectTarget)
      }
    }
  }

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Ensure profile exists for first-time Google users
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle()

        if (!profile) {
          await supabase.from("profiles").upsert({
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0],
            email: session.user.email,
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            role: "student"
          })
        }

        const redirectTarget = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("redirect") || "/dashboard") : "/dashboard"
        if (profile?.role === "admin" || profile?.role === "super_admin" || redirectTarget.includes("admin")) {
          router.replace("/admin")
        } else {
          router.replace(redirectTarget)
        }
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        const redirectTarget = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("redirect") || "/dashboard") : "/dashboard"
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle()

        if (profile?.role === "admin" || profile?.role === "super_admin" || redirectTarget.includes("admin")) {
          router.replace("/admin")
        } else {
          router.replace(redirectTarget)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleGoogleLogin = async () => {
    setError(null)
    const redirectTarget = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("redirect") || "/dashboard") : "/dashboard"
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectTarget}`,
      },
    })
    if (error) setError(error.message)
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
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Espace Membre</h1>
            <p className="text-xs text-muted-foreground">Connectez-vous pour accéder à vos formations et ressources</p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-3 text-xs text-rose-400">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-start gap-3 text-xs text-emerald-400">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-secondary/80 py-2.5 px-4 text-xs font-bold text-foreground transition-all cursor-pointer shadow-sm"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continuer avec Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-[10px] uppercase font-bold text-muted-foreground tracking-widest absolute">ou</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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

            {!isMagicLink && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-foreground/80">Mot de passe</label>
                  <button
                    type="button"
                    onClick={() => setIsMagicLink(true)}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="password"
                    type="password"
                    required={!isMagicLink}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-input/40 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold py-2.5 text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              <LogIn className="size-4" />
              {loading ? "Connexion..." : isMagicLink ? "Recevoir un lien magique" : "Se connecter"}
            </button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-2">
            {isMagicLink ? (
              <button
                type="button"
                onClick={() => setIsMagicLink(false)}
                className="text-primary hover:underline font-semibold"
              >
                Se connecter avec mot de passe
              </button>
            ) : (
              <span>
                Pas encore de compte ?{" "}
                <Link href="/register-account" className="text-primary hover:underline font-bold">
                  Créer un compte
                </Link>
              </span>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}

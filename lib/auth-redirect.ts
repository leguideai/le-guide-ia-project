export function isValidRedirectTarget(target: string | null | undefined): target is string {
  if (!target) return false
  const clean = target.trim()
  if (!clean || clean === "/" || clean === "/#" || clean === "#") return false
  if (clean === "/dashboard" || clean === "/dashboard/") return false
  if (clean.startsWith("/login") || clean.startsWith("/register-account")) return false
  return true
}

export function setAuthRedirect(target: string) {
  if (typeof window === "undefined" || !isValidRedirectTarget(target)) return
  try {
    localStorage.setItem("auth_redirect", target)
    sessionStorage.setItem("auth_redirect", target)
  } catch (_) {}
}

export function getAuthRedirect(defaultFallback = "/dashboard"): string {
  if (typeof window === "undefined") return defaultFallback
  try {
    const param = new URLSearchParams(window.location.search).get("redirect")
    if (isValidRedirectTarget(param)) return param!

    const local = localStorage.getItem("auth_redirect")
    if (isValidRedirectTarget(local)) return local!

    const session = sessionStorage.getItem("auth_redirect")
    if (isValidRedirectTarget(session)) return session!
  } catch (_) {}
  return defaultFallback
}

export function clearAuthRedirect() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem("auth_redirect")
    sessionStorage.removeItem("auth_redirect")
  } catch (_) {}
}

const MASTERCLASS_PENDING_KEY = "pending_masterclass_register"
const MASTERCLASS_SESSION_ID_KEY = "pending_masterclass_session_id"

export function setPendingMasterclassRegistration(sessionId?: string) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(MASTERCLASS_PENDING_KEY, "true")
    localStorage.setItem(MASTERCLASS_PENDING_KEY, "true")
    if (sessionId) {
      sessionStorage.setItem(MASTERCLASS_SESSION_ID_KEY, sessionId)
      localStorage.setItem(MASTERCLASS_SESSION_ID_KEY, sessionId)
    }
  } catch (_) {}
}

export function getPendingMasterclassRegistration(): { autoRegister: boolean; sessionId: string | null } {
  if (typeof window === "undefined") return { autoRegister: false, sessionId: null }
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const hasUrlParam = urlParams.get("action") === "auto_register" || urlParams.get("auto_register") === "true"

    const sessionFlag = sessionStorage.getItem(MASTERCLASS_PENDING_KEY) === "true"
    const localFlag = localStorage.getItem(MASTERCLASS_PENDING_KEY) === "true"
    const sessionId = sessionStorage.getItem(MASTERCLASS_SESSION_ID_KEY) || localStorage.getItem(MASTERCLASS_SESSION_ID_KEY) || urlParams.get("sessionId")

    return {
      autoRegister: hasUrlParam || sessionFlag || localFlag,
      sessionId: sessionId || null
    }
  } catch (_) {
    return { autoRegister: false, sessionId: null }
  }
}

export function clearPendingMasterclassRegistration() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(MASTERCLASS_PENDING_KEY)
    localStorage.removeItem(MASTERCLASS_PENDING_KEY)
    sessionStorage.removeItem(MASTERCLASS_SESSION_ID_KEY)
    localStorage.removeItem(MASTERCLASS_SESSION_ID_KEY)
  } catch (_) {}
}

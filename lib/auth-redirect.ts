export function setAuthRedirect(target: string) {
  if (typeof window === "undefined" || !target || target === "/dashboard") return
  try {
    localStorage.setItem("auth_redirect", target)
    sessionStorage.setItem("auth_redirect", target)
  } catch (_) {}
}

export function getAuthRedirect(defaultFallback = "/dashboard"): string {
  if (typeof window === "undefined") return defaultFallback
  try {
    const param = new URLSearchParams(window.location.search).get("redirect")
    if (param && param !== "/dashboard") return param

    const local = localStorage.getItem("auth_redirect")
    if (local && local !== "/dashboard") return local

    const session = sessionStorage.getItem("auth_redirect")
    if (session && session !== "/dashboard") return session
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

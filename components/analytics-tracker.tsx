"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return ""
  try {
    let visitorId = localStorage.getItem("leguideai_vid")
    if (!visitorId) {
      visitorId = "v_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36)
      localStorage.setItem("leguideai_vid", visitorId)
    }
    return visitorId
  } catch {
    return "v_" + Math.random().toString(36).substring(2, 11)
  }
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    let sessionId = sessionStorage.getItem("leguideai_sid")
    if (!sessionId) {
      sessionId = "s_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36)
      sessionStorage.setItem("leguideai_sid", sessionId)
    }
    return sessionId
  } catch {
    return "s_" + Math.random().toString(36).substring(2, 11)
  }
}

function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop"
  const width = window.innerWidth
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}

export function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedRef = useRef<{ path: string; time: number }>({ path: "", time: 0 })

  useEffect(() => {
    if (!pathname) return
    // Exclure formellement l'espace admin et les routes techniques
    if (
      pathname.startsWith("/admin") || 
      pathname.startsWith("/api") || 
      pathname.startsWith("/_next")
    ) {
      return
    }

    const now = Date.now()
    const fullPath = searchParams && searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname

    // Avoid double tracking exact same path within 3 seconds
    if (lastTrackedRef.current.path === fullPath && now - lastTrackedRef.current.time < 3000) {
      return
    }

    lastTrackedRef.current = { path: fullPath, time: now }

    const visitorId = getOrCreateVisitorId()
    const sessionId = getOrCreateSessionId()
    const deviceType = detectDevice()
    const referrer = typeof document !== "undefined" ? document.referrer : ""

    const payload = {
      path: pathname,
      full_path: fullPath,
      visitor_id: visitorId,
      session_id: sessionId,
      device_type: deviceType,
      referrer: referrer,
      screen_width: typeof window !== "undefined" ? window.innerWidth : 0,
      timestamp: new Date().toISOString()
    }

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
        navigator.sendBeacon("/api/analytics/track", blob)
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {})
      }
    } catch (e) {}
  }, [pathname, searchParams])

  return null
}

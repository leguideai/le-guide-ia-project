"use client"

import { useEffect } from "react"

export function PerformancePatch() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.performance && typeof window.performance.measure === "function") {
      const origMeasure = window.performance.measure.bind(window.performance)
      window.performance.measure = function (name?: string, startMark?: string | PerformanceMeasureOptions, endMark?: string) {
        try {
          return origMeasure(name as string, startMark as any, endMark)
        } catch (e) {
          // Ignore Next.js dev server React Server DOM timing measurement bugs in Turbopack
          return null as any
        }
      }
    }
  }, [])

  return null
}

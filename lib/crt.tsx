"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type CrtContextValue = {
  crtOn: boolean
  toggleCrt: () => void
  /** True after first client render — used to gate the boot sequence. */
  ready: boolean
}

const CrtContext = createContext<CrtContextValue | null>(null)
const STORAGE_KEY = "crt:on"

export function CrtProvider({ children }: { children: React.ReactNode }) {
  // Default the full CRT effects ON, unless the user previously turned them off
  // or prefers reduced motion.
  const [crtOn, setCrtOn] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const initial = stored !== null ? stored === "1" : !prefersReduced
    setCrtOn(initial)
    setReady(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("crt-on", crtOn)
  }, [crtOn])

  const toggleCrt = useCallback(() => {
    setCrtOn((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
      return next
    })
  }, [])

  const value = useMemo(() => ({ crtOn, toggleCrt, ready }), [crtOn, toggleCrt, ready])

  return <CrtContext.Provider value={value}>{children}</CrtContext.Provider>
}

export function useCrt() {
  const ctx = useContext(CrtContext)
  if (!ctx) return { crtOn: false, toggleCrt: () => {}, ready: true } as CrtContextValue
  return ctx
}

"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

export type SfxName = "hover" | "select" | "back" | "toggle" | "type" | "boot" | "error"

type SoundContextValue = {
  muted: boolean
  toggleMuted: () => void
  play: (name: SfxName) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)
const STORAGE_KEY = "crt:muted"

// Synthesize every sound effect with the Web Audio API so we ship zero audio
// assets (nothing to source or license). Each effect is a short oscillator
// blip with a fast gain envelope — clicky and retro by construction.
function playTone(
  ctx: AudioContext,
  {
    freq,
    type = "square",
    duration = 0.06,
    gain = 0.04,
    sweepTo,
  }: { freq: number; type?: OscillatorType; duration?: number; gain?: number; sweepTo?: number },
) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, now + duration)
  amp.gain.setValueAtTime(0.0001, now)
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.005)
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(amp).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(true)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) setMuted(stored === "1")
  }, [])

  const ensureCtx = useCallback(() => {
    if (typeof window === "undefined") return null
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctxRef.current = new AC()
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const play = useCallback(
    (name: SfxName) => {
      if (muted) return
      const ctx = ensureCtx()
      if (!ctx) return
      switch (name) {
        case "hover":
          playTone(ctx, { freq: 880, duration: 0.025, gain: 0.018, type: "square" })
          break
        case "select":
          playTone(ctx, { freq: 660, duration: 0.045, gain: 0.05, type: "square" })
          playTone(ctx, { freq: 1320, duration: 0.06, gain: 0.04, type: "square" })
          break
        case "back":
          playTone(ctx, { freq: 440, sweepTo: 220, duration: 0.08, gain: 0.04, type: "square" })
          break
        case "toggle":
          playTone(ctx, { freq: 520, sweepTo: 1040, duration: 0.07, gain: 0.04, type: "sawtooth" })
          break
        case "type":
          playTone(ctx, { freq: 1500, duration: 0.012, gain: 0.012, type: "square" })
          break
        case "boot":
          playTone(ctx, { freq: 110, sweepTo: 440, duration: 0.5, gain: 0.05, type: "sawtooth" })
          break
        case "error":
          playTone(ctx, { freq: 200, sweepTo: 80, duration: 0.25, gain: 0.06, type: "square" })
          break
      }
    },
    [muted, ensureCtx],
  )

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
      // Audible confirmation when unmuting.
      if (!next) {
        const ctx = ensureCtx()
        if (ctx) playTone(ctx, { freq: 660, sweepTo: 1320, duration: 0.12, gain: 0.05, type: "square" })
      }
      return next
    })
  }, [ensureCtx])

  const value = useMemo(() => ({ muted, toggleMuted, play }), [muted, toggleMuted, play])

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) {
    // Safe no-op fallback if used outside the provider.
    return { muted: true, toggleMuted: () => {}, play: () => {} } as SoundContextValue
  }
  return ctx
}

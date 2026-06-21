"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSound } from "@/lib/sound"
import { projects } from "@/lib/content"
import { AsciiPortrait } from "@/components/crt/ascii-portrait"

const SESSION_KEY = "crt:booted"
const SEGMENTS = 28
const DURATION_MS = 2600

const LINES = [
  "ILLUSTRISIMO_OS v2.0",
  "(c) 2026 BENEDICT GIO B. ILLUSTRISIMO",
  "",
  "POST ........................ OK",
  "CPU: CEBU-CORE @ 4.04 GHZ ... OK",
  "MEM: 640K AI TOKENS ......... OK",
  "DETECTING DISPLAY: CRT ...... OK",
  "",
  "LOADING PROFILE ............. full-stack dev / ai engineer",
  `MOUNTING /projects .......... ${projects.length} MODULES`,
  "INIT NEURAL_NET ............. OK",
  "DECODING PROFILE IMAGE ...... ",
]

const FULL = LINES.join("\n")

export function BootSequence({ onDone }: { onDone: () => void }) {
  const { play } = useSound()
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"booting" | "exiting" | "gone">("gone")
  const playRef = useRef(play)
  playRef.current = play

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1")
    } catch {}
    setPhase("exiting")
    playRef.current("boot")
    window.setTimeout(() => {
      setPhase("gone")
      onDone()
    }, 650)
  }, [onDone])

  useEffect(() => {
    let alreadyBooted = false
    try {
      alreadyBooted = sessionStorage.getItem(SESSION_KEY) === "1"
    } catch {}
    if (alreadyBooted) {
      onDone()
      return
    }

    setPhase("booting")

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setProgress(100)
      return
    }

    const start = performance.now()
    let last = 0
    let rafId = 0
    const step = (now: number) => {
      const p = Math.min(100, Math.round(((now - start) / DURATION_MS) * 100))
      setProgress(p)
      if (p !== last && p % 6 === 0) playRef.current("type")
      last = p
      if (p < 100) rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [onDone])

  // Continue on key / click once fully decoded.
  useEffect(() => {
    if (phase !== "booting") return
    const done = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent && (e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey)) return
      finish()
    }
    window.addEventListener("keydown", done)
    window.addEventListener("pointerdown", done)
    return () => {
      window.removeEventListener("keydown", done)
      window.removeEventListener("pointerdown", done)
    }
  }, [phase, finish])

  // Auto-advance shortly after fully decoded.
  useEffect(() => {
    if (phase !== "booting" || progress < 100) return
    const id = window.setTimeout(finish, 900)
    return () => window.clearTimeout(id)
  }, [phase, progress, finish])

  if (phase === "gone") return null

  const text = FULL.slice(0, Math.ceil((progress / 100) * FULL.length))
  const filled = Math.round((progress / 100) * SEGMENTS)
  const done = progress >= 100

  return (
    <div
      className={`fixed inset-0 z-[90] bg-background flex flex-col items-center justify-center gap-6 p-6 sm:p-10 ${
        phase === "exiting" ? "boot-exit" : ""
      }`}
      role="status"
      aria-label="System boot sequence"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 max-w-3xl w-full">
        <div className="shrink-0 relative border border-primary/50 box-glow p-1.5">
          <AsciiPortrait mode="decode" progress={progress} sizeClass="text-[0.28rem] leading-[0.3rem] sm:text-[0.34rem] sm:leading-[0.36rem]" />
          {/* the decode resolves into the real photo at 100% */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/portrait-web.webp"
            alt=""
            aria-hidden
            className="crt-photo absolute inset-1.5 h-[calc(100%-0.75rem)] w-[calc(100%-0.75rem)] object-cover transition-opacity duration-500"
            style={{ opacity: done ? 1 : 0 }}
          />
        </div>
        <pre className="font-terminal text-primary text-glow text-sm sm:text-lg leading-tight whitespace-pre-wrap flex-1 min-w-0">
          {text}
          {!done && <span className="cursor-blink" />}
          {done && "\n\n> PRESS ANY KEY TO CONTINUE_"}
        </pre>
      </div>

      {/* progress bar */}
      <div className="w-full max-w-3xl font-mono text-xs sm:text-sm text-primary text-glow">
        <div className="flex justify-between mb-1 text-muted-foreground">
          <span>{done ? "DECODE COMPLETE" : "DECODING PROFILE IMAGE"}</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="leading-none tracking-tighter whitespace-nowrap overflow-hidden">
          <span className="text-muted-foreground">[</span>
          <span className="text-primary">{"█".repeat(filled)}</span>
          <span className="text-border">{"░".repeat(SEGMENTS - filled)}</span>
          <span className="text-muted-foreground">]</span>
        </div>
      </div>

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-6 right-6 text-[11px] text-muted-foreground hover:text-primary snap border border-border px-2 py-1"
      >
        SKIP [ESC]
      </button>
    </div>
  )
}

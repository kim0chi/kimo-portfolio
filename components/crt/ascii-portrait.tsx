"use client"

import { useEffect, useRef, useState } from "react"
import {
  ASCII_FRAME,
  BINARY_FRAME,
  BLOCK_FRAME,
  PORTRAIT_EYES,
} from "@/lib/portrait-frames"

const NOISE = "01<>/\\|=+*#%@-:.{}[]"

function scramble(frame: string[], amount: number): string {
  if (amount <= 0) return frame.join("\n")
  return frame
    .map((row) => {
      let out = ""
      for (let i = 0; i < row.length; i++) {
        const ch = row[i]
        if (ch !== " " && Math.random() < amount) {
          out += NOISE[(Math.random() * NOISE.length) | 0]
        } else {
          out += ch
        }
      }
      return out
    })
    .join("\n")
}

// Pick the representation + scramble amount for a given decode progress.
function frameForProgress(p: number): { frame: string[]; amount: number } {
  if (p < 35) return { frame: BINARY_FRAME, amount: 0.85 - (p / 35) * 0.35 }
  if (p < 70) return { frame: BLOCK_FRAME, amount: 0.45 - ((p - 35) / 35) * 0.3 }
  return { frame: ASCII_FRAME, amount: Math.max(0, 0.18 - ((p - 70) / 30) * 0.18) }
}

type Props = {
  /** "decode" animates representations driven by `progress`; "live" is the settled, interactive portrait. */
  mode: "decode" | "live"
  /** 0-100, only used in decode mode. */
  progress?: number
  className?: string
  /** font sizing utility classes for the <pre> */
  sizeClass?: string
}

export function AsciiPortrait({ mode, progress = 100, className = "", sizeClass = "" }: Props) {
  const [text, setText] = useState(() =>
    mode === "live" ? ASCII_FRAME.join("\n") : scramble(BINARY_FRAME, 0.85),
  )
  const [glitch, setGlitch] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const tilt = useRef({ rx: 0, ry: 0 })
  const pupil = useRef({ dx: 0, dy: 0 })
  const raf = useRef<number | null>(null)

  // ---- decode mode: shimmer scramble while progress climbs ----
  useEffect(() => {
    if (mode !== "decode") return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const { frame, amount } = frameForProgress(progress)
    if (prefersReduced) {
      setText(frame.join("\n"))
      return
    }
    setText(scramble(frame, amount))
    if (amount <= 0) return
    const id = window.setInterval(() => setText(scramble(frame, amount)), 55)
    return () => window.clearInterval(id)
  }, [mode, progress])

  // ---- live mode: cursor-driven tilt + pupil tracking ----
  useEffect(() => {
    if (mode !== "live") return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const onMove = (e: PointerEvent) => {
      const el = wrapRef.current
      if (!el) return
      if (raf.current) return
      raf.current = requestAnimationFrame(() => {
        raf.current = null
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)))
        const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)))
        tilt.current = { rx: -ny * 6, ry: nx * 6 }
        pupil.current = { dx: nx * 0.16, dy: ny * 0.16 } // in em
        if (preRef.current) {
          preRef.current.style.transform = `perspective(700px) rotateX(${tilt.current.rx}deg) rotateY(${tilt.current.ry}deg)`
        }
        el.style.setProperty("--px", `${pupil.current.dx}em`)
        el.style.setProperty("--py", `${pupil.current.dy}em`)
      })
    }
    window.addEventListener("pointermove", onMove)
    return () => {
      window.removeEventListener("pointermove", onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [mode])

  // ---- live mode: occasional RGB-split glitch ----
  useEffect(() => {
    if (mode !== "live") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let timeout: number
    const loop = () => {
      // random 4-9s between glitches
      timeout = window.setTimeout(() => {
        setGlitch(true)
        window.setTimeout(() => setGlitch(false), 220)
        loop()
      }, 4000 + Math.random() * 5000)
    }
    loop()
    return () => window.clearTimeout(timeout)
  }, [mode])

  const live = mode === "live"

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block select-none ${live ? "group" : ""} ${className}`}
      onPointerEnter={live ? () => setGlitch(true) : undefined}
      onPointerLeave={live ? () => setGlitch(false) : undefined}
      aria-hidden
    >
      <pre
        ref={preRef}
        className={`m-0 font-mono leading-[1.02] text-primary text-glow whitespace-pre transition-[filter] duration-150 ${
          glitch ? "rgb-glitch" : ""
        } ${sizeClass}`}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {text}
      </pre>

      {live && (
        <>
          {/* scanning beam */}
          <span className="scan-beam pointer-events-none absolute inset-0" />
          {/* tracking pupils */}
          {PORTRAIT_EYES.map((eye, i) => (
            <span
              key={i}
              className="pupil pointer-events-none absolute"
              style={{ left: `${eye.x * 100}%`, top: `${eye.y * 100}%` }}
            />
          ))}
        </>
      )}
    </div>
  )
}

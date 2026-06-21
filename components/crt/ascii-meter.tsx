"use client"

import { useEffect, useRef, useState } from "react"

const SEGMENTS = 16

// A retro segmented bar: ████████░░░░░░░░  NN%
// Fills up when scrolled into view.
export function AsciiMeter({ label, level }: { label: string; level: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const target = Math.round((level / 100) * SEGMENTS)

    const animate = () => {
      let current = 0
      const id = window.setInterval(() => {
        current += 1
        setShown(current)
        if (current >= target) window.clearInterval(id)
      }, 45)
      return id
    }

    let intervalId: number | undefined
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            intervalId = animate()
            obs.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )
    obs.observe(node)
    return () => {
      obs.disconnect()
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [level])

  const filled = "█".repeat(shown)
  const empty = "░".repeat(SEGMENTS - shown)

  return (
    <div ref={ref} className="text-sm">
      <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
        <span className="text-foreground">{label}</span>
        <span className="tabular-nums">{Math.round((shown / SEGMENTS) * 100)}%</span>
      </div>
      <div className="font-mono leading-none tracking-tighter whitespace-nowrap overflow-hidden">
        <span className="text-primary text-glow">{filled}</span>
        <span className="text-border">{empty}</span>
      </div>
    </div>
  )
}

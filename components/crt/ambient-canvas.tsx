"use client"

import { useEffect, useRef } from "react"

const GREEN = (a: number) => `rgba(150, 200, 96, ${a})`
const RAIN_CH = "01<>/|=+*#01ABCDEF"

export function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const small = window.innerWidth < 640
    const canvas = ref.current!
    const ctx = canvas.getContext("2d")!
    let w = window.innerWidth
    let h = window.innerHeight
    let dpr = 1
    const cell = 14

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const rand = Math.random
    // slow phosphor dust
    const DUST = small ? 16 : 34
    const dust = Array.from({ length: DUST }, () => ({
      x: rand() * w,
      y: rand() * h,
      vx: (rand() - 0.5) * 0.08,
      vy: -(0.04 + rand() * 0.12),
      s: 0.6 + rand() * 1.7,
      a: 0.05 + rand() * 0.13,
    }))

    // faint matrix rain
    const DROPS = small ? 0 : 16
    const cols = Math.max(1, Math.floor(w / cell))
    const drops = Array.from({ length: DROPS }, () => ({
      x: Math.floor(rand() * cols) * cell,
      y: rand() * h,
      sp: 0.5 + rand() * 1.1,
      len: 5 + Math.floor(rand() * 9),
      seed: Math.floor(rand() * RAIN_CH.length),
    }))

    const paintDust = () => {
      for (const d of dust) {
        ctx.fillStyle = GREEN(d.a)
        ctx.fillRect(d.x, d.y, d.s, d.s)
      }
    }

    const drawFrame = () => {
      ctx.clearRect(0, 0, w, h)
      // dust
      for (const d of dust) {
        d.x += d.vx
        d.y += d.vy
        if (d.y < -4) {
          d.y = h + 4
          d.x = rand() * w
        }
        if (d.x < -4) d.x = w + 4
        else if (d.x > w + 4) d.x = -4
        ctx.fillStyle = GREEN(d.a)
        ctx.fillRect(d.x, d.y, d.s, d.s)
      }
      // rain
      if (DROPS) {
        ctx.font = `${cell}px ui-monospace, monospace`
        ctx.textBaseline = "top"
        for (const drop of drops) {
          for (let i = 0; i < drop.len; i++) {
            const yy = drop.y - i * cell
            if (yy < -cell || yy > h) continue
            const a = (1 - i / drop.len) * 0.13
            ctx.fillStyle = GREEN(a)
            ctx.fillText(RAIN_CH[(drop.seed + i * 7 + ((drop.y / cell) | 0)) % RAIN_CH.length], drop.x, yy)
          }
          drop.y += drop.sp
          if (drop.y - drop.len * cell > h) {
            drop.y = -cell
            drop.x = Math.floor(rand() * cols) * cell
            drop.sp = 0.5 + rand() * 1.1
          }
        }
      }
      raf = requestAnimationFrame(drawFrame)
    }

    let raf = 0
    if (reduced) {
      paintDust() // static scatter, no animation
    } else {
      raf = requestAnimationFrame(drawFrame)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-[8] opacity-70" />
}

"use client"

import { useEffect, useRef } from "react"

const GREEN = (a: number) => `rgba(168, 214, 112, ${a})`
const NOISE = "01<>/\\|=+*#%-:.{}[]"
const TRAIL_MS = 360
const SCRAMBLE_R = 52 // px radius of the cursor scramble cloud

export function CursorFx() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pos = useRef({ x: -100, y: -100 })
  const trail = useRef<{ x: number; y: number; t: number }[]>([])
  const hovering = useRef(false)
  const down = useRef(false)
  const reduced = useRef(false)

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    if (!fine || !canvasRef.current) return
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    document.documentElement.classList.add("hide-cursor")

    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    let dpr = 1
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + "px"
      canvas.style.height = window.innerHeight + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`)
      document.documentElement.style.setProperty("--my", `${e.clientY}px`)
      if (!reduced.current) trail.current.push({ x: e.clientX, y: e.clientY, t: performance.now() })
    }
    const onOver = (e: PointerEvent) => {
      const el = e.target as HTMLElement
      hovering.current = !!el?.closest?.('a,button,input,textarea,[role="menuitem"],[data-cursor="target"]')
    }
    const onDown = () => (down.current = true)
    const onUp = () => (down.current = false)
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerover", onOver, { passive: true })
    window.addEventListener("pointerdown", onDown, { passive: true })
    window.addEventListener("pointerup", onUp, { passive: true })

    let scrambleGlyphs: { dx: number; dy: number; ch: string; a: number }[] = []
    let lastScramble = 0
    let raf = 0

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)
      const { x, y } = pos.current
      const now = performance.now()

      if (!reduced.current) {
        // scramble cloud around the cursor
        if (now - lastScramble > 85) {
          lastScramble = now
          scrambleGlyphs = []
          for (let i = 0; i < 16; i++) {
            const ang = Math.random() * Math.PI * 2
            const r = Math.random() * SCRAMBLE_R
            scrambleGlyphs.push({
              dx: Math.cos(ang) * r,
              dy: Math.sin(ang) * r,
              ch: NOISE[(Math.random() * NOISE.length) | 0],
              a: (1 - r / SCRAMBLE_R) * 0.32,
            })
          }
        }
        ctx.font = "11px ui-monospace, monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        for (const g of scrambleGlyphs) {
          ctx.fillStyle = GREEN(g.a)
          ctx.fillText(g.ch, x + g.dx, y + g.dy)
        }

        // phosphor trail
        trail.current = trail.current.filter((p) => now - p.t < TRAIL_MS)
        for (const p of trail.current) {
          const age = (now - p.t) / TRAIL_MS
          const a = (1 - age) * 0.4
          const s = 7 * (1 - age) + 2
          ctx.fillStyle = GREEN(a)
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
        }
      }

      // cursor itself
      ctx.shadowColor = GREEN(0.9)
      ctx.shadowBlur = 8
      if (hovering.current) {
        // [ ] brackets
        const r = 11
        const len = 6
        ctx.strokeStyle = GREEN(0.95)
        ctx.lineWidth = 2
        ctx.beginPath()
        // left bracket
        ctx.moveTo(x - r, y - r + len)
        ctx.lineTo(x - r, y - r)
        ctx.lineTo(x - r + len, y - r)
        ctx.moveTo(x - r, y + r - len)
        ctx.lineTo(x - r, y + r)
        ctx.lineTo(x - r + len, y + r)
        // right bracket
        ctx.moveTo(x + r, y - r + len)
        ctx.lineTo(x + r, y - r)
        ctx.lineTo(x + r - len, y - r)
        ctx.moveTo(x + r, y + r - len)
        ctx.lineTo(x + r, y + r)
        ctx.lineTo(x + r - len, y + r)
        ctx.stroke()
      } else {
        // solid block
        const bw = down.current ? 7 : 9
        const bh = down.current ? 12 : 16
        ctx.fillStyle = GREEN(0.92)
        ctx.fillRect(x - bw / 2, y - bh / 2, bw, bh)
      }
      ctx.shadowBlur = 0

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerover", onOver)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      document.documentElement.classList.remove("hide-cursor")
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[88]" />
}

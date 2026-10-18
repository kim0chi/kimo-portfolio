"use client"

import { useEffect, useRef, useState } from "react"
import { useLiquidGlass } from "./use-liquid-glass"

// How quickly the lens catches up with the pointer (0..1 per frame); lower trails more.
const FOLLOW = 0.28
// What the lens grows over: anything you can click.
const INTERACTIVE = "a, button, [role='button'], summary, label, input, select, textarea"
// Only where a custom cursor is safe: a mouse, motion allowed, and no request for more contrast,
// so people who rely on a large or high-contrast system cursor keep theirs.
const ALLOWED = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none) and (prefers-contrast: no-preference)"

/**
 * A small glass lens that follows the pointer and bends the painting beneath it (Chromium; frosted
 * glass elsewhere). It grows over links and buttons and presses in on click. A dot in the centre
 * keeps it precise.
 */
export function GlassCursor() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(ALLOWED)
    const update = () => setAllowed(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  return allowed ? <Lens /> : null
}

function Lens() {
  const lensRef = useRef<HTMLDivElement>(null)
  // a gentle bend: the lens is small, so a strong one would smear what's under it
  useLiquidGlass(lensRef, { bend: 18, maxBezel: 14 })

  useEffect(() => {
    const lens = lensRef.current
    if (!lens) return
    const html = document.documentElement
    const position = { x: -100, y: -100, tx: -100, ty: -100 }
    let frame = 0

    const move = () => {
      position.x += (position.tx - position.x) * FOLLOW
      position.y += (position.ty - position.y) * FOLLOW
      lens.style.translate = `${position.x.toFixed(1)}px ${position.y.toFixed(1)}px`
      frame = Math.abs(position.tx - position.x) + Math.abs(position.ty - position.y) > 0.2 ? requestAnimationFrame(move) : 0
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      if (!lens.classList.contains("is-visible")) {
        // first sight: appear where the pointer is instead of sliding in from a corner
        position.x = event.clientX
        position.y = event.clientY
        lens.classList.add("is-visible")
      }
      position.tx = event.clientX
      position.ty = event.clientY
      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null
      lens.classList.toggle("is-over", Boolean(target))
      if (!frame) frame = requestAnimationFrame(move)
    }
    const onDown = () => lens.classList.add("is-pressed")
    const onUp = () => lens.classList.remove("is-pressed")
    const onLeave = () => lens.classList.remove("is-visible")

    html.classList.add("glass-cursor-on")
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerdown", onDown, { passive: true })
    window.addEventListener("pointerup", onUp, { passive: true })
    html.addEventListener("pointerleave", onLeave)
    return () => {
      cancelAnimationFrame(frame)
      html.classList.remove("glass-cursor-on")
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      html.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <div ref={lensRef} className="glass glass-cursor" data-glass="float" aria-hidden="true">
      <span className="glass-cursor-dot" />
    </div>
  )
}

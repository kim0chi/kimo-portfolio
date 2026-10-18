"use client"

import { useEffect } from "react"

// Panels past this point of the page sit in evening light and switch to dark pond glass.
const DUSK_FROM = 0.62
// How far (px) from a panel the cursor still lights it.
const LIGHT_REACH = 240
// The most (px) a photo drifts inside its frame; frames show the photo at 108%.
const PHOTO_DRIFT = 24
// How strongly photos drift relative to their distance from the middle of the screen.
const PHOTO_DEPTH = 0.05
// Easing of the cursor light toward the pointer; lower trails more.
const LIGHT_FOLLOW = 0.2
const BLOOM_MS = 600

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/**
 * One animation loop for everything the glass does with scroll and pointer:
 * - the sun (--sun) turns the rim light from morning (top-left) to evening (top-right),
 * - each [data-glass="panel"] is marked day or dusk by where it sits,
 * - the cursor is a light source every glass surface reflects,
 * - photos in [data-parallax] drift inside their frames,
 * - .reveal panels rise once when they first scroll into view.
 */
export function GlassScene() {
  useEffect(() => {
    const root = document.documentElement
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)")
    const live = new Set<HTMLElement>()
    const light = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, touch: false, bloomUntil: 0 }
    let frame = 0

    const scrollRange = () => root.scrollHeight - window.innerHeight
    const progress = () => {
      const range = scrollRange()
      return range > 0 ? clamp01(window.scrollY / range) : 0
    }

    const classify = () => {
      const range = scrollRange()
      document.querySelectorAll<HTMLElement>('[data-glass="panel"]').forEach((panel) => {
        const top = panel.getBoundingClientRect().top + window.scrollY
        // the scroll progress at which this panel is centred on screen
        const at = range > 0 ? clamp01((top + panel.offsetHeight / 2 - window.innerHeight / 2) / range) : 0
        panel.dataset.light = at > DUSK_FROM ? "dusk" : "day"
      })
    }

    /** Moves each visible panel's reflection; returns true while the light is still easing. */
    const reflect = () => {
      const follow = calm.matches ? 1 : LIGHT_FOLLOW
      light.x += (light.tx - light.x) * follow
      light.y += (light.ty - light.y) * follow
      const bloom = light.touch ? clamp01((light.bloomUntil - performance.now()) / BLOOM_MS) : 1
      // read every rectangle first, then write, so the browser lays out once
      const panels = [...live].map((panel) => [panel, panel.getBoundingClientRect()] as const)
      for (const [panel, rect] of panels) {
        const localX = light.x - rect.left
        const localY = light.y - rect.top
        const gap = Math.hypot(
          Math.max(rect.left - light.x, 0, light.x - rect.right),
          Math.max(rect.top - light.y, 0, light.y - rect.bottom),
        )
        const strength = Math.max(0, 1 - gap / LIGHT_REACH) * bloom
        const spec = panel.querySelector<HTMLElement>(":scope > .glass-light > .glass-spec")
        const rim = panel.querySelector<HTMLElement>(":scope > .glass-rim")
        if (spec) {
          spec.style.transform = `translate3d(${localX.toFixed(1)}px, ${localY.toFixed(1)}px, 0) translate(-50%, -50%)`
          spec.style.opacity = strength.toFixed(3)
        }
        if (rim) {
          const facing = Math.atan2(localY - rect.height / 2, localX - rect.width / 2)
          rim.style.setProperty("--facing", `${facing.toFixed(3)}rad`)
          rim.style.opacity = (strength * 0.9).toFixed(3)
        }
      }
      const easing = Math.abs(light.tx - light.x) + Math.abs(light.ty - light.y) > 0.5
      return easing || (light.touch && bloom > 0)
    }

    const parallax = () => {
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((photo) => {
        const frameRect = photo.parentElement?.getBoundingClientRect()
        if (!frameRect || frameRect.bottom < 0 || frameRect.top > window.innerHeight) return
        const fromCentre = frameRect.top + frameRect.height / 2 - window.innerHeight / 2
        const drift = Math.max(-PHOTO_DRIFT, Math.min(PHOTO_DRIFT, -fromCentre * PHOTO_DEPTH))
        photo.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0)`
      })
    }

    const tick = () => {
      frame = 0
      root.style.setProperty("--sun", `${135 + progress() * 90}deg`)
      if (!calm.matches) parallax()
      if (reflect()) request()
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      light.touch = false
      light.tx = event.clientX
      light.ty = event.clientY
      request()
    }
    // on touch the light blooms where the finger lands, then fades
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return
      light.touch = true
      light.tx = light.x = event.clientX
      light.ty = light.y = event.clientY
      light.bloomUntil = performance.now() + BLOOM_MS
      request()
    }
    const onPointerLeave = () => {
      light.tx = light.ty = -1e4
      request()
    }

    const watcher = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) live.add(entry.target as HTMLElement)
        else live.delete(entry.target as HTMLElement)
      }),
      { rootMargin: `${LIGHT_REACH}px` },
    )
    document.querySelectorAll<HTMLElement>(".glass").forEach((glass) => watcher.observe(glass))

    const revealer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add("in")
        revealer.unobserve(entry.target)
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )
    document.querySelectorAll(".reveal").forEach((panel) => revealer.observe(panel))
    // reveals only hide content once this script is running, so the page never depends on it
    root.classList.add("motion-ready")

    const resizeObserver = new ResizeObserver(() => {
      classify()
      request()
    })
    resizeObserver.observe(document.body)
    window.addEventListener("scroll", request, { passive: true })
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("pointerdown", onPointerDown, { passive: true })
    root.addEventListener("pointerleave", onPointerLeave)
    classify()
    request()

    return () => {
      cancelAnimationFrame(frame)
      watcher.disconnect()
      revealer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener("scroll", request)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerdown", onPointerDown)
      root.removeEventListener("pointerleave", onPointerLeave)
      root.classList.remove("motion-ready")
    }
  }, [])

  return null
}

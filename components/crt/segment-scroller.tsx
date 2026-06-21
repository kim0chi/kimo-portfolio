"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSound } from "@/lib/sound"
import { SegmentsContext, segmentNav, type SegMeta } from "@/lib/segments"
import { SegmentPager } from "@/components/crt/segment-pager"

const LOCK_MS = 620 // input lock during a transition
const JUMP_MS = 135 // when (into the flash) the masked jump happens

export function SegmentScroller({
  segments,
  children,
  className = "",
}: {
  segments: SegMeta[]
  children: React.ReactNode
  className?: string
}) {
  const { play } = useSound()
  const scRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [flashKey, setFlashKey] = useState(0)

  const idxRef = useRef(0)
  const lockedRef = useRef(false)
  const reducedRef = useRef(false)
  const elsRef = useRef<HTMLElement[]>([])
  const roRef = useRef<ResizeObserver | null>(null)

  const overflows = useCallback((i: number) => {
    const c = scRef.current
    const el = elsRef.current[i]
    if (!c || !el) return false
    return el.offsetHeight > c.clientHeight + 2
  }, [])

  const setOverflow = useCallback(
    (i: number) => {
      const c = scRef.current
      if (c) c.style.overflowY = overflows(i) ? "auto" : "hidden"
    },
    [overflows],
  )

  const navigate = useCallback(
    (target: number | string) => {
      const c = scRef.current
      const els = elsRef.current
      if (!c || !els.length) return
      const t = typeof target === "number" ? target : segments.findIndex((s) => s.id === target)
      const clamped = Math.max(0, Math.min(els.length - 1, t))
      if (clamped === idxRef.current || lockedRef.current) return

      idxRef.current = clamped
      setActive(clamped)
      try {
        history.replaceState(null, "", `#${segments[clamped].id}`)
      } catch {}

      // re-point the resize observer at the now-active segment
      roRef.current?.disconnect()
      if (roRef.current) roRef.current.observe(els[clamped])

      if (reducedRef.current) {
        c.scrollTo({ top: els[clamped].offsetTop, behavior: "auto" })
        setOverflow(clamped)
        return
      }

      lockedRef.current = true
      setFlashKey((k) => k + 1)
      play("toggle")
      // jump while the static fully covers the screen
      window.setTimeout(() => {
        c.style.overflowY = "hidden"
        c.scrollTo({ top: els[clamped].offsetTop, behavior: "auto" })
        setOverflow(clamped)
      }, JUMP_MS)
      window.setTimeout(() => {
        lockedRef.current = false
      }, LOCK_MS)
    },
    [segments, play, setOverflow],
  )

  // expose imperative nav for menu / terminal / pager
  useEffect(() => {
    segmentNav.go = navigate
    return () => {
      segmentNav.go = () => {}
    }
  }, [navigate])

  // wheel / touch interception (the hard lock)
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const c = scRef.current
    if (!c) return
    elsRef.current = Array.from(c.querySelectorAll<HTMLElement>("[data-segment]"))

    // Reduced motion: behave like a normal scrolling page (accessible fallback).
    if (reducedRef.current) {
      c.style.overflowY = "auto"
      let ticking = false
      const measure = () => {
        ticking = false
        const top = c.getBoundingClientRect().top
        const mid = c.clientHeight * 0.42
        let idx = 0
        elsRef.current.forEach((el, i) => {
          if (el.getBoundingClientRect().top - top <= mid + 1) idx = i
        })
        if (idx !== idxRef.current) {
          idxRef.current = idx
          setActive(idx)
        }
      }
      const onScroll = () => {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(measure)
        }
      }
      c.addEventListener("scroll", onScroll, { passive: true })
      return () => c.removeEventListener("scroll", onScroll)
    }

    // Hard full-page lock.
    setOverflow(0)
    roRef.current = new ResizeObserver(() => setOverflow(idxRef.current))
    roRef.current.observe(elsRef.current[0])

    const atEdge = (dir: number) => {
      const i = idxRef.current
      const el = elsRef.current[i]
      if (!el || c.style.overflowY !== "auto") return true
      const top = el.offsetTop
      const bottom = top + el.offsetHeight
      if (dir > 0) return c.scrollTop + c.clientHeight >= bottom - 1
      return c.scrollTop <= top + 1
    }

    // Let nested scroll regions (terminal log, expanded modules) consume the gesture.
    const innerScrollable = (node: EventTarget | null, dir: number) => {
      let el = node as HTMLElement | null
      while (el && el !== c) {
        if (el.scrollHeight > el.clientHeight) {
          const oy = getComputedStyle(el).overflowY
          if (oy === "auto" || oy === "scroll") {
            const atTop = el.scrollTop <= 0
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
            if (dir > 0 && !atBottom) return true
            if (dir < 0 && !atTop) return true
          }
        }
        el = el.parentElement
      }
      return false
    }

    const onWheel = (e: WheelEvent) => {
      if (lockedRef.current) {
        e.preventDefault()
        return
      }
      if (Math.abs(e.deltaY) < 6) return
      const dir = e.deltaY > 0 ? 1 : -1
      if (innerScrollable(e.target, dir)) return // nested region scrolls itself
      if (!atEdge(dir)) return // tall segment scrolls internally
      e.preventDefault()
      navigate(idxRef.current + dir)
    }

    let startY = 0
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (lockedRef.current) {
        e.preventDefault()
        return
      }
      const dy = e.touches[0].clientY - startY
      const dir = dy < 0 ? 1 : -1
      if (innerScrollable(e.target, dir)) return
      if (!atEdge(dir)) return
      e.preventDefault()
      if (Math.abs(dy) > 44) {
        navigate(idxRef.current + dir)
        startY = e.touches[0].clientY
      }
    }

    c.addEventListener("wheel", onWheel, { passive: false })
    c.addEventListener("touchstart", onTouchStart, { passive: true })
    c.addEventListener("touchmove", onTouchMove, { passive: false })
    return () => {
      c.removeEventListener("wheel", onWheel)
      c.removeEventListener("touchstart", onTouchStart)
      c.removeEventListener("touchmove", onTouchMove)
      roRef.current?.disconnect()
    }
  }, [navigate, setOverflow])

  // keyboard nav (defers to the command menu when it is open)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return
      if (document.documentElement.hasAttribute("data-menu-open")) return
      let next = idxRef.current
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          next++
          break
        case "ArrowUp":
        case "PageUp":
          next--
          break
        case "Home":
          next = 0
          break
        case "End":
          next = segments.length - 1
          break
        default:
          return
      }
      e.preventDefault()
      navigate(next)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [segments, navigate])

  // deep-link on load
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id && segments.some((s) => s.id === id)) {
      const t = window.setTimeout(() => segmentNav.go(id), 80)
      return () => window.clearTimeout(t)
    }
  }, [segments])

  return (
    <SegmentsContext.Provider value={{ active, count: segments.length, segments, goTo: navigate }}>
      <div ref={scRef} className={`segment-scroller relative h-[100svh] overflow-x-hidden ${className}`}>
        {children}
      </div>
      <div key={flashKey} className={`channel-flash ${flashKey > 0 ? "on" : ""}`} aria-hidden />
      <SegmentPager />
    </SegmentsContext.Provider>
  )
}

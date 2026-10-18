"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import { paintingImage, paintingIndex, paintings } from "@/lib/paintings"
import { currentPainting, subscribePainting } from "./painting-store"
import { startPond, type PondQuality, type PondRenderer } from "./pond-renderer"
import { SURFACE_REVEAL_MS, surfaceReveal } from "./surface-reveal"

// sessionStorage key: the intro plays once per visit (read by the inline script in app/layout.tsx)
export const INTRO_PLAYED_KEY = "intro-played"
// dispatched by the footer's "Replay intro" link
export const REPLAY_INTRO_EVENT = "pond:replay-intro"
// The intro waits at most this long after navigation for the painting it lands on, then the page just opens.
const INTRO_BUDGET_MS = 2500
const INTRO_CLASSES = ["intro-pending", "intro-on", "intro-title", "intro-condense"]

type DeviceHints = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }

// Start lower on devices that say they're modest; the renderer also adapts to how frames actually go.
// "still" devices get the still painting and solid glass, with no canvas and no intro.
function deviceTier(): "full" | "low" | "still" {
  const { deviceMemory = 8, hardwareConcurrency = 8 } = navigator as DeviceHints
  if (deviceMemory <= 2 || hardwareConcurrency <= 2) return "still"
  if (deviceMemory <= 4 || hardwareConcurrency <= 4) return "low"
  return "full"
}
const QUALITY: Record<"full" | "low", PondQuality> = {
  full: { scale: 1, octaves: 5, fps: 30 },
  low: { scale: 0.7, octaves: 3, fps: 24 },
}
// a skipped intro still surfaces the name, just quicker
const SKIPPED_REVEAL_MS = 500

// one request per image, shared by everything that asks for it
const imageRequests = new Map<string, Promise<HTMLImageElement>>()
function loadImage(src: string) {
  let request = imageRequests.get(src)
  if (!request) {
    const image = new Image()
    image.decoding = "async"
    image.src = src
    request = image.decode().then(() => image)
    request.catch(() => imageRequests.delete(src))
    imageRequests.set(src, request)
  }
  return request
}

/**
 * The moving, dithered painting behind the page. The pre-dithered still (a CSS background keyed on
 * <html data-painting>) paints first and is all that reduced-motion, Save-Data and no-WebGL2
 * visitors see; the canvas fades in over it. On a visitor's first page view this also plays
 * the intro: <html class="intro-pending"> is set before first paint, and the page waits in
 * morning haze (with the name faintly visible) until the paintings are ready.
 */
export function PondBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<PondRenderer | null>(null)
  const [live, setLive] = useState(false)
  const [paused, setPaused] = useState(false)
  const [introRunning, setIntroRunning] = useState(false)
  const [caption, setCaption] = useState<string | null>(null)
  const skippedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const html = document.documentElement
    const endIntro = () => html.classList.remove(...INTRO_CLASSES)
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const saveData = (navigator as DeviceHints).connection?.saveData
    const tier = deviceTier()
    if (tier === "still") html.classList.add("glass-lite")
    if (reducedMotion || saveData || tier === "still") {
      endIntro()
      return
    }

    let cancelled = false
    let renderer: PondRenderer | null = null
    const uploaded = new Set<number>() // paintings already on the GPU

    // 720 px is all the dither needs: one cell is two screen pixels, and the source is softened anyway
    const upload = async (index: number) => {
      if (uploaded.has(index)) return
      const image = await loadImage(paintingImage(paintings[index].slug))
      if (cancelled || !renderer || uploaded.has(index)) return
      renderer.setImage(index, image)
      uploaded.add(index)
    }
    // the turning room shows every painting
    const uploadAll = () => Promise.all(paintings.map((_, index) => upload(index)))

    // once per visit: the intro's chance is used up whether it plays or the paintings were too slow
    const markPlayed = () => {
      try {
        sessionStorage.setItem(INTRO_PLAYED_KEY, "1")
      } catch {
        // storage blocked: it may play again on reload, which is harmless
      }
    }

    const playIntro = () => {
      if (!renderer) return
      markPlayed()
      html.classList.remove("intro-pending")
      // intro-done stays after the intro, so the lighter page-opening animation doesn't run as well
      html.classList.add("intro-on", "intro-condense", "intro-done")
      setIntroRunning(true)
      // the rings spread from the name, and the name surfaces through them
      const content = document.querySelector<HTMLElement>(".hero-content")
      const name = document.querySelector(".hero-name")?.getBoundingClientRect()
      const origin: [number, number] = name
        ? [(name.left + name.width / 2) / window.innerWidth, (name.top + name.height / 2) / window.innerHeight]
        : [0.3, 0.45]
      renderer.playIntro({
        onCaption: (index) => setCaption(index === null ? null : `${paintings[index].title}, ${paintings[index].date}`),
        onTitle: () => {
          html.classList.add("intro-title")
          if (content) surfaceReveal(content, skippedRef.current ? SKIPPED_REVEAL_MS : SURFACE_REVEAL_MS)
        },
        onCondense: () => html.classList.remove("intro-condense"),
        onDone: () => {
          endIntro()
          setCaption(null)
          setIntroRunning(false)
        },
      }, origin)
    }

    const start = async (withIntro: boolean) => {
      const current = paintingIndex(currentPainting())
      // start downloading before the GPU work so the two overlap
      void loadImage(paintingImage(paintings[current].slug)).catch(() => undefined)
      if (withIntro) paintings.forEach((painting) => void loadImage(paintingImage(painting.slug)).catch(() => undefined))
      renderer = startPond(canvas, {
        current,
        quality: QUALITY[tier],
        // still slow at the lowest resolution: stop the glass blurring the moving painting
        onStruggle: () => html.classList.add("glass-lite"),
        onFirstFrame: () => setLive(true),
        onContextLost: () => {
          setLive(false)
          endIntro()
        },
      })
      rendererRef.current = renderer
      if (!renderer) {
        // no WebGL2: the still painting is the background, and there's no intro to wait for on reload
        if (withIntro) markPlayed()
        endIntro()
        return
      }
      if (!withIntro) {
        await upload(current)
        return
      }
      const budget = new Promise<false>((resolve) =>
        window.setTimeout(() => resolve(false), Math.max(0, INTRO_BUDGET_MS - performance.now())),
      )
      // the intro only waits for the painting it lands on; the others stream in while the room turns
      // (it starts on them blurred, so one arriving a moment late isn't noticeable)
      void uploadAll().catch(() => undefined)
      const ready = await Promise.race([upload(current).then(() => true), budget]).catch(() => false)
      if (cancelled) return
      if (ready) playIntro()
      else {
        markPlayed()
        endIntro()
      }
    }

    const onPaintingChange = () => {
      const index = paintingIndex(currentPainting())
      void (async () => {
        await upload(index)
        renderer?.showPainting(index)
      })()
    }
    const onReplay = async () => {
      if (!renderer) return
      window.scrollTo({ top: 0, behavior: "instant" })
      html.classList.add("intro-pending")
      await uploadAll().catch(() => undefined)
      if (!cancelled) playIntro()
    }
    const unsubscribe = subscribePainting(onPaintingChange)
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay)

    // with the intro, start at once; otherwise once the page has settled, so the canvas never competes with first paint
    let idle = 0
    const hasIdle = "requestIdleCallback" in window
    if (html.classList.contains("intro-pending")) void start(true)
    else idle = hasIdle ? window.requestIdleCallback(() => void start(false), { timeout: 2000 }) : window.setTimeout(() => void start(false), 600)

    return () => {
      cancelled = true
      if (hasIdle) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      unsubscribe()
      window.removeEventListener(REPLAY_INTRO_EVENT, onReplay)
      renderer?.stop()
      rendererRef.current = null
      endIntro()
      setLive(false)
      setIntroRunning(false)
    }
  }, [])

  // any click, key, scroll or touch skips the intro (it finishes in a fraction of a second)
  useEffect(() => {
    if (!introRunning) return
    skippedRef.current = false
    const skip = () => {
      skippedRef.current = true
      rendererRef.current?.skipIntro()
    }
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const
    events.forEach((name) => window.addEventListener(name, skip, { passive: true }))
    return () => events.forEach((name) => window.removeEventListener(name, skip))
  }, [introRunning])

  const togglePaused = () => {
    const next = !paused
    setPaused(next)
    rendererRef.current?.setPaused(next)
  }

  return (
    <>
      <div className="pond" aria-hidden="true">
        <div className="pond-still" />
        <canvas ref={canvasRef} className={"pond-canvas" + (live ? " pond-canvas-live" : "")} />
        {/* morning haze that clears as the page opens (CSS only, so it runs from first paint) */}
        <div className="pond-haze" />
      </div>
      {introRunning && (
        <button
          type="button"
          className="intro-skip"
          onClick={() => {
            skippedRef.current = true
            rendererRef.current?.skipIntro()
          }}
        >
          Skip intro
        </button>
      )}
      {caption && <p className="intro-caption" aria-hidden="true">{caption}</p>}
      {live && !introRunning && (
        <button type="button" className="pond-toggle" onClick={togglePaused}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          <span className="pond-toggle-label">{paused ? "Play background" : "Pause background"}</span>
        </button>
      )}
    </>
  )
}

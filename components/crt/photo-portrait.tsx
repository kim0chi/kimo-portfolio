"use client"

import { useEffect, useRef, useState } from "react"
import { profile } from "@/lib/content"

// The real headshot, phosphor-keyed, with cursor parallax tilt + occasional glitch.
export function PhotoPortrait({ className = "" }: { className?: string }) {
  const imgRef = useRef<HTMLImageElement>(null)
  const raf = useRef<number | null>(null)
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const onMove = (e: PointerEvent) => {
      if (raf.current) return
      raf.current = requestAnimationFrame(() => {
        raf.current = null
        const img = imgRef.current
        if (!img) return
        const r = img.getBoundingClientRect()
        const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)))
        const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)))
        img.style.transform = `perspective(800px) rotateX(${-ny * 6}deg) rotateY(${nx * 6}deg)`
      })
    }
    window.addEventListener("pointermove", onMove)
    return () => {
      window.removeEventListener("pointermove", onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let t: number
    const loop = () => {
      t = window.setTimeout(() => {
        setGlitch(true)
        window.setTimeout(() => setGlitch(false), 220)
        loop()
      }, 4500 + Math.random() * 5000)
    }
    loop()
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/portrait-web.webp"
        alt={profile.name}
        width={560}
        height={699}
        className={`crt-photo block h-auto w-full transition-[filter] duration-150 ${glitch ? "img-glitch" : ""}`}
        style={{ willChange: "transform" }}
        draggable={false}
      />
      <div className="crt-portrait-scan pointer-events-none absolute inset-0" aria-hidden />
    </div>
  )
}

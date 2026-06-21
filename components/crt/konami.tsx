"use client"

import { useEffect, useRef, useState } from "react"
import { useSound } from "@/lib/sound"

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
]

export function Konami() {
  const { play } = useSound()
  const [amber, setAmber] = useState(false)
  const [toast, setToast] = useState(false)
  const buf = useRef<string[]>([])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      buf.current = [...buf.current, key].slice(-CODE.length)
      if (CODE.every((k, i) => buf.current[i] === k)) {
        buf.current = []
        setAmber((a) => {
          const next = !a
          document.documentElement.classList.toggle("amber", next)
          return next
        })
        setToast(true)
        play("boot")
        window.setTimeout(() => setToast(false), 2600)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [play])

  if (!toast) return null
  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[80] border border-primary bg-background px-4 py-2 text-sm text-primary text-glow box-glow font-display tracking-widest animate-pulse">
      ▓▓ {amber ? "AMBER PHOSPHOR ENGAGED" : "GREEN PHOSPHOR RESTORED"} ▓▓
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Monitor, MonitorOff, Volume2, VolumeX } from "lucide-react"
import { useCrt } from "@/lib/crt"
import { useSound } from "@/lib/sound"

function Clock() {
  const [now, setNow] = useState<string>("--:--:--")
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setNow(d.toLocaleTimeString("en-GB", { hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums">{now}</span>
}

export function SystemBar() {
  const { crtOn, toggleCrt } = useCrt()
  const { muted, toggleMuted, play } = useSound()

  return (
    <div className="fixed top-0 inset-x-0 z-[70] h-8 flex items-center justify-between gap-4 px-3 sm:px-4 border-b border-border bg-background/85 backdrop-blur-sm text-[11px] sm:text-xs text-muted-foreground select-none">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-primary text-glow font-display tracking-wider">ILLUSTRISIMO_OS</span>
        <span className="hidden sm:inline opacity-60">v2.0</span>
        <span className="hidden md:inline opacity-60 truncate">// full-stack dev / ai engineer</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <span className="hidden sm:inline opacity-70">
          <Clock />
        </span>

        <button
          type="button"
          onMouseEnter={() => play("hover")}
          onClick={() => {
            play("toggle")
            toggleMuted()
          }}
          aria-pressed={!muted}
          aria-label={muted ? "Unmute interface sounds" : "Mute interface sounds"}
          className="snap flex items-center gap-1 px-1.5 py-0.5 border border-border hover:border-primary hover:text-primary"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{muted ? "SFX OFF" : "SFX ON"}</span>
        </button>

        <button
          type="button"
          onMouseEnter={() => play("hover")}
          onClick={() => {
            play("toggle")
            toggleCrt()
          }}
          aria-pressed={crtOn}
          aria-label={crtOn ? "Disable CRT effects" : "Enable CRT effects"}
          className="snap flex items-center gap-1 px-1.5 py-0.5 border border-border hover:border-primary hover:text-primary"
        >
          {crtOn ? <Monitor className="h-3.5 w-3.5" /> : <MonitorOff className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{crtOn ? "CRT ON" : "CRT OFF"}</span>
        </button>
      </div>
    </div>
  )
}

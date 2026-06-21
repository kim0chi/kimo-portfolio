"use client"

import { useSegments } from "@/lib/segments"
import { useSound } from "@/lib/sound"

export function SegmentPager() {
  const { active, count, segments, goTo } = useSegments()
  const { play } = useSound()
  if (!count) return null

  return (
    <div className="fixed right-3 top-1/2 z-[72] hidden -translate-y-1/2 flex-col items-end gap-2 sm:flex">
      <div className="font-display text-[10px] tabular-nums text-primary text-glow">
        CH {String(active + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
      </div>
      {segments.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onMouseEnter={() => play("hover")}
          onClick={() => {
            play("select")
            goTo(i)
          }}
          aria-label={`Go to ${s.label}`}
          aria-current={i === active}
          className="group flex items-center gap-2"
        >
          <span
            className={`text-[9px] uppercase tracking-wider transition-opacity ${
              i === active ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-60"
            }`}
          >
            {s.label}
          </span>
          <span
            className={`snap h-2.5 w-2.5 border ${
              i === active ? "border-primary bg-primary box-glow" : "border-border group-hover:border-primary"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

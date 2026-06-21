"use client"

import { useCallback, useEffect, useState } from "react"
import { Briefcase, FolderGit2, GraduationCap, Cpu, Terminal, X } from "lucide-react"
import { useSound } from "@/lib/sound"
import { segmentNav } from "@/lib/segments"

type Item = { id: string; label: string; Icon: typeof Terminal }

const ITEMS: Item[] = [
  { id: "profile", label: "PROFILE", Icon: Terminal },
  { id: "experience", label: "EXPERIENCE", Icon: Briefcase },
  { id: "education", label: "EDUCATION", Icon: GraduationCap },
  { id: "skills", label: "SKILLS", Icon: Cpu },
  { id: "projects", label: "PROJECTS", Icon: FolderGit2 },
]

function scrollToId(id: string) {
  segmentNav.go(id)
}

export function CommandMenu() {
  const { play } = useSound()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const select = useCallback(
    (index: number) => {
      const item = ITEMS[index]
      if (!item) return
      play("select")
      scrollToId(item.id)
      setOpen(false)
    },
    [play],
  )

  // Let segment keyboard nav know when the menu owns the arrow keys.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-menu-open", open)
    return () => document.documentElement.removeAttribute("data-menu-open")
  }, [open])

  // Global keyboard: M toggles menu, arrows navigate, enter selects, esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      if (e.key === "m" || e.key === "M") {
        e.preventDefault()
        setOpen((o) => {
          play(o ? "back" : "toggle")
          return !o
        })
        return
      }
      if (!open) return
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault()
        setActive((a) => {
          play("hover")
          return (a + 1) % ITEMS.length
        })
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault()
        setActive((a) => {
          play("hover")
          return (a - 1 + ITEMS.length) % ITEMS.length
        })
      } else if (e.key === "Enter") {
        e.preventDefault()
        select(active)
      } else if (e.key === "Escape") {
        e.preventDefault()
        play("back")
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, active, select, play])

  return (
    <>
      {/* launcher */}
      <button
        type="button"
        onMouseEnter={() => play("hover")}
        onClick={() => {
          play(open ? "back" : "toggle")
          setOpen((o) => !o)
        }}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-[75] snap flex items-center gap-2 border border-primary bg-background/90 px-3 py-2 text-xs text-primary text-glow box-glow hover:bg-primary hover:text-primary-foreground"
      >
        {open ? <X className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
        <span className="font-display tracking-wider">{open ? "CLOSE" : "MENU"}</span>
        <kbd className="hidden sm:inline border border-current px-1 text-[10px] opacity-70">M</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[74] bg-background/70 backdrop-blur-sm"
          onClick={() => {
            play("back")
            setOpen(false)
          }}
        >
          <div
            className="absolute bottom-20 right-4 w-64 border border-primary bg-background box-glow"
            onClick={(e) => e.stopPropagation()}
            role="menu"
          >
            <div className="border-b border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              <span className="text-primary">&gt;</span> select module
            </div>
            <ul>
              {ITEMS.map((item, i) => {
                const Icon = item.Icon
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="menuitem"
                      data-active={i === active}
                      onMouseEnter={() => {
                        setActive(i)
                        play("hover")
                      }}
                      onClick={() => select(i)}
                      className="menu-item flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm"
                    >
                      <span className="w-4 text-center opacity-70">{i === active ? "▶" : ""}</span>
                      <Icon className="h-4 w-4" />
                      <span className="font-display tracking-wider">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
              ↑↓ move · ⏎ select · esc close
            </div>
          </div>
        </div>
      )}
    </>
  )
}

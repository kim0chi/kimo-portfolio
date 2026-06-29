"use client"

import { useEffect, useRef, useState } from "react"
import { profile, projects } from "@/lib/content"
import { useSound } from "@/lib/sound"
import { segmentNav } from "@/lib/segments"

type Line = { kind: "in" | "out" | "err" | "ok"; text: string }

const PROMPT = "visitor@illustrisimo-os:~$"

const HELP: string[] = [
  "AVAILABLE COMMANDS:",
  "  help        list commands",
  "  whoami      who is this guy",
  "  ls          list project modules",
  "  open <name> jump to a project (e.g. open manifesto)",
  "  skills      jump to skills readout",
  "  experience  jump to experience log",
  "  contact     show contact channels",
  "  resume      download CV",
  "  sudo hire-me   ▒ do the thing ▒",
  "  clear       wipe the screen",
]

const BANNER: Line[] = [
  { kind: "ok", text: `${profile.name} // ${profile.title}` },
  { kind: "out", text: `type 'help' for commands · 'sudo hire-me' if you like what you see` },
]

function scrollTo(id: string) {
  segmentNav.go(id)
}

export function HeroTerminal() {
  const { play } = useSound()
  const [lines, setLines] = useState<Line[]>(BANNER)
  const [value, setValue] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [hIndex, setHIndex] = useState(-1)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [lines])

  const print = (out: Line[]) => setLines((prev) => [...prev, ...out])

  const run = (raw: string) => {
    const cmd = raw.trim()
    print([{ kind: "in", text: `${PROMPT} ${cmd}` }])
    if (!cmd) return
    setHistory((h) => [cmd, ...h])
    const [name, ...args] = cmd.toLowerCase().split(/\s+/)
    const arg = args.join(" ")

    switch (name) {
      case "help":
      case "?":
        print(HELP.map((t) => ({ kind: "out", text: t })))
        break
      case "whoami":
        print([
          { kind: "ok", text: profile.name },
          { kind: "out", text: profile.title },
          { kind: "out", text: `"${profile.tagline}"` },
          { kind: "out", text: `📍 ${profile.location} · ${profile.status}` },
        ])
        break
      case "ls":
      case "dir":
        print([
          { kind: "out", text: `${projects.length} modules:` },
          ...projects.map((p) => ({ kind: "out" as const, text: `  ${p.id.padEnd(18)} ${p.tagline}` })),
        ])
        break
      case "open":
      case "cat": {
        const proj = projects.find((p) => p.id === arg || p.title.toLowerCase() === arg)
        if (proj) {
          play("select")
          print([{ kind: "ok", text: `opening ${proj.title}...` }])
          scrollTo("projects")
        } else {
          print([{ kind: "err", text: `open: '${arg || "?"}' not found. try 'ls'` }])
          play("error")
        }
        break
      }
      case "skills":
        print([{ kind: "ok", text: "loading skills readout..." }])
        scrollTo("skills")
        break
      case "achievements":
      case "awards":
        print([{ kind: "ok", text: "loading achievements.log..." }])
        scrollTo("achievements")
        break
      case "experience":
      case "work":
        print([{ kind: "ok", text: "loading experience.log..." }])
        scrollTo("experience")
        break
      case "education":
      case "edu":
        print([{ kind: "ok", text: "loading education.log..." }])
        scrollTo("education")
        break
      case "contact":
      case "email":
        print([
          { kind: "out", text: `email:    ${profile.email}` },
          { kind: "out", text: `github:   ${profile.links.github}` },
          { kind: "out", text: `linkedin: ${profile.links.linkedin}` },
        ])
        break
      case "resume":
      case "cv": {
        print([{ kind: "ok", text: "downloading CV..." }])
        const a = document.createElement("a")
        a.href = profile.resume
        a.download = "Benedict_Illustrisimo_CV.pdf"
        a.click()
        break
      }
      case "sudo":
        if (arg === "hire-me" || arg === "hire me") {
          play("select")
          print([
            { kind: "ok", text: "[sudo] access granted ▓▓▓▓▓▓▓▓▓▓ 100%" },
            { kind: "ok", text: "excellent choice. opening mail client..." },
          ])
          window.setTimeout(() => {
            window.location.href = `mailto:${profile.email}?subject=Let's work together`
          }, 600)
        } else {
          print([{ kind: "err", text: "sudo: permission denied (nice try)" }])
          play("error")
        }
        break
      case "clear":
      case "cls":
        setLines([])
        return
      case "rm":
        print([{ kind: "err", text: "rm: nope. this portfolio is load-bearing." }])
        play("error")
        break
      case "exit":
        print([{ kind: "out", text: "there is no escape. enjoy your stay." }])
        break
      default:
        print([{ kind: "err", text: `command not found: ${name} — type 'help'` }])
        play("error")
    }
  }

  return (
    <div
      className="border border-border bg-background/60 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="border-b border-border px-3 py-1 text-[11px] text-muted-foreground flex items-center justify-between">
        <span className="text-primary text-glow">// interactive shell</span>
        <span className="opacity-60">try: help</span>
      </div>
      <div ref={logRef} className="px-3 py-2 max-h-40 overflow-y-auto text-xs sm:text-sm leading-relaxed">
        {lines.map((l, i) => (
          <p
            key={i}
            className={
              l.kind === "in"
                ? "text-foreground"
                : l.kind === "err"
                  ? "text-alarm"
                  : l.kind === "ok"
                    ? "text-primary text-glow"
                    : "text-muted-foreground"
            }
          >
            <span className="whitespace-pre-wrap break-words">{l.text}</span>
          </p>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-primary text-glow shrink-0">{PROMPT}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                run(value)
                setValue("")
                setHIndex(-1)
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setHIndex((idx) => {
                  const next = Math.min(history.length - 1, idx + 1)
                  if (history[next] !== undefined) setValue(history[next])
                  return next
                })
              } else if (e.key === "ArrowDown") {
                e.preventDefault()
                setHIndex((idx) => {
                  const next = Math.max(-1, idx - 1)
                  setValue(next === -1 ? "" : history[next] ?? "")
                  return next
                })
              } else if (e.key.length === 1) {
                play("type")
              }
            }}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command input"
            className="flex-1 min-w-0 bg-transparent outline-none text-foreground caret-primary"
          />
        </div>
      </div>
    </div>
  )
}

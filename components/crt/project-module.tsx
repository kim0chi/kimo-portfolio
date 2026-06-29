"use client"

import { useState } from "react"
import { ExternalLink, Github, Trophy, ChevronRight } from "lucide-react"
import type { Project } from "@/lib/content"
import { useSound } from "@/lib/sound"

export function ProjectModule({ project, index }: { project: Project; index: number }) {
  const { play } = useSound()
  const [state, setState] = useState<"closed" | "loading" | "open">("closed")
  const id = String(index + 1).padStart(2, "0")

  const toggle = () => {
    if (state === "open") {
      play("back")
      setState("closed")
      return
    }
    if (state === "loading") return
    play("select")
    setState("loading")
    window.setTimeout(() => setState("open"), 520)
  }

  const open = state === "open"

  return (
    <div
      className={`group border bg-background/40 ${
        project.featured ? "border-primary/60 box-glow" : "border-border"
      } ${open ? "box-glow" : ""}`}
    >
      <button
        type="button"
        onMouseEnter={() => play("hover")}
        onClick={toggle}
        aria-expanded={open}
        className="snap w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-primary/10"
      >
        {/* CRT thumbnail */}
        <span className="relative h-12 w-12 shrink-0 overflow-hidden border border-border bg-background">
          {project.image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt=""
                aria-hidden
                className="crt-photo h-full w-full object-contain p-0.5"
                draggable={false}
              />
              <span className="crt-portrait-scan pointer-events-none absolute inset-0" aria-hidden />
            </>
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-primary/80 text-glow">
              {id}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-primary/60 text-glow text-xs">[{id}]</span>
            <span className="font-display text-base sm:text-lg text-foreground text-glow">{project.title}</span>
            {project.award && (
              <span className="inline-flex items-center gap-1 border border-warning text-warning text-[10px] px-1.5 py-0.5">
                <Trophy className="h-3 w-3" /> WINNER
              </span>
            )}
            {project.status === "production" && (
              <span className="inline-flex items-center gap-1 border border-primary text-primary text-glow text-[10px] px-1.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> IN PRODUCTION
              </span>
            )}
          </span>
          <span className="block text-xs text-muted-foreground mt-0.5">{project.tagline}</span>
        </span>
        <ChevronRight
          className={`h-4 w-4 mt-1 shrink-0 text-muted-foreground transition-transform duration-150 ${
            open ? "rotate-90 text-primary" : "group-hover:translate-x-0.5"
          }`}
        />
      </button>

      {state === "loading" && (
        <div className="px-4 pb-3 -mt-1">
          <div className="font-mono text-[11px] text-primary text-glow">
            LOADING {project.title.toUpperCase()}...
          </div>
          <div className="mt-1 h-1.5 w-full bg-border overflow-hidden">
            <div className="h-full bg-primary box-glow load-bar" />
          </div>
        </div>
      )}

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border/60 crt-poweron origin-top">
          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>

          {project.award && (
            <p className="mt-2 text-xs text-warning inline-flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" /> {project.award}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span key={t} className="border border-border text-[11px] px-1.5 py-0.5 text-muted-foreground">
                {t}
              </span>
            ))}
          </div>

          {(project.liveUrl || project.githubUrl) && (
            <div className="mt-4 flex gap-2">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => play("hover")}
                  onClick={() => play("select")}
                  className="snap inline-flex items-center gap-1.5 border border-primary px-2.5 py-1.5 text-xs text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> RUN LIVE
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => play("hover")}
                  onClick={() => play("select")}
                  className="snap inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs hover:border-primary hover:text-primary"
                >
                  <Github className="h-3.5 w-3.5" /> SOURCE
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

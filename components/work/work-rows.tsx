"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import { createPortal } from "react-dom"
import type { Project } from "@/lib/content"
import { GlassPanel } from "@/components/glass/glass-panel"
import { TechList } from "@/components/tech/tech-list"

// The preview floats this far above the hovered row, so it never covers the row you're reading.
const PREVIEW_LIFT = 120
const PREVIEW_FOLLOW = 0.16
// The card's centre never goes higher than this (px), so it stays clear of the sticky nav.
const PREVIEW_MIN_TOP = 190

/** Project rows; with a mouse, a small glass card with the project's image floats above the hovered row. */
export function WorkRows({ projects }: { projects: Project[] }) {
  const previewRef = useRef<HTMLDivElement>(null)
  const position = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const frame = useRef(0)
  const [active, setActive] = useState<Project | null>(null)
  // keeps the last project on the card while it fades out
  const [shown, setShown] = useState<Project | null>(null)
  // the card renders into <body>: inside the work panel, the panel's glass would become its
  // containing block (breaking position: fixed) and its backdrop (hiding the painting)
  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => setPortalReady(true), [])

  useEffect(() => {
    const preview = previewRef.current
    if (!active || !preview) return
    const follow = () => {
      const p = position.current
      p.x += (p.tx - p.x) * PREVIEW_FOLLOW
      p.y += (p.ty - p.y) * PREVIEW_FOLLOW
      preview.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%)`
      frame.current = requestAnimationFrame(follow)
    }
    frame.current = requestAnimationFrame(follow)
    return () => cancelAnimationFrame(frame.current)
  }, [active])

  const aim = (event: PointerEvent<HTMLAnchorElement>) => {
    const row = event.currentTarget.getBoundingClientRect()
    position.current.tx = event.clientX
    // float above the row; near the top of the screen (under the nav) drop below it instead
    const above = row.top - PREVIEW_LIFT
    position.current.ty = above < PREVIEW_MIN_TOP ? row.bottom + PREVIEW_LIFT : above
  }

  const enter = (event: PointerEvent<HTMLAnchorElement>, project: Project) => {
    if (event.pointerType !== "mouse") return
    aim(event)
    if (!active) {
      // first hover: start the card where it's aimed instead of sliding in from the corner
      position.current.x = position.current.tx
      position.current.y = position.current.ty
      previewRef.current?.style.setProperty("transform", `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`)
    }
    // match the glass of the panel the list sits in (day or dusk)
    const panel = event.currentTarget.closest<HTMLElement>("[data-light]")
    if (previewRef.current) previewRef.current.dataset.light = panel?.dataset.light ?? "day"
    setActive(project)
    setShown(project)
  }

  return (
    <>
      <ul className="work-rows">
        {projects.map((project) => {
          const destination = project.liveUrl || project.githubUrl
          const body = <RowBody project={project} linked={Boolean(destination)} />
          return (
            <li key={project.id}>
              {destination ? (
                <a
                  href={destination}
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerEnter={(event) => enter(event, project)}
                  onPointerMove={aim}
                  onPointerLeave={() => setActive(null)}
                >
                  {body}
                </a>
              ) : (
                // a project without a public link is a plain row: nothing to visit
                <div className="work-row">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
      {portalReady && createPortal(
        <GlassPanel as="div" kind="float" ref={previewRef} className={"work-preview" + (active ? " is-on" : "")} aria-hidden="true">
          <div className="work-preview-art">
            {shown?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shown.image} alt="" />
            ) : (
              <span>{shown?.title}</span>
            )}
          </div>
        </GlassPanel>,
        document.body,
      )}
    </>
  )
}

function RowBody({ project, linked }: { project: Project; linked: boolean }) {
  const action = linked ? (project.liveUrl ? "Visit →" : "Code →") : project.status === "self-hosted" ? "Private" : ""
  return (
    <>
      <h3>{project.title}</h3>
      <div>
        <p>{project.tagline}</p>
        <TechList items={project.tech.slice(0, 5)} className="work-stack" />
      </div>
      <span className="work-go">{action}</span>
    </>
  )
}

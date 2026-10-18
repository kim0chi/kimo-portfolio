"use client"

import { GlassPanel } from "@/components/glass/glass-panel"
import { paintingThumb, paintings } from "@/lib/paintings"
import { choosePainting, usePainting } from "./painting-store"

/** A small glass pill: one round swatch per painting, and the current painting's title. */
export function PaintingSwitcher() {
  const current = usePainting()
  const painting = paintings.find((candidate) => candidate.slug === current) ?? paintings[0]

  return (
    <GlassPanel as="nav" kind="float" className="painting-switcher" aria-label="Background painting">
      <ul className="switcher-swatches">
        {paintings.map((candidate) => (
          <li key={candidate.slug}>
            <button
              type="button"
              aria-pressed={candidate.slug === current}
              aria-label={`Show ${candidate.title}, ${candidate.date}`}
              onClick={() => choosePainting(candidate.slug)}
              style={{ backgroundImage: `url(${paintingThumb(candidate.slug)})` }}
            />
          </li>
        ))}
      </ul>
      <p className="switcher-title" aria-live="polite">
        {painting.title}
        <small>{painting.date}</small>
      </p>
    </GlassPanel>
  )
}

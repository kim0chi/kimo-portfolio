"use client"

import { createContext, useContext } from "react"

export type SegMeta = { id: string; label: string }

export type SegmentsValue = {
  active: number
  count: number
  segments: SegMeta[]
  goTo: (target: number | string) => void
}

export const SegmentsContext = createContext<SegmentsValue | null>(null)

export const useSegments = (): SegmentsValue =>
  useContext(SegmentsContext) ?? { active: 0, count: 0, segments: [], goTo: () => {} }

// Imperative nav bridge so overlays rendered OUTSIDE the provider (command menu,
// hero shell) can drive locked segment navigation. SegmentScroller registers `go`.
export const segmentNav: { go: (target: number | string) => void } = { go: () => {} }

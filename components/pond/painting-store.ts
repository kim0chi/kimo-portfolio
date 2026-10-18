"use client"

import { useSyncExternalStore } from "react"
import { DEFAULT_PAINTING, paintings } from "@/lib/paintings"

// The current painting lives on <html data-painting>: an inline script in app/layout.tsx sets it
// from the visitor's last choice before first paint, so the still image and the glass colourway
// (CSS rules keyed on that attribute) are right from the first frame.
export const PAINTING_STORAGE_KEY = "painting"

const listeners = new Set<() => void>()

function read() {
  const slug = typeof document === "undefined" ? undefined : document.documentElement.dataset.painting
  return slug && paintings.some((painting) => painting.slug === slug) ? slug : DEFAULT_PAINTING
}

export function choosePainting(slug: string) {
  if (!paintings.some((painting) => painting.slug === slug) || slug === read()) return
  document.documentElement.dataset.painting = slug
  try {
    localStorage.setItem(PAINTING_STORAGE_KEY, slug)
  } catch {
    // storage can be blocked (private mode); the choice still applies for this page view
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The current painting's slug; re-renders when the visitor switches. */
export function usePainting() {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_PAINTING)
}

export { subscribe as subscribePainting, read as currentPainting }

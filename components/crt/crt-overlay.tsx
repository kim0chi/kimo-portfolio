"use client"

// Fixed full-screen CRT effect layers. Visibility is driven purely by the
// `.crt-on` class on <html> (see lib/crt.tsx) so toggling is a single class
// flip with no React re-render of page content.
export function CrtOverlay() {
  return (
    <div aria-hidden className="crt-fx">
      <div className="crt-fx crt-vignette" />
      <div className="crt-fx crt-flicker" />
      <div className="crt-fx crt-scanlines" />
    </div>
  )
}

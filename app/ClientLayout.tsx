"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/react"
import { SoundProvider } from "@/lib/sound"
import { CrtProvider } from "@/lib/crt"

// The theme is a single dark-only phosphor palette defined on :root, so no
// theme provider is needed — the CRT and amber toggles are handled by CrtProvider
// and the Konami component.
export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <CrtProvider>
        <SoundProvider>{children}</SoundProvider>
      </CrtProvider>
      <Analytics />
    </>
  )
}

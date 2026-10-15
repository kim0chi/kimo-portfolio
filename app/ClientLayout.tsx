"use client"

import type { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/react"

/** The editorial theme needs no CRT/audio providers. Keep analytics only. */
export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}

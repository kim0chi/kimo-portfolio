"use client"

import type React from "react"
import { Suspense } from "react"
import { ThemeProvider } from "next-themes"
import { Analytics } from "@vercel/analytics/react"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </Suspense>
      <Analytics />
    </>
  )
}

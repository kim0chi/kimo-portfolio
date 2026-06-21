import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Anton, VT323 } from "next/font/google"
import ClientLayout from "./ClientLayout"
import "./globals.css"

// Chunky condensed display face for headings / big type.
const displayFace = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
})

// CRT pixel-terminal face for boot text and small system labels.
const terminalFace = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-terminal-face",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ILLUSTRISIMO_OS // Benedict Gio B. Illustrisimo",
  description:
    "Full-Stack Developer / AI Engineer. A retro CRT terminal portfolio by Benedict Gio B. Illustrisimo.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-mono ${GeistSans.variable} ${GeistMono.variable} ${displayFace.variable} ${terminalFace.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

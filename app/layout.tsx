import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Cormorant_Garamond, DM_Sans } from "next/font/google"
import ClientLayout from "./ClientLayout"
import "./globals.css"

const editorialFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-editorial",
  display: "swap",
})

const interfaceFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-interface",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Benedict Gio Illustrisimo — Full-Stack Developer & AI Engineer",
  description:
    "A thoughtfully crafted portfolio of software engineering, AI systems, and digital experiences by Benedict Gio Illustrisimo, based in Cebu, Philippines.",
  openGraph: {
    title: "Benedict Gio Illustrisimo — Developer & Maker",
    description: "Code with curiosity. Built with feeling.",
    type: "website",
  },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // Font variables live on <html> so the :root tokens in globals.css can resolve them.
    <html lang="en" className={interfaceFont.variable + " " + editorialFont.variable}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

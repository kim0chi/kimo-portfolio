import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Mona_Sans } from "next/font/google"
import localFont from "next/font/local"
import { DEFAULT_PAINTING, paintingStill, paintings, type Colourway } from "@/lib/paintings"
import { profile } from "@/lib/content"
import ClientLayout from "./ClientLayout"
import "./globals.css"

// GitHub's Mona Sans (OFL). The width axis gives headings presence without huge sizes.
const monaSans = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
})

// Mona Sans Mono isn't on Google Fonts; served unmodified from the v2.0.27 release (app/fonts/MonaSans-OFL.txt).
const monaSansMono = localFont({
  src: "./fonts/MonaSansMonoVF.woff2",
  weight: "200 900",
  variable: "--font-mona-mono",
  display: "swap",
})

export const metadata: Metadata = {
  // the canonical address (lib/content.ts); other hosts serving the same build point here
  metadataBase: new URL(profile.links.site),
  alternates: { canonical: "/" },
  title: "Benedict Gio Illustrisimo — Full-Stack Developer & AI Engineer",
  description: "Benedict Gio Illustrisimo, full-stack developer and AI engineer in Lapu-Lapu City, Cebu, Philippines. Selected work, experience and contact.",
  openGraph: {
    title: "Benedict Gio Illustrisimo — Full-Stack Developer & AI Engineer",
    description: "Full-stack developer and AI engineer in Cebu, Philippines.",
    url: "/",
    type: "website",
  },
}

// Runs before first paint: restores the visitor's painting (so the still image and glass colours are
// right from the first frame), preloads its dithered still, and decides whether this page view gets the
// intro (once per visit, never with reduced motion or Save-Data). Keys match
// components/pond/painting-store and pond-background.
const PRE_PAINT = `(function(){var d=document.documentElement,p=${JSON.stringify(DEFAULT_PAINTING)};try{var s=localStorage.getItem("painting");if(${JSON.stringify(paintings.map((painting) => painting.slug))}.indexOf(s)>-1)p=s;var c=navigator.connection;if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!(c&&c.saveData)&&!sessionStorage.getItem("intro-played"))d.classList.add("intro-pending")}catch(e){}d.dataset.painting=p;var l=document.createElement("link");l.rel="preload";l.as="image";l.fetchPriority="high";l.href="/paintings/"+p+"-dither.png";document.head.appendChild(l)})()`

// Each painting's colourway and still image, keyed on <html data-painting>; the first painting is also the default.
const tokens = (part: "day" | "dusk", colourway: Colourway) =>
  Object.entries(colourway).map(([name, value]) => `--${part}-${name === "accent2" ? "accent-2" : name}:${value}`).join(";")
const PAINTING_CSS = paintings
  .map((painting, index) => {
    const selector = `html[data-painting="${painting.slug}"]` + (index === 0 ? ",:root" : "")
    const colours = `${tokens("day", painting.colourway.day)};${tokens("dusk", painting.colourway.dusk)}`
    return `${selector}{${colours};--painting-still:url(${paintingStill(painting.slug)})}`
  })
  .join("")

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // Font variables live on <html> so the :root tokens in globals.css can resolve them. The pre-paint
    // script adds data-painting and intro classes before React hydrates, hence suppressHydrationWarning.
    <html lang="en" className={monaSans.variable + " " + monaSansMono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
        <style dangerouslySetInnerHTML={{ __html: PAINTING_CSS }} />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

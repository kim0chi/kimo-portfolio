"use client"

import { Download, Github, Linkedin, Mail, MapPin } from "lucide-react"
import { profile } from "@/lib/content"
import { useSound } from "@/lib/sound"
import { PhotoPortrait } from "@/components/crt/photo-portrait"
import { HeroTerminal } from "@/components/crt/hero-terminal"

const actions = [
  { label: "EMAIL", href: `mailto:${profile.email}`, Icon: Mail },
  { label: "GITHUB", href: profile.links.github, Icon: Github },
  { label: "LINKEDIN", href: profile.links.linkedin, Icon: Linkedin },
  { label: "RESUME.PDF", href: profile.resume, Icon: Download, download: true },
]

export function TerminalHero() {
  const { play } = useSound()

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center px-4 pt-10 pb-12">
      <div className="relative z-10 w-full max-w-4xl">
        <div className="border border-border box-glow bg-background/40 backdrop-blur-[2px]">
          {/* window title bar */}
          <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[11px] text-muted-foreground">
            <span className="text-primary text-glow">user@illustrisimo-os: ~/profile</span>
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 border border-border" />
              <span className="h-2.5 w-2.5 border border-border" />
              <span className="h-2.5 w-2.5 border border-primary bg-primary/30" />
            </div>
          </div>

          <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-5 md:gap-7 items-center md:items-start">
            {/* real phosphor-keyed photo feed */}
            <div className="shrink-0 relative border border-primary/50 box-glow p-1.5 bg-background/60 w-40 sm:w-44 md:w-52">
              <PhotoPortrait />
            </div>

            {/* identity */}
            <div className="min-w-0 text-center md:text-left flex-1">
              <p className="font-terminal text-primary text-glow text-base mb-1">&gt; whoami</p>
              <h1 className="font-display text-3xl sm:text-5xl leading-[0.95] text-foreground text-glow break-words">
                {profile.name}
              </h1>
              <p className="font-display text-primary text-glow text-sm sm:text-lg mt-2 tracking-wide">
                {profile.title}
              </p>

              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                <span className="text-primary">$</span> echo{" "}
                <span className="text-foreground cursor-blink">&quot;{profile.tagline}&quot;</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {profile.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary box-glow animate-pulse" />
                  {profile.status}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-2">
                {actions.map(({ label, href, Icon, download }) => (
                  <a
                    key={label}
                    href={href}
                    {...(download
                      ? { download: "Benedict_Illustrisimo_CV.pdf" }
                      : { target: "_blank", rel: "noopener noreferrer" })}
                    onMouseEnter={() => play("hover")}
                    onClick={() => play("select")}
                    className="snap inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-[11px] sm:text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* interactive shell */}
          <div className="px-4 sm:px-6 pb-5">
            <HeroTerminal />
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground animate-pulse">
          ▼ scroll or press [M] for the menu ▼
        </p>
      </div>
    </section>
  )
}

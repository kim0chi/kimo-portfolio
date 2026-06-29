"use client"

import { Award, GraduationCap, MapPin, ScrollText, Trophy } from "lucide-react"
import { AsciiBackground } from "@/components/crt/ascii-background"
import { AmbientCanvas } from "@/components/crt/ambient-canvas"
import { CursorFx } from "@/components/crt/cursor-fx"
import { BootSequence } from "@/components/crt/boot-sequence"
import { SystemBar } from "@/components/crt/system-bar"
import { CrtOverlay } from "@/components/crt/crt-overlay"
import { CommandMenu } from "@/components/crt/command-menu"
import { Konami } from "@/components/crt/konami"
import { SegmentScroller } from "@/components/crt/segment-scroller"
import { TerminalHero } from "@/components/crt/terminal-hero"
import { SectionHeading } from "@/components/crt/section-heading"
import { Reveal } from "@/components/crt/reveal"
import { AsciiMeter } from "@/components/crt/ascii-meter"
import { ProjectModule } from "@/components/crt/project-module"
import type { SegMeta } from "@/lib/segments"
import {
  achievements,
  type Achievement,
  certifications,
  education,
  experience,
  type Experience,
  profile,
  projects,
  skillGroups,
  skillTags,
} from "@/lib/content"

const SEGMENTS: SegMeta[] = [
  { id: "profile", label: "PROFILE" },
  { id: "experience", label: "EXPERIENCE" },
  { id: "education", label: "EDUCATION" },
  { id: "skills", label: "SKILLS" },
  { id: "projects", label: "PROJECTS" },
  { id: "achievements", label: "ACHIEVEMENTS" },
]

// Full-viewport segment wrapper. Content is centered; if it ever exceeds one
// screen the scroller switches that segment to internal scrolling.
function Segment({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      data-segment={id}
      className="flex min-h-[100svh] w-full flex-col justify-center px-4 py-14"
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  )
}

function JobCard({ job }: { job: Experience }) {
  return (
    <article className="snap h-full border border-border bg-background/40 p-4 hover:border-primary/60 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-base text-foreground text-glow sm:text-lg">{job.role}</h3>
        <span className="text-[11px] tabular-nums text-muted-foreground">{job.period}</span>
      </div>
      <p className="text-sm text-primary text-glow">
        {job.org} <span className="text-muted-foreground">// {job.location}</span>
        {job.current && (
          <span className="ml-2 inline-flex items-center gap-1 border border-warning px-1.5 py-0.5 text-[10px] text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" /> ACTIVE
          </span>
        )}
      </p>
      <ul className="mt-3 space-y-1.5">
        {job.bullets.map((b, bi) => (
          <li key={bi} className="flex gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 text-primary">&gt;</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.tech.map((t) => (
          <span key={t} className="border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </article>
  )
}

function AchievementCard({ a }: { a: Achievement }) {
  return (
    <article className="h-full overflow-hidden border border-primary/50 box-glow bg-background/40">
      {a.image && (
        <div className="relative flex w-full items-center justify-center overflow-hidden border-b border-border bg-background p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.image}
            alt=""
            aria-hidden
            className="crt-photo max-h-56 w-auto object-contain"
            draggable={false}
          />
          <div className="crt-portrait-scan pointer-events-none absolute inset-0" aria-hidden />
        </div>
      )}
      <div className="p-4 sm:p-5">
        <h3 className="font-display text-base text-foreground text-glow sm:text-lg">{a.title}</h3>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-warning">
          <Trophy className="h-4 w-4 shrink-0" /> {a.result}
        </p>
        <p className="mt-1 text-xs text-primary text-glow">
          {[a.event, a.team && `Team ${a.team}`, a.date].filter(Boolean).join(" · ")}
        </p>
        {a.org && <p className="text-xs text-muted-foreground">{a.org}</p>}
        {a.role && (
          <p className="mt-1 text-xs text-muted-foreground">
            Role: <span className="text-foreground">{a.role}</span>
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">{a.description}</p>
        {a.members && (
          <div className="mt-3">
            <h4 className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Team</h4>
            <div className="flex flex-wrap gap-1.5">
              {a.members.map((m) => (
                <span key={m} className="border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

export default function Portfolio() {
  const [featured, ...rest] = experience

  return (
    <>
      <BootSequence onDone={() => {}} />

      <AsciiBackground />
      <AmbientCanvas />
      <CursorFx />
      <SystemBar />
      <CrtOverlay />
      <CommandMenu />
      <Konami />

      <SegmentScroller segments={SEGMENTS}>
        {/* 00 PROFILE */}
        <div id="profile" data-segment="profile">
          <TerminalHero />
        </div>

        {/* 01 EXPERIENCE */}
        <Segment id="experience">
          <Reveal>
            <SectionHeading command="cat experience.log" title="Experience" />
          </Reveal>
          <div className="space-y-4">
            <Reveal>
              <JobCard job={featured} />
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {rest.map((job, i) => (
                <Reveal key={job.org} delay={(i + 1) * 50}>
                  <JobCard job={job} />
                </Reveal>
              ))}
            </div>
          </div>
        </Segment>

        {/* 02 EDUCATION */}
        <Segment id="education">
          <Reveal>
            <SectionHeading command="cat education.log" title="Education" />
          </Reveal>
          <Reveal>
            <article className="border border-border bg-background/40 p-4 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="inline-flex items-center gap-2 font-display text-base text-foreground text-glow sm:text-lg">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {education.degree}
                </h3>
                <span className="text-[11px] tabular-nums text-muted-foreground">{education.period}</span>
              </div>
              <p className="text-sm text-primary text-glow">{education.school}</p>

              <h4 className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">Coursework</h4>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground sm:grid-cols-3">
                {education.coursework.map((c) => (
                  <span key={c} className="flex gap-2">
                    <span className="text-primary">+</span> {c}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Achievements</h4>
                  <div className="mt-2 space-y-1">
                    {education.achievements.map((a) => (
                      <p key={a} className="flex items-center gap-2 text-sm text-foreground">
                        <Award className="h-4 w-4 shrink-0 text-primary" /> {a}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Certifications</h4>
                  <div className="mt-2 space-y-1">
                    {certifications.map((c) => (
                      <p key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ScrollText className="h-4 w-4 shrink-0 text-primary" /> {c}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        </Segment>

        {/* 03 SKILLS */}
        <Segment id="skills">
          <Reveal>
            <SectionHeading command="run ./skills --report" title="Skills" />
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {skillGroups.map((group, i) => (
              <Reveal key={group.label} delay={i * 50}>
                <article className="h-full border border-border bg-background/40 p-4">
                  <h3 className="mb-4 font-display text-sm tracking-wider text-primary text-glow">{group.label}</h3>
                  <div className="space-y-3">
                    {group.skills.map((s) => (
                      <AsciiMeter key={s.name} label={s.name} level={s.level} />
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-4">
            <article className="grid gap-x-6 gap-y-3 border border-border bg-background/40 p-4 sm:grid-cols-3">
              {Object.entries(skillTags).map(([label, tags]) => (
                <div key={label}>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="snap border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:border-primary hover:text-primary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </article>
          </Reveal>
        </Segment>

        {/* 04 PROJECTS */}
        <Segment id="projects">
          <Reveal>
            <SectionHeading command={`ls -la /projects  # ${projects.length} modules`} title="Projects" />
          </Reveal>
          <div className="grid gap-3 md:grid-cols-2">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 30}>
                <ProjectModule project={p} index={i} />
              </Reveal>
            ))}
          </div>
        </Segment>

        {/* 05 ACHIEVEMENTS */}
        <Segment id="achievements">
          <Reveal>
            <SectionHeading command="cat achievements.log" title="Achievements" />
          </Reveal>
          <div className="grid items-start gap-4 md:grid-cols-2">
            {achievements.map((a, i) => (
              <Reveal key={a.id} delay={i * 50}>
                <AchievementCard a={a} />
              </Reveal>
            ))}
          </div>

          <footer className="mt-8 border-t border-border pt-5 text-center text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {profile.location}
            </p>
            <p className="mt-2">
              <span className="text-primary">&gt;</span> session active · {profile.name} · © 2026
            </p>
            <p className="mt-1 opacity-60">built with next.js + tailwind · powered by curiosity</p>
          </footer>
        </Segment>
      </SegmentScroller>
    </>
  )
}

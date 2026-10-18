"use client"

import { useRef, useState, type CSSProperties } from "react"
import { Menu, X } from "lucide-react"
import { achievements, certifications, education, experience, profile, projects, skillGroups, skillTags } from "@/lib/content"
import { paintings } from "@/lib/paintings"
import { PondBackground, REPLAY_INTRO_EVENT } from "@/components/pond/pond-background"
import { PaintingSwitcher } from "@/components/pond/painting-switcher"
import { usePainting } from "@/components/pond/painting-store"
import { GlassPanel } from "@/components/glass/glass-panel"
import { GlassScene } from "@/components/glass/glass-scene"
import { useLiquidGlass } from "@/components/glass/use-liquid-glass"
import { WorkRows } from "@/components/work/work-rows"
import { GlassCursor } from "@/components/glass/glass-cursor"
import { TechList } from "@/components/tech/tech-list"

const navigation = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
]

// "Benedict Gio B. Illustrisimo" → "Benedict Gio" / "Illustrisimo"
const displayName = profile.name.replace(" B.", "")
const firstNames = displayName.split(" ").slice(0, -1).join(" ")
const lastName = displayName.split(" ").at(-1)
const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const titleCase = (label: string) => label.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase()).replace(/\bAi\b/, "AI")
// labels in the experience data that are ways of working, not technologies
const NOT_TECH = new Set(["Production", "Support", "Communication"])
// staggers the hero's supporting lines in the intro (see .hero-after in globals.css)
const step = (index: number) => ({ "--i": index }) as CSSProperties

export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  useLiquidGlass(headerRef)

  const [featured, ...otherProjects] = projects
  const featuredLink = featured.liveUrl || featured.githubUrl
  const paintingSlug = usePainting()
  const painting = paintings.find((candidate) => candidate.slug === paintingSlug) ?? paintings[0]

  return (
    <>
      <PondBackground />
      <GlassScene />
      <GlassCursor />
      <a href="#work" className="skip-link">Skip to selected work</a>

      {/* just the sections: the name lives in the hero, the CV link in the hero and contact */}
      <GlassPanel as="header" kind="nav" ref={headerRef} className="site-header">
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav
          id="mobile-navigation"
          className={"mobile-nav " + (menuOpen ? "mobile-nav-open" : "")}
          aria-label="Mobile navigation"
          inert={!menuOpen}
        >
          {navigation.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
          ))}
        </nav>
      </GlassPanel>

      <main id="top">
        <section className="hero" aria-labelledby="hero-name">
          <GlassPanel className="hero-copy">
            {/* one wrapper, so the intro can surface all of it through rippling water (components/pond/surface-reveal) */}
            <div className="hero-content">
              <p className="hero-role hero-after" style={step(0)}>{profile.title.replace(" / ", " and ")}</p>
              <h1 id="hero-name" className="hero-name display">
                <span>{firstNames}</span> <span>{lastName}</span>
              </h1>
              <p className="hero-lede hero-after" style={step(1)}>{sentence(profile.tagline)}.</p>
              <p className="hero-facts hero-after" style={step(2)}>{profile.location} · {profile.status}</p>
              <div className="hero-actions hero-after" style={step(3)}>
                <a className="button" href="#work">See my work</a>
                <a className="button button-ghost" href={profile.resume} download>Download CV</a>
                <a className="button button-ghost" href={"mailto:" + profile.email}>Email me</a>
              </div>
            </div>
          </GlassPanel>
        </section>

        <GlassPanel as="section" reveal className="section" id="work" aria-labelledby="work-heading">
          <h2 id="work-heading" className="display">Selected work</h2>
          <div className="feature">
            <div>
              <h3 className="display">{featured.title}</h3>
              <p className="feature-tagline">{featured.tagline}</p>
              <p className="feature-description">{featured.description}</p>
            </div>
            <aside>
              {featured.award && <div><b>Recognition</b>{featured.award}</div>}
              <div><b>Stack</b><TechList items={featured.tech} /></div>
              {featuredLink && (
                <div>
                  <a className="button button-ghost" href={featuredLink} target="_blank" rel="noopener noreferrer">
                    {featured.liveUrl ? "Visit" : "View on GitHub"} →
                  </a>
                </div>
              )}
            </aside>
          </div>
          <WorkRows projects={otherProjects} />
        </GlassPanel>

        <GlassPanel as="section" reveal className="section" id="experience" aria-labelledby="experience-heading">
          <h2 id="experience-heading" className="display">Experience</h2>
          <ul className="jobs">
            {experience.map((job) => (
              <li key={job.org}>
                <span className="job-when mono">{job.period}</span>
                <div>
                  <h3 className="display">{job.role}</h3>
                  <p className="job-org">
                    {job.org}
                    {job.location && <span> · {job.location}</span>}
                    {job.volunteer && <span className="job-tag">Volunteer</span>}
                  </p>
                  {/* current roles get their full story; earlier ones the two lines that matter most */}
                  <ul>{job.bullets.slice(0, job.current ? 4 : 2).map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                  <TechList items={job.tech.filter((name) => !NOT_TECH.has(name))} className="job-tech" />
                </div>
              </li>
            ))}
          </ul>
        </GlassPanel>

        <GlassPanel as="section" reveal className="section" id="recognition" aria-labelledby="recognition-heading">
          <h2 id="recognition-heading" className="display">Recognition</h2>
          <div className="awards">
            {achievements.map((award) => (
              <article className="award" key={award.id}>
                {award.image && (
                  <div className="award-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={award.image} alt={award.title} loading="lazy" data-parallax />
                  </div>
                )}
                <div className="award-body">
                  <h3>{award.title}</h3>
                  <p className="award-result">{award.result}</p>
                  <p className="award-meta mono">{[award.role, award.date].filter(Boolean).join(" · ")}</p>
                </div>
              </article>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel as="section" reveal className="section" id="about" aria-labelledby="about-heading">
          <h2 id="about-heading" className="display">About</h2>
          <p className="about-line">Building my curiosity.</p>
          <div className="about-facts">
            <dl>
              <div>
                <dt>Education</dt>
                <dd>
                  <strong>{education.degree}</strong>, {education.school} · <span className="mono">{education.period}</span>
                  <br />{education.achievements.join(", ")}
                </dd>
              </div>
              <div>
                <dt>Certifications</dt>
                <dd>{certifications.map((certification) => <span className="about-item" key={certification}>{certification}</span>)}</dd>
              </div>
            </dl>
            <dl>
              {skillGroups.map((group) => (
                <div key={group.label}>
                  <dt>{titleCase(group.label)}</dt>
                  <dd><TechList items={group.skills.map((skill) => skill.name)} /></dd>
                </div>
              ))}
              <div>
                <dt>Data and deployment</dt>
                <dd><TechList items={[...skillTags.Databases, ...skillTags.Deployment]} /></dd>
              </div>
              <div>
                <dt>Tools</dt>
                <dd><TechList items={skillTags.Tools} /></dd>
              </div>
            </dl>
          </div>
        </GlassPanel>

        <GlassPanel as="section" reveal className="section contact" id="contact" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="display">Let&apos;s talk</h2>
          <p>{profile.status}. Email is the quickest way to reach me.</p>
          <a className="contact-mail" href={"mailto:" + profile.email}>{profile.email}</a>
          <div className="contact-links">
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a href={profile.resume} download>Download CV ↓</a>
          </div>
        </GlassPanel>
      </main>

      <GlassPanel as="footer" className="site-footer">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        {/* the Art Institute of Chicago's requested caption for its open-access images */}
        <span>
          Painting: Claude Monet.{" "}
          <a href={painting.url} target="_blank" rel="noopener noreferrer">{painting.title}</a>, {painting.date}. The Art Institute of Chicago.
        </span>
        <button type="button" className="replay-intro" onClick={() => window.dispatchEvent(new Event(REPLAY_INTRO_EVENT))}>
          Replay intro
        </button>
      </GlassPanel>
      <PaintingSwitcher />
    </>
  )
}

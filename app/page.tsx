"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  X,
} from "lucide-react"
import {
  achievements,
  certifications,
  education,
  experience,
  profile,
  projects,
  skillGroups,
  skillTags,
  type Achievement,
  type Experience,
  type Project,
} from "@/lib/content"

const artwork = {
  image: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
  source: "https://commons.wikimedia.org/wiki/File:Claude_Monet_-_Water_Lilies_-_1906,_Ryerson.jpg",
}

const navigation = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
]

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (!("IntersectionObserver" in window)) return

    element.classList.add("reveal-pending")
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          element.classList.add("reveal-visible")
          observer.unobserve(element)
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={"soft-reveal " + className}
      style={{ "--reveal-delay": delay + "ms" } as CSSProperties}
    >
      {children}
    </div>
  )
}

function SectionTitle({
  index,
  eyebrow,
  title,
  accent,
  intro,
  id,
}: {
  index: string
  eyebrow: string
  title: string
  accent?: string
  intro?: string
  id?: string
}) {
  return (
    <div className="section-heading">
      <div className="section-heading-copy">
        <span className="eyebrow"><span className="section-index">{index}</span> / {eyebrow}</span>
        <h2 className="section-title" id={id}>
          {title}{accent && <> <em>{accent}</em></>}
        </h2>
      </div>
      {intro && <p className="section-intro">{intro}</p>}
    </div>
  )
}

function ProjectArt({ project, index }: { project: Project; index: number }) {
  return (
    <div className={"project-art project-art--" + project.id}>
      <div className="project-art-orb" aria-hidden="true" />
      <span className="project-art-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      {project.image ? (
        // Existing portfolio project assets are served from /public.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="project-art-image" src={project.image} alt="" loading="lazy" />
      ) : (
        <span className="project-art-word" aria-hidden="true">{project.title}</span>
      )}
      <span className="project-art-caption">Selected work · {String(index + 1).padStart(2, "0")}</span>
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const destination = project.liveUrl || project.githubUrl

  return (
    <article className={"project-card " + (index === 0 ? "project-card-featured" : "")}>
      <ProjectArt project={project} index={index} />
      <div className="project-details">
        <div className="project-topline">
          <span className="eyebrow">{project.featured ? "Featured project" : "Selected project"}</span>
          {project.status && <span className="project-status">{project.status}</span>}
        </div>
        <div className="project-name-row">
          <h3 className="project-title">{project.title}</h3>
          {destination && (
            <a
              className="project-action"
              href={destination}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={"View " + project.title + " project"}
            >
              <ArrowUpRight size={22} strokeWidth={1.6} aria-hidden="true" />
            </a>
          )}
        </div>
        <p className="project-tagline">{project.tagline}</p>
        <p className="project-description">{project.description}</p>
        {project.award && <p className="project-award">✳ {project.award}</p>}
        <div className="project-tags">
          {project.tech.slice(0, 6).map((tech) => <span key={tech}>{tech}</span>)}
        </div>
      </div>
    </article>
  )
}

function CareerEntry({ job, index }: { job: Experience; index: number }) {
  return (
    <article className="career-entry">
      <div className="career-when">
        <span className="career-index">{String(index + 1).padStart(2, "0")}</span>
        <span>{job.period}</span>
      </div>
      <div className="career-body">
        <h3>{job.role}</h3>
        <p className="career-org">{job.org} <span>· {job.location}</span></p>
        <ul className="career-bullets">{job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
        <div className="simple-tags">{job.tech.map((tech) => <span key={tech}>{tech}</span>)}</div>
      </div>
      <ArrowUpRight className="career-arrow" size={22} strokeWidth={1.5} aria-hidden="true" />
    </article>
  )
}

function Recognition({ item, index }: { item: Achievement; index: number }) {
  return (
    <article className="recognition-card">
      {item.image && (
        <div className="recognition-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title + " event"} loading="lazy" className="recognition-image" />
        </div>
      )}
      <div className="recognition-body">
        <span className="eyebrow">Distinction / {String(index + 1).padStart(2, "0")}</span>
        <h3>{item.title}</h3>
        <p className="recognition-result">{item.result}</p>
        <p className="recognition-meta">{[item.role, item.date].filter(Boolean).join(" · ")}</p>
        <p className="recognition-copy">{item.description}</p>
      </div>
    </article>
  )
}

export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <a href="#work" className="skip-link">Skip to selected work</a>
      <div className="site-shell">
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="Benedict Illustrisimo, return to top">
            <span className="wordmark-mark">g<span>.</span></span>
            <span className="wordmark-name">Gio Illustrisimo <small>Developer & maker</small></span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
          </nav>
          <a className="nav-cta" href={"mailto:" + profile.email}>
            Let&apos;s talk <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
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
        </header>

        <main id="top">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <div className="hero-overline"><span className="overline-dot" /> Independent software developer <span className="hero-issue">Portfolio, 2026</span></div>
              <h1 id="hero-title">Code with<br /><em>curiosity.</em><br />Built with <span className="hero-feeling">feeling<span className="period">.</span></span></h1>
              <p className="hero-intro">I&apos;m {profile.name.split(" ")[0]}, a full-stack developer and AI engineer crafting thoughtful digital experiences — where engineering meets a little artistry.</p>
              <div className="hero-actions">
                <a href="#work" className="primary-button">Explore my work <ArrowDownRight size={19} aria-hidden="true" /></a>
                <a href="#about" className="text-link">A little about me <ArrowUpRight size={17} aria-hidden="true" /></a>
              </div>
              <div className="hero-footnote"><MapPin size={14} aria-hidden="true" /> {profile.location} <span className="footnote-line" aria-hidden="true" /> Open to meaningful collaborations</div>
            </div>
            <div className="hero-art-column">
              <div className="hero-art-bloom hero-art-bloom-one" aria-hidden="true" />
              <div className="hero-art-bloom hero-art-bloom-two" aria-hidden="true" />
              <div className="hero-art-frame">
                {/* Public-domain reproduction of Claude Monet's Water Lilies (1906). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="hero-art-image" src={artwork.image} alt="Claude Monet's Water Lilies, 1906: a calm pond of blue, green, and lavender reflections" fetchPriority="high" />
                <div className="hero-art-grain" aria-hidden="true" />
                <div className="hero-art-label"><span>No. 01 / On light & possibility</span><strong>Inspired by the art of seeing differently.</strong></div>
              </div>
              <div className="art-side-note" aria-hidden="true">an impression of possibility <span>↗</span></div>
              <span className="art-edition">/ The art of building</span>
            </div>
          </section>

          <div className="marquee-note" aria-label="Areas of practice">
            <span>01 — Design-minded development</span><span className="note-flower">✳</span>
            <span>02 — AI & intelligent systems</span><span className="note-flower">✳</span>
            <span>03 — Thoughtful experiences</span>
          </div>

          <section className="section work-section" id="work" aria-labelledby="work-heading">
            <Reveal>
              <SectionTitle id="work-heading" index="01" eyebrow="The collection" title="Selected" accent="works" intro="A selection of projects at the intersection of curiosity, utility, and technology. Each one is a study in making something matter." />
            </Reveal>
            <div className="project-grid">
              {projects.map((project, index) => (
                <Reveal key={project.id} delay={(index % 2) * 110}>
                  <ProjectCard project={project} index={index} />
                </Reveal>
              ))}
            </div>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="view-more-link">
              Explore more on GitHub <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </section>

          <section className="about-section" id="about" aria-labelledby="about-heading">
            <div className="about-image-column">
              <div className="portrait-backdrop" />
              <div className="portrait-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/portrait-web.webp" alt="Portrait of Benedict Gio Illustrisimo" loading="lazy" />
              </div>
              <span className="portrait-caption">A human behind the code — Cebu, Philippines</span>
            </div>
            <div className="about-text-column">
              <Reveal>
                <span className="eyebrow"><span className="section-index">02</span> / The person behind the work</span>
                <h2 className="section-title about-title" id="about-heading">More than just <em>lines of code.</em></h2>
                <p className="about-lead">I believe the most meaningful technology is both beautifully considered and genuinely useful.</p>
                <p className="about-paragraph">My work lives between full-stack engineering, artificial intelligence, and thoughtful product experiences. I enjoy turning complex problems into interfaces and systems that feel intuitive — without losing the depth underneath.</p>
                <p className="about-paragraph">Away from the editor, I&apos;m always learning, exploring ideas, and looking for new ways to make technology feel more human.</p>
                <div className="about-education"><span className="eyebrow">Education</span><strong>{education.degree}</strong><span>{education.school} · {education.period}</span></div>
              </Reveal>
            </div>
          </section>

          <section className="section expertise-section" aria-labelledby="expertise-heading">
            <Reveal>
              <SectionTitle id="expertise-heading" index="03" eyebrow="What I bring" title="The tools of" accent="my craft" intro="A broad toolkit, with an eye for the details that make products feel complete." />
            </Reveal>
            <div className="expertise-grid">
              {skillGroups.map((group, index) => (
                <Reveal key={group.label} delay={index * 70}>
                  <div className="expertise-card">
                    <div className="expertise-mark">{String(index + 1).padStart(2, "0")}</div>
                    <h3>{group.label.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</h3>
                    <div className="expertise-tags">{group.skills.map((skill) => <span key={skill.name}>{skill.name}</span>)}</div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="supporting-skills">
              {Object.entries(skillTags).map(([label, tags]) => (
                <div key={label}><span className="eyebrow">{label}</span><p>{tags.join(" · ")}</p></div>
              ))}
            </div>
          </section>

          <section className="section career-section" id="experience" aria-labelledby="experience-heading">
            <Reveal>
              <SectionTitle id="experience-heading" index="04" eyebrow="The journey" title="Places I've" accent="grown" intro="Learning by doing, working alongside people, and making ideas real." />
            </Reveal>
            <div className="career-list">
              {experience.map((job, index) => (
                <Reveal key={job.org} delay={index * 65}><CareerEntry job={job} index={index} /></Reveal>
              ))}
            </div>
            <div className="education-ribbon">
              <span className="eyebrow">Learning never stops</span>
              <p>{education.achievements.join(" · ")} <span aria-hidden="true">✳</span> {certifications.join(" · ")}</p>
            </div>
          </section>

          <section className="section recognition-section" id="recognition" aria-labelledby="recognition-heading">
            <Reveal>
              <SectionTitle id="recognition-heading" index="05" eyebrow="Milestones" title="Moments worth" accent="remembering" intro="Recognition is lovely. The collaborative effort and lessons along the way matter even more." />
            </Reveal>
            <div className="recognition-grid">
              {achievements.map((item, index) => (
                <Reveal key={item.id} delay={index * 100}><Recognition item={item} index={index} /></Reveal>
              ))}
            </div>
          </section>

          <section className="contact-section" id="contact" aria-labelledby="contact-heading">
            <div className="contact-orb contact-orb-one" aria-hidden="true" />
            <div className="contact-orb contact-orb-two" aria-hidden="true" />
            <div className="contact-inner">
              <span className="eyebrow">06 / An open invitation</span>
              <h2 id="contact-heading">Let's make<br />something <em>beautifully useful.</em></h2>
              <p>Have a problem worth solving, an interesting idea, or just a question? I&apos;d love to hear about it.</p>
              <a href={"mailto:" + profile.email} className="contact-button">Start a conversation <ArrowUpRight size={21} aria-hidden="true" /></a>
              <div className="contact-socials">
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer"><Github size={17} aria-hidden="true" /> GitHub <ArrowUpRight size={14} aria-hidden="true" /></a>
                <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={17} aria-hidden="true" /> LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></a>
                <a href={"mailto:" + profile.email}><Mail size={17} aria-hidden="true" /> Email <ArrowUpRight size={14} aria-hidden="true" /></a>
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <a className="footer-mark" href="#top">g<span>.</span></a>
          <p>© {new Date().getFullYear()} {profile.name}. Made with intention.</p>
          <p className="art-credit">Artwork: <a href={artwork.source} target="_blank" rel="noopener noreferrer">Claude Monet, <em>Water Lilies</em> (1906)</a> · Public domain</p>
          <a href="#top" className="back-to-top">Back to top <ArrowRight size={16} aria-hidden="true" /></a>
        </footer>
      </div>
    </>
  )
}

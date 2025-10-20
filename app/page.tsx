"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SkillProgressBar } from "@/components/skill-progress-bar"
import { ProjectCard } from "@/components/project-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Particles } from "@/components/particles"
import {
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Award,
  MapPin,
  Download,
  Mail,
  Linkedin,
  Github,
} from "lucide-react"

export default function Portfolio() {
  const [showSidebar, setShowSidebar] = useState(false)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const viewportHeight = window.innerHeight
      setShowSidebar(scrollPosition > viewportHeight * 0.1)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
            entry.target.classList.remove("opacity-0", "translate-y-8")
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    sectionsRef.current.forEach((section) => {
      if (section) {
        observer.observe(section)
      }
    })

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          observer.unobserve(section)
        }
      })
    }
  }, [showSidebar])

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <section className="flex flex-col items-center justify-center min-h-screen relative px-6 overflow-hidden">
        <Particles
          particleCount={200}
          particleSpread={18}
          speed={0.15}
          particleColors={["#5ac8fa", "#64d2ff", "#8fdbff", "#a5e3ff"]}
          moveParticlesOnHover={true}
          particleHoverFactor={0.8}
          alphaParticles={true}
          particleBaseSize={180}
          sizeRandomness={0.8}
          cameraDistance={22}
          disableRotation={false}
          className="opacity-80 dark:opacity-90"
        />

        <div className="absolute top-8 right-8 z-10">
          <ThemeToggle />
        </div>

        <div className="text-center max-w-4xl relative z-10">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-primary/20 shadow-2xl mb-8 mx-auto">
            <AvatarImage
              src="/memoji.png"
              alt="Benedict Gio B. Illustrisimo"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold text-4xl">
              BI
            </AvatarFallback>
          </Avatar>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight">
            Benedict Illustrisimo
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">
            Software Developer • 22 years old
          </p>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 text-pretty">
            Turning Curiousity into Code
          </p>

          <div className="flex items-center justify-center gap-8 text-base text-muted-foreground mb-10">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Philippines
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Available for work
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-full transition-all duration-300 hover:scale-105 bg-transparent"
            >
              <a href="mailto:illustrisimo.jikimo@gmail.com" target="_blank" rel="noopener noreferrer">
                <Mail className="h-5 w-5 mr-2" />
                Email
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-full transition-all duration-300 hover:scale-105 bg-transparent"
            >
              <a href="https://www.linkedin.com/in/gio-illustrisimo-aa9a42133/" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-full transition-all duration-300 hover:scale-105 bg-transparent"
            >
              <a href="https://github.com/kim0chi" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className={`grid grid-cols-1 gap-8 ${showSidebar ? "lg:grid-cols-4" : "lg:grid-cols-1"}`}>
          {showSidebar && (
            <aside className="lg:col-span-1 animate-in fade-in slide-in-from-left-5 duration-500">
              <div className="lg:sticky lg:top-8">
                <Card className="w-full shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-border/50">
                      <Avatar className="h-20 w-20 ring-2 ring-primary/20 shadow-lg mb-4">
                        <AvatarImage
                          src="/memoji.png"
                          alt="Benedict Gio B. Illustrisimo"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold text-xl">
                          BI
                        </AvatarFallback>
                      </Avatar>
                      <h1 className="text-lg font-bold text-foreground tracking-tight mb-1">
                        Benedict Gio B. Illustrisimo
                      </h1>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Software Developer</p>
                      <p className="text-xs text-muted-foreground/80">22 years old</p>

                      <div className="flex items-center gap-1 mt-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-9 w-9 rounded-full transition-all duration-300 hover:bg-accent/10 hover:scale-105 group"
                        >
                          <a href="mailto:illustrisimo.jikimo@gmail.com" target="_blank" rel="noopener noreferrer">
                            <Mail className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                            <span className="sr-only">Email</span>
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-9 w-9 rounded-full transition-all duration-300 hover:bg-accent/10 hover:scale-105 group"
                        >
                          <a href="https://linkedin.com/in/gio-illustrisimo-aa9a42133/" target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                            <span className="sr-only">LinkedIn</span>
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-9 w-9 rounded-full transition-all duration-300 hover:bg-accent/10 hover:scale-105 group"
                        >
                          <a href="https://github.com/kim0chi" target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                            <span className="sr-only">GitHub</span>
                          </a>
                        </Button>
                        <ThemeToggle />
                      </div>
                    </div>

                    <nav className="space-y-4">
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Sections
                        </h3>
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-11 text-sm font-medium group"
                            asChild
                          >
                            <a href="#work-experience">
                              <Briefcase className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                              Internship Experience
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-11 text-sm font-medium group"
                            asChild
                          >
                            <a href="#education">
                              <GraduationCap className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                              Education
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-11 text-sm font-medium group"
                            asChild
                          >
                            <a href="#skills">
                              <Code className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                              Skills
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-11 text-sm font-medium group"
                            asChild
                          >
                            <a href="#projects">
                              <FolderOpen className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                              Projects
                            </a>
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Quick Actions
                        </h3>
                        <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2 bg-transparent group">
                          <a href="/resume.pdf" download="Benedict_Illustrisimo_Resume.pdf" target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                            Download Resume
                          </a>
                        </Button>
                      </div>
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </aside>
          )}

          <div className={`space-y-16 ${showSidebar ? "lg:col-span-3" : "lg:col-span-1"}`}>
            <section
              id="work-experience"
              className="scroll-mt-28 opacity-0 translate-y-8 transition-all duration-700 ease-out"
              ref={(el) => {
                sectionsRef.current[0] = el
              }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-8 tracking-tight">Internship Experience</h2>
              <div className="space-y-6">
                <Card className="shadow-sm border-border/50 hover:shadow-md transition-all duration-300 hover:border-border">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">ServiceNow Developer Intern</h3>
                        <p className="text-muted-foreground font-medium">Rococo Global Technologies</p>
                      </div>
                      <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        Jan 2025 - May 2025
                      </span>
                    </div>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Project Manager & Lead Developer for a team of 7 interns delivering a ServiceNow web-based enrollment system.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Designed the data model (Students, Courses, Sections, Enrollments) and built catalog items, Flow Designer workflows, and Business Rules/Script Includes to automate registration, waitlists, and approvals.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Built a Service Portal/UI Builder front end with role-based access (ACLs) for students, faculty, and admins.
                        </span>
                      </li>
                    </ul>

                    <div className="mt-6 pt-4 border-t border-border/50">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Technologies Used</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          HTML/CSS
                        </Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          JavaScript
                        </Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          ServiceNow
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section
              id="education"
              className="scroll-mt-28 opacity-0 translate-y-8 transition-all duration-700 ease-out"
              ref={(el) => {
                sectionsRef.current[1] = el
              }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-8 tracking-tight">Education</h2>
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        Bachelor of Science in Computer Science
                      </h3>
                      <p className="text-muted-foreground font-medium">University of Cebu: Lapu-Lapu & Mandaue</p>
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      2022 - Present
                    </span>
                  </div>
                  {/* <p className="text-muted-foreground mb-4">
                    Graduated Magna Cum Laude with focus on software engineering and web development.
                  </p> */}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Key Coursework</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <span>• Data Structures & Algorithms</span>
                        <span>• Software Engineering</span>
                        <span>• Relational Database Systems</span>
                        <span>• Compiler Design</span>
                        <span>• Computer Organization</span>
                        <span>• Neural Networks</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Achievements</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          Dean's List for 4 semesters
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section
              id="skills"
              className="scroll-mt-28 opacity-0 translate-y-8 transition-all duration-700 ease-out"
              ref={(el) => {
                sectionsRef.current[2] = el
              }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-8 tracking-tight">Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-border/50">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Programming Languages</h3>
                    <div className="space-y-4">
                      <SkillProgressBar skill="JavaScript" level={50} delay={100} />
                      <SkillProgressBar skill="TypeScript" level={30} delay={200} />
                      <SkillProgressBar skill="Java" level={60} delay={300} />
                      <SkillProgressBar skill="C#" level={70} delay={400} />
                      <SkillProgressBar skill="Python" level={80} delay={400} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Frameworks & Tools</h3>
                    <div className="space-y-4">
                      <SkillProgressBar skill="React/Next.js" level={60} delay={100} />
                      <SkillProgressBar skill="Node.js" level={30} delay={200} />
                      <SkillProgressBar skill="ASP.NET" level={60} delay={300} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Card className="shadow-sm border-border/50">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Additional Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Databases</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            MSSQL
                          </Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            SQLite
                          </Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            MySQL
                          </Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            PostgreSQL
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Cloud & DevOps</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            GitHub
                          </Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Vercel
                          </Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Azure
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Design & UI</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Figma
                          </Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Tailwind CSS
                          </Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Framer Motion
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section
              id="projects"
              className="scroll-mt-28 opacity-0 translate-y-8 transition-all duration-700 ease-out"
              ref={(el) => {
                sectionsRef.current[3] = el
              }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-8 tracking-tight">Featured Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProjectCard
                  title="Gradiant"
                  description="Progressive Web App (PWA) that helps teachers record grades, monitor attendance, generate reports, and analyze class performance trends in real-time.
It aims to eliminate manual spreadsheet grading by providing an all-in-one platform that’s accessible on both desktop and mobile."
                  image="/gradiant-logo.png"
                  technologies={["Next.js", "TypeScript", "Supabase", "Tailwind CSS"]}
                  liveUrl="https://ecommerce-demo.vercel.app"
                  githubUrl="https://github.com/kim0chi/gradiant"
                  featured={true}
                />

                <ProjectCard
                  title="CampusFlow"
                  description="Student Enrollment System using ASP.NET Core MVC with PostgreSQL database. This is a multi-approval workflow system for managing student course enrollments with role-based access control."
                  image="/CampusFlow.png"
                  technologies={["ASP.NET Core", "C#", "Razor Pages","PostgreSQL", "JavaScript", "HTML/CSS","Azure"]}
                  liveUrl="https://campusflow-b3hfdmbhbwhecgda.southeastasia-01.azurewebsites.net"
                  githubUrl="https://github.com/kim0chi/CampusFlow"
                />

                <ProjectCard
                  title="Pulox"
                  description="Hybrid Post-ASR Error Correction and Summarization Pipeline for English–Tagalog Classroom Lecture Transcripts"
                  image="/pulox-logo.png"
                  technologies={["Electron", "OpenAI ASR", "Python", "HTML/CSS","Neural Networks","Machine Learning"]}
                  liveUrl="https://pulox.netlify.app/"
                  githubUrl="https://github.com/kim0chi/Pulox"
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 mt-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 Benedict Gio B. Illustrisimo. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Single source of truth for portfolio content.
// Sourced from Benedict Gio B. Illustrisimo's updated CV (2026).

export const profile = {
  name: "Benedict Gio B. Illustrisimo",
  handle: "kim0chi",
  title: "Full-Stack Developer / AI Engineer",
  age: 22,
  tagline: "turning curiosity into code",
  location: "Lapu-Lapu City, Cebu, Philippines",
  status: "Available for work",
  email: "illustrisimo.jikimo@gmail.com",
  phone: "09765297831",
  links: {
    github: "https://github.com/kim0chi",
    linkedin: "https://www.linkedin.com/in/gio-illustrisimo-aa9a42133/",
    site: "https://kimo-portfolio.netlify.app/",
  },
  resume: "/Benedict Gio Illustrisimo CV.pdf",
}

export type Experience = {
  role: string
  org: string
  location: string
  period: string
  current?: boolean
  bullets: string[]
  tech: string[]
}

// Internships lead (most relevant), employment after.
export const experience: Experience[] = [
  {
    role: "Production Web & Mobile App Developer Intern",
    org: "Symph Inc.",
    location: "Cebu City",
    period: "NOV 2025 — APR 2026",
    bullets: [
      "Built and maintained LessonPlannerPH, a production web app for AI-assisted lesson planning, using Next.js, TypeScript, and modern UI libraries.",
      "Shipped UI improvements, v2 product features, admin tooling, performance optimizations, and backend logic changes from design and engineering specs.",
      "Applied company standards for code structure, naming, security, and deployment workflows.",
      "Worked in real-world production codebases with collaborative development and code reviews.",
    ],
    tech: ["Next.js", "TypeScript", "React", "Production"],
  },
  {
    role: "ServiceNow Developer Intern",
    org: "Rococo Global Technologies",
    location: "Cebu City",
    period: "JAN 2025 — MAY 2025",
    bullets: [
      "Project Manager & Lead Developer for a team of 7 interns delivering a ServiceNow web-based enrollment system.",
      "Designed the data model (Students, Courses, Sections, Enrollments) and built catalog items, Flow Designer workflows, and Business Rules / Script Includes to automate registration, waitlists, and approvals.",
      "Built a Service Portal / UI Builder front end with role-based access (ACLs) for students, faculty, and admins.",
    ],
    tech: ["ServiceNow", "Flow Designer", "JavaScript", "HTML/CSS"],
  },
  {
    role: "Customer Experience Agent",
    org: "Teleperformance",
    location: "Cebu City",
    period: "JUL 2023 — NOV 2023",
    bullets: [
      "Handled individual complaints with an open mind, asking detailed questions to understand issues.",
      "Monitored customer satisfaction metrics, identified trends, and developed strategies to address areas of concern.",
    ],
    tech: ["Support", "Communication"],
  },
]

export const education = {
  degree: "B.S. Computer Science",
  school: "University of Cebu — Lapu-Lapu & Mandaue",
  period: "2022 — 2026",
  coursework: [
    "Data Structures & Algorithms",
    "App Development",
    "Relational Databases",
    "Software Engineering",
    "Compiler Design",
    "Computer Organization",
    "Assembly",
    "Natural Language Processing",
    "Machine Learning",
    "Neural Networks",
  ],
  achievements: ["Dean's Lister — 5 semesters"],
}

export const certifications = [
  "DICT-ICTB02 — Basic Level of Software Engineering",
  "11th TOPCIT Philippines — Level 2 Passer",
]

export type SkillGroup = {
  label: string
  // level is a self-rated proficiency 0-100 used for the ASCII meters.
  skills: { name: string; level: number }[]
}

export const skillGroups: SkillGroup[] = [
  {
    label: "LANGUAGES",
    skills: [
      { name: "Python", level: 85 },
      { name: "TypeScript", level: 80 },
      { name: "JavaScript", level: 80 },
      { name: "C#", level: 70 },
      { name: "Java", level: 60 },
      { name: "C", level: 55 },
    ],
  },
  {
    label: "FRAMEWORKS",
    skills: [
      { name: "React / Next.js", level: 85 },
      { name: "FastAPI", level: 80 },
      { name: "Tailwind CSS", level: 85 },
      { name: ".NET / ASP.NET", level: 65 },
    ],
  },
  {
    label: "AI & AUTOMATION",
    skills: [
      { name: "LLMs / Agentic AI", level: 80 },
      { name: "NLP", level: 75 },
      { name: "ASR (Whisper, T5, mT5)", level: 70 },
      { name: "RAG / Embeddings", level: 75 },
    ],
  },
]

// Flat skill tags shown as a marquee of capabilities.
export const skillTags = {
  Databases: ["PostgreSQL", "Supabase", "Neon.Tech", "MySQL", "SQLite"],
  Deployment: ["Vercel", "Azure", "GCP", "AWS", "DigitalOcean"],
  Tools: ["ServiceNow", "GitHub", "Linux", "Jupyter", "Machine Learning"],
}

export type Project = {
  id: string
  title: string
  tagline: string
  description: string
  tech: string[]
  image?: string
  liveUrl?: string
  githubUrl?: string
  featured?: boolean
  award?: string
  /** Lifecycle status badge, e.g. "production" for actively-productionized work. */
  status?: string
}

export const projects: Project[] = [
  {
    id: "manifesto",
    title: "Manifesto",
    tagline: "AI document intelligence — hackathon winner",
    description:
      "Led development of an AI-powered system that extracts shipment details from 100–500 page contracts and manifests. Architected a FastAPI extraction pipeline with built-in validation and self-verification for accurate structured output, plus a cost-optimized LLM profiling algorithm balancing performance against inference cost.",
    tech: ["Next.js", "FastAPI", "LLMs", "React", "Tailwind", "shadcn/ui"],
    award: "Grand Prize — OLTEK Solutions: Data Logistics Automation Challenge",
    featured: true,
    status: "production",
    githubUrl: "https://github.com/kim0chi",
  },
  {
    id: "dex",
    title: "Dex",
    tagline: "Agentic AI document intelligence",
    description:
      "An AI agent that automates document triage, preprocessing, layout analysis, component identification, classification, and structured content extraction — built on LangGraph, RAG, and vector embeddings with contextual understanding and document versioning.",
    tech: ["LangGraph", "RAG", "Vector Embeddings", "LLMs", "Python"],
    featured: true,
    status: "production",
    githubUrl: "https://github.com/kim0chi",
  },
  {
    id: "pulox",
    title: "Pulox",
    tagline: "Hybrid post-ASR correction & summarization",
    description:
      "A post-ASR error-correction and summarization pipeline for English–Tagalog classroom lecture transcripts. Combines Whisper, Wav2Vec 2.0, mT5, and T5 with inference-API LLMs (Gemini, Groq, OpenAI) for refinement, served over authenticated FastAPI endpoints.",
    tech: ["Next.js", "Python", "FastAPI", "Whisper", "Supabase", "GCP"],
    image: "/pulox-logo.png",
    liveUrl: "https://pulox-kim0chis-projects.vercel.app/",
    githubUrl: "https://github.com/kim0chi/Pulox",
  },
  {
    id: "gradiant",
    title: "Gradiant",
    tagline: "Real-time grading PWA for teachers",
    description:
      "A Progressive Web App that helps teachers record grades, monitor attendance, generate reports, and analyze class performance trends in real time — eliminating manual spreadsheet grading with one platform that works on desktop and mobile.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
    image: "/gradiant-logo.png",
    liveUrl: "https://v0-maintenance-page-design-beta.vercel.app/",
    githubUrl: "https://github.com/kim0chi/gradiant",
  },
  {
    id: "campusflow",
    title: "CampusFlow",
    tagline: "Multi-approval enrollment system",
    description:
      "A student enrollment system with a multi-approval workflow and role-based access control, built on ASP.NET Core MVC with a PostgreSQL database and deployed to Azure.",
    tech: ["ASP.NET Core", "C#", "Razor Pages", "PostgreSQL", "Azure"],
    image: "/CampusFlow.png",
    liveUrl: "https://campusflow-b3hfdmbhbwhecgda.southeastasia-01.azurewebsites.net",
    githubUrl: "https://github.com/kim0chi/CampusFlow",
  },
  {
    id: "bisaya-sentiment",
    title: "Bisaya Sentiment Analysis",
    tagline: "Cebuano NLP classifier",
    description:
      "A sentiment-analysis model for the Cebuano (Bisaya) language: scraped and gathered 20,000+ local news articles, preprocessed the text, and trained a classifier to detect positive and negative sentiment.",
    tech: ["Python", "NLP", "Machine Learning", "Web Scraping"],
    githubUrl: "https://github.com/kim0chi",
  },
]

export type Achievement = {
  id: string
  title: string
  event?: string
  result: string
  role?: string
  team?: string
  org?: string
  date?: string
  members?: string[]
  description: string
  image?: string
}

export const achievements: Achievement[] = [
  {
    id: "oltek",
    title: "OLTEK Solutions — Data: Logistics Automation Challenge",
    event: "Pro Paper Tech Competition",
    result: "Grand Prize Champion · ₱50,000",
    role: "Lead Developer",
    team: "AGENTX44",
    date: "March 2026",
    description:
      "As lead developer of team AGENTX44, I designed and built our solution end-to-end — a pipeline that turns dense logistics documents into clean, structured, business-ready data (productized as Manifesto). Beyond the technical win, it sharpened my leadership, collaboration, and problem-solving under pressure. A memorable milestone that keeps me building solutions that matter — and one I couldn't have reached without the whole team's ideas, time, and effort.",
    image: "/Oltek-web.webp",
  },
  {
    id: "lambo-2026",
    title: "LAMBO 2026 — AI-Powered Business Case Competition",
    event: "Cebu's AI Business Summit",
    result: "Top 10 · Semifinalist (Wildcard) — of 30 teams",
    role: "Data Analyst & Lead Developer",
    team: "SiXeven",
    org: "Representing University of Cebu — Lapu-Lapu & Mandaue Campus",
    date: "2026",
    members: [
      "Benedict Gio B. Illustrisimo",
      "Nathanael L. Larida",
      "Matt Alexius Y. Merano",
      "Raj Efpi O. Tag-at",
    ],
    description:
      "Representing UC Lapu-Lapu & Mandaue as team SiXeven, we advanced to the Semifinals (Top 10, Wildcard) out of 30 teams drawn from Cebu's top schools and competitors. Round after round we designed and pitched AI-powered business solutions case by case — each grounded in the realities of Filipino businesses: local market dynamics, operating constraints, data availability, and SME-friendly budgets, so every recommendation was practical and adoptable, not just technically impressive.",
    image: "/Lambo-web.webp",
  },
]

import { AudioLines, Brain, Cloud, Code2, Workflow, type LucideIcon } from "lucide-react"
import { TECH_ICONS } from "@/lib/tech-icons"

// Names without a Simple Icons logo get a plain icon for what they are, so every row lines up.
const GENERIC: [RegExp, LucideIcon][] = [
  [/AWS|Azure/, Cloud],
  [/ServiceNow|Flow Designer|automation|Automation/, Workflow],
  [/ASR|Whisper|T5/, AudioLines],
  [/LLM|Agentic|RAG|Embedding|NLP|Machine Learning|AI/, Brain],
]

function Icon({ name }: { name: string }) {
  const path = TECH_ICONS[name]
  if (path) {
    return (
      <svg className="tech-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d={path} />
      </svg>
    )
  }
  const Generic = GENERIC.find(([pattern]) => pattern.test(name))?.[1] ?? Code2
  return <Generic className="tech-icon" aria-hidden="true" strokeWidth={1.8} />
}

/** A row of tech names, each with its logo (in the current text colour). */
export function TechList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={("tech-list " + className).trim()}>
      {items.map((name) => (
        <li key={name}>
          <Icon name={name} />
          {name}
        </li>
      ))}
    </ul>
  )
}

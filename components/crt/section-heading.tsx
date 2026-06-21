// Terminal-style section heading: > cat <command>
export function SectionHeading({ command, title }: { command: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="font-terminal text-primary text-glow text-base">
        <span className="opacity-70">user@illustrisimo-os:~$</span> {command}
      </p>
      <h2 className="font-display text-2xl sm:text-4xl text-foreground text-glow tracking-wide mt-1">{title}</h2>
      <div className="mt-2 h-px w-full bg-gradient-to-r from-primary/60 via-border to-transparent" />
    </div>
  )
}

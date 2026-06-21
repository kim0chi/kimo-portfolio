import { ASCII_FRAME } from "@/lib/portrait-frames"

// Dim, full-bleed ASCII portrait used as the ambient page background, plus a
// soft phosphor spotlight that follows the cursor (driven by --mx/--my).
export function AsciiBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <pre className="ascii-bg m-0 font-mono leading-none text-primary whitespace-pre select-none">
        {ASCII_FRAME.join("\n")}
      </pre>
      <div className="ascii-spotlight" />
    </div>
  )
}

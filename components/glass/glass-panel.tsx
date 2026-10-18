import type { ComponentPropsWithRef, ElementType } from "react"

type GlassTag = "section" | "div" | "figure" | "footer" | "header" | "article" | "nav"

type GlassPanelProps<T extends GlassTag> = {
  as?: T
  /** "panel" takes day or dusk glass from where it sits on the page; "nav" and "float" stay light. */
  kind?: "panel" | "nav" | "float"
  /** Rise into place the first time it scrolls into view. */
  reveal?: boolean
} & ComponentPropsWithRef<T>

/**
 * A glass surface. The two hidden layers are the cursor's reflection (a specular spot and a
 * rim that brightens on the edge facing the pointer); GlassScene moves them with transform
 * and opacity only. Never wrap glass in an element with opacity, filter or mask: that cuts
 * the glass off from the painting behind it.
 */
export function GlassPanel<T extends GlassTag = "div">({
  as,
  kind = "panel",
  reveal = false,
  className,
  children,
  ...rest
}: GlassPanelProps<T>) {
  const Tag = (as ?? "div") as ElementType
  return (
    <Tag {...rest} className={["glass", reveal && "reveal", className].filter(Boolean).join(" ")} data-glass={kind}>
      <span className="glass-light" aria-hidden="true">
        <span className="glass-spec" />
      </span>
      <span className="glass-rim" aria-hidden="true" />
      {children}
    </Tag>
  )
}

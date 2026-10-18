"use client"

// Brings an element up as if through water: an SVG ripple filter displaces it strongly at first and
// settles to nothing while it fades in, then the filter is removed so the text is crisp (and free).
// The intro uses it for the hero as the rings from the painting reach the name.

const FILTER_ID = "surface-ripple"
const SVG_NS = "http://www.w3.org/2000/svg"
export const SURFACE_REVEAL_MS = 1400
// how far (px) the ripples push the text at first, and how far the water drifts as it settles
const START_DISPLACEMENT = 34
const DRIFT = 36

function waterFilter() {
  const existing = document.getElementById(FILTER_ID)
  if (existing) {
    return {
      offset: existing.querySelector("feOffset") as SVGFEOffsetElement,
      displace: existing.querySelector("feDisplacementMap") as SVGFEDisplacementMapElement,
    }
  }
  const svg = document.createElementNS(SVG_NS, "svg")
  svg.setAttribute("aria-hidden", "true")
  svg.setAttribute("width", "0")
  svg.setAttribute("height", "0")
  svg.style.position = "absolute"
  // wide, low ripples: noise stretched sideways like wind on a pond
  svg.innerHTML = `<filter id="${FILTER_ID}" x="-10%" y="-25%" width="120%" height="150%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.006 0.04" numOctaves="2" seed="7" result="water" />
    <feOffset in="water" dx="0" dy="0" result="flow" />
    <feDisplacementMap in="SourceGraphic" in2="flow" scale="0" xChannelSelector="R" yChannelSelector="G" />
  </filter>`
  document.body.appendChild(svg)
  const filter = svg.querySelector("filter") as SVGFilterElement
  return {
    offset: filter.querySelector("feOffset") as SVGFEOffsetElement,
    displace: filter.querySelector("feDisplacementMap") as SVGFEDisplacementMapElement,
  }
}

/** Surfaces the element through rippling water; returns a function that ends it at once. */
export function surfaceReveal(element: HTMLElement, duration = SURFACE_REVEAL_MS) {
  const { offset, displace } = waterFilter()
  const start = performance.now()
  let frame = 0

  const finish = () => {
    cancelAnimationFrame(frame)
    element.style.removeProperty("filter")
    element.style.removeProperty("opacity")
  }

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const calm = 1 - Math.pow(1 - t, 3)
    displace.setAttribute("scale", ((1 - calm) * START_DISPLACEMENT).toFixed(2))
    offset.setAttribute("dx", (calm * DRIFT).toFixed(1))
    // fully visible a little past halfway, while the last ripples settle
    element.style.opacity = String(Math.min(1, 0.001 + t / 0.55))
    if (t < 1) frame = requestAnimationFrame(step)
    else finish()
  }

  element.style.filter = `url(#${FILTER_ID})`
  frame = requestAnimationFrame(step)
  return finish
}

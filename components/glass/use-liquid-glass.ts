"use client"

import { useEffect, useId, type RefObject } from "react"

const SVG_NS = "http://www.w3.org/2000/svg"
// How far (px) the rim bends the painting, and how wide the bending band is.
const BEND = 46
const MAX_BEZEL = 36

/**
 * A displacement map the size of the element: pixels near the rounded edge are pushed
 * along the edge normal, like light bending through a thick glass rim. The middle stays flat.
 */
function displacementMap(width: number, height: number, radius: number, bezel: number) {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) return null
  const image = context.createImageData(width, height)
  const data = image.data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // signed distance to a rounded rectangle and its outward normal
      const qx = Math.abs(x + 0.5 - width / 2) - (width / 2 - radius)
      const qy = Math.abs(y + 0.5 - height / 2) - (height / 2 - radius)
      const ox = Math.max(qx, 0)
      const oy = Math.max(qy, 0)
      const outside = Math.hypot(ox, oy)
      const inside = radius - (outside + Math.min(Math.max(qx, qy), 0))
      let nx = 0
      let ny = 0
      if (outside > 0) {
        nx = ox / outside
        ny = oy / outside
      } else if (qx > qy) nx = 1
      else ny = 1
      nx *= Math.sign(x + 0.5 - width / 2)
      ny *= Math.sign(y + 0.5 - height / 2)
      // convex profile: strongest bend right at the rim, flat inside the bezel
      const strength = Math.pow(1 - Math.min(1, Math.max(0, inside / bezel)), 2.2)
      const i = (y * width + x) * 4
      data[i] = 128 - nx * strength * 127
      data[i + 1] = 128 - ny * strength * 127
      data[i + 2] = 128
      data[i + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

// backdrop-filter with an SVG url() only renders in Chromium; other browsers keep frosted glass.
function supportsRefraction() {
  return "chrome" in window && CSS.supports("backdrop-filter", "url(#x)")
}

/** Adds Liquid Glass refraction to one small element (the nav pill). */
export function useLiquidGlass(ref: RefObject<HTMLElement | null>) {
  const filterId = "liquid-" + useId().replace(/:/g, "")

  useEffect(() => {
    const element = ref.current
    if (!element || !supportsRefraction()) return

    const svg = document.createElementNS(SVG_NS, "svg")
    svg.setAttribute("aria-hidden", "true")
    svg.setAttribute("width", "0")
    svg.setAttribute("height", "0")
    svg.style.position = "absolute"
    const filter = document.createElementNS(SVG_NS, "filter")
    filter.id = filterId
    filter.setAttribute("filterUnits", "userSpaceOnUse")
    filter.setAttribute("color-interpolation-filters", "sRGB")
    const map = document.createElementNS(SVG_NS, "feImage")
    map.setAttribute("result", "map")
    const displace = document.createElementNS(SVG_NS, "feDisplacementMap")
    displace.setAttribute("in", "SourceGraphic")
    displace.setAttribute("in2", "map")
    displace.setAttribute("scale", String(BEND))
    displace.setAttribute("xChannelSelector", "R")
    displace.setAttribute("yChannelSelector", "G")
    filter.append(map, displace)
    svg.appendChild(filter)
    document.body.appendChild(svg)

    const rebuild = () => {
      const width = Math.round(element.offsetWidth)
      const height = Math.round(element.offsetHeight)
      if (!width || !height) return
      const radius = Math.min(height / 2, parseFloat(getComputedStyle(element).borderTopLeftRadius) || 24)
      const url = displacementMap(width, height, radius, Math.min(MAX_BEZEL, radius * 1.4))
      if (!url) return
      for (const [name, value] of [["x", "0"], ["y", "0"], ["width", String(width)], ["height", String(height)]]) {
        filter.setAttribute(name, value)
        map.setAttribute(name, value)
      }
      map.setAttribute("href", url)
      element.style.setProperty("--liquid-filter", `url(#${filterId})`)
      element.classList.add("liquid-ready")
    }

    rebuild()
    const observer = new ResizeObserver(rebuild)
    observer.observe(element)

    return () => {
      observer.disconnect()
      svg.remove()
      element.classList.remove("liquid-ready")
      element.style.removeProperty("--liquid-filter")
    }
  }, [ref, filterId])
}

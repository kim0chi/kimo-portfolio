"use client"

import React, { useEffect, useRef } from "react"
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl"

interface ParticlesProps {
  particleCount?: number
  particleSpread?: number
  speed?: number
  particleColors?: string[]
  moveParticlesOnHover?: boolean
  particleHoverFactor?: number
  alphaParticles?: boolean
  particleBaseSize?: number
  sizeRandomness?: number
  cameraDistance?: number
  disableRotation?: boolean
  className?: string
}

const defaultColors: string[] = ["#007aff", "#0a84ff", "#5ac8fa"]

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [1, 1, 1]
}

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec3 random;
  attribute vec3 color;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSize;
  uniform float uSpeed;
  uniform vec2 uMouse;
  uniform float uHoverFactor;
  uniform bool uMoveOnHover;

  varying vec3 vColor;

  void main() {
    vColor = color;

    vec3 pos = position;

    // Gentle floating animation
    pos.x += sin(uTime * uSpeed + random.x * 10.0) * random.x * 0.5;
    pos.y += cos(uTime * uSpeed + random.y * 10.0) * random.y * 0.5;
    pos.z += sin(uTime * uSpeed + random.z * 10.0) * random.z * 0.5;

    // Mouse interaction
    if (uMoveOnHover) {
      vec2 mouseInfluence = (uMouse - pos.xy) * uHoverFactor * 0.1;
      pos.xy += mouseInfluence * random.xy;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * random.z * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragment = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  uniform bool uAlpha;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float dist = length(uv - 0.5);

    if (dist > 0.5) discard;

    float alpha = uAlpha ? (1.0 - dist * 2.0) : 1.0;
    gl_FragColor = vec4(vColor, alpha * 0.8);
  }
`

export function Particles({
  particleCount = 150,
  particleSpread = 15,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = true,
  particleHoverFactor = 1,
  alphaParticles = true,
  particleBaseSize = 80,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  className = "",
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const colors = particleColors || defaultColors
    const rgbColors = colors.map(hexToRgb)

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas')
      const testGl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!testGl) {
        console.warn('WebGL not supported')
        return
      }
    } catch (e) {
      console.warn('WebGL initialization failed:', e)
      return
    }

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)

    // Style canvas explicitly
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.display = 'block'

    containerRef.current.appendChild(gl.canvas)

    const camera = new Camera(gl, { fov: 45 })
    camera.position.set(0, 0, cameraDistance)

    const resize = () => {
      if (!containerRef.current) return
      renderer.setSize(containerRef.current.offsetWidth, containerRef.current.offsetHeight)
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height })
    }
    window.addEventListener("resize", resize, false)
    resize()

    // Create particle data
    const numParticles = particleCount
    const position = new Float32Array(numParticles * 3)
    const random = new Float32Array(numParticles * 3)
    const color = new Float32Array(numParticles * 3)

    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3

      // Random position
      position[i3 + 0] = (Math.random() - 0.5) * particleSpread
      position[i3 + 1] = (Math.random() - 0.5) * particleSpread
      position[i3 + 2] = (Math.random() - 0.5) * particleSpread

      // Random values for animation
      random[i3 + 0] = Math.random()
      random[i3 + 1] = Math.random()
      random[i3 + 2] = Math.random() * sizeRandomness + (1 - sizeRandomness)

      // Random color from palette
      const colorIndex = Math.floor(Math.random() * rgbColors.length)
      const selectedColor = rgbColors[colorIndex]
      color[i3 + 0] = selectedColor[0]
      color[i3 + 1] = selectedColor[1]
      color[i3 + 2] = selectedColor[2]
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: position },
      random: { size: 3, data: random },
      color: { size: 3, data: color },
    })

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: particleBaseSize },
        uSpeed: { value: speed },
        uMouse: { value: [0, 0] },
        uHoverFactor: { value: particleHoverFactor },
        uMoveOnHover: { value: moveParticlesOnHover },
        uAlpha: { value: alphaParticles },
      },
      transparent: true,
      depthTest: false,
    })

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program })

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    if (moveParticlesOnHover) {
      window.addEventListener("mousemove", handleMouseMove)
    }

    // Animation loop
    let animationId: number
    const animate = (t: number) => {
      animationId = requestAnimationFrame(animate)

      program.uniforms.uTime.value = t * 0.001
      program.uniforms.uMouse.value = [mouseRef.current.x * particleSpread * 0.5, mouseRef.current.y * particleSpread * 0.5]

      if (!disableRotation) {
        particles.rotation.y += 0.001
        particles.rotation.x += 0.0005
      }

      renderer.render({ scene: particles, camera })
    }

    animationId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
      if (moveParticlesOnHover) {
        window.removeEventListener("mousemove", handleMouseMove)
      }
      geometry.remove()
      program.remove()
      renderer.gl.canvas.remove()
    }
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColors,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
  ])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{
        pointerEvents: "none",
        width: "100%",
        height: "100%"
      }}
    />
  )
}

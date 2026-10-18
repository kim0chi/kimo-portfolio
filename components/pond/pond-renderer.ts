// WebGL2 renderer for the moving Monet background, dithered in each painting's own colours.
//
// Three passes:
//   field  — one pixel per 2 px dither cell: the drifting painting, the wash from one painting to
//            another, the intro's ripples, reduced to the painting's eight colours with an 8×8 Bayer
//            pattern, then lit from cool morning (top of the page) to warm evening (bottom)
//   room   — the intro only: an Orangerie-style oval room that turns past every painting, drawn at a
//            capped resolution
//   final  — enlarges the cells crisply to the screen and, during the intro, fades the room away as
//            the wall unrolls into the dithered background
// The expensive work happens once per cell, so the background costs little even at full screen resolution.

import { paintings } from "@/lib/paintings"

const COUNT = paintings.length

const VERTEX = `#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`

const COMMON = `#version 300 es
precision highp float;
uniform sampler2D u_tex0, u_tex1, u_tex2, u_tex3, u_tex4, u_tex5;
uniform vec2 u_size[6];
uniform vec2 u_screen, u_pointer; // u_screen: the canvas size in pixels
uniform float u_time, u_light;
uniform int u_octaves; // 5 normally, 3 on slower devices
out vec4 outColor;
#define PI 3.14159265

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (i >= u_octaves) break;
    v += a * noise(p); p = p * 2.02 + 17.3; a *= 0.5;
  }
  return v;
}
float easeOut(float x) { return 1.0 - pow(1.0 - x, 3.0); }
float easeInOut(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }
vec3 paint(int i, vec2 uv, float lod) {
  uv = 1.0 - abs(mod(uv, 2.0) - 1.0); // mirror outside the canvas so wide views never streak
  if (i == 0) return textureLod(u_tex0, uv, lod).rgb;
  if (i == 1) return textureLod(u_tex1, uv, lod).rgb;
  if (i == 2) return textureLod(u_tex2, uv, lod).rgb;
  if (i == 3) return textureLod(u_tex3, uv, lod).rgb;
  if (i == 4) return textureLod(u_tex4, uv, lod).rgb;
  return textureLod(u_tex5, uv, lod).rgb;
}
// fit painting i into a box of the given aspect (cover); uv is 0..1 across that box
vec2 coverIn(int i, vec2 uv, float boxAspect) {
  float ri = u_size[i].x / u_size[i].y;
  vec2 s = boxAspect > ri ? vec2(1.0, ri / boxAspect) : vec2(boxAspect / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}
// the water's drift: slow noise stretched vertically, because the pond moves mostly sideways
vec2 drift(vec2 base) {
  float t = u_time;
  vec2 n = base * vec2(2.2, 6.0);
  float q = fbm(n + vec2(t * 0.045, t * 0.012));
  float r = fbm(n + q * 1.7 + vec2(-t * 0.03, t * 0.02));
  return (vec2(q, r * 0.45) - vec2(0.5, 0.22)) * 0.03 + (u_pointer - 0.5) * 0.004;
}
// screen uv (0..1, y down) → painting i as the background: cover, a little zoom for the drift to move
// in, slow pan, and scroll parallax (the painting sits deeper than the page). The CSS still image
// (.pond-still) uses the same zoom.
vec2 backgroundUV(int i, vec2 uv) {
  vec2 base = coverIn(i, uv, u_screen.x / u_screen.y);
  base = (base - 0.5) / 1.08 + 0.5 + vec2(sin(u_time * 0.021), cos(u_time * 0.017)) * 0.012;
  base.y += (u_light - 0.5) * 0.05;
  return base;
}
// time of day: 0 = cool morning haze, 0.5 = as painted, 1 = violet dusk with rose-gold highlights
vec3 timeOfDay(vec3 col) {
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 morning = mix(col, vec3(luma), 0.18) * vec3(0.97, 1.01, 1.06) + 0.05;
  vec3 evening = col * mix(vec3(0.80, 0.74, 1.0), vec3(1.2, 0.98, 0.8), smoothstep(0.25, 0.8, luma));
  evening = mix(vec3(dot(evening, vec3(0.299, 0.587, 0.114))), evening, 1.15) * 0.93;
  return u_light < 0.5 ? mix(morning, col, u_light * 2.0) : mix(col, evening, (u_light - 0.5) * 2.0);
}
`

// One pixel per dither cell. A new painting washes in along a soft, noisy front, cell by cell, each
// painting in its own palette; the cells along the front catch a little light, like a wet edge.
const FIELD = COMMON + `
uniform int u_from, u_to;
uniform float u_mix, u_cell;       // u_cell: canvas pixels per cell
uniform vec3 u_paletteFrom[8], u_paletteTo[8];
uniform vec3 u_ripple;             // the intro's rings: origin (screen uv) and progress (0 = none)
const float BAYER[64] = float[64](
  0.0,32.0,8.0,40.0,2.0,34.0,10.0,42.0, 48.0,16.0,56.0,24.0,50.0,18.0,58.0,26.0,
  12.0,44.0,4.0,36.0,14.0,46.0,6.0,38.0, 60.0,28.0,52.0,20.0,62.0,30.0,54.0,22.0,
  3.0,35.0,11.0,43.0,1.0,33.0,9.0,41.0, 51.0,19.0,59.0,27.0,49.0,17.0,57.0,25.0,
  15.0,47.0,7.0,39.0,13.0,45.0,5.0,37.0, 63.0,31.0,55.0,23.0,61.0,29.0,53.0,21.0);
// how far the threshold nudges colours before snapping to the palette (scripts/colourways.py uses the same)
const float SPREAD = 0.22;
vec3 nearest(vec3 c, bool to) {
  vec3 best = vec3(0.0); float bestDistance = 1e9;
  for (int i = 0; i < 8; i++) {
    vec3 p = to ? u_paletteTo[i] : u_paletteFrom[i];
    vec3 d = c - p; float dd = dot(d, d);
    if (dd < bestDistance) { bestDistance = dd; best = p; }
  }
  return best;
}
void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 uv = (cell + 0.5) * u_cell / u_screen;
  uv.y = 1.0 - uv.y;
  float aspect = u_screen.x / u_screen.y;
  // the intro's rings, spreading from where the name surfaces
  float rt = u_ripple.z;
  vec2 d = (uv - u_ripple.xy) * vec2(aspect, 1.0);
  float r = length(d);
  float ring = r - rt * 1.5;
  float wave = rt > 0.0 ? sin(ring * 42.0) * exp(-abs(ring) * 7.0) * (1.0 - rt) * smoothstep(0.0, 0.06, rt) : 0.0;
  vec2 ripple = d / max(r, 1e-4) * wave * vec2(0.018 / aspect, 0.018);
  // which painting this cell shows during a wash
  float n = fbm(uv * vec2(2.4, 1.8) + 3.7) * 0.85 + (1.0 - uv.x) * 0.15;
  float front = u_mix * 1.3 - 0.15;
  bool to = n < front;
  int painting = to ? u_to : u_from;
  vec2 base = backgroundUV(painting, uv);
  // the drift, plus a slow swell that makes the dots crawl as the water moves
  vec2 off = drift(base) + vec2(0.0, (fbm(base * 3.0 + u_time * 0.08) - 0.5) * 0.02) + ripple;
  vec3 c = paint(painting, base + off, 0.6);
  // near the cursor the pattern calms into a clearer pool
  vec2 toPointer = (uv - u_pointer) * vec2(aspect, 1.0);
  float pool = exp(-dot(toPointer, toPointer) / 0.012);
  float threshold = (BAYER[int(mod(cell.y, 8.0)) * 8 + int(mod(cell.x, 8.0))] + 0.5) / 64.0 - 0.5;
  vec3 col = nearest(c + threshold * SPREAD * (1.0 - pool * 0.8), to);
  float wet = exp(-pow((n - front) / 0.02, 2.0)) * step(0.001, u_mix) * step(u_mix, 0.999);
  col = timeOfDay(col) + wet * 0.06 + max(wave, 0.0) * 0.08;
  outColor = vec4(col, 1.0);
}`

// The intro's room. The paintings hang as panels around an oval room under a skylight; the room turns
// past them (they blur while it's fast) and stops facing the chosen one.
const ROOM = COMMON + `
uniform int u_current;
uniform float u_progress;
const float R = 2.4, HW = 1.0, TAN = 0.6;
float seg(float a, float b) { return clamp((u_progress - a) / (b - a), 0.0, 1.0); }
float panelArc() { return 2.0 * PI / float(${COUNT}); }
// starts a few panels away and slows to a stop facing the chosen painting
float yaw() { return (float(${COUNT}) - 1.0 + 0.35) * panelArc() * pow(1.0 - seg(0.0, 0.62), 4.0); }
vec3 wall(vec3 rd, float yawNow, float blur, vec2 off) {
  vec3 h = rd * sqrt(R * R / dot(rd.xz, rd.xz));
  float arc = panelArc();
  float theta = atan(h.x, -h.z) + yawNow;
  float k = floor(theta / arc + 0.5);
  float local = theta / arc - k + 0.5; // 0..1 across this panel
  int idx = int(mod(float(u_current) + mod(k, float(${COUNT})) + float(${COUNT}), float(${COUNT})));
  float aspect = arc * R * 0.88 / (2.0 * HW);
  vec2 uv = coverIn(idx, vec2((local - 0.06) / 0.88, 0.5 - h.y / (2.0 * HW)), aspect);
  vec3 col = paint(idx, uv + off, blur);
  // gaps between panels, the velum skylight above, pale stone below
  float gap = 1.0 - smoothstep(0.0, 0.012, local - 0.06) * smoothstep(0.0, 0.012, 0.94 - local);
  float above = smoothstep(HW, HW + 0.02, h.y), below = smoothstep(-HW, -HW - 0.02, h.y);
  col = mix(col, vec3(0.93, 0.92, 0.89), gap);
  col = mix(col, mix(vec3(0.96, 0.955, 0.93), vec3(0.99, 0.985, 0.96), smoothstep(HW, HW + 0.9, h.y)), above);
  col = mix(col, vec3(0.86, 0.84, 0.8) - 0.06 * smoothstep(-HW, -HW - 0.6, h.y), below);
  return col * (1.0 - 0.3 * smoothstep(0.03, 0.0, abs(abs(h.y) - HW)));
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_screen;
  uv.y = 1.0 - uv.y;
  vec2 ndc = vec2(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);
  vec3 rd = normalize(vec3(ndc * vec2(TAN * u_screen.x / u_screen.y, TAN), -1.0));
  vec2 off = drift(uv);
  // skimming: the faster the room turns, the more the panels smear sideways
  float speed = pow(1.0 - seg(0.0, 0.62), 3.0);
  float y = yaw();
  vec3 room = u_octaves < 5
    ? wall(rd, y, speed * 3.0, off)
    : (wall(rd, y - speed * 0.035, speed * 2.0, off) + wall(rd, y, speed * 2.0, off) + wall(rd, y + speed * 0.035, speed * 2.0, off)) / 3.0;
  // morning haze as it opens
  room = mix(room, vec3(0.945, 0.952, 0.94), (1.0 - easeOut(seg(0.0, 0.3))) * 0.75);
  outColor = vec4(timeOfDay(room), 1.0);
}`

// Enlarges each cell to a crisp block and, during the intro, fades the room away over it.
const FINAL = `#version 300 es
precision highp float;
uniform sampler2D u_field, u_room;
uniform vec2 u_canvas;
uniform float u_cell, u_roomAlpha;
out vec4 outColor;
void main() {
  vec3 col = texelFetch(u_field, ivec2(gl_FragCoord.xy / u_cell), 0).rgb;
  if (u_roomAlpha > 0.0) col = mix(col, texture(u_room, gl_FragCoord.xy / u_canvas).rgb, u_roomAlpha);
  outColor = vec4(col, 1.0);
}`

// A cell is a solid 2×2 CSS-pixel block, so on whole-number screens (1×, 2×, 3×) the canvas draws one
// pixel per CSS pixel and CSS (image-rendering: pixelated) enlarges it exactly: crisp cells at a quarter
// of the pixels a 2× canvas would cost, which matters because the glass re-blurs it while scrolling.
// Fractional screens (1.25×, 1.5×) draw at their own resolution, up to 2×, so cells stay even.
// The room is softer anyway, so it's capped.
const MAX_PIXEL_RATIO = 2
const ROOM_MAX_PIXELS = 2_100_000
function canvasRatio() {
  const dpr = window.devicePixelRatio || 1
  return Math.abs(dpr - Math.round(dpr)) < 0.01 ? 1 : Math.min(dpr, MAX_PIXEL_RATIO)
}
// dither cell size in CSS pixels
const CELL_CSS = 2
const SWITCH_MS = 1600
// Adaptive resolution: if drawn frames keep arriving this much later than planned for this long, render
// smaller. Measured in time, not frames, so a very slow device (a few fps) reacts as quickly as a mildly slow one.
const SLOW_FACTOR = 1.6
const SLOW_FOR_MS = 1200
const SETTLE_MS = 600
const MIN_SCALE = 0.5
const INTRO_MS = 3600
const SKIP_MS = 300
// intro moments, as fractions of its length
const CAPTIONS_UNTIL = 0.7
// the wall unrolls into the dithered background between these points
const UNROLL_FROM = 0.58
const UNROLL_TO = 0.9
// the rings start as the wall unrolls; the name surfaces with them
const RINGS_FROM = 0.7
const TITLE_AT = 0.72
const CONDENSE_AT = 0.86

export type IntroEvents = {
  /** the painting the room is facing while it turns, or null once the titles should go */
  onCaption: (index: number | null) => void
  /** the name comes up */
  onTitle: () => void
  /** the hero glass condenses under the name */
  onCondense: () => void
  onDone: () => void
}

export type PondRenderer = {
  setPaused: (paused: boolean) => void
  /** Uploads a painting. */
  setImage: (index: number, image: HTMLImageElement) => void
  /** Washes from the painting on screen to another. */
  showPainting: (index: number) => void
  /** origin: where the name surfaces, in screen uv (0..1, y down) */
  playIntro: (events: IntroEvents, origin: [number, number]) => void
  skipIntro: () => void
  stop: () => void
}

/** How hard the renderer works; slower devices start lower (components/pond/pond-background). */
export type PondQuality = {
  /** render resolution, relative to the screen's */
  scale: number
  /** noise detail in the water */
  octaves: 3 | 5
  /** background frame rate (the intro runs at the display's rate) */
  fps: number
}

type PondOptions = {
  current: number
  quality: PondQuality
  onFirstFrame: () => void
  onContextLost: () => void
  /** frames are still slow at the lowest resolution: the page should do less elsewhere */
  onStruggle: () => void
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

function link(gl: WebGL2RenderingContext, vertex: WebGLShader, fragmentSource: string) {
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null
}

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
const PALETTES = paintings.map((painting) => new Float32Array(painting.dither.flatMap(hexToRgb)))

/** Returns null when WebGL2 is unavailable, so the caller keeps the still image. */
export function startPond(canvas: HTMLCanvasElement, options: PondOptions): PondRenderer | null {
  const context = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" })
  if (!context) return null
  const gl: WebGL2RenderingContext = context

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
  if (!vertex) return null
  const fieldProgram = link(gl, vertex, FIELD)
  const roomProgram = link(gl, vertex, ROOM)
  const finalProgram = link(gl, vertex, FINAL)
  if (!fieldProgram || !roomProgram || !finalProgram) return null
  const programs = { field: fieldProgram, room: roomProgram, final: finalProgram }

  // one triangle that covers the screen
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  // texture units 0–5: one per painting; a grey pixel stands in until the image arrives
  const sizes = new Float32Array(COUNT * 2).fill(1)
  for (let i = 0; i < COUNT; i++) {
    gl.activeTexture(gl.TEXTURE0 + i)
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([143, 169, 176]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  }

  // render targets: the cell field (unit 6) and the intro's room (unit 7)
  function target(unit: number, filter: number) {
    const texture = gl.createTexture()
    const framebuffer = gl.createFramebuffer()
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const size = { width: 1, height: 1 }
    return {
      size,
      resize(width: number, height: number) {
        size.width = width
        size.height = height
        gl.activeTexture(gl.TEXTURE0 + unit)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      },
      bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
        gl.viewport(0, 0, size.width, size.height)
      },
    }
  }
  const FIELD_UNIT = 6
  const ROOM_UNIT = 7
  const field = target(FIELD_UNIT, gl.NEAREST)
  const room = target(ROOM_UNIT, gl.LINEAR)

  const finePointer = window.matchMedia("(pointer: fine)").matches
  const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 }
  const wash = { from: options.current, to: options.current, start: 0 }
  let intro: (IntroEvents & { origin: [number, number]; start: number; skipAt: number; skipFrom: number; caption: number | null; titled: boolean; condensed: boolean }) | null = null
  let scale = options.quality.scale
  let frameMs = 1000 / options.quality.fps
  // average: smoothed gap between drawn frames · since: when it went slow · settleUntil: ignore frames until then
  const slow = { average: 0, since: 0, settleUntil: 0, struggled: false }
  let cell = CELL_CSS
  let time = 0
  let light = scrollProgress()
  let frame = 0
  let lastTick = performance.now()
  let lastDraw = 0
  let paused = false
  let firstFrame = true
  const now = () => performance.now()

  function scrollProgress() {
    const range = document.documentElement.scrollHeight - window.innerHeight
    return range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0
  }

  function resize() {
    const ratio = canvasRatio() * scale
    canvas.width = Math.max(1, Math.round(window.innerWidth * ratio))
    canvas.height = Math.max(1, Math.round(window.innerHeight * ratio))
    // whole canvas pixels per cell, so every cell is the same size; a device that has had to scale down
    // also gets slightly larger cells (at least 2 canvas pixels), which cuts the work by about four
    cell = Math.max(scale < 1 ? 2 : 1, Math.round(CELL_CSS * ratio))
    field.resize(Math.ceil(canvas.width / cell), Math.ceil(canvas.height / cell))
    const roomFit = Math.min(1, Math.sqrt(ROOM_MAX_PIXELS / (canvas.width * canvas.height)))
    room.resize(Math.round(canvas.width * roomFit), Math.round(canvas.height * roomFit))
  }

  function useProgram(program: WebGLProgram, width: number, height: number) {
    gl.useProgram(program)
    const position = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const uniform = (name: string) => gl.getUniformLocation(program, name)
    for (let i = 0; i < COUNT; i++) gl.uniform1i(uniform(`u_tex${i}`), i)
    gl.uniform2fv(uniform("u_size"), sizes)
    gl.uniform2f(uniform("u_screen"), width, height)
    gl.uniform2f(uniform("u_pointer"), pointer.x, pointer.y)
    gl.uniform1f(uniform("u_time"), time)
    gl.uniform1f(uniform("u_light"), light)
    gl.uniform1i(uniform("u_octaves"), options.quality.octaves)
    return uniform
  }

  // which painting the turning room faces, mirroring yaw() in the shader
  function facing(progress: number) {
    const arc = (2 * Math.PI) / COUNT
    const yaw = (COUNT - 1 + 0.35) * arc * Math.pow(1 - Math.min(1, progress / 0.62), 4)
    return (wash.to + (((Math.round(yaw / arc) % COUNT) + COUNT) % COUNT)) % COUNT
  }

  const segment = (value: number, from: number, to: number) => Math.min(1, Math.max(0, (value - from) / (to - from)))
  const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

  function draw(dt: number, at: number) {
    // ease toward the scroll position so the light glides instead of jumping
    light += (scrollProgress() - light) * Math.min(1, dt * 3)
    pointer.x += (pointer.targetX - pointer.x) * Math.min(1, dt * 2)
    pointer.y += (pointer.targetY - pointer.y) * Math.min(1, dt * 2)

    let progress = 1
    if (intro) {
      progress = (at - intro.start) / INTRO_MS
      if (intro.skipAt) progress = intro.skipFrom + (1 - intro.skipFrom) * Math.min(1, (at - intro.skipAt) / SKIP_MS)
      progress = Math.min(1, progress)
    }
    const roomAlpha = intro ? 1 - easeInOut(segment(progress, UNROLL_FROM, UNROLL_TO)) : 0

    // 1. the dithered field, one pixel per cell
    field.bind()
    let uniform = useProgram(programs.field, canvas.width, canvas.height)
    gl.uniform1i(uniform("u_from"), wash.from)
    gl.uniform1i(uniform("u_to"), wash.to)
    gl.uniform1f(uniform("u_mix"), Math.min(1, (at - wash.start) / SWITCH_MS))
    gl.uniform1f(uniform("u_cell"), cell)
    gl.uniform3fv(uniform("u_paletteFrom"), PALETTES[wash.from])
    gl.uniform3fv(uniform("u_paletteTo"), PALETTES[wash.to])
    const rings = intro ? segment(progress, RINGS_FROM, 1) : 0
    gl.uniform3f(uniform("u_ripple"), intro?.origin[0] ?? 0, intro?.origin[1] ?? 0, rings > 0 && rings < 1 ? rings : 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    // 2. the intro's room, while it's still showing
    if (roomAlpha > 0) {
      room.bind()
      uniform = useProgram(programs.room, room.size.width, room.size.height)
      gl.uniform1i(uniform("u_current"), wash.to)
      gl.uniform1f(uniform("u_progress"), progress)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // 3. to the screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(programs.final)
    const position = gl.getAttribLocation(programs.final, "a_position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    gl.uniform1i(gl.getUniformLocation(programs.final, "u_field"), FIELD_UNIT)
    gl.uniform1i(gl.getUniformLocation(programs.final, "u_room"), ROOM_UNIT)
    gl.uniform2f(gl.getUniformLocation(programs.final, "u_canvas"), canvas.width, canvas.height)
    gl.uniform1f(gl.getUniformLocation(programs.final, "u_cell"), cell)
    gl.uniform1f(gl.getUniformLocation(programs.final, "u_roomAlpha"), roomAlpha)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    if (intro) {
      const caption = progress > 0.06 && progress < CAPTIONS_UNTIL ? facing(progress) : null
      if (caption !== intro.caption) intro.onCaption((intro.caption = caption))
      if (progress >= TITLE_AT && !intro.titled) { intro.titled = true; intro.onTitle() }
      if (progress >= CONDENSE_AT && !intro.condensed) { intro.condensed = true; intro.onCondense() }
      if (progress >= 1) {
        const done = intro.onDone
        intro = null
        done()
      }
    }
    if (firstFrame) {
      firstFrame = false
      options.onFirstFrame()
    }
  }

  // Watch how late drawn frames arrive; if they stay late, render at a lower resolution, and if
  // that bottoms out, slow the background down and let the page lighten its glass.
  function adapt(interval: number, at: number) {
    if (at < slow.settleUntil) {
      slow.average = 0
      return
    }
    const planned = intro ? 1000 / 60 : frameMs
    slow.average = slow.average ? slow.average + (interval - slow.average) * 0.25 : interval
    const ratio = slow.average / planned
    if (ratio < SLOW_FACTOR) {
      slow.since = 0
      return
    }
    if (!slow.since) slow.since = at
    if (at - slow.since < SLOW_FOR_MS) return
    slow.since = 0
    slow.settleUntil = at + SETTLE_MS
    if (scale > MIN_SCALE) {
      // the work scales with pixels (scale²), so cut by about as much as frames are late
      scale = Math.max(MIN_SCALE, scale * Math.max(0.5, Math.min(0.85, 1 / Math.sqrt(ratio))))
      resize()
    } else if (!slow.struggled) {
      slow.struggled = true
      frameMs = 1000 / 15
      options.onStruggle()
    }
  }

  function tick(at: number) {
    frame = requestAnimationFrame(tick)
    if (!intro && at - lastDraw < frameMs) return
    if (lastDraw) adapt(at - lastDraw, at)
    const dt = Math.min(0.1, (at - lastTick) / 1000)
    lastTick = at
    lastDraw = at
    if (!paused || intro) time += dt
    draw(dt, at)
    // paused: keep drawing only until a painting switch has finished washing in
    if (paused && !intro && at - wash.start > SWITCH_MS) halt()
  }

  function run() {
    if (frame || document.hidden) return
    lastTick = performance.now()
    lastDraw = 0 // a pause isn't a slow frame
    slow.settleUntil = lastTick + SETTLE_MS
    frame = requestAnimationFrame(tick)
  }

  function halt() {
    cancelAnimationFrame(frame)
    frame = 0
  }

  // While paused the water stays still, but the light still follows the scroll.
  function onScroll() {
    if (paused && !frame) {
      light = scrollProgress()
      draw(0, now())
    }
  }

  function onResize() {
    resize()
    if (paused && !frame) draw(0, now())
  }

  function onPointerMove(event: PointerEvent) {
    pointer.targetX = event.clientX / window.innerWidth
    pointer.targetY = event.clientY / window.innerHeight
  }

  function onVisibility() {
    if (document.hidden) halt()
    else run()
  }

  function onContextLost(event: Event) {
    event.preventDefault()
    halt()
    options.onContextLost()
  }

  resize()
  window.addEventListener("resize", onResize)
  window.addEventListener("scroll", onScroll, { passive: true })
  if (finePointer) window.addEventListener("pointermove", onPointerMove, { passive: true })
  document.addEventListener("visibilitychange", onVisibility)
  canvas.addEventListener("webglcontextlost", onContextLost)

  return {
    setImage(index, image) {
      gl.activeTexture(gl.TEXTURE0 + index)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      sizes[index * 2] = image.naturalWidth
      sizes[index * 2 + 1] = image.naturalHeight
      if (paused && !frame) draw(0, now())
      run()
    },
    showPainting(index) {
      if (index === wash.to) return
      // a wash that's still running finishes from wherever it is
      wash.from = wash.to
      wash.to = index
      wash.start = now()
      halt()
      run()
    },
    playIntro(events, origin) {
      intro = { ...events, origin, start: now(), skipAt: 0, skipFrom: 0, caption: null, titled: false, condensed: false }
      halt()
      run()
    },
    skipIntro() {
      if (!intro || intro.skipAt) return
      const at = now()
      intro.skipFrom = Math.min(1, (at - intro.start) / INTRO_MS)
      intro.skipAt = at
    },
    setPaused(next) {
      paused = next
      if (paused && !intro) halt()
      else run()
    },
    stop() {
      halt()
      intro = null
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("visibilitychange", onVisibility)
      canvas.removeEventListener("webglcontextlost", onContextLost)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    },
  }
}

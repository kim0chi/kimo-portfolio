"""Derive a glass colourway from a painting (dev tool; needs ImageMagick 7).

Takes the painting's dominant colours (k-means via ImageMagick) and builds the site's colour
tokens in OKLCH, so every painting gets: a pale day-glass tint, a deep dusk-glass tint, ink,
muted text, and two accents, all pulled toward the painting's own hues. Text roles are then
nudged in lightness until they pass WCAG contrast against the glass they sit on.

usage: python3 scripts/colourways.py painting.jpg  -> prints JSON tokens for lib/paintings.ts
"""
import json, math, subprocess, sys

def srgb_to_linear(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def linear_to_srgb(c):
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055

def rgb_to_oklch(rgb):
    r, g, b = (srgb_to_linear(v / 255) for v in rgb)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = (math.copysign(abs(v) ** (1 / 3), v) for v in (l, m, s))
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(a, bb), math.degrees(math.atan2(bb, a)) % 360

def oklch_to_rgb(L, C, h):
    a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return tuple(round(linear_to_srgb(v) * 255) for v in (r, g, bl))

def luminance(rgb):
    r, g, b = (srgb_to_linear(v / 255) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

def fit(L, C, h, against, target, darker):
    """Move lightness until the colour reaches `target` contrast against `against`."""
    for _ in range(200):
        rgb = oklch_to_rgb(L, C, h)
        if contrast(rgb, against) >= target: return rgb
        L += -0.005 if darker else 0.005
    return oklch_to_rgb(L, C, h)

def dominant(path, k=7):
    out = subprocess.run(["magick", path, "-resize", "96x96!", "-kmeans", str(k), "-format", "%c", "histogram:info:-"],
                         capture_output=True, text=True, check=True).stdout
    colours = []
    for line in out.splitlines():
        line = line.strip()
        if not line: continue
        count = int(line.split(":")[0])
        rgb = tuple(int(float(v)) for v in line.split("(")[1].split(")")[0].split(",")[:3])
        colours.append((count, rgb))
    return sorted(colours, reverse=True)

def hue_gap(a, b): return min(abs(a - b), 360 - abs(a - b))

def colourway(path):
    colours = [(n, rgb, rgb_to_oklch(rgb)) for n, rgb in dominant(path)]
    light = max(colours, key=lambda c: c[2][0])[2]
    dark = min(colours, key=lambda c: c[2][0])[2]
    # the accent: the most colourful of the well-represented colours
    big = [c for c in colours if c[0] > sum(x[0] for x in colours) * 0.06] or colours
    accent = max(big, key=lambda c: c[2][1])[2]
    second = max((c for c in colours), key=lambda c: hue_gap(c[2][2], accent[2]) * min(c[2][1], 0.12))[2]

    # the painting's overall hue: pixel-weighted average of its colours in OKLab
    total = sum(n for n, _, _ in colours)
    ma = sum(n * c[1] * math.cos(math.radians(c[2])) for n, _, c in colours) / total
    mb = sum(n * c[1] * math.sin(math.radians(c[2])) for n, _, c in colours) / total
    mean_c, mean_h = math.hypot(ma, mb), math.degrees(math.atan2(mb, ma)) % 360
    # glass tints carry that hue clearly enough to see, but stay quiet behind text
    day = oklch_to_rgb(0.94, max(0.016, min(mean_c * 0.55, 0.04)), mean_h)
    dusk = oklch_to_rgb(0.25, max(0.025, min(mean_c * 0.9, 0.055)), mean_h)
    ink = fit(0.24, 0.02, dark[2], day, 10, darker=True)
    muted = fit(0.42, 0.025, dark[2], day, 6.0, darker=True)
    teal = fit(0.5, min(accent[1], 0.085), accent[2], day, 4.8, darker=True)
    rose = fit(0.55, min(max(second[1], 0.05), 0.09), second[2], day, 4.5, darker=True)
    dusk_ink = fit(0.96, 0.01, light[2], dusk, 12, darker=False)
    dusk_muted = fit(0.86, 0.02, light[2], dusk, 7.0, darker=False)
    dusk_teal = fit(0.82, min(accent[1], 0.07), accent[2], dusk, 6.0, darker=False)
    dusk_rose = fit(0.82, min(max(second[1], 0.05), 0.07), second[2], dusk, 6.0, darker=False)
    hexs = lambda c: "#%02x%02x%02x" % c
    return {
        "day": {"tint": hexs(day), "ink": hexs(ink), "muted": hexs(muted), "accent": hexs(teal), "accent2": hexs(rose)},
        "dusk": {"tint": hexs(dusk), "ink": hexs(dusk_ink), "muted": hexs(dusk_muted), "accent": hexs(dusk_teal), "accent2": hexs(dusk_rose)},
        "swatches": [hexs(c[1]) for c in colours[:6]],
        "checks": {
            "ink/day": round(contrast(ink, day), 2), "muted/day": round(contrast(muted, day), 2),
            "accent/day": round(contrast(teal, day), 2), "rose/day": round(contrast(rose, day), 2),
            "ink/dusk": round(contrast(dusk_ink, dusk), 2), "muted/dusk": round(contrast(dusk_muted, dusk), 2),
            "accent/dusk": round(contrast(dusk_teal, dusk), 2),
        },
    }

def oklab(rgb):
    L, C, h = rgb_to_oklch(rgb)
    return (L, C * math.cos(math.radians(h)), C * math.sin(math.radians(h)))

def dither_palette(path, size=8):
    """The painting's own colours for the dither: its darkest and lightest, its accent (the most vivid
    colour far from its overall hue, such as the lilies' rose, however little of the canvas it covers),
    then the most distinct of its main colours until there are `size`."""
    out = subprocess.run(["magick", path, "-resize", "240x240!", "-kmeans", "32", "-format", "%c", "histogram:info:-"],
                         capture_output=True, text=True, check=True).stdout
    cols = []
    for line in out.splitlines():
        line = line.strip()
        if not line: continue
        n = int(line.split(":")[0])
        rgb = tuple(int(float(v)) for v in line.split("(")[1].split(")")[0].split(",")[:3])
        cols.append((n, rgb, oklab(rgb), rgb_to_oklch(rgb)))
    total = sum(c[0] for c in cols)
    ma = sum(c[0] * c[2][1] for c in cols) / total
    mb = sum(c[0] * c[2][2] for c in cols) / total
    mean_h = math.degrees(math.atan2(mb, ma)) % 360
    main = [c for c in cols if c[0] > total * 0.004]
    chosen = [min(main, key=lambda c: c[2][0]), max(main, key=lambda c: c[2][0])]
    # its signature: the most vivid of its main colours (the wheat's orange, the water's blue)
    chosen.append(max((c for c in main if c not in chosen), key=lambda c: c[3][1]))
    far = [c for c in cols if hue_gap(c[3][2], mean_h) > 60 and c not in chosen]
    if far: chosen.append(max(far, key=lambda c: c[3][1]))
    # and the colour most opposite the painting's hue, if it has any colour at all (the lilies against blue water)
    opposite = [c for c in cols if c[3][1] > 0.04 and c not in chosen]
    if opposite: chosen.append(max(opposite, key=lambda c: hue_gap(c[3][2], mean_h)))
    while len(chosen) < size:
        chosen.append(max((c for c in main if c not in chosen),
                          key=lambda c: min(math.dist(c[2], d[2]) for d in chosen) * (0.6 + 0.4 * math.sqrt(c[0] / total * 24))))
    chosen.sort(key=lambda c: c[2][0])
    return ["#%02x%02x%02x" % c[1] for c in chosen]

# 8x8 Bayer matrix, the same as the shader in components/pond/pond-renderer.ts
BAYER8 = [0,32,8,40,2,34,10,42, 48,16,56,24,50,18,58,26, 12,44,4,36,14,46,6,38, 60,28,52,20,62,30,54,22,
          3,35,11,43,1,33,9,41, 51,19,59,27,49,17,57,25, 15,47,7,39,13,45,5,37, 63,31,55,23,61,29,53,21]
SPREAD = 0.22

def dithered_still(path, palette, out_path, width=1000):
    """A pre-dithered copy for first paint and for visitors who don't get the moving background:
    one pixel per dither cell (2 CSS px, so 1000 px covers a wide screen), shown with image-rendering: pixelated."""
    h = int(subprocess.run(["magick", path, "-format", "%h", "info:"], capture_output=True, text=True, check=True).stdout)
    w0 = int(subprocess.run(["magick", path, "-format", "%w", "info:"], capture_output=True, text=True, check=True).stdout)
    height = round(h * width / w0)
    raw = subprocess.run(["magick", path, "-resize", f"{width}x{height}!", "-depth", "8", "rgb:-"], capture_output=True, check=True).stdout
    pal = [tuple(int(p[i:i + 2], 16) / 255 for i in (1, 3, 5)) for p in palette]
    pal_bytes = [bytes(round(v * 255) for v in p) for p in pal]
    out = bytearray()
    for y in range(height):
        for x in range(width):
            i = (y * width + x) * 3
            t = (BAYER8[(y % 8) * 8 + (x % 8)] + 0.5) / 64 - 0.5
            r, g, b = raw[i] / 255 + t * SPREAD, raw[i + 1] / 255 + t * SPREAD, raw[i + 2] / 255 + t * SPREAD
            best = min(range(len(pal)), key=lambda k: (r - pal[k][0]) ** 2 + (g - pal[k][1]) ** 2 + (b - pal[k][2]) ** 2)
            out += pal_bytes[best]
    subprocess.run(["magick", "-size", f"{width}x{height}", "-depth", "8", "rgb:-", "-define", "png:color-type=3", "-strip", out_path],
                   input=bytes(out), check=True)

if __name__ == "__main__":
    # python3 scripts/colourways.py painting.jpg [still.png]
    result = colourway(sys.argv[1])
    result["dither"] = dither_palette(sys.argv[1])
    if len(sys.argv) > 2: dithered_still(sys.argv[1], result["dither"], sys.argv[2])
    print(json.dumps(result, indent=1))

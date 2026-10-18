// The paintings the background can show. All six are Claude Monet works in the Art Institute of
// Chicago, public domain with CC0 open-access images; the museum asks for the caption
// "Claude Monet. Title, Date. The Art Institute of Chicago." Images live in /public/paintings.
//
// Each colourway was computed from its painting with scripts/colourways.py: glass tints carry the
// painting's average hue, accents its most vivid and most different hues, and every text colour is
// adjusted until it reaches at least 4.5:1 against the glass it sits on. The dither palettes come from the
// same script: each painting's darkest and lightest colours, its signature (most vivid) colour, its accents,
// then its most distinct main colours.

export type Colourway = { tint: string; ink: string; muted: string; accent: string; accent2: string }

export type Painting = {
  slug: string
  title: string
  date: string
  url: string
  /** day glass sits in morning light near the top of the page; dusk glass in evening light below */
  colourway: { day: Colourway; dusk: Colourway }
  /** the eight colours the background is dithered to, darkest first */
  dither: string[]
}

export const paintings: Painting[] = [
  {
    slug: "water-lilies",
    title: "Water Lilies",
    date: "1906",
    url: "https://www.artic.edu/artworks/16568",
    colourway: {
      day: { tint: "#dbeff7", ink: "#142221", muted: "#3e5250", accent: "#406884", accent2: "#43716e" },
      dusk: { tint: "#09252f", ink: "#ebf4f3", muted: "#c3d5d3", accent: "#9fcaea", accent2: "#9fcfcb" },
    },
    dither: ["#174b42", "#82494a", "#39627e", "#578043", "#5c8169", "#5a85a4", "#889999", "#beb9ae"],
  },
  {
    slug: "wheat",
    title: "Stacks of Wheat (End of Summer)",
    date: "1890–91",
    url: "https://www.artic.edu/artworks/64818",
    colourway: {
      day: { tint: "#f1eae0", ink: "#241f14", muted: "#534c3e", accent: "#6e6247", accent2: "#5b6b88" },
      dusk: { tint: "#282014", ink: "#f2f2eb", muted: "#d2d2c3", accent: "#d0c3a5", accent2: "#b3c5e5" },
    },
    dither: ["#4f5548", "#7a6054", "#647969", "#7d774a", "#99714e", "#828796", "#ae8f86", "#bbb7aa"],
  },
  {
    slug: "lily-pond",
    title: "Water Lily Pond",
    date: "1900",
    url: "https://www.artic.edu/artworks/87088",
    colourway: {
      day: { tint: "#ebece0", ink: "#251e15", muted: "#564b3e", accent: "#676449", accent2: "#457270" },
      dusk: { tint: "#222315", ink: "#f4f2ea", muted: "#d5d1c3", accent: "#c9c6a8", accent2: "#9fcfcc" },
    },
    dither: ["#3d2d2a", "#414d42", "#54623f", "#7e584b", "#537c7a", "#82803a", "#739b9b", "#c4b9ae"],
  },
  {
    slug: "vetheuil",
    title: "Vétheuil",
    date: "1901",
    url: "https://www.artic.edu/artworks/16579",
    colourway: {
      day: { tint: "#f6e7e6", ink: "#281c1b", muted: "#5a4846", accent: "#835744", accent2: "#7f5f72" },
      dusk: { tint: "#2d1d1b", ink: "#f7f0ec", muted: "#dccec5", accent: "#eab7a1", accent2: "#dcb8cd" },
    },
    dither: ["#8b6d6c", "#8e8599", "#b3847e", "#a98f9c", "#a29e9c", "#cd9674", "#d4a78c", "#c5b9ad"],
  },
  {
    slug: "mist",
    title: "Branch of the Seine near Giverny (Mist)",
    date: "1897",
    url: "https://www.artic.edu/artworks/16564",
    colourway: {
      day: { tint: "#eaeaf6", ink: "#1c1f29", muted: "#484c5b", accent: "#5f617a", accent2: "#826071" },
      dusk: { tint: "#21202e", ink: "#f7eff3", muted: "#dcccd3", accent: "#bfc2de", accent2: "#deb8ca" },
    },
    dither: ["#666b81", "#6d7591", "#8082a5", "#9090b3", "#9c9eb3", "#a9aec9", "#bdb0b4", "#c6bac0"],
  },
  {
    slug: "belle-ile",
    title: "Rocks at Port-Goulphar, Belle-Île",
    date: "1886",
    url: "https://www.artic.edu/artworks/20545",
    colourway: {
      day: { tint: "#e5ecf6", ink: "#221d26", muted: "#524957", accent: "#526675", accent2: "#86615a" },
      dusk: { tint: "#1b222e", ink: "#eef2f9", muted: "#c9d2de", accent: "#b1c8d8", accent2: "#e3b9b1" },
    },
    dither: ["#22242a", "#313640", "#543d3a", "#304c5d", "#655a53", "#547086", "#899299", "#b0b8bf"],
  },
]

export const DEFAULT_PAINTING = paintings[0].slug

export const paintingIndex = (slug: string) => Math.max(0, paintings.findIndex((painting) => painting.slug === slug))
/** the painting itself, sampled by the background shader and shown in the intro's gallery */
export const paintingImage = (slug: string) => `/paintings/${slug}-720.webp`
/** a pre-dithered copy, one pixel per dither cell: first paint, and the background for visitors without the animation */
export const paintingStill = (slug: string) => `/paintings/${slug}-dither.png`
export const paintingThumb = (slug: string) => `/paintings/${slug}-thumb.webp`

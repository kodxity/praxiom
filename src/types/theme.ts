export interface ContestTheme {
  slug: string
  name: string
  tagline: string

  // Visual
  bg: string
  bgSecondary: string
  surface: string
  surfaceBorder: string
  surfaceHover: string

  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string
  textAccent: string

  // Accent colors
  accent: string
  accentBg: string
  accentBorder: string

  // Typography
  displayFont: string
  monoFont: string

  // Overlays
  particleColor: string
  glowColor: string
  gridOverlay: boolean
  grainOverlay: boolean

  // Doodle
  doodlePaths: {
    hero: string
    background: string
    empty: string
    problemDivider: string
  }
  doodleBlend: 'multiply' | 'screen' | 'overlay'
  doodleOpacity: number

  // Nav
  navVariant: 'dark' | 'light' | 'glass'
}

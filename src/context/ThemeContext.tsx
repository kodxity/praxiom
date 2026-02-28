'use client'

import { createContext, useContext, useEffect } from 'react'
import type { ContestTheme } from '@/types/theme'
import { THEMES } from '@/lib/contestThemes'

const ThemeContext = createContext<ContestTheme>(THEMES['global'])

export function ThemeProvider({
  children,
  contestSlug,
  theme: themeOverride,
}: {
  children: React.ReactNode
  contestSlug?: string
  /** Pass a full theme object (e.g. from a custom DB theme) to bypass slug lookup */
  theme?: ContestTheme
}) {
  const theme = themeOverride
    ?? (contestSlug ? (THEMES[contestSlug] ?? THEMES['global']) : THEMES['global'])

  // Inject CSS variables on :root so any child (including Navbar/footer outside ThemeProvider) can use them
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--theme-accent', theme.accent)
    root.style.setProperty('--theme-accent-bg', theme.accentBg)
    root.style.setProperty('--theme-accent-border', theme.accentBorder)
    root.style.setProperty('--theme-text-primary', theme.textPrimary)
    root.style.setProperty('--theme-text-secondary', theme.textSecondary)
    root.style.setProperty('--theme-text-muted', theme.textMuted)
    root.style.setProperty('--theme-text-accent', theme.textAccent)
    root.style.setProperty('--theme-surface', theme.surface)
    root.style.setProperty('--theme-surface-border', theme.surfaceBorder)
    root.style.setProperty('--theme-glow', theme.glowColor)
    root.style.setProperty('--theme-bg', theme.bg)
    root.style.setProperty('--theme-bg-secondary', theme.bgSecondary)

    // Nav / footer vars - set globally so Navbar + footer (outside ThemeProvider scope) respond
    const dark = theme.navVariant === 'dark'
    // Use per-theme bgSecondary as nav/footer bg (append hex alpha); use theme accent vars for borders/highlights
    root.style.setProperty('--theme-nav-bg',        dark ? theme.bgSecondary + 'ee'      : 'rgba(238,234,227,0.88)')
    root.style.setProperty('--theme-nav-text',      dark ? theme.textPrimary             : '#18160f')
    root.style.setProperty('--theme-nav-muted',     dark ? theme.textMuted               : '#8a8274')
    root.style.setProperty('--theme-nav-border',    dark ? theme.surfaceBorder           : 'rgba(0,0,0,0.06)')
    root.style.setProperty('--theme-nav-active-bg', dark ? theme.accentBg                : 'white')
    root.style.setProperty('--theme-nav-mobile-bg', dark ? theme.bgSecondary + 'f7'      : 'rgba(238,234,227,0.97)')
    root.style.setProperty('--theme-footer-bg',     dark ? theme.bgSecondary + 'f9'      : 'transparent')
    root.style.setProperty('--theme-footer-text',   dark ? theme.textMuted               : 'rgba(60,55,45,0.68)')
    root.style.setProperty('--theme-footer-border', dark ? theme.surfaceBorder           : 'rgba(0,0,0,0.07)')
    root.style.setProperty('--theme-logo-accent',   dark ? theme.accent                  : 'var(--sage)')
    root.style.setProperty('--theme-logo-text',     dark ? theme.textPrimary             : '#18160f')

    // Expose navVariant as an attribute for CSS selectors
    root.setAttribute('data-nav-variant', theme.navVariant ?? 'light')

    return () => {
      // Reset to global defaults when leaving a themed contest
      root.style.setProperty('--theme-nav-bg',        'rgba(238,234,227,0.88)')
      root.style.setProperty('--theme-nav-text',      '#18160f')
      root.style.setProperty('--theme-nav-muted',     '#8a8274')
      root.style.setProperty('--theme-nav-border',    'rgba(0,0,0,0.06)')
      root.style.setProperty('--theme-nav-active-bg', 'white')
      root.style.setProperty('--theme-nav-mobile-bg', 'rgba(238,234,227,0.97)')
      root.style.setProperty('--theme-footer-bg',     'transparent')
      root.style.setProperty('--theme-footer-text',   'rgba(60,55,45,0.68)')
      root.style.setProperty('--theme-footer-border', 'rgba(0,0,0,0.07)')
      root.style.setProperty('--theme-logo-accent',   'var(--sage)')
      root.style.setProperty('--theme-logo-text',     '#18160f')
      root.setAttribute('data-nav-variant', 'light')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

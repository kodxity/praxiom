import { prisma } from '@/lib/db'
import { ThemeProvider } from '@/context/ThemeContext'
import { ContestShell } from '@/components/ContestShell'
import { THEMES, buildCustomTheme } from '@/lib/contestThemes'
import type { ContestTheme } from '@/types/theme'

const THEME_BG: Record<string, string> = {
  'jade-city':        'linear-gradient(140deg, #0d1a12 0%, #0a140d 100%)',
  'devil-mountain':   'linear-gradient(140deg, #1a0808 0%, #2a0d0d 100%)',
  'murder-mystery':   'linear-gradient(140deg, #12101e 0%, #181428 100%)',
  'ancient-ruins':    'linear-gradient(140deg, #2e2210 0%, #241808 100%)',
  'cipher-lab':       'linear-gradient(140deg, #080e1a 0%, #0a1220 100%)',
  'enchanted-forest': 'linear-gradient(140deg, #1a2e1a 0%, #0d2614 100%)',
  'the-conclave':     'linear-gradient(140deg, #0e0e16 0%, #141420 100%)',
}

export default async function ContestLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let themeSlug = 'global'
  let customTheme: ContestTheme | undefined
  try {
    const contest = await prisma.contest.findUnique({
      where: { id },
      select: { themeSlug: true },
    })
    if (contest?.themeSlug) themeSlug = contest.themeSlug

    // If not a builtin theme, look up in the DB custom themes table
    if (themeSlug && !THEMES[themeSlug]) {
      const dbTheme = await prisma.theme.findUnique({ where: { slug: themeSlug } })
      if (dbTheme?.config) {
        customTheme = buildCustomTheme(dbTheme.config as Record<string, any>)
      }
    }
  } catch {
    // DB unavailable
  }

  const resolvedTheme = customTheme ?? THEMES[themeSlug] ?? THEMES['global']
  const isDark = resolvedTheme.navVariant === 'dark'
  const ssrBg = customTheme ? (customTheme.bg) : THEME_BG[themeSlug]

  return (
    <ThemeProvider theme={resolvedTheme}>
      <div
        data-nav-variant={isDark ? 'dark' : undefined}
        style={ssrBg ? { background: ssrBg, minHeight: '100vh' } : undefined}
      >
        <ContestShell slug={themeSlug}>
          {children}
        </ContestShell>
      </div>
    </ThemeProvider>
  )
}



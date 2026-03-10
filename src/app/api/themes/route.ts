import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildCustomTheme } from '@/lib/contestThemes'
import { z } from 'zod'

// Bounded CSS value: printable ASCII only, no `<>{}` to prevent injection.
// Length-capped at 300 characters.
const cssVal = z.string().max(300).regex(/^[^<>{}]+$/, 'Invalid CSS value').optional()
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional()

const themeBodySchema = z.object({
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug too long').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  tagline: z.string().max(200).trim().optional(),
  accent: hexColor,
  bg: cssVal,
  bgSecondary: cssVal,
  surface: cssVal,
  surfaceBorder: cssVal,
  surfaceHover: cssVal,
  textPrimary: cssVal,
  textSecondary: cssVal,
  textMuted: cssVal,
  textAccent: cssVal,
  accentBg: cssVal,
  accentBorder: cssVal,
  displayFont: z.string().max(100).regex(/^[\w\s,-]+$/, 'Invalid font name').optional(),
  particleColor: cssVal,
  glowColor: cssVal,
  gridOverlay: z.boolean().optional(),
  grainOverlay: z.boolean().optional(),
  doodlePaths: z.object({
    hero: z.string().max(200).optional(),
    background: z.string().max(200).optional(),
    empty: z.string().max(200).optional(),
    problemDivider: z.string().max(200).optional(),
  }).optional(),
  doodleBlend: z.string().max(50).optional(),
  doodleOpacity: z.number().min(0).max(1).optional(),
  navVariant: z.enum(['dark', 'light']).optional(),
})

const createThemeSchema = themeBodySchema

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({ orderBy: { createdAt: 'asc' } })
    return NextResponse.json(themes)
  } catch (e) {
    console.error(e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return new NextResponse('Unauthorized', { status: 401 })

  try {
    let rawBody: unknown
    try { rawBody = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    const result = createThemeSchema.safeParse(rawBody)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    const { slug, name } = result.data

    // Build full config only from validated fields — never spread rawBody directly
    const config = buildCustomTheme(result.data)

    const theme = await prisma.theme.create({
      data: { slug, name, config: config as any },
    })
    return NextResponse.json(theme, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002') return new NextResponse('Slug already exists', { status: 409 })
    console.error(e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

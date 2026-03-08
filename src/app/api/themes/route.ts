import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildCustomTheme } from '@/lib/contestThemes'
import { z } from 'zod'

const createThemeSchema = z.object({
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug too long').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
})

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

    // Build full config with derived fields and store
    const config = buildCustomTheme({ ...(rawBody as Record<string, unknown>), slug, name })

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

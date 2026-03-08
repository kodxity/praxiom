import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildCustomTheme } from '@/lib/contestThemes'
import { z } from 'zod'

const updateThemeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim().optional(),
})

export async function GET(_req: Request, props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  try {
    const theme = await prisma.theme.findUnique({ where: { slug } })
    if (!theme) return new NextResponse('Not Found', { status: 404 })
    return NextResponse.json(theme)
  } catch (e) {
    console.error(e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return new NextResponse('Unauthorized', { status: 401 })
  const { slug } = await props.params
  try {
    let rawBody: unknown
    try { rawBody = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    const result = updateThemeSchema.safeParse(rawBody)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })

    const config = buildCustomTheme({ ...(rawBody as Record<string, unknown>), slug })
    const theme = await prisma.theme.update({
      where: { slug },
      data: { name: config.name, config: config as any },
    })
    return NextResponse.json(theme)
  } catch (e) {
    console.error(e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return new NextResponse('Unauthorized', { status: 401 })
  const { slug } = await props.params
  try {
    await prisma.theme.delete({ where: { slug } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

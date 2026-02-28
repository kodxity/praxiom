import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildCustomTheme } from '@/lib/contestThemes'

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
    const body = await req.json()
    const { slug, name } = body
    if (!slug || !name) return new NextResponse('slug and name are required', { status: 400 })

    // Build full config with derived fields and store
    const config = buildCustomTheme({ ...body })

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

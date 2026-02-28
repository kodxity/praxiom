import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildCustomTheme } from '@/lib/contestThemes'

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
    const body = await req.json()
    const config = buildCustomTheme({ ...body, slug })
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

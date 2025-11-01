import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - List all content texts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = { is_active: true }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { text_khmer: { contains: search } },
        { text_english: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const texts = await prisma.content_texts.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // Get unique categories
    const categories = await prisma.content_texts.findMany({
      where: { is_active: true },
      select: { category: true },
      distinct: ['category']
    })

    return NextResponse.json({
      success: true,
      texts,
      categories: categories.map(c => c.category).sort()
    })
  } catch (error) {
    console.error('Get content texts error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Create new content text
export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user is COORDINATOR or higher
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true }
    })

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - COORDINATOR access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { key, text_khmer, text_english, category, description } = body

    if (!key || !text_khmer || !category) {
      return NextResponse.json(
        { error: 'key, text_khmer, and category are required' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existing = await prisma.content_texts.findUnique({
      where: { key }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Key already exists' },
        { status: 400 }
      )
    }

    const text = await prisma.content_texts.create({
      data: {
        key,
        text_khmer,
        text_english: text_english || null,
        category,
        description: description || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Content text created successfully',
      text
    })
  } catch (error) {
    console.error('Create content text error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

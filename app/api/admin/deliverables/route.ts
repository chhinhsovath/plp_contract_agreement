import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - List all deliverables with options
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true }
    })

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const contractType = searchParams.get('contract_type')

    const where: any = { is_active: true }
    if (contractType && contractType !== 'all') {
      where.contract_type = parseInt(contractType)
    }

    const deliverables = await prisma.contract_deliverables.findMany({
      where,
      include: {
        options: {
          where: { is_active: true },
          orderBy: { option_number: 'asc' }
        }
      },
      orderBy: [
        { contract_type: 'asc' },
        { deliverable_number: 'asc' }
      ]
    })

    return NextResponse.json({ success: true, deliverables })
  } catch (error) {
    console.error('Get deliverables error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Create new deliverable
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true }
    })

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { contract_type, deliverable_number, deliverable_title_khmer, deliverable_title_english, timeline, activities_text } = body

    if (!contract_type || !deliverable_number || !deliverable_title_khmer) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const deliverable = await prisma.contract_deliverables.create({
      data: {
        contract_type,
        deliverable_number,
        deliverable_title_khmer,
        deliverable_title_english: deliverable_title_english || null,
        timeline: timeline || '',
        activities_text: activities_text || null
      }
    })

    return NextResponse.json({ success: true, deliverable })
  } catch (error) {
    console.error('Create deliverable error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

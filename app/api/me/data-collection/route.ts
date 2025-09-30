import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { UserRole } from '@/lib/roles'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const indicatorId = searchParams.get('indicatorId')

    let whereClause: any = {}
    if (indicatorId) {
      whereClause.indicator_id = parseInt(indicatorId)
    }

    const dataCollections = await prisma.me_data_collection.findMany({
      where: whereClause,
      include: {
        indicator: {
          select: {
            indicator_code: true,
            indicator_name_khmer: true
          }
        }
      },
      orderBy: { collection_date: 'desc' }
    })

    return NextResponse.json({
      collections: dataCollections,
      total: dataCollections.length
    })
  } catch (error) {
    console.error('Error fetching data collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data collections' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()

    const dataCollection = await prisma.me_data_collection.create({
      data: {
        indicator_id: body.indicator_id,
        collection_date: new Date(body.collection_date),
        value_numeric: body.value_numeric || null,
        value_text: body.value_text || null,
        collector_name: body.collected_by || user.full_name || 'System',
        data_source: body.data_type || 'system',
        notes: body.notes || null
      }
    })

    return NextResponse.json({ dataCollection }, { status: 201 })
  } catch (error) {
    console.error('Error creating data collection:', error)
    return NextResponse.json(
      { error: 'Failed to create data collection' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    const dataCollection = await prisma.me_data_collection.update({
      where: { id },
      data: {
        ...updateData,
        collection_date: updateData.collection_date ? new Date(updateData.collection_date) : undefined
      }
    })

    return NextResponse.json({ dataCollection })
  } catch (error) {
    console.error('Error updating data collection:', error)
    return NextResponse.json(
      { error: 'Failed to update data collection' },
      { status: 500 }
    )
  }
}
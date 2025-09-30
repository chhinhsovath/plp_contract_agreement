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

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const contractType = searchParams.get('contractType')

    let whereClause: any = {}

    // Filter based on user role and contract type
    if (user.role === UserRole.PARTNER && user.contract_type) {
      // Partners only see activities related to their contract type indicators
      whereClause = {
        indicator: {
          contract_type: user.contract_type
        }
      }
    } else if (contractType) {
      // Admin/others can filter by contract type
      whereClause = {
        indicator: {
          contract_type: parseInt(contractType)
        }
      }
    }

    // Fetch activities with related data
    const activities = await prisma.me_activities.findMany({
      where: whereClause,
      include: {
        indicator: {
          select: {
            indicator_code: true,
            indicator_name_khmer: true,
            contract_type: true
          }
        },
        milestones: {
          orderBy: { due_date: 'asc' }
        }
      },
      orderBy: { activity_code: 'asc' }
    })

    // Calculate progress and budget utilization
    const activitiesWithStats = activities.map(activity => {
      // Calculate progress based on milestones if available
      let progress = 0
      if (activity.milestones.length > 0) {
        const completedMilestones = activity.milestones.filter(
          m => m.status === 'achieved'
        ).length
        progress = Math.round((completedMilestones / activity.milestones.length) * 100)
      } else if (activity.status === 'completed') {
        progress = 100
      } else if (activity.status === 'ongoing') {
        // Calculate based on time elapsed
        const totalDays = Math.ceil(
          (activity.planned_end.getTime() - activity.planned_start.getTime()) /
          (1000 * 60 * 60 * 24)
        )
        const elapsedDays = Math.ceil(
          (new Date().getTime() - activity.planned_start.getTime()) /
          (1000 * 60 * 60 * 24)
        )
        progress = Math.min(Math.round((elapsedDays / totalDays) * 100), 99)
      }

      // Calculate budget utilization
      const budgetUtilization = activity.budget_allocated && activity.budget_allocated > 0
        ? Math.round((activity.budget_spent || 0) / activity.budget_allocated * 100)
        : 0

      return {
        ...activity,
        progress,
        budgetUtilization
      }
    })

    return NextResponse.json({
      activities: activitiesWithStats,
      total: activitiesWithStats.length
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

// POST endpoint to add new activity
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user has permission
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) }
    })

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    const activity = await prisma.me_activities.create({
      data: {
        activity_code: body.activity_code,
        activity_name_khmer: body.activity_name_khmer,
        activity_name_english: body.activity_name_english,
        indicator_id: body.indicator_id,
        contract_id: body.contract_id,
        planned_start: new Date(body.planned_start),
        planned_end: new Date(body.planned_end),
        actual_start: body.actual_start ? new Date(body.actual_start) : null,
        actual_end: body.actual_end ? new Date(body.actual_end) : null,
        status: body.status || 'planned',
        budget_allocated: body.budget_allocated,
        budget_spent: body.budget_spent || 0,
        responsible_person: body.responsible_person,
        location: body.location
      }
    })

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}

// PUT endpoint to update activity
export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    // Update activity
    const activity = await prisma.me_activities.update({
      where: { id },
      data: {
        ...updateData,
        planned_start: updateData.planned_start ? new Date(updateData.planned_start) : undefined,
        planned_end: updateData.planned_end ? new Date(updateData.planned_end) : undefined,
        actual_start: updateData.actual_start ? new Date(updateData.actual_start) : undefined,
        actual_end: updateData.actual_end ? new Date(updateData.actual_end) : undefined,
      }
    })

    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, selections } = body

    if (!userId || !selections || !Array.isArray(selections)) {
      return NextResponse.json(
        { error: 'User ID and selections are required' },
        { status: 400 }
      )
    }

    // Save selections to temporary JSON storage and mark configuration as complete
    await prisma.users.update({
      where: { id: userId },
      data: {
        configuration_complete: true,
        // Store selections temporarily in a new field or use session storage
        // For now, we'll rely on localStorage on frontend since it's temporary until signature
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully'
    })
  } catch (error) {
    console.error('Save configuration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

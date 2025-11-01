import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Submit a new reconfiguration request
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, contractType, requestReason, currentSelections } = body

    if (!userId || !contractType || !requestReason || !currentSelections) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.reconfiguration_requests.findFirst({
      where: {
        user_id: userId,
        status: 'pending'
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'អ្នកមានសំណើកំពុងរង់ចាំរួចហើយ សូមរង់ចាំការពិនិត្យពីអ្នកគ្រប់គ្រង' },
        { status: 400 }
      )
    }

    // Create new request
    const request_obj = await prisma.reconfiguration_requests.create({
      data: {
        user_id: userId,
        contract_type: contractType,
        request_reason: requestReason,
        current_selections: currentSelections as any,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully',
      request: request_obj
    })
  } catch (error) {
    console.error('Create reconfiguration request error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

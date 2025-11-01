import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const contractId = parseInt(params.id)
    const session = await getSession()

    const userId = session ? Number(session.userId) : null
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    // Create download record
    await prisma.contract_downloads.create({
      data: {
        contract_id: contractId,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent
      }
    })

    // Increment download counter
    await prisma.contracts.update({
      where: { id: contractId },
      data: {
        download_count: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track download error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}

// GET - Get download statistics
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const contractId = parseInt(params.id)

    const downloads = await prisma.contract_downloads.findMany({
      where: { contract_id: contractId },
      include: {
        user: {
          select: {
            full_name: true,
            phone_number: true
          }
        }
      },
      orderBy: {
        downloaded_at: 'desc'
      }
    })

    const total = await prisma.contract_downloads.count({
      where: { contract_id: contractId }
    })

    return NextResponse.json({
      success: true,
      total_downloads: total,
      downloads
    })
  } catch (error) {
    console.error('Get downloads error:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}

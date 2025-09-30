import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Demo user phone numbers to reset
const DEMO_USER_PHONES = [
  '0771111111', // PMU-PCU
  '0772222222', // PCU-PM
  '0773333333', // PM-Regional
  '0774444444', // DoE-District
  '0775555555', // DoE-School
  '0776666666', // Admin Demo
]

// Check if 24 hours have passed since last reset
async function shouldReset(): Promise<boolean> {
  try {
    // Get the most recent reset time from any demo user
    const demoUser = await prisma.users.findFirst({
      where: {
        phone_number: { in: DEMO_USER_PHONES }
      },
      select: {
        last_reset_at: true
      },
      orderBy: {
        last_reset_at: 'desc'
      }
    })

    if (!demoUser?.last_reset_at) {
      // Never been reset, should reset
      return true
    }

    // Check if 24 hours have passed
    const lastReset = new Date(demoUser.last_reset_at)
    const now = new Date()
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)

    return hoursSinceReset >= 24
  } catch (error) {
    console.error('Error checking reset time:', error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    // Check if this is an automated call or manual trigger
    const { force = false } = await request.json().catch(() => ({ force: false }))

    // Check if reset is needed (unless forced)
    if (!force) {
      const needsReset = await shouldReset()
      if (!needsReset) {
        return NextResponse.json({
          message: 'Reset not needed yet. Less than 24 hours since last reset.',
          nextResetIn: '24 hours from last reset'
        })
      }
    }

    console.log('🔄 Starting demo users data reset...')

    // Start transaction for atomic reset
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get all demo users
      const demoUsers = await tx.users.findMany({
        where: {
          phone_number: { in: DEMO_USER_PHONES }
        },
        select: { id: true, phone_number: true }
      })

      const demoUserIds = demoUsers.map(u => u.id)

      // 2. Delete M&E data created by demo users
      // Delete data collections
      const deletedDataCollections = await tx.me_data_collection.deleteMany({
        where: {
          collector_name: {
            in: [
              'Demo PMU-PCU User',
              'Demo PCU-PM User',
              'Demo PM-Regional User',
              'Demo DoE-District User',
              'Demo DoE-School User',
              'Demo Admin User'
            ]
          }
        }
      })

      // Delete training attendance
      const deletedAttendance = await tx.me_training_attendance.deleteMany({
        where: {
          beneficiary: {
            beneficiary_code: {
              in: demoUsers.map(u => `DEMO-${u.phone_number}`)
            }
          }
        }
      })

      // Delete reports created by demo users
      const deletedReports = await tx.me_reports.deleteMany({
        where: {
          generated_by: {
            in: [
              'Demo PMU-PCU User',
              'Demo PCU-PM User',
              'Demo PM-Regional User',
              'Demo DoE-District User',
              'Demo DoE-School User',
              'Demo Admin User'
            ]
          }
        }
      })

      // 3. Reset contract signing status for demo users
      const resetUsers = await tx.users.updateMany({
        where: {
          phone_number: { in: DEMO_USER_PHONES }
        },
        data: {
          contract_signed: false,
          contract_signed_date: null,
          signature_data: null,
          contract_read_time: null,
          ip_address_signed: null,
          last_login: null,
          last_reset_at: new Date() // Track when reset occurred
        }
      })

      // 4. Delete any contracts created by demo users
      const deletedContracts = await tx.contracts.deleteMany({
        where: {
          created_by_id: { in: demoUserIds }
        }
      })

      return {
        resetUsers: resetUsers.count,
        deletedDataCollections: deletedDataCollections.count,
        deletedAttendance: deletedAttendance.count,
        deletedReports: deletedReports.count,
        deletedContracts: deletedContracts.count
      }
    })

    console.log('✅ Demo users data reset completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Demo users data has been reset successfully',
      stats: result,
      nextResetIn: '24 hours'
    })
  } catch (error) {
    console.error('Error resetting demo users:', error)
    return NextResponse.json(
      { error: 'Failed to reset demo users data' },
      { status: 500 }
    )
  }
}

// GET endpoint to check reset status
export async function GET() {
  try {
    const needsReset = await shouldReset()

    // Get last reset time
    const demoUser = await prisma.users.findFirst({
      where: {
        phone_number: { in: DEMO_USER_PHONES }
      },
      select: {
        last_reset_at: true
      },
      orderBy: {
        last_reset_at: 'desc'
      }
    })

    const lastReset = demoUser?.last_reset_at
    let hoursUntilReset = null

    if (lastReset) {
      const hoursSinceReset = (new Date().getTime() - new Date(lastReset).getTime()) / (1000 * 60 * 60)
      hoursUntilReset = Math.max(0, 24 - hoursSinceReset)
    }

    return NextResponse.json({
      needsReset,
      lastResetAt: lastReset,
      hoursUntilNextReset: hoursUntilReset,
      demoUsers: DEMO_USER_PHONES
    })
  } catch (error) {
    console.error('Error checking reset status:', error)
    return NextResponse.json(
      { error: 'Failed to check reset status' },
      { status: 500 }
    )
  }
}
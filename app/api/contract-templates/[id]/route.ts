import { NextResponse } from 'next/server'
import { getContractTemplate } from '@/lib/getContractTemplates'
import { getDefaultPartyA } from '@/lib/defaultPartyA'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const contractType = parseInt(params.id)

    if (isNaN(contractType) || contractType < 1 || contractType > 5) {
      return NextResponse.json(
        { error: 'Invalid contract type. Must be 1-5' },
        { status: 400 }
      )
    }

    const partyAInfo = getDefaultPartyA()
    const template = await getContractTemplate(contractType, partyAInfo)

    if (!template) {
      return NextResponse.json(
        { error: 'Contract template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      template
    })
  } catch (error) {
    console.error('Get contract template error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

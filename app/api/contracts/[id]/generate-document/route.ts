import { NextRequest, NextResponse } from 'next/server'
import { DocumentGenerator, getTemplateType } from '@/lib/services/document-generation'
import prisma from '@/lib/prisma'

/**
 * GET /api/contracts/[id]/generate-document
 * Generate and download contract DOCX document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contractId = parseInt(id)

    // Fetch contract to determine template type
    const contract = await prisma.contracts.findUnique({
      where: { id: contractId },
      select: { contract_type_id: true, contract_number: true, party_b_name: true }
    })

    if (!contract) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contract not found',
          message: `Contract with ID ${contractId} does not exist`
        },
        { status: 404 }
      )
    }

    // Determine template type
    const templateType = getTemplateType(contract.contract_type_id)

    // Generate document
    const documentBuffer = await DocumentGenerator.generateFromContract(contractId, templateType)

    // Create filename
    const filename = `Contract_${contract.contract_number}_${contract.party_b_name.replace(/\s+/g, '_')}.docx`

    // Return document as download
    return new NextResponse(documentBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': documentBuffer.length.toString()
      }
    })
  } catch (error: any) {
    console.error('Error generating contract document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate contract document',
        message: error.message
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const contracts = await prisma.contracts.findMany({
      include: {
        contract_type: true,
        contract_fields: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const contract = await prisma.contracts.create({
      data: {
        contract_number: body.contract_number,
        contract_type_id: body.contract_type_id,
        party_a_name: body.party_a_name,
        party_a_position: body.party_a_position,
        party_a_organization: body.party_a_organization,
        party_b_name: body.party_b_name,
        party_b_position: body.party_b_position,
        party_b_organization: body.party_b_organization,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        location: body.location,
        additional_data: body.additional_data || {},
        status: body.status || 'draft',
        party_a_signature: body.party_a_signature,
        party_a_signed_date: body.party_a_signed_date ? new Date(body.party_a_signed_date) : null,
        party_b_signature: body.party_b_signature,
        party_b_signed_date: body.party_b_signed_date ? new Date(body.party_b_signed_date) : null,
        created_by: body.created_by,
      },
    })

    // Create contract fields if provided
    if (body.fields && Array.isArray(body.fields)) {
      await prisma.contract_fields.createMany({
        data: body.fields.map((field: any) => ({
          contract_id: contract.id,
          field_name: field.field_name,
          field_value: field.field_value,
          field_type: field.field_type,
          is_required: field.is_required || false,
        })),
      })
    }

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    )
  }
}
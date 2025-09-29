import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single contract
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    const contract = await prisma.contracts.findUnique({
      where: { id },
      include: {
        contract_type: true,
        contract_fields: true,
      },
    })

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error fetching contract:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    )
  }
}

// UPDATE contract
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()

    const contract = await prisma.contracts.update({
      where: { id },
      data: {
        party_a_name: body.party_a_name,
        party_a_position: body.party_a_position,
        party_a_organization: body.party_a_organization,
        party_b_name: body.party_b_name,
        party_b_position: body.party_b_position,
        party_b_organization: body.party_b_organization,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        location: body.location,
        additional_data: body.additional_data,
        status: body.status,
        party_a_signature: body.party_a_signature,
        party_a_signed_date: body.party_a_signed_date ? new Date(body.party_a_signed_date) : null,
        party_b_signature: body.party_b_signature,
        party_b_signed_date: body.party_b_signed_date ? new Date(body.party_b_signed_date) : null,
      },
    })

    // Update contract fields if provided
    if (body.fields && Array.isArray(body.fields)) {
      // Delete existing fields
      await prisma.contract_fields.deleteMany({
        where: { contract_id: id },
      })

      // Create new fields
      await prisma.contract_fields.createMany({
        data: body.fields.map((field: any) => ({
          contract_id: id,
          field_name: field.field_name,
          field_value: field.field_value,
          field_type: field.field_type,
          is_required: field.is_required || false,
        })),
      })
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error updating contract:', error)
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    )
  }
}

// DELETE contract
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    // Delete related fields first
    await prisma.contract_fields.deleteMany({
      where: { contract_id: id },
    })

    // Delete the contract
    await prisma.contracts.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Contract deleted successfully' })
  } catch (error) {
    console.error('Error deleting contract:', error)
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    )
  }
}
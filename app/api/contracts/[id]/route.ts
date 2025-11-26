import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, createSuccessResponse, notFoundError, validationError } from '@/lib/api-error-handler'
import { getSession } from '@/lib/auth'
import { UserRole } from '@/lib/roles'

// GET single contract
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return validationError('Invalid contract ID', { id: 'Must be a valid number' })
    }

    const contract = await prisma.contracts.findUnique({
      where: { id },
      include: {
        contract_type: true,
        contract_fields: true,
      },
    })

    if (!contract) {
      return notFoundError('Contract')
    }

    return createSuccessResponse(contract, 'Contract fetched successfully')
  } catch (error) {
    return handleApiError(error, `/api/contracts/${(await context.params).id}`)
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

    if (isNaN(id)) {
      return validationError('Invalid contract ID', { id: 'Must be a valid number' })
    }

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

    return createSuccessResponse(contract, 'Contract updated successfully')
  } catch (error) {
    return handleApiError(error, `/api/contracts/${(await context.params).id}`)
  }
}

// DELETE contract
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user data to check role
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true, is_active: true },
    })

    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    // Only SUPER_ADMIN can delete contracts
    if (user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. Only SUPER_ADMIN can delete contracts.' },
        { status: 403 }
      )
    }

    const params = await context.params
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return validationError('Invalid contract ID', { id: 'Must be a valid number' })
    }

    // Check if contract exists
    const contract = await prisma.contracts.findUnique({
      where: { id },
    })

    if (!contract) {
      return notFoundError('Contract')
    }

    // Delete related fields first
    await prisma.contract_fields.deleteMany({
      where: { contract_id: id },
    })

    // Delete the contract
    await prisma.contracts.delete({
      where: { id },
    })

    return createSuccessResponse(
      { id },
      'Contract deleted successfully'
    )
  } catch (error) {
    return handleApiError(error, `/api/contracts/${(await context.params).id}`)
  }
}
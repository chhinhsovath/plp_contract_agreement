import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, createSuccessResponse, validationError } from '@/lib/api-error-handler'

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

    return createSuccessResponse(contracts, 'Contracts fetched successfully')
  } catch (error) {
    return handleApiError(error, '/api/contracts')
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation
    if (!body.contract_number) {
      return validationError('Contract number is required', { contract_number: 'Required field' })
    }
    if (!body.contract_type_id) {
      return validationError('Contract type is required', { contract_type_id: 'Required field' })
    }
    if (!body.party_a_name) {
      return validationError('Party A name is required', { party_a_name: 'Required field' })
    }
    if (!body.party_b_name) {
      return validationError('Party B name is required', { party_b_name: 'Required field' })
    }
    if (!body.start_date) {
      return validationError('Start date is required', { start_date: 'Required field' })
    }
    if (!body.end_date) {
      return validationError('End date is required', { end_date: 'Required field' })
    }

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

    return createSuccessResponse(contract, 'Contract created successfully', 201)
  } catch (error) {
    return handleApiError(error, '/api/contracts')
  }
}
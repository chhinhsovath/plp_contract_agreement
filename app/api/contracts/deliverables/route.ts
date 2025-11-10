/**
 * API endpoint for managing contract deliverable selections
 * POST /api/contracts/deliverables - Save deliverable selections
 * GET /api/contracts/deliverables?contractId=123 - Get selections for a contract
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch deliverable selections for a contract
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractIdParam = searchParams.get('contractId');

    if (!contractIdParam) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Contract ID is required',
            code: 'MISSING_CONTRACT_ID',
            field: 'contractId'
          }
        },
        { status: 400 }
      );
    }

    const contractId = parseInt(contractIdParam);

    // Fetch selections with full deliverable and option data
    const selections = await prisma.contract_deliverable_selections.findMany({
      where: {
        contract_id: contractId
      },
      include: {
        deliverable: true,
        selected_option: true
      },
      orderBy: {
        deliverable: {
          deliverable_number: 'asc'
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          contractId,
          selections,
          total: selections.length
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching deliverable selections:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch deliverable selections',
          code: 'FETCH_SELECTIONS_ERROR',
          meta: {
            error: error.message
          }
        }
      },
      { status: 500 }
    );
  }
}

// POST - Save deliverable selections for a contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, selections, selectedBy } = body;

    // Validation
    if (!contractId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Contract ID is required',
            code: 'MISSING_CONTRACT_ID',
            field: 'contractId'
          }
        },
        { status: 400 }
      );
    }

    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Selections array is required and must not be empty',
            code: 'INVALID_SELECTIONS',
            field: 'selections'
          }
        },
        { status: 400 }
      );
    }

    // Verify contract exists
    const contract = await prisma.contracts.findUnique({
      where: { id: contractId },
      select: { id: true, contract_type_id: true }
    });

    if (!contract) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Contract not found',
            code: 'CONTRACT_NOT_FOUND',
            meta: { contractId }
          }
        },
        { status: 404 }
      );
    }

    // Validate that contract type is 4 or 5
    if (contract.contract_type_id !== 4 && contract.contract_type_id !== 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Deliverable selections are only for Agreement Types 4 and 5',
            code: 'INVALID_CONTRACT_TYPE',
            meta: { contractTypeId: contract.contract_type_id }
          }
        },
        { status: 400 }
      );
    }

    // Validate that we have exactly 5 selections
    if (selections.length !== 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Exactly 5 deliverable selections are required',
            code: 'INCOMPLETE_SELECTIONS',
            meta: {
              provided: selections.length,
              required: 5
            }
          }
        },
        { status: 400 }
      );
    }

    // Validate each selection
    for (const selection of selections) {
      if (!selection.deliverableId || !selection.selectedOptionId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Each selection must have deliverableId and selectedOptionId',
              code: 'INVALID_SELECTION_FORMAT',
              field: 'selections'
            }
          },
          { status: 400 }
        );
      }

      // Verify deliverable exists and belongs to this contract type
      const deliverable = await prisma.contract_deliverables.findFirst({
        where: {
          id: selection.deliverableId,
          contract_type: contract.contract_type_id
        }
      });

      if (!deliverable) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Deliverable ${selection.deliverableId} not found or does not belong to this contract type`,
              code: 'INVALID_DELIVERABLE',
              meta: { deliverableId: selection.deliverableId }
            }
          },
          { status: 400 }
        );
      }

      // Verify option exists and belongs to this deliverable
      const option = await prisma.deliverable_options.findFirst({
        where: {
          id: selection.selectedOptionId,
          deliverable_id: selection.deliverableId
        }
      });

      if (!option) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Option ${selection.selectedOptionId} not found or does not belong to deliverable ${selection.deliverableId}`,
              code: 'INVALID_OPTION',
              meta: {
                optionId: selection.selectedOptionId,
                deliverableId: selection.deliverableId
              }
            }
          },
          { status: 400 }
        );
      }
    }

    // Delete existing selections for this contract (if any)
    await prisma.contract_deliverable_selections.deleteMany({
      where: { contract_id: contractId }
    });

    // Create new selections with baseline data
    const createdSelections = await prisma.contract_deliverable_selections.createMany({
      data: selections.map((selection: any) => ({
        contract_id: contractId,
        deliverable_id: selection.deliverableId,
        selected_option_id: selection.selectedOptionId,
        baseline_percentage: selection.baseline_percentage || 0,
        baseline_source: selection.baseline_source || '',
        baseline_date: selection.baseline_date ? new Date(selection.baseline_date) : new Date(),
        baseline_notes: selection.baseline_notes || null,
        selected_by: selectedBy || null,
        notes: selection.notes || null
      }))
    });

    // Fetch the created selections with full data
    const savedSelections = await prisma.contract_deliverable_selections.findMany({
      where: { contract_id: contractId },
      include: {
        deliverable: true,
        selected_option: true
      },
      orderBy: {
        deliverable: {
          deliverable_number: 'asc'
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          contractId,
          selections: savedSelections,
          total: savedSelections.length
        },
        message: 'Deliverable selections saved successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving deliverable selections:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to save deliverable selections',
          code: 'SAVE_SELECTIONS_ERROR',
          meta: {
            error: error.message
          }
        }
      },
      { status: 500 }
    );
  }
}

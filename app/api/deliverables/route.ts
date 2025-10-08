/**
 * API endpoint for fetching contract deliverables and their options
 * GET /api/deliverables?contractType=4
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractTypeParam = searchParams.get('contractType');

    if (!contractTypeParam) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Contract type is required',
            code: 'MISSING_CONTRACT_TYPE',
            field: 'contractType'
          }
        },
        { status: 400 }
      );
    }

    const contractType = parseInt(contractTypeParam);

    // Validate contract type (only 4 and 5 have deliverables)
    if (contractType !== 4 && contractType !== 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Deliverables are only available for Agreement Types 4 and 5',
            code: 'INVALID_CONTRACT_TYPE',
            field: 'contractType',
            meta: { providedType: contractType }
          }
        },
        { status: 400 }
      );
    }

    // Fetch deliverables with their options
    const deliverables = await prisma.contract_deliverables.findMany({
      where: {
        contract_type: contractType,
        is_active: true
      },
      include: {
        options: {
          where: {
            is_active: true
          },
          orderBy: {
            option_number: 'asc'
          }
        }
      },
      orderBy: {
        deliverable_number: 'asc'
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          contractType,
          deliverables,
          total: deliverables.length
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching deliverables:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch deliverables',
          code: 'FETCH_DELIVERABLES_ERROR',
          meta: {
            error: error.message
          }
        }
      },
      { status: 500 }
    );
  }
}

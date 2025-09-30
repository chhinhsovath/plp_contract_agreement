import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

// Standard API Error Response Interface
export interface ApiErrorResponse {
  success: false
  message: string
  error?: string
  details?: Record<string, any>
  code?: string
  timestamp?: string
  path?: string
}

// Standard API Success Response Interface
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  timestamp?: string
}

// Prisma Error Code Mapping
const PRISMA_ERROR_MESSAGES: Record<string, string> = {
  P2000: 'Value too long for column',
  P2001: 'Record not found',
  P2002: 'Unique constraint violation',
  P2003: 'Foreign key constraint violation',
  P2004: 'Database constraint violation',
  P2005: 'Invalid value for field type',
  P2006: 'Invalid value provided',
  P2007: 'Data validation error',
  P2008: 'Failed to parse query',
  P2009: 'Failed to validate query',
  P2010: 'Raw query failed',
  P2011: 'Null constraint violation',
  P2012: 'Missing required value',
  P2013: 'Missing required argument',
  P2014: 'Required relation violation',
  P2015: 'Related record not found',
  P2016: 'Query interpretation error',
  P2017: 'Records not connected',
  P2018: 'Required connected records not found',
  P2019: 'Input error',
  P2020: 'Value out of range',
  P2021: 'Table does not exist',
  P2022: 'Column does not exist',
  P2023: 'Inconsistent column data',
  P2024: 'Connection pool timeout',
  P2025: 'Record to update/delete not found',
  P2026: 'Unsupported database feature',
  P2027: 'Multiple database errors occurred',
  P2028: 'Transaction API error',
  P2030: 'Cannot find fulltext index',
  P2033: 'Number out of range',
  P2034: 'Transaction failed due to write conflict'
}

// HTTP Status Code Mapping for Prisma Errors
const PRISMA_HTTP_STATUS: Record<string, number> = {
  P2000: 400, // Bad Request
  P2001: 404, // Not Found
  P2002: 409, // Conflict
  P2003: 400, // Bad Request (FK violation)
  P2004: 400, // Bad Request
  P2005: 400, // Bad Request
  P2011: 400, // Bad Request (Null violation)
  P2012: 400, // Bad Request
  P2013: 400, // Bad Request
  P2014: 400, // Bad Request
  P2015: 404, // Not Found
  P2025: 404, // Not Found
  P2024: 503, // Service Unavailable
  P2034: 409  // Conflict
}

/**
 * Extract field information from Prisma error
 */
function extractPrismaDetails(error: any): Record<string, any> {
  const details: Record<string, any> = {}

  if (error.meta) {
    // P2002: Unique constraint
    if (error.meta.target) {
      details.field = Array.isArray(error.meta.target)
        ? error.meta.target.join(', ')
        : error.meta.target
    }

    // P2003: Foreign key constraint
    if (error.meta.field_name) {
      details.field_name = error.meta.field_name
    }

    // P2025: Record not found
    if (error.meta.cause) {
      details.cause = error.meta.cause
    }

    // Include all meta information
    details.meta = error.meta
  }

  return details
}

/**
 * Handle Prisma Known Request Errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError, path?: string): NextResponse<ApiErrorResponse> {
  const code = error.code
  const message = PRISMA_ERROR_MESSAGES[code] || 'Database operation failed'
  const details = extractPrismaDetails(error)
  const statusCode = PRISMA_HTTP_STATUS[code] || 500

  let userMessage = message

  // Provide more user-friendly messages
  switch (code) {
    case 'P2002':
      const field = details.field || 'field'
      userMessage = `${field} already exists`
      break
    case 'P2003':
      const fieldName = details.field_name?.replace(/_fkey$/, '').replace(/_/g, ' ')
      userMessage = `Invalid reference: ${fieldName || 'related record'} does not exist`
      break
    case 'P2025':
      userMessage = 'Record not found'
      break
    case 'P2011':
      userMessage = 'Required field cannot be empty'
      break
  }

  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      message: userMessage,
      error: message,
      details,
      code,
      timestamp: new Date().toISOString(),
      path
    },
    { status: statusCode }
  )
}

/**
 * Handle Prisma Validation Errors
 */
function handlePrismaValidationError(error: Prisma.PrismaClientValidationError, path?: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      message: 'Invalid data provided',
      error: 'Validation error',
      details: {
        validation_error: error.message
      },
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
      path
    },
    { status: 400 }
  )
}

/**
 * Handle generic errors
 */
function handleGenericError(error: any, path?: string): NextResponse<ApiErrorResponse> {
  // Check if it's a known error type
  if (error.statusCode && error.message) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: error.message,
        error: error.name || 'Error',
        details: error.details || {},
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
        path
      },
      { status: error.statusCode }
    )
  }

  // Default 500 error
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      message: 'An unexpected error occurred',
      error: error.message || 'Internal server error',
      details: {
        error_type: error.constructor?.name || 'Unknown',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path
    },
    { status: 500 }
  )
}

/**
 * Main error handler - use this in all API routes
 */
export function handleApiError(error: unknown, path?: string): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)

  // Prisma Known Request Error (P2xxx codes)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, path)
  }

  // Prisma Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return handlePrismaValidationError(error, path)
  }

  // Prisma Initialization Error
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: 'Database connection failed',
        error: 'Failed to connect to database',
        details: {
          error_code: error.errorCode
        },
        code: 'DB_CONNECTION_ERROR',
        timestamp: new Date().toISOString(),
        path
      },
      { status: 503 }
    )
  }

  // Generic error
  return handleGenericError(error, path)
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

/**
 * Create a custom error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 400,
  errorType?: string,
  details?: Record<string, any>,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      message,
      error: errorType || 'Error',
      details,
      code: code || `HTTP_${statusCode}`,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  )
}

/**
 * Validation error helper
 */
export function validationError(
  message: string,
  fields?: Record<string, string>
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    400,
    'Validation Error',
    { fields },
    'VALIDATION_ERROR'
  )
}

/**
 * Not found error helper
 */
export function notFoundError(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    `${resource} not found`,
    404,
    'Not Found',
    { resource },
    'NOT_FOUND'
  )
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(
  message: string = 'Unauthorized access'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    401,
    'Unauthorized',
    {},
    'UNAUTHORIZED'
  )
}

/**
 * Forbidden error helper
 */
export function forbiddenError(
  message: string = 'Access forbidden'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    403,
    'Forbidden',
    {},
    'FORBIDDEN'
  )
}
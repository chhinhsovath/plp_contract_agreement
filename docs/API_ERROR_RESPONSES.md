# API Error Response Format

## Overview

All API endpoints now return detailed, structured error responses that help with debugging and provide clear information about what went wrong.

## Error Response Structure

### Standard Error Response

```typescript
{
  success: false,
  message: string,        // User-friendly error message
  error?: string,         // Technical error description
  details?: object,       // Additional error details
  code?: string,          // Error code (Prisma/HTTP/Custom)
  timestamp?: string,     // ISO 8601 timestamp
  path?: string           // API endpoint path
}
```

### Standard Success Response

```typescript
{
  success: true,
  data: any,             // Response data
  message?: string,      // Optional success message
  timestamp?: string     // ISO 8601 timestamp
}
```

## Examples

### ✅ Before (Generic Error)
```json
{
  "error": "Failed to create contract"
}
```

### ✅ After (Detailed Error Response)

#### 1. Foreign Key Constraint Violation (P2003)

```json
{
  "success": false,
  "message": "Invalid reference: contract type does not exist",
  "error": "Foreign key constraint violation",
  "details": {
    "field_name": "contract_type_id_fkey",
    "meta": {
      "field_name": "contract_type_id_fkey"
    }
  },
  "code": "P2003",
  "timestamp": "2025-09-30T10:30:00.000Z",
  "path": "/api/contracts"
}
```

#### 2. Unique Constraint Violation (P2002)

```json
{
  "success": false,
  "message": "phone_number already exists",
  "error": "Unique constraint violation",
  "details": {
    "field": "phone_number",
    "meta": {
      "target": ["phone_number"]
    }
  },
  "code": "P2002",
  "timestamp": "2025-09-30T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

#### 3. Record Not Found (P2025)

```json
{
  "success": false,
  "message": "Record not found",
  "error": "Record to update/delete not found",
  "details": {
    "cause": "Record to update not found.",
    "meta": {
      "cause": "Record to update not found."
    }
  },
  "code": "P2025",
  "timestamp": "2025-09-30T10:30:00.000Z",
  "path": "/api/contracts/999"
}
```

#### 4. Validation Error

```json
{
  "success": false,
  "message": "Phone number is required",
  "error": "Validation Error",
  "details": {
    "fields": {
      "phone_number": "Required field"
    }
  },
  "code": "VALIDATION_ERROR",
  "timestamp": "2025-09-30T10:30:00.000Z",
  "path": "/api/auth/login"
}
```

#### 5. Unauthorized Error (401)

```json
{
  "success": false,
  "message": "លេខទូរស័ព្ទមិនត្រឹមត្រូវ",
  "error": "Unauthorized",
  "details": {},
  "code": "UNAUTHORIZED",
  "timestamp": "2025-09-30T10:30:00.000Z"
}
```

#### 6. Forbidden Error (403)

```json
{
  "success": false,
  "message": "គណនីរបស់អ្នកត្រូវបានផ្អាក",
  "error": "Forbidden",
  "details": {},
  "code": "FORBIDDEN",
  "timestamp": "2025-09-30T10:30:00.000Z"
}
```

#### 7. Not Found Error (404)

```json
{
  "success": false,
  "message": "Contract not found",
  "error": "Not Found",
  "details": {
    "resource": "Contract"
  },
  "code": "NOT_FOUND",
  "timestamp": "2025-09-30T10:30:00.000Z",
  "path": "/api/contracts/123"
}
```

## Success Response Examples

### GET Request Success

```json
{
  "success": true,
  "data": {
    "id": 1,
    "contract_number": "CTR-2025-001",
    "party_a_name": "Ministry of Education",
    "party_b_name": "School ABC"
  },
  "message": "Contract fetched successfully",
  "timestamp": "2025-09-30T10:30:00.000Z"
}
```

### POST Request Success

```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "phone_number": "0123456789",
    "role": "PARTNER"
  },
  "message": "User registered successfully",
  "timestamp": "2025-09-30T10:30:00.000Z"
}
```

## Prisma Error Codes

### Common Error Codes

| Code | Message | HTTP Status | Description |
|------|---------|-------------|-------------|
| P2000 | Value too long for column | 400 | Value exceeds column size |
| P2001 | Record not found | 404 | Record doesn't exist in database |
| P2002 | Unique constraint violation | 409 | Duplicate value for unique field |
| P2003 | Foreign key constraint violation | 400 | Referenced record doesn't exist |
| P2011 | Null constraint violation | 400 | Required field is null |
| P2012 | Missing required value | 400 | Required field missing |
| P2014 | Required relation violation | 400 | Required relation missing |
| P2015 | Related record not found | 404 | Referenced record not found |
| P2025 | Record to update/delete not found | 404 | Cannot find record to modify |
| P2024 | Connection pool timeout | 503 | Database connection timeout |
| P2034 | Transaction failed | 409 | Write conflict in transaction |

## Using the Error Handler

### In API Routes

```typescript
import { handleApiError, createSuccessResponse, validationError, notFoundError } from '@/lib/api-error-handler'

export async function GET(request: Request) {
  try {
    // Validation
    if (!id) {
      return validationError('ID is required', { id: 'Required field' })
    }

    // Database query
    const data = await prisma.contracts.findUnique({
      where: { id }
    })

    // Not found check
    if (!data) {
      return notFoundError('Contract')
    }

    // Success response
    return createSuccessResponse(data, 'Contract fetched successfully')
  } catch (error) {
    // Automatic error handling with Prisma error mapping
    return handleApiError(error, '/api/contracts')
  }
}
```

### Available Helper Functions

```typescript
// Success response
createSuccessResponse(data, message?, status = 200)

// Error responses
handleApiError(error, path?) // Automatic Prisma error mapping
validationError(message, fields?)
notFoundError(resource = 'Resource')
unauthorizedError(message = 'Unauthorized access')
forbiddenError(message = 'Access forbidden')
createErrorResponse(message, statusCode, errorType?, details?, code?)
```

## Benefits

### 1. **Better Debugging**
- Detailed error messages show exactly what went wrong
- Prisma error codes mapped to user-friendly messages
- Field-level details help identify the problem

### 2. **Improved User Experience**
- Clear, actionable error messages
- Localized messages (Khmer/English)
- Consistent error format across all endpoints

### 3. **Faster Development**
- No more "Failed" messages without context
- Errors point directly to the problem
- Easy to integrate with frontend error handling

### 4. **Production Ready**
- Proper HTTP status codes
- Timestamps for logging and debugging
- Path information for tracing requests

## Frontend Integration

### Example: Handling API Errors

```typescript
try {
  const response = await fetch('/api/contracts', {
    method: 'POST',
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!result.success) {
    // Show detailed error to user
    console.error('Error:', result.error)
    console.error('Details:', result.details)
    console.error('Code:', result.code)

    // Display user-friendly message
    message.error(result.message)
  } else {
    // Success
    message.success(result.message)
    setData(result.data)
  }
} catch (error) {
  message.error('Network error occurred')
}
```

## Migration Guide

### Updating Existing API Routes

**Before:**
```typescript
catch (error) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: 'Failed' },
    { status: 500 }
  )
}
```

**After:**
```typescript
catch (error) {
  return handleApiError(error, '/api/your-endpoint')
}
```

That's it! The error handler automatically:
- Maps Prisma errors to user-friendly messages
- Extracts field-level details
- Returns proper HTTP status codes
- Includes timestamps and paths
- Provides error codes for client-side handling

## Updated Endpoints

✅ `/api/contracts` - List and create contracts
✅ `/api/contracts/[id]` - Get, update, delete contract
✅ `/api/auth/login` - User authentication

More endpoints being updated...

## Support

For questions or issues with error handling, see:
- `lib/api-error-handler.ts` - Error handling implementation
- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
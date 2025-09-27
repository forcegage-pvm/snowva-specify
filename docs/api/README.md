# Snowva API Documentation

## Overview

Snowva provides a comprehensive REST API for managing quotes, timelines, and PDF generation. The API follows REST conventions and returns JSON responses.

**Base URL**: `https://api.snowva.com/api/v1`  
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`

## Error Handling

All API endpoints follow consistent error response formats:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "quoteId",
        "message": "Quote ID is required and must be a valid UUID"
      }
    ],
    "timestamp": "2024-01-20T10:30:00Z",
    "traceId": "abc123def456"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (resource already exists)
- `422` - Unprocessable Entity (business logic errors)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Authentication

All API requests require authentication using a Bearer token:

```bash
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

API requests are rate-limited per user:
- **Standard**: 100 requests per minute
- **PDF Generation**: 10 requests per minute
- **Bulk Operations**: 5 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642684200
```

## Quotes API

### Get Quote

Retrieve a specific quote by ID.

**Endpoint**: `GET /quotes/{quoteId}`

**Parameters**:
- `quoteId` (path, required): UUID of the quote

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "quoteNumber": "QT-2024-001",
  "customerName": "Acme Corporation",
  "customerEmail": "contact@acme.com",
  "status": "draft",
  "validUntil": "2024-02-20T23:59:59Z",
  "items": [
    {
      "id": "item-1",
      "description": "Professional Services",
      "quantity": 40,
      "unitPrice": 150.00,
      "totalPrice": 6000.00
    }
  ],
  "subtotal": 6000.00,
  "tax": 480.00,
  "total": 6480.00,
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

**Error Responses**:
- `404` - Quote not found
- `403` - Access denied

### Create Quote

Create a new quote.

**Endpoint**: `POST /quotes`

**Request Body**:
```json
{
  "customerName": "Acme Corporation",
  "customerEmail": "contact@acme.com",
  "validUntil": "2024-02-20T23:59:59Z",
  "items": [
    {
      "description": "Professional Services",
      "quantity": 40,
      "unitPrice": 150.00
    }
  ],
  "notes": "Custom requirements discussed"
}
```

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "quoteNumber": "QT-2024-001",
  // ... full quote object
}
```

### Update Quote

Update an existing quote.

**Endpoint**: `PUT /quotes/{quoteId}`

**Parameters**:
- `quoteId` (path, required): UUID of the quote

**Request Body**: Same as Create Quote

**Response** (200): Updated quote object

**Error Responses**:
- `404` - Quote not found
- `409` - Quote cannot be updated (e.g., already accepted)
- `422` - Business validation errors

### Delete Quote

Delete a quote (soft delete).

**Endpoint**: `DELETE /quotes/{quoteId}`

**Response** (204): No content

### List Quotes

Retrieve paginated list of quotes.

**Endpoint**: `GET /quotes`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (`draft`, `sent`, `accepted`, `rejected`)
- `customerName` (optional): Filter by customer name (partial match)
- `createdAfter` (optional): ISO 8601 date
- `createdBefore` (optional): ISO 8601 date

**Response** (200):
```json
{
  "quotes": [
    // ... array of quote objects
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## Timeline API

### Get Quote Timeline

Retrieve the timeline/history of events for a quote.

**Endpoint**: `GET /quotes/{quoteId}/timeline`

**Parameters**:
- `quoteId` (path, required): UUID of the quote

**Query Parameters**:
- `limit` (optional): Number of events to return (default: 50, max: 200)
- `eventType` (optional): Filter by event type
- `userId` (optional): Filter by user who performed the action

**Response** (200):
```json
{
  "quoteId": "550e8400-e29b-41d4-a716-446655440000",
  "events": [
    {
      "id": "timeline-event-1",
      "type": "quote_created",
      "title": "Quote Created",
      "description": "Initial quote created with 3 items",
      "timestamp": "2024-01-20T10:30:00Z",
      "userId": "user-123",
      "userName": "John Doe",
      "metadata": {
        "itemCount": 3,
        "total": 6480.00
      }
    },
    {
      "id": "timeline-event-2",
      "type": "quote_updated",
      "title": "Quote Updated",
      "description": "Items modified, total changed",
      "timestamp": "2024-01-20T15:45:00Z",
      "userId": "user-123",
      "userName": "John Doe",
      "metadata": {
        "changes": ["items", "total"],
        "previousTotal": 6480.00,
        "newTotal": 7200.00
      }
    },
    {
      "id": "timeline-event-3",
      "type": "quote_sent",
      "title": "Quote Sent",
      "description": "Quote sent to customer via email",
      "timestamp": "2024-01-21T09:15:00Z",
      "userId": "user-456",
      "userName": "Jane Smith",
      "metadata": {
        "recipientEmail": "contact@acme.com",
        "method": "email"
      }
    }
  ],
  "pagination": {
    "hasMore": false,
    "total": 3
  }
}
```

**Performance**: Timeline API is optimized for <500ms response time.

**Error Responses**:
- `404` - Quote not found
- `403` - Access denied

## PDF Generation API

### Generate Quote PDF

Generate a PDF document for a quote.

**Endpoint**: `POST /quotes/{quoteId}/pdf`

**Parameters**:
- `quoteId` (path, required): UUID of the quote

**Request Body**:
```json
{
  "template": "standard",
  "options": {
    "includeItemImages": true,
    "includeTermsAndConditions": true,
    "logoUrl": "https://cdn.example.com/logo.png",
    "customNotes": "Additional project requirements",
    "format": "A4",
    "orientation": "portrait"
  }
}
```

**Template Options**:
- `standard` - Clean, professional layout
- `detailed` - Comprehensive format with extra sections
- `minimal` - Simplified layout for quick quotes
- `custom` - Uses company-specific branding

**Response** (200):
```json
{
  "pdfUrl": "https://cdn.snowva.com/pdfs/quote-550e8400.pdf",
  "downloadUrl": "https://api.snowva.com/api/v1/files/quote-550e8400.pdf",
  "expiresAt": "2024-01-27T10:30:00Z",
  "fileSize": 245760,
  "pageCount": 3,
  "generatedAt": "2024-01-20T10:30:15Z"
}
```

**Performance**: PDF generation is optimized for <2s response time.

**Error Responses**:
- `404` - Quote not found
- `422` - PDF generation failed (invalid template, missing data)
- `429` - PDF generation rate limit exceeded

### Generate PDF Preview

Generate a preview image of the quote PDF.

**Endpoint**: `POST /quotes/{quoteId}/pdf/preview`

**Parameters**:
- `quoteId` (path, required): UUID of the quote

**Request Body**:
```json
{
  "template": "standard",
  "page": 1,
  "format": "png",
  "width": 800,
  "quality": 85
}
```

**Response** (200):
```json
{
  "previewUrl": "https://cdn.snowva.com/previews/quote-550e8400-p1.png",
  "width": 800,
  "height": 1131,
  "format": "png",
  "fileSize": 125440,
  "expiresAt": "2024-01-21T10:30:00Z"
}
```

**Performance**: Preview generation is optimized for <1s response time.

### Batch PDF Generation

Generate PDFs for multiple quotes simultaneously.

**Endpoint**: `POST /quotes/batch/pdf`

**Request Body**:
```json
{
  "quoteIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "template": "standard",
  "options": {
    "includeItemImages": false,
    "format": "A4"
  }
}
```

**Response** (202): Accepted - Returns job ID for status tracking
```json
{
  "jobId": "batch-job-789",
  "status": "processing",
  "totalQuotes": 2,
  "estimatedCompletion": "2024-01-20T10:32:00Z",
  "statusUrl": "/jobs/batch-job-789"
}
```

### Get Batch Job Status

Check the status of a batch PDF generation job.

**Endpoint**: `GET /jobs/{jobId}`

**Response** (200):
```json
{
  "jobId": "batch-job-789",
  "status": "completed",
  "totalQuotes": 2,
  "completedQuotes": 2,
  "failedQuotes": 0,
  "results": [
    {
      "quoteId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "success",
      "pdfUrl": "https://cdn.snowva.com/pdfs/quote-550e8400.pdf"
    },
    {
      "quoteId": "550e8400-e29b-41d4-a716-446655440001",
      "status": "success",
      "pdfUrl": "https://cdn.snowva.com/pdfs/quote-550e8401.pdf"
    }
  ],
  "createdAt": "2024-01-20T10:30:00Z",
  "completedAt": "2024-01-20T10:31:45Z"
}
```

## Webhook Events

Snowva can send webhook notifications for various events:

### Webhook Configuration

**Endpoint**: `POST /webhooks`

**Request Body**:
```json
{
  "url": "https://your-app.com/webhooks/snowva",
  "events": ["quote.created", "quote.updated", "quote.sent", "pdf.generated"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload Format

```json
{
  "event": "quote.created",
  "timestamp": "2024-01-20T10:30:00Z",
  "data": {
    "quoteId": "550e8400-e29b-41d4-a716-446655440000",
    "quoteNumber": "QT-2024-001",
    "customerName": "Acme Corporation",
    "total": 6480.00
  },
  "signature": "sha256=abc123..."
}
```

### Supported Events

- `quote.created` - New quote created
- `quote.updated` - Quote modified
- `quote.sent` - Quote sent to customer
- `quote.accepted` - Customer accepted quote
- `quote.rejected` - Customer rejected quote
- `pdf.generated` - PDF generation completed
- `pdf.failed` - PDF generation failed

## SDK Examples

### JavaScript/TypeScript

```typescript
import { SnowvaClient } from '@snowva/sdk';

const client = new SnowvaClient({
  apiUrl: 'https://api.snowva.com/api/v1',
  apiKey: 'your-api-key'
});

// Get quote
const quote = await client.quotes.get('550e8400-e29b-41d4-a716-446655440000');

// Get timeline
const timeline = await client.quotes.getTimeline('550e8400-e29b-41d4-a716-446655440000');

// Generate PDF
const pdf = await client.quotes.generatePDF('550e8400-e29b-41d4-a716-446655440000', {
  template: 'standard',
  options: { includeItemImages: true }
});
```

### cURL Examples

```bash
# Get quote
curl -X GET \
  https://api.snowva.com/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer your-token"

# Get timeline
curl -X GET \
  https://api.snowva.com/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/timeline \
  -H "Authorization: Bearer your-token"

# Generate PDF
curl -X POST \
  https://api.snowva.com/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/pdf \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"template": "standard", "options": {"includeItemImages": true}}'
```

## Changelog

### v1.3.0 (2024-01-20)
- Added Timeline API with performance optimization (<500ms)
- Enhanced PDF generation API with batch processing
- Added PDF preview generation
- Improved error handling and validation
- Added webhook support for real-time notifications

### v1.2.0 (2023-12-15)
- Added quote filtering and search capabilities
- Improved pagination performance
- Added custom PDF templates
- Enhanced authentication with JWT refresh tokens

### v1.1.0 (2023-11-10)
- Added bulk operations for quotes
- Improved rate limiting with per-endpoint limits
- Added comprehensive audit logging
- Enhanced error response format

### v1.0.0 (2023-10-01)
- Initial API release
- Core quote management functionality
- Basic PDF generation
- Authentication and authorization

## Support

For API support and questions:
- Documentation: [https://docs.snowva.com](https://docs.snowva.com)
- Support: [support@snowva.com](mailto:support@snowva.com)
- Status Page: [https://status.snowva.com](https://status.snowva.com)
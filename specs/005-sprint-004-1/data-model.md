# Data Model: Sprint 004.1 – Technical Debt Resolution

**Date**: September 27, 2025  
**Phase**: 1 - Design & Contracts  
**Status**: Complete

## Entity Definitions

### Timeline Event
**Purpose**: Represents chronological events in a quote's lifecycle  
**Context**: Mock timeline data for development phase

```typescript
interface TimelineEvent {
  id: string;                    // Unique event identifier
  type: EventType;              // Event category
  title: string;                // Human-readable event title
  description: string;          // Detailed event description
  timestamp: string;            // ISO 8601 timestamp
  user: UserInfo;              // User who triggered the event
  metadata?: Record<string, any>; // Optional event-specific data
}

enum EventType {
  CREATED = 'created',
  UPDATED = 'updated', 
  STATUS_CHANGED = 'status_changed',
  CONVERTED = 'converted',
  DUPLICATED = 'duplicated',
  ARCHIVED = 'archived'
}

interface UserInfo {
  name: string;                 // User display name
  avatar?: string;             // Optional avatar URL
  id?: string;                 // Optional user ID for future use
}
```

**Validation Rules**:
- `id` must be unique within timeline
- `timestamp` must be valid ISO 8601 string
- `type` must be one of defined EventType values
- `title` and `description` required, max 255 chars
- `user.name` required, max 100 chars

**State Transitions**: Timeline events are immutable once created

### API Route Parameters  
**Purpose**: Standardized parameter handling for Next.js 15 compatibility  
**Context**: Dynamic route segments in API endpoints

```typescript
interface QuoteRouteParams {
  quoteId: string;              // Quote identifier from URL path
}

interface AsyncRouteParams<T> {
  params: Promise<T>;           // Next.js 15 async parameter wrapper
}

// Usage pattern for all quote API routes
type QuoteApiHandler = (
  request: NextRequest,
  context: AsyncRouteParams<QuoteRouteParams>
) => Promise<Response>;
```

**Validation Rules**:
- `quoteId` must be non-empty string
- Must be awaited before destructuring in Next.js 15
- UUID format recommended for production

### Error Response
**Purpose**: Standardized error objects across all API endpoints  
**Context**: Fail-fast error handling strategy

```typescript
interface ApiErrorResponse {
  error: string;                // Error type/category
  message: string;             // Human-readable error message
  statusCode: number;          // HTTP status code
  timestamp: string;           // ISO 8601 error timestamp
  path: string;                // API endpoint path
  details?: unknown;           // Optional additional error context
}

interface ValidationErrorResponse extends ApiErrorResponse {
  error: 'VALIDATION_ERROR';
  details: {
    issues: ZodIssue[];        // Zod validation issues
    input: unknown;            // Sanitized input that failed validation
  };
}
```

**Validation Rules**:
- `statusCode` must be valid HTTP error code (400-599)
- `message` must be user-friendly (no internal details)
- `timestamp` must be ISO 8601 format
- `path` must match actual request path

### Validation Schema
**Purpose**: Zod schemas for API request/response validation  
**Context**: Comprehensive data validation with clear error feedback

```typescript
// Timeline API schemas
const TimelineEventSchema = z.object({
  id: z.string().min(1),
  type: z.nativeEnum(EventType),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  timestamp: z.string().datetime(),
  user: z.object({
    name: z.string().min(1).max(100),
    avatar: z.string().url().optional(),
    id: z.string().optional()
  }),
  metadata: z.record(z.any()).optional()
});

const TimelineResponseSchema = z.object({
  events: z.array(TimelineEventSchema),
  total: z.number().int().min(0),
  quoteId: z.string().min(1)
});

// Error response schemas
const ApiErrorResponseSchema = z.object({
  error: z.string().min(1),
  message: z.string().min(1),
  statusCode: z.number().int().min(400).max(599),
  timestamp: z.string().datetime(),
  path: z.string().min(1),
  details: z.unknown().optional()
});
```

**Validation Rules**:
- All schemas must validate both input and output
- Error messages must be developer-friendly
- Optional fields clearly marked
- Strict typing with no `any` types in production

### Development Tooling
**Purpose**: Build and testing configuration for quality gates  
**Context**: Developer experience improvements and quality enforcement

```typescript
interface TestCoverageConfig {
  threshold: {
    global: {
      branches: number;         // 90% minimum
      functions: number;        // 90% minimum  
      lines: number;           // 90% minimum
      statements: number;      // 90% minimum
    };
  };
  collectCoverageFrom: string[]; // Files to include in coverage
  coverageReporters: string[];   // Output formats
}

interface BuildQualityGates {
  fastRefreshOptimization: boolean;    // Must be true
  typeScriptStrict: boolean;          // Must pass strict mode
  eslintErrors: number;               // Must be 0
  testCoverage: number;              // Must be >= 90%
}
```

## Entity Relationships

```
Quote (existing)
└── Timeline
    └── TimelineEvent[]
        └── UserInfo

API Request
├── RouteParams (validated)
├── RequestBody (validated via Zod)
└── Response
    ├── Success Data (validated)
    └── Error Response (standardized)

Development Process
├── Source Code
├── Validation Schemas (Zod)
├── Unit Tests (90% coverage)
└── Build Quality Gates
```

## Data Flow Patterns

### Timeline Data Flow
1. Client requests timeline: `GET /api/v1/quotes/[quoteId]/timeline`
2. Route params validated and awaited (Next.js 15)
3. Timeline service generates mock events
4. Response validated against schema
5. Client receives structured timeline data

### Error Handling Flow
1. API operation encounters error
2. Error categorized and formatted
3. First error returned (fail-fast strategy)
4. Client receives standardized error response
5. Error logged with minimal retention

### Validation Flow
1. Request received by API endpoint
2. Route params and body validated via Zod
3. Business logic executed
4. Response data validated before return
5. Any validation failure returns structured error

---

**Next**: API contracts and failing tests generation
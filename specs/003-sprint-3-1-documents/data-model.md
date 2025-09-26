# Data Model – Documents Workspace Export History

_Last updated: 2025-09-26_

## Entities

### DocumentExportRecord
- **id**: string (Snowva export identifier)
- **documentType**: enum (`statement`, `invoice`, `quote`, `compliance`)
- **title**: string (human-readable document name/number)
- **customerBranchId**: string (FK to branch)
- **customerBranchName**: string
- **createdAt**: ISO timestamp (UTC)
- **deliveredChannels**: array of enum (`email`, `portal`, `manual`)
- **status**: enum (`queued`, `sent`, `failed`, `expired`)
- **lastDownloadedAt**: ISO timestamp | null
- **fileSizeBytes**: number
- **previewAssetUrl**: string (signed URL to cached PDF/PNG)
- **shareLinkTokenId**: string | null (FK → ShareLinkToken)
- **auditTrail**: array of AuditEvent

### ShareLinkToken
- **id**: string (unguessable token)
- **exportId**: string (FK → DocumentExportRecord)
- **createdAt**: ISO timestamp
- **expiresAt**: ISO timestamp (createdAt + 30 days)
- **lastAccessedAt**: ISO timestamp | null
- **copiedBy**: string (user email of operator who generated link)
- **accessLog**: array of ShareLinkAccessEvent

### AuditEvent
- **id**: string
- **exportId**: string (FK → DocumentExportRecord)
- **timestamp**: ISO timestamp
- **actor**: string (user email or system)
- **action**: enum (`previewed`, `downloaded`, `resent`, `regenerated`, `share_link_copied`, `share_link_accessed`)
- **context**: JSON blob (e.g., previous vs next status, delivery reason)

### ShareLinkAccessEvent
- **timestamp**: ISO timestamp
- **ipAddress**: string (anonymized)
- **userAgent**: string | null
- **success**: boolean (false if expired or revoked)

### FilterState (UI memory only)
- **search**: string
- **documentTypes**: array of enum
- **statuses**: array of enum
- **channels**: array of enum
- **sort**: enum (`createdAt`, `title`, `status`, `lastDownloadedAt`)
- **page**: number
- **pageSize**: number (default 25)

### DocumentArchiveReference
- **exportId**: string (original record id)
- **archiveLocation**: string (opaque pointer to cold storage)
- **requestedBy**: string (user email)
- **requestedAt**: ISO timestamp
- **status**: enum (`pending`, `fulfilled`, `failed`)
- **deliveryEtaDays**: number | null

## Relationships
- One `DocumentExportRecord` **has zero or one** `ShareLinkToken`.
- One `DocumentExportRecord` **has many** `AuditEvent` entries.
- One `ShareLinkToken` **has many** `ShareLinkAccessEvent` entries.
- `DocumentArchiveReference` exists only for exports older than 365 days; referenced via export id.

## Validation Rules
- `expiresAt` MUST be exactly 30 days after `createdAt`.
- `status = 'expired'` when `expiresAt < now` OR `DocumentExportRecord` retention window exceeded.
- `deliveredChannels` MUST include at least one channel for `status = sent`.
- `shareLinkTokenId` MUST be null if `status = failed` and no successful resend exists.
- `FilterState.page` starts at 1; `pageSize` constrained to 10–100.
- `DocumentArchiveReference` requires `status` transitions: `pending → fulfilled|failed` only.

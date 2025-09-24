# Data Model – 002-core-ui

## DashboardTile

- **Fields**: `id`, `title`, `metricValue`, `trendDirection`, `deltaPct`, `target`, `criticalThreshold`.
- **States**: Normal, Warning (exceeds threshold), Critical (exceeds criticalThreshold).
- **Validation**: `title` required; `metricValue` numeric with currency formatting flag; `trendDirection` ∈ {up, down, flat}.

## CustomerDirectory

- **Fields**: `filters` (search text, status, balance range), `results` (array of CustomerSummary), `pagination` (page, pageSize, totalCount), `lastUpdated`.
- **CustomerSummary**: `customerId`, `displayName`, `parentCompany`, `branchCount`, `outstandingBalance`, `paymentTerms`, `vatNumber`.
- **Relationships**: Links to BranchDetailPanel via `customerId`.
- **Validation**: `results` sorted alphabetically; enforce ≤2 s load SLA; show skeleton state until data hydrated.

## BranchDetailPanel

- **Fields**: `branchId`, `parentCustomerId`, `contactInfo`, `address`, `vatNumber`, `orderHistory`, `outstandingInvoices`, `auditTrail` (array of TimelineEvent).
- **TimelineEvent**: `eventId`, `timestamp`, `eventType`, `actor`, `summary`, `details`.
- **State Transitions**: Editing state (dirty, saved, error).

## ProductCatalogEntry

- **Fields**: `productId`, `name`, `category`, `retailPrice`, `consumerPrice`, `variants`, `currentPricelistVersion`, `customOverrides` (per customer).
- **Relationships**: `customOverrides` references CustomerDirectory entries.
- **Validation**: Prices decimal precision 2; ensure consumerPrice ≥ retailPrice; show change history in timeline feed.

## PriceListVersion

- **Fields**: `versionId`, `effectiveDate`, `createdBy`, `notes`, `items` (array of ProductCatalogEntry snapshots).
- **State Transitions**: Draft → Scheduled → Active → Archived.

## QuoteComposer

- **Fields**: `quoteId`, `customerId`, `lineItems`, `discounts`, `deliveryFee`, `vatSummary`, `status` (Draft, Sent, Accepted, Expired), `source` (Manual, Converted).
- **LineItem**: `productId`, `description`, `quantity`, `unitPrice`, `vatRate`, `totalExVat`.
- **Validation**: Ensure `quantity` ≥1; `unitPrice` locked to price list unless override; recalc totals on change; enforce mandatory VAT + order number for retail conversions.

## InvoiceWorkspace

- **Fields**: `invoiceId`, `customerId`, `associatedQuoteId`, `status` (Draft, Finalized, Cancelled), `lineItems`, `totals`, `paymentStatus`, `auditTrail` (TimelineEvent array).
- **State Transitions**: Draft → Finalized (immutable) with `finalizedBy`, `finalizedAt`; allow reversal only via credit note event (future feature flagged).
- **Validation**: Prevent finalize without VAT number + order reference for retail; totals must match calculated line items; persist sequential invoice number.

## StatementOverview

- **Fields**: `statementId`, `customerId`, `period`, `lineItems` (invoice references), `totalDue`, `dueDate`, `deliveryOptions` (download, email), `lastSentAt`.
- **Validation**: Line items chronological; totals align with invoices; include branch-level grouping metadata.

## PaymentAllocation

- **Fields**: `paymentId`, `customerId`, `amount`, `allocationStrategy` (FIFO, Manual), `allocations` (array of `{invoiceId, amountApplied}`), `remainingBalance`, `notes`.
- **Validation**: Sum of allocations ≤ amount; manual overrides require user confirmation; provide audit event for each change.

## DocumentTimeline

- **Fields**: `entityId`, `entityType` (Quote, Invoice, Statement, Payment), `events` (TimelineEvent array), `filters` (event type, actor), `exportOptions`.
- **Validation**: Events sorted desc by timestamp; ensure event metadata present for audit compliance.

## SessionContext

- **Fields**: `userId`, `lastInteraction`, `timeoutAt`, `warningShown`, `unsavedDrafts`.
- **State Transitions**: Active → Warning (25 min) → AutoLogout (30 min) → Restored (if user chooses Stay Signed In before timeout).
- **Validation**: Warning triggers once per session; auto-save drafts before logout completes.

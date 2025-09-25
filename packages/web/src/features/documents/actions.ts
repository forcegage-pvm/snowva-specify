export class DocumentActionError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message || 'Document action failed');
    this.name = 'DocumentActionError';
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  signal?: AbortSignal;
};

type JsonRecord = Record<string, unknown>;

type ErrorPayload = {
  message?: string;
  error?: string | { message?: string };
  errors?: Array<string | { message?: string } | undefined>;
};

type SendInvoiceEmailRequest = {
  invoiceId: string;
  recipients: string[];
  message?: string;
  includeAttachments?: boolean;
  subject?: string;
  cc?: string[];
  bcc?: string[];
};

export type SendInvoiceEmailResponse = {
  success: boolean;
  dispatchedAt?: string;
  messageId?: string;
  warnings?: string[];
};

export type InvoicePdfDownloadResult = {
  blob: Blob;
  fileName: string;
  contentType: string;
};

type InvoicePdfDownloadOptions = RequestOptions & {
  fileName?: string;
};

type StatementExportRequest = {
  statementId: string;
  format?: 'pdf' | 'csv';
  includeEmail?: boolean;
  recipients?: string[];
  cc?: string[];
  bcc?: string[];
  message?: string;
  includeDownload?: boolean;
};

export type StatementExportResponse = {
  success: boolean;
  downloadUrl?: string;
  dispatchedAt?: string;
  emailedAt?: string;
  warnings?: string[];
};

const toErrorMessage = (payload: ErrorPayload | string | undefined, fallback: string): string => {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
      return payload.message;
    }

    if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
      return payload.error;
    }

    if (payload.error && typeof payload.error === 'object') {
      const candidate = payload.error.message;
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
    }

    if (Array.isArray(payload.errors)) {
      const collected = payload.errors
        .map((item) => {
          if (!item) {
            return undefined;
          }

          if (typeof item === 'string') {
            return item.trim();
          }

          if (typeof item === 'object' && typeof item.message === 'string') {
            return item.message.trim();
          }

          return undefined;
        })
        .filter((item): item is string => Boolean(item && item.length > 0));

      if (collected.length > 0) {
        return collected.join('; ');
      }
    }
  }

  return fallback;
};

const buildActionError = async (response: Response, fallback: string): Promise<DocumentActionError> => {
  let raw = '';

  try {
    raw = await response.text();
  } catch (error) {
    return new DocumentActionError(fallback, response.status, error instanceof Error ? error.message : undefined);
  }

  if (!raw) {
    return new DocumentActionError(fallback, response.status);
  }

  try {
    const payload = JSON.parse(raw) as ErrorPayload | string | undefined;
    const message = toErrorMessage(payload, fallback);
    return new DocumentActionError(message, response.status, payload);
  } catch (parseError) {
    return new DocumentActionError(raw, response.status, parseError instanceof Error ? parseError.message : undefined);
  }
};

const ensureRecipients = (recipients: string[]): void => {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new DocumentActionError('At least one recipient is required', 400);
  }
};

const buildInvoiceEmailPayload = (request: SendInvoiceEmailRequest): JsonRecord => {
  ensureRecipients(request.recipients);

  const payload: JsonRecord = {
    recipients: request.recipients,
  };

  if (typeof request.includeAttachments === 'boolean') {
    payload.includeAttachments = request.includeAttachments;
  }

  if (request.message && request.message.trim().length > 0) {
    payload.message = request.message;
  }

  if (request.subject && request.subject.trim().length > 0) {
    payload.subject = request.subject;
  }

  if (request.cc && request.cc.length > 0) {
    payload.cc = request.cc;
  }

  if (request.bcc && request.bcc.length > 0) {
    payload.bcc = request.bcc;
  }

  return payload;
};

const parseFilenameFromContentDisposition = (headerValue: string | null, fallback: string): string => {
  if (!headerValue) {
    return fallback;
  }

  const filenameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(headerValue);
  if (!filenameMatch) {
    return fallback;
  }

  const encodedName = filenameMatch[1];
  if (encodedName) {
    try {
      return decodeURIComponent(encodedName);
    } catch {
      return encodedName;
    }
  }

  const quotedName = filenameMatch[2];
  return quotedName ?? fallback;
};

export const sendInvoiceEmail = async (
  request: SendInvoiceEmailRequest,
  options?: RequestOptions,
): Promise<SendInvoiceEmailResponse> => {
  const payload = buildInvoiceEmailPayload(request);
  const endpoint = `/api/invoices/${encodeURIComponent(request.invoiceId)}/email`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  if (!response.ok) {
    throw await buildActionError(response, `Unable to email invoice ${request.invoiceId}`);
  }

  if (response.status === 204) {
    return { success: true } satisfies SendInvoiceEmailResponse;
  }

  const data = (await response.json()) as SendInvoiceEmailResponse;
  return data;
};

export const downloadInvoicePdf = async (
  invoiceId: string,
  options?: InvoicePdfDownloadOptions,
): Promise<InvoicePdfDownloadResult> => {
  const endpoint = `/api/invoices/${encodeURIComponent(invoiceId)}/pdf`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/pdf',
    },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw await buildActionError(response, `Unable to download invoice ${invoiceId}`);
  }

  const blob = await response.blob();
  const contentType = response.headers.get('content-type') ?? 'application/pdf';
  const contentDisposition = response.headers.get('content-disposition');
  const fallbackName = options?.fileName ?? `invoice-${invoiceId}.pdf`;
  const fileName = parseFilenameFromContentDisposition(contentDisposition, fallbackName);

  return {
    blob,
    contentType,
    fileName,
  } satisfies InvoicePdfDownloadResult;
};

export const exportStatementDocument = async (
  request: StatementExportRequest,
  options?: RequestOptions,
): Promise<StatementExportResponse> => {
  const { statementId } = request;
  const endpoint = `/api/statements/${encodeURIComponent(statementId)}/export`;
  const payload: JsonRecord = {
    format: request.format ?? 'pdf',
    includeEmail: Boolean(request.includeEmail),
  };

  if (typeof request.includeDownload === 'boolean') {
    payload.includeDownload = request.includeDownload;
  }

  if (request.recipients && request.recipients.length > 0) {
    payload.recipients = request.recipients;
  }

  if (request.cc && request.cc.length > 0) {
    payload.cc = request.cc;
  }

  if (request.bcc && request.bcc.length > 0) {
    payload.bcc = request.bcc;
  }

  if (request.message && request.message.trim().length > 0) {
    payload.message = request.message;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  if (!response.ok) {
    throw await buildActionError(response, `Unable to export statement ${statementId}`);
  }

  if (response.status === 204) {
    return { success: true } satisfies StatementExportResponse;
  }

  const data = (await response.json()) as StatementExportResponse;
  return data;
};

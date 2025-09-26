'use client';

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type MouseEvent,
} from 'react';

import {
    useDocumentExportDetailQuery,
    type DocumentExportAuditLogEvent,
    type DocumentExportDetail,
} from '@/features/documents/hooks/useDocumentExports';
import type {
    DocumentExportChannel,
    DocumentExportStatus,
} from '@/features/documents/types';
import type { DocumentExportListItem } from '@/services/DocumentExportService';

const STATUS_LABELS: Record<DocumentExportStatus, string> = {
  queued: 'Queued',
  sent: 'Sent',
  failed: 'Failed',
  expired: 'Expired',
};

const STATUS_STYLES: Record<DocumentExportStatus, string> = {
  queued: 'border-amber-200 bg-amber-50 text-amber-800',
  sent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
  expired: 'border-slate-200 bg-slate-100 text-slate-600',
};

const CHANNEL_LABELS: Record<DocumentExportChannel, string> = {
  email: 'Email',
  portal: 'Portal',
  manual: 'Manual download',
};

const AUDIT_ACTION_LABELS: Record<DocumentExportAuditLogEvent['action'], string> = {
  previewed: 'Previewed',
  downloaded: 'Downloaded',
  resent: 'Resent',
  regenerated: 'Regenerated',
  share_link_copied: 'Share link copied',
  share_link_accessed: 'Share link accessed',
  sent: 'Sent',
  failed: 'Failed',
  queued: 'Queued',
};

type ShareLinkState = DocumentExportDetail['shareLink'];

type DocumentPreviewModalProps = {
  exportId: string | null;
  isOpen: boolean;
  onClose: () => void;
  initialExport?: DocumentExportListItem | null;
  onShareLinkCopied?: (info: { exportId: string; token: string }) => void;
  onResendSuccess?: (info: {
    exportId: string;
    status: DocumentExportStatus;
    deliveredChannels: DocumentExportChannel[];
    resentAt: string;
    auditEventId: string;
  }) => void;
};

const relativeFormatter = typeof Intl !== 'undefined'
  ? new Intl.RelativeTimeFormat('en-ZA', { numeric: 'auto' })
  : null;

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatRelativeTime = (value?: string | null) => {
  if (!value || !relativeFormatter) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = Date.now();
  const target = date.getTime();
  const diffMs = target - now;

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (Math.abs(diffMs) >= day) {
    return relativeFormatter.format(Math.round(diffMs / day), 'day');
  }

  if (Math.abs(diffMs) >= hour) {
    return relativeFormatter.format(Math.round(diffMs / hour), 'hour');
  }

  return relativeFormatter.format(Math.round(diffMs / minute), 'minute');
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes && bytes !== 0) {
    return '—';
  }

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[exponent]}`;
};

const isShareLinkExpired = (link: ShareLinkState) => {
  if (!link?.expiresAt) {
    return true;
  }

  const expiresAt = new Date(link.expiresAt);
  return Number.isNaN(expiresAt.getTime()) ? true : expiresAt.getTime() <= Date.now();
};

const copyToClipboard = async (value: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard API unavailable');
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const successful = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!successful) {
    throw new Error('Unable to copy value');
  }
};

const formatContextKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const formatContextValue = (key: string, value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'string') {
    if (/At$/.test(key) || /timestamp/i.test(key)) {
      return formatDateTime(value);
    }
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  }

  return '—';
};

export const DocumentPreviewModal = ({
  exportId,
  isOpen,
  onClose,
  initialExport,
  onShareLinkCopied,
  onResendSuccess,
}: DocumentPreviewModalProps) => {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useDocumentExportDetailQuery(exportId, {
    enabled: isOpen && Boolean(exportId),
  });

  const [detail, setDetail] = useState<DocumentExportDetail | null>(null);
  const [shareLink, setShareLink] = useState<ShareLinkState>(null);
  const [shareLinkLoading, setShareLinkLoading] = useState(false);
  const [shareLinkError, setShareLinkError] = useState<string | null>(null);
  const [shareLinkFeedback, setShareLinkFeedback] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'audit'>('summary');

  const isInitialLoading = isLoading || (isFetching && !detail);

  useEffect(() => {
    if (data) {
      setDetail(data);
      setShareLink(data.shareLink);
    }
  }, [data]);

  useEffect(() => {
    if (!isOpen) {
      setDetail(null);
      setShareLink(null);
      setShareLinkError(null);
      setShareLinkFeedback(null);
      setResendError(null);
      setResendFeedback(null);
      setActiveTab('summary');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!shareLinkFeedback) {
      return;
    }

    const timer = window.setTimeout(() => setShareLinkFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [shareLinkFeedback]);

  useEffect(() => {
    if (!resendFeedback) {
      return;
    }

    const timer = window.setTimeout(() => setResendFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [resendFeedback]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const resolvedTitle = detail?.title ?? initialExport?.title ?? 'Document export';
  const resolvedStatus = detail?.status ?? initialExport?.status ?? 'queued';
  const resolvedType = detail?.documentType ?? initialExport?.documentType ?? 'statement';
  const resolvedCreatedAt = detail?.createdAt ?? initialExport?.createdAt ?? null;
  const resolvedBranch = detail?.customerBranch ?? initialExport?.customerBranch ?? null;
  const resolvedDeliveredChannels = detail?.deliveredChannels ?? initialExport?.deliveredChannels ?? [];
  const resolvedFailureReason = detail?.failureReason;
  const preview = detail?.preview ?? null;
  const resolvedFileSize = preview?.fileSizeBytes ?? initialExport?.fileSizeBytes ?? null;

  const shareLinkExpired = shareLink ? isShareLinkExpired(shareLink) : true;
  const shareLinkExpiresLabel = shareLink?.expiresAt ? formatDateTime(shareLink.expiresAt) : null;
  const shareLinkRelative = shareLink?.expiresAt ? formatRelativeTime(shareLink.expiresAt) : null;

  const auditEvents = useMemo(() => {
    if (!detail?.auditTrail) {
      return [] as DocumentExportAuditLogEvent[];
    }

    return [...detail.auditTrail].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [detail?.auditTrail]);

  const isResendAllowed = ['failed', 'expired'].includes(resolvedStatus);

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDialogClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  const handleCopyShareLink = useCallback(async () => {
    if (!exportId) {
      return;
    }

    setShareLinkError(null);
    setShareLinkFeedback(null);
    setShareLinkLoading(true);

    try {
      let nextLink = shareLink ?? null;
      let generatedNewLink = false;

      if (!nextLink || shareLinkExpired) {
        const response = await fetch(`/api/v1/document-exports/${exportId}/share-link`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Unable to generate share link');
        }

        const payload = (await response.json()) as { token: string; expiresAt: string };
        nextLink = {
          token: payload.token,
          expiresAt: payload.expiresAt,
          public: true,
        };
        generatedNewLink = true;
        setShareLink(nextLink);
        setDetail((previous) => (previous ? { ...previous, shareLink: nextLink } : previous));
      }

      if (!nextLink?.token) {
        throw new Error('Share link not available');
      }

      await copyToClipboard(nextLink.token);

      setShareLinkFeedback(
        generatedNewLink
          ? 'Generated a new public link and copied it to your clipboard.'
          : 'Copied the public link to your clipboard.',
      );
      setShareLinkError(null);
      onShareLinkCopied?.({ exportId, token: nextLink.token });

      if (generatedNewLink) {
        void refetch();
      }
    } catch (copyError) {
      console.error(copyError);
      setShareLinkError('Unable to copy the public link right now. Please try again.');
    } finally {
      setShareLinkLoading(false);
    }
  }, [exportId, shareLink, shareLinkExpired, onShareLinkCopied, refetch]);

  const handleResend = useCallback(async () => {
    if (!exportId) {
      return;
    }

    setResendError(null);
    setResendFeedback(null);
    setResendLoading(true);

    try {
      const response = await fetch(`/api/v1/document-exports/${exportId}/resend`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Unable to resend document export');
      }

      const payload = (await response.json()) as {
        status: DocumentExportStatus;
        resentAt: string;
        deliveredChannels: DocumentExportChannel[];
        auditEventId: string;
      };

      setResendFeedback('Resend requested successfully. We will notify you once delivered.');
      setDetail((previous) =>
        previous
          ? {
              ...previous,
              status: payload.status,
              deliveredChannels: payload.deliveredChannels,
            }
          : previous,
      );
      onResendSuccess?.({
        exportId,
        status: payload.status,
        deliveredChannels: payload.deliveredChannels,
        resentAt: payload.resentAt,
        auditEventId: payload.auditEventId,
      });
      void refetch();
    } catch (resendErr) {
      console.error(resendErr);
      setResendError('Unable to resend this document at the moment. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  }, [exportId, onResendSuccess, refetch]);

  const renderAuditContext = useCallback(
    (context?: DocumentExportAuditLogEvent['context']) => {
      if (!context) {
        return null;
      }

      const entries = Object.entries(context);
      if (!entries.length) {
        return null;
      }

      return (
        <ul className="mt-2 space-y-1 text-xs text-slate-500">
          {entries.map(([key, value]) => (
            <li key={key}>
              <span className="font-medium text-slate-600">{formatContextKey(key)}:</span>{' '}
              {formatContextValue(key, value)}
            </li>
          ))}
        </ul>
      );
    },
    [],
  );

  if (!isOpen) {
    return null;
  }

  if (!exportId) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
        role="presentation"
        data-testid="documents-preview-modal"
        onClick={handleOverlayClick}
      >
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl"
          onClick={handleDialogClick}
        >
          <p className="text-sm text-slate-600">No document export selected.</p>
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const summaryTabSelected = activeTab === 'summary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
      role="presentation"
      data-testid="documents-preview-modal"
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-preview-title"
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={handleDialogClick}
      >
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Close preview"
          onClick={onClose}
        >
          <span aria-hidden>&times;</span>
        </button>

        <header className="border-b border-slate-200 px-6 pb-5 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Document preview</p>
              <h2 id="document-preview-title" className="mt-1 text-xl font-semibold text-slate-900">
                {resolvedTitle}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                  {resolvedType.replace(/_/g, ' ')}
                </span>
                {resolvedBranch ? (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Branch:</span>
                    <span>{resolvedBranch.name}</span>
                  </span>
                ) : null}
                {resolvedCreatedAt ? (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Created:</span>
                    <time dateTime={resolvedCreatedAt}>{formatDateTime(resolvedCreatedAt)}</time>
                  </span>
                ) : null}
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[resolvedStatus]}`}
            >
              {STATUS_LABELS[resolvedStatus]}
            </span>
          </div>
        </header>

        <div className="max-h-[80vh] overflow-y-auto px-6 pb-8 pt-5">
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
              <p>We couldn&rsquo;t load the document preview.</p>
              <p className="mt-1 text-xs text-rose-600">{error.message}</p>
              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
                onClick={() => {
                  void refetch();
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Document preview sections">
                <button
                  type="button"
                  role="tab"
                  aria-selected={summaryTabSelected}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                    summaryTabSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveTab('summary')}
                >
                  Summary
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!summaryTabSelected}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                    !summaryTabSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveTab('audit')}
                >
                  Audit trail
                </button>
              </div>

              <div className="mt-5">
                {summaryTabSelected ? (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
                    <div>
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {isInitialLoading ? (
                          <div className="flex h-full w-full items-center justify-center animate-pulse text-sm text-slate-400">
                            Loading preview…
                          </div>
                        ) : preview ? (
                          <iframe
                            title="Document preview"
                            src={preview.assetUrl}
                            className="h-full w-full"
                            aria-label="Document preview content"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                            <span>No preview available</span>
                            <span className="text-xs text-slate-400">Download the file to view the original document.</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <a
                          href={preview?.assetUrl ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                            preview?.assetUrl
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                          }`}
                          download
                          aria-disabled={!preview?.assetUrl}
                          data-testid="documents-preview-download"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyShareLink}
                          disabled={shareLinkLoading || isInitialLoading}
                          className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                            shareLinkLoading || isInitialLoading
                              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                          data-testid="documents-preview-share-link"
                        >
                          {shareLinkLoading
                            ? 'Copying…'
                            : shareLinkExpired
                              ? 'Generate new public link'
                              : 'Copy public link'}
                        </button>
                      </div>

                      <div className={`mt-4 rounded-lg border p-4 ${
                        shareLink && !shareLinkExpired
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-amber-200 bg-amber-50'
                      }`}
                      >
                        <p className="text-sm font-semibold text-slate-800">
                          {shareLink && !shareLinkExpired ? 'Public link is active' : 'Public link unavailable or expired'}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          Public links are view-only and accessible by anyone with the URL.{' '}
                          {shareLink && shareLinkExpiresLabel ? (
                            <>
                              {shareLinkExpired ? 'Expired on ' : 'Expires on '}
                              <time dateTime={shareLink.expiresAt}>{shareLinkExpiresLabel}</time>
                              {shareLinkRelative ? ` (${shareLinkRelative})` : null}
                            </>
                          ) : (
                            'Generate a link to share this document externally.'
                          )}
                        </p>
                        {shareLinkError ? (
                          <p className="mt-2 text-xs text-rose-600" role="alert">
                            {shareLinkError}
                          </p>
                        ) : null}
                        {shareLinkFeedback ? (
                          <p className="mt-2 text-xs text-emerald-700" role="status">
                            {shareLinkFeedback}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-sm font-semibold text-slate-700">Document details</h3>
                        <dl className="mt-3 space-y-3 text-sm text-slate-600">
                          <div className="flex items-start justify-between gap-3">
                            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</dt>
                            <dd>
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[resolvedStatus]}`}>
                                {STATUS_LABELS[resolvedStatus]}
                              </span>
                            </dd>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivered via</dt>
                            <dd className="flex flex-wrap gap-1">
                              {resolvedDeliveredChannels.length ? (
                                resolvedDeliveredChannels.map((channel) => (
                                  <span
                                    key={channel}
                                    className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600"
                                  >
                                    {CHANNEL_LABELS[channel] ?? channel}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">Not yet delivered</span>
                              )}
                            </dd>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">File size</dt>
                            <dd>{formatBytes(resolvedFileSize)}</dd>
                          </div>
                          {shareLink ? (
                            <div className="flex items-start justify-between gap-3">
                              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public link</dt>
                              <dd className="text-right">
                                <p>{shareLinkExpired ? 'Expired' : 'Active'}</p>
                                {shareLinkExpiresLabel ? (
                                  <p className="text-xs text-slate-400">{shareLinkExpired ? 'Expired on ' : 'Expires on '}{shareLinkExpiresLabel}</p>
                                ) : null}
                              </dd>
                            </div>
                          ) : null}
                        </dl>
                      </section>

                      {isResendAllowed ? (
                        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <h3 className="text-sm font-semibold text-amber-800">Delivery issue</h3>
                          <p className="mt-1 text-sm text-amber-700">
                            {resolvedFailureReason ?? 'This document failed to deliver. Try resending to attempt delivery again.'}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handleResend}
                              disabled={resendLoading}
                              className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                                resendLoading
                                  ? 'cursor-not-allowed border border-amber-200 bg-amber-100 text-amber-500'
                                  : 'bg-amber-600 text-white shadow-sm hover:bg-amber-700'
                              }`}
                              data-testid="documents-preview-resend"
                            >
                              {resendLoading ? 'Resending…' : 'Resend document'}
                            </button>
                          </div>
                          {resendError ? (
                            <p className="mt-2 text-xs text-rose-600" role="alert">
                              {resendError}
                            </p>
                          ) : null}
                          {resendFeedback ? (
                            <p className="mt-2 text-xs text-emerald-700" role="status">
                              {resendFeedback}
                            </p>
                          ) : null}
                        </section>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <section className="rounded-xl border border-slate-200 bg-white p-4">
                    {isInitialLoading ? (
                      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                        Loading audit trail…
                      </div>
                    ) : auditEvents.length === 0 ? (
                      <div className="flex h-40 items-center justify-center text-center text-sm text-slate-500">
                        No audit events recorded yet.
                      </div>
                    ) : (
                      <ul className="space-y-4" data-testid="documents-preview-audit-list">
                        {auditEvents.map((event) => (
                          <li
                            key={event.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="font-semibold text-slate-800">
                                {AUDIT_ACTION_LABELS[event.action] ?? event.action}
                              </div>
                              <time
                                className="text-xs text-slate-500"
                                dateTime={event.timestamp}
                              >
                                {formatDateTime(event.timestamp)}
                              </time>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{event.actor}</p>
                            {renderAuditContext(event.context)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

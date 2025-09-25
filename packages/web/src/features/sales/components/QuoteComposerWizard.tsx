'use client';

import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { readDraftFromCache, useDraftAutosave } from '../hooks/useDraftAutosave';

export type QuoteComposerStep = 'details' | 'items' | 'review';

export type QuoteLineItem = {
  lineId: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type QuoteDiscount = {
  discountId: string;
  label: string;
  amount: number;
  type: 'percentage' | 'fixed';
};

export type QuoteDraft = {
  quoteId: string;
  customerId: string;
  customerName?: string;
  orderNumber?: string;
  vatNumber?: string;
  currency: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  steps: QuoteComposerStep[];
  activeStep: QuoteComposerStep;
  lineItems: QuoteLineItem[];
  discounts: QuoteDiscount[];
  deliveryFee?: number;
  notes?: string;
};

type QuoteComposerWizardProps = {
  initialQuote: QuoteDraft;
  onStepChange?: (step: QuoteComposerStep) => void;
  onSubmit: (quote: QuoteDraft) => void;
  onPreview: (quote: QuoteDraft) => void;
  onCancel?: () => void;
};
const ensureSteps = (steps: QuoteComposerStep[]): QuoteComposerStep[] => {
  if (!steps || steps.length === 0) {
    return ['details', 'items', 'review'];
  }

  return steps;
};

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(value);

export const QuoteComposerWizard: FC<QuoteComposerWizardProps> = ({
  initialQuote,
  onStepChange,
  onSubmit,
  onPreview,
  onCancel,
}) => {
  const cachedDraft = useMemo(
    () => readDraftFromCache<QuoteDraft>('quote', initialQuote.quoteId),
    [initialQuote.quoteId],
  );

  const deriveQuoteState = useMemo(() => {
    const base = cachedDraft?.draft ? { ...initialQuote, ...cachedDraft.draft } : initialQuote;
    const steps = ensureSteps(base.steps);
    const activeStep = steps.includes(base.activeStep) ? base.activeStep : steps[0];

    return {
      quote: { ...base, steps, activeStep },
      steps,
      activeStep,
    };
  }, [cachedDraft, initialQuote]);

  const [quote, setQuote] = useState<QuoteDraft>(deriveQuoteState.quote);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    let changed = false;
    const nextQuote = deriveQuoteState.quote;

    setQuote((prev) => {
      const prevSnapshot = JSON.stringify(prev);
      const nextSnapshot = JSON.stringify(nextQuote);

      if (prevSnapshot === nextSnapshot) {
        return prev;
      }

      changed = true;
      return nextQuote;
    });

    if (changed) {
      setValidationErrors([]);
    }
  }, [deriveQuoteState]);

  const normalizedSteps = quote.steps;
  const activeStep = quote.activeStep;

  const currentStepIndex = normalizedSteps.indexOf(activeStep);
  const totalSteps = normalizedSteps.length;

  const totals = useMemo(() => {
    const linesSubtotal = quote.lineItems.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );
    const lineVat = quote.lineItems.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice * item.vatRate,
      0,
    );
    const discountValue = quote.discounts.reduce((acc, discount) => {
      if (discount.type === 'percentage') {
        return acc + (linesSubtotal * discount.amount) / 100;
      }

      return acc + discount.amount;
    }, 0);
    const deliveryFee = quote.deliveryFee ?? 0;

    const total = Math.max(linesSubtotal + lineVat + deliveryFee - discountValue, 0);

    return {
      linesSubtotal,
      lineVat,
      discountValue,
      deliveryFee,
      total,
    };
  }, [quote.deliveryFee, quote.discounts, quote.lineItems]);

  const autosaveEnabled = quote.status === 'Draft';

  const { lastSavedAt, isSaving, status: autosaveStatus, clearDraft, saveNow } = useDraftAutosave<QuoteDraft>({
    draft: quote,
    draftId: quote.quoteId,
    draftType: 'quote',
    label: quote.customerName ?? 'Quote draft',
    enabled: autosaveEnabled,
    initialSavedState: cachedDraft,
  });

  const autosaveIndicator = useMemo(() => {
    if (!autosaveEnabled) {
      return 'Autosave paused';
    }

    if (isSaving) {
      return 'Saving…';
    }

    if (autosaveStatus === 'error') {
      return 'Autosave needs attention';
    }

    if (!lastSavedAt) {
      return 'Autosave ready';
    }

    return `Saved ${new Intl.DateTimeFormat('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(lastSavedAt))}`;
  }, [autosaveEnabled, autosaveStatus, isSaving, lastSavedAt]);

  const goToStep = (step: QuoteComposerStep) => {
    setQuote((prev) => ({ ...prev, activeStep: step }));
    setValidationErrors([]);
    onStepChange?.(step);
  };

  const handleNext = () => {
    if (currentStepIndex === -1) {
      goToStep(normalizedSteps[0]);
      return;
    }

    if (currentStepIndex < normalizedSteps.length - 1) {
      goToStep(normalizedSteps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      goToStep(normalizedSteps[currentStepIndex - 1]);
    }
  };

  const validateBeforeSubmit = () => {
    const errors: string[] = [];

    if (!quote.vatNumber?.trim()) {
      errors.push('VAT number is required');
    }

    if (!quote.orderNumber?.trim()) {
      errors.push('Customer order reference is required');
    }

    setValidationErrors(errors);

    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateBeforeSubmit()) {
      return;
    }

    void saveNow('manual');
    onSubmit(quote);
    clearDraft();
  };

  const handlePreview = () => {
    void saveNow('manual');
    onPreview(quote);
  };

  const handleCancel = () => {
    clearDraft();
    onCancel?.();
  };

  return (
    <article className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Compose quote</h2>
          {quote.customerName ? (
            <p className="text-sm text-slate-500">{quote.customerName}</p>
          ) : null}
          <p className="text-xs text-slate-400" data-testid="quote-autosave-indicator">
            {autosaveIndicator}
          </p>
        </div>

        <div
          data-testid="quote-step-indicator"
          data-active-step={activeStep}
          className="rounded-full bg-slate-100 px-4 py-1 text-sm font-medium text-slate-700"
        >
          Step {currentStepIndex + 1} of {totalSteps}
        </div>
      </header>

      <section className="rounded-lg border border-slate-100 bg-slate-50 p-4">
        {activeStep === 'details' ? (
          <div className="space-y-2 text-sm text-slate-600">
            <p>Confirm customer details and capture their order reference before proceeding.</p>
            <dl className="space-y-1">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Customer</dt>
                <dd className="font-medium text-slate-800">{quote.customerName ?? 'Retail customer'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">VAT Number</dt>
                <dd className="font-medium text-slate-800">{quote.vatNumber ?? 'Pending'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Order reference</dt>
                <dd className="font-medium text-slate-800">{quote.orderNumber ?? 'Pending'}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        {activeStep === 'items' ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Quote line items</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {quote.lineItems.map((item) => (
                <li key={item.lineId} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                  <span className="font-medium text-slate-800">{item.description}</span>
                  <span className="text-slate-500">
                    {item.quantity} × {formatCurrency(item.unitPrice, quote.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {activeStep === 'review' ? (
          <div data-testid="quote-review-summary" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Review &amp; confirm quote</h3>
              <p className="text-sm text-slate-600">
                Ensure VAT, delivery fees, and discounts are correct before sending to the customer.
              </p>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.linesSubtotal, quote.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT</span>
                <span>{formatCurrency(totals.lineVat, quote.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{formatCurrency(totals.deliveryFee, quote.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discounts</span>
                <span>-{formatCurrency(totals.discountValue, quote.currency)}</span>
              </div>
            </div>

            <div
              data-testid="quote-total-summary"
              className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
            >
              <span>Total quote value</span>
              <span>{formatCurrency(totals.total, quote.currency)}</span>
            </div>
          </div>
        ) : null}
      </section>

      {validationErrors.length > 0 ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <ul className="list-disc space-y-1 pl-5">
            {validationErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex <= 0}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
        </div>

        <div className="flex gap-2">
          {activeStep === 'review' ? (
            <>
              <button
                type="button"
                onClick={handlePreview}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Preview quote
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Submit quote
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Next
            </button>
          )}
        </div>
      </footer>
    </article>
  );
};

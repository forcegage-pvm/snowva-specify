"use client";

import { useEffect, useMemo, useState } from "react";

type StatementStatusFilter = "all" | "overdue" | "open" | "closed";

type StatementHistoryResponse = {
  summary: {
    totalStatements: number;
    totalBalance: number;
    currency: string;
    lastGeneratedAt: string;
  };
  statements: Statement[];
};

type Statement = {
  id: string;
  customerId: string;
  customerName: string;
  period: {
    label: string;
    start: string;
    end: string;
  };
  issuedOn: string;
  dueOn: string;
  status: "open" | "closed" | "overdue";
  balance: number;
  branchBreakdown: Array<{
    branchId: string;
    branchName: string;
    amount: number;
    overdue: boolean;
  }>;
  exports?: {
    pdf?: {
      url: string;
      generatedAt: string;
    };
    emailHistory?: Array<{
      id: string;
      sentAt: string;
      recipients: string[];
      status: string;
    }>;
  };
};

type GenerateStatementForm = {
  customerType: "retail" | "wholesale" | "enterprise";
  periodPreset: "lastMonth" | "lastQuarter" | "custom";
  includeBranches: boolean;
};

type ExportStatementForm = {
  recipients: string;
  includeEmail: boolean;
};

const formatCurrency = (value: number, currency: string) => {
  if (!Number.isFinite(value)) {
    return `${currency === "ZAR" ? "R" : ""}0`;
  }

  const prefix = currency === "ZAR" ? "R" : `${currency} `;
  return `${prefix}${value.toLocaleString("en-US")}`;
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateWithTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function StatementsPage() {
  const [statusFilter, setStatusFilter] = useState<StatementStatusFilter>("all");
  const [history, setHistory] = useState<StatementHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState<GenerateStatementForm>({
    customerType: "retail",
    periodPreset: "lastMonth",
    includeBranches: true,
  });
  const [exportForm, setExportForm] = useState<ExportStatementForm>({
    recipients: "finance@sportsmans.co.za",
    includeEmail: true,
  });
  const [activeStatementId, setActiveStatementId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint =
          statusFilter === "all"
            ? "/api/v1/statements/history"
            : `/api/v1/statements/history?status=${encodeURIComponent(statusFilter)}`;

        const response = await fetch(endpoint, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load statements");
        }

        const payload = (await response.json()) as StatementHistoryResponse;
        if (!controller.signal.aborted) {
          setHistory(payload);
          setActiveStatementId(payload.statements[0]?.id ?? null);
        }
      } catch {
        if (!controller.signal.aborted) {
          setHistory(null);
          setError("Statement workspace unavailable. Try again later.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchHistory();

    return () => {
      controller.abort();
    };
  }, [statusFilter]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 3200);
    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  const summary = history?.summary;
  const statements = useMemo(() => history?.statements ?? [], [history]);
  const currencyCode = summary?.currency ?? "ZAR";

  const overdueBranchesTotal = useMemo(() => {
    if (!statements.length) {
      return 0;
    }

    return statements.reduce((sum, statement) => {
      const overdueBalance = statement.branchBreakdown
        .filter((branch) => branch.overdue)
        .reduce((branchSum, branch) => branchSum + branch.amount, 0);

      return sum + overdueBalance;
    }, 0);
  }, [statements]);

  const refreshStatements = async (preferredStatementId?: string) => {
    try {
      const endpoint =
        statusFilter === "all"
          ? "/api/v1/statements/history"
          : `/api/v1/statements/history?status=${encodeURIComponent(statusFilter)}`;

      const response = await fetch(endpoint, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to refresh statements");
      }

      const payload = (await response.json()) as StatementHistoryResponse;
      setHistory(payload);
      const desiredStatementId = preferredStatementId ?? activeStatementId;
      if (desiredStatementId && payload.statements.some((statement) => statement.id === desiredStatementId)) {
        setActiveStatementId(desiredStatementId);
      } else {
        setActiveStatementId(payload.statements[0]?.id ?? null);
      }
    } catch {
      // Ignore refresh errors; surface via main loader on next manual refresh
    }
  };

  const handleGenerateStatement = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/statements/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "consolidated",
          includeBranches: generateForm.includeBranches,
          filters: {
            customerType: generateForm.customerType,
            period: {
              preset: generateForm.periodPreset,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate statement");
      }

      const payload = (await response.json()) as {
        statementId: string;
        issuedOn: string;
        dueOn: string;
        redirectUrl?: string;
      };

      setToast("Statement generated");
      setIsGenerateModalOpen(false);
      setActiveStatementId(payload.statementId);
      await refreshStatements(payload.statementId);
    } catch {
      setError("Unable to generate statement. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportStatement = async () => {
    if (!activeStatementId) {
      return;
    }

    setIsExporting(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/statements/${activeStatementId}/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: "pdf",
          includeEmail: exportForm.includeEmail,
          recipients: exportForm.recipients
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to export statement");
      }

      setIsExportModalOpen(false);
      setToast("Statement PDF ready");
    } catch {
      setError("Unable to export statement. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const activeStatement = statements.find((statement) => statement.id === activeStatementId) ?? statements[0];

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Consolidated statements</h1>
        <p className="text-sm text-slate-500">
          Generate consolidated account statements, review branch balances, and share exports with customers.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          onClick={() => setIsGenerateModalOpen(true)}
        >
          Generate consolidated statement
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
          onClick={() => setIsExportModalOpen(true)}
          disabled={!activeStatement}
        >
          Export PDF
        </button>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="statement-summary">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Overview</p>
            {summary ? (
              <div className="mt-1 space-y-1 text-sm text-slate-700">
                <p>{summary.totalStatements} statements</p>
                <p>Total due: {formatCurrency(summary.totalBalance, currencyCode)}</p>
                <p className="text-xs text-slate-400">Last generated: {formatDateWithTime(summary.lastGeneratedAt)}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No statement data yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-wide text-slate-400">Overdue balance</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(overdueBranchesTotal, currencyCode)}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label htmlFor="statement-status" className="flex flex-col gap-2 text-sm text-slate-600">
            Statement status
            <select
              id="statement-status"
              value={statusFilter}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              onChange={(event) => setStatusFilter(event.target.value as StatementStatusFilter)}
            >
              <option value="all">All</option>
              <option value="overdue">Overdue</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <label htmlFor="statement-customer" className="flex flex-col gap-2 text-sm text-slate-600">
            Customer filter
            <select
              id="statement-customer"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              defaultValue="top"
            >
              <option value="top">Top balances</option>
              <option value="retail">Retail accounts</option>
              <option value="franchise">Franchise accounts</option>
            </select>
          </label>

          <label htmlFor="statement-sort" className="flex flex-col gap-2 text-sm text-slate-600">
            Sort by
            <select
              id="statement-sort"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              defaultValue="newest"
            >
              <option value="newest">Newest period</option>
              <option value="balance">Highest balance</option>
              <option value="dueSoon">Due soon</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        ) : error ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{error}</div>
        ) : statements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No statements found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto" data-testid="statement-table">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-left">Branches</th>
                  <th className="px-4 py-3 text-left">Exports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statements.map((statement) => (
                  <tr key={statement.id} className="bg-white">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{statement.customerName}</div>
                      <div className="text-xs text-slate-400">Issued {formatDate(statement.issuedOn)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{statement.period.label}</div>
                      <div className="text-xs text-slate-400">
                        {formatDate(statement.period.start)} — {formatDate(statement.period.end)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          statement.status === "overdue"
                            ? "bg-rose-100 text-rose-700"
                            : statement.status === "open"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {statement.status}
                      </span>
                      <div className="mt-1 text-xs text-slate-400">Due {formatDate(statement.dueOn)}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(statement.balance, currencyCode)}
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      {statement.branchBreakdown.map((branch) => (
                        <div
                          key={branch.branchId}
                          className={`flex items-center justify-between rounded-lg border px-2 py-1 text-xs ${
                            branch.overdue
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span className="font-medium">{branch.branchName}</span>
                          <span>{formatCurrency(branch.amount, currencyCode)}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {statement.exports?.pdf ? (
                        <p>PDF generated {formatDateWithTime(statement.exports.pdf.generatedAt)}</p>
                      ) : (
                        <p>PDF pending</p>
                      )}
                      {statement.exports?.emailHistory?.length ? (
                        <div className="mt-2 space-y-1">
                          {statement.exports.emailHistory.map((email) => (
                            <div key={email.id} className="rounded-lg bg-slate-100 px-2 py-1">
                              <p className="font-medium text-slate-700">{email.status}</p>
                              <p className="text-[11px] text-slate-500">{formatDateWithTime(email.sentAt)}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
                          onClick={() => {
                            setActiveStatementId(statement.id);
                            setIsExportModalOpen(true);
                          }}
                        >
                          Export
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
                          onClick={() => {
                            setActiveStatementId(statement.id);
                            setIsGenerateModalOpen(true);
                          }}
                        >
                          Regenerate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isGenerateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
          <div
            role="dialog"
            aria-modal="true"
            data-testid="generate-statement-modal"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">Generate consolidated statement</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose the period and customer segment to compile a consolidated balance sheet for all active branches.
            </p>

            <div className="mt-6 space-y-4">
              <label htmlFor="generate-customer-type" className="flex flex-col gap-2 text-sm text-slate-600">
                Customer type
                <select
                  id="generate-customer-type"
                  value={generateForm.customerType}
                  onChange={(event) =>
                    setGenerateForm((prev) => ({
                      ...prev,
                      customerType: event.target.value as GenerateStatementForm["customerType"],
                    }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </label>

              <label htmlFor="generate-period" className="flex flex-col gap-2 text-sm text-slate-600">
                Period preset
                <select
                  id="generate-period"
                  value={generateForm.periodPreset}
                  onChange={(event) =>
                    setGenerateForm((prev) => ({
                      ...prev,
                      periodPreset: event.target.value as GenerateStatementForm["periodPreset"],
                    }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="lastMonth">Last month</option>
                  <option value="lastQuarter">Last quarter</option>
                  <option value="custom">Custom range</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={generateForm.includeBranches}
                  onChange={(event) =>
                    setGenerateForm((prev) => ({
                      ...prev,
                      includeBranches: event.target.checked,
                    }))
                  }
                />
                Include branch breakdown
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => setIsGenerateModalOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleGenerateStatement}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate statement"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isExportModalOpen && activeStatement ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
          <div
            role="dialog"
            aria-modal="true"
            data-testid="export-statement-modal"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">Export statement PDF</h2>
            <p className="mt-1 text-sm text-slate-500">
              Deliver the consolidated statement for {activeStatement.customerName} to finance collaborators.
            </p>

            <div className="mt-6 space-y-4">
              <label htmlFor="export-recipients" className="flex flex-col gap-2 text-sm text-slate-600">
                Email recipients
                <input
                  id="export-recipients"
                  type="text"
                  value={exportForm.recipients}
                  onChange={(event) =>
                    setExportForm((prev) => ({
                      ...prev,
                      recipients: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={exportForm.includeEmail}
                  onChange={(event) =>
                    setExportForm((prev) => ({
                      ...prev,
                      includeEmail: event.target.checked,
                    }))
                  }
                />
                Email copy to customer
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => setIsExportModalOpen(false)}
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleExportStatement}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Export and email"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          data-testid="toast"
          className="fixed bottom-6 right-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

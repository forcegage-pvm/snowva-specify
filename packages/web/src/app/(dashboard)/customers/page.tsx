"use client";

import { useEffect, useMemo, useState } from "react";

type CustomerDirectoryItem = {
  id: string;
  displayName: string;
  customerType?: string;
  vatNumber?: string;
  branchCount?: number;
  outstandingBalance?: number;
  overdueCount?: number;
  parentCompany?: string;
};

type CustomerDirectoryResponse = {
  items?: CustomerDirectoryItem[];
};

type CustomerWorkspaceBranch = {
  id: string;
  displayName: string;
  status: string;
  outstandingBalance?: number;
  nextStatementDue?: string;
};

type CustomerWorkspace = {
  customer: {
    id: string;
    displayName: string;
  };
  branches: CustomerWorkspaceBranch[];
};

type BranchAuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: {
    field?: string;
    previous?: string;
    next?: string;
    summary?: string;
  };
};

type BranchAuditLogResponse = {
  events: BranchAuditEvent[];
};

type BranchUpdatePayload = {
  billingAddress: { line1: string };
  contact: { email: string };
};

const formatZar = (value?: number | null) => {
  if (typeof value !== "number") {
    return "R0";
  }

  return `R${value.toLocaleString("en-US")}`;
};

const formatDueDate = (date?: string) => {
  if (!date) {
    return "Due date pending";
  }

  const candidate = new Date(date);
  if (Number.isNaN(candidate.getTime())) {
    return "Due date pending";
  }

  return `Due ${candidate.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

const deriveOutstandingCopy = (count?: number) => {
  if (!count) {
    return "0 overdue";
  }

  return `${count} overdue`;
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [directoryItems, setDirectoryItems] = useState<CustomerDirectoryItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<CustomerWorkspace | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<Record<string, BranchAuditEvent[]>>({});
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editLine1, setEditLine1] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadDirectory = async () => {
      setIsLoadingDirectory(true);
      try {
        const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
        const response = await fetch(`/api/v1/customers${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load customers");
        }

        const payload = (await response.json()) as CustomerDirectoryResponse | CustomerDirectoryItem[];

        if (!isActive) {
          return;
        }

        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.items)
            ? payload.items
            : [];

        setDirectoryItems(items);
  } catch {
        if (!controller.signal.aborted && isActive) {
          setDirectoryItems([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingDirectory(false);
        }
      }
    };

    void loadDirectory();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [search]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = setTimeout(() => setToastMessage(null), 3200);

    return () => {
      clearTimeout(timeout);
    };
  }, [toastMessage]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) {
      return null;
    }

    return directoryItems.find((item) => item.id === selectedCustomerId) ?? null;
  }, [directoryItems, selectedCustomerId]);

  const handleViewWorkspace = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setWorkspaceLoading(true);
    setWorkspace(null);
    setAuditLogs({});
    setEditingBranchId(null);

    try {
      const response = await fetch(`/api/v1/customers/${customerId}/workspace`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load workspace");
      }

      const workspacePayload = (await response.json()) as CustomerWorkspace;
      setWorkspace(workspacePayload);

      const eventsEntries = await Promise.all(
        workspacePayload.branches.map(async (branch) => {
          try {
            const auditResponse = await fetch(`/api/v1/branches/${branch.id}/audit`, {
              cache: "no-store",
            });

            if (!auditResponse.ok) {
              return [branch.id, []] as const;
            }

            const auditPayload = (await auditResponse.json()) as BranchAuditLogResponse;
            return [branch.id, auditPayload.events] as const;
          } catch {
            return [branch.id, []] as const;
          }
        }),
      );

      setAuditLogs(Object.fromEntries(eventsEntries));
  } catch {
      setWorkspace(null);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const beginEditing = (branchId: string) => {
    if (!workspace) {
      return;
    }

    const branch = workspace.branches.find((candidate) => candidate.id === branchId);

    setEditingBranchId(branchId);
    setEditLine1((branch as { billingAddress?: { line1?: string } })?.billingAddress?.line1 ?? "");
    setEditEmail((branch as { contactEmail?: string })?.contactEmail ?? "");
  };

  const commitBranchChanges = async (branchId: string) => {
    const payload: BranchUpdatePayload = {
      billingAddress: {
        line1: editLine1,
      },
      contact: {
        email: editEmail,
      },
    };

    try {
      const response = await fetch(`/api/v1/branches/${branchId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update branch");
      }

      const result = (await response.json()) as {
        branch?: Partial<CustomerWorkspaceBranch> & {
          billingAddress?: { line1?: string };
          contacts?: Array<{ id: string; email?: string }>;
        };
      };

      setWorkspace((previous) => {
        if (!previous) {
          return previous;
        }

        const nextBranches = previous.branches.map((branch) => {
          if (branch.id !== branchId) {
            return branch;
          }

          return {
            ...branch,
            ...result.branch,
            billingAddress: result.branch?.billingAddress,
            contactEmail: result.branch?.contacts?.[0]?.email ?? (result.branch as { contactEmail?: string })?.contactEmail,
          } as CustomerWorkspaceBranch & {
            billingAddress?: { line1?: string };
            contactEmail?: string;
          };
        });

        return {
          ...previous,
          branches: nextBranches,
        };
      });

      setEditingBranchId(null);
      setToastMessage("Branch details updated");
  } catch {
      setToastMessage("Something went wrong while saving. Try again.");
    }
  };

  const renderAuditDetails = (event: BranchAuditEvent) => {
    if (event.details?.summary) {
      return event.details.summary;
    }

    if (event.details?.previous || event.details?.next) {
      const previous = event.details.previous ?? "";
      const next = event.details.next ?? "";
        return `${previous} → ${next}`;
    }

    return event.action;
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Customer directory</h1>
        <p className="text-sm text-slate-500">
          Filter and drill into parent accounts. Select a workspace to inspect branch health, audit trails, and
          outstanding balances.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="customer-directory-search" className="text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              id="customer-directory-search"
              data-testid="customer-directory-search-input"
              placeholder="Search by customer, parent, or VAT"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {isLoadingDirectory ? (
            <div className="grid gap-3">
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ) : directoryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-slate-500">
              No customers found.
            </div>
          ) : (
            <div className="space-y-3">
              {directoryItems.map((item) => (
                <article
                  key={item.id}
                  data-testid="customer-directory-row"
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{item.displayName}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{item.customerType ?? ""}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span data-testid="customer-directory-branch-count">
                        {(item.branchCount ?? 0).toLocaleString("en-US")} branches
                      </span>
                      <span data-testid="customer-directory-overdue-count">{deriveOutstandingCopy(item.overdueCount)}</span>
                      <button
                        type="button"
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        onClick={() => handleViewWorkspace(item.id)}
                      >
                        View workspace
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        {workspaceLoading ? (
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ) : workspace && selectedCustomer ? (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{selectedCustomer.displayName} workspace</h2>
                <p className="text-sm text-slate-500">
                  Inspect branch performance, allocation history, and outstanding balances.
                </p>
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                {workspace.branches.map((branch) => {
                  const auditForBranch = auditLogs[branch.id] ?? [];
                  const isEditing = editingBranchId === branch.id;
                  return (
                    <div
                      key={branch.id}
                      data-testid="branch-node"
                      data-status={branch.status}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{branch.displayName}</p>
                          <p className="text-xs text-slate-500">{formatDueDate(branch.nextStatementDue)}</p>
                        </div>
                        {!isEditing ? (
                          <button
                            type="button"
                            data-testid="branch-edit-button"
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
                            onClick={() => beginEditing(branch.id)}
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>

                      <dl className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-slate-400">Outstanding balance</dt>
                          <dd data-testid="branch-outstanding-balance" className="text-base font-semibold text-slate-900">
                            {formatZar(branch.outstandingBalance)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-slate-400">Next statement</dt>
                          <dd data-testid="branch-next-statement" className="text-sm text-slate-600">
                            {formatDueDate(branch.nextStatementDue)}
                          </dd>
                        </div>
                      </dl>

                      {isEditing ? (
                        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-4">
                          <div className="flex flex-col gap-1">
                            <label htmlFor={`address-${branch.id}`} className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Address line 1
                            </label>
                            <input
                              id={`address-${branch.id}`}
                              data-testid="branch-address-line1-input"
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                              value={editLine1}
                              onChange={(event) => setEditLine1(event.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label htmlFor={`email-${branch.id}`} className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Branch contact email
                            </label>
                            <input
                              id={`email-${branch.id}`}
                              data-testid="branch-contact-email-input"
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                              value={editEmail}
                              onChange={(event) => setEditEmail(event.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              data-testid="inline-save-button"
                              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                              onClick={() => commitBranchChanges(branch.id)}
                            >
                              Save changes
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
                              onClick={() => setEditingBranchId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}

                      <div data-testid="branch-audit-log" className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Audit log</p>
                        {auditForBranch.length === 0 ? (
                          <p className="text-xs text-slate-500">No audit events yet.</p>
                        ) : (
                          auditForBranch.map((event) => (
                            <div key={event.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                              <p className="font-semibold">{event.action}</p>
                              <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                              <p className="text-xs text-slate-600">{event.actor}</p>
                              <p className="text-sm text-slate-700">{renderAuditDetails(event)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <aside className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                <p className="font-semibold text-slate-700">Workspace insights</p>
                <p className="mt-2">
                  Select a branch to review balance trends, audit history, and upcoming statements. Inline edits are
                  synced with branch billing preferences.
                </p>
              </aside>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            Select a customer to load branch details and audit timelines.
          </div>
        )}
      </section>

      {toastMessage ? (
        <div
          data-testid="toast"
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}

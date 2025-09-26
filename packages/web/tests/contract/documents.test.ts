import { z } from "zod";

declare module "@/app/api/v1/document-exports/route" {
  export function GET(request: Request): Promise<Response>;
}

declare module "@/app/api/v1/document-exports/[exportId]/route" {
  export function GET(
    request: Request,
    context: { params: { exportId: string } }
  ): Promise<Response>;
}

declare module "@/app/api/v1/document-exports/[exportId]/resend/route" {
  export function POST(
    request: Request,
    context: { params: { exportId: string } }
  ): Promise<Response>;
}

declare module "@/app/api/v1/document-exports/[exportId]/share-link/route" {
  export function POST(
    request: Request,
    context: { params: { exportId: string } }
  ): Promise<Response>;
}

declare module "@/app/api/v1/document-exports/[exportId]/audit/route" {
  export function GET(
    request: Request,
    context: { params: { exportId: string } }
  ): Promise<Response>;
}

const listItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  documentType: z.enum(["statement", "invoice", "quote", "compliance"]),
  customerBranch: z.object({
    id: z.string(),
    name: z.string(),
  }),
  createdAt: z.string().datetime(),
  deliveredChannels: z.array(z.enum(["email", "portal", "manual"])).nonempty(),
  status: z.enum(["queued", "sent", "failed", "expired"]),
  lastDownloadedAt: z.string().datetime().nullable(),
  fileSizeBytes: z.number().int().positive(),
  shareLink: z
    .object({
      active: z.boolean().optional(),
      token: z.string().url().optional(),
      expiresAt: z.string().datetime(),
    })
    .partial()
    .nullable()
    .optional(),
});

const listResponseSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(10).max(100),
  total: z.number().int().nonnegative(),
  virtualization: z
    .object({
      threshold: z.number().int().nonnegative(),
      overscan: z.number().int().nonnegative(),
    })
    .optional(),
  items: z.array(listItemSchema),
});

const documentExportSchema = z.object({
  id: z.string(),
  title: z.string(),
  documentType: z.enum(["statement", "invoice", "quote", "compliance"]),
  customerBranch: z.object({
    id: z.string(),
    name: z.string(),
  }),
  createdAt: z.string().datetime(),
  deliveredChannels: z.array(z.enum(["email", "portal", "manual"])).nonempty(),
  status: z.enum(["queued", "sent", "failed", "expired"]),
  failureReason: z.string().optional(),
  preview: z.object({
    assetUrl: z.string(),
    mimeType: z.string(),
    fileSizeBytes: z.number().int().positive(),
  }),
  shareLink: z
    .object({
      token: z.string().url(),
      expiresAt: z.string().datetime(),
      public: z.boolean(),
    })
    .nullable(),
  auditTrail: z.array(
    z.object({
      id: z.string(),
      timestamp: z.string().datetime(),
      actor: z.string(),
      action: z.enum([
        "previewed",
        "downloaded",
        "resent",
        "regenerated",
        "share_link_copied",
        "share_link_accessed",
        "sent",
        "failed",
        "queued",
      ]),
  context: z.record(z.string(), z.any()).optional(),
    })
  ),
});

const resendResponseSchema = z.object({
  status: z.enum(["queued", "sent", "failed", "expired"]),
  resentAt: z.string().datetime(),
  deliveredChannels: z.array(z.enum(["email", "portal", "manual"])),
  auditEventId: z.string(),
});

const shareLinkResponseSchema = z.object({
  token: z.string().url(),
  expiresAt: z.string().datetime(),
});

const auditTrailResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      timestamp: z.string().datetime(),
      actor: z.string(),
      action: z.enum([
        "previewed",
        "downloaded",
        "resent",
        "regenerated",
        "share_link_copied",
        "share_link_accessed",
        "sent",
        "failed",
        "queued",
      ]),
  context: z.record(z.string(), z.any()).optional(),
    })
  ),
  nextCursor: z.string().nullable(),
});

describe("Documents Workspace API contracts", () => {
  const BASE_URL = "http://localhost/api/v1/document-exports" as const;

  async function getList(searchParams: URLSearchParams) {
    const routeModule = await import("@/app/api/v1/document-exports/route");
    const { GET } = routeModule;
    const request = new Request(`${BASE_URL}?${searchParams.toString()}`, {
      method: "GET",
    });
    const response = await GET(request);
    const json = await response.json();
    return { response, json };
  }

  async function getDetail(exportId: string) {
    const routeModule = await import(
      "@/app/api/v1/document-exports/[exportId]/route"
    );
    const { GET } = routeModule;
    const request = new Request(`${BASE_URL}/${exportId}`, { method: "GET" });
    const response = await GET(request, { params: { exportId } } as never);
    const json = await response.json();
    return { response, json };
  }

  async function postResend(exportId: string) {
    const routeModule = await import(
      "@/app/api/v1/document-exports/[exportId]/resend/route"
    );
    const { POST } = routeModule;
    const request = new Request(`${BASE_URL}/${exportId}/resend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await POST(request, { params: { exportId } } as never);
    const json = await response.json();
    return { response, json };
  }

  async function postShareLink(exportId: string) {
    const routeModule = await import(
      "@/app/api/v1/document-exports/[exportId]/share-link/route"
    );
    const { POST } = routeModule;
    const request = new Request(`${BASE_URL}/${exportId}/share-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await POST(request, { params: { exportId } } as never);
    const json = await response.json();
    return { response, json };
  }

  async function getAudit(exportId: string, cursor?: string | null) {
    const routeModule = await import(
      "@/app/api/v1/document-exports/[exportId]/audit/route"
    );
    const { GET } = routeModule;
    const query = new URLSearchParams();
    if (cursor) {
      query.set("cursor", cursor);
    }
    const request = new Request(
      `${BASE_URL}/${exportId}/audit${query.toString() ? `?${query}` : ""}`,
      { method: "GET" }
    );
    const response = await GET(request, { params: { exportId } } as never);
    const json = await response.json();
    return { response, json };
  }

  it("listDocumentExports matches contract schema", async () => {
    const params = new URLSearchParams({ page: "1", pageSize: "25" });
    const { response, json } = await getList(params);
    expect(response.status).toBe(200);
    const parsed = listResponseSchema.parse(json);
    expect(parsed.items.length).toBeGreaterThan(0);
  });

  it("getDocumentExport returns preview metadata and audit trail", async () => {
    const targetId = "exp_stmt_2025_09_001";
    const { response, json } = await getDetail(targetId);
    expect(response.status).toBe(200);
    const parsed = documentExportSchema.parse(json);
    expect(parsed.id).toBe(targetId);
    expect(parsed.auditTrail.length).toBeGreaterThan(0);
  });

  it("postResendExport transitions status and appends audit event", async () => {
    const targetId = "exp_invoice_2025_08_014";
    const { response, json } = await postResend(targetId);
    expect(response.status).toBe(200);
    const parsed = resendResponseSchema.parse(json);
    expect(parsed.deliveredChannels.length).toBeGreaterThan(0);
  });

  it("postShareLink creates 30-day public token", async () => {
    const targetId = "exp_stmt_2025_09_001";
    const { response, json } = await postShareLink(targetId);
    expect(response.status).toBe(200);
    const parsed = shareLinkResponseSchema.parse(json);
    const expiresAt = new Date(parsed.expiresAt);
    const now = new Date();
    const diffDays = Math.round(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });

  it("getAuditTrail paginates chronological events", async () => {
    const targetId = "exp_stmt_2025_09_001";
    const { response, json } = await getAudit(targetId);
    expect(response.status).toBe(200);
    const parsed = auditTrailResponseSchema.parse(json);
    expect(parsed.items.length).toBeGreaterThan(0);
    const sorted = [...parsed.items].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    expect(sorted.map((item) => item.id)).toEqual(
      parsed.items.map((item) => item.id)
    );
  });
});

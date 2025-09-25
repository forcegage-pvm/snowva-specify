import '@testing-library/jest-dom';

import {
    DocumentActionError,
    downloadInvoicePdf,
    exportStatementDocument,
    sendInvoiceEmail,
} from '@/features/documents/actions';

const originalFetch = global.fetch;

describe('documents actions', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('sends invoice email requests to the invoice email endpoint', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        dispatchedAt: '2025-01-06T08:30:00Z',
      }),
    } satisfies Partial<Response>;

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await sendInvoiceEmail({
      invoiceId: 'inv_250827101',
      recipients: ['accounts@transafrica.co.za'],
      message: 'Please see the finalized invoice attached.',
      includeAttachments: true,
    });

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      '/api/invoices/inv_250827101/email',
    );

    const invoiceRequestInit = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    expect(invoiceRequestInit?.method).toBe('POST');
    expect(invoiceRequestInit?.headers).toEqual(
      expect.objectContaining({ 'Content-Type': 'application/json' }),
    );

    const invoicePayload = JSON.parse(invoiceRequestInit?.body as string);
    expect(invoicePayload).toEqual({
      recipients: ['accounts@transafrica.co.za'],
      message: 'Please see the finalized invoice attached.',
      includeAttachments: true,
    });

    expect(result).toEqual({
      success: true,
      dispatchedAt: '2025-01-06T08:30:00Z',
    });
  });

  it('throws a DocumentActionError when invoice email fails', async () => {
    const mockResponse = {
      ok: false,
      status: 422,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ message: 'Unable to email invoice' }),
    } satisfies Partial<Response>;

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(
      sendInvoiceEmail({
        invoiceId: 'inv_250827101',
        recipients: ['accounts@transafrica.co.za'],
      }),
    ).rejects.toThrow(DocumentActionError);

    await expect(
      sendInvoiceEmail({
        invoiceId: 'inv_250827101',
        recipients: ['accounts@transafrica.co.za'],
      }),
    ).rejects.toThrow('Unable to email invoice');
  });

  it('retrieves invoice PDFs with inferred filenames', async () => {
    const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="invoice-250827101.pdf"',
      }),
      blob: async () => mockBlob,
    } satisfies Partial<Response>;

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await downloadInvoicePdf('250827101');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/invoices/250827101/pdf',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Accept: 'application/pdf' }),
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        blob: mockBlob,
        contentType: 'application/pdf',
        fileName: 'invoice-250827101.pdf',
      }),
    );
  });

  it('throws when invoice PDF download fails', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ message: 'Invoice PDF not found' }),
    } satisfies Partial<Response>;

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(downloadInvoicePdf('missing-invoice')).rejects.toThrow(
      'Invoice PDF not found',
    );
  });

  it('posts statement export requests with email parameters when provided', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        downloadUrl: 'https://cdn.snowva.com/statements/stm_sportsmans_2025_01.pdf',
      }),
    } satisfies Partial<Response>;

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await exportStatementDocument({
      statementId: 'stmt_sportsmans_2025_01',
      format: 'pdf',
      includeEmail: true,
      recipients: ['finance@sportsmans.co.za'],
    });

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      '/api/statements/stmt_sportsmans_2025_01/export',
    );

    const statementRequestInit = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    expect(statementRequestInit?.method).toBe('POST');
    expect(statementRequestInit?.headers).toEqual(
      expect.objectContaining({ 'Content-Type': 'application/json' }),
    );

    const exportPayload = JSON.parse(statementRequestInit?.body as string);
    expect(exportPayload).toEqual({
      format: 'pdf',
      includeEmail: true,
      recipients: ['finance@sportsmans.co.za'],
    });

    expect(result).toEqual({
      success: true,
      downloadUrl: 'https://cdn.snowva.com/statements/stm_sportsmans_2025_01.pdf',
    });
  });

  it('raises a DocumentActionError when statement export fails', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ message: 'Export failure' }),
    } satisfies Partial<Response>;

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(
      exportStatementDocument({ statementId: 'stmt_fail' }),
    ).rejects.toThrow('Export failure');
  });
});

// packages/web/src/services/DocumentAuditService.ts
export const DocumentAuditService = {
  async logVersion(documentId: string, version: number, userId: string) {
    console.log(
      `[AUDIT] Document ${documentId} version ${version} accessed by user ${userId}`
    );
  },
};

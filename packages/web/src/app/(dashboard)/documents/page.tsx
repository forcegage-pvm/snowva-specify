'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

import { DocumentExportsTable } from '@/features/documents/components/DocumentExportsTable';
import { DocumentFiltersBar } from '@/features/documents/components/DocumentFiltersBar';
import { DocumentPreviewModal } from '@/features/documents/components/DocumentPreviewModal';
import { useDocumentExportListQuery } from '@/features/documents/hooks/useDocumentExports';
import type { FilterState } from '@/features/documents/types';

export default function DocumentsPage() {
  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    documentTypes: [],
    statuses: [],
    channels: [],
    sort: 'createdAt',
    page: 1,
    pageSize: 25
  });

  // Modal state
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);

  // Data fetching
  const {
    data: exportsData,
    isPending: isLoading,
    isError,
    error
  } = useDocumentExportListQuery(filters);

  // Check if we're dealing with archived data (>365 days)
  const hasArchivedData = exportsData?.items.some((export_) => {
    const exportDate = new Date(export_.createdAt);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365);
    return exportDate < cutoffDate;
  });

  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except when just changing page)
      page: 'page' in newFilters ? newFilters.page! : 1
    }));
  };

  const handleExportClick = (exportId: string) => {
    setSelectedExportId(exportId);
  };

  const handleModalClose = () => {
    setSelectedExportId(null);
  };

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to load document exports
            </h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Document Exports
          </h1>
          <p className="text-gray-600">
            Review, search, and manage document exports from the last 365 days. 
            Use the filters below to find specific documents or export batches.
          </p>
        </div>

        {/* Archive Notice */}
        {hasArchivedData && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-1">
                  Archived Documents Detected
                </h3>
                <p className="text-sm text-amber-700 mb-2">
                  Some documents in your results are older than 365 days and may have been archived. 
                  Archived documents can be requested for retrieval but are not immediately accessible.
                </p>
                <p className="text-xs text-amber-600">
                  Contact support for archived document retrieval. Processing typically takes 2-5 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <DocumentFiltersBar 
            filters={filters}
            onFiltersChange={(newFilters) => {
              handleFiltersChange(newFilters);
            }}
            isDisabled={isLoading}
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading document exports...</p>
            </div>
          ) : !exportsData || exportsData.items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No document exports found
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.documentTypes.length > 0 || filters.statuses.length > 0 || filters.channels.length > 0
                  ? "Try adjusting your search criteria or filters to find documents."
                  : "No document exports have been created in the last 365 days."}
              </p>
              {(filters.search || filters.documentTypes.length > 0 || filters.statuses.length > 0 || filters.channels.length > 0) && (
                <button
                  onClick={() => setFilters({
                    search: '',
                    documentTypes: [],
                    statuses: [],
                    channels: [],
                    sort: 'createdAt',
                    page: 1,
                    pageSize: 25
                  })}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <DocumentExportsTable
              items={exportsData.items}
              virtualization={exportsData.virtualization}
              searchTerm={filters.search}
              onRowSelect={handleExportClick}
              activeSort={filters.sort}
              onSortChange={(sort) => handleFiltersChange({ sort })}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Pagination Footer */}
        {exportsData && exportsData.items.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {((filters.page - 1) * filters.pageSize) + 1}–{Math.min(filters.page * filters.pageSize, exportsData.total)} of {exportsData.total} exports
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFiltersChange({ page: filters.page - 1 })}
                  disabled={filters.page <= 1}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded border transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded border">
                  {filters.page}
                </span>
                <button
                  onClick={() => handleFiltersChange({ page: filters.page + 1 })}
                  disabled={filters.page * filters.pageSize >= (exportsData?.total ?? 0)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded border transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedExportId && (
        <DocumentPreviewModal
          exportId={selectedExportId}
          isOpen={!!selectedExportId}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

/**
 * Loading State Components for Quote Operations
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD007: Loading states & error boundaries
 * Provides comprehensive loading states with accessibility support
 */

'use client';

import { DownloadIcon, FileTextIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react';
import React from 'react';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'progress';
  message?: string;
  progress?: number;
  className?: string;
  'aria-label'?: string;
}

/**
 * Base Loading Spinner Component
 * Provides accessible loading indicators
 */
export function LoadingSpinner({ 
  size = 'md', 
  className = '',
  'aria-label': ariaLabel = 'Loading...',
}: Omit<LoadingStateProps, 'variant' | 'message' | 'progress'>) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <Loader2Icon 
        className={`animate-spin text-blue-600 ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

/**
 * Loading State with Message
 */
export function LoadingState({
  size = 'md',
  variant = 'spinner',
  message = 'Loading...',
  progress,
  className = '',
  'aria-label': ariaLabel,
}: LoadingStateProps) {
  const finalAriaLabel = ariaLabel || message;

  if (variant === 'progress' && typeof progress === 'number') {
    return (
      <div
        className={`flex flex-col items-center space-y-4 ${className}`}
        role="status"
        aria-label={finalAriaLabel}
      >
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="text-sm text-gray-600">{message}</p>
        <span className="sr-only">{`${progress}% complete`}</span>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div
        className={`animate-pulse space-y-4 ${className}`}
        role="status"
        aria-label={finalAriaLabel}
      >
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center space-y-3 ${className}`}
      role="status"
      aria-label={finalAriaLabel}
    >
      <LoadingSpinner size={size} aria-label="" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

/**
 * Quote-specific Loading States
 */
export function QuoteLoadingState({
  operation = 'loading',
  progress,
  className = '',
}: {
  operation?: 'loading' | 'saving' | 'converting' | 'generating' | 'uploading';
  progress?: number;
  className?: string;
}) {
  const operationConfig = {
    loading: {
      icon: FileTextIcon,
      message: 'Loading quote...',
      ariaLabel: 'Loading quote data',
    },
    saving: {
      icon: RefreshCwIcon,
      message: 'Saving changes...',
      ariaLabel: 'Saving quote changes',
    },
    converting: {
      icon: RefreshCwIcon,
      message: 'Converting to invoice...',
      ariaLabel: 'Converting quote to invoice',
    },
    generating: {
      icon: FileTextIcon,
      message: 'Generating preview...',
      ariaLabel: 'Generating quote preview',
    },
    uploading: {
      icon: DownloadIcon,
      message: 'Uploading files...',
      ariaLabel: 'Uploading quote attachments',
    },
  };

  const config = operationConfig[operation];
  const Icon = config.icon;

  if (typeof progress === 'number') {
    return (
      <div
        className={`bg-white rounded-lg border p-6 ${className}`}
        role="status"
        aria-label={config.ariaLabel}
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{config.message}</h3>
            <p className="text-sm text-gray-500">{progress}% complete</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border p-6 ${className}`}
      role="status"
      aria-label={config.ariaLabel}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-blue-600 animate-pulse" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">{config.message}</h3>
          <LoadingSpinner size="sm" className="mt-2" aria-label="" />
        </div>
      </div>
    </div>
  );
}

/**
 * Timeline Loading State
 */
export function TimelineLoadingState({ className = '' }: { className?: string }) {
  return (
    <div
      className={`space-y-4 ${className}`}
      role="status"
      aria-label="Loading timeline events"
    >
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex space-x-4 animate-pulse">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex-shrink-0">
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading timeline events</span>
    </div>
  );
}

/**
 * PDF Generation Loading State
 */
export function PDFLoadingState({
  stage = 'preparing',
  progress,
  className = '',
}: {
  stage?: 'preparing' | 'rendering' | 'optimizing' | 'finalizing';
  progress?: number;
  className?: string;
}) {
  const stageMessages = {
    preparing: 'Preparing document...',
    rendering: 'Rendering PDF...',
    optimizing: 'Optimizing file size...',
    finalizing: 'Finalizing PDF...',
  };

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}
      role="status"
      aria-label="Generating PDF document"
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-shrink-0">
          <FileTextIcon className="h-8 w-8 text-blue-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-900">Generating PDF</h3>
          <p className="text-sm text-blue-700">{stageMessages[stage]}</p>
        </div>
      </div>
      
      {typeof progress === 'number' ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-700">
            <span>{stageMessages[stage]}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" aria-label="" />
          <span className="text-sm text-blue-700">Processing...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Data Table Loading State
 */
export function TableLoadingState({
  rows = 5,
  columns = 4,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse ${className}`}
      role="status"
      aria-label="Loading table data"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
        
        {/* Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {[...Array(columns)].map((_, colIndex) => (
              <div
                key={colIndex}
                className={`h-4 bg-gray-200 rounded ${
                  colIndex === 0 ? 'w-3/4' : colIndex === columns - 1 ? 'w-1/2' : 'w-full'
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading table data</span>
    </div>
  );
}

/**
 * Button Loading State
 */
export function LoadingButton({
  loading = false,
  children,
  disabled,
  className = '',
  loadingText = 'Loading...',
  ...props
}: {
  loading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`relative inline-flex items-center justify-center ${className} ${
        loading ? 'cursor-not-allowed' : ''
      }`}
      aria-disabled={loading || disabled}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" aria-label={loadingText} />
        </div>
      )}
      <span className={loading ? 'invisible' : 'visible'}>
        {children}
      </span>
    </button>
  );
}

/**
 * Page Loading State
 */
export function PageLoadingState({
  title = 'Loading',
  message = 'Please wait while we load your content...',
  className = '',
}: {
  title?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 px-4 ${className}`}
      role="status"
      aria-label={`${title} - ${message}`}
    >
      <div className="max-w-md w-full text-center">
        <LoadingSpinner size="lg" className="mb-6" aria-label="" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline Loading State
 */
export function InlineLoadingState({
  message = 'Loading...',
  size = 'sm',
  className = '',
}: {
  message?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center space-x-2 ${className}`}
      role="status"
      aria-label={message}
    >
      <LoadingSpinner size={size} aria-label="" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

/**
 * Hook for loading state management
 */
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingMessage, setLoadingMessage] = React.useState<string>();
  const [progress, setProgress] = React.useState<number>();

  const startLoading = React.useCallback((message?: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
    setProgress(undefined);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(undefined);
    setProgress(undefined);
  }, []);

  const updateProgress = React.useCallback((value: number, message?: string) => {
    setProgress(value);
    if (message) setLoadingMessage(message);
  }, []);

  return {
    isLoading,
    loadingMessage,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
  };
}
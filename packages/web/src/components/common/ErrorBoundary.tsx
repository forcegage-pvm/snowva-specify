/**
 * Error Boundary Components for Quote Operations
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD007: Loading states & error boundaries
 * Provides comprehensive error boundaries with accessibility support
 */

'use client';

import { AlertTriangleIcon, HomeIcon, RefreshCcwIcon } from 'lucide-react';
import React, { Component, ErrorInfo as ReactErrorInfo, ReactNode } from 'react';

interface CustomErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  digest?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: CustomErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: CustomErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: CustomErrorInfo) => void;
  context?: string;
  level?: 'page' | 'component' | 'feature';
}

/**
 * Base Error Boundary Component
 * Provides comprehensive error catching with accessibility support
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    const enhancedErrorInfo: CustomErrorInfo = {
      componentStack: errorInfo.componentStack || '',
      errorBoundary: this.props.context || 'ErrorBoundary',
      digest: errorInfo.digest || undefined,
    };

    this.setState({
      errorInfo: enhancedErrorInfo,
    });

    // Log error for monitoring
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      errorInfo: enhancedErrorInfo,
      errorId: this.state.errorId,
      context: this.props.context,
      level: this.props.level,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, enhancedErrorInfo);
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, enhancedErrorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: CustomErrorInfo) => {
    // In a real application, send to error tracking service
    // e.g., Sentry, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: errorInfo.errorBoundary,
      errorId: this.state.errorId,
      context: this.props.context,
      level: this.props.level,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      timestamp: new Date().toISOString(),
    };

    // Log for now, replace with actual service call
    console.warn('Error report (would be sent to tracking service):', errorReport);
  };

  private handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });

    // Focus management for accessibility
    const retryButton = document.querySelector('[data-error-retry]') as HTMLElement;
    if (retryButton) {
      retryButton.focus();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // Default error UI
      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertTriangleIcon 
                className="h-8 w-8 text-red-600" 
                aria-hidden="true"
              />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-8">
              {this.getErrorMessage()}
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-48">
                  <code>
                    {this.state.error.stack}
                    {this.state.errorInfo?.componentStack}
                  </code>
                </pre>
              </details>
            )}

            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                data-error-retry
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-describedby="retry-description"
              >
                <RefreshCcwIcon className="inline-block w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </button>
              <p id="retry-description" className="sr-only">
                Retry the failed operation
              </p>

              {this.props.level === 'page' && (
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  aria-describedby="home-description"
                >
                  <HomeIcon className="inline-block w-4 h-4 mr-2" aria-hidden="true" />
                  Go Home
                </button>
              )}
              <p id="home-description" className="sr-only">
                Return to the home page
              </p>
            </div>

            <div className="mt-8 text-xs text-gray-400">
              Error ID: {this.state.errorId}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private getErrorMessage(): string {
    if (!this.state.error) return 'An unexpected error occurred';

    const { message } = this.state.error;
    
    // Provide user-friendly messages for common errors
    if (message.includes('ChunkLoadError')) {
      return 'Failed to load application resources. Please refresh the page.';
    }
    
    if (message.includes('Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    if (message.includes('Permission denied')) {
      return 'You don\'t have permission to perform this action.';
    }

    // Return generic message for other errors in production
    if (process.env.NODE_ENV === 'production') {
      return 'An unexpected error occurred. Please try again.';
    }

    return message;
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }
}

/**
 * Quote-specific Error Boundary
 * Specialized error boundary for quote operations
 */
interface QuoteErrorBoundaryProps extends ErrorBoundaryProps {
  quoteId?: string;
  operation?: 'create' | 'update' | 'delete' | 'convert' | 'preview' | 'pdf';
}

export class QuoteErrorBoundary extends Component<QuoteErrorBoundaryProps, ErrorBoundaryState> {
  render() {
    return (
      <ErrorBoundary
        {...this.props}
        context={`quote-${this.props.operation || 'operation'}`}
        level="feature"
        fallback={(error, errorInfo, retry) => (
          <div 
            className="bg-red-50 border border-red-200 rounded-lg p-6 m-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start">
              <AlertTriangleIcon 
                className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" 
                aria-hidden="true"
              />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Quote {this.props.operation || 'Operation'} Failed
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  {this.getQuoteErrorMessage(error)}
                </p>
                <button
                  onClick={retry}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  <RefreshCcwIcon className="inline-block w-4 h-4 mr-1" aria-hidden="true" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
        onError={(error, errorInfo) => {
          // Log quote-specific error context
          console.error('Quote operation error:', {
            quoteId: this.props.quoteId,
            operation: this.props.operation,
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          });
        }}
      >
        {this.props.children}
      </ErrorBoundary>
    );
  }

  private getQuoteErrorMessage(error: Error): string {
    const { message } = error;
    const { operation } = this.props;

    if (message.includes('validation')) {
      return 'Please check your quote data and try again.';
    }

    if (message.includes('not found')) {
      return 'The quote could not be found. It may have been deleted.';
    }

    if (message.includes('permission')) {
      return 'You don\'t have permission to perform this action on this quote.';
    }

    switch (operation) {
      case 'create':
        return 'Failed to create the quote. Please check your data and try again.';
      case 'update':
        return 'Failed to update the quote. Your changes may not have been saved.';
      case 'delete':
        return 'Failed to delete the quote. Please try again.';
      case 'convert':
        return 'Failed to convert the quote to an invoice. Please try again.';
      case 'preview':
        return 'Failed to generate quote preview. Please try again.';
      case 'pdf':
        return 'Failed to generate quote PDF. Please try again.';
      default:
        return 'Failed to complete the quote operation. Please try again.';
    }
  }
}

/**
 * Higher-order component for error boundary wrapping
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for error boundary integration
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { throwError, clearError };
}
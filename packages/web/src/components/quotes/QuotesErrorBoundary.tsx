'use client';

import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class QuotesErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('QuotesErrorBoundary caught an error:', error, errorInfo);
    
    // In a production app, you might want to log this to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md w-full">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="flex flex-col items-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" aria-hidden="true" />
                <h1 className="text-xl font-semibold text-slate-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-sm text-slate-600 text-center mb-6">
                  There was an error loading the quotes workspace. This could be due to a network issue or a temporary problem with our servers.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-6 w-full">
                    <summary className="text-sm text-slate-500 cursor-pointer mb-2">
                      Error details (development only)
                    </summary>
                    <pre className="text-xs text-red-600 bg-red-50 p-2 rounded border overflow-auto max-h-32">
                      {this.state.error.message}
                      {this.state.error.stack && '\n\n' + this.state.error.stack}
                    </pre>
                  </details>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                    Try again
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default QuotesErrorBoundary;
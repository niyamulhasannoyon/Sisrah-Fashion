'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface FallbackProps {
  error: Error;
  reset: () => void;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  title?: string;
  description?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error || new Error('An unexpected component error occurred'),
          reset: this.reset,
        });
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-2xl border border-red-100 bg-red-50/50 text-center my-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-[#A31F24] mb-3">
            <AlertTriangle size={22} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1 font-sans">
            {this.props.title || 'Component Error / ত্রুটি'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-4 font-bengali">
            {this.props.description || 'এই অংশটি লোড করতে সাময়িক সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।'}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#A31F24] text-white text-xs font-semibold rounded-lg hover:bg-[#8B1A1E] transition-colors shadow-sm"
          >
            <RefreshCw size={14} />
            <span>Try Again / আবার চেষ্টা করুন</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

'use client';

import React, { Component, type ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="mb-2 text-xl font-semibold text-slate-900">
                發生錯誤
              </h1>
              <p className="mb-6 text-sm text-slate-600">
                應用程式遇到未預期的錯誤。請重新整理頁面或返回首頁。
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left">
                  <summary className="cursor-pointer text-xs font-medium text-slate-700">
                    錯誤詳情（開發模式）
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs text-slate-600">
                    {this.state.error.toString()}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  重試
                </button>
                <Link
                  href="/"
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-500"
                >
                  返回首頁
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


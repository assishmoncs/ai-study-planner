'use client';
import { Component, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="card flex flex-col items-start gap-3" role="alert">
        <AlertCircle className="h-6 w-6 text-rose-500" aria-hidden="true" />
        <h2 className="font-semibold">{this.props.fallbackTitle ?? 'Something went wrong'}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Please try loading this section again.
        </p>
        <button className="btn-secondary" onClick={() => this.setState({ hasError: false })}>
          Try again
        </button>
      </div>
    );
  }
}

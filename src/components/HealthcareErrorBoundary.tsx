import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo?: string;
}

export class HealthcareErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      errorInfo: process.env.NODE_ENV === 'development' ? error.message : undefined 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to healthcare audit system
    console.error('Healthcare Application Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Healthcare System Error
          </h2>
          <p className="text-red-600">
            A system error occurred. Please contact support if this persists.
          </p>
          {this.state.errorInfo && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-red-500">
                Technical Details
              </summary>
              <pre className="text-xs text-red-400 mt-1">
                {this.state.errorInfo}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

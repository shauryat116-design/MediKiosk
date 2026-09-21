'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Kiosk Error Boundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 text-center">
          <div className="max-w-xl bg-white rounded-3xl p-10 shadow-2xl border-4 border-red-500 space-y-6">
            <AlertTriangle className="w-20 h-20 text-red-600 mx-auto animate-bounce" />
            <h2 className="text-3xl font-extrabold text-gray-900">System Error Occurred / सिस्टम त्रुटि</h2>
            <p className="text-xl text-gray-600">
              Something went wrong. Please tap reload or seek assistance from hospital staff.
            </p>
            <Button
              variant="primary"
              size="kiosk"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              <RefreshCw className="w-7 h-7 mr-3 inline" /> Restart Kiosk Session
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

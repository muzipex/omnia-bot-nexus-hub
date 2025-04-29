import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-tech-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full tech-card text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-tech-blue/10 flex items-center justify-center">
              <RefreshCcw className="w-8 h-8 text-tech-blue" />
            </div>
            
            <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            
            <p className="text-gray-300">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            
            <Button 
              onClick={this.handleReload}
              className="bg-tech-blue hover:bg-tech-blue/90 text-white"
            >
              Refresh Page
            </Button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 p-4 bg-tech-charcoal rounded-lg text-left text-sm text-gray-300 overflow-auto">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
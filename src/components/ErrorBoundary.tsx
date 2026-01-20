import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/button';
import { Warning } from '@phosphor-icons/react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <Warning size={32} />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
          <p className="mb-6 text-muted-foreground max-w-md">
            The application encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
              Try Again
            </Button>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-8 max-w-full overflow-auto rounded bg-muted p-4 text-left text-xs text-red-500">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

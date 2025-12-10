
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/Common';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900 h-full min-h-[200px]">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Что-то пошло не так</h2>
          <p className="text-sm text-red-600 dark:text-red-300 text-center mb-6 max-w-md">
            В этом компоненте произошла ошибка. Попробуйте обновить страницу.
          </p>
          <Button 
            variant="outline" 
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30"
          >
            <RefreshCcw className="w-4 h-4" /> Обновить
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

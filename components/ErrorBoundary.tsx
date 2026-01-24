import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Common';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch rendering errors and show a fallback UI.
 */
// Comment above fix: Explicitly extending Component to ensure inheritance properties like setState and props are correctly resolved by the TS compiler
export class ErrorBoundary extends Component<Props, State> {
  // Comment above fix: Class property initialization for state is standard in React components
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

  // Comment above fix: Property initializer with arrow function to bind 'this' correctly for methods accessing class properties
  public handleReset = (): void => {
    // Comment above fix: Explicitly call setState which is inherited from Component
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render(): ReactNode {
    const { hasError, error } = this.state;
    // Comment above fix: Accessing props through inherited Component
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) return fallback as ReactNode;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-red-200 dark:border-red-900/30 m-4 shadow-xl">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight text-center">Произошла ошибка</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md text-sm leading-relaxed">
            Мы уже получили уведомление об ошибке и работаем над исправлением. Пожалуйста, попробуйте обновить страницу или вернуться на главную.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <Button 
              variant="primary" 
              onClick={() => window.location.reload()}
              className="flex-1 rounded-2xl py-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Обновить
            </Button>
            <Button 
              variant="outline" 
              onClick={this.handleReset}
              className="flex-1 rounded-2xl py-3"
            >
              <Home className="w-4 h-4 mr-2" /> На главную
            </Button>
          </div>
          {error && (
              <details className="mt-8 w-full max-w-md p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                  <summary className="text-[10px] font-bold text-gray-400 uppercase cursor-pointer hover:text-gray-600 transition-colors">Технические детали</summary>
                  <pre className="mt-2 text-[10px] text-red-400 overflow-x-auto font-mono leading-tight">
                      {error.message}
                      {error.stack}
                  </pre>
              </details>
          )}
        </div>
      );
    }

    return children;
  }
}
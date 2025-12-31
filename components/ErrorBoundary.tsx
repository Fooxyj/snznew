
import React, { Component, ErrorInfo, ReactNode } from 'react';
// Comment above fix: Corrected typo from RefreshCcw to RefreshCw to match other components.
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

// Comment above fix: Explicitly extending Component with Props and State generic parameters ensures that inherited members like state, props, and setState are correctly typed and recognized by the TypeScript compiler.
export class ErrorBoundary extends Component<Props, State> {
  // Comment above fix: Initializing the state object outside the constructor improves type detection for the 'state' property across the class.
  public state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
  }

  // Comment above fix: Implementing the static getDerivedStateFromError lifecycle method to update the component's state when an error is thrown during rendering.
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Comment above fix: Implementation of componentDidCatch for logging error information and stack traces.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  // Comment above fix: handleReset defined as an arrow function to ensure proper 'this' binding when calling this.setState, which is inherited from the base Component class.
  public handleReset = (): void => {
    // Comment above fix: Explicitly using this.setState from the inherited Component class
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  // Comment above fix: render method accessing this.state and this.props, which are standard properties of a class component extending React.Component.
  public render(): ReactNode {
    // Comment above fix: Correct access to state property inherited from Component
    const { hasError, error } = this.state;
    // Comment above fix: Correct access to props property inherited from Component
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) return fallback;

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

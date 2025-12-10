
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const contextValue = {
    toast: addToast,
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-slide-in backdrop-blur-md
              ${t.type === 'success' ? 'bg-white/90 dark:bg-gray-800/90 border-green-200 dark:border-green-800 text-gray-800 dark:text-gray-100' : ''}
              ${t.type === 'error' ? 'bg-white/90 dark:bg-gray-800/90 border-red-200 dark:border-red-800 text-gray-800 dark:text-gray-100' : ''}
              ${t.type === 'info' ? 'bg-white/90 dark:bg-gray-800/90 border-blue-200 dark:border-blue-800 text-gray-800 dark:text-gray-100' : ''}
              ${t.type === 'warning' ? 'bg-white/90 dark:bg-gray-800/90 border-yellow-200 dark:border-yellow-800 text-gray-800 dark:text-gray-100' : ''}
            `}
          >
            <div className={`mt-0.5 shrink-0
              ${t.type === 'success' ? 'text-green-500' : ''}
              ${t.type === 'error' ? 'text-red-500' : ''}
              ${t.type === 'info' ? 'text-blue-500' : ''}
              ${t.type === 'warning' ? 'text-yellow-500' : ''}
            `}>
              {t.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {t.type === 'info' && <Info className="w-5 h-5" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex-1 text-sm font-medium pt-0.5">{t.message}</div>
            <button 
              onClick={() => removeToast(t.id)} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

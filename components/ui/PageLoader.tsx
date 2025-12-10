import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-[#F8FAFC] dark:bg-gray-900 transition-colors">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Загрузка...</p>
      </div>
    </div>
  );
};
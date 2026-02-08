
import React, { useEffect, useState } from 'react';
import { Waves } from 'lucide-react';

interface SplashScreenProps {
  isVisible?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible = true }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
    setShouldRender(true);
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8 animate-in zoom-in duration-1000">
            <div className="absolute inset-0 bg-blue-600 rounded-[2rem] rotate-12 shadow-2xl shadow-blue-500/40"></div>
            <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] -rotate-6 opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-black text-5xl italic z-10">П</div>
            <Waves className="absolute -bottom-2 -right-2 w-8 h-8 text-blue-200 drop-shadow-xl animate-pulse" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1 uppercase italic">
          Простор
        </h1>
        <span className="text-[10px] font-black tracking-[0.5em] text-blue-600 uppercase block ml-1">
          Твой город
        </span>
        <div className="mt-12 flex justify-center">
            <div className="w-8 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-[progress_2s_infinite]"></div>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes progress {
            0% { width: 0%; transform: translateX(-100%); }
            50% { width: 100%; transform: translateX(0); }
            100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

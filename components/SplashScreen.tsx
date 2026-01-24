
import React, { useEffect, useState } from 'react';

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
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="text-center animate-pulse">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
          Снежинск
        </h1>
        <span className="text-sm md:text-base font-bold tracking-[0.5em] text-blue-200 uppercase block">
          Лайф
        </span>
        <div className="mt-8 flex justify-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

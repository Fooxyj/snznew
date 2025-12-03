
import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
          Снежинск
        </h1>
        <span className="text-sm md:text-base font-bold tracking-[0.5em] text-blue-200 uppercase block">
          Онлайн
        </span>
        <div className="mt-8 flex justify-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

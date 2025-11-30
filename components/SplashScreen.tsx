
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Prevent scrolling while splash screen is visible
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    // Animate progress bar
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Randomly increment to simulate loading
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 150);

    // Finish after 2.5 seconds
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        // Restore scrolling
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        onFinish();
      }, 500); // Wait for fade out animation
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimer);
      // Cleanup in case component unmounts early
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-surface flex flex-col items-center justify-center transition-opacity duration-500 overflow-hidden ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Logo */}
        <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 animate-bounce mb-6">
          <span className="font-black text-5xl">С</span>
        </div>

        {/* App Name with fade-in */}
        <h1 className="text-2xl font-bold text-dark mb-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Твой Снежинск
        </h1>
        <p className="text-sm text-secondary animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          Город в твоем кармане
        </p>

        {/* Custom Progress Bar */}
        <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-8 overflow-hidden relative">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 text-xs text-gray-300">
        Загрузка данных...
      </div>
    </div>
  );
};

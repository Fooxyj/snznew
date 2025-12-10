
import React, { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from './ui/Common';

export const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Check if dismissed previously
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed) {
        const dismissedAt = parseInt(isDismissed);
        const now = Date.now();
        // Show again after 3 days
        if (now - dismissedAt < 1000 * 60 * 60 * 24 * 3) return;
    }

    // Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Delay showing
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  const handleInstall = () => {
    // Real PWA install logic would use `beforeinstallprompt` event for Android
    // For this demo, we simulate the experience or show instructions for iOS
    if (isIOS) {
        alert("Нажмите кнопку 'Поделиться' в браузере и выберите 'На экран «Домой»'");
    } else {
        // Fallback or actual prompt trigger if available
        alert("Чтобы установить, нажмите настройки браузера (три точки) -> 'Установить приложение'");
    }
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-4 relative">
        <button 
            onClick={handleDismiss} 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
            <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Установите Снежинск Онлайн</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Быстрый доступ прямо с экрана домой</p>
            </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button 
                onClick={handleInstall} 
                className="flex-1 sm:w-auto whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
            >
                {isIOS ? <Share className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                {isIOS ? 'Как установить' : 'Установить'}
            </Button>
        </div>
      </div>
    </div>
  );
};

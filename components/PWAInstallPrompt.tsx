
import React, { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from './ui/Common';

export const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed) {
        const dismissedAt = parseInt(isDismissed);
        const now = Date.now();
        if (now - dismissedAt < 1000 * 60 * 60 * 24 * 3) return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  const handleInstall = () => {
    if (isIOS) {
        alert("Нажмите кнопку 'Поделиться' в браузере и выберите 'На экран «Домой»'");
    } else {
        alert("Чтобы установить, нажмите настройки браузера (три точки) -> 'Установить приложение'");
    }
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-4 right-4 lg:left-80 lg:right-4 z-[100] max-w-sm ml-auto animate-in slide-in-from-top-5 fade-in duration-500">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.2)] border border-blue-100 dark:border-gray-700 flex items-center gap-3 relative">
        <button 
            onClick={handleDismiss} 
            className="absolute -top-1 -right-1 bg-white dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full shadow-md border dark:border-gray-600 transition-colors"
        >
            <X className="w-3 h-3" />
        </button>
        
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <span className="text-white font-black text-sm">S</span>
            </div>
            <div className="min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white text-[10px] truncate leading-none mb-0.5">Снежинск Лайф</h3>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-none">Быстрый доступ</p>
            </div>
        </div>

        <Button 
            onClick={handleInstall} 
            className="shrink-0 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-8"
        >
            {isIOS ? <Share className="w-3 h-3 mr-1" /> : <Download className="w-3 h-3 mr-1" />}
            {isIOS ? 'ИНФО' : 'УСТАНОВИТЬ'}
        </Button>
      </div>
    </div>
  );
};

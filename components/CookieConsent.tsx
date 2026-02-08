
import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Common';
import { Link } from 'react-router-dom';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('snz_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('snz_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-4 right-4 z-[110] animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="max-w-4xl mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-blue-100 dark:border-gray-700 p-5 md:p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col md:flex-row items-center gap-6">
        
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shrink-0">
            <Cookie className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-black dark:text-white uppercase tracking-tight mb-1 flex items-center gap-2">
              Простор использует Cookies <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Мы используем технологию cookies, чтобы сделать ваш опыт в Просторе бесшовным и безопасным. Продолжая, вы соглашаетесь с нашей{' '}
              <Link to="/legal#privacy" className="text-blue-600 underline hover:text-blue-700">политикой конфиденциальности</Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            Принимаю
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

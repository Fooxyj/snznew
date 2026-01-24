
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Common';
import { Map, Trophy, ShoppingBag, ArrowRight, Check } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('snz_onboarding_seen');
    if (!seen) {
      const timer = setTimeout(() => setIsVisible(true), 2500); 
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFinish = () => {
    setIsVisible(false);
    localStorage.setItem('snz_onboarding_seen', 'true');
  };

  const steps = [
    {
      title: "Добро пожаловать!",
      desc: "Снежинск Лайф — это единое приложение для жизни в любимом городе.",
      icon: <Map className="w-16 h-16 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      title: "Копите опыт (XP)",
      desc: "Участвуйте в жизни города, проходите квесты и обменивайте баллы на реальные скидки.",
      icon: <Trophy className="w-16 h-16 text-yellow-600" />,
      color: "bg-yellow-100"
    },
    {
      title: "Все услуги рядом",
      desc: "Заказ еды, афиша кино, объявления и вызов такси — всё в одном месте.",
      icon: <ShoppingBag className="w-16 h-16 text-purple-600" />,
      color: "bg-purple-100"
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col items-center text-center relative overflow-hidden">
        
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${steps[step].color}`}>
          {steps[step].icon}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-all duration-300">
          {steps[step].title}
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 h-16 transition-all duration-300 leading-relaxed">
          {steps[step].desc}
        </p>

        <div className="flex gap-2 mb-8">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>

        <div className="w-full">
          {step < steps.length - 1 ? (
            <Button className="w-full py-3.5 text-lg" onClick={() => setStep(step + 1)}>
              Далее <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button className="w-full py-3.5 text-lg bg-green-600 hover:bg-green-700" onClick={handleFinish}>
              Начать <Check className="w-5 h-5 ml-2" />
            </Button>
          )}
          
          <button 
            onClick={handleFinish}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium"
          >
            Пропустить
          </button>
        </div>
      </div>
    </div>
  );
};

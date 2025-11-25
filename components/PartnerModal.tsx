
import React, { useState } from 'react';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'info' | 'success'>('info');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь должна быть отправка данных на бэкенд
    setStep('success');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-4xl rounded-3xl shadow-2xl relative flex flex-col md:flex-row min-h-[500px] my-auto animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Side: Value Proposition */}
        <div className="w-full md:w-5/12 bg-dark text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden md:rounded-l-3xl rounded-t-3xl md:rounded-tr-none">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/30">B</span>
                    <span className="font-bold text-lg tracking-tight">Снежинск.Бизнес</span>
                </div>
                <h2 className="text-3xl font-bold leading-tight mb-4">Развивайте бизнес вместе с городом</h2>
                <p className="text-gray-400 leading-relaxed mb-8 text-sm">
                    Подключитесь к единой платформе Снежинска и получите доступ к тысячам клиентов ежедневно.
                </p>
                
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <span className="block font-bold text-sm">Личный кабинет</span>
                            <span className="text-xs text-gray-400">Управляйте услугами и ценами онлайн</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <span className="block font-bold text-sm">Онлайн-бронирование</span>
                            <span className="text-xs text-gray-400">Бани, коттеджи, кино, столики</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <span className="block font-bold text-sm">VIP Размещение</span>
                            <span className="text-xs text-gray-400">Выделяйтесь среди конкурентов</span>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div className="mt-8 relative z-10 hidden md:block">
                <p className="text-xs text-gray-500">Уже более 50 компаний города с нами</p>
                <div className="flex -space-x-2 mt-2">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-dark bg-gray-700 flex items-center justify-center text-xs text-white">
                            {String.fromCharCode(64 + i)}
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-dark bg-gray-800 flex items-center justify-center text-[10px] text-white">
                        +46
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 bg-white p-6 md:p-10 flex flex-col justify-center rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none">
            {step === 'info' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <h3 className="text-2xl font-bold text-dark mb-1">Заявка на подключение</h3>
                        <p className="text-secondary text-sm">Заполните данные, и менеджер свяжется с вами.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-dark mb-2">Название компании</label>
                            <input type="text" required placeholder="ООО Вектор" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-dark mb-2">Сфера деятельности</label>
                            <div className="relative">
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                    <option>Аренда недвижимости (Бани, дома)</option>
                                    <option>Ресторан / Кафе</option>
                                    <option>Кинотеатр / Развлечения</option>
                                    <option>Магазин / Ритейл</option>
                                    <option>Услуги / Сервис</option>
                                    <option>Другое</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-dark mb-2">Контактное лицо</label>
                        <input type="text" required placeholder="Иванов Иван" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-dark mb-2">Телефон</label>
                            <input type="tel" required placeholder="+7 (999) 000-00-00" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-dark mb-2">Email</label>
                            <input type="email" required placeholder="biz@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-dark mb-2">Комментарий</label>
                        <textarea rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"></textarea>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-dark text-white font-bold text-lg py-3.5 rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition-all active:scale-95">
                            Отправить заявку
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            Нажимая кнопку, вы соглашаетесь с условиями обработки данных
                        </p>
                    </div>
                </form>
            ) : (
                <div className="flex flex-col items-center justify-center text-center h-full animate-fade-in-up py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-3xl font-bold text-dark mb-3">Заявка принята!</h3>
                    <p className="text-secondary max-w-sm mb-8 text-lg leading-relaxed">
                        Спасибо за интерес к платформе. Наш менеджер свяжется с вами в течение рабочего дня.
                    </p>
                    <button 
                        onClick={onClose}
                        className="bg-gray-100 text-dark font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Вернуться на сайт
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

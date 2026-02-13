
import React, { useState } from 'react';
import { Sparkles, X, ShieldCheck, Zap, Info, Gavel, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from './ui/Common';
import { useNavigate } from 'react-router-dom';

export const LaunchTicker: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleStart = () => {
        setIsModalOpen(false);
        navigate('/business-connect');
    };

    return (
        <>
            {/* Бесшовная бегущая строка */}
            <div 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 overflow-hidden cursor-pointer hover:bg-blue-500 transition-colors group relative z-10 rounded-2xl mb-4 shadow-lg shadow-blue-500/20"
            >
                <div className="flex whitespace-nowrap animate-marquee">
                    {/* Первая часть */}
                    <div className="flex items-center shrink-0">
                        <span className="flex items-center gap-4 px-6 font-black uppercase text-[10px] tracking-widest">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> 
                            Акция: Первый месяц размещения — бесплатно для бизнеса и мастеров Снежинска! 
                            <span className="bg-white/20 px-2 py-0.5 rounded text-white border border-white/30 ml-2">Узнать условия</span>
                        </span>
                        <span className="flex items-center gap-4 px-6 font-black uppercase text-[10px] tracking-widest">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> 
                            Размещайте товары, вакансии и услуги в экосистеме Простор бесплатно 30 дней!
                        </span>
                    </div>
                    {/* Точная копия для бесшовного перехода */}
                    <div className="flex items-center shrink-0">
                        <span className="flex items-center gap-4 px-6 font-black uppercase text-[10px] tracking-widest">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> 
                            Акция: Первый месяц размещения — бесплатно для бизнеса и мастеров Снежинска! 
                            <span className="bg-white/20 px-2 py-0.5 rounded text-white border border-white/30 ml-2">Узнать условия</span>
                        </span>
                        <span className="flex items-center gap-4 px-6 font-black uppercase text-[10px] tracking-widest">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> 
                            Размещайте товары, вакансии и услуги в экосистеме Простор бесплатно 30 дней!
                        </span>
                    </div>
                </div>
                <style>{`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                        display: flex;
                        width: fit-content;
                        animation: marquee 30s linear infinite;
                    }
                    .animate-marquee:hover {
                        animation-play-state: paused;
                    }
                `}</style>
            </div>

            {/* Модальное окно с подробностями */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border dark:border-gray-700 animate-in zoom-in-95 duration-300">
                        
                        <div className="p-6 md:p-8 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Первый месяц — бесплатно</h3>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Спецпредложение при запуске</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
                            <section>
                                <p className="text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                                    "В честь старта проекта все платные услуги размещения на портале предоставляются абсолютно бесплатно в течение 1 месяца с момента подключения."
                                </p>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                                    <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-4 flex items-center gap-2">
                                        <CheckCircle2Icon className="w-4 h-4" /> Что доступно:
                                    </h4>
                                    <ul className="space-y-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                                        <li>• Бизнес-страница (8 товаров)</li>
                                        <li>• Размещение вакансий</li>
                                        <li>• Услуги мастеров</li>
                                        <li>• Рекламные блоки (с ERID)</li>
                                        <li>• Выделение в поиске</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border dark:border-gray-700">
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                                        <Info className="w-4 h-4" /> Условия:
                                    </h4>
                                    <ul className="space-y-3 text-xs font-bold text-gray-500">
                                        <li>• Действует до 31.03.2026</li>
                                        <li>• Период: 30 календарных дней</li>
                                        <li>• Для ИП/ООО и мастеров Снежинска</li>
                                        <li>• Отмена в любой момент</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-6 bg-red-50/50 dark:bg-red-900/10 border-2 border-dashed border-red-200 dark:border-red-900/50 rounded-3xl">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                                    <div className="text-xs text-red-800 dark:text-red-300 leading-relaxed font-medium">
                                        <strong>Важно:</strong> данная акция не является безвозмездной передачей услуг. Стоимость услуг условно приравнивается к 1 рублю для соблюдения налогового законодательства.
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <Gavel className="w-4 h-4" /> Юридическая основа
                                </button>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                    Условия зафиксированы в Правилах участия, утвержденных Администрацией. Все участники получают подтверждение с указанием дат. Полная информация в разделе «Правовая информация».
                                </p>
                            </div>
                        </div>

                        <div className="p-8 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row gap-4 shrink-0">
                            <Button 
                                onClick={handleStart}
                                className="flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Начать пользоваться
                            </Button>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                                Понятно
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const CheckCircle2Icon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

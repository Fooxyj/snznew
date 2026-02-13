
import React, { useState } from 'react';
import { 
    Sparkles, CheckCircle2, Info, ChevronDown, 
    ShieldCheck, Gavel, ArrowRight, Star, 
    Zap, Rocket, AlertTriangle
} from 'lucide-react';
import { Button } from './ui/Common';
import { Link } from 'react-router-dom';

export const LaunchPromo: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    const [showLegal, setShowLegal] = useState(false);

    return (
        <section className={`relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${compact ? 'bg-white dark:bg-gray-800 p-6' : 'bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 p-8 md:p-12 text-white shadow-2xl shadow-blue-500/20'}`}>
            {/* Декор фона для не-компактного режима */}
            {!compact && (
                <>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/10 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>
                    <Rocket className="absolute top-10 right-10 w-20 h-20 text-white/10 -rotate-12 animate-pulse" />
                </>
            )}

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl ${compact ? 'bg-blue-50 text-blue-600' : 'bg-white/20 backdrop-blur-md text-white border border-white/10'}`}>
                            <Sparkles className="w-3.5 h-3.5" /> Запускаем Простор вместе
                        </div>
                        <h2 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6 ${compact ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                            Первый месяц — <br/> <span className={compact ? 'text-blue-600' : 'text-yellow-300'}>абсолютно бесплатно</span>
                        </h2>
                        <p className={`text-sm md:text-lg font-medium leading-relaxed max-w-2xl mb-8 ${compact ? 'text-gray-500' : 'text-blue-100/80'}`}>
                            В честь старта проекта все платные услуги размещения на портале предоставляются бесплатно в течение 30 дней с момента подключения.
                        </p>
                    </div>
                    {!compact && (
                        <div className="shrink-0 flex flex-col gap-4">
                            <Link to="/business-connect">
                                <Button className="bg-white text-blue-900 hover:bg-blue-50 border-none px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:scale-105 active:scale-95">
                                    Подключить мой бизнес <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                    <div className={`p-6 rounded-3xl border transition-all ${compact ? 'bg-gray-50 dark:bg-gray-900 border-gray-100' : 'bg-white/5 backdrop-blur-md border-white/10'}`}>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2 ${compact ? 'text-blue-600' : 'text-yellow-400'}`}>
                            <Zap className="w-4 h-4" /> Что доступно бесплатно:
                        </h4>
                        <ul className="space-y-3">
                            {[
                                'Бизнес-страница (8 карточек товаров)',
                                'Размещение вакансий',
                                'Услуги мастеров и ремесленников',
                                'Рекламные блоки (с ERID)',
                                'Выделение в поиске и категориях'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-xs md:text-sm font-bold opacity-90">
                                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${compact ? 'text-green-500' : 'text-green-400'}`} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={`p-6 rounded-3xl border transition-all ${compact ? 'bg-gray-50 dark:bg-gray-900 border-gray-100' : 'bg-white/5 backdrop-blur-md border-white/10'}`}>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2 ${compact ? 'text-blue-600' : 'text-yellow-400'}`}>
                            <Info className="w-4 h-4" /> Условия участия:
                        </h4>
                        <ul className="space-y-3">
                            {[
                                'Акция действует до 31 марта 2026 г.',
                                'Период — 30 дней с даты активации',
                                'Для всех ИП/ООО и мастеров ЗАТО',
                                'Отмена в любой момент — без штрафов'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-xs md:text-sm font-bold opacity-90">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${compact ? 'bg-blue-600' : 'bg-white'}`}></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Юридический блок */}
                <div className="mt-10 pt-8 border-t border-white/10">
                    <button 
                        onClick={() => setShowLegal(!showLegal)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${compact ? 'text-gray-400 hover:text-blue-600' : 'text-white/40 hover:text-white'}`}
                    >
                        {showLegal ? <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform" /> : <ChevronDown className="w-3.5 h-3.5 transition-transform" />}
                        Юридическая основа акции
                    </button>

                    {showLegal && (
                        <div className={`mt-6 p-6 rounded-2xl text-[11px] leading-relaxed space-y-4 animate-in slide-in-from-top-2 duration-300 font-medium ${compact ? 'bg-gray-100 dark:bg-gray-900 text-gray-500' : 'bg-black/20 text-white/60'}`}>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" />
                                <p><strong>Важно:</strong> Данная акция не является безвозмездной передачей услуг. Условием бесплатного размещения является регистрация и активное использование платформы в период запуска. Стоимость услуг условно приравнивается к 1 рублю, что подтверждается внутренними документами оператора.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Gavel className="w-4 h-4 shrink-0 text-orange-400" />
                                <p>Условия зафиксированы в Правилах участия. Оператор не несёт ответственности за сделки между пользователями. Полные Правила и Политика конфиденциальности — в разделе «Правовая информация».</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                                <p>По истечении 30 дней произойдет автоматическое переключение на стандартные тарифы. Мы уведомим вас за 3 дня до окончания периода.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    ChevronLeft, ShieldCheck, FileText, Scale, 
    Shield, FileJson, AlertCircle, 
    Gavel, UserCheck, ShieldAlert, Handshake, 
    HardDrive, Lock, Clock, Wallet, 
    CreditCard, BadgeCheck, MessageSquare, 
    ChevronRight, BookOpen, Fingerprint, Receipt,
    CheckCircle2, Ban, AlertTriangle, AlertOctagon, Heart, Car, Info, Megaphone
} from 'lucide-react';

type DocType = 'terms' | 'privacy' | 'ads' | 'charity';

export const LegalPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DocType>('terms');
    const navigate = useNavigate();
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const id = hash.replace('#', '');
            if (['terms', 'privacy', 'ads', 'charity'].includes(id)) {
                setActiveTab(id as DocType);
            }
        }
    }, [hash]);

    const platformName = "Снежинск Лайф";
    const updateDate = "22.05.2024";

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8 pb-32">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors font-bold group">
                <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" /> Назад
            </button>

            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 italic">Legal Center</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Юридические стандарты и регламенты экосистемы {platformName}</p>
            </div>

            {/* Навигация по документам */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-[2rem] mb-12 shadow-inner overflow-x-auto scrollbar-hide border dark:border-gray-700">
                {[
                    { id: 'terms', label: 'Оферта', icon: FileText },
                    { id: 'privacy', label: 'Приватность', icon: ShieldCheck },
                    { id: 'ads', label: 'Реклама', icon: Megaphone },
                    { id: 'charity', label: 'Добро', icon: Heart },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as DocType)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xl scale-[1.02]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-6 md:p-16 border border-gray-100 dark:border-gray-700 shadow-2xl relative min-h-[600px]">
                
                {/* 1. ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ (ОФЕРТА) */}
                {activeTab === 'terms' && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="mb-10 border-b dark:border-gray-700 pb-8">
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter">Пользовательское соглашение</h2>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest flex items-center gap-2">
                                <Clock className="w-3 h-3"/> Редакция от {updateDate} • Публичная оферта
                            </p>
                        </div>

                        <div className="prose prose-blue dark:prose-invert max-w-none text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-8">
                                <h3 className="text-blue-900 dark:text-blue-300 font-black uppercase text-base flex items-center gap-2 mb-3">
                                    <Scale className="w-5 h-5" /> Статус платформы (ст. 1253.1 ГК РФ)
                                </h3>
                                <p>Платформа «{platformName}» является <strong>информационным посредником</strong>. Мы предоставляем технологическую инфраструктуру для взаимодействия пользователей, но не являемся участником сделок. Администрация не несет ответственности за качество товаров и услуг, предоставляемых пользователями или бизнесом.</p>
                            </div>

                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">1. Предмет соглашения</h4>
                            <p>Настоящее Соглашение является юридически обязательным договором между Пользователем и Администрацией портала. Использование любой функции портала означает полный и безоговорочный акцепт настоящей оферты.</p>

                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">2. Регистрация и Личный кабинет</h4>
                            <p>Для доступа к сервисам публикации контента Пользователь обязан пройти регистрацию. Пользователь обязуется предоставлять достоверные данные. Использование аккаунта для введения в заблуждение или мошенничества влечет немедленную блокировку (ст. 159 УК РФ).</p>

                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">3. Модерация и контент</h4>
                            <p>Администрация оставляет за собой право на премодерацию и постмодерацию любого контента. Мы вправе удалять сообщения, объявления или отзывы, нарушающие нормы морали или законодательство РФ, без объяснения причин.</p>
                        </div>
                    </section>
                )}

                {/* 2. ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ (152-ФЗ) */}
                {activeTab === 'privacy' && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="mb-10 border-b dark:border-gray-700 pb-8">
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter">Политика обработки данных</h2>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-green-500"/> Соответствие 152-ФЗ «О персональных данных»
                            </p>
                        </div>

                        <div className="space-y-8 text-sm text-gray-600 dark:text-gray-300">
                            <article>
                                <h4 className="font-black text-gray-900 dark:text-white uppercase mb-3 tracking-tight">1. Какие данные мы собираем</h4>
                                <p>Мы обрабатываем: ФИО, номер телефона, адрес электронной почты, IP-адрес, данные файлов cookie и геолокацию (с вашего согласия). Для бизнес-аккаунтов собираются реквизиты (ИНН/ОГРН).</p>
                            </article>

                            <article>
                                <h4 className="font-black text-gray-900 dark:text-white uppercase mb-3 tracking-tight">2. Цели обработки</h4>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Обеспечение работы сервисов (авторизация, чаты, бронирование).</li>
                                    <li>Предотвращение фрода и мошеннических действий.</li>
                                    <li>Улучшение пользовательского опыта и аналитика.</li>
                                    <li>Выполнение требований законодательства РФ.</li>
                                </ul>
                            </article>

                            <article>
                                <h4 className="font-black text-gray-900 dark:text-white uppercase mb-3 tracking-tight">3. Хранение и передача</h4>
                                <p>Данные хранятся на защищенных серверах на территории РФ. Передача третьим лицам возможна только для исполнения договора (например, платежным системам) или по законному требованию правоохранительных органов.</p>
                            </article>
                        </div>
                    </section>
                )}

                {/* 4. ОБЪЯВЛЕНИЯ И РЕКЛАМА (38-ФЗ) */}
                {activeTab === 'ads' && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="mb-10 border-b dark:border-gray-700 pb-8">
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter">Объявления и Реклама</h2>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3 text-blue-500"/> Соответствие ФЗ «О рекламе»
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 text-sm">
                            <div className="space-y-4">
                                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Ban className="w-4 h-4 text-red-500" /> Запрещено к публикации
                                </h4>
                                <ul className="list-disc pl-5 text-gray-500 space-y-2">
                                    <li>Оружие, наркотики, алкоголь, табак.</li>
                                    <li>Интимные услуги и эротика.</li>
                                    <li>Финансовые пирамиды и азартные игры.</li>
                                    <li>Поддельные документы и госнаграды.</li>
                                    <li>Животные из Красной книги.</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Megaphone className="w-4 h-4 text-blue-500" /> Правила для бизнеса
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300">Любой платный рекламный материал должен содержать пометку «Реклама» и данные о рекламодателе (ИНН/ОГРН) согласно требованиям ЕРИР.</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* 5. БЛАГОТВОРИТЕЛЬНОСТЬ */}
                {activeTab === 'charity' && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="mb-10 border-b dark:border-gray-700 pb-8">
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter">Раздел «Добро»</h2>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest flex items-center gap-2">
                                <Heart className="w-3 h-3 text-red-500 fill-current"/> Социальная ответственность
                            </p>
                        </div>

                        <div className="space-y-8 text-sm text-gray-600 dark:text-gray-300">
                            <p>Раздел предназначен для информационной поддержки благотворительных фондов и частных инициатив. Платформа <strong>не принимает денежные средства</strong> на свои счета.</p>
                            
                            <article className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border dark:border-gray-700">
                                <h4 className="font-black text-gray-900 dark:text-white uppercase mb-3 tracking-tight">Верификация сборов</h4>
                                <p>Мы стремимся проверять легальность размещаемых сборов, однако не можем гарантировать целевое использование средств организаторами. Все транзакции совершаются напрямую по реквизитам фондов или через их официальные сайты.</p>
                            </article>
                        </div>
                    </section>
                )}
            </div>

            <div className="mt-16 text-center">
                <div className="flex justify-center gap-6 mb-6">
                    <img src="https://ui-avatars.com/api/?name=SNZ&background=0D8ABC&color=fff" className="w-12 h-12 rounded-xl grayscale opacity-30" alt="" />
                </div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">© 2024-2026 {platformName.toUpperCase()} • DIGITAL ZATO</p>
                <p className="text-gray-500 text-[8px] max-w-lg mx-auto leading-relaxed">
                    Данный ресурс является агрегатором. Все торговые марки принадлежат их владельцам. Администрация не несет ответственности за пользовательский контент.
                </p>
            </div>
        </div>
    );
};

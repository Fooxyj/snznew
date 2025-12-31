
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, ShieldCheck, Scale, Info } from 'lucide-react';
import { Button } from '../components/ui/Common';

type DocType = 'privacy' | 'terms' | 'offer';

export const LegalPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DocType>('privacy');
    const navigate = useNavigate();

    const tabs = [
        { id: 'privacy', label: 'Приватность', icon: ShieldCheck },
        { id: 'terms', label: 'Соглашение', icon: FileText },
        { id: 'offer', label: 'Оферта', icon: Scale },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-bold group">
                <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" /> Назад
            </button>

            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight">Юридическая информация</h1>

            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-8 overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as DocType)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 dark:border-gray-700 shadow-sm prose prose-blue dark:prose-invert max-w-none">
                {activeTab === 'privacy' && (
                    <section className="animate-in fade-in duration-300">
                        <h2 className="text-2xl font-black mb-6">Политика в отношении обработки персональных данных</h2>
                        <p className="text-gray-500 text-xs mb-8 italic">Последнее обновление: 24 мая 2024 г.</p>
                        <p>Настоящая Политика конфиденциальности описывает, как портал «Снежинск Онлайн» собирает, использует и защищает информацию, которую вы предоставляете при использовании нашего сервиса.</p>
                        <h3>1. Сбор информации</h3>
                        <p>Мы собираем информацию, необходимую для функционирования городского портала: имя, адрес электронной почты, номер телефона (для объявлений и такси), а также данные о местоположении (для работы карты и квестов).</p>
                        <h3>2. Использование данных</h3>
                        <p>Ваши данные используются исключительно для обеспечения взаимодействия внутри сообщества города Снежинска, верификации бизнес-аккаунтов и предотвращения мошенничества.</p>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex gap-3 my-6">
                            <Info className="w-5 h-5 text-blue-600 shrink-0" />
                            <p className="m-0 text-sm text-blue-800 dark:text-blue-300 font-medium">Ваши контактные данные в объявлениях скрыты от незарегистрированных пользователей для защиты от спама.</p>
                        </div>
                        <h3>3. Права пользователей</h3>
                        <p>Вы имеете право в любой момент запросить удаление вашего профиля и всех связанных данных через настройки приложения.</p>
                    </section>
                )}

                {activeTab === 'terms' && (
                    <section className="animate-in fade-in duration-300">
                        <h2 className="text-2xl font-black mb-6">Пользовательское соглашение</h2>
                        <p className="text-gray-500 text-xs mb-8 italic">Редакция от 24.05.2024</p>
                        <p>Используя Снежинск Онлайн, вы обязуетесь соблюдать правила вежливого и законного общения в городском пространстве.</p>
                        <h3>1. Правила публикации</h3>
                        <p>Запрещается публикация объявлений, содержащих заведомо ложную информацию, а также предложений товаров и услуг, запрещенных законодательством РФ.</p>
                        <h3>2. Модерация</h3>
                        <p>Администрация оставляет за собой право блокировать контент и пользователей, нарушающих принципы добрососедства и правила безопасности.</p>
                        <h3>3. Баллы и награды</h3>
                        <p>Начисляемые XP не являются платежным средством и могут быть использованы только внутри системы бонусов портала.</p>
                    </section>
                )}

                {activeTab === 'offer' && (
                    <section className="animate-in fade-in duration-300">
                        <h2 className="text-2xl font-black mb-6">Публичная оферта</h2>
                        <p className="text-gray-500 text-xs mb-8 italic">Для бизнес-пользователей и меценатов</p>
                        <p>Настоящий документ является предложением портала «Снежинск Онлайн» заключить договор на оказание информационных услуг и услуг по продвижению бизнеса.</p>
                        <h3>1. Платные услуги</h3>
                        <p>Продвижение объявлений (VIP/PRO статусы) является добровольной услугой. Оплата производится через защищенный эквайринг.</p>
                        <h3>2. Пожертвования (Charity)</h3>
                        <p>Средства, перечисляемые в разделе «Добро», направляются напрямую организаторам сборов. Портал не удерживает комиссию с благотворительных платежей.</p>
                    </section>
                )}
            </div>
            
            <div className="mt-12 text-center text-gray-400 text-sm font-medium">
                © 2024 Снежинск Онлайн. Сделано с любовью к городу.
            </div>
        </div>
    );
};

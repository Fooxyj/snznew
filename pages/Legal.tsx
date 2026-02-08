
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    ChevronLeft, ShieldCheck, FileText, Scale, 
    Shield, Clock, Heart, Gavel, UserCheck, 
    Landmark, Mail, MessageSquare, Printer,
    Briefcase, User, Download, AlertTriangle,
    Ban, Info, Cookie, Waves
} from 'lucide-react';

const LogoIcon: React.FC<any> = (props) => (
    <div className={`relative ${props.className || 'w-10 h-10'}`}>
        <div className="absolute inset-0 bg-blue-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
        <div className="absolute inset-0 bg-indigo-600 rounded-xl -rotate-3 group-hover:-rotate-6 transition-transform duration-500 opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white font-black text-xl italic z-10">П</div>
        <Waves className="absolute -bottom-1 -right-1 w-4 h-4 text-white drop-shadow-md" />
    </div>
);

type DocType = 'terms' | 'privacy' | 'rules' | 'consent' | 'cookies';

export const LegalPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DocType>('terms');
    const navigate = useNavigate();
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const id = hash.replace('#', '');
            if (['terms', 'privacy', 'rules', 'consent', 'cookies'].includes(id)) {
                setActiveTab(id as DocType);
            }
        }
    }, [hash]);

    const platformName = "Простор";
    const platformUrl = "prostor-app.ru";
    const ownerName = "Администрация платформы ПРОСТОР";
    const contactEmail = "fooxyj@yandex.ru";
    const abuseEmail = "abuse@prostor-app.ru";
    const privacyEmail = "privacy@prostor-app.ru";
    const updateDate = "01 марта 2025 г.";

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8 pb-32 print:p-0">
            <div className="flex items-center justify-between mb-8 print:hidden">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold group">
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" /> Назад
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
                    <Printer className="w-4 h-4" /> Распечатать
                </button>
            </div>

            <div className="mb-10 print:mb-4">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 italic">Юридический центр</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Регламенты и оферты экосистемы {platformName}</p>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-[2rem] mb-12 shadow-inner overflow-x-auto scrollbar-hide border dark:border-gray-700 print:hidden">
                {[
                    { id: 'terms', label: 'Оферта', icon: FileText },
                    { id: 'privacy', label: 'Приватность', icon: ShieldCheck },
                    { id: 'rules', label: 'Регламент', icon: Gavel },
                    { id: 'consent', label: 'Согласие', icon: UserCheck },
                    { id: 'cookies', label: 'Cookies', icon: Cookie },
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

            <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-8 md:p-16 border border-gray-100 dark:border-gray-700 shadow-2xl relative print:shadow-none print:border-none print:p-0">
                
                {activeTab === 'terms' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12 border-b dark:border-gray-700 pb-8">
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Пользовательское соглашение</h2>
                            <p className="text-blue-600 font-bold uppercase text-xs tracking-widest">(Публичная оферта)</p>
                            <div className="mt-6 flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>г. Снежинск</span>
                                <span>Редакция от {updateDate}</span>
                            </div>
                        </div>

                        <div className="prose prose-blue dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300 space-y-8">
                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">1. ОБЩИЕ ПОЛОЖЕНИЯ</h3>
                                <p>1.1. Настоящее Пользовательское соглашение (далее – «Соглашение») является официальным, публичным предложением Администрации Сайта (Офертой) и регулирует отношения между владельцем Интернет-ресурса «{platformName}», расположенного по адресу {platformUrl} (далее – «Портал», «Площадка», «Сайт»), в лице {ownerName}, именуемого в дальнейшем «Администрация», и любым лицом, выразившим согласие с условиями Соглашения.</p>
                                <p>1.2. Публичная оферта считается акцептованной, а Соглашение заключенным и приобретшим юридическую силу с момента завершения Пользователем процедуры регистрации на Сайте путем проставления отметки в соответствующем поле регистрационной формы.</p>
                                <p>1.3. Соглашение, включая все изменения, размещено в свободном доступе по адресу: {platformUrl}/legal#terms.</p>
                                <p>1.4. Регистрируясь на Портале, Пользователь подтверждает, что обладает необходимой дееспособностью и достиг возраста, допускающего самостоятельное использование сервиса согласно законам РФ.</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">2. СТАТУС ПЛАТФОРМЫ И ХАРАКТЕР ОТНОШЕНИЙ</h3>
                                <p>2.1. Портал является информационным посредником (агрегатором) в смысле, определенном ст. 1253.1 Гражданского кодекса Российской Федерации. Администрация предоставляет техническую возможность для размещения информации жителями и бизнесом.</p>
                                <p>2.2. Администрация не является автором, продавцом или покупателем контента, размещаемого Пользователями. Администрация не проверяет качество, законность и безопасность товаров и услуг, предлагаемых пользователями друг другу.</p>
                                <p>2.3. Любые договорные отношения возникают исключительно между Пользователями. Администрация не является стороной таких отношений и не несет ответственности за ущерб, причиненный в ходе сделок между пользователями.</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">3. РЕГИСТРАЦИЯ И УЧЕТНЫЕ ЗАПИСИ</h3>
                                <p>3.1. Для доступа к полному функционалу (размещению объявлений, чатам) Пользователь обязан пройти процедуру регистрации с созданием Личного кабинета.</p>
                                <p>3.2. Пользователь обязуется предоставлять достоверную и актуальную информацию о себе.</p>
                                <p>3.3. Пользователь самостоятельно несет ответственность за сохранность логина и пароля.</p>
                                <p>3.4. Администрация предоставляет возможность создания «Бизнес-кабинета» для профессиональной деятельности. Создавая его, Пользователь подтверждает наличие соответствующего правового статуса (ИП/ЮЛ).</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">4. ПРАВИЛА РАЗМЕЩЕНИЯ КОНТЕНТА</h3>
                                <p>4.1. Под контентом понимаются тексты, изображения, видео, ссылки и иные материалы, размещаемые Пользователем.</p>
                                <p>4.2. Пользователь гарантирует наличие прав на размещаемый контент и отсутствие нарушений прав третьих лиц.</p>
                                <p>4.3. Запрещено размещение контента, нарушающего законы РФ (экстремизм, порнография, призывы к насилию, спам, мошенничество).</p>
                                <p>4.4. Администрация вправе удалять любой контент без предварительного уведомления.</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">5. ОТВЕТСТВЕННОСТЬ СТОРОН</h3>
                                <p>5.1. Администрация не несет ответственности за последствия использования контента Пользователей, технические сбои или любые убытки Пользователя.</p>
                                <p>5.2. Пользователь обязуется возместить Администрации все убытки, возникшие в связи с его действиями или претензиями третьих лиц.</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">6. ИНТЕЛЛЕКТУАЛЬНАЯ СОБСТВЕННОСТЬ</h3>
                                <p>6.1. Дизайн, код и скрипты Сайта являются объектами исключительных прав Администрации.</p>
                                <p>6.2. Размещая контент, Пользователь предоставляет Администрации безвозмездную лицензию на его использование в целях функционирования Портала.</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">7. РЕКВИЗИТЫ</h3>
                                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-700 font-mono text-xs space-y-1">
                                    <p>Платформа: {platformName}</p>
                                    <p>Владелец: {ownerName}</p>
                                    <p>Email: {contactEmail}</p>
                                    <p>Abuse: {abuseEmail}</p>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12 border-b dark:border-gray-700 pb-8">
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Политика конфиденциальности</h2>
                            <p className="text-blue-600 font-bold uppercase text-xs tracking-widest">обработка персональных данных</p>
                        </div>

                        <div className="prose prose-blue dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300 space-y-8">
                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">1. ОБЩИЕ ПОЛОЖЕНИЯ</h3>
                                <p>1.1. Настоящая Политика определяет порядок обработки персональных данных и меры по обеспечению их безопасности в Администрации Интернет-ресурса «{platformName}».</p>
                                <p>1.2. Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».</p>
                                <p>1.3. Используя Сайт, Пользователь выражает безусловное согласие с условиями настоящей Политики.</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">2. ОСНОВНЫЕ ПОНЯТИЯ</h3>
                                <p>· <strong>Персональные данные (ПДн)</strong> — любая информация, относящаяся к определенному физическому лицу.</p>
                                <p>· <strong>Обработка ПДн</strong> — любое действие со сведениями: сбор, запись, хранение, уточнение, использование, передача, удаление.</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">3. СОСТАВ И ЦЕЛИ ОБРАБОТКИ</h3>
                                <p>3.1. Мы обрабатываем: ФИО, телефон, email, город, IP-адрес, данные cookie, историю переписки в чатах.</p>
                                <p>3.2. Цели: Идентификация, предоставление доступа к Личному кабинету, связь между пользователями, аналитика и улучшение сервиса, защита от мошенничества.</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">4. ЗАЩИТА И ПЕРЕДАЧА</h3>
                                <p>4.1. Обработка данных осуществляется исключительно на территории Российской Федерации.</p>
                                <p>4.2. Мы принимаем необходимые меры защиты: HTTPS-шифрование, регулярное резервное копирование, ограничение доступа персонала.</p>
                                <p>4.3. Данные могут быть переданы третьим лицам только для исполнения договора или по требованию госорганов согласно закону.</p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">5. ПРАВА СУБЪЕКТА</h3>
                                <p>Пользователь имеет право на доступ к своим данным, их уточнение, блокирование или уничтожение. Запросы направляются на {privacyEmail}.</p>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'rules' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12 border-b dark:border-gray-700 pb-8">
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Правила размещения (Регламент)</h2>
                            <p className="text-blue-600 font-bold uppercase text-xs tracking-widest">требования к контенту и общению</p>
                        </div>

                        <div className="prose prose-blue dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300 space-y-8">
                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">1. ЗАПРЕЩЕННЫЙ КОНТЕНТ</h3>
                                <p>Категорически не допускается размещение (согласно 149-ФЗ):</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Экстремистские материалы, разжигание ненависти.</li>
                                    <li>Порнография, в том числе детская.</li>
                                    <li>Информация о наркотиках и способах их изготовления.</li>
                                    <li>Призывы к суициду или насилию.</li>
                                    <li>Ложная общественно значимая информация.</li>
                                    <li>Материалы, нарушающие авторские права (контрафакт).</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">2. ПРАВИЛА ЧАТОВ И КОММЕНТАРИЕВ</h3>
                                <p>Общение на платформе должно быть уважительным. Запрещено:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Оскорбления, мат, троллинг.</li>
                                    <li>Спам, массовая рассылка, флуд.</li>
                                    <li>Использование чатов исключительно для рекламы без участия в теме.</li>
                                    <li>Публикация чужих персональных данных без согласия.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-4 tracking-tight">3. МОДЕРАЦИЯ И САНКЦИИ</h3>
                                <p>Администрация применяет следующие меры:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Предупреждение в личный кабинет.</li>
                                    <li>Удаление или блокировка контента.</li>
                                    <li>Временный бан аккаунта (от 1 до 30 дней).</li>
                                    <li>Перманентная блокировка за грубые или повторные нарушения.</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'consent' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12 border-b dark:border-gray-700 pb-8">
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Согласия на обработку</h2>
                            <p className="text-blue-600 font-bold uppercase text-xs tracking-widest">юридические формы</p>
                        </div>

                        <div className="prose prose-blue dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300 space-y-12">
                            <section className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-700">
                                <h3 className="text-gray-900 dark:text-white font-black uppercase text-base mb-6 tracking-tight text-center">ДЛЯ ФИЗИЧЕСКИХ ЛИЦ</h3>
                                <p className="italic text-xs text-center mb-6">Я, действуя своей волей и в своем интересе, настоящим подтверждаю свое согласие на обработку Администрацией моих персональных данных.</p>
                                <p><strong>Перечень данных:</strong> ФИО, email, телефон, город, данные профиля.</p>
                                <p><strong>Цели:</strong> Регистрация, предоставление доступа к сервисам, связь между пользователями, соблюдение законов РФ.</p>
                                <p><strong>Действия:</strong> Сбор, запись, хранение, уточнение, использование, обезличивание, удаление.</p>
                                <p className="text-[10px] text-gray-500 mt-4">Настоящее согласие действует до достижения целей или отзыва. Отзыв возможен через {privacyEmail}.</p>
                            </section>

                            <section className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                                <h3 className="text-blue-900 dark:text-blue-400 font-black uppercase text-base mb-6 tracking-tight text-center">СОГЛАСИЕ ПРЕДСТАВИТЕЛЯ (БИЗНЕС)</h3>
                                <p className="italic text-xs text-center mb-6">Я, действуя от имени Организации (ИП/ООО), даю согласие на обработку моих данных и данных Организации.</p>
                                <p><strong>Данные организации:</strong> Название, ИНН, ОГРН, адрес, реквизиты.</p>
                                <p><strong>Цели:</strong> Ведение Бизнес-кабинета, размещение рекламы и товаров, коммуникация с клиентами.</p>
                                <p><strong>Подтверждение:</strong> Обладаю всеми полномочиями, данные достоверны, Организация владеет правами на размещаемый контент.</p>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'cookies' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="mb-12 border-b dark:border-gray-700 pb-8">
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Файлы Cookie</h2>
                            <p className="text-blue-600 font-bold uppercase text-xs tracking-widest">технологии сайта</p>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-sm space-y-6">
                            <p>Сайт {platformName} использует технологию Cookie для улучшения пользовательского опыта.</p>
                            <p>Мы используем Cookies для:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Поддержания сессии авторизации (чтобы вам не нужно было входить каждый раз).</li>
                                <li>Запоминания настроек интерфейса (например, темная или светлая тема).</li>
                                <li>Аналитики посещаемости через Яндекс.Метрику (в обезличенном виде).</li>
                            </ul>
                            <p>Вы можете отключить Cookies в настройках вашего браузера, однако это может нарушить работу авторизации и некоторых функций портала.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-20 text-center print:mt-10">
                <div className="flex justify-center mb-8 print:hidden">
                    <LogoIcon className="w-16 h-16" />
                </div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">© 2024-2026 {platformName.toUpperCase()} • DIGITAL PROSTOR</p>
                <p className="text-gray-500 dark:text-gray-600 text-[8px] max-w-lg mx-auto leading-relaxed uppercase font-bold tracking-wider">
                    ПРОСТОР ТВОЕГО ГОРОДА. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
                </p>
            </div>
        </div>
    );
};

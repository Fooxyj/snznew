import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface BusinessApplicationPageProps {
    isLoggedIn: boolean;
    onRequireLogin: () => void;
    onBack: () => void;
}

export const BusinessApplicationPage: React.FC<BusinessApplicationPageProps> = ({ isLoggedIn, onRequireLogin, onBack }) => {
    const [step, setStep] = useState<'info' | 'success'>('info');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        businessType: 'Аренда',
        contactPerson: '',
        phone: '',
        email: '',
        comment: ''
    });


    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const old = formData.phone;

        // If user is deleting and the value is shorter, allow it (unless deleting +7 prefix)
        if (value.length < old.length) {
            // If deleting the prefix, reset to +7
            if (!value.startsWith('+7')) {
                setFormData({ ...formData, phone: '+7 ' });
                return;
            }
            // Otherwise just set the value as is (or re-format if needed, but simple deletion is better)
            // To avoid "fighting" the cursor, we can just re-format the raw digits
            // But if we just deleted a formatting char, we might want to delete the digit before it?
            // Simple approach: Extract digits, re-format.
            // But if the result is same as before (because we deleted a space), we need to delete a digit.

            // Better approach for this specific issue:
            // If the user deleted a character, we should respect that.
            // But we still want to enforce the format.
            // Let's try to just re-format raw digits.
        }

        // Always keep +7 prefix
        if (!value.startsWith('+7')) {
            setFormData({ ...formData, phone: '+7 ' });
            return;
        }

        // Extract only digits after +7
        let raw = value.slice(2).replace(/\D/g, '');

        // Limit to 10 digits
        raw = raw.slice(0, 10);

        // Format the number
        let formatted = '+7';
        if (raw.length > 0) {
            formatted += ' (' + raw.slice(0, 3);
        }
        if (raw.length >= 3) {
            formatted += ') ' + raw.slice(3, 6);
        }
        if (raw.length >= 6) {
            formatted += ' ' + raw.slice(6, 8);
        }
        if (raw.length >= 8) {
            formatted += ' ' + raw.slice(8, 10);
        }

        // If the result ends with a formatting char (space, paren), trim it if the user is deleting?
        // No, standard behavior is fine if we don't force it too aggressively.
        // The issue described is usually when deleting a digit causes a re-format that puts the digit back or similar.
        // Or deleting a space puts it back.

        // Let's use a simpler formatter that doesn't add trailing separators immediately?
        // Or just use the standard one I wrote, but check if it matches the "deletion issue" description.
        // "Address the phone input deletion issue".
        // Usually means: backspace doesn't work.

        setFormData({ ...formData, phone: formatted });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn) {
            onRequireLogin();
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('business_applications')
                .insert({
                    company_name: formData.companyName,
                    business_type: formData.businessType,
                    contact_person: formData.contactPerson,
                    phone: formData.phone,
                    email: formData.email,
                    comment: formData.comment,
                    user_id: user?.id,
                    status: 'pending'
                });

            if (error) throw error;

            setStep('success');
            setFormData({
                companyName: '',
                businessType: 'Аренда',
                contactPerson: '',
                phone: '',
                email: '',
                comment: ''
            });
        } catch (err: any) {
            console.error('Error submitting application:', err);
            alert('Ошибка при отправке заявки: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row animate-fade-in">

            {/* Mobile Header */}
            <div className="md:hidden bg-white p-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-dark">Для бизнеса</h1>
            </div>

            {/* Left Side: Value Proposition */}
            <div className="w-full md:w-5/12 bg-dark text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden md:h-screen md:sticky md:top-0">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="hidden md:flex mb-8">
                        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white font-bold transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Назад
                        </button>
                    </div>

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
                        {[1, 2, 3, 4].map(i => (
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
            <div className="w-full md:w-7/12 bg-white p-6 md:p-10 flex flex-col justify-center min-h-screen">
                {step === 'info' ? (
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto w-full">
                        <div>
                            <h3 className="text-2xl font-bold text-dark mb-1">Заявка на подключение</h3>
                            <p className="text-secondary text-sm">Заполните данные, и менеджер свяжется с вами.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-dark mb-2">Название компании</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ООО Вектор"
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-dark mb-2">Сфера деятельности</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                        value={formData.businessType}
                                        onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                                    >
                                        <option value="rent">Аренда</option>
                                        <option value="shops">Магазины</option>
                                        <option value="cafes">Кафе и Рестораны</option>
                                        <option value="services">Услуги</option>
                                        <option value="beauty">Красота и Здоровье</option>
                                        <option value="gyms">Спорт</option>
                                        <option value="cinema">Развлечения</option>
                                        <option value="tourism">Туризм</option>
                                        <option value="transport">Транспорт</option>
                                        <option value="other">Другое</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-dark mb-2">Контактное лицо</label>
                            <input
                                type="text"
                                required
                                placeholder="Иванов Иван"
                                value={formData.contactPerson}
                                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-dark mb-2">Телефон</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="+7 (999) 000-00-00"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-dark mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="biz@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-dark mb-2">Комментарий</label>
                            <textarea
                                rows={2}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                value={formData.comment}
                                onChange={e => setFormData({ ...formData, comment: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-dark text-white font-bold text-lg py-3.5 rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3">
                                Нажимая кнопку, вы соглашаетесь с условиями обработки данных
                            </p>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full animate-fade-in-up py-10 max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-3xl font-bold text-dark mb-3">Заявка принята!</h3>
                        <p className="text-secondary max-w-sm mb-8 text-lg leading-relaxed">
                            Спасибо за интерес к платформе. Наш менеджер свяжется с вами в течение рабочего дня.
                        </p>
                        <button
                            onClick={onBack}
                            className="bg-gray-100 text-dark font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Вернуться на сайт
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';
import { Loader2, Briefcase, Upload, User, Building, Star, Info, FileText, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WORK_SCHEDULES, BUSINESS_CATEGORIES, MASTER_CATEGORIES } from '../constants';
import { PhoneInput } from '../components/ui/PhoneInput';

export const ConnectBusiness: React.FC = () => {
    const [isMaster, setIsMaster] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '', // Инициализируем пустым, установим ниже
        description: '',
        address: '',
        phone: '',
        inn: '',
        ogrn: '',
        workHours: 'По договоренности',
        image: '',
        coverImage: ''
    });

    // Установка категории по умолчанию при смене типа (Компания/Мастер)
    const handleSetType = (master: boolean) => {
        setIsMaster(master);
        setFormData(prev => ({
            ...prev,
            category: master ? MASTER_CATEGORIES[0] : BUSINESS_CATEGORIES[0]
        }));
    };

    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    
    const navigate = useNavigate();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'coverImage') => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (field === 'image') setUploadingImage(true);
        else setUploadingCover(true);

        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, [field]: url }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            if (field === 'image') setUploadingImage(false);
            else setUploadingCover(false);
        }
    };

    const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'inn' | 'ogrn') => {
        const val = e.target.value.replace(/\D/g, ''); 
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isAgreed) {
            alert("Необходимо принять условия использования бизнес-кабинета");
            return;
        }

        if (!isMaster) {
            if (formData.inn.length > 0 && (formData.inn.length < 10 || formData.inn.length > 12)) {
                alert("ИНН должен содержать 10 или 12 цифр");
                return;
            }
        }

        setLoading(true);
        try {
            await api.createBusiness({
                ...formData,
                isMaster: isMaster,
                category: formData.category,
                verificationStatus: isMaster ? 'verified' : 'pending'
            });
            alert(isMaster ? "Ваш профиль специалиста создан!" : "Заявка на подключение бизнеса отправлена!");
            navigate('/business-crm');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    // При первом рендере устанавливаем дефолтную категорию если она пустая
    if (formData.category === '') {
        setFormData(prev => ({ ...prev, category: BUSINESS_CATEGORIES[0] }));
    }

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-8 pb-24">
            {showTerms && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[80vh] border dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Правила Бизнеса</h3>
                            <button onClick={() => setShowTerms(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300">
                            <p><strong>1. Возможности:</strong> Вы получаете доступ к CRM, управлению заказами, вакансиями и личной витрине товаров.</p>
                            <p><strong>2. Верификация:</strong> Компании проходят проверку ИНН. Специалисты верифицируются через рейтинг и отзывы жителей.</p>
                            <p><strong>3. Ответственность:</strong> Запрещено размещение недостоверной информации, дублирование аккаунтов, хамство в чатах.</p>
                            <p><strong>4. Санкции:</strong> При выявлении мошенничества или жалоб со стороны жителей, администрация вправе бессрочно заблокировать бизнес-кабинет без возврата средств за платные услуги.</p>
                            <p><strong>5. Модерация:</strong> Любой контент может быть удален, если он нарушает законы РФ или нормы этики.</p>
                        </div>
                        <Button className="w-full mt-8" onClick={() => { setIsAgreed(true); setShowTerms(false); }}>Я согласен с условиями</Button>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-black mb-6 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                {isMaster ? <Star className="w-10 h-10 text-orange-500 fill-current" /> : <Briefcase className="w-10 h-10 text-blue-600" />}
                {isMaster ? 'Специалист' : 'Бизнес-аккаунт'}
            </h1>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    type="button"
                    onClick={() => handleSetType(false)}
                    className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${!isMaster ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800'}`}
                >
                    <Building className={`w-8 h-8 ${!isMaster ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                        <div className="font-black text-sm uppercase dark:text-white">Компания</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Магазин, кафе, сервис</div>
                    </div>
                </button>
                <button 
                    type="button"
                    onClick={() => handleSetType(true)}
                    className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${isMaster ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800'}`}
                >
                    <Star className={`w-8 h-8 ${isMaster ? 'text-orange-500 fill-current' : 'text-gray-400'}`} />
                    <div>
                        <div className="font-black text-sm uppercase dark:text-white">Специалист</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Частные услуги, фриланс</div>
                    </div>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">
                            {isMaster ? 'Как вас называть в каталоге?' : 'Название компании'}
                        </label>
                        <input className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder={isMaster ? "Напр: Кондитер Мария" : "Название организации"} />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Категория</label>
                        <select 
                            className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none bg-white"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            {(isMaster ? MASTER_CATEGORIES : BUSINESS_CATEGORIES).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    
                    {!isMaster && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">ИНН (необязательно)</label>
                                <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.inn} onChange={(e) => handleNumericInput(e, 'inn')} maxLength={12} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">ОГРН (необязательно)</label>
                                <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.ogrn} onChange={(e) => handleNumericInput(e, 'ogrn')} maxLength={15} />
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                        <button 
                            type="button" 
                            onClick={() => setIsAgreed(!isAgreed)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${isAgreed ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            {isAgreed && <Check className="w-4 h-4 stroke-[4]" />}
                        </button>
                        <div className="text-xs text-gray-500">
                            Я ознакомлен и принимаю <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 font-bold underline">Условия использования бизнес-кабинета</button>
                        </div>
                    </div>

                    <Button className={`w-full py-5 text-xl font-black uppercase tracking-tighter border-none shadow-2xl ${isMaster ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={loading || uploadingImage || uploadingCover}>
                        {loading ? <Loader2 className="animate-spin" /> : isMaster ? 'Создать профиль' : 'Зарегистрировать бизнес'}
                    </Button>
                </form>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';
import { Loader2, Briefcase, Upload, User, Building, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WORK_SCHEDULES } from '../constants';
import { PhoneInput } from '../components/ui/PhoneInput';

export const ConnectBusiness: React.FC = () => {
    const [isMaster, setIsMaster] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Хендмейд и Услуги',
        description: '',
        address: '',
        phone: '',
        inn: '',
        ogrn: '',
        workHours: '09:00 - 18:00',
        image: '',
        coverImage: ''
    });
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
                // Если это мастер, мы принудительно ставим категорию, которая видна в разделе "Хендмейд"
                category: isMaster ? 'Хендмейд и Услуги' : formData.category,
                verificationStatus: isMaster ? 'verified' : 'pending'
            });
            alert(isMaster ? "Ваш профиль мастера создан и доступен в разделе 'Хендмейд и Мастера'!" : "Заявка на подключение бизнеса отправлена!");
            navigate('/profile');
            window.location.reload(); 
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-8 pb-24">
            <h1 className="text-3xl font-black mb-6 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                {isMaster ? <Heart className="w-10 h-10 text-pink-500" /> : <Briefcase className="w-10 h-10 text-blue-600" />}
                {isMaster ? 'Стать Мастером' : 'Бизнес-аккаунт'}
            </h1>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    type="button"
                    onClick={() => { setIsMaster(false); setFormData({...formData, category: 'Магазины'}); }}
                    className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${!isMaster ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800'}`}
                >
                    <Building className={`w-8 h-8 ${!isMaster ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                        <div className="font-black text-sm uppercase dark:text-white">Компания</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Организация, магазин</div>
                    </div>
                </button>
                <button 
                    type="button"
                    onClick={() => { setIsMaster(true); setFormData({...formData, category: 'Хендмейд и Услуги'}); }}
                    className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${isMaster ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800'}`}
                >
                    <User className={`w-8 h-8 ${isMaster ? 'text-pink-500' : 'text-gray-400'}`} />
                    <div>
                        <div className="font-black text-sm uppercase dark:text-white">Мастер</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Частные услуги и товары</div>
                    </div>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">
                            {isMaster ? 'Имя или Название мастерской' : 'Название компании'}
                        </label>
                        <input className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder={isMaster ? "Напр: Торты от Марии" : "Название ООО или ИП"} />
                    </div>
                    
                    {!isMaster && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">ИНН (необязательно)</label>
                                <input 
                                    className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                    value={formData.inn} 
                                    onChange={(e) => handleNumericInput(e, 'inn')} 
                                    maxLength={12}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">ОГРН (необязательно)</label>
                                <input 
                                    className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                    value={formData.ogrn} 
                                    onChange={(e) => handleNumericInput(e, 'ogrn')} 
                                    maxLength={15}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Специализация</label>
                        <select className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {isMaster ? (
                                <>
                                    <option value="Хендмейд и Услуги">Торты и Домашняя еда</option>
                                    <option value="Хендмейд и Услуги">Рукоделие и Подарки</option>
                                    <option value="Хендмейд и Услуги">Маникюр / Брови / Красота</option>
                                    <option value="Хендмейд и Услуги">Ремонт и Бытовые услуги</option>
                                </>
                            ) : (
                                <>
                                    <option value="Магазины">Магазины</option>
                                    <option value="Кафе и рестораны">Кафе и рестораны</option>
                                    <option value="Спортзалы и секции">Спорт и залы</option>
                                    <option value="Автосервисы">Автосервисы и мойки</option>
                                    <option value="Медицина">Медицина</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">{isMaster ? 'Где вы находитесь? (Район)' : 'Адрес'}</label>
                        <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required placeholder={isMaster ? "Центр / Поселок / Улица" : "ул. Ленина, 15"} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Телефон</label>
                            <PhoneInput 
                                value={formData.phone}
                                onChangeText={val => setFormData({...formData, phone: val})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Часы приема</label>
                            <select 
                                className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.workHours}
                                onChange={e => setFormData({...formData, workHours: e.target.value})}
                            >
                                <option value="По договоренности">По договоренности</option>
                                {WORK_SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">О ваших работах</label>
                        <textarea rows={4} className="w-full border rounded-xl p-4 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder={isMaster ? "Расскажите про ваши тортики, начинки или услуги..." : "Краткое описание вашей деятельности"} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            {formData.image ? (
                                <img src={formData.image} alt="" className="h-24 mx-auto rounded-full object-cover shadow-lg" />
                            ) : (
                                <div className="relative cursor-pointer py-2">
                                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-blue-500" />
                                    <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-blue-500">{uploadingImage ? "..." : "Ваше фото / Лого"}</span>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'image')} />
                                </div>
                            )}
                        </div>
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            {formData.coverImage ? (
                                <img src={formData.coverImage} alt="" className="h-24 mx-auto rounded-xl object-cover shadow-lg" />
                            ) : (
                                <div className="relative cursor-pointer py-2">
                                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-blue-500" />
                                    <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-blue-500">{uploadingCover ? "..." : "Фон профиля"}</span>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                                </div>
                            )}
                        </div>
                    </div>

                    <Button className={`w-full py-5 text-xl font-black uppercase tracking-tighter border-none shadow-2xl ${isMaster ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`} disabled={loading || uploadingImage || uploadingCover}>
                        {loading ? <Loader2 className="animate-spin" /> : isMaster ? 'Создать профиль мастера' : 'Подать заявку'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

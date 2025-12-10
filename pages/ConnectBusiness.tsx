
import React, { useState } from 'react';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';
import { Loader2, Briefcase, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WORK_SCHEDULES } from '../constants';
import { PhoneInput } from '../components/ui/PhoneInput';

export const ConnectBusiness: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Магазины',
        description: '',
        address: '',
        phone: '',
        workHours: '09:00 - 18:00',
        image: '',
        coverImage: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [isCustomSchedule, setIsCustomSchedule] = useState(false);
    
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createBusiness(formData);
            alert("Заявка на подключение бизнеса отправлена!");
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
            <h1 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-blue-600" /> Подключить бизнес
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название компании</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                        <select className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option>Магазины</option>
                            <option>Кафе и рестораны</option>
                            <option>Услуги</option>
                            <option>Красота</option>
                            <option>Спорт</option>
                            <option>Грузоперевозки</option>
                            <option>Аренда</option>
                            <option>Туризм</option>
                            <option>Медицина</option>
                            <option>Авто</option>
                            <option>Кино</option>
                            <option>Развлечения</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Адрес</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required placeholder="ул. Ленина, 15" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
                            <PhoneInput 
                                value={formData.phone}
                                onChangeText={val => setFormData({...formData, phone: val})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Часы работы</label>
                            <select 
                                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={isCustomSchedule ? 'custom' : formData.workHours}
                                onChange={e => {
                                    if(e.target.value === 'custom') {
                                        setIsCustomSchedule(true);
                                        setFormData({...formData, workHours: ''});
                                    } else {
                                        setIsCustomSchedule(false);
                                        setFormData({...formData, workHours: e.target.value});
                                    }
                                }}
                            >
                                {WORK_SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                                <option value="custom">Другое...</option>
                            </select>
                        </div>
                    </div>
                    {isCustomSchedule && (
                        <div>
                            <input 
                                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                value={formData.workHours} 
                                onChange={e => setFormData({...formData, workHours: e.target.value})} 
                                placeholder="Введите свой график"
                                required 
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
                        <textarea rows={4} className="w-full border rounded-lg p-2 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                            {formData.image ? (
                                <img src={formData.image} alt="" className="h-24 mx-auto rounded object-cover" />
                            ) : (
                                <div className="relative cursor-pointer">
                                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{uploadingImage ? "Загрузка..." : "Логотип"}</span>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'image')} />
                                </div>
                            )}
                        </div>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                            {formData.coverImage ? (
                                <img src={formData.coverImage} alt="" className="h-24 mx-auto rounded object-cover" />
                            ) : (
                                <div className="relative cursor-pointer">
                                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{uploadingCover ? "Загрузка..." : "Обложка"}</span>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                                </div>
                            )}
                        </div>
                    </div>

                    <Button className="w-full" disabled={loading || uploadingImage || uploadingCover}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Подключить'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

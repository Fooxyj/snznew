
import React, { useState } from 'react';
import { X, Loader2, Upload, Trash2, RefreshCw, ImagePlus, Check } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';

export const CreateProductModal: React.FC<{ businessId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ businessId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '', category: 'Товары' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createProduct({ ...formData, businessId, price: Number(formData.price) });
            onSuccess();
            onClose();
            setFormData({ name: '', description: '', price: '', image: '', category: 'Товары' });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[85vh] slide-in-from-top">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg dark:text-white">Добавить товар</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Название" required />
                    <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Цена (₽)" required />
                    <select className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option>Еда</option><option>Напитки</option><option>Товары</option><option>Услуги</option><option>Прочее</option>
                    </select>
                    <textarea className="w-full border rounded-lg p-2 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Описание" />
                    
                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Фотография товара</label>
                        
                        {formData.image ? (
                            <div className="flex gap-4 p-3 border border-green-200 dark:border-green-900 rounded-xl bg-green-50 dark:bg-green-900/10 items-start">
                                <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg bg-white border border-gray-200" />
                                <div className="flex-1 flex flex-col justify-between h-20 py-1">
                                    <p className="text-sm text-green-700 dark:text-green-400 font-bold flex items-center gap-1">
                                        <Check className="w-4 h-4" /> Фото добавлено
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))} 
                                            className="text-xs text-red-500 hover:text-red-700 font-medium bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700"
                                        >
                                            Удалить
                                        </button>
                                        <div className="relative">
                                            <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                                                Заменить
                                            </button>
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer">
                                {uploading ? (
                                    <div className="flex flex-col items-center text-blue-500">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <span className="text-sm">Загрузка...</span>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} accept="image/*" />
                                        <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                            <ImagePlus className="w-10 h-10 mb-2 opacity-50 group-hover:opacity-100" />
                                            <span className="text-sm font-medium">Нажмите, чтобы загрузить фото</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <Button className="w-full" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Добавить'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const CreateServiceModal: React.FC<{ businessId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ businessId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', price: '', durationMin: '60' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createService({ ...formData, businessId, price: Number(formData.price), durationMin: Number(formData.durationMin) });
            onSuccess();
            onClose();
            setFormData({ title: '', price: '', durationMin: '60' });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl slide-in-from-top">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg dark:text-white">Добавить услугу</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Название услуги" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Цена (₽)" required />
                        <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.durationMin} onChange={e => setFormData({...formData, durationMin: e.target.value})} placeholder="Мин" required />
                    </div>
                    <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Создать'}</Button>
                </form>
            </div>
        </div>
    );
};

export const CreateRentalModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', description: '', pricePerDay: '', deposit: '', category: 'Инструмент', image: '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createRental({ ...formData, pricePerDay: Number(formData.pricePerDay), deposit: Number(formData.deposit) });
            onSuccess();
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[85vh] slide-in-from-top">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Сдать вещь</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Название" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: e.target.value})} placeholder="Цена/сутки" required />
                        <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} placeholder="Залог" required />
                    </div>
                    <select className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option>Инструмент</option><option>Электроника</option><option>Спорт</option><option>Одежда</option><option>Другое</option>
                    </select>
                    <textarea className="w-full border rounded-lg p-2 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Описание" required />
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        {formData.image ? <img src={formData.image} alt="" className="h-20 mx-auto rounded object-cover" /> : <div className="text-gray-400 text-sm">Фото</div>}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                    </div>
                    <Button className="w-full" disabled={loading || uploading}>{loading ? <Loader2 className="animate-spin" /> : 'Создать'}</Button>
                </form>
            </div>
        </div>
    );
};
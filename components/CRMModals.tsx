
import React, { useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
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
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        {formData.image ? <img src={formData.image} alt="" className="h-20 mx-auto rounded object-cover" /> : <div className="text-gray-400 text-sm">Загрузить фото</div>}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                    </div>
                    <Button className="w-full" disabled={loading || uploading}>{loading ? <Loader2 className="animate-spin" /> : 'Добавить'}</Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
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

import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, Trash2, RefreshCw, ImagePlus, Check, Briefcase, Plus, Sparkles, Zap, Flame, Newspaper } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';
import { Product } from '../types';
import { SuccessModal } from './SuccessModal';

export const CreateBusinessPostModal: React.FC<{ businessId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ businessId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', content: '', image: '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen && !showSuccess) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createBusinessPost({ ...formData, businessId });
            onSuccess();
            setShowSuccess(true);
            setFormData({ title: '', content: '', image: '' });
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    if (showSuccess) {
        return (
            <SuccessModal 
                isOpen={showSuccess} 
                onClose={() => { setShowSuccess(false); onClose(); }} 
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-blue-500" /> Опубликовать новость
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="post-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Заголовок</label>
                        <input className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Напр: У нас обновление меню!" required />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Текст новости / Акции</label>
                        <textarea className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium" rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Расскажите подробности..." required />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Изображение</label>
                        {formData.image ? (
                            <div className="relative group rounded-2xl overflow-hidden border dark:border-gray-600 shadow-md">
                                <img src={formData.image} alt="Preview" className="w-full h-48 object-cover" />
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer">
                                {uploading ? (
                                    <div className="flex flex-col items-center text-blue-500">
                                        <Loader2 className="w-10 h-10 animate-spin mb-2" />
                                        <span className="text-sm font-bold uppercase tracking-widest">Загрузка...</span>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} accept="image/*" />
                                        <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500">
                                            <ImagePlus className="w-12 h-12 mb-3 opacity-50 group-hover:opacity-100" />
                                            <span className="text-sm font-bold uppercase tracking-widest">Добавить обложку новости</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </form>

                <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <Button form="post-form" className="w-full py-4 text-lg font-black uppercase tracking-tighter" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Опубликовать сейчас'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

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
            setLoading(false);
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
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight">Добавить товар</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Название товара</label>
                        <input className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Напр: Капучино 0.3" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Цена (₽)</label>
                            <input type="number" className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Категория</label>
                            <select className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option>Еда</option><option>Напитки</option><option>Товары</option><option>Услуги</option><option>Прочее</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Описание</label>
                        <textarea className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Краткое описание товара..." />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Фотография</label>
                        {formData.image ? (
                            <div className="flex gap-4 p-4 border border-green-200 dark:border-green-900 rounded-2xl bg-green-50/50 dark:bg-green-900/10 items-center">
                                <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl bg-white border border-gray-200 shadow-sm" />
                                <div className="flex-1">
                                    <p className="text-sm text-green-700 dark:text-green-400 font-bold flex items-center gap-1 mb-2">
                                        <Check className="w-4 h-4" /> Фото загружено
                                    </p>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="text-xs text-red-500 hover:text-red-700 font-bold bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">Удалить</button>
                                        <div className="relative">
                                            <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-bold bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">Заменить</button>
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer">
                                {uploading ? (
                                    <div className="flex flex-col items-center text-blue-500">
                                        <Loader2 className="w-10 h-10 animate-spin mb-2" />
                                        <span className="text-sm font-bold uppercase tracking-widest">Загрузка...</span>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} accept="image/*" />
                                        <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                            <ImagePlus className="w-12 h-12 mb-3 opacity-50 group-hover:opacity-100" />
                                            <span className="text-sm font-bold uppercase tracking-widest">Загрузить фото товара</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </form>

                <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <Button form="product-form" className="w-full py-4 text-lg font-black uppercase tracking-tighter" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Добавить в каталог'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const EditProductModal: React.FC<{ product: Product; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ product, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '', category: '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                image: product.image,
                category: product.category || 'Товары'
            });
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateProduct(product.id, { ...formData, price: Number(formData.price) });
            onSuccess();
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight">Редактировать товар</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="edit-product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Название</label>
                        <input className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Цена (₽)</label>
                            <input type="number" className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Категория</label>
                            <select className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option>Еда</option><option>Напитки</option><option>Товары</option><option>Услуги</option><option>Прочее</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Описание</label>
                        <textarea className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Фотография</label>
                        <div className="flex gap-4 p-4 border border-blue-200 dark:border-blue-900 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 items-center">
                            <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl bg-white border border-gray-200 shadow-sm" />
                            <div className="flex-1">
                                <p className="text-xs text-blue-700 dark:text-blue-300 font-bold mb-3 uppercase tracking-tighter">Обновите фото, если требуется</p>
                                <div className="relative">
                                    <button type="button" className="w-full text-xs text-blue-600 hover:text-blue-700 font-black uppercase tracking-widest bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm transition-all">
                                        {uploading ? 'Загрузка...' : 'Заменить фото'}
                                    </button>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <Button form="edit-product-form" className="w-full py-4 text-lg font-black uppercase tracking-tighter" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Сохранить изменения'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const CreateServiceModal: React.FC<{ businessId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ businessId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', price: '', durationMin: '60', description: '', image: '', category: 'Услуги' });
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
            await api.createService({ 
                ...formData, 
                businessId, 
                price: Number(formData.price), 
                durationMin: Number(formData.durationMin) 
            });
            onSuccess();
            onClose();
            setFormData({ title: '', price: '', durationMin: '60', description: '', image: '', category: 'Услуги' });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-500" /> Добавить услугу
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="service-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Название услуги</label>
                        <input className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Напр: Мужская стрижка" required />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Цена (₽)</label>
                            <input type="number" className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="1000" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Длительность (мин)</label>
                            <input type="number" className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.durationMin} onChange={e => setFormData({...formData, durationMin: e.target.value})} placeholder="60" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Описание услуги</label>
                        <textarea className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Что входит в стоимость..." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Фотография услуги</label>
                        {formData.image ? (
                            <div className="relative group rounded-2xl overflow-hidden border dark:border-gray-600 shadow-md">
                                <img src={formData.image} alt="Preview" className="w-full h-40 object-cover" />
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer">
                                {uploading ? (
                                    <div className="flex flex-col items-center text-blue-500">
                                        <Loader2 className="w-10 h-10 animate-spin mb-2" />
                                        <span className="text-sm font-bold uppercase tracking-widest">Загрузка...</span>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} accept="image/*" />
                                        <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                            <ImagePlus className="w-12 h-12 mb-3 opacity-50 group-hover:opacity-100" />
                                            <span className="text-sm font-bold uppercase tracking-widest">Добавить фото услуги</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </form>

                <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <Button form="service-form" className="w-full py-4 text-lg font-black uppercase tracking-tighter" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Опубликовать услугу'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const CreateRentalModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', description: '', pricePerDay: '', deposit: '', category: 'Инструмент', image: '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen && !showSuccess) return null;

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
            setShowSuccess(true);
            setFormData({ title: '', description: '', pricePerDay: '', deposit: '', category: 'Инструмент', image: '' });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <SuccessModal 
                isOpen={showSuccess} 
                onClose={() => { setShowSuccess(false); onClose(); }} 
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h2 className="font-bold text-lg dark:text-white uppercase tracking-tight">Сдать вещь в аренду</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="rental-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Название</label>
                        <input className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Напр: Перфоратор Bosch" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Цена в сутки (₽)</label>
                            <input type="number" className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: e.target.value})} placeholder="500" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Залог (₽)</label>
                            <input type="number" className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} placeholder="3000" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Категория</label>
                        <select className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option>Инструмент</option><option>Электроника</option><option>Спорт</option><option>Одежда</option><option>Другое</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Описание состояния</label>
                        <textarea className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Опишите комплект и состояние..." required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Фотография</label>
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer overflow-hidden">
                            {formData.image ? (
                                <div className="absolute inset-0 group">
                                    <img src={formData.image} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white text-xs font-bold uppercase tracking-widest">Нажмите, чтобы заменить</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {uploading ? <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-2" /> : <Upload className="w-12 h-12 text-gray-300 mb-3 opacity-50 group-hover:opacity-100" />}
                                    <span className="text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-blue-500">{uploading ? "Загрузка..." : "Загрузить фото"}</span>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleImageUpload} />
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <Button form="rental-form" className="w-full py-4 text-lg font-black uppercase tracking-tighter" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Разместить предложение'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const CreateBusinessVacancyModal: React.FC<{ business: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ business, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ 
        title: '', 
        companyName: business?.name || '', 
        description: '', 
        contactPhone: business?.phone || '', 
        salaryMin: '', 
        salaryMax: '', 
        schedule: 'full',
        category: 'Магазины',
        tier: 'regular' as 'regular' | 'vip' | 'urgent',
        image: '',
        images: [] as string[]
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (business) {
            setFormData(prev => ({ ...prev, companyName: business.name, contactPhone: business.phone }));
        }
    }, [business]);

    if (!isOpen && !showSuccess) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (formData.images.length >= 5) return;
        
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ 
                ...prev, 
                image: prev.images.length === 0 ? url : prev.image,
                images: [...prev.images, url] 
            }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (idx: number) => {
        const newImages = formData.images.filter((_, i) => i !== idx);
        setFormData(prev => ({
            ...prev,
            images: newImages,
            image: newImages.length > 0 ? newImages[0] : ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createBusinessVacancy(business.id, {
                ...formData,
                salaryMin: Number(formData.salaryMin),
                salaryMax: Number(formData.salaryMax),
            });
            onSuccess();
            setShowSuccess(true);
            setFormData({ 
                title: '', companyName: business?.name || '', description: '', 
                contactPhone: business?.phone || '', salaryMin: '', salaryMax: '', 
                schedule: 'full', category: 'Магазины', tier: 'regular', image: '', images: [] 
            });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <SuccessModal 
                isOpen={showSuccess} 
                onClose={() => { setShowSuccess(false); onClose(); }} 
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-500" /> Новая вакансия
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="biz-vacancy-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Должность</label>
                        <input className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Напр: Продавец-консультант" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">З/П от (₽)</label>
                            <input type="number" className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} placeholder="35000" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">График</label>
                            <select className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value as any})}>
                                <option value="full">Полный день</option>
                                <option value="shift">Сменный</option>
                                <option value="remote">Удаленно</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Требования и условия</label>
                        <textarea className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Опишите кого вы ищете и что предлагаете..." required />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Фотографии ({formData.images.length}/5)</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border dark:border-gray-700 bg-gray-100 group">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                            {formData.images.length < 5 && (
                                <div className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer">
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Тип размещения</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button type="button" onClick={() => setFormData({...formData, tier: 'regular'})} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${formData.tier === 'regular' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-100 dark:border-gray-800'}`}>
                                <Zap className={`w-4 h-4 ${formData.tier === 'regular' ? 'text-blue-600' : 'text-gray-400'}`} />
                                <span className="text-[9px] font-black uppercase">Обычное</span>
                            </button>
                            <button type="button" onClick={() => setFormData({...formData, tier: 'vip'})} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${formData.tier === 'vip' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-gray-100 dark:border-gray-800'}`}>
                                <Sparkles className={`w-4 h-4 ${formData.tier === 'vip' ? 'text-orange-500' : 'text-gray-400'}`} />
                                <span className="text-[9px] font-black uppercase">VIP</span>
                            </button>
                            <button type="button" onClick={() => setFormData({...formData, tier: 'urgent'})} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${formData.tier === 'urgent' ? 'border-red-600 bg-red-50 dark:bg-red-900/30' : 'border-gray-100 dark:border-gray-800'}`}>
                                <Flame className={`w-4 h-4 ${formData.tier === 'urgent' ? 'text-red-600' : 'text-gray-400'}`} />
                                <span className="text-[9px] font-black uppercase">Срочно</span>
                            </button>
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <Button form="biz-vacancy-form" className="w-full py-4 text-lg font-black uppercase tracking-tighter" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Разместить вакансию'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
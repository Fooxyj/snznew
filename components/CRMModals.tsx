
import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, Trash2, RefreshCw, ImagePlus, Check, Briefcase, Plus, Sparkles, Zap, Flame, Newspaper, Gift, Coins, ImagePlus as ImagePlusIcon, Camera, ShoppingBag } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';
import { Product } from '../types';
import { SuccessModal } from './SuccessModal';

const PRODUCT_CATEGORIES = [
    'Еда и напитки',
    'Одежда и обувь',
    'Красота и здоровье',
    'Дом и сад',
    'Детские товары',
    'Электроника',
    'Книги и хобби',
    'Спорт и отдых',
    'Автотовары',
    'Услуги',
    'Другое'
];

export const CreateCouponModal: React.FC<{ businessId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ businessId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', description: '', price: '', image: '' });
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
            await api.createBusinessCoupon(businessId, { ...formData, price: Number(formData.price) });
            onSuccess();
            setShowSuccess(true);
            setFormData({ title: '', description: '', price: '', image: '' });
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    if (showSuccess) {
        return (
            <SuccessModal 
                isOpen={showSuccess} 
                onClose={() => { setShowSuccess(false); onClose(); }} 
                title="Купон создан!"
                message="Теперь жители Снежинска увидят ваше предложение в Магазине Бонусов и смогут обменять свои баллы на скидку у вас."
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-lg dark:white uppercase tracking-tight flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-500" /> Создать бонусный купон
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="coupon-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Название предложения</label>
                        <input className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Напр: Скидка 500₽ на любой заказ" required />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Стоимость в XP</label>
                        <div className="relative">
                            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                            <input type="number" className="w-full border rounded-xl pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Напр: 200" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Условия акции</label>
                        <textarea className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none font-medium" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Напр: Действует при заказе от 2000₽..." required />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Изображение для витрины</label>
                        {formData.image ? (
                            <div className="relative group rounded-2xl overflow-hidden border dark:border-gray-600 shadow-md">
                                <img src={formData.image} alt="Preview" className="w-full h-40 object-cover" />
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer">
                                {uploading ? (
                                    <div className="flex flex-col items-center text-purple-500">
                                        <Loader2 className="w-10 h-10 animate-spin mb-2" />
                                        <span className="text-sm font-bold uppercase tracking-widest">Загрузка...</span>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} accept="image/*" />
                                        <div className="flex flex-col items-center text-gray-400 group-hover:text-purple-500">
                                            <ImagePlus className="w-12 h-12 mb-3 opacity-50 group-hover:opacity-100" />
                                            <span className="text-sm font-bold uppercase tracking-widest">Загрузить фото купона</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </form>

                <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <Button form="coupon-form" className="w-full py-4 text-lg font-black uppercase tracking-tighter bg-purple-600 hover:bg-purple-700 border-none shadow-xl shadow-purple-500/20" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Выпустить купон'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

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

export const EditBusinessPostModal: React.FC<{ post: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ post, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: post?.title || '', content: post?.content || '', image: post?.image || '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen && post) {
            setFormData({
                title: post.title,
                content: post.content,
                image: post.image
            });
        }
    }, [isOpen, post]);

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
            await api.updateBusinessPost(post.id, formData);
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-blue-500" /> Редактировать новость
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="edit-post-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Заголовок</label>
                        <input className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Текст новости / Акции</label>
                        <textarea className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium" rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Изображение</label>
                        <div className="relative group rounded-2xl overflow-hidden border dark:border-gray-600 shadow-md">
                            <img src={formData.image} alt="Preview" className="w-full h-48 object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <Button form="edit-post-form" className="w-full py-4 text-lg font-black uppercase tracking-tighter" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Сохранить изменения'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const CreateProductModal: React.FC<{ businessId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ businessId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '', category: PRODUCT_CATEGORIES[0] });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            await api.createProduct({ ...formData, businessId, price: Number(formData.price) });
            onSuccess();
            onClose();
            setFormData({ name: '', description: '', price: '', image: '', category: PRODUCT_CATEGORIES[0] });
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-blue-500" /> Новый товар
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Название товара</label>
                        <input className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Напр: Пицца Маргарита" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Категория</label>
                        <select className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                            {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Описание</label>
                        <textarea className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Расскажите о товаре..." />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Цена (₽)</label>
                        <input type="number" className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required placeholder="0" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Фото товара</label>
                        {formData.image ? (
                            <div className="relative group rounded-2xl overflow-hidden border dark:border-gray-600 shadow-md">
                                <img src={formData.image} alt="Preview" className="w-full h-40 object-cover" />
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
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleUpload} accept="image/*" />
                                        <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500">
                                            <Camera className="w-10 h-10 mb-3 opacity-50 group-hover:opacity-100" />
                                            <span className="text-sm font-bold uppercase tracking-widest">Добавить фото</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </form>

                <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <Button form="product-form" className="w-full py-4 text-lg font-black uppercase tracking-tighter" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Создать товар'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const EditProductModal: React.FC<{ product: Product; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ product, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: product.name, description: product.description, price: product.price.toString(), image: product.image, category: product.category || PRODUCT_CATEGORIES[0] });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                image: product.image,
                category: product.category || PRODUCT_CATEGORIES[0]
            });
        }
    }, [isOpen, product]);

    if (!isOpen) return null;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight">Редактировать товар</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <form id="edit-product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Название товара</label>
                        <input className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Категория</label>
                        <select className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                            {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Описание</label>
                        <textarea className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Цена (₽)</label>
                        <input type="number" className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Фото товара</label>
                        <div className="relative group rounded-2xl overflow-hidden border dark:border-gray-600 shadow-md">
                            <img src={formData.image} alt="Preview" className="w-full h-40 object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} accept="image/*" />
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

export const EditServiceModal: React.FC<{ service: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ service, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: service?.title || '', price: service?.price?.toString() || '', durationMin: service?.durationMin?.toString() || '30', description: service?.description || '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && service) {
            setFormData({
                title: service.title,
                price: service.price.toString(),
                durationMin: service.durationMin.toString(),
                description: service.description || ''
            });
        }
    }, [isOpen, service]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateService(service.id, { ...formData, price: Number(formData.price), durationMin: Number(formData.durationMin) });
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white uppercase">Редактировать услугу</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Название услуги" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Цена (₽)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Длительность (мин)" value={formData.durationMin} onChange={e => setFormData({...formData, durationMin: e.target.value})} required />
                    </div>
                    <textarea className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Описание (необязательно)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                    <Button className="w-full py-3" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Сохранить'}</Button>
                </form>
            </div>
        </div>
    );
};

export const EditBusinessVacancyModal: React.FC<{ vacancy: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ vacancy, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: vacancy?.title || '', description: vacancy?.description || '', salaryMin: vacancy?.salaryMin?.toString() || '', schedule: vacancy?.schedule || 'full', contactPhone: vacancy?.contactPhone || '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && vacancy) {
            setFormData({
                title: vacancy.title,
                description: vacancy.description,
                salaryMin: vacancy.salaryMin?.toString() || '',
                schedule: vacancy.schedule || 'full',
                contactPhone: vacancy.contactPhone || ''
            });
        }
    }, [isOpen, vacancy]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateVacancy(vacancy.id, { ...formData, salaryMin: Number(formData.salaryMin) });
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white uppercase">Редактировать вакансию</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Должность" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Зарплата от (₽)" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} />
                    <select className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})}>
                        <option value="full">Полный день</option>
                        <option value="shift">Сменный график</option>
                        <option value="remote">Удаленно</option>
                    </select>
                    <textarea className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Описание и требования" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} required />
                    <Button className="w-full py-3" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Сохранить'}</Button>
                </form>
            </div>
        </div>
    );
};

export const EditCouponModal: React.FC<{ coupon: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ coupon, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: coupon?.title || '', discount: coupon?.discount || '', code: coupon?.code || '', description: coupon?.description || '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && coupon) {
            setFormData({
                title: coupon.title,
                discount: coupon.discount,
                code: coupon.code,
                description: coupon.description || ''
            });
        }
    }, [isOpen, coupon]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateCoupon(coupon.id, formData);
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white uppercase">Редактировать купон</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Название акции" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                        <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Скидка (напр. 10%)" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} required />
                        <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Промокод" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
                    </div>
                    <textarea className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Условия акции" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                    <Button className="w-full py-3" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Сохранить'}</Button>
                </form>
            </div>
        </div>
    );
};

export const CreateServiceModal: React.FC<{ businessId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ businessId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', price: '', durationMin: '30', description: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createService({ ...formData, businessId, price: Number(formData.price), durationMin: Number(formData.durationMin) });
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white uppercase">Новая услуга</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Название услуги" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Цена (₽)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Длительность (мин)" value={formData.durationMin} onChange={e => setFormData({...formData, durationMin: e.target.value})} required />
                    </div>
                    <textarea className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Описание (необязательно)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                    <Button className="w-full py-3" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Создать'}</Button>
                </form>
            </div>
        </div>
    );
};

export const CreateBusinessVacancyModal: React.FC<{ business: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ business, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', description: '', salaryMin: '', schedule: 'full', contactPhone: business.phone || '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createBusinessVacancy(business.id, { ...formData, companyName: business.name, salaryMin: Number(formData.salaryMin) });
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white uppercase">Новая вакансия</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Должность" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Зарплата от (₽)" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} />
                    <select className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})}>
                        <option value="full">Полный день</option>
                        <option value="shift">Сменный график</option>
                        <option value="remote">Удаленно</option>
                    </select>
                    <textarea className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Описание и требования" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} required />
                    <Button className="w-full py-3" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Разместить'}</Button>
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

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            await api.createRental({ ...formData, price_per_day: Number(formData.pricePerDay), deposit: Number(formData.deposit) });
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white uppercase">Сдать вещь в прокат</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Что сдаете?" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Категория" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Цена в сутки (₽)" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: e.target.value})} required />
                        <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Залог (₽)" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} required />
                    </div>
                    <textarea className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:text-white" placeholder="Описание состояния и условий" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} required />
                    <div className="border-2 border-dashed rounded-xl p-4 text-center relative cursor-pointer">
                        {formData.image ? <img src={formData.image} className="h-24 mx-auto" /> : <div className="text-gray-400">Фото вещи</div>}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                    </div>
                    <Button className="w-full py-3" disabled={loading || uploading}>{loading ? <Loader2 className="animate-spin" /> : 'Опубликовать'}</Button>
                </form>
            </div>
        </div>
    );
};

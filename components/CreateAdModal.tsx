
import React, { useState } from 'react';
import { X, Loader2, Upload, Trash2, Plus, Sparkles, CheckCircle2, Wand2 } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';
import { Ad } from '../types';
import { useQuery } from '@tanstack/react-query';
import { AD_CATEGORIES } from '../constants';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ad: Ad) => void;
}

export const CreateAdModal: React.FC<CreateAdModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [tier, setTier] = useState<'regular' | 'premium' | 'vip'>('regular');

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Личные вещи',
    description: '',
    location: '',
  });
  const [images, setImages] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 5) return;
    setIsUploading(true);
    try {
        const url = await api.uploadImage(file);
        setImages(prev => [...prev, url]);
    } catch (error: any) {
        alert('Ошибка: ' + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newAd = await api.createAd({
        ...formData,
        price: Number(formData.price),
        currency: '₽',
        image: images[0] || 'https://picsum.photos/seed/ad/400/300',
        images,
        isVip: tier === 'vip',
        isPremium: tier === 'premium'
      });
      onSuccess(newAd);
      onClose();
      setFormData({ title: '', price: '', category: 'Личные вещи', description: '', location: '' });
      setImages([]);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center pt-10 md:pt-20 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-[85vh]">
        <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Подать объявление</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="create-ad-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заголовок</label>
                <input required type="text" placeholder="Например: Велосипед скоростной" className="w-full px-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Цена (₽)</label>
                    <input required type="number" className="w-full px-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                    <select className="w-full px-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {AD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
                <textarea required rows={4} placeholder="Опишите ваш товар..." className="w-full px-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Местоположение</label>
                <input required type="text" placeholder="Снежинск" className="w-full px-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Фото (до 5 шт)</label>
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-600">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    ))}
                    {images.length < 5 && (
                        <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Продвижение</label>
                <div className="grid grid-cols-3 gap-3">
                    <div onClick={() => setTier('regular')} className={`p-3 border-2 rounded-xl text-center cursor-pointer ${tier === 'regular' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                        <div className="font-bold text-xs">Обычное</div>
                        <div className="text-[10px] text-gray-500">0 ₽</div>
                    </div>
                    <div onClick={() => setTier('premium')} className={`p-3 border-2 rounded-xl text-center cursor-pointer ${tier === 'premium' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                        <Sparkles className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                        <div className="font-bold text-xs">PRO</div>
                        <div className="text-[10px] text-indigo-500">50 ₽</div>
                    </div>
                    <div onClick={() => setTier('vip')} className={`p-3 border-2 rounded-xl text-center cursor-pointer ${tier === 'vip' ? 'border-orange-500 bg-orange-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                        <Wand2 className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                        <div className="font-bold text-xs">VIP</div>
                        <div className="text-[10px] text-orange-500">100 ₽</div>
                    </div>
                </div>
            </div>
            </form>
        </div>

        <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
            <Button form="create-ad-form" disabled={isLoading || isUploading} className="w-full py-3">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `Опубликовать`}
            </Button>
        </div>
      </div>
    </div>
  );
};

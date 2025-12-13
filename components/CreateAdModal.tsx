
import React, { useState } from 'react';
import { X, Loader2, Upload, Trash2, Plus, Image as ImageIcon, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: api.getCurrentUser
  });

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (images.length >= 5) {
        alert("Максимум 5 фотографий");
        return;
    }

    setIsUploading(true);
    try {
        const url = await api.uploadImage(file);
        setImages(prev => [...prev, url]);
    } catch (error: any) {
        console.error(error);
        alert('Ошибка загрузки фото: ' + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cost = tier === 'vip' ? 100 : tier === 'premium' ? 50 : 0;
    
    if (cost > 0) {
        if (!user) {
            alert("Необходимо войти для платного размещения");
            return;
        }
        if ((user.balance || 0) < cost) {
            alert(`Недостаточно средств. Ваш баланс: ${user.balance} ₽. Требуется: ${cost} ₽`);
            return;
        }
    }

    setIsLoading(true);

    try {
      const newAd = await api.createAd({
        title: formData.title,
        price: Number(formData.price),
        currency: '₽',
        category: formData.category,
        description: formData.description,
        location: formData.location || 'Снежинск',
        image: images[0] || 'https://picsum.photos/seed/new/400/300',
        images: images,
        isVip: tier === 'vip',
        isPremium: tier === 'premium'
      });
      
      onSuccess(newAd);
      onClose();
      // Reset form
      setFormData({
        title: '',
        price: '',
        category: 'Личные вещи',
        description: '',
        location: '',
      });
      setImages([]);
      setTier('regular');
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ошибка при создании объявления");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden slide-in-from-top h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Подать объявление</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="create-ad-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заголовок</label>
                <input 
                required
                type="text" 
                placeholder="Например, Велосипед"
                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Цена (₽)</label>
                    <input 
                        required
                        type="number" 
                        placeholder="0"
                        className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white transition-all"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                    <select 
                        className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white transition-all"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                        {AD_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
                <textarea 
                    required
                    rows={4}
                    placeholder="Подробное описание товара или услуги..."
                    className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Местоположение</label>
                <input 
                    type="text" 
                    placeholder="Район, улица"
                    className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white transition-all"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Фотографии</label>
                
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-600 group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    
                    {images.length < 5 && (
                        <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                            {isUploading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-6 h-6 mb-1" />
                                    <span className="text-xs">Добавить</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Ad Tier Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Тип размещения</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Regular */}
                    <div 
                        onClick={() => setTier('regular')}
                        className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center ${tier === 'regular' ? 'border-gray-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                        <div className="font-bold text-gray-900 dark:text-white mb-1">Обычное</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Бесплатно</div>
                        {tier === 'regular' && <div className="absolute top-2 right-2 text-gray-600 dark:text-gray-300"><CheckCircle2 className="w-4 h-4" /></div>}
                    </div>

                    {/* Premium */}
                    <div 
                        onClick={() => setTier('premium')}
                        className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center ${tier === 'premium' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                    >
                        <Sparkles className={`w-5 h-5 mb-1 ${tier === 'premium' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="font-bold text-gray-900 dark:text-white">PRO</div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">50 ₽</div>
                        {tier === 'premium' && <div className="absolute top-2 right-2 text-blue-600"><CheckCircle2 className="w-4 h-4" /></div>}
                    </div>

                    {/* VIP */}
                    <div 
                        onClick={() => setTier('vip')}
                        className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center ${tier === 'vip' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}
                    >
                        <Crown className={`w-5 h-5 mb-1 ${tier === 'vip' ? 'text-orange-500' : 'text-gray-400'}`} />
                        <div className="font-bold text-gray-900 dark:text-white">VIP</div>
                        <div className="text-sm font-bold text-orange-600 dark:text-orange-400">100 ₽</div>
                        {tier === 'vip' && <div className="absolute top-2 right-2 text-orange-600"><CheckCircle2 className="w-4 h-4" /></div>}
                    </div>
                </div>
                {tier !== 'regular' && user && (
                    <div className="mt-2 text-xs text-center text-gray-500">
                        Ваш баланс: <span className={(user.balance || 0) < (tier === 'vip' ? 100 : 50) ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>{user.balance || 0} ₽</span>
                    </div>
                )}
            </div>

            </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
            <Button 
                form="create-ad-form" 
                disabled={isLoading || isUploading} 
                className="w-full py-3 text-base shadow-lg shadow-blue-500/20"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `Опубликовать ${tier !== 'regular' ? `(${tier === 'vip' ? '100' : '50'} ₽)` : ''}`}
            </Button>
        </div>

      </div>
    </div>
  );
};

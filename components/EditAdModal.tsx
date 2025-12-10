
import React, { useState } from 'react';
import { X, Loader2, Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';
import { Ad } from '../types';

interface EditAdModalProps {
  ad: Ad;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditAdModal: React.FC<EditAdModalProps> = ({ ad, isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: ad.title,
    price: ad.price.toString(),
    category: ad.category,
    description: ad.description,
    location: ad.location,
  });

  // Initialize images from ad.images or fallback to single ad.image
  const [images, setImages] = useState<string[]>(
      ad.images && ad.images.length > 0 ? ad.images : (ad.image ? [ad.image] : [])
  );

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
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.updateAd(ad.id, {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        location: formData.location,
        image: images[0] || '', // First image is main
        images: images // Save full gallery
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Ошибка при обновлении объявления');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden slide-in-from-top h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Редактировать объявление</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="edit-ad-form" onSubmit={handleSubmit} className="space-y-4">
            
            {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800">
                    {errorMsg}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заголовок</label>
                <input 
                required
                type="text" 
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border rounded-lg outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                <select 
                    className="w-full px-3 py-2 border rounded-lg outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                >
                    {['Личные вещи', 'Транспорт', 'Недвижимость', 'Работа', 'Услуги', 'Хобби и отдых', 'Для дома и дачи', 'Электроника', 'Животные'].map(c => (
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
                    className="w-full px-3 py-2 border rounded-lg outline-none resize-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Местоположение</label>
                <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                />
            </div>

            {/* Gallery Edit */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Фотографии ({images.length}/5)</label>
                
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-600 group bg-gray-100 dark:bg-gray-700">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                            {idx === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                                    Главное
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {images.length < 5 && (
                        <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer bg-white dark:bg-transparent">
                            {isUploading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
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

            </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
            <Button 
                form="edit-ad-form"
                disabled={isLoading || isUploading} 
                className="w-full py-3"
            >
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Сохранение...</> : 'Сохранить изменения'}
            </Button>
        </div>

      </div>
    </div>
  );
}

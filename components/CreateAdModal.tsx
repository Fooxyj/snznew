import React, { useState } from 'react';
import { X, Loader2, Upload, Check } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';
import { Ad } from '../types';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ad: Ad) => void;
}

export const CreateAdModal: React.FC<CreateAdModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Личные вещи',
    description: '',
    location: '',
    image: '' 
  });

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const url = await api.uploadImage(file);
        setFormData(prev => ({ ...prev, image: url }));
    } catch (error: any) {
        console.error(error);
        alert('Ошибка загрузки фото: ' + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const newAd = await api.createAd({
        title: formData.title,
        price: Number(formData.price),
        currency: '₽',
        category: formData.category,
        description: formData.description,
        location: formData.location || 'Снежинск',
        image: formData.image || 'https://picsum.photos/seed/new/400/300'
      });

      if (newAd) {
        onSuccess(newAd);
        onClose();
        // Reset form
        setFormData({
            title: '',
            price: '',
            category: 'Личные вещи',
            description: '',
            location: '',
            image: ''
        });
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Ошибка при создании объявления');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-900">Новое объявление</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Например: Продам велосипед"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label>
              <input 
                required
                type="number" 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {['Транспорт', 'Недвижимость', 'Работа', 'Услуги', 'Личные вещи', 'Электроника', 'Хобби'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
             <textarea 
                required
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Расскажите подробнее о товаре..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Улица, район"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          {/* Real Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Фотография</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm bg-gray-50 hover:bg-gray-100 transition-colors relative">
                {formData.image ? (
                    <div className="relative group">
                        <img src={formData.image} alt="Preview" className="h-32 mx-auto rounded object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs">Нажмите, чтобы изменить</span>
                        </div>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                        ) : (
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        )}
                        <p>{isUploading ? "Загрузка..." : "Нажмите для загрузки фото"}</p>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                )}
            </div>
          </div>

          <div className="pt-2">
            <Button disabled={isLoading || isUploading} className="w-full py-2.5">
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Публикация...</> : 'Опубликовать'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
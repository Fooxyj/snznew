
import React, { useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';
import { NewsItem } from '../types';

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (news: NewsItem) => void;
}

export const CreateNewsModal: React.FC<CreateNewsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Город',
    content: '',
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
    try {
      const newItem = await api.createNews({
        ...formData,
        image: formData.image || 'https://picsum.photos/seed/news/800/400'
      });
      onSuccess(newItem);
      onClose();
      setFormData({
        title: '',
        category: 'Город',
        content: '',
        image: ''
      });
    } catch (error: any) {
      alert("Ошибка: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden slide-in-from-top h-[85vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Добавить новость</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заголовок</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
             <select 
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
             >
                 <option>Новости администрации</option>
                 <option>Новости ВНИИТФ</option>
                 <option>Новости культуры</option>
                 <option>Новости спорта</option>
                 <option>ЖКХ</option>
                 <option>Город</option>
                 <option>Прочее</option>
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Текст новости</label>
             <textarea 
                required
                rows={5}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Обложка новости</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
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
                            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Опубликовать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
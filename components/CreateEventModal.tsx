
import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, Calendar, AlignLeft, PenSquare } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';
import { Event } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (evt: Event) => void;
  item?: Event | null;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    category: 'Концерт',
    description: '',
    price: '',
    image: ''
  });

  useEffect(() => {
      if (item && isOpen) {
          setFormData({
              title: item.title,
              date: item.date,
              location: item.location,
              category: item.category,
              description: item.description || '',
              price: item.price?.toString() || '0',
              image: item.image
          });
      } else if (!item && isOpen) {
          setFormData({
            title: '', date: '', location: '', category: 'Концерт', description: '', price: '', image: ''
          });
      }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const url = await api.uploadImage(file);
        setFormData(prev => ({ ...prev, image: url }));
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
      if (item) {
          await api.updateEvent(item.id, {
              ...formData,
              price: Number(formData.price)
          });
          onSuccess(item);
      } else {
          const newEvt = await api.createEvent({
            ...formData,
            price: formData.price ? Number(formData.price) : 0,
            image: formData.image || 'https://picsum.photos/seed/newevt/400/300'
          });
          onSuccess(newEvt);
      }
      onClose();
    } catch (error: any) {
      alert("Ошибка: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center pt-10 md:pt-20 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden slide-in-from-top h-[90vh] md:h-[85vh] flex flex-col">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 shrink-0">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{item ? 'Редактировать событие' : 'Новое событие'}</h3>
            <p className="text-xs text-gray-500">Заполните данные для афиши</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <form id="event-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Заголовок</label>
              <input required type="text" className="w-full px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Когда</label>
                  <input required type="text" className="w-full px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Категория</label>
                  <select className="w-full px-4 py-3 border rounded-2xl outline-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option>Концерт</option><option>Ярмарка</option><option>Выставки</option><option>Премьеры</option>
                  </select>
               </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Описание</label>
              <textarea required rows={4} className="w-full px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Афиша</label>
              <div className="border-4 border-dashed border-gray-100 rounded-3xl p-6 text-center cursor-pointer relative group">
                  {formData.image ? <img src={formData.image} className="h-32 mx-auto rounded-xl object-cover" /> : <Upload className="w-12 h-12 mx-auto text-gray-300" />}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
              </div>
            </div>
          </div>
        </form>

        <div className="p-8 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
          <Button form="event-form" disabled={isLoading || isUploading} className="w-full py-4 text-lg font-black">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : item ? 'Сохранить изменения' : 'Опубликовать'}
          </Button>
        </div>
      </div>
    </div>
  );
};

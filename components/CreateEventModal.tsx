
import React, { useState } from 'react';
// Comment above fix: Added MapPin to lucide-react imports to fix "Cannot find name 'MapPin'" error on line 140
import { X, Loader2, Upload, Calendar, Clock, AlignLeft, MapPin } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';
import { Event } from '../types';
import { SuccessModal } from './SuccessModal';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (evt: Event) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    eventDate: '', // Строка YYYY-MM-DD
    eventTime: '18:00', // Строка HH:mm
    location: '',
    category: 'Концерт',
    description: '',
    price: '',
    image: ''
  });

  if (!isOpen && !showSuccess) return null;

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
      // Форматируем дату для отображения (например: "12 июля, 18:00")
      const d = new Date(formData.eventDate);
      const formattedDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + `, ${formData.eventTime}`;

      const newEvt = await api.createEvent({
        title: formData.title,
        date: formattedDate, // Сохраняем красивую строку для совместимости
        location: formData.location,
        category: formData.category,
        description: formData.description,
        price: formData.price ? Number(formData.price) : 0,
        image: formData.image || 'https://picsum.photos/seed/newevt/400/300'
      });

      onSuccess(newEvt);
      setShowSuccess(true);
      setFormData({ title: '', eventDate: '', eventTime: '18:00', location: '', category: 'Концерт', description: '', price: '', image: '' });
    } catch (error: any) {
      alert("Ошибка: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
      return (
          <SuccessModal 
              isOpen={showSuccess} 
              onClose={() => { setShowSuccess(false); onClose(); }} 
              title="Событие добавлено"
              message="Ваше мероприятие скоро появится в городской афише после быстрой проверки модератором."
          />
      );
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center pt-10 md:pt-20 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden h-[90vh] md:h-[85vh] flex flex-col">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 shrink-0">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Новое событие</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Добавление в городскую афишу</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <form id="event-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Название мероприятия</label>
              <input required type="text" className="w-full px-5 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" placeholder="Напр: Концерт в парке" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Дата</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input required type="date" className="w-full pl-12 pr-4 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Время начала</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input required type="time" className="w-full pl-12 pr-4 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" value={formData.eventTime} onChange={e => setFormData({...formData, eventTime: e.target.value})} />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Категория</label>
                    <select className="w-full px-5 py-4 border rounded-2xl outline-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option>Концерт</option><option>Ярмарка</option><option>Выставки</option><option>Премьеры</option><option>Спорт</option><option>Праздник</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Цена билета (₽)</label>
                    <input type="number" className="w-full px-5 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" placeholder="0 = Бесплатно" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Где пройдет?</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input required type="text" className="w-full pl-12 pr-4 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" placeholder="Место проведения" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Описание события</label>
              <textarea required rows={4} className="w-full px-5 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium resize-none leading-relaxed" placeholder="Расскажите подробнее о программе..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Афиша (изображение)</label>
              <div className="border-4 border-dashed border-gray-100 dark:border-gray-700 rounded-[2rem] p-8 text-center cursor-pointer relative group bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100 transition-colors">
                  {formData.image ? (
                    <div className="relative inline-block">
                        <img src={formData.image} className="h-40 mx-auto rounded-2xl object-cover shadow-xl" />
                        <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg"><X className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <div className="py-4">
                        <Upload className="w-12 h-12 mx-auto text-gray-300 mb-2 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-blue-500 transition-colors">{isUploading ? "Загрузка..." : "Загрузить афишу"}</span>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
              </div>
            </div>
          </div>
        </form>

        <div className="p-8 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
          <Button form="event-form" disabled={isLoading || isUploading} className="w-full py-5 text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Опубликовать событие'}
          </Button>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';
import { Event } from '../types';

interface EditEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ event, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: event.title,
    eventDate: '', 
    eventTime: '18:00',
    location: event.location,
    category: event.category,
    price: event.price?.toString() || '0',
    description: event.description || '',
    image: event.image
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Пытаемся распарсить дату из строки "12 июля, 18:00" или ISO
  useEffect(() => {
      if (isOpen && event) {
          // Для упрощения: если мы не можем точно распарсить старую строку, ставим текущую дату
          // Но в идеале в БД лучше хранить чистый timestamp
          const now = new Date();
          setFormData({
              title: event.title,
              eventDate: now.toISOString().split('T')[0],
              eventTime: '18:00',
              location: event.location,
              category: event.category,
              price: event.price?.toString() || '0',
              description: event.description || '',
              image: event.image
          });
      }
  }, [isOpen, event]);

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
      const d = new Date(formData.eventDate);
      const formattedDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + `, ${formData.eventTime}`;

      await api.updateEvent(event.id, {
        title: formData.title,
        date: formattedDate,
        location: formData.location,
        category: formData.category,
        image: formData.image,
        description: formData.description,
        price: Number(formData.price)
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-8 border-b dark:border-gray-700 pb-5">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Редактировать событие</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {event.id.slice(0,8)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 flex-1 custom-scrollbar overflow-y-auto">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 tracking-widest">Название</label>
            <input 
              className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
            />
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
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Время</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input required type="time" className="w-full pl-12 pr-4 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" value={formData.eventTime} onChange={e => setFormData({...formData, eventTime: e.target.value})} />
                  </div>
               </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 tracking-widest">Место проведения</label>
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                className="w-full pl-12 pr-4 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" 
                value={formData.location} 
                onChange={e => setFormData({...formData, location: e.target.value})} 
                required 
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 tracking-widest">Категория</label>
                <select 
                   className="w-full px-5 py-4 border rounded-2xl outline-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold appearance-none"
                   value={formData.category}
                   onChange={e => setFormData({...formData, category: e.target.value})}
                >
                    <option>Праздник</option>
                    <option>Концерт</option>
                    <option>Спорт</option>
                    <option>Культура</option>
                    <option>Ярмарка</option>
                    <option>Выставки</option>
                </select>
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 tracking-widest">Цена билета (₽)</label>
                <input 
                  type="number"
                  className="w-full px-5 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
             </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 tracking-widest">Описание</label>
            <textarea 
              rows={4}
              className="w-full px-5 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium resize-none leading-relaxed" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              required 
            />
          </div>

          <div className="border-4 border-dashed border-gray-100 dark:border-gray-700 rounded-[2rem] p-6 text-center relative group bg-gray-50/50 dark:bg-gray-900/50">
             {formData.image ? (
                 <div className="relative inline-block">
                     <img src={formData.image} alt="" className="h-32 mx-auto rounded-2xl object-cover shadow-xl" />
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                         <span className="text-[10px] font-black uppercase">Сменить фото</span>
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                     </div>
                 </div>
             ) : (
                 <div className="relative cursor-pointer py-4">
                     <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                     <span className="text-[10px] font-black uppercase text-gray-400">{uploading ? "..." : "Загрузить афишу"}</span>
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                 </div>
             )}
          </div>
          
          <div className="pt-4">
            <Button className="w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : 'Сохранить изменения'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

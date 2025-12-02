
import React, { useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
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
    date: event.date,
    location: event.location,
    category: event.category,
    price: event.price?.toString() || '0',
    image: event.image
  });
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
      await api.updateEvent(event.id, {
        title: formData.title,
        date: formData.date,
        location: formData.location,
        category: formData.category,
        image: formData.image,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Редактировать событие</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Название</label>
            <input 
              className="w-full border rounded-lg p-2" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">Дата</label>
            <input 
              className="w-full border rounded-lg p-2" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">Место</label>
            <input 
              className="w-full border rounded-lg p-2" 
              value={formData.location} 
              onChange={e => setFormData({...formData, location: e.target.value})} 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500">Категория</label>
                <select 
                   className="w-full border rounded-lg p-2 bg-white"
                   value={formData.category}
                   onChange={e => setFormData({...formData, category: e.target.value})}
                >
                    <option>Праздник</option>
                    <option>Концерт</option>
                    <option>Спорт</option>
                    <option>Культура</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500">Цена (₽)</label>
                <input 
                  type="number"
                  className="w-full border rounded-lg p-2"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
             </div>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
             {formData.image ? (
                 <div className="relative group">
                     <img src={formData.image} alt="" className="h-24 mx-auto rounded object-cover" />
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                         <span className="text-xs">Изменить</span>
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                     </div>
                 </div>
             ) : (
                 <div className="relative cursor-pointer">
                     <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                     <span className="text-xs text-gray-500">{uploading ? "..." : "Фото"}</span>
                     <input type="file" className="absolute inset-0 opacity-0" onChange={handleImageUpload} />
                 </div>
             )}
          </div>
          <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Сохранить'}</Button>
        </form>
      </div>
    </div>
  );
};

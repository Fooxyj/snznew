import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'ad' | 'user' | 'comment' | 'business';
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetId, targetType }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Другое' ? customReason : reason;
    
    if (!finalReason.trim()) {
        alert("Пожалуйста, укажите причину.");
        return;
    }
    
    setLoading(true);
    try {
      await api.sendReport(targetId, targetType, finalReason);
      alert("Жалоба отправлена. Администратор рассмотрит её в ближайшее время.");
      onClose();
      setReason('');
      setCustomReason('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reasons = [
      'Спам / Реклама',
      'Мошенничество',
      'Оскорбления / Ненормативная лексика',
      'Запрещенный товар',
      'Неверная категория',
      'Другое'
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" /> Пожаловаться
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">Почему вы хотите пожаловаться?</p>
          <div className="space-y-2 mb-4">
            {reasons.map(r => (
                <label key={r} className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border transition-all ${reason === r ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500/50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <input 
                        type="radio" 
                        name="reason" 
                        value={r} 
                        checked={reason === r} 
                        onChange={e => setReason(e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">{r}</span>
                </label>
            ))}
          </div>
          
          {reason === 'Другое' && (
              <textarea 
                className="w-full border rounded-lg p-3 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none mb-4 outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Опишите проблему подробнее..."
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                autoFocus
              />
          )}

          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-gray-300" onClick={onClose} type="button">Отмена</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20" disabled={loading || !reason}>
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отправить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
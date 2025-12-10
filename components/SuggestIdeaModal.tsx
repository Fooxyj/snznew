
import React, { useState, useEffect } from 'react';
import { X, Loader2, Lightbulb, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/Common';
import { api } from '../services/api';

interface SuggestIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestIdeaModal: React.FC<SuggestIdeaModalProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'idea' | 'complaint'>('idea');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state when opening
  useEffect(() => {
      if (isOpen && !isSubmitted) {
          setText('');
      }
  }, [isOpen]);

  const handleClose = () => {
      onClose();
      // Delay reset to allow close animation to finish
      setTimeout(() => {
          setIsSubmitted(false);
          setText('');
          setType('idea');
      }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      if (type === 'idea') {
          await api.sendSuggestion(text);
      } else {
          // Send general complaint about the app
          await api.sendReport('general', 'app', text);
      }
      setIsSubmitted(true);
    } catch (e: any) {
      alert("Ошибка отправки: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl slide-in-from-top border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        
        {isSubmitted ? (
            <div className="flex flex-col items-center text-center py-4 animate-in fade-in zoom-in duration-300">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${type === 'idea' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {type === 'idea' ? 'Спасибо за идею!' : 'Жалоба принята'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs leading-relaxed">
                    {type === 'idea' 
                        ? 'Мы обязательно рассмотрим ваше предложение и постараемся сделать Снежинск Онлайн лучше.' 
                        : 'Администрация рассмотрит ваше обращение в ближайшее время. Спасибо за бдительность.'}
                </p>
                <Button onClick={handleClose} className={`w-full py-3 text-lg shadow-lg ${type === 'idea' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'}`}>
                    Отлично
                </Button>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white">
                    {type === 'idea' ? (
                        <>
                            <Lightbulb className="w-5 h-5 text-blue-500" /> Предложить идею
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="w-5 h-5 text-red-500" /> Оставить жалобу
                        </>
                    )}
                </h3>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
                    <button 
                        type="button"
                        onClick={() => setType('idea')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${type === 'idea' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    >
                        <Lightbulb className="w-4 h-4" /> Идея
                    </button>
                    <button 
                        type="button"
                        onClick={() => setType('complaint')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${type === 'complaint' ? 'bg-white dark:bg-gray-600 shadow-sm text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    >
                        <AlertTriangle className="w-4 h-4" /> Жалоба
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">
                    {type === 'idea' 
                        ? "Есть мысли, как улучшить Снежинск Онлайн? Напишите нам!" 
                        : "Столкнулись с проблемой или нарушением? Опишите ситуацию."}
                </p>
                
                <textarea 
                    className={`w-full border rounded-lg p-3 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none mb-4 outline-none focus:ring-2 transition-all ${type === 'idea' ? 'focus:ring-blue-500' : 'focus:ring-red-500'}`}
                    rows={5}
                    placeholder={type === 'idea' ? "Опишите вашу идею..." : "Суть жалобы..."}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    required
                    autoFocus
                />

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleClose} type="button" className="dark:border-gray-600 dark:text-gray-300">
                        Отмена
                    </Button>
                    <Button 
                        className={`text-white border-none shadow-lg transition-colors ${type === 'idea' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'}`} 
                        disabled={loading}
                    >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Отправить</>}
                    </Button>
                </div>
                </form>
            </>
        )}
      </div>
    </div>
  );
};
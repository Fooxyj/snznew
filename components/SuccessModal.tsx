
import React from 'react';
import { CheckCircle2, ShieldCheck, Waves, X } from 'lucide-react';
import { Button } from './ui/Common';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ 
    isOpen, 
    onClose, 
    title = "Отправлено на модерацию", 
    message = "Мы проверим ваше объявление на соответствие правилам и опубликуем его в ближайшее время. Обычно это занимает от 15 минут до пары часов." 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border dark:border-gray-700 relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Декор фона */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-500/10 relative">
                        <ShieldCheck className="w-12 h-12 text-blue-600" />
                        <Waves className="absolute -bottom-2 -right-2 w-6 h-6 text-blue-400 animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
                        {title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                        {message}
                    </p>

                    <Button 
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        Понятно
                    </Button>
                </div>
            </div>
        </div>
    );
};

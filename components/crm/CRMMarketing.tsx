import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Button } from '../ui/Common';
import { Send, Loader2, Megaphone, Sparkles, Star, Crown, ShieldCheck, Heart, Info } from 'lucide-react';
import { useToast } from '../ToastProvider';

interface CRMMarketingProps {
    businessId: string;
}

export const CRMMarketing: React.FC<CRMMarketingProps> = ({ businessId }) => {
    const { success, error: showError } = useToast();
    const [pushTitle, setPushTitle] = useState('');
    const [pushMessage, setPushMessage] = useState('');

    const pushMutation = useMutation({
        mutationFn: () => api.sendBusinessPush(businessId, pushTitle, pushMessage),
        onSuccess: (count) => {
            success(`Уведомление отправлено ${count} жителям!`);
            setPushTitle('');
            setPushMessage('');
        },
        onError: (e: any) => showError(e.message)
    });

    const handleSendPush = () => {
        if (!pushTitle || !pushMessage) return;
        pushMutation.mutate();
    };

    return (
        <div className="max-w-4xl animate-in fade-in space-y-10">
            <div>
                <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">Маркетинг</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Инструменты привлечения клиентов</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Push Notifications */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Megaphone className="w-6 h-6 text-blue-200" />
                            <h2 className="text-xl font-black uppercase tracking-tight leading-none">Push-рассылка</h2>
                        </div>
                        <p className="opacity-80 text-xs mb-8 font-medium leading-relaxed">Отправьте мгновенное уведомление всем жителям, которые добавили вашу компанию в «Избранное».</p>
                        
                        <div className="space-y-4">
                            <input 
                                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 placeholder-white/50 text-white outline-none focus:bg-white/20 transition-all font-bold text-sm"
                                placeholder="Заголовок (напр: Акция!)"
                                value={pushTitle}
                                onChange={e => setPushTitle(e.target.value)}
                            />
                            <textarea 
                                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 placeholder-white/50 text-white outline-none focus:bg-white/20 transition-all resize-none font-medium text-sm"
                                rows={3}
                                placeholder="Текст рассылки..."
                                value={pushMessage}
                                onChange={e => setPushMessage(e.target.value)}
                            />
                            <Button 
                                onClick={handleSendPush} 
                                disabled={pushMutation.isPending || !pushTitle || !pushMessage}
                                className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none shadow-2xl py-4 font-black uppercase tracking-widest text-[11px]"
                            >
                                {pushMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Отправить сейчас</>}
                            </Button>
                        </div>
                    </div>
                    <Megaphone className="absolute -bottom-10 -right-10 w-48 h-48 opacity-5 -rotate-12" />
                </div>

                {/* Boost Options */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 border-dashed dark:border-gray-700 flex items-center gap-5 hover:border-orange-200 transition-all group cursor-pointer">
                        <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                            <Star className="w-7 h-7 fill-current" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase dark:text-white">VIP-статус</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Поднятие в топ поиска и каталога</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 flex items-center gap-5 hover:shadow-md transition-all group cursor-pointer">
                        <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-500 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase dark:text-white">Верификация</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Синяя галочка доверия</p>
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-[2.5rem] border border-purple-100 dark:border-purple-900/30">
                        <div className="flex items-start gap-4">
                            <Info className="w-5 h-5 text-purple-600 mt-1 shrink-0" />
                            <div>
                                <h4 className="text-sm font-black uppercase text-purple-800 dark:text-purple-300">Лояльность</h4>
                                <p className="text-xs text-purple-700/70 dark:text-purple-400/60 leading-relaxed mt-1 font-medium">Создайте бонусные купоны в разделе «Магазин бонусов», чтобы клиенты могли тратить свой XP у вас.</p>
                                <button className="mt-4 text-[10px] font-black uppercase text-purple-600 hover:underline">Перейти в управление купонами</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
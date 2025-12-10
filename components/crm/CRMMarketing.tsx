
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Button } from '../ui/Common';
import { Send, Loader2 } from 'lucide-react';

interface CRMMarketingProps {
    businessId: string;
}

export const CRMMarketing: React.FC<CRMMarketingProps> = ({ businessId }) => {
    const [pushTitle, setPushTitle] = useState('');
    const [pushMessage, setPushMessage] = useState('');

    const pushMutation = useMutation({
        mutationFn: () => api.sendBusinessPush(businessId, pushTitle, pushMessage),
        onSuccess: (count) => {
            alert(`Уведомление отправлено ${count} подписчикам!`);
            setPushTitle('');
            setPushMessage('');
        },
        onError: (e: any) => alert(e.message)
    });

    const handleSendPush = () => {
        if (!pushTitle || !pushMessage) return;
        pushMutation.mutate();
    };

    return (
        <div className="max-w-xl animate-in fade-in">
            <h1 className="text-2xl font-bold dark:text-white mb-6">Маркетинг</h1>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 lg:p-8 text-white shadow-lg mb-8">
                <h2 className="text-xl font-bold mb-2">Push-уведомления</h2>
                <p className="opacity-90 text-sm mb-6">Отправьте уведомление всем клиентам, добавившим ваш бизнес в избранное.</p>
                
                <div className="space-y-4">
                    <input 
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 placeholder-white/60 text-white outline-none focus:bg-white/30 transition-all"
                        placeholder="Заголовок (например: Скидка 20%)"
                        value={pushTitle}
                        onChange={e => setPushTitle(e.target.value)}
                    />
                    <textarea 
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 placeholder-white/60 text-white outline-none focus:bg-white/30 transition-all resize-none"
                        rows={3}
                        placeholder="Текст сообщения..."
                        value={pushMessage}
                        onChange={e => setPushMessage(e.target.value)}
                    />
                    <Button 
                        onClick={handleSendPush} 
                        disabled={pushMutation.isPending || !pushTitle || !pushMessage}
                        className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-xl"
                    >
                        {pushMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Отправить</>}
                    </Button>
                </div>
            </div>
        </div>
    );
};

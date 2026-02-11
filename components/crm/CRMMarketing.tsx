
import React, { useState } from 'react';
import { Star, ShieldCheck, Heart, Info, ArrowRight, Zap, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '../ToastProvider';
import { api } from '../../services/api';

interface CRMMarketingProps {
    businessId: string;
    setActiveTab: (tab: any) => void;
}

export const CRMMarketing: React.FC<CRMMarketingProps> = ({ businessId, setActiveTab }) => {
    const { success, info, error } = useToast();
    const [loadingType, setLoadingType] = useState<string | null>(null);

    const handleRequest = async (type: 'VIP' | 'VERIFY') => {
        const typeLabel = type === 'VIP' ? 'VIP-статус' : 'Верификацию';
        setLoadingType(type);
        try {
            // Отправляем специальный тип репорта, который API подхватит в общую модерацию
            const targetType = type === 'VIP' ? 'biz_vip_request' : 'biz_verify_request';
            const reason = `Запрос на ${typeLabel}`;
            
            await api.sendReport(businessId, targetType, reason);
            
            success(`Заявка на "${typeLabel}" успешно отправлена!`);
            info("Модератор рассмотрит её в разделе заявок.");
        } catch (e: any) {
            error("Не удалось отправить заявку: " + e.message);
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <div className="max-w-4xl animate-in fade-in space-y-10">
            <div>
                <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">Маркетинг и Рост</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Инструменты привлечения клиентов в Снежинске</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* VIP & Verification */}
                <div className="space-y-6">
                    <button 
                        onClick={() => handleRequest('VIP')}
                        disabled={loadingType !== null}
                        className="w-full text-left bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center gap-6 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/5 transition-all group relative overflow-hidden disabled:opacity-50"
                    >
                        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                            {loadingType === 'VIP' ? <Loader2 className="w-8 h-8 animate-spin" /> : <Star className="w-8 h-8 fill-current" />}
                        </div>
                        <div>
                            <h3 className="font-black text-lg uppercase dark:text-white leading-tight">VIP-статус</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Поднятие в топ поиска и каталога</p>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-5 h-5 text-orange-500" />
                        </div>
                    </button>

                    <button 
                        onClick={() => handleRequest('VERIFY')}
                        disabled={loadingType !== null}
                        className="w-full text-left bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border dark:border-gray-700 flex items-center gap-6 hover:shadow-xl hover:border-blue-400 transition-all group relative disabled:opacity-50"
                    >
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                            {loadingType === 'VERIFY' ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldCheck className="w-8 h-8" />}
                        </div>
                        <div>
                            <h3 className="font-black text-lg uppercase dark:text-white leading-tight">Верификация</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Галочка доверия в каталоге</p>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-5 h-5 text-blue-500" />
                        </div>
                    </button>
                </div>

                {/* Loyalty & Coupons */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart className="w-7 h-7 text-purple-200 fill-current" />
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-none">Лояльность</h2>
                        </div>
                        <p className="opacity-80 text-sm mb-10 font-medium leading-relaxed">
                            Создайте бонусные купоны, чтобы клиенты могли тратить свой накопленный опыт (XP) именно у вас. Это отличный способ привлечь новую аудиторию.
                        </p>
                    </div>

                    <button 
                        onClick={() => setActiveTab('coupons')}
                        className="relative z-10 w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-2xl py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        Управление купонами <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <Sparkles className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 -rotate-12" />
                </div>
            </div>

            {/* Info Block */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 flex items-start gap-5">
                <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-blue-500">
                    <Info className="w-6 h-6" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">Как работает продвижение?</p>
                    После отправки заявки наш модератор проверит соответствие вашего профиля правилам Снежинска. VIP-статус активируется после оплаты счета (админ свяжется с вами), а Верификация доступна бесплатно для всех активных и честных компаний города.
                </div>
            </div>
        </div>
    );
};

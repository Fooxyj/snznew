
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Campaign } from '../types';
import { Button } from '../components/ui/Common';
import { Heart, Loader2, Info, ExternalLink, QrCode, ChevronLeft, Target, User as UserIcon, ArrowRight, ShieldCheck, AlertTriangle, Shield, Waves } from 'lucide-react';

export const CharityPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCamp, setSelectedCamp] = useState<Campaign | null>(null);

    const loadData = async () => {
        try {
            const c = await api.getCampaigns();
            setCampaigns(c);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    if (selectedCamp) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 animate-in fade-in duration-300 pb-32">
                <div className="relative h-[40vh] md:h-[50vh] w-full">
                    <img src={selectedCamp.image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    <button 
                        onClick={() => setSelectedCamp(null)}
                        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/10 transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest"
                    >
                        <ChevronLeft className="w-5 h-5" /> Вернуться в Простор
                    </button>

                    <div className="absolute bottom-10 left-6 right-6 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-lg">
                            <ShieldCheck className="w-3 h-3" /> Проверено платформой Простор
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">
                            {selectedCamp.title}
                        </h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                    <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-[2rem] flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight mb-1">Прозрачность и безопасность</h4>
                            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                                Платформа «Простор» является информационным витриной и не аккумулирует денежные средства на своих счетах. Все пожертвования направляются напрямую организаторам. Помогайте ответственно.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700">
                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4 text-red-500"/> Цель сбора
                            </div>
                            <div className="text-3xl font-black dark:text-white tracking-tighter">{selectedCamp.targetAmount.toLocaleString()} ₽</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                            <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2 flex items-center gap-2">
                                <UserIcon className="w-4 h-4"/> Организатор
                            </div>
                            <div className="text-lg font-bold text-blue-900 dark:text-blue-300 truncate">{selectedCamp.organizerName}</div>
                        </div>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] flex items-center gap-3 mb-6">
                            <div className="w-8 h-[2px] bg-red-500"></div> Описание проекта
                        </h4>
                        <p className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed font-medium italic whitespace-pre-wrap">
                            "{selectedCamp.description}"
                        </p>
                    </div>

                    {selectedCamp.qrCode && (
                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 flex flex-col items-center gap-8 text-center border dark:border-gray-700 shadow-xl border-t-8 border-t-blue-600">
                            <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl border-4 border-gray-50">
                                <img src={selectedCamp.qrCode} className="w-64 h-64 object-contain" alt="QR Code" />
                            </div>
                            <div className="max-w-xs">
                                <h5 className="font-black uppercase text-sm text-gray-900 dark:text-white tracking-widest mb-3">QR-код для перевода</h5>
                                <p className="text-[11px] text-gray-500 font-bold uppercase leading-relaxed">
                                    Отсканируйте через мобильный банк для прямой помощи проекту
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-32">
            <div className="bg-red-600 rounded-[3rem] p-10 lg:p-16 text-white mb-8 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl lg:text-7xl font-black mb-6 uppercase italic tracking-tighter leading-none">
                        Простор <br/> Добра
                    </h1>
                    <p className="text-xl opacity-90 font-medium leading-relaxed max-w-lg">
                        Центр благотворительных инициатив Снежинска. Создаем простор для добрых дел вместе.
                    </p>
                </div>
                <Heart className="absolute -bottom-10 -right-10 w-80 h-80 text-white/10 fill-current rotate-12" />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 mb-12 flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <Shield className="w-7 h-7" />
                </div>
                <div className="text-center md:text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Статус витрины</h4>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                        Платформа «Простор» выступает исключительно как <span className="text-blue-600 font-bold">информационный посредник</span>. Мы не являемся получателями пожертвований и не берем комиссий. Ваша помощь идет напрямую тем, кто в ней нуждается.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {campaigns.map(camp => (
                    <div 
                        key={camp.id} 
                        onClick={() => setSelectedCamp(camp)}
                        className="group bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
                    >
                        <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0">
                            <img src={camp.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-[13px] md:text-sm font-black text-white uppercase leading-tight line-clamp-2 drop-shadow-md">
                                    {camp.title}
                                </h3>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.1em]">
                                <span>{camp.organizerName}</span>
                                <ArrowRight className="w-3 h-3 text-red-500 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

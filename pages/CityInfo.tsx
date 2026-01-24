
import React, { useState, useEffect } from 'react';
import { Bus, Siren, Phone, Shield, Flame, Activity, Truck, Loader2, PhoneCall, Clock4, Info, Package, ArrowRight, MapPin, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Button, formatAddress, formatPhone, Rating } from '../components/ui/Common';
import { BusinessCardSkeleton } from '../components/ui/Skeleton';

export const TransportPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const tabParam = searchParams.get('tab') as 'city' | 'intercity' | 'taxi' | 'cargo';
    const [activeTab, setActiveTab] = useState<'city' | 'intercity' | 'taxi' | 'cargo'>(tabParam || 'city');

    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
        queryKey: ['transport'],
        queryFn: api.getTransportSchedules
    });

    const { data: cargoBusinesses = [], isLoading: loadingCargo } = useQuery({
        queryKey: ['cargoBusinesses'],
        queryFn: () => api.getBusinesses('transport'), 
        enabled: activeTab === 'cargo'
    });

    const handleTabChange = (tab: 'city' | 'intercity' | 'taxi' | 'cargo') => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const filteredSchedules = schedules.filter(s => s.type === activeTab);
    const cargoOnly = cargoBusinesses.filter(b => b.category === 'Грузоперевозки' || b.name.toLowerCase().includes('грузо'));

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 dark:text-white uppercase tracking-tighter">
                <Bus className="w-8 h-8 text-blue-600" /> Транспорт и Логистика
            </h1>

            <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => handleTabChange('city')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm font-black uppercase tracking-widest ${activeTab === 'city' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Город
                </button>
                <button 
                    onClick={() => handleTabChange('intercity')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm font-black uppercase tracking-widest ${activeTab === 'intercity' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Межгород
                </button>
                <button 
                    onClick={() => handleTabChange('taxi')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm font-black uppercase tracking-widest ${activeTab === 'taxi' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Такси
                </button>
                <button 
                    onClick={() => handleTabChange('cargo')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm font-black uppercase tracking-widest ${activeTab === 'cargo' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Грузоперевозки
                </button>
            </div>

            {activeTab === 'cargo' ? (
                <div className="space-y-6 animate-in fade-in">
                    {loadingCargo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <BusinessCardSkeleton /><BusinessCardSkeleton />
                        </div>
                    ) : cargoOnly.length === 0 ? (
                        <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed dark:border-gray-700">
                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 dark:text-gray-400">Грузоперевозки пока не добавлены</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cargoOnly.map(biz => {
                                const hasRating = (biz.reviewsCount || 0) > 0;
                                return (
                                    <div 
                                        key={biz.id} 
                                        onClick={() => navigate(`/business/${biz.id}`)}
                                        className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col group overflow-hidden"
                                    >
                                        <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                                            <img src={biz.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                            {/* Плашка с рейтингом — в точности как в магазине */}
                                            <div className="absolute top-3 right-3">
                                                {hasRating ? (
                                                    <div className="bg-white/90 dark:bg-black/70 backdrop-blur px-1 py-0.5 rounded-lg shadow-sm border dark:border-gray-700">
                                                        <Rating value={biz.rating} count={biz.reviewsCount} />
                                                    </div>
                                                ) : (
                                                    <div className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                                                        Новый
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                {biz.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{biz.description}</p>
                                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                                                    <Phone className="w-3.5 h-3.5" /> {formatPhone(biz.phone)}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : loadingSchedules ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
            ) : filteredSchedules.length === 0 ? (
                <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed dark:border-gray-700">
                    <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 dark:text-gray-400">Расписание пока не добавлено</p>
                </div>
            ) : activeTab === 'taxi' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSchedules.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="text-lg font-bold dark:text-white mb-1">{item.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2 mb-4">
                                    <Clock4 className="w-4 h-4" /> {item.workHours || 'Круглосуточно'}
                                </div>
                                {item.price > 0 && (
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
                                        Цена: от {item.price} ₽
                                    </p>
                                )}
                            </div>
                            <a 
                                href={`tel:${item.phone}`} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                            >
                                <PhoneCall className="w-5 h-5" /> {item.phone}
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                                <tr>
                                    {activeTab === 'city' ? (
                                        <>
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">№</th>
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Маршрут</th>
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Интервал</th>
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Часы работы</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Направление</th>
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Отправление</th>
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">В пути</th>
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Цена</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredSchedules.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        {activeTab === 'city' ? (
                                            <>
                                                <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400">{item.routeNumber}</td>
                                                <td className="px-6 py-4 font-medium dark:text-gray-300">{item.title}</td>
                                                <td className="px-6 py-4 dark:text-gray-400">{item.schedule}</td>
                                                <td className="px-6 py-4 dark:text-gray-400">{item.workHours}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 font-bold dark:text-gray-200">{item.title}</td>
                                                <td className="px-6 py-4 dark:text-gray-300 whitespace-pre-line">{item.schedule}</td>
                                                <td className="px-6 py-4 dark:text-gray-400">{item.workHours}</td>
                                                <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400">{item.price ? `${item.price} ₽` : '-'}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                    Рекомендуем уточнять актуальность расписания по телефонам диспетчерских служб.
                </p>
            </div>
        </div>
    );
};

// Comment above fix: Added EmergencyPage component export to fix import error in App.tsx
export const EmergencyPage: React.FC = () => {
    const emergencyNumbers = [
        { title: 'Единая служба спасения', phone: '112', icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
        { title: 'Полиция', phone: '102', icon: Siren, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Скорая помощь', phone: '103', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Пожарная служба', phone: '101', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-8 flex items-center gap-3 dark:text-white uppercase tracking-tighter">
                <Siren className="w-8 h-8 text-red-600" /> Экстренные службы
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emergencyNumbers.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm flex items-center gap-6">
                        <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center ${item.color}`}>
                            <item.icon className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg dark:text-white">{item.title}</h3>
                            <a href={`tel:${item.phone}`} className="text-3xl font-black text-gray-900 dark:text-white hover:text-red-600 transition-colors">
                                {item.phone}
                            </a>
                        </div>
                        <a href={`tel:${item.phone}`} className="p-4 bg-red-600 text-white rounded-full shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                            <PhoneCall className="w-6 h-6" />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

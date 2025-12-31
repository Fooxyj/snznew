
import React, { useState, useEffect } from 'react';
import { Bus, Siren, Phone, Shield, Flame, Activity, Truck, Loader2, PhoneCall, Clock4, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';

export const TransportPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as 'city' | 'intercity' | 'taxi';
    const [activeTab, setActiveTab] = useState<'city' | 'intercity' | 'taxi'>(tabParam || 'city');

    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const { data: schedules = [], isLoading } = useQuery({
        queryKey: ['transport'],
        queryFn: api.getTransportSchedules
    });

    const handleTabChange = (tab: 'city' | 'intercity' | 'taxi') => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const filteredSchedules = schedules.filter(s => s.type === activeTab);

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 dark:text-white">
                <Bus className="w-8 h-8 text-blue-600" /> Транспорт Снежинска
            </h1>

            <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => handleTabChange('city')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'city' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Городские автобусы
                </button>
                <button 
                    onClick={() => handleTabChange('intercity')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'intercity' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Межгород
                </button>
                <button 
                    onClick={() => handleTabChange('taxi')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'taxi' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Такси
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
            ) : filteredSchedules.length === 0 ? (
                <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed dark:border-gray-700">
                    <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 dark:text-gray-400">Данные в этом разделе пока не добавлены администратором</p>
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
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    Расписание может меняться в праздничные дни. Рекомендуем уточнять актуальность данных по телефонам диспетчерских служб.
                </p>
            </div>
        </div>
    );
};

export const EmergencyPage: React.FC = () => {
    const numbers = [
        { icon: Flame, name: 'Пожарная охрана', num: '101', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
        { icon: Shield, name: 'Полиция', num: '102', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
        { icon: Activity, name: 'Скорая помощь', num: '103', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
        { icon: Truck, name: 'Газовая служба', num: '104', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
        { icon: Siren, name: 'Единая служба спасения', num: '112', color: 'bg-red-500 text-white' },
    ];

    const utilities = [
        { name: 'Водоканал (Аварийная)', num: '+7 (351) 462-22-22' },
        { name: 'Электросети (Дежурный)', num: '+7 (351) 462-33-33' },
        { name: 'Лифтовая служба', num: '+7 (351) 462-44-44' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 dark:text-white">
                <Siren className="w-8 h-8 text-red-600" /> Экстренные службы
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {numbers.map(n => (
                    <a href={`tel:${n.num}`} key={n.num} className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${n.color}`}>
                            <n.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200">{n.name}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{n.num}</p>
                        </div>
                    </a>
                ))}
            </div>

            <h2 className="text-xl font-bold mb-4 dark:text-white">Коммунальные службы</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 divide-y dark:divide-gray-700">
                {utilities.map(u => (
                    <div key={u.num} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{u.name}</span>
                        <a href={`tel:${u.num}`} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                            <Phone className="w-4 h-4" /> {u.num}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

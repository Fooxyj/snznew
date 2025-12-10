
import React, { useState } from 'react';
import { Bus, Siren, Phone, Shield, Flame, Activity, Truck, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const TransportPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'city' | 'intercity'>('city');

    const { data: schedules = [], isLoading } = useQuery({
        queryKey: ['transport'],
        queryFn: api.getTransportSchedules
    });

    const filteredSchedules = schedules.filter(s => s.type === activeTab);

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 dark:text-white">
                <Bus className="w-8 h-8 text-blue-600" /> Расписание транспорта
            </h1>

            <div className="flex border-b dark:border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('city')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'city' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Городские маршруты
                </button>
                <button 
                    onClick={() => setActiveTab('intercity')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'intercity' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Междугородние
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Расписание пока пусто</div>
                ) : (
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
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Время в пути</th>
                                            <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Цена</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredSchedules.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        {activeTab === 'city' ? (
                                            <>
                                                <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{item.routeNumber}</td>
                                                <td className="px-6 py-4 dark:text-gray-300">{item.title}</td>
                                                <td className="px-6 py-4 dark:text-gray-300">{item.schedule}</td>
                                                <td className="px-6 py-4 dark:text-gray-300">{item.workHours}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 font-medium dark:text-gray-200">{item.title}</td>
                                                <td className="px-6 py-4 dark:text-gray-300">{item.schedule}</td>
                                                <td className="px-6 py-4 dark:text-gray-300">{item.workHours}</td>
                                                <td className="px-6 py-4 font-bold dark:text-white">{item.price ? `${item.price} ₽` : ''}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center">* Расписание может меняться в праздничные дни</p>
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

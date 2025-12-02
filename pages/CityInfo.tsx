
import React, { useState } from 'react';
import { Bus, Siren, Phone, Shield, Flame, Activity, Truck } from 'lucide-react';

export const TransportPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'city' | 'intercity'>('city');

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Bus className="w-8 h-8 text-blue-600" /> Расписание транспорта
            </h1>

            <div className="flex border-b mb-6">
                <button 
                    onClick={() => setActiveTab('city')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'city' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Городские маршруты
                </button>
                <button 
                    onClick={() => setActiveTab('intercity')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'intercity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Междугородние
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {activeTab === 'city' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-900">№</th>
                                    <th className="px-6 py-4 font-bold text-gray-900">Маршрут</th>
                                    <th className="px-6 py-4 font-bold text-gray-900">Интервал</th>
                                    <th className="px-6 py-4 font-bold text-gray-900">Часы работы</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-blue-600">1</td>
                                    <td className="px-6 py-4">ул. Ленина — пос. Сокол</td>
                                    <td className="px-6 py-4">15 мин</td>
                                    <td className="px-6 py-4">06:00 - 23:00</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-blue-600">3</td>
                                    <td className="px-6 py-4">Вокзал — Больница</td>
                                    <td className="px-6 py-4">20 мин</td>
                                    <td className="px-6 py-4">06:30 - 22:00</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-blue-600">7</td>
                                    <td className="px-6 py-4">Кольцевой (через Центр)</td>
                                    <td className="px-6 py-4">10 мин</td>
                                    <td className="px-6 py-4">06:00 - 23:30</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-900">Направление</th>
                                    <th className="px-6 py-4 font-bold text-gray-900">Отправление</th>
                                    <th className="px-6 py-4 font-bold text-gray-900">Время в пути</th>
                                    <th className="px-6 py-4 font-bold text-gray-900">Цена</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">Екатеринбург (Северный)</td>
                                    <td className="px-6 py-4">07:00, 12:00, 18:00</td>
                                    <td className="px-6 py-4">2 ч 10 мин</td>
                                    <td className="px-6 py-4 font-bold">450 ₽</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">Челябинск (Южный)</td>
                                    <td className="px-6 py-4">06:30, 09:00, 15:00</td>
                                    <td className="px-6 py-4">2 ч 30 мин</td>
                                    <td className="px-6 py-4 font-bold">500 ₽</td>
                                </tr>
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
        { icon: Flame, name: 'Пожарная охрана', num: '101', color: 'bg-red-100 text-red-600' },
        { icon: Shield, name: 'Полиция', num: '102', color: 'bg-blue-100 text-blue-600' },
        { icon: Activity, name: 'Скорая помощь', num: '103', color: 'bg-red-100 text-red-600' },
        { icon: Truck, name: 'Газовая служба', num: '104', color: 'bg-orange-100 text-orange-600' },
        { icon: Siren, name: 'Единая служба спасения', num: '112', color: 'bg-red-500 text-white' },
    ];

    const utilities = [
        { name: 'Водоканал (Аварийная)', num: '+7 (351) 462-22-22' },
        { name: 'Электросети (Дежурный)', num: '+7 (351) 462-33-33' },
        { name: 'Лифтовая служба', num: '+7 (351) 462-44-44' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Siren className="w-8 h-8 text-red-600" /> Экстренные службы
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {numbers.map(n => (
                    <a href={`tel:${n.num}`} key={n.num} className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${n.color}`}>
                            <n.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium group-hover:text-gray-700">{n.name}</p>
                            <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{n.num}</p>
                        </div>
                    </a>
                ))}
            </div>

            <h2 className="text-xl font-bold mb-4">Коммунальные службы</h2>
            <div className="bg-white rounded-xl shadow-sm border divide-y">
                {utilities.map(u => (
                    <div key={u.num} className="p-4 flex justify-between items-center hover:bg-gray-50">
                        <span className="font-medium text-gray-800">{u.name}</span>
                        <a href={`tel:${u.num}`} className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                            <Phone className="w-4 h-4" /> {u.num}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

import React from 'react';
import { Booking, Table } from '../../types';

interface CRMBookingsProps {
    bookings: Booking[];
    tables: Table[];
    viewMode: 'list' | 'hall';
    onChangeView: (mode: 'list' | 'hall') => void;
    onTableClick: (table: Table) => void;
}

export const CRMBookings: React.FC<CRMBookingsProps> = ({ bookings, tables, viewMode, onChangeView, onTableClick }) => {
    return (
        <div className="animate-in fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Бронирование</h1>
                <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    <button 
                        onClick={() => onChangeView('list')}
                        className={`px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Список
                    </button>
                    <button 
                        onClick={() => onChangeView('hall')}
                        className={`px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-colors ${viewMode === 'hall' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Зал
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Клиент</th>
                                <th className="px-6 py-4">Услуга</th>
                                <th className="px-6 py-4">Дата и Время</th>
                                <th className="px-6 py-4">Статус</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700 text-sm">
                            {bookings.map(b => (
                                <tr key={b.id}>
                                    <td className="px-6 py-4 font-medium dark:text-white">Пользователь #{b.userId.slice(0,4)}</td>
                                    <td className="px-6 py-4 dark:text-gray-300">{b.serviceTitle || 'Услуга'}</td>
                                    <td className="px-6 py-4 dark:text-gray-300">{new Date(b.date).toLocaleDateString()} в {b.time}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Подтверждено
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Нет записей</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border dark:border-gray-700 relative overflow-hidden overflow-x-auto">
                    <div className="absolute inset-0 p-4 lg:p-8 min-w-[600px]">
                        {tables.map(t => (
                            <div
                                key={t.id}
                                onClick={() => onTableClick(t)}
                                className={`
                                    absolute flex items-center justify-center font-bold text-xs lg:text-sm cursor-pointer transition-all shadow-md hover:scale-105 border-2
                                    ${t.status === 'free' ? 'bg-green-100 border-green-500 text-green-800' : t.status === 'reserved' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' : 'bg-red-100 border-red-500 text-red-800'}
                                    ${t.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
                                `}
                                style={{
                                    left: `${t.x}%`,
                                    top: `${t.y}%`,
                                    width: t.seats > 2 ? '100px' : '60px',
                                    height: '60px'
                                }}
                            >
                                {t.name}
                            </div>
                        ))}
                        {tables.length === 0 && <div className="flex h-full items-center justify-center text-gray-400">Схема зала не настроена</div>}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur px-4 py-2 rounded-lg flex gap-4 text-xs font-medium z-10">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Свободно</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Бронь</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Занято</div>
                    </div>
                </div>
            )}
        </div>
    );
};
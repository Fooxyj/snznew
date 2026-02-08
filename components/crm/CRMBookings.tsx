import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Booking, Table } from '../../types';
import { api } from '../../services/api';
import { Check, X, Clock, User, Phone, Calendar as CalIcon } from 'lucide-react';
import { Button } from '../ui/Common';

interface CRMBookingsProps {
    businessId: string;
    bookings: Booking[];
    tables: Table[];
    viewMode: 'list' | 'hall';
    onChangeView: (mode: 'list' | 'hall') => void;
    onTableClick: (table: Table) => void;
}

export const CRMBookings: React.FC<CRMBookingsProps> = ({ businessId, bookings, tables, viewMode, onChangeView, onTableClick }) => {
    const queryClient = useQueryClient();

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => api.updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessBookings', businessId] });
        }
    });

    const handleStatusUpdate = (id: string, status: string) => {
        if (confirm(`Изменить статус записи на "${status === 'confirmed' ? 'Подтверждено' : 'Отменено'}"?`)) {
            statusMutation.mutate({ id, status });
        }
    };

    return (
        <div className="animate-in fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">Записи клиентов</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Управление бронированиями</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 shadow-inner border dark:border-gray-700">
                    <button 
                        onClick={() => onChangeView('list')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                    >
                        Список
                    </button>
                    <button 
                        onClick={() => onChangeView('hall')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'hall' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                    >
                        Схема зала
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="grid gap-4">
                    {bookings.length === 0 ? (
                        <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed dark:border-gray-700">
                            <Clock className="w-16 h-16 mx-auto mb-4 opacity-10 text-gray-400" />
                            <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Новых записей пока нет</p>
                        </div>
                    ) : (
                        bookings.map(b => (
                            <div key={b.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-black text-sm uppercase dark:text-white mb-1 truncate">Клиент #{b.userId.slice(0, 5)}</div>
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><CalIcon className="w-3.5 h-3.5 text-blue-500" /> {new Date(b.date).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> {b.time}</span>
                                            <span className="text-blue-600 dark:text-blue-400 font-black">{b.serviceTitle || 'Услуга'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 shrink-0">
                                    {b.status === 'pending' ? (
                                        <>
                                            <button 
                                                onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                                                className="p-3.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100 dark:border-green-800"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                                                className="p-3.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 dark:border-red-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                            b.status === 'confirmed' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                                        }`}>
                                            {b.status === 'confirmed' ? 'Подтверждено' : 'Отменено'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 relative overflow-hidden flex items-center justify-center p-10">
                    <div className="text-center max-w-sm">
                        <LayoutDashboardIcon className="w-16 h-16 mx-auto mb-4 opacity-10 text-gray-400" />
                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Схема зала недоступна</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 leading-relaxed">Данная функция находится в стадии бета-тестирования. Обратитесь в поддержку для настройки плана вашего заведения.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const LayoutDashboardIcon: React.FC<any> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
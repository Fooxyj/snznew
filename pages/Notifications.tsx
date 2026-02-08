
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Notification } from '../types';
import { Bell, Trash2, CheckCircle, Info, AlertTriangle, Loader2, ChevronRight, CheckCheck, X, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Common';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

const NotificationIcon = ({ type }: { type?: string }) => {
    switch(type) {
        case 'reward': return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'important': return <AlertTriangle className="w-5 h-5 text-red-500" />;
        case 'personal': return <Info className="w-5 h-5 text-indigo-500" />;
        default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
};

export const NotificationsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    
    const [confirmAction, setConfirmAction] = useState<'read_all' | 'clear_all' | null>(null);

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: api.getNotifications,
        refetchInterval: 15000
    });

    const markReadMutation = useMutation({
        mutationFn: api.markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });
            setConfirmAction(null);
            success("Все уведомления прочитаны");
        },
        onError: (e: any) => showError("Ошибка: " + e.message)
    });

    const clearAllMutation = useMutation({
        mutationFn: api.clearAllNotifications,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });
            setConfirmAction(null);
            success("История уведомлений очищена");
        },
        onError: (e: any) => showError("Ошибка: " + e.message)
    });

    const deleteOneMutation = useMutation({
        mutationFn: api.deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });
        }
    });

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    return (
        <div className="max-w-3xl mx-auto p-4 lg:p-8 pb-32">
            {/* Modal Confirmation */}
            {confirmAction && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full text-center border dark:border-gray-700">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmAction === 'clear_all' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            {confirmAction === 'clear_all' ? <Trash2 className="w-8 h-8" /> : <CheckCheck className="w-8 h-8" />}
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight dark:text-white mb-2">
                            {confirmAction === 'clear_all' ? 'Очистить историю?' : 'Прочитать всё?'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            {confirmAction === 'clear_all' ? 'Это действие удалит все уведомления без возможности восстановления.' : 'Все непрочитанные уведомления будут отмечены как просмотренные.'}
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button 
                                variant={confirmAction === 'clear_all' ? 'danger' : 'primary'}
                                className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
                                onClick={() => confirmAction === 'clear_all' ? clearAllMutation.mutate() : markReadMutation.mutate()}
                                disabled={clearAllMutation.isPending || markReadMutation.isPending}
                            >
                                {clearAllMutation.isPending || markReadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Подтверждаю'}
                            </Button>
                            <button 
                                onClick={() => setConfirmAction(null)}
                                className="py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Уведомления</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">События вашего Простора</p>
                </div>
                {notifications.length > 0 && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setConfirmAction('read_all')}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="Прочитать всё"
                        >
                            <CheckCheck className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setConfirmAction('clear_all')}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Удалить всё"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="py-24 text-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed dark:border-gray-700 shadow-inner animate-in fade-in zoom-in-95">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell className="w-10 h-10 text-gray-200 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">У вас всё спокойно</h3>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Новых уведомлений не обнаружено</p>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {notifications.map((n) => (
                        <div 
                            key={n.id} 
                            className={`group relative bg-white dark:bg-gray-800 rounded-[2rem] p-6 border transition-all hover:shadow-xl flex items-start gap-5 ${n.isRead ? 'border-gray-100 dark:border-gray-700 opacity-70' : 'border-blue-100 dark:border-blue-900 shadow-md ring-1 ring-blue-50 dark:ring-blue-900/20'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${n.isRead ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                                <NotificationIcon type={n.type} />
                            </div>

                            <div className="flex-1 min-w-0 pr-8">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{formatDate(n.createdAt)}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{formatTime(n.createdAt)}</span>
                                    {!n.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]"></span>}
                                </div>
                                <p className="text-gray-700 dark:text-gray-200 text-sm font-bold leading-relaxed">{n.text}</p>
                                
                                {n.link && (
                                    <Link 
                                        to={n.link} 
                                        className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Перейти к событию <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                )}
                            </div>

                            <button 
                                onClick={() => deleteOneMutation.mutate(n.id)}
                                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-12 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                    Здесь отображаются важные обновления вашего аккаунта: статус модерации объявлений, новости от компаний в «Избранном» и системные сообщения Простора.
                </div>
            </div>
        </div>
    );
};

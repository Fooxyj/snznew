import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface CRMOrdersProps {
    businessId: string;
}

export const CRMOrders: React.FC<CRMOrdersProps> = ({ businessId }) => {
    const queryClient = useQueryClient();

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['businessOrders', businessId],
        queryFn: () => api.getBusinessOrders(businessId)
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
            api.updateOrderStatus(orderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessOrders', businessId] });
        }
    });

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="h-full flex flex-col animate-in fade-in">
            <h1 className="text-2xl font-bold dark:text-white mb-6 hidden lg:block">Управление заказами</h1>
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-4 lg:gap-6 min-w-[800px] lg:min-w-[1000px] h-full pb-4">
                    {['new', 'cooking', 'delivery', 'done'].map(status => (
                        <div key={status} className="flex-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-3 lg:p-4 flex flex-col min-w-[200px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                                    {status === 'new' ? 'Новые' : status === 'cooking' ? 'Готовятся' : status === 'delivery' ? 'Доставка' : 'Завершены'}
                                </h3>
                                <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-bold dark:text-white">
                                    {orders.filter(o => o.status === status).length}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {orders.filter(o => o.status === status).map(order => (
                                    <div key={order.id} className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-sm border dark:border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm dark:text-white">#{order.id.slice(0,4)}</span>
                                            <span className="text-green-600 font-bold text-sm">{order.totalPrice} ₽</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                                            {order.items?.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                                        </div>
                                        <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </div>
                                        
                                        <div className="flex gap-1">
                                            {status !== 'done' && (
                                                <button 
                                                    onClick={() => updateStatusMutation.mutate({ 
                                                        orderId: order.id, 
                                                        status: status === 'new' ? 'cooking' : status === 'cooking' ? 'delivery' : 'done' 
                                                    })}
                                                    disabled={updateStatusMutation.isPending}
                                                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                >
                                                    {updateStatusMutation.isPending ? '...' : 'Next \u2192'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
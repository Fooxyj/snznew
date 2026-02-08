
// Comment above fix: Added React to imports to provide the React namespace for React.FC
import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, ShoppingBag, Calendar, MessageSquare, Eye, Loader2 } from 'lucide-react';
import { Business } from '../../types';
import { api } from '../../services/api';
import { DashboardWidgetSkeleton, ChartSkeleton } from '../ui/Skeleton';

interface CRMOverviewProps {
    business: Business;
}

export const CRMOverview: React.FC<CRMOverviewProps> = ({ business }) => {
    const businessId = business.id;
    const [isChartMounted, setIsChartMounted] = useState(false);

    useEffect(() => {
        // Увеличиваем задержку для гарантии завершения всех анимаций и пересчетов layout
        const timer = setTimeout(() => setIsChartMounted(true), 800);
        return () => clearTimeout(timer);
    }, []);

    const { data: products = [], isLoading: loadingProducts } = useQuery({
        queryKey: ['products', businessId],
        queryFn: () => api.getProducts(businessId)
    });

    const { data: services = [], isLoading: loadingServices } = useQuery({
        queryKey: ['services', businessId],
        queryFn: () => api.getServices(businessId)
    });

    const { data: bookings = [], isLoading: loadingBookings } = useQuery({
        queryKey: ['businessBookings', businessId],
        queryFn: () => api.getBusinessBookings(businessId)
    });

    // Получаем отзывы для списка, но для цифр используем данные из business
    const { data: reviews = [], isLoading: loadingReviews } = useQuery({
        queryKey: ['reviews', businessId],
        queryFn: () => api.getReviews(businessId)
    });

    const activityData = [
        { date: 'Пн', views: 45 },
        { date: 'Вт', views: 52 },
        { date: 'Ср', views: 38 },
        { date: 'Чт', views: 65 },
        { date: 'Пт', views: 48 },
        { date: 'Сб', views: 70 },
        { date: 'Вс', views: 55 },
    ];

    const isLoading = loadingProducts || loadingServices || loadingBookings || loadingReviews;

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {[1, 2, 3, 4].map(i => <DashboardWidgetSkeleton key={i} />)}
                </div>
                <div className="mt-8">
                    <ChartSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight hidden lg:block">Дашборд</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <ShoppingBag className="w-3.5 h-3.5" /> Витрина
                    </div>
                    <div className="text-3xl font-black dark:text-white leading-none">{products.length} <span className="text-xs font-bold text-gray-400">ед.</span></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <Calendar className="w-3.5 h-3.5" /> Услуги
                    </div>
                    <div className="text-3xl font-black text-blue-600 leading-none">{services.length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <MessageSquare className="w-3.5 h-3.5" /> Записи
                    </div>
                    <div className="text-3xl font-black text-purple-600 leading-none">{bookings.length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <Star className="w-3.5 h-3.5" /> Рейтинг
                    </div>
                    <div className="text-3xl font-black text-yellow-500 leading-none flex items-center gap-1.5">
                        {business.rating > 0 ? business.rating.toFixed(1) : '0.0'} 
                        <Star className="w-6 h-6 fill-current" />
                        <span className="text-sm font-bold text-gray-400 ml-1">({business.reviewsCount})</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 p-6 lg:p-10 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                   <div>
                       <h3 className="font-black text-lg dark:text-white uppercase tracking-tight flex items-center gap-2">
                           <Eye className="w-5 h-5 text-blue-600" /> Просмотры
                       </h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Активность за последние 7 дней</p>
                   </div>
               </div>
               
               {/* Обертка с жестко заданной высотой и min-width для предотвращения ошибок Recharts */}
               <div className="w-full h-[350px] min-h-[300px] relative overflow-hidden">
                   {isChartMounted ? (
                       <ResponsiveContainer width="100%" height="100%" debounce={50}>
                          <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.05} />
                             <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                stroke="#94a3b8" 
                                style={{ fontSize: '10px', fontWeight: 'bold' }} 
                                dy={10}
                             />
                             <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                stroke="#94a3b8" 
                                style={{ fontSize: '10px', fontWeight: 'bold' }} 
                             />
                             <Tooltip 
                                cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                                contentStyle={{ 
                                    borderRadius: '20px', 
                                    border: 'none', 
                                    backgroundColor: '#1e293b', 
                                    color: '#fff', 
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }} 
                             />
                             <Area 
                                type="monotone" 
                                dataKey="views" 
                                stroke="#2563eb" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorViews)" 
                                animationDuration={1000}
                             />
                          </AreaChart>
                       </ResponsiveContainer>
                   ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                           <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Аналитика...</span>
                       </div>
                   )}
               </div>
            </div>
        </div>
    );
};

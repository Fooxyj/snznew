
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, ShoppingBag, Calendar, MessageSquare, Eye } from 'lucide-react';
import { Business } from '../../types';
import { api } from '../../services/api';
import { DashboardWidgetSkeleton, ChartSkeleton } from '../ui/Skeleton';

interface CRMOverviewProps {
    business: Business;
}

export const CRMOverview: React.FC<CRMOverviewProps> = ({ business }) => {
    const businessId = business.id;

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

    const currentStats = useMemo(() => {
        if (!reviews || reviews.length === 0) return { rating: 0, count: 0 };
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        return {
            rating: parseFloat((sum / reviews.length).toFixed(1)),
            count: reviews.length
        };
    }, [reviews]);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in">
                <h1 className="text-2xl font-bold dark:text-white hidden lg:block">Обзор витрины</h1>
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
            <h1 className="text-2xl font-bold dark:text-white hidden lg:block">Обзор витрины</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white dark:bg-gray-800 p-5 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 text-xs lg:text-sm font-medium mb-1">
                        <ShoppingBag className="w-4 h-4" /> Товаров в каталоге
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{products.length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 text-xs lg:text-sm font-medium mb-1">
                        <Calendar className="w-4 h-4" /> Активных услуг
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-blue-600">{services.length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 text-xs lg:text-sm font-medium mb-1">
                        <MessageSquare className="w-4 h-4" /> Записей/Броней
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-purple-600">{bookings.length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 text-xs lg:text-sm font-medium mb-1">
                        <Star className="w-4 h-4" /> Рейтинг (отзывов: {currentStats.count})
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-yellow-500 flex items-center gap-2">
                        {currentStats.rating > 0 ? currentStats.rating : '—'} 
                        {currentStats.rating > 0 && <Star className="w-5 h-5 lg:w-6 lg:h-6 fill-current" />}
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm h-64 lg:h-80">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold dark:text-white flex items-center gap-2">
                       <Eye className="w-5 h-5 text-blue-500" /> Популярность витрины
                   </h3>
                   <span className="text-xs text-gray-400">Просмотры за неделю</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                     <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#6b7280" style={{ fontSize: '12px' }} />
                     <YAxis axisLine={false} tickLine={false} stroke="#6b7280" style={{ fontSize: '12px' }} />
                     <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1f2937', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                     <Area type="monotone" dataKey="views" stroke="#2563eb" fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
        </div>
    );
};

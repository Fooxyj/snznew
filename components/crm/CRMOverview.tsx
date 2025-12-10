
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';
import { Business } from '../../types';
import { api } from '../../services/api';
import { DashboardWidgetSkeleton, ChartSkeleton } from '../ui/Skeleton';

interface CRMOverviewProps {
    business: Business;
}

export const CRMOverview: React.FC<CRMOverviewProps> = ({ business }) => {
    const businessId = business.id;

    // Fetch data independently
    const { data: analytics = [], isLoading: loadingAnalytics } = useQuery({
        queryKey: ['businessAnalytics', businessId],
        queryFn: () => api.getBusinessAnalytics(businessId)
    });

    const { data: orders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ['businessOrders', businessId],
        queryFn: () => api.getBusinessOrders(businessId)
    });

    const { data: bookings = [], isLoading: loadingBookings } = useQuery({
        queryKey: ['businessBookings', businessId],
        queryFn: () => api.getBusinessBookings(businessId)
    });

    // Derived State with Memoization
    const { revenue, activeOrdersCount } = useMemo(() => {
        const rev = orders.filter(o => o.status === 'done').reduce((acc, o) => acc + o.totalPrice, 0);
        const active = orders.filter(o => o.status !== 'done').length;
        return { revenue: rev, activeOrdersCount: active };
    }, [orders]);

    const bookingsCount = useMemo(() => bookings.length, [bookings]);

    const isLoading = loadingAnalytics || loadingOrders || loadingBookings;

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in">
                <h1 className="text-2xl font-bold dark:text-white hidden lg:block">Обзор</h1>
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
            <h1 className="text-2xl font-bold dark:text-white hidden lg:block">Обзор</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white dark:bg-gray-800 p-5 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <div className="text-gray-500 text-xs lg:text-sm font-medium mb-1">Выручка (все время)</div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{revenue.toLocaleString()} ₽</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <div className="text-gray-500 text-xs lg:text-sm font-medium mb-1">Активные заказы</div>
                    <div className="text-2xl lg:text-3xl font-bold text-blue-600">{activeOrdersCount}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <div className="text-gray-500 text-xs lg:text-sm font-medium mb-1">Предстоящие записи</div>
                    <div className="text-2xl lg:text-3xl font-bold text-purple-600">{bookingsCount}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <div className="text-gray-500 text-xs lg:text-sm font-medium mb-1">Отзывы</div>
                    <div className="text-2xl lg:text-3xl font-bold text-yellow-500 flex items-center gap-2">
                        {business.rating} <Star className="w-5 h-5 lg:w-6 lg:h-6 fill-current" />
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="mt-8 bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm h-64 lg:h-80">
               <h3 className="font-bold mb-4 dark:text-white">Выручка за неделю</h3>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#6b7280" style={{ fontSize: '12px' }} />
                     <YAxis axisLine={false} tickLine={false} stroke="#6b7280" style={{ fontSize: '12px' }} />
                     <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                     <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
        </div>
    );
};


import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Business, Order, Booking } from '../types';
import { Button } from '../components/ui/Common';
import { Loader2, Package, Calendar, BarChart3, CheckCircle, ChefHat, Truck, Scan, QrCode } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const BusinessCRM: React.FC = () => {
    const [business, setBusiness] = useState<Business | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'stats' | 'scanner'>('orders');
    
    // Scanner
    const [qrInput, setQrInput] = useState('');
    const [scanResult, setScanResult] = useState<{valid: boolean, msg: string} | null>(null);

    const loadData = async () => {
        try {
            const biz = await api.getMyBusiness();
            setBusiness(biz);
            if (biz) {
                const [ord, bk] = await Promise.all([
                    api.getBusinessOrders(biz.id),
                    api.getBusinessBookings(biz.id)
                ]);
                setOrders(ord);
                setBookings(bk);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await api.updateOrderStatus(orderId, status);
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await api.validateTicket(qrInput);
        if (res.valid && res.ticket) {
            setScanResult({ valid: true, msg: `Билет действителен! Событие: ${res.ticket.eventTitle}. Место: Ряд ${res.ticket.row+1}, Место ${res.ticket.col+1}` });
        } else {
            setScanResult({ valid: false, msg: res.msg || 'Недействительно' });
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!business) return <div className="p-10 text-center">У вас нет бизнеса. Создайте его через профиль!</div>;

    // Stats Logic
    const statsData = orders.reduce((acc: any[], order) => {
        const date = new Date(order.createdAt).toLocaleDateString('ru-RU', {weekday: 'short'});
        const found = acc.find(a => a.name === date);
        if (found) found.total += order.totalPrice;
        else acc.push({ name: date, total: order.totalPrice });
        return acc;
    }, []).reverse().slice(0, 7);

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-20 lg:w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col shrink-0">
                <div className="p-6 border-b dark:border-gray-700 hidden lg:block">
                    <h2 className="font-bold text-gray-900 dark:text-white truncate">{business.name}</h2>
                    <p className="text-xs text-gray-500">CRM Система</p>
                </div>
                <div className="p-2 space-y-2 flex-1">
                    <button onClick={() => setActiveTab('orders')} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <Package className="w-5 h-5" /> <span className="hidden lg:inline">Заказы</span>
                    </button>
                    <button onClick={() => setActiveTab('bookings')} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <Calendar className="w-5 h-5" /> <span className="hidden lg:inline">Записи</span>
                    </button>
                    <button onClick={() => setActiveTab('stats')} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'stats' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <BarChart3 className="w-5 h-5" /> <span className="hidden lg:inline">Финансы</span>
                    </button>
                    <button onClick={() => setActiveTab('scanner')} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'scanner' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <Scan className="w-5 h-5" /> <span className="hidden lg:inline">Сканер</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                {activeTab === 'orders' && (
                    <>
                        <h1 className="text-2xl font-bold mb-6 dark:text-white">Управление заказами</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* NEW */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700 shadow-sm">
                                <h3 className="font-bold text-gray-500 mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> НОВЫЕ</h3>
                                <div className="space-y-3">
                                    {orders.filter(o => o.status === 'new').map(o => (
                                        <div key={o.id} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                                            <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                                <span>#{o.id.slice(0,4)}</span>
                                                <span>{o.totalPrice} ₽</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 space-y-1">
                                                {o.items?.map((i, idx) => <div key={idx}>{i.quantity} x {i.productName}</div>)}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-400">{o.address}</div>
                                            <Button size="sm" className="w-full mt-3" onClick={() => updateStatus(o.id, 'cooking')}>Принять в работу</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* COOKING */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700 shadow-sm">
                                <h3 className="font-bold text-gray-500 mb-4 flex items-center gap-2"><ChefHat className="w-4 h-4" /> ГОТОВЯТСЯ</h3>
                                <div className="space-y-3">
                                    {orders.filter(o => o.status === 'cooking').map(o => (
                                        <div key={o.id} className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-900">
                                            <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                                <span>#{o.id.slice(0,4)}</span>
                                                <span>{o.totalPrice} ₽</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {o.items?.length} позиций
                                            </div>
                                            <Button size="sm" variant="secondary" className="w-full mt-3" onClick={() => updateStatus(o.id, 'delivery')}>Вызвать курьера</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* DELIVERY */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700 shadow-sm">
                                <h3 className="font-bold text-gray-500 mb-4 flex items-center gap-2"><Truck className="w-4 h-4" /> ДОСТАВКА</h3>
                                <div className="space-y-3">
                                    {orders.filter(o => o.status === 'delivery').map(o => (
                                        <div key={o.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600 opacity-70">
                                            <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                                <span>#{o.id.slice(0,4)}</span>
                                                <span>{o.totalPrice} ₽</span>
                                            </div>
                                            <div className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                                                <Truck className="w-3 h-3" /> Курьер в пути
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'bookings' && (
                    <>
                        <h1 className="text-2xl font-bold mb-6 dark:text-white">Календарь записей</h1>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="p-4 text-gray-500 dark:text-gray-400">Дата</th>
                                            <th className="p-4 text-gray-500 dark:text-gray-400">Время</th>
                                            <th className="p-4 text-gray-500 dark:text-gray-400">Клиент</th>
                                            <th className="p-4 text-gray-500 dark:text-gray-400">Услуга</th>
                                            <th className="p-4 text-gray-500 dark:text-gray-400">Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {bookings.map(b => (
                                            <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="p-4 font-medium dark:text-white">{b.date}</td>
                                                <td className="p-4 dark:text-gray-300">{b.time}</td>
                                                <td className="p-4 dark:text-gray-300">{b.businessName}</td>
                                                <td className="p-4 text-blue-600 dark:text-blue-400">{b.serviceTitle}</td>
                                                <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Подтверждено</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'stats' && (
                    <>
                        <h1 className="text-2xl font-bold mb-6 dark:text-white">Финансы</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                                <p className="text-gray-500">Выручка за все время</p>
                                <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {orders.filter(o=>o.status==='done').reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString()} ₽
                                </h3>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                                <p className="text-gray-500">Всего заказов</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{orders.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 h-80">
                            <h3 className="font-bold mb-4 dark:text-white">Динамика выручки (последние 7 дней)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statsData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}

                {activeTab === 'scanner' && (
                    <div className="max-w-md mx-auto mt-10">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border dark:border-gray-700 text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <QrCode className="w-10 h-10 text-gray-500 dark:text-gray-300" />
                            </div>
                            <h2 className="text-xl font-bold mb-2 dark:text-white">Проверка билетов</h2>
                            <p className="text-gray-500 mb-6">Введите код билета вручную (симуляция сканера)</p>
                            
                            <form onSubmit={handleScan} className="space-y-4">
                                <input 
                                    className="w-full text-center text-xl tracking-widest p-3 border rounded-lg uppercase dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                    placeholder="SNZ-TICKET-..."
                                    value={qrInput}
                                    onChange={e => setQrInput(e.target.value)}
                                />
                                <Button className="w-full">Проверить</Button>
                            </form>

                            {scanResult && (
                                <div className={`mt-6 p-4 rounded-xl ${scanResult.valid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    <div className="font-bold flex items-center justify-center gap-2 mb-1">
                                        {scanResult.valid ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5" />}
                                        {scanResult.valid ? 'ДОСТУП РАЗРЕШЕН' : 'ОШИБКА'}
                                    </div>
                                    <p className="text-sm">{scanResult.msg}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Business, Order, Booking } from '../types';
import { Button } from '../components/ui/Common';
import { Loader2, Package, Calendar, BarChart3, CheckCircle, ChefHat, Truck, Scan, QrCode, Store, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const BusinessCRM: React.FC = () => {
    const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'stats' | 'scanner'>('orders');
    
    // Scanner
    const [qrInput, setQrInput] = useState('');
    const [scanResult, setScanResult] = useState<{valid: boolean, msg: string} | null>(null);

    // Initial Load: Get all businesses
    useEffect(() => {
        const init = async () => {
            try {
                const businesses = await api.getMyBusinesses();
                setMyBusinesses(businesses);
                if (businesses.length > 0) {
                    setSelectedBusiness(businesses[0]);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Fetch data when selected business changes
    useEffect(() => {
        const loadBizData = async () => {
            if (!selectedBusiness) return;
            setLoading(true);
            try {
                const [ord, bk] = await Promise.all([
                    api.getBusinessOrders(selectedBusiness.id),
                    api.getBusinessBookings(selectedBusiness.id)
                ]);
                setOrders(ord);
                setBookings(bk);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadBizData();
    }, [selectedBusiness]);

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

    const handleSwitchBusiness = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bizId = e.target.value;
        const found = myBusinesses.find(b => b.id === bizId);
        if (found) setSelectedBusiness(found);
    };

    if (loading && myBusinesses.length === 0) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (myBusinesses.length === 0) return <div className="p-10 text-center">У вас нет бизнеса. Создайте его через профиль!</div>;

    // Stats Logic
    const statsData = orders.reduce((acc: any[], order) => {
        const date = new Date(order.createdAt).toLocaleDateString('ru-RU', {weekday: 'short'});
        const found = acc.find(a => a.name === date);
        if (found) found.total += order.totalPrice;
        else acc.push({ name: date, total: order.totalPrice });
        return acc;
    }, []).reverse().slice(0, 7);

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC] dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-20 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 z-20">
                <div className="p-6 border-b border-gray-50 dark:border-gray-700 hidden lg:block">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Выбор компании</label>
                    <div className="relative">
                        <select 
                            className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white py-3 pl-4 pr-10 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow cursor-pointer"
                            onChange={handleSwitchBusiness}
                            value={selectedBusiness?.id}
                        >
                            {myBusinesses.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>
                
                <div className="p-3 space-y-1 flex-1">
                    <button onClick={() => setActiveTab('orders')} className={`w-full p-3.5 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <Package className="w-5 h-5" /> <span className="hidden lg:inline font-medium">Заказы</span>
                    </button>
                    <button onClick={() => setActiveTab('bookings')} className={`w-full p-3.5 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'bookings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <Calendar className="w-5 h-5" /> <span className="hidden lg:inline font-medium">Записи</span>
                    </button>
                    <button onClick={() => setActiveTab('stats')} className={`w-full p-3.5 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'stats' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <BarChart3 className="w-5 h-5" /> <span className="hidden lg:inline font-medium">Финансы</span>
                    </button>
                    <button onClick={() => setActiveTab('scanner')} className={`w-full p-3.5 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'scanner' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <Scan className="w-5 h-5" /> <span className="hidden lg:inline font-medium">Сканер</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-10">
                {activeTab === 'orders' && (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Заказы</h1>
                            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-500 border border-gray-100 dark:border-gray-700">
                                {orders.length} всего
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* NEW */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> Новые
                                </h3>
                                <div className="space-y-4">
                                    {orders.filter(o => o.status === 'new').map(o => (
                                        <div key={o.id} className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between font-bold text-gray-900 dark:text-white mb-2">
                                                <span>#{o.id.slice(0,4)}</span>
                                                <span className="text-blue-600 dark:text-blue-400">{o.totalPrice} ₽</span>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-3">
                                                {o.items?.map((i, idx) => <div key={idx}>{i.quantity} x {i.productName}</div>)}
                                            </div>
                                            <div className="text-xs text-gray-400 mb-4">{o.address}</div>
                                            <Button size="sm" className="w-full" onClick={() => updateStatus(o.id, 'cooking')}>Принять в работу</Button>
                                        </div>
                                    ))}
                                    {orders.filter(o => o.status === 'new').length === 0 && <p className="text-center text-gray-400 text-sm py-4">Нет новых заказов</p>}
                                </div>
                            </div>

                            {/* COOKING */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> Готовятся
                                </h3>
                                <div className="space-y-4">
                                    {orders.filter(o => o.status === 'cooking').map(o => (
                                        <div key={o.id} className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                            <div className="flex justify-between font-bold text-gray-900 dark:text-white mb-2">
                                                <span>#{o.id.slice(0,4)}</span>
                                                <span>{o.totalPrice} ₽</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                {o.items?.length} позиций
                                            </div>
                                            <Button size="sm" variant="secondary" className="w-full bg-white dark:bg-gray-800 dark:border-gray-600" onClick={() => updateStatus(o.id, 'delivery')}>Вызвать курьера</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* DELIVERY */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Доставка
                                </h3>
                                <div className="space-y-4">
                                    {orders.filter(o => o.status === 'delivery').map(o => (
                                        <div key={o.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 opacity-80">
                                            <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                                <span>#{o.id.slice(0,4)}</span>
                                                <span>{o.totalPrice} ₽</span>
                                            </div>
                                            <div className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1">
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
                        <h1 className="text-3xl font-bold mb-8 dark:text-white">Календарь записей</h1>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Дата</th>
                                            <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Время</th>
                                            <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Клиент</th>
                                            <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Услуга</th>
                                            <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {bookings.map(b => (
                                            <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="p-5 font-medium dark:text-white">{b.date}</td>
                                                <td className="p-5 dark:text-gray-300 font-mono">{b.time}</td>
                                                <td className="p-5 dark:text-gray-300 font-medium">{b.businessName}</td>
                                                <td className="p-5 text-blue-600 dark:text-blue-400 font-medium">{b.serviceTitle}</td>
                                                <td className="p-5"><span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">Подтверждено</span></td>
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
                        <h1 className="text-3xl font-bold mb-8 dark:text-white">Финансы</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Выручка за все время</p>
                                    <h3 className="text-4xl font-black text-blue-600 dark:text-blue-400">
                                        {orders.filter(o=>o.status==='done').reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString()} ₽
                                    </h3>
                                </div>
                                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Всего заказов</p>
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white">{orders.length}</h3>
                                </div>
                                <div className="absolute right-0 top-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-96">
                            <h3 className="font-bold mb-6 dark:text-white text-lg">Динамика выручки (последние 7 дней)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statsData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#1F2937', color: '#fff', borderRadius: '12px', border: 'none'}}
                                        itemStyle={{color: '#fff'}}
                                        cursor={{fill: '#F3F4F6'}}
                                    />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}

                {activeTab === 'scanner' && (
                    <div className="max-w-md mx-auto mt-10">
                        <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <QrCode className="w-12 h-12 text-gray-400 dark:text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3 dark:text-white">Проверка билетов</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">Введите код билета вручную (симуляция сканера)</p>
                            
                            <form onSubmit={handleScan} className="space-y-4">
                                <input 
                                    className="w-full text-center text-2xl tracking-widest p-4 border border-gray-200 dark:border-gray-600 rounded-xl uppercase dark:bg-gray-700 dark:text-white font-mono focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-shadow" 
                                    placeholder="SNZ-TICKET-..."
                                    value={qrInput}
                                    onChange={e => setQrInput(e.target.value)}
                                />
                                <Button className="w-full py-4 text-lg shadow-lg shadow-blue-500/30">Проверить билет</Button>
                            </form>

                            {scanResult && (
                                <div className={`mt-8 p-6 rounded-2xl animate-in zoom-in duration-200 ${scanResult.valid ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                    <div className="font-black text-lg flex items-center justify-center gap-2 mb-2">
                                        {scanResult.valid ? <CheckCircle className="w-6 h-6" /> : <Loader2 className="w-6 h-6" />}
                                        {scanResult.valid ? 'ДОСТУП РАЗРЕШЕН' : 'ОШИБКА'}
                                    </div>
                                    <p className="text-sm opacity-90">{scanResult.msg}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

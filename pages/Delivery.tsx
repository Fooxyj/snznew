import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { Button } from '../components/ui/Common';
import { Truck, MapPin, Package, Clock, DollarSign, CheckCircle, Navigation, Loader2 } from 'lucide-react';

export const DeliveryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [myDeliveries, setMyDeliveries] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [avail, mine] = await Promise.all([api.getDeliveryOrders(), api.getMyDeliveries()]);
            setAvailableOrders(avail);
            setMyDeliveries(mine);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Poll for new orders every 10 sec
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleTakeOrder = async (id: string) => {
        if (!confirm("Взять заказ в работу?")) return;
        try {
            await api.takeDelivery(id);
            alert("Заказ взят! Поспешите в ресторан.");
            loadData();
            setActiveTab('active');
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleComplete = async (id: string) => {
        if (!confirm("Заказ доставлен? Деньги будут зачислены.")) return;
        try {
            await api.completeDelivery(id);
            alert("Отличная работа! +150₽ на счет.");
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const activeOrders = myDeliveries.filter(o => o.status !== 'done');
    const historyOrders = myDeliveries.filter(o => o.status === 'done');

    if (loading && availableOrders.length === 0 && myDeliveries.length === 0) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Truck className="w-8 h-8" /> Снежинск Delivery
                    </h1>
                    <p className="opacity-90 max-w-xl">
                        Зарабатывайте, доставляя заказы из любимых ресторанов города.
                    </p>
                    <div className="mt-6 flex gap-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <div className="text-2xl font-bold">{activeOrders.length}</div>
                            <div className="text-xs opacity-80">Активных</div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <div className="text-2xl font-bold">{historyOrders.length * 150} ₽</div>
                            <div className="text-xs opacity-80">Заработано</div>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                    <Truck className="w-64 h-64" />
                </div>
            </div>

            <div className="flex border-b mb-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('available')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'available' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}
                >
                    <Package className="w-4 h-4" /> Доступные ({availableOrders.length})
                </button>
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'active' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}
                >
                    <Navigation className="w-4 h-4" /> В работе ({activeOrders.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'history' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}
                >
                    <CheckCircle className="w-4 h-4" /> История
                </button>
            </div>

            <div className="space-y-4">
                {activeTab === 'available' && (
                    availableOrders.length === 0 ? <p className="text-center py-10 text-gray-400">Нет свободных заказов. Ждем...</p> :
                    availableOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{order.businessName}</h3>
                                    <p className="text-gray-500 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.businessAddress || 'Центр'}</p>
                                </div>
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> {order.deliveryFee || 150} ₽
                                </div>
                            </div>
                            
                            <div className="border-l-2 border-gray-200 pl-4 py-2 my-4 relative">
                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-300"></div>
                                <div className="absolute -left-[5px] bottom-0 w-2 h-2 rounded-full bg-blue-500"></div>
                                <p className="text-xs text-gray-400 mb-1">Доставить:</p>
                                <p className="font-medium text-gray-900">{order.address}</p>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <span className="text-xs text-gray-400"><Clock className="w-3 h-3 inline mr-1" /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleTakeOrder(order.id)}>
                                    Взять заказ
                                </Button>
                            </div>
                        </div>
                    ))
                )}

                {activeTab === 'active' && (
                    activeOrders.length === 0 ? <p className="text-center py-10 text-gray-400">Вы пока не взяли ни одного заказа.</p> :
                    activeOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-xl border-2 border-green-500 shadow-md">
                            <div className="flex items-center gap-2 mb-4 text-green-700 font-bold">
                                <Loader2 className="w-5 h-5 animate-spin" /> В процессе выполнения
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">ЗАБРАТЬ ИЗ</p>
                                    <p className="font-bold text-lg">{order.businessName}</p>
                                    <p className="text-sm text-gray-600">{order.businessAddress}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-xs text-blue-500 mb-1">ОТВЕЗТИ КЛИЕНТУ</p>
                                    <p className="font-bold text-lg text-blue-900">{order.address}</p>
                                    <Button variant="outline" size="sm" className="mt-2 text-xs h-7 bg-white">Показать на карте</Button>
                                </div>
                            </div>

                            <Button className="w-full py-4 text-lg bg-green-600 hover:bg-green-700 text-white" onClick={() => handleComplete(order.id)}>
                                <CheckCircle className="w-6 h-6 mr-2" /> Заказ доставлен
                            </Button>
                        </div>
                    ))
                )}

                {activeTab === 'history' && (
                    historyOrders.length === 0 ? <p className="text-center py-10 text-gray-400">История пуста</p> :
                    historyOrders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl border flex items-center justify-between opacity-70">
                            <div>
                                <p className="font-bold text-gray-900">{order.businessName} -> {order.address}</p>
                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="font-bold text-green-600">
                                +{order.deliveryFee || 150} ₽
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
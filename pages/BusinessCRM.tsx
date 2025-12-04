
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Business, Order, Booking, Product, Service, Event, RentalItem } from '../types';
import { Button } from '../components/ui/Common';
import { 
    Loader2, Package, Calendar, BarChart3, CheckCircle, 
    Truck, Scan, ChevronDown, Settings, MapPin, 
    Star, ExternalLink, Save, Upload, DollarSign, Clock, 
    Phone, FileText, LayoutDashboard, Utensils, Scissors,
    Film, Repeat, Plus, Trash2, Edit3, Image as ImageIcon,
    Store
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CreateProductModal, CreateServiceModal, CreateRentalModal } from '../components/CRMModals';
import { CreateEventModal } from '../components/CreateEventModal';

// --- CONFIGURATION ---
const BUSINESS_CONFIG: Record<string, { tabs: string[], icon: any, label: string }> = {
    'Магазины': { tabs: ['overview', 'orders', 'products', 'settings'], icon: Package, label: 'Магазин' },
    'Кафе и рестораны': { tabs: ['overview', 'orders', 'bookings', 'products', 'settings'], icon: Utensils, label: 'Ресторан' },
    'Услуги': { tabs: ['overview', 'bookings', 'services', 'settings'], icon: Scissors, label: 'Сервис' },
    'Красота': { tabs: ['overview', 'bookings', 'services', 'settings'], icon: Scissors, label: 'Салон' },
    'Спорт': { tabs: ['overview', 'bookings', 'services', 'settings'], icon: Calendar, label: 'Спорт' },
    'Авто': { tabs: ['overview', 'bookings', 'services', 'products', 'settings'], icon: Truck, label: 'Авто' },
    'Кино': { tabs: ['overview', 'events', 'scanner', 'settings'], icon: Film, label: 'Кинотеатр' },
    'Аренда': { tabs: ['overview', 'rentals', 'bookings', 'settings'], icon: Repeat, label: 'Прокат' },
    'default': { tabs: ['overview', 'settings'], icon: LayoutDashboard, label: 'Бизнес' }
};

const TAB_LABELS: Record<string, string> = {
    'overview': 'Обзор',
    'orders': 'Заказы',
    'bookings': 'Записи',
    'products': 'Товары / Меню',
    'services': 'Услуги',
    'rentals': 'Активы',
    'events': 'Афиша',
    'scanner': 'Сканер',
    'settings': 'Настройки'
};

const TAB_ICONS: Record<string, any> = {
    'overview': BarChart3,
    'orders': Package,
    'bookings': Calendar,
    'products': Utensils,
    'services': Scissors,
    'rentals': Repeat,
    'events': Film,
    'scanner': Scan,
    'settings': Settings
};

export const BusinessCRM: React.FC = () => {
    const navigate = useNavigate();
    
    // Global State
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Data State
    const [orders, setOrders] = useState<Order[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [rentals, setRentals] = useState<RentalItem[]>([]);

    // Modals
    const [modal, setModal] = useState<'product' | 'service' | 'rental' | 'event' | null>(null);

    // Settings State
    const [editForm, setEditForm] = useState<Partial<Business>>({});
    const [savingSettings, setSavingSettings] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            try {
                const myBiz = await api.getMyBusinesses();
                setBusinesses(myBiz);
                if (myBiz.length > 0) {
                    setSelectedBusiness(myBiz[0]);
                    setEditForm(myBiz[0]);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Load Business Data
    useEffect(() => {
        if (!selectedBusiness) return;
        
        const config = BUSINESS_CONFIG[selectedBusiness.category] || BUSINESS_CONFIG['default'];
        if (!config.tabs.includes(activeTab)) {
            setActiveTab('overview');
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const id = selectedBusiness.id;
                // Fetch all potential data. In a real app, lazy load based on tab.
                const [ord, bk, pr, sv, ev, rn] = await Promise.all([
                    api.getBusinessOrders(id),
                    api.getBusinessBookings(id),
                    api.getProducts(id),
                    api.getServices(id),
                    api.getEventsByAuthor(selectedBusiness.authorId || ''),
                    api.getRentalsByAuthor(selectedBusiness.authorId || '')
                ]);
                
                setOrders(ord);
                setBookings(bk);
                setProducts(pr);
                setServices(sv);
                setEvents(ev);
                setRentals(rn);
                setEditForm(selectedBusiness);
            } catch (e) {
                console.error("Error fetching business data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedBusiness]);

    const handleSwitchBusiness = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const found = businesses.find(b => b.id === e.target.value);
        if (found) setSelectedBusiness(found);
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await api.updateOrderStatus(orderId, status);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
        } catch (e: any) { alert(e.message); }
    };

    const handleDelete = async (type: 'product' | 'service' | 'event' | 'rental', id: string) => {
        if (!confirm("Вы уверены?")) return;
        try {
            if (type === 'product') { await api.deleteProduct(id); setProducts(p => p.filter(x => x.id !== id)); }
            if (type === 'service') { await api.deleteService(id); setServices(s => s.filter(x => x.id !== id)); }
            if (type === 'event') { await api.deleteEvent(id); setEvents(e => e.filter(x => x.id !== id)); }
        } catch (e: any) { alert(e.message); }
    };

    const handleSaveSettings = async () => {
        if (!selectedBusiness) return;
        setSavingSettings(true);
        try {
            await api.updateBusiness(selectedBusiness.id, editForm);
            const updated = { ...selectedBusiness, ...editForm } as Business;
            setSelectedBusiness(updated);
            setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b));
            alert("Сохранено!");
        } catch (e: any) { alert(e.message); } finally { setSavingSettings(false); }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const url = await api.uploadImage(file);
            setEditForm(prev => ({ ...prev, image: url }));
        } catch (e: any) { alert(e.message); } finally { setUploadingImage(false); }
    };

    if (businesses.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                    <Store className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">У вас нет бизнеса</h2>
                <p className="text-gray-500 mb-6">Создайте компанию, чтобы управлять заказами и клиентами.</p>
                <Link to="/business-connect">
                    <Button>Создать бизнес</Button>
                </Link>
            </div>
        );
    }

    if (!selectedBusiness) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    const config = BUSINESS_CONFIG[selectedBusiness.category] || BUSINESS_CONFIG['default'];
    const revenue = orders.filter(o => o.status === 'done').reduce((acc, o) => acc + o.totalPrice, 0);

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC] dark:bg-gray-900 overflow-hidden">
            {/* --- Modals --- */}
            {selectedBusiness && (
                <>
                    <CreateProductModal businessId={selectedBusiness.id} isOpen={modal === 'product'} onClose={() => setModal(null)} onSuccess={() => window.location.reload()} />
                    <CreateServiceModal businessId={selectedBusiness.id} isOpen={modal === 'service'} onClose={() => setModal(null)} onSuccess={() => window.location.reload()} />
                    <CreateRentalModal isOpen={modal === 'rental'} onClose={() => setModal(null)} onSuccess={() => window.location.reload()} />
                    <CreateEventModal isOpen={modal === 'event'} onClose={() => setModal(null)} onSuccess={() => window.location.reload()} />
                </>
            )}

            {/* --- Sidebar --- */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col shrink-0 z-20">
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="relative">
                        <select 
                            className="w-full appearance-none bg-gray-100 dark:bg-gray-700 border-none rounded-xl py-3 pl-4 pr-10 font-bold text-gray-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                            value={selectedBusiness.id}
                            onChange={handleSwitchBusiness}
                        >
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-4 h-4" />
                    </div>
                    <Link to="/business-connect" className="text-xs text-blue-600 font-medium mt-2 block text-center hover:underline">+ Добавить бизнес</Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {config.tabs.map(tab => {
                        const Icon = TAB_ICONS[tab] || CheckCircle;
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                {TAB_LABELS[tab]}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <img src={selectedBusiness.image} className="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="" />
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{selectedBusiness.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 mr-1 fill-current" /> {selectedBusiness.rating}
                            </div>
                        </div>
                    </div>
                    <Link to={`/business/${selectedBusiness.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-3 dark:border-gray-600 dark:text-gray-300">
                            <ExternalLink className="w-3 h-3 mr-2" /> Открыть страницу
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in">
                        <h1 className="text-2xl font-bold dark:text-white">Обзор</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                                <div className="text-gray-500 text-sm font-medium mb-1">Выручка (все время)</div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">{revenue.toLocaleString()} ₽</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                                <div className="text-gray-500 text-sm font-medium mb-1">Активные заказы</div>
                                <div className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status !== 'done').length}</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                                <div className="text-gray-500 text-sm font-medium mb-1">Предстоящие записи</div>
                                <div className="text-3xl font-bold text-purple-600">{bookings.length}</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                                <div className="text-gray-500 text-sm font-medium mb-1">Отзывы</div>
                                <div className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
                                    {selectedBusiness.rating} <Star className="w-6 h-6 fill-current" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ORDERS TAB (Kanban) */}
                {activeTab === 'orders' && (
                    <div className="h-full flex flex-col animate-in fade-in">
                        <h1 className="text-2xl font-bold dark:text-white mb-6">Управление заказами</h1>
                        <div className="flex-1 overflow-x-auto">
                            <div className="flex gap-6 min-w-[1000px] h-full pb-4">
                                {['new', 'cooking', 'delivery', 'done'].map(status => (
                                    <div key={status} className="flex-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                                                {status === 'new' ? 'Новые' : status === 'cooking' ? 'Готовятся' : status === 'delivery' ? 'Доставка' : 'Завершены'}
                                            </h3>
                                            <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-bold dark:text-white">
                                                {orders.filter(o => o.status === status).length}
                                            </span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-3">
                                            {orders.filter(o => o.status === status).map(order => (
                                                <div key={order.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
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
                                                                onClick={() => handleUpdateStatus(order.id, status === 'new' ? 'cooking' : status === 'cooking' ? 'delivery' : 'done')}
                                                                className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                                                            >
                                                                Next &rarr;
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
                )}

                {/* BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                    <div className="animate-in fade-in">
                        <h1 className="text-2xl font-bold dark:text-white mb-6">Записи клиентов</h1>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold uppercase text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Клиент</th>
                                        <th className="px-6 py-4">Услуга</th>
                                        <th className="px-6 py-4">Дата и Время</th>
                                        <th className="px-6 py-4">Статус</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
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
                    </div>
                )}

                {/* PRODUCTS / SERVICES / RENTALS / EVENTS TAB */}
                {['products', 'services', 'rentals', 'events'].includes(activeTab) && (
                    <div className="animate-in fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold dark:text-white">{TAB_LABELS[activeTab]}</h1>
                            <Button onClick={() => setModal(activeTab === 'products' ? 'product' : activeTab === 'services' ? 'service' : activeTab === 'rentals' ? 'rental' : 'event')}>
                                <Plus className="w-4 h-4 mr-2" /> Добавить
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(activeTab === 'products' ? products : activeTab === 'services' ? services : activeTab === 'events' ? events : rentals).map((item: any) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex gap-4">
                                    {item.image && <img src={item.image} className="w-20 h-20 rounded-lg object-cover bg-gray-100" alt="" />}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold dark:text-white truncate">{item.name || item.title}</h3>
                                            <button onClick={() => handleDelete(activeTab === 'products' ? 'product' : activeTab === 'services' ? 'service' : 'event', item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.price || item.pricePerDay} ₽</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl animate-in fade-in">
                        <h1 className="text-2xl font-bold dark:text-white mb-6">Настройки бизнеса</h1>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Название</label>
                                <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Описание</label>
                                <textarea rows={3} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
                                    <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Часы работы</label>
                                    <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editForm.workHours || ''} onChange={e => setEditForm({...editForm, workHours: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                {editForm.image && <img src={editForm.image} alt="" className="h-32 mx-auto rounded object-cover mb-2" />}
                                <div className="relative cursor-pointer">
                                    <span className="text-sm text-blue-600 hover:underline">{uploadingImage ? 'Загрузка...' : 'Изменить фото'}</span>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                </div>
                            </div>

                            <Button className="w-full" onClick={handleSaveSettings} disabled={savingSettings}>
                                {savingSettings ? <Loader2 className="animate-spin" /> : 'Сохранить изменения'}
                            </Button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

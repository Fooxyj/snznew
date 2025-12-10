
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { CRMOverview } from '../components/crm/CRMOverview';
import { CRMOrders } from '../components/crm/CRMOrders';
import { CRMBookings } from '../components/crm/CRMBookings';
import { CRMInventory } from '../components/crm/CRMInventory';
import { CRMEmployees } from '../components/crm/CRMEmployees';
import { CRMMarketing } from '../components/crm/CRMMarketing';
import { CRMSettings } from '../components/crm/CRMSettings';
import { CreateProductModal, CreateServiceModal, CreateRentalModal } from '../components/CRMModals';
import { CreateEventModal } from '../components/CreateEventModal';
import { Loader2, LayoutDashboard, ShoppingBag, Calendar, Users, Settings, Megaphone, Menu, X, LogOut, Film, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BusinessCRM: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'bookings' | 'products' | 'services' | 'employees' | 'marketing' | 'settings' | 'rentals' | 'events'>('overview');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [modal, setModal] = useState<'product' | 'service' | 'rental' | 'event' | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: businesses = [], isLoading } = useQuery({
        queryKey: ['myBusinesses'],
        queryFn: api.getMyBusinesses
    });

    const selectedBusiness = businesses[0];

    const { data: products = [] } = useQuery({
        queryKey: ['products', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getProducts(selectedBusiness.id) : [],
        enabled: !!selectedBusiness
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getServices(selectedBusiness.id) : [],
        enabled: !!selectedBusiness
    });

    const { data: bookings = [] } = useQuery({
        queryKey: ['businessBookings', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getBusinessBookings(selectedBusiness.id) : [],
        enabled: !!selectedBusiness
    });

    const { data: tables = [] } = useQuery({
        queryKey: ['tables', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getBusinessTables(selectedBusiness.id) : [],
        enabled: !!selectedBusiness
    });

    const { data: rentals = [] } = useQuery({
        queryKey: ['rentals', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getRentalsByAuthor(selectedBusiness.authorId || '') : [],
        enabled: !!selectedBusiness
    });

    const { data: events = [] } = useQuery({
        queryKey: ['cinemaEvents', selectedBusiness?.authorId],
        queryFn: () => selectedBusiness ? api.getEventsByAuthor(selectedBusiness.authorId || '') : [],
        enabled: !!selectedBusiness
    });

    const refetchProducts = () => queryClient.invalidateQueries({ queryKey: ['products', selectedBusiness?.id] });
    const refetchServices = () => queryClient.invalidateQueries({ queryKey: ['services', selectedBusiness?.id] });
    const refetchRentals = () => queryClient.invalidateQueries({ queryKey: ['rentals', selectedBusiness?.id] });
    const refetchEvents = () => queryClient.invalidateQueries({ queryKey: ['cinemaEvents', selectedBusiness?.authorId] });

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    
    if (!selectedBusiness) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 text-center">
                <h2 className="text-xl font-bold mb-4 dark:text-white">У вас нет бизнеса</h2>
                <button onClick={() => navigate('/business-connect')} className="bg-blue-600 text-white px-6 py-2 rounded-xl">
                    Создать бизнес
                </button>
            </div>
        );
    }

    const menuItems = [
        { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
        { id: 'orders', label: 'Заказы', icon: ShoppingBag },
        { id: 'bookings', label: 'Бронирование', icon: Calendar },
        { id: 'products', label: 'Товары / Меню', icon: ShoppingBag },
        { id: 'services', label: 'Услуги', icon: Calendar },
        { id: 'employees', label: 'Сотрудники', icon: Users },
        { id: 'marketing', label: 'Маркетинг', icon: Megaphone },
        { id: 'settings', label: 'Настройки', icon: Settings },
    ];

    // Conditional Menu Items
    if (selectedBusiness.category === 'Аренда') {
        menuItems.push({ id: 'rentals', label: 'Аренда', icon: Repeat });
    }
    if (selectedBusiness.category === 'Кино') {
        menuItems.push({ id: 'events', label: 'Афиша', icon: Film });
    }

    const handleDeleteProduct = async (id: string) => {
        if(confirm('Удалить товар?')) {
            await api.deleteProduct(id);
            refetchProducts();
        }
    };

    const handleDeleteService = async (id: string) => {
        if(confirm('Удалить услугу?')) {
            await api.deleteService(id);
            refetchServices();
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-[#F8FAFC] dark:bg-gray-900 overflow-hidden">
            {/* --- Modals --- */}
            {selectedBusiness && (
                <>
                    <CreateProductModal businessId={selectedBusiness.id} isOpen={modal === 'product'} onClose={() => setModal(null)} onSuccess={refetchProducts} />
                    <CreateServiceModal businessId={selectedBusiness.id} isOpen={modal === 'service'} onClose={() => setModal(null)} onSuccess={refetchServices} />
                    <CreateRentalModal isOpen={modal === 'rental'} onClose={() => setModal(null)} onSuccess={refetchRentals} />
                    <CreateEventModal isOpen={modal === 'event'} onClose={() => setModal(null)} onSuccess={() => refetchEvents()} />
                </>
            )}

            {/* --- Mobile Sidebar Toggle --- */}
            <div className="lg:hidden p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">{selectedBusiness.name}</span>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {isSidebarOpen ? <X className="w-5 h-5 dark:text-white" /> : <Menu className="w-5 h-5 dark:text-white" />}
                </button>
            </div>

            {/* --- Sidebar --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b dark:border-gray-700 hidden lg:block">
                    <h2 className="text-xl font-bold truncate dark:text-white">{selectedBusiness.name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Панель управления</p>
                </div>
                
                <nav className="p-4 space-y-1 overflow-y-auto h-full lg:h-[calc(100%-80px)]">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                            {item.label}
                        </button>
                    ))}
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 mt-4"
                    >
                        <LogOut className="w-5 h-5 mr-3 text-gray-400" />
                        Выйти в профиль
                    </button>
                </nav>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 overflow-auto p-4 lg:p-8 relative" onClick={() => setSidebarOpen(false)}>
                {activeTab === 'overview' && <CRMOverview business={selectedBusiness} />}
                
                {activeTab === 'orders' && <CRMOrders businessId={selectedBusiness.id} />}
                
                {activeTab === 'bookings' && (
                    <CRMBookings 
                        bookings={bookings} 
                        tables={tables} 
                        viewMode="list" 
                        onChangeView={() => {}} 
                        onTableClick={() => {}} 
                    />
                )}
                
                {activeTab === 'products' && (
                    <CRMInventory 
                        items={products} 
                        type="products" 
                        label="Товары" 
                        onAdd={() => setModal('product')} 
                        onDelete={handleDeleteProduct} 
                    />
                )}

                {activeTab === 'services' && (
                    <CRMInventory 
                        items={services} 
                        type="services" 
                        label="Услуги" 
                        onAdd={() => setModal('service')} 
                        onDelete={handleDeleteService} 
                    />
                )}

                {activeTab === 'employees' && <CRMEmployees businessId={selectedBusiness.id} />}
                
                {activeTab === 'marketing' && <CRMMarketing businessId={selectedBusiness.id} />}
                
                {activeTab === 'settings' && <CRMSettings business={selectedBusiness} />}

                {activeTab === 'rentals' && (
                    <CRMInventory 
                        items={rentals} 
                        type="rentals" 
                        label="Аренда" 
                        onAdd={() => setModal('rental')} 
                        onDelete={async (id) => {/* impl delete rental */}} 
                    />
                )}

                {activeTab === 'events' && (
                    <CRMInventory 
                        items={events} 
                        type="events" 
                        label="Афиша" 
                        onAdd={() => setModal('event')} 
                        onDelete={async (id) => { await api.deleteEvent(id); refetchEvents(); }} 
                    />
                )}
            </main>
        </div>
    );
};

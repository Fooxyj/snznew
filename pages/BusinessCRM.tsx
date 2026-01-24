
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, Service, UserRole } from '../types';
import { CRMOverview } from '../components/crm/CRMOverview';
import { CRMBookings } from '../components/crm/CRMBookings';
import { CRMInventory } from '../components/crm/CRMInventory';
import { CRMEmployees } from '../components/crm/CRMEmployees';
import { CRMMarketing } from '../components/crm/CRMMarketing';
import { CRMSettings } from '../components/crm/CRMSettings';
import { MiniSiteBuilder } from '../components/builder/MiniSiteBuilder';
import { CreateProductModal, CreateServiceModal, CreateRentalModal, EditProductModal } from '../components/CRMModals';
import { CreateEventModal } from '../components/CreateEventModal';
import { StoryEditor } from '../components/StoryEditor';
import { Loader2, LayoutDashboard, ShoppingBag, Calendar, Users, Settings, Megaphone, Menu, X, LogOut, Film, Repeat, ChevronDown, PlusCircle, Check, PlaySquare, Layout as LayoutIcon, Briefcase, Hammer, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BusinessCRM: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'products' | 'services' | 'employees' | 'marketing' | 'settings' | 'rentals' | 'events' | 'minisite'>('overview');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [modal, setModal] = useState<'product' | 'service' | 'rental' | 'event' | 'editProduct' | 'story' | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
    const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });

    const { data: businesses = [], isLoading, isFetching } = useQuery({
        queryKey: ['myBusinesses'],
        queryFn: api.getMyBusinesses,
        staleTime: 0
    });

    useEffect(() => {
        if (!isLoading && businesses.length > 0 && !selectedBusinessId) {
            setSelectedBusinessId(businesses[0].id);
        }
    }, [businesses, selectedBusinessId, isLoading]);

    const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];
    const isMaster = selectedBusiness?.isMaster;

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

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setModal('editProduct');
    };

    const menuItems = useMemo(() => {
        const items = [
            { id: 'overview', label: isMaster ? 'Мой Профиль' : 'Обзор витрины', icon: LayoutDashboard },
            { id: 'products', label: isMaster ? 'Мои работы' : 'Товары / Меню', icon: isMaster ? Hammer : ShoppingBag },
            { id: 'services', label: 'Услуги и Прайс', icon: Briefcase },
            { id: 'bookings', label: 'Записи клиентов', icon: Calendar },
        ];

        // Для бизнеса добавляем расширенные функции
        if (!isMaster) {
            items.push({ id: 'minisite', label: 'Мой Мини-сайт', icon: LayoutIcon });
            items.push({ id: 'employees', label: 'Сотрудники', icon: Users });
            items.push({ id: 'marketing', label: 'Продвижение', icon: Megaphone });
        }

        items.push({ id: 'settings', label: 'Настройки', icon: Settings });

        if (selectedBusiness?.category === 'Аренда') items.push({ id: 'rentals', label: 'Аренда', icon: Repeat });
        if (selectedBusiness?.category === 'Кино') items.push({ id: 'events', label: 'Афиша', icon: Film });

        return items;
    }, [isMaster, selectedBusiness]);

    const handleDeleteProduct = async (id: string) => {
        if(confirm('Удалить позицию?')) {
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

    if (isLoading || (isFetching && !selectedBusiness)) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    }
    
    if (!selectedBusiness) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 text-center">
                <h2 className="text-xl font-bold mb-4 dark:text-white">У вас нет активного кабинета</h2>
                <p className="text-gray-500 mb-6">Создайте компанию или профиль мастера, чтобы управлять ими здесь.</p>
                <button onClick={() => navigate('/business-connect')} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors font-bold uppercase text-xs tracking-widest">
                    Подключить аккаунт
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-[#F8FAFC] dark:bg-gray-900 overflow-hidden">
            {selectedBusiness && (
                <>
                    <CreateProductModal businessId={selectedBusiness.id} isOpen={modal === 'product'} onClose={() => setModal(null)} onSuccess={refetchProducts} />
                    {editingProduct && <EditProductModal product={editingProduct} isOpen={modal === 'editProduct'} onClose={() => { setModal(null); setEditingProduct(null); }} onSuccess={refetchProducts} />}
                    <CreateServiceModal businessId={selectedBusiness.id} isOpen={modal === 'service'} onClose={() => setModal(null)} onSuccess={refetchServices} />
                    <CreateRentalModal isOpen={modal === 'rental'} onClose={() => setModal(null)} onSuccess={refetchRentals} />
                    <CreateEventModal isOpen={modal === 'event'} onClose={() => setModal(null)} onSuccess={() => refetchEvents()} />
                    {modal === 'story' && (
                        <div className="fixed inset-0 z-[10000] bg-black">
                            <StoryEditor 
                                onSave={async (media, caption, config) => {
                                    await api.createStory(media, caption, selectedBusiness.id, config);
                                    setModal(null);
                                    queryClient.invalidateQueries({ queryKey: ['stories'] });
                                }} 
                                onClose={() => setModal(null)} 
                            />
                        </div>
                    )}
                </>
            )}

            <div className="lg:hidden p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2" onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}>
                    <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{selectedBusiness.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {isSidebarOpen ? <X className="w-5 h-5 dark:text-white" /> : <Menu className="w-5 h-5 dark:text-white" />}
                </button>
            </div>

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="flex flex-col items-start p-2">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{isMaster ? 'ПРОФИЛЬ МАСТЕРА' : 'БИЗНЕС-АККАУНТ'}</span>
                        <span className="font-bold text-gray-900 dark:text-white truncate w-full text-left">{selectedBusiness.name}</span>
                    </div>
                </div>
                
                <nav className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                    {menuItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === item.id ? (isMaster ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-blue-600 text-white shadow-md shadow-blue-500/20') : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                            <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            {item.label}
                        </button>
                    ))}
                    
                    {user?.role === UserRole.ADMIN && (
                        <div className="pt-4 mt-4 border-t dark:border-gray-700">
                            <button 
                                onClick={() => setModal('story')}
                                className="w-full flex items-center px-4 py-3 text-sm font-black rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all uppercase tracking-tighter shadow-sm border border-blue-100 dark:border-blue-900/50"
                            >
                                <PlaySquare className="w-5 h-5 mr-3 fill-blue-600/10" />
                                Опубликовать историю
                            </button>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t dark:border-gray-700">
                    <button onClick={() => navigate('/profile')} className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                        <LogOut className="w-5 h-5 mr-3" />
                        Выйти в профиль
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto p-4 lg:p-8 relative" onClick={() => { setSidebarOpen(false); setIsBusinessDropdownOpen(false); }}>
                {activeTab === 'overview' && <CRMOverview business={selectedBusiness} />}
                {activeTab === 'minisite' && <MiniSiteBuilder businessId={selectedBusiness.id} />}
                {activeTab === 'bookings' && <CRMBookings bookings={bookings} tables={tables} viewMode="list" onChangeView={() => {}} onTableClick={() => {}} />}
                {activeTab === 'products' && <CRMInventory items={products} type="products" label={isMaster ? "Работы" : "Товары"} onAdd={() => setModal('product')} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />}
                {activeTab === 'services' && <CRMInventory items={services} type="services" label="Услуги" onAdd={() => setModal('service')} onDelete={handleDeleteService} />}
                {activeTab === 'employees' && <CRMEmployees businessId={selectedBusiness.id} />}
                {activeTab === 'marketing' && <CRMMarketing businessId={selectedBusiness.id} />}
                {activeTab === 'settings' && <CRMSettings business={selectedBusiness} />}
                {activeTab === 'rentals' && <CRMInventory items={rentals} type="rentals" label="Аренда" onAdd={() => setModal('rental')} onDelete={async (id) => { await api.deleteRental(id); refetchRentals(); }} />}
                {activeTab === 'events' && <CRMInventory items={events} type="events" label="Афиша" onAdd={() => setModal('event')} onDelete={async (id) => { await api.deleteEvent(id); refetchEvents(); }} />}
            </main>
        </div>
    );
};

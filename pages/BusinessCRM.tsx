
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, Service } from '../types';
import { CRMOverview } from '../components/crm/CRMOverview';
import { CRMBookings } from '../components/crm/CRMBookings';
import { CRMInventory } from '../components/crm/CRMInventory';
import { CRMEmployees } from '../components/crm/CRMEmployees';
import { CRMMarketing } from '../components/crm/CRMMarketing';
import { CRMSettings } from '../components/crm/CRMSettings';
import { CreateProductModal, CreateServiceModal, CreateRentalModal, EditProductModal } from '../components/CRMModals';
import { CreateEventModal } from '../components/CreateEventModal';
import { StoryEditor } from '../components/StoryEditor';
import { Loader2, LayoutDashboard, ShoppingBag, Calendar, Users, Settings, Megaphone, Menu, X, LogOut, Film, Repeat, ChevronDown, PlusCircle, Check, PlaySquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BusinessCRM: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'products' | 'services' | 'employees' | 'marketing' | 'settings' | 'rentals' | 'events'>('overview');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [modal, setModal] = useState<'product' | 'service' | 'rental' | 'event' | 'editProduct' | 'story' | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
    const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

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

    if (isLoading || (isFetching && !selectedBusiness)) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    }
    
    if (!selectedBusiness) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 text-center">
                <h2 className="text-xl font-bold mb-4 dark:text-white">У вас нет бизнеса</h2>
                <p className="text-gray-500 mb-6">Создайте компанию, чтобы управлять ей здесь.</p>
                <button onClick={() => navigate('/business-connect')} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                    Создать бизнес
                </button>
            </div>
        );
    }

    const menuItems = [
        { id: 'overview', label: 'Обзор витрины', icon: LayoutDashboard },
        { id: 'products', label: 'Товары / Меню', icon: ShoppingBag },
        { id: 'services', label: 'Услуги', icon: Calendar },
        { id: 'bookings', label: 'Записи клиентов', icon: Users },
        { id: 'employees', label: 'Сотрудники', icon: Users },
        { id: 'marketing', label: 'Продвижение', icon: Megaphone },
        { id: 'settings', label: 'Профиль компании', icon: Settings },
    ];

    if (selectedBusiness.category === 'Аренда') menuItems.push({ id: 'rentals', label: 'Аренда', icon: Repeat });
    if (selectedBusiness.category === 'Кино') menuItems.push({ id: 'events', label: 'Афиша', icon: Film });

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

    const handleSwitchBusiness = (id: string) => {
        setSelectedBusinessId(id);
        setIsBusinessDropdownOpen(false);
        setActiveTab('overview');
    };

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
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {isSidebarOpen ? <X className="w-5 h-5 dark:text-white" /> : <Menu className="w-5 h-5 dark:text-white" />}
                </button>
            </div>

            {isBusinessDropdownOpen && (
                <div className="lg:hidden absolute top-[65px] left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-xl p-2 animate-in slide-in-from-top-5">
                    {businesses.map(b => (
                        <button key={b.id} onClick={() => handleSwitchBusiness(b.id)} className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 ${selectedBusinessId === b.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            <span className="font-medium truncate">{b.name}</span>
                            {selectedBusinessId === b.id && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                    <button onClick={() => navigate('/business-connect')} className="w-full flex items-center p-3 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium">
                        <PlusCircle className="w-4 h-4 mr-2" /> Добавить бизнес
                    </button>
                </div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="p-4 border-b dark:border-gray-700 hidden lg:block relative">
                    <button onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <div className="flex flex-col items-start min-w-0">
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Бизнес</span>
                            <span className="font-bold text-gray-900 dark:text-white truncate w-full text-left">{selectedBusiness.name}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isBusinessDropdownOpen && (
                        <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                                {businesses.map(b => (
                                    <button key={b.id} onClick={() => handleSwitchBusiness(b.id)} className={`w-full flex items-center justify-between p-2.5 rounded-lg mb-1 text-sm ${selectedBusinessId === b.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}>
                                        <div className="flex items-center gap-2 truncate">
                                            {b.image && <img src={b.image} className="w-5 h-5 rounded-full object-cover" alt="" />}
                                            <span className="truncate">{b.name}</span>
                                        </div>
                                        {selectedBusinessId === b.id && <Check className="w-3 h-3 shrink-0" />}
                                    </button>
                                ))}
                            </div>
                            <div className="p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                <button onClick={() => navigate('/business-connect')} className="w-full flex items-center justify-center p-2 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                    <PlusCircle className="w-3 h-3 mr-1.5" /> Добавить компанию
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <nav className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                    {menuItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                            <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            {item.label}
                        </button>
                    ))}
                    
                    <div className="pt-4 mt-4 border-t dark:border-gray-700">
                        <button 
                            onClick={() => setModal('story')}
                            className="w-full flex items-center px-4 py-3 text-sm font-black rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all uppercase tracking-tighter shadow-sm border border-blue-100 dark:border-blue-900/50"
                        >
                            <PlaySquare className="w-5 h-5 mr-3 fill-blue-600/10" />
                            Опубликовать историю
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t dark:border-gray-700">
                    <button onClick={() => navigate('/profile')} className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                        <LogOut className="w-5 h-5 mr-3" />
                        Выйти в профиль
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto p-4 lg:p-8 relative" onClick={() => { setSidebarOpen(false); setIsBusinessDropdownOpen(false); }}>
                {activeTab === 'overview' && <CRMOverview key={selectedBusiness.id} business={selectedBusiness} />}
                {activeTab === 'bookings' && <CRMBookings key={selectedBusiness.id} bookings={bookings} tables={tables} viewMode="list" onChangeView={() => {}} onTableClick={() => {}} />}
                {activeTab === 'products' && <CRMInventory key={selectedBusiness.id} items={products} type="products" label="Товары" onAdd={() => setModal('product')} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />}
                {activeTab === 'services' && <CRMInventory key={selectedBusiness.id} items={services} type="services" label="Услуги" onAdd={() => setModal('service')} onDelete={handleDeleteService} />}
                {activeTab === 'employees' && <CRMEmployees key={selectedBusiness.id} businessId={selectedBusiness.id} />}
                {activeTab === 'marketing' && <CRMMarketing key={selectedBusiness.id} businessId={selectedBusiness.id} />}
                {activeTab === 'settings' && <CRMSettings key={selectedBusiness.id} business={selectedBusiness} />}
                {activeTab === 'rentals' && <CRMInventory key={selectedBusiness.id} items={rentals} type="rentals" label="Аренда" onAdd={() => setModal('rental')} onDelete={async (id) => { await api.deleteRental(id); refetchRentals(); }} />}
                {activeTab === 'events' && <CRMInventory key={selectedBusiness.id} items={events} type="events" label="Афиша" onAdd={() => setModal('event')} onDelete={async (id) => { await api.deleteEvent(id); refetchEvents(); }} />}
            </main>
        </div>
    );
};

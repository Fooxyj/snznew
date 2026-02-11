
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, Service, UserRole, Vacancy, BusinessPost, Booking } from '../types';
import { CRMOverview } from '../components/crm/CRMOverview';
import { CRMBookings } from '../components/crm/CRMBookings';
import { CRMInventory } from '../components/crm/CRMInventory';
import { CRMEmployees } from '../components/crm/CRMEmployees';
import { CRMMarketing } from '../components/crm/CRMMarketing';
import { CRMSettings } from '../components/crm/CRMSettings';
import { MiniSiteBuilder } from '../components/builder/MiniSiteBuilder';
import { CreateProductModal, CreateServiceModal, CreateRentalModal, EditProductModal, CreateBusinessVacancyModal, CreateBusinessPostModal, CreateCouponModal } from '../components/CRMModals';
import { CreateEventModal } from '../components/CreateEventModal';
import { StoryEditor } from '../components/StoryEditor';
import { Loader2, LayoutDashboard, ShoppingBag, Calendar, Users, Settings, Megaphone, Menu, X, LogOut, Film, Repeat, ChevronDown, PlusCircle, Check, PlaySquare, Layout as LayoutIcon, Briefcase, Hammer, Star, Building2, Newspaper, CreditCard, MessageCircle, AlertCircle, Clock, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Common';

const getDaysLabel = (days: number) => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11) return 'день';
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'дня';
    return 'дней';
};

export const BusinessCRM: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'products' | 'services' | 'employees' | 'marketing' | 'settings' | 'rentals' | 'events' | 'minisite' | 'vacancies' | 'news' | 'coupons'>('overview');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [modal, setModal] = useState<'product' | 'service' | 'rental' | 'event' | 'editProduct' | 'story' | 'vacancy' | 'post' | 'coupon' | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
    const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });

    const { data: businesses = [], isLoading } = useQuery({
        queryKey: ['myBusinesses'],
        queryFn: api.getMyBusinesses,
        staleTime: 0
    });

    useEffect(() => {
        if (!isLoading && businesses.length > 0 && !selectedBusinessId) {
            setSelectedBusinessId(businesses[0].id);
        }
    }, [businesses, selectedBusinessId, isLoading]);

    const selectedBusiness = useMemo(() => 
        businesses.find(b => b.id === selectedBusinessId) || businesses[0],
    [businesses, selectedBusinessId]);

    const subscriptionData = useMemo(() => {
        if (!selectedBusiness?.subscription_expires_at) return { isExpired: false, daysRemaining: 0 };
        const expiry = new Date(selectedBusiness.subscription_expires_at);
        const now = new Date();
        const diff = expiry.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return {
            isExpired: diff < 0,
            daysRemaining: Math.max(0, days)
        };
    }, [selectedBusiness]);

    const isExpired = subscriptionData.isExpired;
    const daysRemaining = subscriptionData.daysRemaining;

    const isMaster = selectedBusiness?.isMaster;

    const { data: products = [] } = useQuery({
        queryKey: ['products', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getProducts(selectedBusiness.id) : [],
        enabled: !!selectedBusiness && !isExpired
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getServices(selectedBusiness.id) : [],
        enabled: !!selectedBusiness && !isExpired
    });

    const { data: bookings = [] } = useQuery({
        queryKey: ['businessBookings', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getBusinessBookings(selectedBusiness.id) : [],
        enabled: !!selectedBusiness && !isExpired
    });

    const { data: vacancies = [] } = useQuery({
        queryKey: ['businessVacancies', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getVacanciesByBusiness(selectedBusiness.id) : [],
        enabled: !!selectedBusiness && !isExpired
    });

    const { data: posts = [] } = useQuery({
        queryKey: ['businessPosts', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getBusinessPosts(selectedBusiness.id) : [],
        enabled: !!selectedBusiness && !isExpired
    });

    const { data: coupons = [] } = useQuery({
        queryKey: ['businessCoupons', selectedBusiness?.id],
        queryFn: () => selectedBusiness ? api.getBusinessCoupons(selectedBusiness.id) : [],
        enabled: !!selectedBusiness && !isExpired
    });

    const menuItems = useMemo(() => {
        const items = [
            { id: 'overview', label: isMaster ? 'Мой Профиль' : 'Обзор витрины', icon: LayoutDashboard },
            { id: 'news', label: 'Новости и Акции', icon: Newspaper },
            { id: 'products', label: isMaster ? 'Мои работы' : 'Товары / Меню', icon: isMaster ? Hammer : ShoppingBag },
            { id: 'services', label: 'Услуги и Прайс', icon: Briefcase },
            { id: 'bookings', label: 'Записи клиентов', icon: Calendar },
            { id: 'coupons', label: 'Бонусная программа', icon: Gift },
            { id: 'vacancies', label: 'Вакансии', icon: Users },
        ];

        if (!isMaster) {
            items.push({ id: 'minisite', label: 'Мой Мини-сайт', icon: LayoutIcon });
            items.push({ id: 'employees', label: 'Сотрудники', icon: Users });
            items.push({ id: 'marketing', label: 'Продвижение', icon: Megaphone });
        }

        items.push({ id: 'settings', label: 'Настройки', icon: Settings });
        return items;
    }, [isMaster, selectedBusiness]);

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    if (businesses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-8 text-center bg-[#F8FAFC] dark:bg-gray-950">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center mb-8">
                    <Building2 className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white mb-4">У вас еще нет бизнеса</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Подключите свой магазин, кафе или услуги специалиста, чтобы начать работу с CRM.</p>
                <button 
                    onClick={() => navigate('/business-connect')}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
                >
                    Подключить бизнес
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-[#F8FAFC] dark:bg-gray-950 overflow-hidden relative">
            
            {/* Backdrop for mobile CRM menu */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[75] animate-in fade-in duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-16 lg:top-0 bottom-0 left-0 z-[80] w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 lg:static h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl lg:shadow-none`}>
                <div className="p-4 border-b dark:border-gray-700 relative">
                    {/* Close button for mobile inside the panel */}
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden absolute -right-3 top-4 bg-white dark:bg-gray-800 text-gray-400 p-2 rounded-full shadow-lg border dark:border-gray-700 z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="relative">
                        <button 
                            onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all group border dark:border-gray-700"
                        >
                            <img src={selectedBusiness?.image} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                            <div className="flex-1 text-left min-w-0">
                                <div className="text-[11px] font-black uppercase text-blue-600 tracking-tighter leading-none mb-1">Ваш бизнес</div>
                                <div className="text-sm font-bold dark:text-white truncate pr-4 leading-tight">{selectedBusiness?.name}</div>
                                {daysRemaining > 0 && !isExpired && (
                                    <div className={`text-[9px] font-black uppercase mt-1 ${daysRemaining < 5 ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`}>
                                        До конца: {daysRemaining} {getDaysLabel(daysRemaining)}
                                    </div>
                                )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isBusinessDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                    {businesses.map(b => (
                                        <button 
                                            key={b.id}
                                            onClick={() => {
                                                setSelectedBusinessId(b.id);
                                                setIsBusinessDropdownOpen(false);
                                                queryClient.invalidateQueries({ queryKey: ['products', b.id] });
                                                queryClient.invalidateQueries({ queryKey: ['services', b.id] });
                                                queryClient.invalidateQueries({ queryKey: ['businessBookings', b.id] });
                                                queryClient.invalidateQueries({ queryKey: ['businessVacancies', b.id] });
                                                queryClient.invalidateQueries({ queryKey: ['businessPosts', b.id] });
                                                queryClient.invalidateQueries({ queryKey: ['employees', b.id] });
                                                queryClient.invalidateQueries({ queryKey: ['businessCoupons', b.id] });
                                            }}
                                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${b.id === selectedBusinessId ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            <img src={b.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                            <span className={`text-xs font-bold truncate ${b.id === selectedBusinessId ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>{b.name}</span>
                                            {b.id === selectedBusinessId && <Check className="w-4 h-4 text-blue-600 ml-auto shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => navigate('/business-connect')}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-[10px] font-black uppercase text-gray-500 hover:text-blue-600 transition-colors border-t dark:border-gray-700 flex items-center justify-center gap-2"
                                >
                                    <PlusCircle className="w-4 h-4" /> Добавить еще бизнес
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                    {menuItems.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }} 
                            className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t dark:border-gray-700">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full flex items-center px-4 py-3 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-3" /> Выйти в город
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className={`flex-1 overflow-auto p-4 lg:p-10 pt-20 md:pt-10 relative min-w-0 ${isExpired ? 'blur-md pointer-events-none select-none overflow-hidden' : ''}`}>
                <div className="max-w-6xl mx-auto min-w-0">
                    {activeTab === 'overview' && <CRMOverview business={selectedBusiness} />}
                    {activeTab === 'minisite' && <MiniSiteBuilder businessId={selectedBusiness.id} />}
                    {activeTab === 'news' && (
                        <CRMInventory 
                            items={posts} 
                            type="products" 
                            label="Лента новостей" 
                            onAdd={() => setModal('post')} 
                            onDelete={async (id) => { 
                                if(confirm("Удалить новость?")) {
                                    await api.deleteBusinessPost(id); 
                                    queryClient.invalidateQueries({queryKey:['businessPosts', selectedBusiness?.id]}); 
                                }
                            }} 
                        />
                    )}
                    {activeTab === 'vacancies' && (
                        <CRMInventory 
                            items={vacancies} 
                            type="services" 
                            label="Набор персонала" 
                            onAdd={() => setModal('vacancy')} 
                            onDelete={async (id) => { 
                                if(confirm("Удалить вакансию?")) {
                                    await api.deleteEntity('vacancies', id); 
                                    queryClient.invalidateQueries({queryKey:['businessVacancies', selectedBusiness?.id]}); 
                                }
                            }} 
                        />
                    )}
                    {activeTab === 'coupons' && (
                        <CRMInventory 
                            items={coupons} 
                            type="products" 
                            label="Бонусные купоны" 
                            onAdd={() => setModal('coupon')} 
                            onDelete={async (id) => { 
                                if(confirm("Удалить купон? Он пропадет из магазина бонусов.")) {
                                    await api.deleteCoupon(id); 
                                    queryClient.invalidateQueries({queryKey:['businessCoupons', selectedBusiness?.id]}); 
                                }
                            }} 
                        />
                    )}
                    {activeTab === 'bookings' && (
                        <CRMBookings 
                            businessId={selectedBusiness.id} 
                            bookings={bookings} 
                            tables={[]} 
                            viewMode="list" 
                            onChangeView={() => {}} 
                            onTableClick={() => {}} 
                        />
                    )}
                    {activeTab === 'products' && (
                        <CRMInventory 
                            items={products} 
                            type="products" 
                            label={isMaster ? "Мои работы" : "Товары / Меню"} 
                            onAdd={() => setModal('product')} 
                            onEdit={(item) => {
                                setEditingProduct(item);
                                setModal('editProduct');
                            }}
                            onDelete={async (id) => { 
                                if(confirm("Удалить товар?")) {
                                    await api.deleteProduct(id); 
                                    queryClient.invalidateQueries({queryKey:['products', selectedBusiness?.id]}); 
                                }
                            }} 
                        />
                    )}
                    {activeTab === 'services' && (
                        <CRMInventory 
                            items={services} 
                            type="services" 
                            label="Услуги и Прайс" 
                            onAdd={() => setModal('service')} 
                            onDelete={async (id) => { 
                                if(confirm("Удалить услугу?")) {
                                    await api.deleteService(id); 
                                    queryClient.invalidateQueries({queryKey:['services', selectedBusiness?.id]}); 
                                }
                            }} 
                        />
                    )}
                    {activeTab === 'employees' && (
                        <CRMEmployees businessId={selectedBusiness.id} />
                    )}
                    {activeTab === 'marketing' && (
                        <CRMMarketing businessId={selectedBusiness.id} setActiveTab={setActiveTab} />
                    )}
                    {activeTab === 'settings' && <CRMSettings business={selectedBusiness} />}
                </div>
            </main>

            {/* Blocked Interface Overlay */}
            {isExpired && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/5 dark:bg-black/20">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-red-500/30 p-10 rounded-[3rem] shadow-2xl max-w-lg w-full text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
                        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-red-600 shadow-xl shadow-red-500/10">
                            <Clock className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tight dark:text-white mb-4">Доступ ограничен</h2>
                        <p className="text-gray-600 dark:text-gray-300 font-bold mb-10 leading-relaxed uppercase text-[10px] tracking-[0.2em]">
                            Срок действия вашего бизнес-кабинета истек {new Date(selectedBusiness.subscription_expires_at!).toLocaleDateString()}. Чтобы продолжить управление витриной и заказами, необходимо продлить кабинет.
                        </p>
                        
                        <div className="flex flex-col gap-4">
                            <Button 
                                className="w-full py-5 text-lg bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                onClick={() => alert("Система приема платежей будет доступна в ближайшее время")}
                            >
                                <CreditCard className="w-5 h-5 mr-3" /> Продлить на месяц (500 ₽)
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full py-4 font-black uppercase text-[10px] tracking-widest rounded-2xl border-2"
                                onClick={() => window.location.href = 'mailto:support@prostor-app.ru'}
                            >
                                <MessageCircle className="w-5 h-5 mr-2" /> Связаться с поддержкой
                            </Button>
                            <button 
                                onClick={() => navigate('/')}
                                className="mt-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 tracking-widest transition-colors"
                            >
                                Вернуться на главную
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Toggle Button (Mobile) */}
            <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden fixed bottom-24 right-4 z-[90] bg-blue-600 text-white p-4 rounded-2xl shadow-2xl active:scale-90 transition-transform"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Modals */}
            {modal === 'coupon' && (
                <CreateCouponModal 
                    businessId={selectedBusiness.id} 
                    isOpen={true} 
                    onClose={() => setModal(null)} 
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['businessCoupons', selectedBusiness?.id] })} 
                />
            )}
            {modal === 'vacancy' && (
                <CreateBusinessVacancyModal 
                    business={selectedBusiness} 
                    isOpen={true} 
                    onClose={() => setModal(null)} 
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['businessVacancies', selectedBusiness?.id] })} 
                />
            )}
            {modal === 'product' && (
                <CreateProductModal 
                    businessId={selectedBusiness.id} 
                    isOpen={true} 
                    onClose={() => setModal(null)} 
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products', selectedBusiness?.id] })} 
                />
            )}
            {modal === 'editProduct' && editingProduct && (
                <EditProductModal 
                    product={editingProduct} 
                    isOpen={true} 
                    onClose={() => { setModal(null); setEditingProduct(null); }} 
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products', selectedBusiness?.id] })} 
                />
            )}
            {modal === 'service' && (
                <CreateServiceModal 
                    businessId={selectedBusiness.id} 
                    isOpen={true} 
                    onClose={() => setModal(null)} 
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['services', selectedBusiness?.id] })} 
                />
            )}
            {modal === 'post' && (
                <CreateBusinessPostModal 
                    businessId={selectedBusiness.id} 
                    isOpen={true} 
                    onClose={() => setModal(null)} 
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['businessPosts', selectedBusiness?.id] })} 
                />
            )}
        </div>
    );
};

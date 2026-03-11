

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, Service, UserRole, Vacancy, BusinessPost, Booking } from '../types';
import { CRMOverview } from '../components/crm/CRMOverview';
import { CRMBookings } from '../components/crm/CRMBookings';
import { CRMInventory } from '../components/crm/CRMInventory';
import { CRMEmployees } from '../components/crm/CRMEmployees';
import { CRMMarketing } from '../components/crm/CRMMarketing';
import { CRMSettings } from '../components/crm/CRMSettings';
import { MiniSiteBuilder } from '../components/builder/MiniSiteBuilder';
import { CreateProductModal, CreateServiceModal, CreateRentalModal, EditProductModal, EditBusinessPostModal, EditServiceModal, EditBusinessVacancyModal, EditCouponModal, CreateBusinessVacancyModal, CreateBusinessPostModal, CreateCouponModal } from '../components/CRMModals';
import { CreateEventModal } from '../components/CreateEventModal';
import { StoryEditor } from '../components/StoryEditor';
import { Loader2, LayoutDashboard, ShoppingBag, Calendar, Users, Settings, Megaphone, Menu, X, LogOut, Film, Repeat, ChevronDown, PlusCircle, Check, PlaySquare, Layout as LayoutIcon, Briefcase, Hammer, Star, Building2, Newspaper, CreditCard, MessageCircle, AlertCircle, Clock, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Common';
import { BusinessWelcomeModal } from '../components/BusinessWelcomeModal';

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
    const [modal, setModal] = useState<'product' | 'service' | 'rental' | 'event' | 'editProduct' | 'editPost' | 'editService' | 'editVacancy' | 'editCoupon' | 'story' | 'vacancy' | 'post' | 'coupon' | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [editingService, setEditingService] = useState<any>(null);
    const [editingVacancy, setEditingVacancy] = useState<any>(null);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);
    
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
    const [bookingViewMode, setBookingViewMode] = useState<'list' | 'hall'>('list');
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

    // Проверка, приняты ли условия для текущего бизнеса
    const showWelcome = useMemo(() => {
        if (!selectedBusiness) return false;
        // Comment above fix: Accessing terms_accepted safely after interface update
        return !selectedBusiness.terms_accepted;
    }, [selectedBusiness]);

    const handleAcceptTerms = async () => {
        if (!selectedBusiness) return;
        try {
            // Comment above fix: terms_accepted is now a known property of Partial<Business>
            await api.updateBusiness(selectedBusiness.id, { terms_accepted: true });
            await queryClient.invalidateQueries({ queryKey: ['myBusinesses'] });
        } catch (e) {
            console.error(e);
        }
    };

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

    // Data Fetching
    const { data: products = [] } = useQuery({
        queryKey: ['products', selectedBusinessId],
        queryFn: () => api.getProducts(selectedBusinessId!),
        enabled: !!selectedBusinessId
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services', selectedBusinessId],
        queryFn: () => api.getServices(selectedBusinessId!),
        enabled: !!selectedBusinessId
    });

    const { data: news = [] } = useQuery({
        queryKey: ['businessPosts', selectedBusinessId],
        queryFn: () => api.getBusinessPosts(selectedBusinessId!),
        enabled: !!selectedBusinessId
    });

    const { data: bookings = [] } = useQuery({
        queryKey: ['businessBookings', selectedBusinessId],
        queryFn: () => api.getBusinessBookings(selectedBusinessId!),
        enabled: !!selectedBusinessId
    });

    const { data: vacancies = [] } = useQuery({
        queryKey: ['vacancies', selectedBusinessId],
        queryFn: () => api.getVacanciesByBusiness(selectedBusinessId!),
        enabled: !!selectedBusinessId
    });

    const { data: coupons = [] } = useQuery({
        queryKey: ['coupons', selectedBusinessId],
        queryFn: () => api.getBusinessCoupons(selectedBusinessId!),
        enabled: !!selectedBusinessId
    });

    // Mutations
    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => api.deleteProduct(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', selectedBusinessId] })
    });

    const deleteServiceMutation = useMutation({
        mutationFn: (id: string) => api.deleteService(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services', selectedBusinessId] })
    });

    const deletePostMutation = useMutation({
        mutationFn: (id: string) => api.deleteBusinessPost(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessPosts', selectedBusinessId] })
    });

    const deleteVacancyMutation = useMutation({
        mutationFn: (id: string) => api.deleteEntity('vacancies', id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vacancies', selectedBusinessId] })
    });

    const deleteCouponMutation = useMutation({
        mutationFn: (id: string) => api.deleteCoupon(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons', selectedBusinessId] })
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
            
            {/* Приветственная плашка */}
            <BusinessWelcomeModal 
                isOpen={showWelcome} 
                onAccept={handleAcceptTerms} 
                businessName={selectedBusiness?.name || ''} 
            />

            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[105] animate-in fade-in duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`fixed top-16 lg:top-0 bottom-0 left-0 z-[110] w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 lg:static h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl lg:shadow-none ${showWelcome ? 'blur-lg grayscale pointer-events-none' : ''}`}>
                <div className="p-4 border-b dark:border-gray-700 relative">
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
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 z-[120] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                    {businesses.map(b => (
                                        <button 
                                            key={b.id}
                                            onClick={() => {
                                                setSelectedBusinessId(b.id);
                                                setIsBusinessDropdownOpen(false);
                                                queryClient.invalidateQueries({ queryKey: ['products', b.id] });
                                            }}
                                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${b.id === selectedBusinessId ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            <img src={b.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                            <span className={`text-xs font-bold truncate ${b.id === selectedBusinessId ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>{b.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar pb-32 lg:pb-4">
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
            </aside>

            <main className={`flex-1 overflow-auto p-4 lg:p-10 pt-20 md:pt-10 relative min-w-0 transition-all duration-700 ${(isExpired || showWelcome) ? 'blur-2xl grayscale pointer-events-none select-none overflow-hidden' : ''}`}>
                <div className="max-w-6xl mx-auto min-w-0">
                    {activeTab === 'overview' && <CRMOverview business={selectedBusiness} />}
                    {activeTab === 'minisite' && <MiniSiteBuilder businessId={selectedBusiness.id} />}
                    {activeTab === 'news' && (
                        <CRMInventory 
                            items={news} 
                            type="products" 
                            label="Лента новостей" 
                            onAdd={() => setModal('post')} 
                            onEdit={(p) => { setEditingPost(p); setModal('editPost'); }}
                            onDelete={(id) => confirm('Удалить новость?') && deletePostMutation.mutate(id)} 
                        />
                    )}
                    {activeTab === 'bookings' && (
                        <CRMBookings 
                            businessId={selectedBusiness.id} 
                            bookings={bookings} 
                            tables={[]} 
                            viewMode={bookingViewMode} 
                            onChangeView={setBookingViewMode} 
                            onTableClick={() => {}} 
                        />
                    )}
                    {activeTab === 'products' && (
                        <CRMInventory 
                            items={products} 
                            type="products" 
                            label={isMaster ? "Мои работы" : "Товары / Меню"} 
                            onAdd={() => setModal('product')} 
                            onEdit={(p) => { setEditingProduct(p); setModal('editProduct'); }}
                            onDelete={(id) => confirm('Удалить товар?') && deleteProductMutation.mutate(id)} 
                        />
                    )}
                    {activeTab === 'services' && (
                        <CRMInventory 
                            items={services} 
                            type="services" 
                            label="Услуги и Прайс" 
                            onAdd={() => setModal('service')} 
                            onEdit={(s) => { setEditingService(s); setModal('editService'); }}
                            onDelete={(id) => confirm('Удалить услугу?') && deleteServiceMutation.mutate(id)} 
                        />
                    )}
                    {activeTab === 'coupons' && (
                        <CRMInventory 
                            items={coupons} 
                            type="products" 
                            label="Бонусная программа" 
                            onAdd={() => setModal('coupon')} 
                            onEdit={(c) => { setEditingCoupon(c); setModal('editCoupon'); }}
                            onDelete={(id) => confirm('Удалить купон?') && deleteCouponMutation.mutate(id)} 
                        />
                    )}
                    {activeTab === 'vacancies' && (
                        <CRMInventory 
                            items={vacancies} 
                            type="products" 
                            label="Вакансии" 
                            onAdd={() => setModal('vacancy')} 
                            onEdit={(v) => { setEditingVacancy(v); setModal('editVacancy'); }}
                            onDelete={(id) => confirm('Удалить вакансию?') && deleteVacancyMutation.mutate(id)} 
                        />
                    )}
                    {activeTab === 'employees' && <CRMEmployees businessId={selectedBusiness.id} />}
                    {activeTab === 'marketing' && <CRMMarketing businessId={selectedBusiness.id} setActiveTab={setActiveTab} />}
                    {activeTab === 'settings' && <CRMSettings business={selectedBusiness} />}
                </div>
            </main>

            {isExpired && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/5 dark:bg-black/20">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-red-500/30 p-10 rounded-[3rem] shadow-2xl max-w-lg w-full text-center">
                        <Clock className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-black uppercase dark:text-white mb-4">Срок действия истек</h2>
                        <Button className="w-full" onClick={() => navigate('/')}>Вернуться</Button>
                    </div>
                </div>
            )}

            <button 
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden fixed bottom-24 right-4 z-[90] bg-blue-600 text-white p-4 rounded-2xl shadow-2xl active:scale-90 transition-transform ${showWelcome ? 'opacity-0' : ''}`}
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Modals */}
            {modal === 'product' && (
                <CreateProductModal businessId={selectedBusiness.id} isOpen={true} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products', selectedBusiness?.id] })} />
            )}
            {modal === 'service' && (
                <CreateServiceModal businessId={selectedBusiness.id} isOpen={true} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['services', selectedBusiness?.id] })} />
            )}
            {modal === 'post' && (
                <CreateBusinessPostModal businessId={selectedBusiness.id} isOpen={true} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['businessPosts', selectedBusiness?.id] })} />
            )}
            {modal === 'editProduct' && editingProduct && (
                <EditProductModal product={editingProduct} isOpen={true} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products', selectedBusiness?.id] })} />
            )}
            {modal === 'editPost' && editingPost && (
                <EditBusinessPostModal post={editingPost} isOpen={true} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['businessPosts', selectedBusiness?.id] })} />
            )}
            {modal === 'editService' && editingService && (
                <EditServiceModal service={editingService} isOpen={true} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['services', selectedBusiness?.id] })} />
            )}
            {modal === 'editVacancy' && editingVacancy && (
                <EditBusinessVacancyModal vacancy={editingVacancy} isOpen={true} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['vacancies', selectedBusiness?.id] })} />
            )}
            {modal === 'editCoupon' && editingCoupon && (
                <EditCouponModal coupon={editingCoupon} isOpen={true} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['businessCoupons', selectedBusiness?.id] })} />
            )}
        </div>
    );
};
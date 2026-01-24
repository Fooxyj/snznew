
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { User, Ad, Business, UserRole, Story, TransportSchedule, Banner, Report, Suggestion, NewsItem, Event, Campaign, Quest, Ride, AccessRequest, PromoAd, ExclusivePage, ModerationLog } from '../types';
import { Button, XPBar, Badge, Rating, UserStatus } from '../components/ui/Common';
import { Img } from '../components/ui/Image';
import { 
    User as UserIcon, Settings, Loader2, Plus, 
    ShoppingBag, Check, X, 
    Trophy, MapPin, Shield, Star, Crown, Zap,
    BarChart3, FileText, Calendar, Bus, Image as ImageIcon, Heart, AlertTriangle, Lightbulb, CheckCircle, Trash2, Pencil, Car, ChevronRight, RefreshCw, UserCircle,
    ArrowRight, Users, ShieldCheck, Key, Megaphone, Flag, Info, Building2, Clock, Wallet, Layout as LayoutIcon, MessageSquare, Search, History, Eye, ShieldAlert
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateNewsModal } from '../components/CreateNewsModal';
import { CreateEventModal } from '../components/CreateEventModal';
import { CreateQuestModal, CreateAdminCampaignModal, CreateBannerModal, CreateTransportModal, CreatePromoAdModal, CreateExclusivePageModal } from '../components/AdminModals';
import { EditAdModal } from '../components/EditAdModal';

const BadgeIcon: React.FC<{ name: string }> = ({ name }) => {
    switch(name) {
        case 'verified': return <div className="text-blue-500 bg-blue-50 p-1.5 rounded-full" title="Проверенный"><Star className="w-3.5 h-3.5 fill-current" /></div>;
        case 'admin': return <div className="text-red-500 bg-red-50 p-1.5 rounded-full" title="Администратор"><Shield className="w-3.5 h-3.5 fill-current" /></div>;
        case 'moderator': return <div className="text-purple-500 bg-purple-50 p-1.5 rounded-full" title="Модератор"><Zap className="w-3.5 h-3.5 fill-current" /></div>;
        case 'quest_master': return <div className="text-purple-500 bg-purple-100 p-1.5 rounded-full" title="Мастер квестов"><Zap className="w-3.5 h-3.5 fill-current" /></div>;
        case 'early_adopter': return <div className="text-orange-500 bg-orange-100 p-1.5 rounded-full" title="Старожил"><Crown className="w-3.5 h-3.5 fill-current" /></div>;
        default: return null;
    }
};

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [activeTab, setActiveTab] = useState<'my-ads' | 'favorites' | 'rides'>('my-ads');
    const [ridesSubTab, setRidesSubTab] = useState<'active' | 'archive'>('active');
    
    const { data: user, isLoading: userLoading } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const { data: myContent } = useQuery({ queryKey: ['myContent', user?.id], queryFn: () => api.getUserContent(user?.id!), enabled: !!user?.id });
    const { data: myRides = [] } = useQuery({ queryKey: ['myRides', user?.id], queryFn: () => api.getMyRides(), enabled: !!user?.id });
    const { data: favoriteItems } = useQuery({ queryKey: ['favoritesData', user?.favorites], queryFn: () => api.getFavorites(user?.favorites || []), enabled: !!user?.id });

    const { upcomingRides, pastRides } = useMemo(() => {
        const now = new Date();
        const upcoming: Ride[] = [];
        const past: Ride[] = [];
        myRides.forEach(ride => {
            const rideDate = new Date(`${ride.date}T${ride.time || '00:00'}`);
            if (now.getTime() - rideDate.getTime() > 24 * 3600000) past.push(ride);
            else upcoming.push(ride);
        });
        return { upcomingRides: upcoming, pastRides: past };
    }, [myRides]);

    if (userLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!user) return <div className="p-10 text-center font-bold uppercase tracking-widest text-gray-400">Войдите в аккаунт</div>;

    const myAds = myContent?.ads || [];
    const favAds = favoriteItems?.ads || [];
    const favBusinesses = favoriteItems?.businesses || [];
    const displayFavCount = favoriteItems ? (favAds.length + favBusinesses.length) : (user.favorites?.length || 0);

    const handleRemoveFavorite = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        await api.toggleFavorite(id, 'ad');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['favoritesData'] });
    };

    const handleDeleteRide = async (id: string) => {
        if (!confirm("Удалить поездку из списка?")) return;
        await api.deleteRide(id);
        queryClient.invalidateQueries({ queryKey: ['myRides'] });
    };

    const handleDeleteAd = async (id: string) => {
        if(confirm("Удалить объявление навсегда?")) {
            await api.deleteEntity('ads', id, 'Удалено автором');
            queryClient.invalidateQueries({queryKey:['myContent']});
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-24">
            {editingAd && <EditAdModal ad={editingAd} isOpen={!!editingAd} onClose={() => setEditingAd(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['myContent', user.id] })} />}
            
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 lg:p-12 shadow-sm border dark:border-gray-700 mb-12 flex flex-col md:flex-row items-center gap-10">
                <div className="relative">
                    <img src={user.avatar} className="w-40 h-40 rounded-[2.5rem] object-cover border-8 border-gray-50 dark:border-gray-700 shadow-2xl bg-gray-200" />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-4xl font-black dark:text-white flex items-center justify-center md:justify-start gap-3">
                                {user.name}
                                <div className="flex gap-1">{user.badges?.map(b => <BadgeIcon key={b} name={b} />)}</div>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">{user.email}</p>
                        </div>
                        <div className="flex gap-3">
                            {(user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) && (
                                <Link to="/admin">
                                    <Button variant="danger" className="rounded-2xl px-6 uppercase font-black text-[10px] tracking-widest shadow-xl shadow-red-500/10">
                                        {user.role === UserRole.ADMIN ? 'Управление' : 'Модерация'}
                                    </Button>
                                </Link>
                            )}
                            <Button variant="outline" onClick={() => navigate('/settings')} className="rounded-2xl">
                                <Settings className="w-5 h-5 mr-2" /> Настройки
                            </Button>
                        </div>
                    </div>
                    <div className="max-w-md"><XPBar xp={user.xp} /></div>
                </div>
            </div>

            <div className="flex border-b dark:border-gray-700 mb-8 gap-8 px-2 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveTab('my-ads')} className={`pb-4 text-sm font-black uppercase tracking-widest relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'my-ads' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
                    <ShoppingBag className="w-4 h-4" /> Мои объявления <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px] ml-1 font-bold">{myAds.length}</span>
                </button>
                <button onClick={() => setActiveTab('favorites')} className={`pb-4 text-sm font-black uppercase tracking-widest relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'favorites' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}>
                    <Heart className="w-4 h-4" /> Избранное <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px] ml-1 font-bold">{displayFavCount}</span>
                </button>
                <button onClick={() => setActiveTab('rides')} className={`pb-4 text-sm font-black uppercase tracking-widest relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'rides' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
                    <Car className="w-4 h-4" /> Мои поездки <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px] ml-1 font-bold">{upcomingRides.length}</span>
                </button>
            </div>

            <section className="animate-in fade-in duration-500">
                {activeTab === 'my-ads' && (
                    myAds.length === 0 ? (
                        <div className="text-center py-32 text-gray-400 font-bold uppercase tracking-widest border-4 border-dashed rounded-[3rem] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            У вас пока нет объявлений
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myAds.map(ad => (
                                <div key={ad.id} className="bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group relative">
                                    <div className="aspect-[4/3] overflow-hidden relative">
                                        <Img src={ad.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        {ad.status === 'pending' && <div className="absolute top-4 left-4 bg-yellow-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">На проверке</div>}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg dark:text-white line-clamp-1">{ad.title}</h3>
                                        <p className="text-blue-600 font-black text-xl mt-2">{ad.price} ₽</p>
                                        <div className="mt-4 flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1 rounded-xl" onClick={() => setEditingAd(ad)}>
                                                <Pencil className="w-4 h-4 mr-2" /> Правка
                                            </Button>
                                            <Button size="sm" variant="danger" className="rounded-xl" onClick={() => handleDeleteAd(ad.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'favorites' && (
                    favAds.length === 0 && favBusinesses.length === 0 ? (
                        <div className="text-center py-32 text-gray-400 font-bold uppercase tracking-widest border-4 border-dashed rounded-[3rem] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            Список избранного пуст
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {favBusinesses.length > 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-500" /> Места и Компании
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {favBusinesses.map(biz => (
                                            <Link key={biz.id} to={`/business/${biz.id}`} className="bg-white dark:bg-gray-800 rounded-3xl p-4 border dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow group">
                                                <Img src={biz.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                                                <div className="flex-1 min-0">
                                                    <h4 className="font-bold dark:text-white truncate group-hover:text-blue-600 transition-colors">{biz.name}</h4>
                                                    <p className="text-xs text-gray-400 truncate">{biz.category}</p>
                                                </div>
                                                <button onClick={(e) => handleRemoveFavorite(biz.id, e)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4"/></button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {favAds.length > 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-orange-500" /> Объявления
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {favAds.map(ad => (
                                            <Link key={ad.id} to={`/ad/${ad.id}`} className="bg-white dark:bg-gray-800 rounded-3xl p-4 border dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow group">
                                                <Img src={ad.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold dark:text-white truncate group-hover:text-blue-600 transition-colors">{ad.title}</h4>
                                                    <p className="font-black text-blue-600 text-sm">{ad.price} {ad.currency}</p>
                                                </div>
                                                <button onClick={(e) => handleRemoveFavorite(ad.id, e)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4"/></button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}

                {activeTab === 'rides' && (
                    <div className="space-y-8">
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
                            <button onClick={() => setRidesSubTab('active')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${ridesSubTab === 'active' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>Активные</button>
                            <button onClick={() => setRidesSubTab('archive')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${ridesSubTab === 'archive' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>Архив</button>
                        </div>

                        <div className="space-y-6">
                            {(ridesSubTab === 'active' ? upcomingRides : pastRides).length === 0 ? (
                                <div className="text-center py-20 text-gray-400 uppercase font-black text-xs tracking-widest">
                                    Поездок не найдено
                                </div>
                            ) : (
                                (ridesSubTab === 'active' ? upcomingRides : pastRides).map(ride => (
                                    <div key={ride.id} className="bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-[2.5rem] border dark:border-gray-700 flex flex-col gap-6 group transition-all hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30">
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="flex-1 w-full">
                                                <div className="flex items-center gap-3 text-xs font-black uppercase text-blue-600 mb-3 tracking-widest">
                                                    <Calendar className="w-4 h-4" /> {new Date(ride.date).toLocaleDateString('ru-RU')} в {ride.time}
                                                </div>
                                                <div className="flex items-center gap-4 text-xl font-black dark:text-white uppercase tracking-tight">
                                                    <span>{ride.fromCity}</span>
                                                    <ArrowRight className="w-5 h-5 text-gray-300" />
                                                    <span>{ride.toCity}</span>
                                                </div>
                                                <div className="flex items-center gap-5 mt-3">
                                                    <div className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1.5">
                                                        <Car className="w-3.5 h-3.5 text-blue-400" /> {ride.carModel}
                                                    </div>
                                                    <div className="text-sm font-black text-blue-600 dark:text-blue-400">{ride.price} ₽</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                                                {ridesSubTab === 'active' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 px-6 font-black uppercase text-[10px] tracking-widest" 
                                                        onClick={() => handleDeleteRide(ride.id)}
                                                    >
                                                        Отменить
                                                    </Button>
                                                )}
                                                <button onClick={() => navigate(`/chat`)} className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-all">
                                                    <MessageSquare className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {ride.passengerDetails && ride.passengerDetails.length > 0 && (
                                            <div className="pt-6 border-t dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                                                <p className="text-[9px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                                                    <Users className="w-3 h-3 text-blue-500" /> Список попутчиков ({ride.passengerDetails.length})
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {ride.passengerDetails.map((p: any) => (
                                                        <Link 
                                                            key={p.id} 
                                                            to={`/user/${p.id}`}
                                                            className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border dark:border-gray-700 group/p shadow-sm"
                                                        >
                                                            <div className="relative shrink-0">
                                                                <img 
                                                                    src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`} 
                                                                    className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-gray-800 shadow-sm group-hover/p:border-blue-200 transition-all" 
                                                                    alt="" 
                                                                />
                                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-[11px] font-black uppercase tracking-tight dark:text-white group-hover/p:text-blue-600 transition-colors truncate">
                                                                    {p.name}
                                                                </div>
                                                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Пассажир</div>
                                                            </div>
                                                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover/p:text-blue-500 transition-all group-hover/p:translate-x-1" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {(!ride.passengerDetails || ride.passengerDetails.length === 0) && (
                                            <div className="pt-4 border-t dark:border-gray-700">
                                                <p className="text-[10px] font-bold text-gray-400 italic">Пока никто не забронировал место</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'stats' | 'moderation' | 'feedback' | 'city-data' | 'promotions' | 'users' | 'moderation-logs'>('stats');
    const [feedbackSubTab, setFeedbackSubTab] = useState<'reports' | 'ideas'>('reports');
    const [citySubTab, setCitySubTab] = useState<'banners' | 'exclusive_pages' | 'news' | 'events' | 'transport' | 'quests' | 'campaigns'>('banners');
    const [userSearch, setUserSearch] = useState('');
    const [modal, setModal] = useState<'banner' | 'transport' | 'quest' | 'campaign' | 'news' | 'event' | 'promo' | 'exclusive' | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: currentUser } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    const { data: stats } = useQuery({ queryKey: ['adminStats'], queryFn: api.getSystemStats, enabled: isAdmin });
    const { data: pending = [] } = useQuery({ queryKey: ['pendingContent'], queryFn: api.getAllPendingContent });
    const { data: reports = [] } = useQuery({ queryKey: ['adminReports'], queryFn: api.getAdminReports });
    const { data: suggestions = [] } = useQuery({ queryKey: ['adminSuggestions'], queryFn: api.getAdminSuggestions });
    const { data: profiles = [] } = useQuery({ queryKey: ['adminProfiles', userSearch], queryFn: () => api.getAllProfiles(userSearch), enabled: isAdmin });
    const { data: modLogs = [], isLoading: modLogsLoading } = useQuery({ queryKey: ['moderationLogs'], queryFn: api.getModerationLogs, enabled: isAdmin });

    const { data: banners = [] } = useQuery({ queryKey: ['banners'], queryFn: api.getBanners, enabled: isAdmin });
    const { data: exclusivePages = [] } = useQuery({ queryKey: ['exclusivePages'], queryFn: api.getExclusivePages, enabled: isAdmin });
    const { data: transport = [] } = useQuery({ queryKey: ['transport'], queryFn: api.getTransportSchedules, enabled: isAdmin });
    const { data: promoAds = [] } = useQuery({ queryKey: ['promoAds'], queryFn: api.getPromoAds, enabled: isAdmin });
    const { data: news = [] } = useQuery({ queryKey: ['news'], queryFn: api.getNews, enabled: isAdmin });
    const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: api.getEvents, enabled: isAdmin });
    const { data: quests = [] } = useQuery({ queryKey: ['quests'], queryFn: api.getQuests, enabled: isAdmin });
    const { data: campaigns = [] } = useQuery({ queryKey: ['campaigns'], queryFn: api.getCampaigns, enabled: isAdmin });

    const cityTabLabels: Record<string, string> = {
        'news': 'Новости',
        'events': 'События',
        'transport': 'Транспорт',
        'quests': 'Квесты',
        'campaigns': 'Сборы',
        'banners': 'Баннеры',
        'exclusive_pages': 'Лендинги'
    };

    const handleApprove = async (item: any) => {
        await api.approveContent(item._table, item.id);
        queryClient.invalidateQueries({ queryKey: ['pendingContent'] });
    };

    const handleReject = async (item: any) => {
        const reason = prompt("Причина отклонения:");
        if (!reason) return;
        await api.rejectContent(item._table, item.id, reason);
        queryClient.invalidateQueries({ queryKey: ['pendingContent'] });
        queryClient.invalidateQueries({ queryKey: ['moderationLogs'] });
    };

    const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
        if (!confirm(`Изменить роль?`)) return;
        await api.updateEntity('profiles', userId, { role: newRole });
        queryClient.invalidateQueries({ queryKey: ['adminProfiles'] });
    };

    const handleDeleteEntity = async (table: string, id: string, queryKey: string) => {
        const confirmMsg = table === 'reports' ? "Удалить жалобу?" : table === 'suggestions' ? "Удалить предложение?" : "Удалить объект?";
        if (!confirm(confirmMsg)) return;
        
        await api.deleteEntity(table, id, 'Удалено администратором');
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        queryClient.invalidateQueries({ queryKey: ['moderationLogs'] });
    };

    const openEditModal = (type: any, item: any) => { setEditingItem(item); setModal(type); };
    const closeModals = () => { setModal(null); setEditingItem(null); };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 pb-24">
            <CreateBannerModal item={editingItem} isOpen={modal === 'banner'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({queryKey:['banners']})} />
            <CreateTransportModal item={editingItem} isOpen={modal === 'transport'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({queryKey:['transport']})} />
            <CreatePromoAdModal item={editingItem} isOpen={modal === 'promo'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({queryKey:['promoAds']})} />
            <CreateNewsModal item={editingItem} isOpen={modal === 'news'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({queryKey:['news']})} />
            <CreateEventModal item={editingItem} isOpen={modal === 'event'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({queryKey:['events']})} />
            <CreateExclusivePageModal item={editingItem} isOpen={modal === 'exclusive'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({queryKey:['exclusivePages']})} />
            <CreateQuestModal item={editingItem} isOpen={modal === 'quest'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({queryKey:['quests']})} />
            <CreateAdminCampaignModal item={editingItem} isOpen={modal === 'campaign'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({queryKey:['campaigns']})} />

            <div className="flex justify-between items-center mb-10"><h1 className="text-3xl font-black dark:text-white uppercase tracking-tight flex items-center gap-3"><ShieldCheck className={`w-10 h-10 ${isAdmin ? 'text-red-600' : 'text-purple-600'}`} /> {isAdmin ? 'Управление' : 'Модерация'}</h1></div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    {isAdmin && <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'stats' ? `bg-blue-600 text-white shadow-lg` : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><BarChart3 className="w-5 h-5" /> Статистика</div></button>}
                    <button onClick={() => setActiveTab('moderation')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'moderation' ? `bg-indigo-600 text-white shadow-lg` : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><Shield className="w-5 h-5" /> Модерация</div> {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{pending.length}</span>}</button>
                    {isAdmin && <button onClick={() => setActiveTab('moderation-logs')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'moderation-logs' ? `bg-gray-900 text-white shadow-lg` : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><History className="w-5 h-5" /> Лог действий</div></button>}
                    <button onClick={() => setActiveTab('feedback')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'feedback' ? `bg-red-600 text-white shadow-lg` : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><MessageSquare className="w-5 h-5" /> Обратная связь</div></button>
                    {isAdmin && <><button onClick={() => setActiveTab('promotions')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'promotions' ? `bg-orange-600 text-white shadow-lg` : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><Megaphone className="w-5 h-5" /> Реклама</div></button><button onClick={() => setActiveTab('city-data')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'city-data' ? `bg-gray-700 text-white shadow-lg` : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><Settings className="w-5 h-5" /> Данные города</div></button><button onClick={() => setActiveTab('users')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'users' ? `bg-blue-800 text-white shadow-lg` : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><Users className="w-5 h-5" /> Жители</div></button></>}
                </div>

                <div className="lg:col-span-3">
                    {activeTab === 'stats' && isAdmin && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Жители', val: stats?.users, icon: Users, col: 'text-blue-500' },
                                    { label: 'Реклама', val: promoAds.length, icon: Megaphone, col: 'text-orange-500' },
                                    { label: 'Компании', val: stats?.businesses, icon: Building2, col: 'text-teal-500' },
                                    { label: 'Новости', val: stats?.news, icon: FileText, col: 'text-indigo-500' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm">
                                        <p className="text-gray-400 text-[10px] font-black uppercase mb-1">{s.label}</p>
                                        <p className="text-3xl font-black dark:text-white">{s.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'moderation' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">На проверке ({pending.length})</h2>
                            {pending.map((it: any) => (
                                <div key={it.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6 group relative">
                                    {it.image && <img src={it.image} className="w-24 h-24 rounded-2xl object-cover" />}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge color="blue">{it.typeLabel}</Badge>
                                            <span className="text-[10px] font-bold text-gray-400">{new Date(it.created_at).toLocaleString()}</span>
                                        </div>
                                        <h3 className="font-bold dark:text-white mb-2">{it.displayTitle}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{it.description || it.content}</p>
                                        
                                        {/* Автор контента */}
                                        {it.authorId && (
                                            <Link 
                                                to={`/user/${it.authorId}`} 
                                                className="inline-flex items-center gap-2.5 p-2 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-100 dark:border-gray-700"
                                            >
                                                <img 
                                                    src={it.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(it.authorName)}&background=random`} 
                                                    className="w-7 h-7 rounded-lg object-cover shadow-sm" 
                                                    alt="" 
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-blue-600 leading-none mb-0.5">{it.authorName}</span>
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Посмотреть профиль автора</span>
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0">
                                        <Button size="sm" className="bg-green-600" onClick={() => handleApprove(it)}><Check className="w-4 h-4 mr-1" /> Ок</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleReject(it)}><X className="w-4 h-4 mr-1" /> Нет</Button>
                                    </div>
                                </div>
                            ))}
                            {pending.length === 0 && <div className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest italic border-4 border-dashed rounded-[3rem] dark:border-gray-800">Все чисто! Нет контента на модерацию</div>}
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
                                <button onClick={() => setFeedbackSubTab('reports')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${feedbackSubTab === 'reports' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' : 'text-gray-400'}`}>Жалобы ({reports.length})</button>
                                <button onClick={() => setFeedbackSubTab('ideas')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${feedbackSubTab === 'ideas' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>Предложения ({suggestions.length})</button>
                            </div>

                            <div className="space-y-4">
                                {feedbackSubTab === 'reports' ? (
                                    reports.map(r => (
                                        <div key={r.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm flex gap-4">
                                            <div className="p-3 bg-red-50 text-red-500 rounded-2xl h-fit shrink-0"><AlertTriangle className="w-6 h-6" /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <Link to={`/user/${r.userId}`}>
                                                            <img src={r.userAvatar || `https://ui-avatars.com/api/?name=${r.userName}`} className="w-10 h-10 rounded-full object-cover border dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all" alt="" />
                                                        </Link>
                                                        <div>
                                                            <Link to={`/user/${r.userId}`} className="font-bold text-sm dark:text-white hover:text-blue-600 transition-colors">{r.userName}</Link>
                                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{new Date(r.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <Badge color={r.status === 'new' ? 'red' : 'green'}>{r.status}</Badge>
                                                </div>
                                                <p className="font-bold text-[10px] dark:text-white mb-2 uppercase tracking-widest text-gray-400">ID объекта: {r.targetId} ({r.targetType})</p>
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">"{r.reason}"</p>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <Button size="sm" variant="danger" className="rounded-xl px-4 text-[10px] font-black uppercase" onClick={() => handleDeleteEntity('reports', r.id, 'adminReports')}>Удалить жалобу</Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    suggestions.map(s => (
                                        <div key={s.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm flex gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl h-fit shrink-0"><Lightbulb className="w-6 h-6" /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Link to={`/user/${s.userId}`}>
                                                        <img src={s.userAvatar || `https://ui-avatars.com/api/?name=${s.userName}`} className="w-10 h-10 rounded-full object-cover border dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all" alt="" />
                                                    </Link>
                                                    <div>
                                                        <Link to={`/user/${s.userId}`} className="font-bold text-sm dark:text-white hover:text-blue-600 transition-colors">{s.userName}</Link>
                                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{new Date(s.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">"{s.text}"</p>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <Button size="sm" variant="danger" className="rounded-xl px-4 text-[10px] font-black uppercase" onClick={() => handleDeleteEntity('suggestions', s.id, 'adminSuggestions')}>Удалить предложение</Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {(feedbackSubTab === 'reports' ? reports : suggestions).length === 0 && <div className="p-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest italic border-2 border-dashed rounded-3xl dark:border-gray-800">Обращений пока нет</div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'promotions' && isAdmin && (
                        <div className="space-y-8 animate-in fade-in">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-black text-xl dark:text-white uppercase">Баннеры</h3>
                                    <Button size="sm" onClick={() => setModal('banner')}><Plus className="w-4 h-4 mr-2"/> Добавить</Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {banners.map(b => (
                                        <div key={b.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border dark:border-gray-700 flex gap-4">
                                            <img src={b.image_url} className="w-20 h-20 rounded-xl object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm dark:text-white truncate">{b.title || 'Без названия'}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black">{b.position}</p>
                                                <div className="mt-3 flex gap-2">
                                                    <button onClick={() => openEditModal('banner', b)} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"><Pencil className="w-3.5 h-3.5"/></button>
                                                    <button onClick={() => handleDeleteEntity('banners', b.id, 'banners')} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-black text-xl dark:text-white uppercase">Промо-акции</h3>
                                    <Button size="sm" onClick={() => setModal('promo')}><Plus className="w-4 h-4 mr-2"/> Добавить</Button>
                                </div>
                                <div className="space-y-4">
                                    {promoAds.map(p => (
                                        <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border dark:border-gray-700 flex items-center gap-4">
                                            <img src={p.image_url} className="w-16 h-16 rounded-xl object-cover" />
                                            <div className="flex-1">
                                                <p className="font-bold dark:text-white">{p.title}</p>
                                                <p className="text-xs text-blue-600 font-bold">{p.price} ₽</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditModal('promo', p)} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"><Pencil className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteEntity('promo_ads', p.id, 'promoAds')} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'city-data' && isAdmin && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full overflow-x-auto scrollbar-hide">
                                {(['news', 'events', 'transport', 'quests', 'campaigns', 'exclusive_pages'] as const).map(tab => (
                                    <button key={tab} onClick={() => setCitySubTab(tab)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${citySubTab === tab ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>{cityTabLabels[tab] || tab}</button>
                                ))}
                            </div>

                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-lg dark:text-white uppercase">{cityTabLabels[citySubTab]}</h3>
                                <Button size="sm" onClick={() => setModal(citySubTab as any)}><Plus className="w-4 h-4 mr-2"/> Добавить</Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {citySubTab === 'news' && news.map(n => (
                                    <div key={n.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group">
                                        <span className="font-bold dark:text-white truncate pr-4">{n.title}</span>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => openEditModal('news', n)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil className="w-4 h-4 text-gray-400"/></button>
                                            <button onClick={() => handleDeleteEntity('news', n.id, 'news')} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'events' && events.map(e => (
                                    <div key={e.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group">
                                        <span className="font-bold dark:text-white truncate pr-4">{e.title}</span>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => openEditModal('event', e)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil className="w-4 h-4 text-gray-400"/></button>
                                            <button onClick={() => handleDeleteEntity('events', e.id, 'events')} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'transport' && transport.map(t => (
                                    <div key={t.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group">
                                        <div><span className="font-bold dark:text-white">{t.title}</span><p className="text-[10px] text-gray-400 uppercase">{t.type}</p></div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => openEditModal('transport', t)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil className="w-4 h-4 text-gray-400"/></button>
                                            <button onClick={() => handleDeleteEntity('transport_schedules', t.id, 'transport')} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'exclusive_pages' && exclusivePages.map(p => (
                                    <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group">
                                        <span className="font-bold dark:text-white">{p.title}</span>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => openEditModal('exclusive', p)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil className="w-4 h-4 text-gray-400"/></button>
                                            <button onClick={() => handleDeleteEntity('exclusive_pages', p.id, 'exclusivePages')} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'quests' && quests.map(q => (
                                    <div key={q.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group">
                                        <span className="font-bold dark:text-white">{q.title}</span>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => openEditModal('quest', q)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil className="w-4 h-4 text-gray-400"/></button>
                                            <button onClick={() => handleDeleteEntity('quests', q.id, 'quests')} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'campaigns' && campaigns.map(c => (
                                    <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group">
                                        <span className="font-bold dark:text-white">{c.title}</span>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => openEditModal('campaign', c)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil className="w-4 h-4 text-gray-400"/></button>
                                            <button onClick={() => handleDeleteEntity('campaigns', c.id, 'campaigns')} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && isAdmin && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Поиск жителей по имени или email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 overflow-hidden shadow-sm">
                                {profiles.map(p => (
                                    <div key={p.id} className="p-4 border-b dark:border-gray-700 last:border-0 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <Link to={`/user/${p.id}`}>
                                                <img src={p.avatar} className="w-12 h-12 rounded-2xl object-cover border dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all" />
                                            </Link>
                                            <div>
                                                <Link to={`/user/${p.id}`} className="font-bold dark:text-white hover:text-blue-600 transition-colors">{p.name}</Link>
                                                <p className="text-xs text-gray-400">{p.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select className="bg-gray-50 dark:bg-gray-700 text-xs font-bold p-2 rounded-xl outline-none" value={p.role} onChange={e => handleUpdateUserRole(p.id, e.target.value as UserRole)}>
                                                <option value="USER">Житель</option>
                                                <option value="BUSINESS">Бизнес</option>
                                                <option value="MODERATOR">Модератор</option>
                                                <option value="ADMIN">Админ</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'moderation-logs' && isAdmin && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Лог действий модераторов</h2>
                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 overflow-hidden shadow-sm">
                                {modLogsLoading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div> :
                                modLogs.map(log => (
                                    <div key={log.id} className="p-6 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${log.action === 'deleted' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                    {log.action === 'deleted' ? <Trash2 className="w-4 h-4"/> : <ShieldAlert className="w-4 h-4"/>}
                                                </div>
                                                <div>
                                                    <div className="font-black text-sm dark:text-white uppercase tracking-tighter">
                                                        {log.action === 'deleted' ? 'Удалено' : 'Отклонено'}: <span className="text-gray-400">{log.targetType}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Модератор: {log.moderatorName}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-gray-400 uppercase">{new Date(log.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700">
                                            <p className="text-xs font-bold text-red-500 mb-2 uppercase tracking-widest">Причина: {log.reason}</p>
                                            <div className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                                                <span className="font-bold text-gray-400">Снимок контента:</span>
                                                <p className="mt-1 line-clamp-3">{(log.contentSnapshot?.title || log.contentSnapshot?.text || log.contentSnapshot?.description || JSON.stringify(log.contentSnapshot))}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {modLogs.length === 0 && <div className="p-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest italic">Логов пока нет</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Ad, Business, UserRole, Story, TransportSchedule, Banner, Report, Suggestion, NewsItem, Event, Campaign, Quest, Ride, AccessRequest, PromoAd, ExclusivePage } from '../types';
import { Button, XPBar, Badge, Rating } from '../components/ui/Common';
import { Img } from '../components/ui/Image';
import { 
    User as UserIcon, Settings, Loader2, Plus, 
    ShoppingBag, Check, X, 
    Trophy, MapPin, Shield, Star, Crown, Zap,
    BarChart3, FileText, Calendar, Bus, Image as ImageIcon, Heart, AlertTriangle, Lightbulb, CheckCircle2, Trash2, Pencil, Car, ChevronRight, RefreshCw, UserCircle,
    ArrowRight, Users, ShieldCheck, Key, Megaphone, Flag, Info, Building2, Clock, Wallet, Layout as LayoutIcon, MessageSquare
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
    
    const { data: user, isLoading: userLoading } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const { data: myContent, isLoading: contentLoading } = useQuery({ queryKey: ['myContent', user?.id], queryFn: () => api.getUserContent(user?.id!), enabled: !!user?.id });
    const { data: myRides = [], isLoading: ridesLoading } = useQuery({ queryKey: ['myRides', user?.id], queryFn: () => api.getMyRides(), enabled: !!user?.id });
    const { data: favoriteItems, isLoading: loadingFavs } = useQuery({ queryKey: ['favoritesData', user?.favorites], queryFn: () => api.getFavorites(user?.favorites || []), enabled: !!user?.id });

    useEffect(() => {
        if (activeTab === 'rides' && myRides.length === 0 && !ridesLoading) setActiveTab('my-ads');
    }, [myRides.length, activeTab, ridesLoading]);

    if (userLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!user) return <div className="p-10 text-center font-bold">Войдите в аккаунт</div>;

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
        if (!confirm("Удалить поездку? Все брони будут отменены.")) return;
        await api.deleteRide(id);
        queryClient.invalidateQueries({ queryKey: ['myRides'] });
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-24">
            {editingAd && <EditAdModal ad={editingAd} isOpen={!!editingAd} onClose={() => setEditingAd(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['myContent', user.id] })} />}

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 lg:p-12 shadow-sm border dark:border-gray-700 mb-12 flex flex-col md:flex-row items-center gap-10">
                <div className="relative">
                    <img src={user.avatar} className="w-40 h-40 rounded-[2.5rem] object-cover border-8 border-gray-50 dark:border-gray-700 shadow-2xl bg-gray-200" alt="" />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800"><Zap className="w-5 h-5 fill-current" /></div>
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
                             {user.role === UserRole.ADMIN && <Link to="/admin"><Button variant="danger">Админка</Button></Link>}
                             <Button variant="outline" onClick={() => navigate('/settings')} className="rounded-2xl"><Settings className="w-5 h-5 mr-2" /> Настройки</Button>
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
                    <Car className="w-4 h-4" /> Мои поездки <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px] ml-1 font-bold">{myRides.length}</span>
                </button>
            </div>

            <section className="animate-in fade-in duration-300">
                {activeTab === 'my-ads' && (
                    myAds.length === 0 ? <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest border-4 border-dashed rounded-[2rem] dark:border-gray-700">У вас нет объявлений</div> :
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myAds.map(ad => (
                            <div key={ad.id} className="bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group relative">
                                <div className="aspect-[4/3] overflow-hidden"><Img src={ad.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg dark:text-white line-clamp-1">{ad.title}</h3>
                                    <p className="text-blue-600 font-black text-xl mt-2">{ad.price} ₽</p>
                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1 rounded-xl" onClick={() => setEditingAd(ad)}><Pencil className="w-4 h-4 mr-2" /> Правка</Button>
                                        <Button size="sm" variant="danger" className="rounded-xl" onClick={() => { if(confirm("Удалить?")) api.deleteEntity('ads', ad.id).then(() => queryClient.invalidateQueries({queryKey:['myContent']})); }}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'favorites' && (
                    loadingFavs ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div> :
                    (favAds.length === 0 && favBusinesses.length === 0) ? <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest border-4 border-dashed rounded-[2rem] dark:border-gray-700">В избранном пока пусто</div> :
                    <div className="space-y-8">
                        {favAds.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favAds.map(ad => (
                                    <Link to={`/ad/${ad.id}`} key={ad.id} className="bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group relative">
                                        <div className="aspect-[4/3] overflow-hidden"><img src={ad.image} className="w-full h-full object-cover" /></div>
                                        <div className="p-5">
                                            <h4 className="font-bold dark:text-white line-clamp-1">{ad.title}</h4>
                                            <p className="text-blue-600 font-black mt-1">{ad.price} ₽</p>
                                        </div>
                                        <button onClick={(e) => handleRemoveFavorite(ad.id, e)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Heart className="w-4 h-4 fill-current" /></button>
                                    </Link>
                                ))}
                            </div>
                        )}
                        {favBusinesses.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favBusinesses.map(biz => (
                                    <Link to={`/business/${biz.id}`} key={biz.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border dark:border-gray-700 shadow-sm flex items-center gap-4 group">
                                        <img src={biz.image} className="w-16 h-16 rounded-2xl object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold dark:text-white truncate">{biz.name}</h4>
                                            <div className="flex items-center gap-2 mt-1"><Rating value={biz.rating} /><span className="text-[10px] text-gray-400 uppercase font-black">{biz.category}</span></div>
                                        </div>
                                        <button onClick={(e) => handleRemoveFavorite(biz.id, e)} className="p-2 text-red-500"><Heart className="w-5 h-5 fill-current" /></button>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'rides' && (
                    ridesLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div> :
                    myRides.length === 0 ? <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest border-4 border-dashed rounded-[2rem] dark:border-gray-700">У вас нет активных поездок</div> :
                    <div className="space-y-6">
                        {myRides.map(ride => (
                            <div key={ride.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Car className="w-6 h-6" /></div>
                                            <div className="flex items-center gap-4 font-black text-xl lg:text-2xl dark:text-white">
                                                <span>{ride.fromCity}</span>
                                                <ArrowRight className="w-5 h-5 text-gray-300" />
                                                <span>{ride.toCity}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Дата и Время</p>
                                                <p className="font-bold text-sm dark:text-white flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(ride.date).toLocaleDateString()} в {ride.time}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Автомобиль</p>
                                                <p className="font-bold text-sm dark:text-white truncate">{ride.carModel || 'Не указан'}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Места</p>
                                                <p className="font-bold text-sm text-blue-600 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Свободно: {ride.seats}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Цена</p>
                                                <p className="font-bold text-sm text-green-600 flex items-center gap-2"><Wallet className="w-3.5 h-3.5" /> {ride.price} ₽</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto shrink-0 flex md:flex-col gap-3">
                                        <Button variant="danger" className="flex-1 md:w-full rounded-2xl py-3" onClick={() => handleDeleteRide(ride.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Удалить поездку
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t dark:border-gray-700">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Пассажиры поездки</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {ride.passengerDetails && ride.passengerDetails.length > 0 ? (
                                            ride.passengerDetails.map(p => (
                                                <Link 
                                                    key={p.id} 
                                                    to={`/user/${p.id}`}
                                                    className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 pr-4 rounded-full border dark:border-gray-700 shadow-sm hover:scale-105 transition-all"
                                                >
                                                    <img src={p.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                    <span className="text-xs font-bold dark:text-white">{p.name}</span>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="text-xs text-gray-400 font-medium italic py-2 flex items-center gap-2">
                                                <Info className="w-4 h-4" /> Пока никто не забронировал места
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'stats' | 'moderation' | 'feedback' | 'city-data' | 'promotions'>('stats');
    const [feedbackSubTab, setFeedbackSubTab] = useState<'reports' | 'ideas'>('reports');
    const [citySubTab, setCitySubTab] = useState<'banners' | 'exclusive_pages' | 'news' | 'events' | 'transport' | 'quests' | 'campaigns'>('banners');
    const [modal, setModal] = useState<'banner' | 'transport' | 'quest' | 'campaign' | 'news' | 'event' | 'promo' | 'exclusive' | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: stats } = useQuery({ queryKey: ['adminStats'], queryFn: api.getSystemStats });
    const { data: pending = [] } = useQuery({ queryKey: ['pendingContent'], queryFn: api.getAllPendingContent });
    const { data: reports = [] } = useQuery({ queryKey: ['adminReports'], queryFn: api.getAdminReports });
    const { data: suggestions = [] } = useQuery({ queryKey: ['adminSuggestions'], queryFn: api.getAdminSuggestions });

    // City Data Queries
    const { data: banners = [] } = useQuery({ queryKey: ['banners'], queryFn: api.getBanners });
    const { data: exclusivePages = [] } = useQuery({ queryKey: ['exclusivePages'], queryFn: api.getExclusivePages });
    const { data: transport = [] } = useQuery({ queryKey: ['transport'], queryFn: api.getTransportSchedules });
    const { data: promoAds = [] } = useQuery({ queryKey: ['promoAds'], queryFn: api.getPromoAds });
    const { data: news = [] } = useQuery({ queryKey: ['news'], queryFn: api.getNews });
    const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: api.getEvents });

    const handleApprove = async (item: any) => {
        await api.approveContent(item._table, item.id);
        queryClient.invalidateQueries({ queryKey: ['pendingContent'] });
    };

    const handleReject = async (item: any) => {
        if (!confirm("Отклонить?")) return;
        await api.rejectContent(item._table, item.id);
        queryClient.invalidateQueries({ queryKey: ['pendingContent'] });
    };

    const handleDeleteEntity = async (table: string, id: string, queryKey: string) => {
        if (!confirm("Удалить навсегда?")) return;
        await api.deleteEntity(table, id);
        queryClient.invalidateQueries({ queryKey: [queryKey] });
    };

    const openEditModal = (type: any, item: any) => {
        setEditingItem(item);
        setModal(type);
    };

    const closeModals = () => {
        setModal(null);
        setEditingItem(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 pb-24">
            <CreateBannerModal item={editingItem} isOpen={modal === 'banner'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['banners'] })} />
            <CreateTransportModal item={editingItem} isOpen={modal === 'transport'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['transport'] })} />
            <CreatePromoAdModal item={editingItem} isOpen={modal === 'promo'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['promoAds'] })} />
            <CreateNewsModal item={editingItem} isOpen={modal === 'news'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['news'] })} />
            <CreateEventModal item={editingItem} isOpen={modal === 'event'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['events'] })} />
            <CreateExclusivePageModal item={editingItem} isOpen={modal === 'exclusive'} onClose={closeModals} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['exclusivePages'] })} />

            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <ShieldCheck className="w-10 h-10 text-red-600" /> Центр Управления
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: 'stats', label: 'Статистика', icon: BarChart3, color: 'bg-blue-600' },
                        { id: 'promotions', label: 'Реклама', icon: Megaphone, color: 'bg-orange-600' },
                        { id: 'moderation', label: 'Модерация', icon: Shield, color: 'bg-indigo-600', badge: pending.length },
                        { id: 'feedback', label: 'Обратная связь', icon: MessageSquare, color: 'bg-red-600', badge: reports.length + (suggestions.filter(s => !s.isRead).length) },
                        { id: 'city-data', label: 'Данные города', icon: Settings, color: 'bg-gray-700' },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === item.id ? `${item.color} text-white shadow-lg` : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}>
                            <div className="flex items-center gap-3"><item.icon className="w-5 h-5" /> {item.label}</div>
                            {item.badge && item.badge > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{item.badge}</span>}
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3">
                    {activeTab === 'promotions' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black dark:text-white uppercase">Рекламные предложения</h2>
                                <Button size="sm" onClick={() => setModal('promo')}><Plus className="w-4 h-4 mr-2"/> Добавить акцию</Button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {promoAds.map(ad => (
                                    <div key={ad.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center gap-4 group">
                                        <img src={ad.image_url} className="w-24 h-24 rounded-xl object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold dark:text-white truncate">{ad.title}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2">{ad.description}</p>
                                            <div className="mt-2 flex gap-2">
                                                <Badge color="blue">{ad.price ? `${ad.price} ₽` : 'Без цены'}</Badge>
                                                <Badge color="gray">{ad.link_url ? 'Есть ссылка' : 'Без ссылки'}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEditModal('promo', ad)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl"><Pencil className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteEntity('promo_ads', ad.id, 'promoAds')} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in">
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
                    )}

                    {activeTab === 'moderation' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            {pending.length === 0 ? <p className="text-center py-20 text-gray-400">Очередь пуста</p> : 
                            pending.map((item: any) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border dark:border-gray-700 flex justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-500 shrink-0">
                                            {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <FileText className="w-6 h-6" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-black uppercase text-blue-500">{item.typeLabel}</div>
                                            <h3 className="font-bold dark:text-white truncate">{item.displayTitle}</h3>
                                            <p className="text-xs text-gray-500">Автор: {item.authorName}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleReject(item)}><X className="w-4 h-4 mr-1" /> Отклонить</Button>
                                        <Button size="sm" className="bg-green-600" onClick={() => handleApprove(item)}><Check className="w-4 h-4 mr-1" /> Одобрить</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                             <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                                <button onClick={() => setFeedbackSubTab('reports')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${feedbackSubTab === 'reports' ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' : 'text-gray-400'}`}>Жалобы ({reports.length})</button>
                                <button onClick={() => setFeedbackSubTab('ideas')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${feedbackSubTab === 'ideas' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-400'}`}>Предложения ({suggestions.length})</button>
                            </div>

                            {feedbackSubTab === 'reports' ? (
                                <div className="space-y-4">
                                    {reports.length === 0 ? <p className="text-center py-20 text-gray-400">Жалоб нет</p> : 
                                    reports.map(r => (
                                        <div key={r.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border dark:border-gray-700 flex flex-col gap-4 group">
                                            <div className="flex justify-between items-start">
                                                <Link to={`/user/${r.userId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                    <img src={r.userAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-12 h-12 rounded-full border-2 border-red-100 dark:border-gray-700" alt="" />
                                                    <div>
                                                        <div className="font-black text-sm dark:text-white">{r.userName}</div>
                                                        <div className="text-[10px] text-red-500 font-black uppercase tracking-widest">
                                                            Объект: {r.targetType === 'app' ? 'ПРИЛОЖЕНИЕ' : r.targetType === 'ad' ? 'ОБЪЯВЛЕНИЕ' : r.targetType.toUpperCase()}
                                                        </div>
                                                    </div>
                                                </Link>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm dark:text-gray-300 bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/50 italic leading-relaxed">
                                                "{r.reason}"
                                            </p>
                                            <div className="flex gap-2 pt-2 justify-between">
                                                {r.targetId !== 'general' && <Button size="sm" variant="outline" className="text-xs rounded-xl" onClick={() => navigate(r.targetType === 'ad' ? `/ad/${r.targetId}` : `/user/${r.targetId}`)}>Открыть объект</Button>}
                                                <Button size="sm" variant="danger" className="text-xs rounded-xl" onClick={() => handleDeleteEntity('reports', r.id, 'adminReports')}>Удалить жалобу</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {suggestions.length === 0 ? <p className="text-center py-20 text-gray-400">Предложений пока нет</p> : 
                                    suggestions.map(s => (
                                        <div key={s.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border dark:border-gray-700 flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <Link to={`/user/${s.userId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                    <img src={s.userAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-12 h-12 rounded-full border-2 border-blue-100 dark:border-gray-700" alt="" />
                                                    <div>
                                                        <div className="font-black text-sm dark:text-white">{s.userName}</div>
                                                        <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Предложение идеи</div>
                                                    </div>
                                                </Link>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(s.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/50 italic leading-relaxed">
                                                "{s.text}"
                                            </p>
                                            <div className="flex justify-end">
                                                <Button size="sm" variant="outline" className="text-xs rounded-xl" onClick={() => handleDeleteEntity('suggestions', s.id, 'adminSuggestions')}>Удалить</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'city-data' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">Данные Города</h2>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="rounded-xl h-10 px-3" onClick={() => setModal('exclusive')}><LayoutIcon className="w-4 h-4 mr-1" /> Лендинг</Button>
                                    <Button size="sm" variant="outline" className="rounded-xl h-10 px-3" onClick={() => setModal('banner')}><ImageIcon className="w-4 h-4 mr-1" /> Баннер</Button>
                                    <Button size="sm" variant="outline" className="rounded-xl h-10 px-3" onClick={() => setModal('news')}><FileText className="w-4 h-4 mr-1" /> Новость</Button>
                                    <Button size="sm" variant="outline" className="rounded-xl h-10 px-3" onClick={() => setModal('event')}><Calendar className="w-4 h-4 mr-1" /> Афиша</Button>
                                </div>
                            </div>

                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-x-auto scrollbar-hide">
                                {['banners', 'exclusive_pages', 'news', 'events', 'transport', 'quests', 'campaigns'].map(sub => (
                                    <button key={sub} onClick={() => setCitySubTab(sub as any)} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${citySubTab === sub ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                        {sub === 'banners' ? 'Баннеры' : sub === 'exclusive_pages' ? 'Лендинги' : sub === 'news' ? 'Новости' : sub === 'events' ? 'Афиша' : sub === 'transport' ? 'Транспорт' : sub === 'quests' ? 'Квесты' : 'Сборы'}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 overflow-hidden shadow-sm">
                                {citySubTab === 'exclusive_pages' && exclusivePages.map(p => (
                                    <div key={p.id} className="p-5 flex items-center gap-5 border-b dark:border-gray-700 last:border-0 group">
                                        <img src={p.image_url} className="w-16 h-16 rounded-2xl object-cover bg-gray-100 shadow-inner" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold dark:text-white text-base truncate">{p.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Позиция: {p.idx + 4} страница</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleDeleteEntity('exclusive_pages', p.id, 'exclusivePages')} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}

                                {citySubTab === 'banners' && banners.map(b => (
                                    <div key={b.id} className="p-5 flex items-center gap-5 border-b dark:border-gray-700 last:border-0 group">
                                        <img src={b.image_url} className="w-32 h-18 rounded-2xl object-cover bg-gray-100 shadow-inner" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold dark:text-white text-base truncate">{b.title || 'Без названия'}</h4>
                                            <p className="text-[10px] text-gray-400 truncate max-w-xs">{b.link_url}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => openEditModal('banner', b)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl"><Pencil className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteEntity('banners', b.id, 'banners')} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}

                                {citySubTab === 'news' && news.map(n => (
                                    <div key={n.id} className="p-5 flex items-center gap-5 border-b dark:border-gray-700 last:border-0 group">
                                        <img src={n.image} className="w-16 h-16 rounded-2xl object-cover shadow-inner" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold dark:text-white text-base truncate">{n.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{n.category} • {n.date}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => openEditModal('news', n)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl"><Pencil className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteEntity('news', n.id, 'news')} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}

                                {citySubTab === 'events' && events.map(e => (
                                    <div key={e.id} className="p-5 flex items-center gap-5 border-b dark:border-gray-700 last:border-0 group">
                                        <img src={e.image} className="w-16 h-16 rounded-2xl object-cover shadow-inner" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold dark:text-white text-base truncate">{e.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{e.date} • {e.location}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => openEditModal('event', e)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl"><Pencil className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteEntity('events', e.id, 'events')} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}

                                {citySubTab === 'transport' && transport.map(t => (
                                    <div key={t.id} className="p-5 flex items-center justify-between border-b dark:border-gray-700 last:border-0 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black text-xs">{t.routeNumber || '№'}</div>
                                            <div>
                                                <span className="font-bold dark:text-white text-base">{t.title}</span>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{t.type === 'city' ? 'Городской' : t.type === 'intercity' ? 'Межгород' : 'Такси'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => openEditModal('transport', t)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl"><Pencil className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteEntity('transport_schedules', t.id, 'transport')} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

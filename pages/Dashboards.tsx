
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { User, Ad, Business, UserRole, Story, TransportSchedule, Banner, Report, Suggestion, NewsItem, Event, Campaign, Quest, Ride, AccessRequest, PromoAd, ExclusivePage, ModerationLog, Achievement } from '../types';
import { Button, XPBar, Badge, Rating, UserStatus, BadgeIcon } from '../components/ui/Common';
import { Img } from '../components/ui/Image';
import { 
    User as UserIcon, Settings, Loader2, Plus, 
    ShoppingBag, Check, X, 
    Trophy, MapPin, Shield, Star, Crown, Zap,
    BarChart3, FileText, Calendar, Bus, Image as ImageIcon, Heart, AlertTriangle, Lightbulb, CheckCircle, Trash2, Pencil, Car, ChevronRight, RefreshCw, UserCircle,
    ArrowRight, Users, ShieldCheck, Key, Megaphone, Flag, Info, Building2, Clock, Wallet, Layout as LayoutIcon, MessageSquare, Search, History, Eye, ShieldAlert, Target, AlignLeft,
    Mail, Briefcase, UserCheck, PlaySquare
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ToastProvider';
import { CreateNewsModal } from '../components/CreateNewsModal';
import { CreateEventModal } from '../components/CreateEventModal';
import { CreateQuestModal, CreateAdminCampaignModal, CreateBannerModal, CreateTransportModal, CreatePromoAdModal, CreateExclusivePageModal } from '../components/AdminModals';
import { EditAdModal } from '../components/EditAdModal';

const formatDisplayDate = (dateStr: string): string => {
    try {
        if (!dateStr || dateStr === 'Invalid Date') return 'Недавно';
        const normalized = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
        const d = new Date(normalized);
        if (isNaN(d.getTime())) return 'Некорректная дата';
        return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return 'Некорректная дата'; }
};

const DeleteConfirmModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title?: string;
    loading?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-sm p-8 shadow-2xl text-center border dark:border-gray-700 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                    <Trash2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white mb-4">Удаление</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    {title ? `Вы уверены, что хотите удалить "${title}"?` : "Вы уверены, что хотите удалить этот объект навсегда?"}
                </p>
                <div className="flex flex-col gap-3">
                    <Button 
                        variant="danger" 
                        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConfirm(); }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Подтверждаю удаление'}
                    </Button>
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                        className="py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [activeTab, setActiveTab] = useState<'my-ads' | 'favorites' | 'achievements'>('my-ads');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string, title?: string } | null>(null);
    
    const { data: user, isLoading: userLoading } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const { data: myContent } = useQuery({ queryKey: ['myContent', user?.id], queryFn: () => api.getUserContent(user?.id!), enabled: !!user?.id });
    const { data: favoriteItems } = useQuery({ queryKey: ['favoritesData', user?.favorites], queryFn: () => api.getFavorites(user?.favorites || []), enabled: !!user?.id });
    const { data: achievements = [] } = useQuery({ queryKey: ['achievements'], queryFn: api.getAchievements, enabled: !!user?.id });

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

    const confirmDeleteAd = async () => {
        if (!deleteTarget) return;
        await api.deleteEntity('ads', deleteTarget.id, 'Удалено автором');
        queryClient.invalidateQueries({queryKey:['myContent']});
        setDeleteTarget(null);
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getGenderLabel = (gender?: string) => {
        if (gender === 'male') return 'Мужчина';
        if (gender === 'female') return 'Женщина';
        if (gender === 'other') return 'Другой';
        return null;
    };

    const displayedBadges = Array.isArray(user.showcasedBadges) ? user.showcasedBadges : user.badges.slice(0, 3);
    const age = calculateAge(user.birthDate || '');
    const genderLabel = getGenderLabel(user.gender);

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pt-24 pb-24 md:pt-8">
            {editingAd && <EditAdModal ad={editingAd} isOpen={!!editingAd} onClose={() => setEditingAd(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['myContent', user.id] })} />}
            <DeleteConfirmModal 
                isOpen={!!deleteTarget} 
                onClose={() => setDeleteTarget(null)} 
                onConfirm={confirmDeleteAd} 
                title={deleteTarget?.title}
            />
            
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 lg:p-12 shadow-sm border dark:border-gray-700 mb-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 pointer-events-none"></div>

                <div className="relative z-10 shrink-0">
                    <img src={user.avatar} className="w-40 h-40 rounded-[2.5rem] object-cover border-8 border-white dark:border-gray-700 shadow-2xl bg-gray-200" />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left w-full z-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <div>
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black dark:text-white uppercase tracking-tighter">
                                    {user.name}
                                </h1>
                                <div className="flex justify-center md:justify-start gap-1.5">
                                    {displayedBadges.map(bId => (
                                        <BadgeIcon key={bId} name={bId} size="sm" />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">
                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> {user.email}</span>
                                {age !== null && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-orange-500" /> {age} лет {genderLabel ? `(${genderLabel})` : ''}</span>}
                                {user.occupation && <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-purple-500" /> {user.occupation}</span>}
                            </div>

                            {user.bio && (
                                <div className="max-w-lg mb-6 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border dark:border-gray-700 italic text-sm text-gray-600 dark:text-gray-400 flex items-start gap-3 mx-auto md:mx-0">
                                    <AlignLeft className="w-4 h-4 shrink-0 mt-1 opacity-50" />
                                    "{user.bio}"
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 justify-center">
                            {(user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) && (
                                <Link to="/admin">
                                    <Button variant="danger" className="rounded-2xl px-6 uppercase font-black text-[10px] tracking-widest shadow-xl shadow-red-500/10">
                                        {user.role === UserRole.ADMIN ? 'Управление' : 'Модерация'}
                                    </Button>
                                </Link>
                            )}
                            <Button variant="outline" onClick={() => navigate('/settings')} className="rounded-2xl px-6">
                                <Settings className="w-5 h-5 mr-2" /> Настройки
                            </Button>
                        </div>
                    </div>
                    <div className="max-w-md mx-auto md:mx-0"><XPBar xp={user.xp} /></div>
                </div>
            </div>

            <div className="flex border-b dark:border-gray-700 mb-8 gap-8 px-2 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveTab('my-ads')} className={`pb-4 text-sm font-black uppercase tracking-widest relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'my-ads' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
                    <ShoppingBag className="w-4 h-4" /> Мои объявления <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px] ml-1 font-bold">{myAds.length}</span>
                </button>
                <button onClick={() => setActiveTab('achievements')} className={`pb-4 text-sm font-black uppercase tracking-widest relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'achievements' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}>
                    <Trophy className="w-4 h-4" /> Достижения <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px] ml-1 font-bold">{user.badges.length}</span>
                </button>
                <button onClick={() => setActiveTab('favorites')} className={`pb-4 text-sm font-black uppercase tracking-widest relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'favorites' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}>
                    <Heart className="w-4 h-4" /> Избранное <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px] ml-1 font-bold">{displayFavCount}</span>
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
                                        <Img src={ad.image} className="w-full h-full object-cover transition-transform" />
                                        {ad.status === 'pending' && <div className="absolute top-4 left-4 bg-yellow-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">На проверке</div>}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg dark:text-white line-clamp-1">{ad.title}</h3>
                                        <p className="text-blue-600 font-black text-xl mt-2">{ad.price} ₽</p>
                                        <div className="mt-4 flex gap-2">
                                            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setEditingAd(ad)}>
                                                <Pencil className="w-4 h-4 mr-2" /> Провка
                                            </Button>
                                            <Button size="sm" variant="danger" className="rounded-xl" onClick={() => setDeleteTarget({id: ad.id, title: ad.title})}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'achievements' && (
                    <div className="space-y-10 animate-in fade-in">
                        <div className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-[2.5rem] border border-orange-100 dark:border-orange-800/30 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Дорожная карта</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Твой путь к статусу легенды Снежинска</p>
                            </div>
                            <div className="flex gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-orange-600 leading-none mb-1">{user.badges.length}</div>
                                    <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Открыто</div>
                                </div>
                                <div className="w-[1px] h-10 bg-orange-200 dark:bg-orange-800"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-black text-gray-300 leading-none mb-1">{achievements.length - user.badges.length}</div>
                                    <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Осталось</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {achievements.map((ach) => {
                                const isShowcased = Array.isArray(user.showcasedBadges) && user.showcasedBadges.includes(ach.id);
                                return (
                                <div key={ach.id} className={`p-6 rounded-[2rem] border transition-all relative ${ach.isUnlocked ? 'bg-white dark:bg-gray-800 border-orange-100 dark:border-orange-900 shadow-lg shadow-orange-500/5' : 'bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 opacity-60'}`}>
                                    {isShowcased && <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 z-10" title="На витрине"><Check className="w-3 h-3 stroke-[4]" /></div>}
                                    
                                    <div className="flex gap-4 items-start mb-6">
                                        <BadgeIcon name={ach.icon} size="md" isLocked={!ach.isUnlocked} />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-sm uppercase dark:text-white truncate">{ach.name}</h3>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{ach.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                            <span className={ach.isUnlocked ? 'text-orange-500' : 'text-gray-400'}>{ach.isUnlocked ? 'Выполнено' : 'В процессе'}</span>
                                            <span className="text-gray-400">{ach.current} / {ach.goal}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 rounded-full ${ach.isUnlocked ? 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-blue-600'}`} 
                                                style={{ width: `${(ach.current / ach.goal) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
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
            </section>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    const { success, error: showError } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'stats' | 'moderation' | 'feedback' | 'city-data' | 'promotions' | 'users' | 'moderation-logs'>('stats');
    const [feedbackSubTab, setFeedbackSubTab] = useState<'reports' | 'ideas'>('reports');
    const [citySubTab, setCitySubTab] = useState<'news' | 'banners' | 'events' | 'transport' | 'quests' | 'campaigns' | 'exclusive_pages' | 'stories'>('news');
    const [userSearch, setUserSearch] = useState('');
    const [modal, setModal] = useState<'banner' | 'transport' | 'quest' | 'campaign' | 'news' | 'event' | 'promo' | 'exclusive' | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{table: string, id: string, qKey: string, title?: string} | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [moderationLoading, setModerationLoading] = useState<string | null>(null);
    const [updatingRoleFor, setUpdatingRoleFor] = useState<string | null>(null);
    
    // Локальное состояние для мгновенного скрытия обработанных элементов модерации
    const [locallyProcessedIds, setLocallyProcessedIds] = useState<Set<string>>(new Set());
    
    const { data: currentUser } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    const { data: stats } = useQuery({ queryKey: ['adminStats'], queryFn: api.getSystemStats, enabled: isAdmin });
    const { data: pendingRaw = [], refetch: refetchPending } = useQuery({ 
        queryKey: ['pendingContent'], 
        queryFn: api.getAllPendingContent,
        staleTime: 30000 
    });
    const { data: reports = [] } = useQuery({ queryKey: ['adminReports'], queryFn: api.getAdminReports });
    const { data: suggestions = [] } = useQuery({ queryKey: ['adminSuggestions'], queryFn: api.getAdminSuggestions });
    const { data: profiles = [] } = useQuery({ queryKey: ['adminProfiles', userSearch], queryFn: () => api.getAllProfiles(userSearch), enabled: isAdmin });
    const { data: modLogs = [], isLoading: modLogsLoading } = useQuery({ queryKey: ['moderationLogs'], queryFn: api.getModerationLogs, enabled: isAdmin });

    const { data: banners = [] } = useQuery({ queryKey: ['banners'], queryFn: () => api.getBanners(), enabled: isAdmin && activeTab === 'city-data' });
    const { data: exclusivePages = [] } = useQuery({ queryKey: ['exclusivePages'], queryFn: api.getExclusivePages, enabled: isAdmin && activeTab === 'city-data' });
    const { data: transport = [] } = useQuery({ queryKey: ['transport'], queryFn: api.getTransportSchedules, enabled: isAdmin && activeTab === 'city-data' });
    const { data: promoAds = [] } = useQuery({ queryKey: ['promoAds'], queryFn: api.getPromoAds, enabled: isAdmin });
    const { data: news = [] } = useQuery({ queryKey: ['news'], queryFn: api.getNews, enabled: isAdmin && activeTab === 'city-data' });
    const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: api.getEvents, enabled: isAdmin && activeTab === 'city-data' });
    const { data: quests = [] } = useQuery({ queryKey: ['quests'], queryFn: api.getQuests, enabled: isAdmin && activeTab === 'city-data' });
    const { data: campaigns = [] } = useQuery({ queryKey: ['campaigns'], queryFn: api.getCampaigns, enabled: isAdmin && activeTab === 'city-data' });
    const { data: stories = [] } = useQuery({ queryKey: ['adminStories'], queryFn: api.getAdminStories, enabled: isAdmin && activeTab === 'city-data' });

    // Фильтруем данные модерации через локальное состояние
    const pending = useMemo(() => {
        return pendingRaw.filter(it => !locallyProcessedIds.has(`${it._table}-${it.id}`));
    }, [pendingRaw, locallyProcessedIds]);

    const cityTabLabels: Record<string, string> = {
        'news': 'Новости',
        'banners': 'Баннеры',
        'events': 'События',
        'transport': 'Транспорт',
        'quests': 'Квесты',
        'campaigns': 'Сборы',
        'exclusive_pages': 'Лендинги',
        'stories': 'Истории'
    };

    const handleApprove = async (item: any) => {
        const compositeId = `${item._table}-${item.id}`;
        console.info("Dashboard: START APPROVE CLICK", compositeId);
        
        // Оптимистичное скрытие из UI
        setLocallyProcessedIds(prev => new Set(prev).add(compositeId));
        setModerationLoading(compositeId);
        
        try {
            const ok = await api.approveContent(item._table, item.id);
            if (ok) {
                success("Одобрено!");
                await refetchPending();
            } else {
                throw new Error("Не удалось обновить статус");
            }
        } catch (e: any) {
            console.error("Dashboard: Moderation approve error:", e);
            setLocallyProcessedIds(prev => {
                const next = new Set(prev);
                next.delete(compositeId);
                return next;
            });
            showError(`Ошибка: ${e.message}`);
        } finally {
            setModerationLoading(null);
        }
    };

    const handleReject = async (item: any) => {
        const compositeId = `${item._table}-${item.id}`;
        const reason = prompt("Причина отклонения:");
        if (reason === null) return; 
        
        console.info("Dashboard: START REJECT CLICK", compositeId);
        
        setLocallyProcessedIds(prev => new Set(prev).add(compositeId));
        setModerationLoading(compositeId);
        
        try {
            const ok = await api.rejectContent(item._table, item.id, reason || 'Не соответствует правилам');
            if (ok) {
                success("Отклонено");
                await refetchPending();
            } else {
                throw new Error("Не удалось отклонить");
            }
        } catch (e: any) {
            console.error("Dashboard: Moderation reject error:", e);
            setLocallyProcessedIds(prev => {
                const next = new Set(prev);
                next.delete(compositeId);
                return next;
            });
            showError(`Ошибка: ${e.message}`);
        } finally {
            setModerationLoading(null);
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
        setUpdatingRoleFor(userId);
        try {
            const resultStatus = await api.updateEntity('profiles', userId, { role: newRole });
            if (resultStatus) {
                success(`Роль успешно изменена на ${newRole}`);
                await queryClient.refetchQueries({ queryKey: ['adminProfiles'] });
            } else {
                throw new Error("База данных не подтвердила обновление");
            }
        } catch (e: any) {
            showError(`Ошибка: ${e.message || "Нет прав или ошибка базы"}`);
        } finally {
            setUpdatingRoleFor(null);
        }
    };

    const triggerDelete = (e: React.MouseEvent, table: string, id: string, queryKey: string, itemName?: string) => {
        e.preventDefault(); e.stopPropagation();
        setDeleteConfirm({ table, id, qKey: queryKey, title: itemName });
    };

    const executeDelete = async () => {
        if (!deleteConfirm || isDeleting) return;
        setIsDeleting(true);
        try {
            const result = await api.deleteEntity(deleteConfirm.table, deleteConfirm.id, 'Удалено администратором');
            if (result) {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: [deleteConfirm.qKey] }),
                    queryClient.invalidateQueries({ queryKey: ['adminStats'] }),
                    queryClient.invalidateQueries({ queryKey: ['moderationLogs'] }),
                    queryClient.invalidateQueries({ queryKey: ['pendingContent'] }),
                    queryClient.invalidateQueries({ queryKey: ['news'] }),
                    queryClient.invalidateQueries({ queryKey: ['banners'] }),
                    queryClient.invalidateQueries({ queryKey: ['events'] }),
                    queryClient.invalidateQueries({ queryKey: ['quests'] }),
                    queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
                    queryClient.invalidateQueries({ queryKey: ['exclusivePages'] }),
                    queryClient.invalidateQueries({ queryKey: ['transport'] }),
                    queryClient.invalidateQueries({ queryKey: ['promoAds'] }),
                    queryClient.invalidateQueries({ queryKey: ['stories'] }),
                    queryClient.invalidateQueries({ queryKey: ['adminStories'] })
                ]);
                success("Объект успешно удален");
            }
        } catch (e: any) {
            showError(`Ошибка: ${e.message || "Нет доступа"}`);
        } finally {
            setIsDeleting(false);
            setDeleteConfirm(null);
        }
    };

    const openEditModal = (e: React.MouseEvent, type: any, item: any) => { 
        e.preventDefault(); e.stopPropagation();
        setEditingItem(item); 
        setModal(type); 
    };

    const closeModals = () => { 
        setModal(null); 
        setEditingItem(null); 
    };

    const handleAddClick = () => {
        setEditingItem(null);
        const mapping: Record<string, any> = {
            'news': 'news',
            'banners': 'banner',
            'events': 'event',
            'transport': 'transport',
            'quests': 'quest',
            'campaigns': 'campaign',
            'exclusive_pages': 'exclusive'
        };
        setModal(mapping[citySubTab]);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 pt-24 pb-24 md:pt-8">
            <DeleteConfirmModal 
                isOpen={!!deleteConfirm} 
                onClose={() => setDeleteConfirm(null)} 
                onConfirm={executeDelete} 
                title={deleteConfirm?.title}
                loading={isDeleting}
            />

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
                    <button onClick={() => setActiveTab('moderation')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'moderation' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><Shield className="w-5 h-5" /> Модерация</div> {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{pending.length}</span>}</button>
                    {isAdmin && <button onClick={() => setActiveTab('moderation-logs')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'moderation-logs' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><History className="w-5 h-5" /> Лог действий</div></button>}
                    <button onClick={() => setActiveTab('feedback')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'feedback' ? 'bg-red-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><MessageSquare className="w-5 h-5" /> Обратная связь</div></button>
                    {isAdmin && <><button onClick={() => setActiveTab('promotions')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'promotions' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><Megaphone className="w-5 h-5" /> Реклама</div></button><button onClick={() => setActiveTab('city-data')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'city-data' ? 'bg-gray-700 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><Settings className="w-5 h-5" /> Данные города</div></button><button onClick={() => setActiveTab('users')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'users' ? 'bg-blue-800 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-700'}`}><div className="flex items-center gap-3"><Users className="w-5 h-5" /> Жители</div></button></>}
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
                            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight px-1">На проверке ({pending.length})</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {pending.map((it: any) => {
                                    const compositeId = `${it._table}-${it.id}`;
                                    const isItemProcessing = moderationLoading === compositeId;
                                    const isBizRequest = it._table === 'reports';
                                    
                                    return (
                                        <div key={compositeId} className={`bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6 group relative overflow-hidden transition-all duration-300 ${isItemProcessing ? 'opacity-60 scale-[0.98] pointer-events-none' : 'opacity-100'}`}>
                                            {(it.image || it.media) && (
                                                <div className="w-full md:w-32 h-40 md:h-32 shrink-0">
                                                    <img src={it.image || it.media} className="w-full h-full rounded-2xl object-cover border dark:border-gray-700 shadow-sm" alt="" />
                                                </div>
                                            )}
                                            {isBizRequest && (
                                                <div className="w-full md:w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 border border-blue-100 dark:border-blue-800">
                                                    {it.target_type === 'biz_vip_request' ? <Crown className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <Badge color={isBizRequest ? 'orange' : 'blue'}>{it.typeLabel}</Badge>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDisplayDate(it.createdAt)}</span>
                                                </div>
                                                <h3 className="font-bold text-lg dark:text-white mb-2 leading-tight">{it.displayTitle}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-5 leading-relaxed">{it.description || it.content || it.caption || it.reason || 'Без описания'}</p>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    {it.authorId && (
                                                        <Link 
                                                            to={`/user/${it.authorId}`} 
                                                            className="inline-flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-100 dark:border-gray-700 group/auth"
                                                        >
                                                            <img 
                                                                src={it.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(it.authorName)}&background=random`} 
                                                                className="w-8 h-8 rounded-lg object-cover shadow-sm group-hover/auth:ring-2 ring-blue-500 transition-all" 
                                                                alt="" 
                                                            />
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-[10px] font-black uppercase text-blue-600 leading-none mb-0.5">{it.authorName}</span>
                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Автор</span>
                                                            </div>
                                                        </Link>
                                                    )}
                                                    {it.businessId && (
                                                        <Link 
                                                            to={`/business/${it.businessId}`} 
                                                            className="inline-flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800"
                                                        >
                                                            <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                                                                <Building2 className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-[10px] font-black uppercase text-blue-600 leading-none mb-0.5">Открыть бизнес</span>
                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Проверить профиль</span>
                                                            </div>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0 pt-4 md:pt-0 relative z-20">
                                                <button 
                                                    type="button"
                                                    className={`min-w-[100px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                                                        isItemProcessing 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20 active:scale-95'
                                                    }`}
                                                    onClick={(e) => { e.stopPropagation(); handleApprove(it); }}
                                                    disabled={isItemProcessing}
                                                >
                                                    {isItemProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Ок</>}
                                                </button>
                                                <button 
                                                    type="button"
                                                    className={`min-w-[100px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                                                        isItemProcessing 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 active:scale-95'
                                                    }`}
                                                    onClick={(e) => { e.stopPropagation(); handleReject(it); }}
                                                    disabled={isItemProcessing}
                                                >
                                                    {isItemProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /> Нет</>}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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
                                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{formatDisplayDate(r.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <Badge color={r.status === 'new' ? 'red' : 'green'}>{r.status}</Badge>
                                                </div>
                                                <p className="font-bold text-[10px] dark:text-white mb-2 uppercase tracking-widest text-gray-400">ID объекта: {r.targetId} ({r.targetType})</p>
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">"{r.reason}"</p>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <Button size="sm" variant="danger" className="rounded-xl px-4 text-[10px] font-black uppercase" onClick={(e) => triggerDelete(e, 'reports', r.id, 'adminReports', `Жалоба от ${r.userName}`)}>Удалить жалобу</Button>
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
                                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{formatDisplayDate(s.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">"{s.text}"</p>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <Button size="sm" variant="danger" className="rounded-xl px-4 text-[10px] font-black uppercase" onClick={(e) => triggerDelete(e, 'suggestions', s.id, 'adminSuggestions', `Предложение от ${s.userName}`)}>Удалить предложение</Button>
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
                                    <h3 className="font-black text-xl dark:text-white uppercase">Промо-акции (Витрина)</h3>
                                    <Button size="sm" onClick={() => setModal('promo')}><Plus className="w-4 h-4 mr-2"/> Добавить</Button>
                                </div>
                                <div className="space-y-4">
                                    {promoAds.map(p => (
                                        <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <img src={p.image_url} className="w-16 h-16 rounded-xl object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-bold dark:text-white">{p.title}</p>
                                                    <p className="text-xs text-blue-600 font-bold">{p.price} ₽</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => openEditModal(e, 'promo', p)} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors hover:bg-blue-100"><Pencil className="w-4 h-4 text-blue-600"/></button>
                                                <button onClick={(e) => triggerDelete(e, 'promo_ads', p.id, 'promoAds', p.title)} className="p-2 bg-red-50 text-red-500 rounded-lg transition-colors hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
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
                                {(['news', 'banners', 'events', 'stories', 'transport', 'quests', 'campaigns', 'exclusive_pages'] as const).map(tab => (
                                    <button key={tab} onClick={() => setCitySubTab(tab)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${citySubTab === tab ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>{cityTabLabels[tab] || tab}</button>
                                ))}
                            </div>

                            <div className="flex justify-between items-center px-1">
                                <h3 className="font-black text-lg dark:text-white uppercase tracking-tight">{cityTabLabels[citySubTab]}</h3>
                                {citySubTab !== 'stories' && (
                                    <Button size="sm" onClick={handleAddClick} className="rounded-xl px-6 uppercase font-black text-[10px] tracking-widest shadow-xl shadow-blue-500/10">
                                        <Plus className="w-4 h-4 mr-2"/> Добавить
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 px-1">
                                {citySubTab === 'news' && news.map(n => (
                                    <div key={n.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                <ImageIcon className="w-5 h-5 text-blue-500 opacity-60" />
                                            </div>
                                            <span className="font-bold dark:text-white truncate text-sm sm:text-base">{n.title}</span>
                                        </div>
                                        <div className="flex gap-1 shrink-0 ml-4">
                                            <button onClick={(e) => openEditModal(e, 'news', n)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Pencil className="w-4.5 h-4.5"/></button>
                                            <button onClick={(e) => triggerDelete(e, 'news', n.id, 'news', n.title)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'stories' && stories.map(s => (
                                    <div key={s.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-16 rounded-xl bg-gray-100 dark:bg-gray-900 overflow-hidden shrink-0 border dark:border-gray-600">
                                                <img src={s.media} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-bold dark:text-white truncate block text-sm">{s.caption || 'Без подписи'}</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge color={s.status === 'published' ? 'green' : s.status === 'pending' ? 'orange' : 'red'}>{s.status}</Badge>
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{formatDisplayDate(s.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0 ml-4">
                                            <button onClick={(e) => triggerDelete(e, 'stories', s.id, 'adminStories', `История от ${formatDisplayDate(s.createdAt)}`)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'banners' && banners.map(b => (
                                    <div key={b.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <img src={b.image_url} className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border dark:border-gray-600" />
                                            <div className="min-w-0">
                                                <span className="font-bold dark:text-white truncate block">{b.title || 'Без названия'}</span>
                                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{b.position}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0 ml-4">
                                            <button onClick={(e) => openEditModal(e, 'banner', b)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Pencil className="w-4.5 h-4.5"/></button>
                                            <button onClick={(e) => triggerDelete(e, 'banners', b.id, 'banners', b.title || 'Баннер')} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-900/20 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'events' && events.map(evt => (
                                    <div key={evt.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                                <Calendar className="w-5 h-5 text-indigo-500 opacity-60" />
                                            </div>
                                            <span className="font-bold dark:text-white truncate">{evt.title}</span>
                                        </div>
                                        <div className="flex gap-1 shrink-0 ml-4">
                                            <button onClick={(e) => openEditModal(e, 'event', evt)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Pencil className="w-4.5 h-4.5"/></button>
                                            <button onClick={(e) => triggerDelete(e, 'events', evt.id, 'events', evt.title)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-900/20 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'transport' && transport.map(t => (
                                    <div key={t.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                <Bus className="w-5 h-5 text-blue-600 opacity-60" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-bold dark:text-white truncate block">{t.title}</span>
                                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0 ml-4">
                                            <button onClick={(e) => openEditModal(e, 'transport', t)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Pencil className="w-4.5 h-4.5"/></button>
                                            <button onClick={(e) => triggerDelete(e, 'transport_schedules', t.id, 'transport', t.title)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-900/20 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'exclusive_pages' && exclusivePages.map(p => (
                                    <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                                                <LayoutIcon className="w-5 h-5 text-teal-500 opacity-60" />
                                            </div>
                                            <span className="font-bold dark:text-white truncate">{p.title}</span>
                                        </div>
                                        <div className="flex gap-1 shrink-0 ml-4">
                                            <button onClick={(e) => openEditModal(e, 'exclusive', p)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Pencil className="w-4.5 h-4.5"/></button>
                                            <button onClick={(e) => triggerDelete(e, 'exclusive_pages', p.id, 'exclusivePages', p.title)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-900/20 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'quests' && quests.map(q => (
                                    <div key={q.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                                                <Trophy className="w-5 h-5 text-yellow-500 opacity-60" />
                                            </div>
                                            <span className="font-bold dark:text-white truncate">{q.title}</span>
                                        </div>
                                        <div className="flex gap-1 shrink-0 ml-4">
                                            <button onClick={(e) => openEditModal(e, 'quest', q)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Pencil className="w-4.5 h-4.5"/></button>
                                            <button onClick={(e) => triggerDelete(e, 'quests', q.id, 'quests', q.title)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-900/20 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5"/></button>
                                        </div>
                                    </div>
                                ))}
                                {citySubTab === 'campaigns' && campaigns.map(c => (
                                    <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                                <Heart className="w-5 h-5 text-red-500 opacity-60" />
                                            </div>
                                            <span className="font-bold dark:text-white truncate">{c.title}</span>
                                        </div>
                                        <div className="flex gap-1 shrink-0 ml-4">
                                            <button onClick={(e) => openEditModal(e, 'campaign', c)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Pencil className="w-4.5 h-4.5"/></button>
                                            <button onClick={(e) => triggerDelete(e, 'campaigns', c.id, 'campaigns', c.title)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-900/20 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5"/></button>
                                        </div>
                                    </div>
                                ))}
                                {((citySubTab === 'news' && news.length === 0) || (citySubTab === 'stories' && stories.length === 0) || (citySubTab === 'events' && events.length === 0) || (citySubTab === 'quests' && quests.length === 0) || (citySubTab === 'exclusive_pages' && exclusivePages.length === 0) || (citySubTab === 'banners' && banners.length === 0) || (citySubTab === 'campaigns' && campaigns.length === 0) || (citySubTab === 'transport' && transport.length === 0)) && (
                                    <div className="p-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest italic border-2 border-dashed rounded-[2.5rem] dark:border-gray-800">Список пуст</div>
                                )}
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
                                        <div className="flex items-center gap-4 flex-1">
                                            <Link to={`/user/${p.id}`}>
                                                <img src={p.avatar} className="w-12 h-12 rounded-2xl object-cover border dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all" />
                                            </Link>
                                            <div>
                                                <Link to={`/user/${p.id}`} className="font-bold dark:text-white hover:text-blue-600 transition-colors">{p.name}</Link>
                                                <p className="text-xs text-gray-400">{p.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {updatingRoleFor === p.id ? (
                                                <div className="px-4"><Loader2 className="w-4 h-4 animate-spin text-blue-600" /></div>
                                            ) : (
                                                <select 
                                                    className="bg-gray-50 dark:bg-gray-700 text-xs font-black p-2.5 rounded-xl outline-none border border-transparent focus:border-blue-500 transition-all uppercase tracking-tighter cursor-pointer" 
                                                    value={p.role} 
                                                    onChange={e => handleUpdateUserRole(p.id, e.target.value as UserRole)}
                                                >
                                                    <option value="USER">Житель</option>
                                                    <option value="BUSINESS">Бизнес</option>
                                                    <option value="MODERATOR">Модератор</option>
                                                    <option value="ADMIN">Админ</option>
                                                </select>
                                            )}
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
                                                <div className="text-[10px] font-black text-gray-400 uppercase">{formatDisplayDate(log.createdAt)}</div>
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

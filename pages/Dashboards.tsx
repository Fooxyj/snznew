
import React, { useState } from 'react';
import { api } from '../services/api';
import { User, Ad, Business, UserRole, Story, TransportSchedule, AccessRequest } from '../types';
import { Button, XPBar, Badge } from '../components/ui/Common';
import { 
    User as UserIcon, Settings, LogOut, Loader2, Plus, 
    Briefcase, ShoppingBag, Check, X, 
    Trophy, MapPin, Building2, Crown,
    LayoutDashboard, FileText, BarChart3, Users,
    Edit3, Trash2, ChevronDown, List, Upload, Pencil, Star, Shield, Zap, TrendingUp, PieChart as PieChartIcon, Film, Lightbulb, MessageSquare, AlertTriangle, ExternalLink, Bus, Key, Wallet, Sparkles, Calendar, Navigation
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { EditAdModal } from '../components/EditAdModal';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuggestIdeaModal } from '../components/SuggestIdeaModal';
import { CreateNewsModal } from '../components/CreateNewsModal';
import { CreateEventModal } from '../components/CreateEventModal';

// Helper for Badges
const BadgeIcon: React.FC<{ name: string }> = ({ name }) => {
    switch(name) {
        case 'verified': return <div className="text-blue-500 bg-blue-50 p-1.5 rounded-full" title="Проверенный"><Star className="w-3.5 h-3.5 fill-current" /></div>;
        case 'admin': return <div className="text-red-500 bg-red-50 p-1.5 rounded-full" title="Администратор"><Shield className="w-3.5 h-3.5 fill-current" /></div>;
        case 'quest_master': return <div className="text-purple-500 bg-purple-50 p-1.5 rounded-full" title="Мастер квестов"><Zap className="w-3.5 h-3.5 fill-current" /></div>;
        case 'early_adopter': return <div className="text-orange-500 bg-orange-50 p-1.5 rounded-full" title="Старожил"><Crown className="w-3.5 h-3.5 fill-current" /></div>;
        default: return <div className="text-gray-500 bg-gray-50 p-1.5 rounded-full"><Star className="w-3.5 h-3.5" /></div>;
    }
};

const EditProfileModal: React.FC<{ user: User; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ user, isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState(user.name);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateProfile({ name });
            onSuccess();
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Редактировать профиль</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Имя</label>
                        <input 
                            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <Button className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Сохранить'}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={onClose}>Отмена</Button>
                </form>
            </div>
        </div>
    );
};

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);

    // Queries
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const { data: userContent } = useQuery({
        queryKey: ['userContent', user?.id],
        queryFn: () => user ? api.getUserContent(user.id) : { ads: [] },
        enabled: !!user
    });

    const { data: myBusinesses = [] } = useQuery({
        queryKey: ['myBusinesses'],
        queryFn: api.getMyBusinesses,
        enabled: !!user
    });

    const myAds = userContent?.ads || [];

    const handleLogout = async () => {
        await api.signOut();
        navigate('/auth');
    };

    const handleDeleteAd = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Удалить объявление?")) {
            await api.deleteAd(id);
            queryClient.invalidateQueries({ queryKey: ['userContent'] });
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        }
    };

    const handleEditAd = (ad: Ad, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingAd(ad);
    };

    if (userLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    
    if (!user) {
        navigate('/auth');
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-24">
            <SuggestIdeaModal isOpen={isIdeaModalOpen} onClose={() => setIsIdeaModalOpen(false)} />
            
            {editingAd && (
                <EditAdModal 
                    ad={editingAd} 
                    isOpen={!!editingAd} 
                    onClose={() => setEditingAd(null)} 
                    onSuccess={() => { 
                        setEditingAd(null); 
                        queryClient.invalidateQueries({ queryKey: ['userContent'] }); 
                        queryClient.invalidateQueries({ queryKey: ['ads'] });
                    }} 
                />
            )}

            {isEditProfileOpen && (
                <EditProfileModal 
                    user={user} 
                    isOpen={isEditProfileOpen} 
                    onClose={() => setIsEditProfileOpen(false)} 
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['user'] })} 
                />
            )}

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="relative">
                    <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg" />
                    <button 
                        onClick={() => setIsEditProfileOpen(true)}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex-1 text-center md:text-left z-10 w-full">
                    <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white flex items-center justify-center md:justify-start gap-2">
                                {user.name}
                                {user.badges?.map(b => <BadgeIcon key={b} name={b} />)}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link to="/settings">
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <Settings className="w-4 h-4 mr-2" /> Настройки
                                </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                            <XPBar xp={user.xp} />
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Баланс</div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                    {user.balance?.toLocaleString()} ₽
                                </div>
                            </div>
                            <Link to="/wallet">
                                <Button size="sm" className="h-8">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {user.role === UserRole.ADMIN && (
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                            <Link to="/admin" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 font-medium text-sm">
                                <LayoutDashboard className="w-4 h-4 mr-2" /> Панель администратора
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* My Businesses */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" /> Мой бизнес
                    </h2>
                    {!myBusinesses.length && (
                        <Link to="/business-connect">
                            <Button size="sm" variant="secondary">Подключить</Button>
                        </Link>
                    )}
                </div>

                {myBusinesses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myBusinesses.map(biz => (
                            <div key={biz.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative">
                                <div className="flex items-start gap-4">
                                    <img src={biz.image} alt={biz.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg dark:text-white truncate">{biz.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{biz.address}</p>
                                        <Link to="/business-crm">
                                            <Button size="sm" className="w-full">
                                                Управление (CRM)
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">У вас еще нет бизнеса в системе</p>
                        <Link to="/business-connect">
                            <Button>Стать партнером</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* My Ads */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-green-600" /> Мои объявления
                    </h2>
                    <Link to="/classifieds">
                        <Button size="sm" variant="secondary"><Plus className="w-4 h-4 mr-1" /> Подать</Button>
                    </Link>
                </div>

                {myAds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myAds.map(ad => (
                            <div key={ad.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                <div className="relative h-40">
                                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleEditAd(ad, e)} className="p-1.5 bg-white text-gray-700 rounded-lg shadow-sm hover:text-blue-600">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => handleDeleteAd(ad.id, e)} className="p-1.5 bg-white text-gray-700 rounded-lg shadow-sm hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {ad.isVip && <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold">VIP</div>}
                                </div>
                                <div className="p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium text-gray-900 dark:text-white truncate flex-1 pr-2">{ad.title}</h3>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">{ad.price} ₽</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className={`text-xs px-2 py-1 rounded-full ${ad.status === 'approved' ? 'bg-green-100 text-green-700' : ad.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {ad.status === 'approved' ? 'Активно' : ad.status === 'rejected' ? 'Отклонено' : 'На проверке'}
                                        </div>
                                        <span className="text-xs text-gray-400">{ad.views || 0} просмотров</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed dark:border-gray-700">
                        У вас пока нет активных объявлений
                    </div>
                )}
            </div>

            <div className="mt-8 text-center">
                <button onClick={() => setIsIdeaModalOpen(true)} className="text-sm text-blue-600 hover:underline dark:text-blue-400 flex items-center justify-center gap-1 w-full">
                    <Lightbulb className="w-4 h-4" /> Предложить идею разработчикам
                </button>
            </div>
        </div>
    );
};

// Admin Dashboard
export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'requests' | 'content' | 'transport'>('overview');
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const queryClient = useQueryClient();

    // Stats
    const { data: stats = { users: 0, ads: 0, businesses: 0, news: 0, stories: 0 } } = useQuery({
        queryKey: ['adminStats'],
        queryFn: api.getSystemStats
    });

    // Content Queries
    const { data: pendingAds = [] } = useQuery({ queryKey: ['ads', 'pending'], queryFn: api.getPendingAds });
    const { data: pendingStories = [] } = useQuery({ queryKey: ['stories', 'pending'], queryFn: () => api.getStories('pending'), staleTime: 0 });
    const { data: accessRequests = [] } = useQuery({ queryKey: ['accessRequests'], queryFn: api.getAccessRequests, staleTime: 0 });
    const { data: reports = [] } = useQuery({ queryKey: ['reports'], queryFn: api.getReports });
    const { data: suggestions = [] } = useQuery({ queryKey: ['suggestions'], queryFn: api.getSuggestions });
    
    // Content & Transport Queries
    const { data: newsList = [] } = useQuery({ queryKey: ['news'], queryFn: api.getNews });
    const { data: eventList = [] } = useQuery({ queryKey: ['events'], queryFn: api.getEvents });
    const { data: transportList = [] } = useQuery({ queryKey: ['transport'], queryFn: api.getTransportSchedules });

    // Mutations
    const approveAdMutation = useMutation({ mutationFn: api.approveAd, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads', 'pending'] }) });
    const rejectAdMutation = useMutation({ mutationFn: api.rejectAd, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads', 'pending'] }) });
    const approveStoryMutation = useMutation({ mutationFn: api.approveStory, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }) });
    const rejectStoryMutation = useMutation({ mutationFn: api.rejectStory, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }) });
    
    const approveAccessMutation = useMutation({
        mutationFn: async (req: AccessRequest) => { await api.grantStoryAccess(req.businessId); await api.deleteAccessRequest(req.id); },
        onSuccess: () => { alert("Права выданы!"); queryClient.invalidateQueries({ queryKey: ['accessRequests'] }); }
    });
    const deleteRequestMutation = useMutation({ mutationFn: api.deleteAccessRequest, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accessRequests'] }) });
    
    // Extra Delete Mutations
    const deleteNewsMutation = useMutation({ mutationFn: api.deleteNews, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news'] }) });
    const deleteEventMutation = useMutation({ mutationFn: api.deleteEvent, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });
    const deleteTransportMutation = useMutation({ mutationFn: api.deleteTransportSchedule, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transport'] }) });
    const deleteReportMutation = useMutation({ mutationFn: api.deleteReport, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }) });
    const deleteSuggestionMutation = useMutation({ mutationFn: api.deleteSuggestion, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suggestions'] }) });

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-24">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 dark:text-white flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-blue-600" /> Администрирование
            </h1>

            <CreateNewsModal isOpen={isNewsModalOpen} onClose={() => setIsNewsModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['news'] })} />
            <CreateEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['events'] })} />

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700 mb-8 overflow-x-auto">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><BarChart3 className="w-4 h-4" /> Обзор</button>
                <button onClick={() => setActiveTab('moderation')} className={`px-4 py-3 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'moderation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Shield className="w-4 h-4" /> Объявления ({pendingAds.length})</button>
                <button onClick={() => setActiveTab('requests')} className={`px-4 py-3 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Film className="w-4 h-4" /> Заявки ({pendingStories.length + accessRequests.length + reports.length + suggestions.length})</button>
                <button onClick={() => setActiveTab('content')} className={`px-4 py-3 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'content' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><FileText className="w-4 h-4" /> Контент</button>
                <button onClick={() => setActiveTab('transport')} className={`px-4 py-3 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'transport' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Bus className="w-4 h-4" /> Транспорт</button>
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                        <div className="text-gray-500 mb-1 text-sm">Пользователи</div>
                        <div className="text-3xl font-bold dark:text-white">{stats.users}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                        <div className="text-gray-500 mb-1 text-sm">Объявления</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.ads}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                        <div className="text-gray-500 mb-1 text-sm">Бизнесы</div>
                        <div className="text-3xl font-bold text-purple-600">{stats.businesses}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                        <div className="text-gray-500 mb-1 text-sm">Истории</div>
                        <div className="text-3xl font-bold text-pink-600">{stats.stories}</div>
                    </div>
                </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div className="animate-in fade-in space-y-8">
                    {/* News Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold dark:text-white">Новости ({newsList.length})</h2>
                            <Button size="sm" onClick={() => setIsNewsModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Добавить
                            </Button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
                            {newsList.length === 0 ? <p className="p-4 text-gray-500">Новостей нет</p> : 
                                newsList.map(item => (
                                    <div key={item.id} className="p-4 border-b dark:border-gray-700 flex justify-between items-center last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt=""/>
                                            <div>
                                                <div className="font-bold text-sm dark:text-white line-clamp-1">{item.title}</div>
                                                <div className="text-xs text-gray-500">{item.date} • {item.category}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => { if(confirm('Удалить новость?')) deleteNewsMutation.mutate(item.id) }} className="text-gray-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Events Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold dark:text-white">Афиша ({eventList.length})</h2>
                            <Button size="sm" onClick={() => setIsEventModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Добавить
                            </Button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
                            {eventList.length === 0 ? <p className="p-4 text-gray-500">Событий нет</p> : 
                                eventList.map(item => (
                                    <div key={item.id} className="p-4 border-b dark:border-gray-700 flex justify-between items-center last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt=""/>
                                            <div>
                                                <div className="font-bold text-sm dark:text-white line-clamp-1">{item.title}</div>
                                                <div className="text-xs text-gray-500">{item.date} • {item.location}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => { if(confirm('Удалить событие?')) deleteEventMutation.mutate(item.id) }} className="text-gray-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Transport Tab */}
            {activeTab === 'transport' && (
                <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold dark:text-white">Маршруты ({transportList.length})</h2>
                        {/* Can implement Add modal later */}
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-4">№ / Тип</th>
                                    <th className="p-4">Название</th>
                                    <th className="p-4">График</th>
                                    <th className="p-4 text-right">Действие</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {transportList.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{t.routeNumber || '-'}</div>
                                            <div className="text-xs text-gray-500">{t.type === 'city' ? 'Город' : 'Межгород'}</div>
                                        </td>
                                        <td className="p-4 font-medium dark:text-gray-200">{t.title}</td>
                                        <td className="p-4 text-gray-500">{t.schedule}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => { if(confirm('Удалить маршрут?')) deleteTransportMutation.mutate(t.id) }} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4"/></button>
                                        </td>
                                    </tr>
                                ))}
                                {transportList.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">Маршрутов нет</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="animate-in fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Suggestions Section (IDEAS) */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" /> Идеи и Предложения <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-0.5 rounded-full">{suggestions.length}</span>
                        </h2>
                        {suggestions.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-gray-500 text-center text-sm border border-dashed dark:border-gray-700">
                                Предложений пока нет
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {suggestions.map(s => (
                                    <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 shadow-sm relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <img src={s.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.userName || 'A')}`} className="w-6 h-6 rounded-full" alt="" />
                                                <span className="font-bold text-sm dark:text-white">{s.userName || 'Аноним'}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            {s.text}
                                        </p>
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={() => { if(confirm('Удалить предложение?')) deleteSuggestionMutation.mutate(s.id) }} 
                                                className="text-gray-400 hover:text-red-500 p-1" 
                                                title="Удалить"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reports Section (Complaints) */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" /> Жалобы пользователей <span className="bg-red-100 text-red-700 text-sm px-2 py-0.5 rounded-full">{reports.length}</span>
                        </h2>
                        {reports.length === 0 ? (
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl text-green-700 dark:text-green-400 text-center text-sm border border-green-200 dark:border-green-800">
                                Жалоб нет, все спокойно.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {reports.map(r => (
                                    <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 shadow-sm relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded uppercase">{r.targetType}</span>
                                                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <button onClick={() => { if(confirm('Удалить жалобу?')) deleteReportMutation.mutate(r.id) }} className="text-gray-400 hover:text-green-600" title="Решено / Удалить">
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">{r.reason}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t dark:border-gray-700">
                                            <span>От: {r.userName}</span>
                                            <span>• ID: {r.targetId}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Stories Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                            Истории на проверке <span className="bg-yellow-100 text-yellow-700 text-sm px-2 py-0.5 rounded-full">{pendingStories.length}</span>
                        </h2>
                        
                        {pendingStories.length === 0 ? (
                            <p className="text-gray-500 italic">Нет историй на проверке.</p>
                        ) : (
                            <div className="grid gap-4">
                                {pendingStories.map(story => (
                                    <div key={story.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 shadow-sm flex gap-4">
                                        <div className="w-24 h-40 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                            <img src={story.media} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 mb-2">
                                                <img src={story.authorAvatar} className="w-6 h-6 rounded-full" alt="" />
                                                <span className="font-bold text-sm dark:text-white">{story.authorName}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{story.caption || 'Без подписи'}</p>
                                            
                                            <div className="mt-auto flex gap-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => approveStoryMutation.mutate(story.id)}>
                                                    Опубликовать
                                                </Button>
                                                <Button size="sm" variant="danger" className="flex-1" onClick={() => rejectStoryMutation.mutate(story.id)}>
                                                    Отклонить
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Access Requests Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                            Запросы прав <span className="bg-blue-100 text-blue-700 text-sm px-2 py-0.5 rounded-full">{accessRequests.length}</span>
                        </h2>

                        {accessRequests.length === 0 ? (
                            <p className="text-gray-500 italic">Нет запросов на права.</p>
                        ) : (
                            <div className="space-y-4">
                                {accessRequests.map(req => (
                                    <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{req.businessName}</div>
                                                <div className="text-xs text-gray-500">От: {req.userName}</div>
                                            </div>
                                            <div className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 mb-4">
                                            {req.message}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-1" onClick={() => approveAccessMutation.mutate(req)}>
                                                <Key className="w-4 h-4 mr-2" /> Выдать права
                                            </Button>
                                            <Link to={`/chat?id=${req.userId}`} className="flex-1">
                                                <Button size="sm" variant="secondary" className="w-full">
                                                    Написать
                                                </Button>
                                            </Link>
                                            <button onClick={() => deleteRequestMutation.mutate(req.id)} className="p-2 text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Moderation Tab */}
            {activeTab === 'moderation' && (
                <div className="animate-in fade-in">
                    {pendingAds.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Нет объявлений на проверке</p>
                    ) : (
                        <div className="grid gap-6">
                            {pendingAds.map(ad => (
                                <div key={ad.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 shadow-sm flex flex-col md:flex-row gap-6">
                                    <img src={ad.image} className="w-full md:w-48 h-48 md:h-32 object-cover rounded-lg bg-gray-100" alt="" />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-bold text-lg dark:text-white">{ad.title}</h3>
                                            <span className="font-bold text-blue-600">{ad.price} ₽</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">{ad.description}</p>
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => approveAdMutation.mutate(ad.id)}>
                                                Одобрить
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => rejectAdMutation.mutate(ad.id)}>
                                                Отклонить
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};



import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, Ad, Business, UserRole } from '../types';
import { Button, XPBar, Badge } from '../components/ui/Common';
import { 
    User as UserIcon, Settings, LogOut, Loader2, Plus, 
    Briefcase, ShoppingBag, PieChart, Check, X, 
    Trophy, MapPin, Building2, Crown,
    LayoutDashboard, FileText, BarChart3, Users,
    Edit3, Trash2, ChevronDown, List, Upload, Pencil, Star, Shield, Zap
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { EditAdModal } from '../components/EditAdModal';

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

// Edit Profile Modal
const EditProfileModal: React.FC<{ user: User; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ user, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: user.name, phone: user.phone || '', avatar: user.avatar || '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, avatar: url }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateProfile(formData);
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
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Редактировать профиль</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="relative w-20 h-20">
                            <img src={formData.avatar || user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                            <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full text-white cursor-pointer hover:bg-blue-700">
                                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Имя</label>
                        <input className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Телефон</label>
                        <input className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+7" />
                    </div>
                    <Button className="w-full" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Сохранить'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

// Edit Business Modal
const EditBusinessModal: React.FC<{ business: Business; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ business, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: business.name,
        description: business.description,
        address: business.address,
        phone: business.phone,
        workHours: business.workHours,
        image: business.image
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateBusiness(business.id, formData);
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
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Редактировать бизнес</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Название</label>
                        <input className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Телефон</label>
                            <input className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Часы работы</label>
                            <input className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.workHours} onChange={e => setFormData({...formData, workHours: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Адрес</label>
                        <input className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Описание</label>
                        <textarea className="w-full border rounded-lg p-2 resize-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-700/50">
                        <div className="relative cursor-pointer">
                            {formData.image && <img src={formData.image} alt="" className="h-20 w-full object-cover rounded mb-2" />}
                            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                <span className="text-xs">{uploading ? "Загрузка..." : "Изменить фото"}</span>
                            </div>
                            <input type="file" className="absolute inset-0 opacity-0" onChange={handleImageUpload} />
                        </div>
                    </div>
                    <Button className="w-full" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Сохранить изменения'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [myAds, setMyAds] = useState<Ad[]>([]);
    const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
    const navigate = useNavigate();

    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    const loadData = async () => {
        try {
            const u = await api.getCurrentUser();
            setUser(u);
            if (u) {
                const [adsData, businessesData] = await Promise.all([
                    api.getUserContent(u.id), 
                    api.getMyBusinesses()
                ]);
                
                setMyAds(adsData.ads);
                setMyBusinesses(businessesData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleLogout = async () => {
        await api.signOut();
        navigate('/auth');
    };

    const handleDeleteAd = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Удалить объявление?")) {
            await api.deleteAd(id);
            loadData();
        }
    };

    const handleEditAd = (ad: Ad, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingAd(ad);
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!user) {
        navigate('/auth');
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-24">
            {editingAd && (
                <EditAdModal 
                    ad={editingAd} 
                    isOpen={!!editingAd} 
                    onClose={() => setEditingAd(null)} 
                    onSuccess={() => { setEditingAd(null); loadData(); }} 
                />
            )}
            {user && (
                <EditProfileModal 
                    user={user}
                    isOpen={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                    onSuccess={loadData}
                />
            )}
            {editingBusiness && (
                <EditBusinessModal 
                    business={editingBusiness}
                    isOpen={!!editingBusiness}
                    onClose={() => setEditingBusiness(null)}
                    onSuccess={loadData}
                />
            )}

            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                
                <div className="relative shrink-0">
                    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500">
                        <img src={user.avatar} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800" alt="" />
                    </div>
                    <button 
                        onClick={() => setIsEditProfileOpen(true)}
                        className="absolute bottom-1 right-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-white p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex-1 text-center md:text-left z-10">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{user.name}</h1>
                        <div className="flex gap-1">
                            {user.badges?.map(b => <BadgeIcon key={b} name={b} />)}
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                        {user.role === UserRole.ADMIN && <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Admin</span>}
                        {user.role === UserRole.BUSINESS && <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Business</span>}
                    </div>

                    <div className="max-w-xs mx-auto md:mx-0">
                        <XPBar xp={user.xp} />
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[140px] z-10">
                    <Link to="/settings">
                        <Button variant="secondary" className="w-full bg-white dark:bg-gray-700 dark:text-white border-none shadow-sm">
                            <Settings className="w-4 h-4 mr-2" /> Настройки
                        </Button>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <LogOut className="w-4 h-4 mr-2" /> Выйти
                    </button>
                </div>
            </div>

            {/* Admin Panel Link */}
            {user.role === UserRole.ADMIN && (
                <div className="mb-8">
                    <Link to="/admin" className="block group">
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-transform group-hover:scale-[1.01]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                    <LayoutDashboard className="w-6 h-6 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Панель администратора</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Управление контентом и модерация</p>
                                </div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                                <ChevronDown className="w-5 h-5 -rotate-90 text-gray-600 dark:text-gray-300" />
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            <div className="space-y-10">
                {/* My Ads - Horizontal Rail */}
                <section>
                    <div className="flex justify-between items-center mb-5 px-1">
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-blue-600" /> Мои объявления
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full ml-1">{myAds.length}</span>
                        </h2>
                        <Link to="/classifieds">
                            <Button size="sm" className="rounded-full px-4"><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
                        </Link>
                    </div>

                    {myAds.length > 0 ? (
                        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x">
                            {myAds.map(ad => (
                                <div key={ad.id} onClick={() => navigate(`/ad/${ad.id}`)} className="min-w-[260px] w-[260px] snap-center bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all">
                                    <div className="relative h-40 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        <img src={ad.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                        {ad.isVip && (
                                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                                <Crown className="w-3 h-3" /> VIP
                                            </div>
                                        )}
                                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md ${ad.status === 'pending' ? 'bg-yellow-500/80 text-white' : 'bg-green-500/80 text-white'}`}>
                                            {ad.status === 'pending' ? 'На проверке' : 'Активно'}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2 text-sm">{ad.title}</h3>
                                        </div>
                                        <p className="font-bold text-blue-600 dark:text-blue-400 mb-4">{ad.price.toLocaleString()} {ad.currency}</p>
                                        
                                        <div className="mt-auto flex gap-2 pt-3 border-t dark:border-gray-700">
                                            <button 
                                                onClick={(e) => handleEditAd(ad, e)}
                                                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Ред.
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteAd(ad.id, e)}
                                                className="flex items-center justify-center p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed dark:border-gray-700">
                            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">У вас пока нет объявлений</p>
                        </div>
                    )}
                </section>

                {/* My Business - Grid */}
                {myBusinesses.length > 0 && (
                    <section>
                        <div className="flex justify-between items-center mb-5 px-1">
                            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-purple-600" /> Мой бизнес
                            </h2>
                            <Link to="/business-connect">
                                <Button size="sm" variant="secondary" className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {myBusinesses.map(biz => (
                                <div key={biz.id} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group">
                                    <div className="h-32 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                        <img src={biz.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-3 left-4 text-white">
                                            <h3 className="font-bold text-lg leading-tight">{biz.name}</h3>
                                            <p className="text-xs opacity-80">{biz.category}</p>
                                        </div>
                                        <Link 
                                            to="/business-crm"
                                            className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                                            title="Кабинет управления"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="p-4 flex gap-2">
                                        <Link to={`/business/${biz.id}`} className="flex-1">
                                            <Button variant="secondary" className="w-full text-xs dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                                Страница
                                            </Button>
                                        </Link>
                                        <Button 
                                            className="flex-1 text-xs bg-purple-600 hover:bg-purple-700 text-white border-none shadow-purple-200 dark:shadow-none flex items-center justify-center gap-2"
                                            onClick={() => setEditingBusiness(biz)}
                                        >
                                            <Edit3 className="w-3.5 h-3.5" /> Редактировать
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

// Admin Dashboard
export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, ads: 0, businesses: 0, news: 0 });
    const [pendingAds, setPendingAds] = useState<Ad[]>([]);
    const [allAds, setAllAds] = useState<Ad[]>([]); 
    const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'content' | 'ads'>('overview');
    
    // Poll State
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    
    const loadAllData = async () => {
        const [s, p, all] = await Promise.all([
            api.getSystemStats(), 
            api.getPendingAds(),
            api.getAllAdsForAdmin()
        ]);
        setStats(s);
        setPendingAds(p);
        setAllAds(all);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault();
        const validOptions = pollOptions.filter(o => o.trim() !== '');
        if (!pollQuestion || validOptions.length < 2) return alert("Введите вопрос и минимум 2 варианта");
        
        try {
            await api.createPoll(pollQuestion, validOptions);
            alert("Опрос создан!");
            setPollQuestion('');
            setPollOptions(['', '']);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleOptionChange = (idx: number, val: string) => {
        const newOpts = [...pollOptions];
        newOpts[idx] = val;
        setPollOptions(newOpts);
    };

    const approveAd = async (id: string) => {
        await api.approveAd(id);
        loadAllData();
    };

    const rejectAd = async (id: string) => {
        if(confirm("Отклонить объявление?")) {
            await api.rejectAd(id);
            loadAllData();
        }
    };

    const toggleVipAd = async (ad: Ad) => {
        try {
            await api.adminToggleVip(ad.id, !!ad.isVip);
            loadAllData();
        } catch(e:any) {
            alert(e.message);
        }
    };

    const deleteAdPermanently = async (id: string) => {
        if(confirm("Удалить это объявление навсегда?")) {
            try {
                await api.deleteAd(id);
                loadAllData();
            } catch(e:any) {
                alert(e.message);
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
            <h1 className="text-3xl font-bold mb-8 dark:text-white flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-blue-600" /> Администрирование
            </h1>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700 mb-8 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <BarChart3 className="w-4 h-4" /> Обзор
                </button>
                <button 
                    onClick={() => setActiveTab('moderation')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'moderation' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Shield className="w-4 h-4" /> Модерация {pendingAds.length > 0 && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{pendingAds.length}</span>}
                </button>
                <button 
                    onClick={() => setActiveTab('ads')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'ads' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <List className="w-4 h-4" /> Объявления
                </button>
                <button 
                    onClick={() => setActiveTab('content')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'content' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <FileText className="w-4 h-4" /> Контент
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Пользователи</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.users}</h3>
                        </div>
                        <div className="absolute right-4 bottom-4 text-blue-100 dark:text-blue-900/20">
                            <Users className="w-16 h-16" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Объявления</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.ads}</h3>
                        </div>
                        <div className="absolute right-4 bottom-4 text-green-100 dark:text-green-900/20">
                            <ShoppingBag className="w-16 h-16" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Компании</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.businesses}</h3>
                        </div>
                        <div className="absolute right-4 bottom-4 text-purple-100 dark:text-purple-900/20">
                            <Building2 className="w-16 h-16" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Новости</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.news}</h3>
                        </div>
                        <div className="absolute right-4 bottom-4 text-orange-100 dark:text-orange-900/20">
                            <FileText className="w-16 h-16" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'moderation' && (
                <div className="animate-in fade-in">
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        Ожидают проверки <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-0.5 rounded-full">{pendingAds.length}</span>
                    </h2>
                    
                    <div className="grid gap-4">
                        {pendingAds.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed dark:border-gray-700">
                                <Check className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-50" />
                                <p className="text-gray-500 dark:text-gray-400">Все чисто! Нет объявлений на проверку.</p>
                            </div>
                        ) : (
                            pendingAds.map(ad => (
                                <div key={ad.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6">
                                    <img src={ad.image} className="w-full md:w-48 h-32 rounded-xl object-cover bg-gray-100" alt="" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg dark:text-white">{ad.title}</h3>
                                            <span className="font-bold text-blue-600">{ad.price} ₽</span>
                                        </div>
                                        <div className="flex gap-2 mb-3">
                                            <Badge color="gray">{ad.category}</Badge>
                                            <span className="text-xs text-gray-400 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {ad.location}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{ad.description}</p>
                                        
                                        <div className="flex gap-3">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none" onClick={() => approveAd(ad.id)}>
                                                <Check className="w-4 h-4 mr-2" /> Одобрить
                                            </Button>
                                            <Button size="sm" variant="danger" className="bg-red-50 text-red-600 hover:bg-red-100 border-none dark:bg-red-900/20 dark:text-red-400" onClick={() => rejectAd(ad.id)}>
                                                <X className="w-4 h-4 mr-2" /> Отклонить
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'ads' && (
                <div className="animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4">Фото</th>
                                        <th className="px-6 py-4">Заголовок</th>
                                        <th className="px-6 py-4">Цена</th>
                                        <th className="px-6 py-4">Статус</th>
                                        <th className="px-6 py-4 text-right">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {allAds.map(ad => (
                                        <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-3">
                                                <img src={ad.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100" alt="" />
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{ad.title}</div>
                                                <div className="text-xs text-gray-500">{ad.category}</div>
                                            </td>
                                            <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-gray-200">
                                                {ad.price.toLocaleString()} ₽
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    ad.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    ad.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {ad.status === 'approved' ? 'Активно' : ad.status === 'pending' ? 'Ждет' : 'Отклонено'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => toggleVipAd(ad)}
                                                        className={`p-2 rounded-lg transition-colors ${ad.isVip ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-400 hover:text-orange-500 dark:bg-gray-700 dark:text-gray-500'}`}
                                                        title="Toggle VIP"
                                                    >
                                                        <Crown className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteAdPermanently(ad.id)}
                                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'content' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b dark:border-gray-700 pb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                                <PieChart className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg dark:text-white">Создать опрос</h3>
                        </div>
                        
                        <form onSubmit={handleCreatePoll} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Вопрос</label>
                                <input 
                                   required
                                   className="w-full border rounded-xl p-3 mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                   placeholder="Например: Где установить елку?"
                                   value={pollQuestion}
                                   onChange={e => setPollQuestion(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Варианты ответов</label>
                                {pollOptions.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="py-3 px-1 text-gray-400 text-sm font-mono">{idx + 1}.</span>
                                        <input 
                                           className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                           placeholder={`Вариант ответа`}
                                           value={opt}
                                           onChange={e => handleOptionChange(idx, e.target.value)}
                                           required
                                        />
                                    </div>
                                ))}
                                <button 
                                   type="button" 
                                   onClick={() => setPollOptions([...pollOptions, ''])}
                                   className="text-sm text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Добавить вариант
                                </button>
                            </div>
                            <div className="pt-4 border-t dark:border-gray-700">
                                <Button className="w-full py-3 shadow-lg shadow-blue-200 dark:shadow-none">Опубликовать опрос</Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-center items-center text-center">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Управление новостями</h3>
                            <p className="opacity-90 mb-6">Добавляйте важные события и новости города.</p>
                            <Link to="/news">
                                <Button variant="secondary" className="border-none shadow-lg text-indigo-700">
                                    Перейти к новостям
                                </Button>
                            </Link>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Connect Business Page
export const ConnectBusiness: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Магазины',
        description: '',
        address: '',
        phone: '',
        workHours: '09:00 - 18:00',
        image: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createBusiness(formData);
            alert("Заявка на подключение бизнеса отправлена!");
            navigate('/profile');
            // Force reload to update sidebar state
            window.location.reload(); 
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-blue-600" /> Подключить бизнес
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название компании</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                        <select className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option>Магазины</option>
                            <option>Кафе и рестораны</option>
                            <option>Услуги</option>
                            <option>Красота</option>
                            <option>Спорт</option>
                            <option>Грузоперевозки</option>
                            <option>Аренда</option>
                            <option>Туризм</option>
                            <option>Медицина</option>
                            <option>Авто</option>
                            <option>Кино</option>
                            <option>Развлечения</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Адрес</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
                            <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Часы работы</label>
                            <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.workHours} onChange={e => setFormData({...formData, workHours: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
                        <textarea rows={4} className="w-full border rounded-lg p-2 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        {formData.image ? (
                            <img src={formData.image} alt="" className="h-32 mx-auto rounded object-cover" />
                        ) : (
                            <div className="relative cursor-pointer">
                                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">{uploading ? "Загрузка..." : "Загрузить логотип / фото"}</span>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            </div>
                        )}
                    </div>
                    <Button className="w-full" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Подключить'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

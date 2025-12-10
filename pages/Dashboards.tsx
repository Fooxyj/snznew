
import React, { useState } from 'react';
import { api } from '../services/api';
import { User, Ad, Business, UserRole, Story, Suggestion, TransportSchedule } from '../types';
import { Button, XPBar, Badge } from '../components/ui/Common';
import { 
    User as UserIcon, Settings, LogOut, Loader2, Plus, 
    Briefcase, ShoppingBag, Check, X, 
    Trophy, MapPin, Building2, Crown,
    LayoutDashboard, FileText, BarChart3, Users,
    Edit3, Trash2, ChevronDown, List, Upload, Pencil, Star, Shield, Zap, TrendingUp, PieChart as PieChartIcon, Film, Lightbulb, MessageSquare, AlertTriangle, ExternalLink, Bus
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { EditAdModal } from '../components/EditAdModal';
import { WORK_SCHEDULES } from '../constants';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuggestIdeaModal } from '../components/SuggestIdeaModal';
import { PhoneInput } from '../components/ui/PhoneInput';

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
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl transition-colors duration-200 overflow-y-auto max-h-[90vh]">
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
                        <PhoneInput 
                            value={formData.phone}
                            onChangeText={val => setFormData({...formData, phone: val})}
                        />
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
        image: business.image,
        coverImage: business.coverImage,
        inn: business.inn || '',
        ogrn: business.ogrn || ''
    });
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [isCustomSchedule, setIsCustomSchedule] = useState(!WORK_SCHEDULES.includes(business.workHours));

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'coverImage') => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (field === 'image') setUploadingImage(true);
        else setUploadingCover(true);

        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, [field]: url }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            if (field === 'image') setUploadingImage(false);
            else setUploadingCover(false);
        }
    };

    const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'inn' | 'ogrn') => {
        const val = e.target.value.replace(/\D/g, ''); 
        setFormData(prev => ({ ...prev, [field]: val }));
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
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">ИНН</label>
                            <input 
                                className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.inn} 
                                onChange={(e) => handleNumericInput(e, 'inn')}
                                maxLength={12}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">ОГРН</label>
                            <input 
                                className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.ogrn} 
                                onChange={(e) => handleNumericInput(e, 'ogrn')}
                                maxLength={15}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Телефон</label>
                            <PhoneInput 
                                value={formData.phone}
                                onChangeText={val => setFormData({...formData, phone: val})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Часы работы</label>
                            <select 
                                className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                value={isCustomSchedule ? 'custom' : formData.workHours}
                                onChange={e => {
                                    if(e.target.value === 'custom') {
                                        setIsCustomSchedule(true);
                                        setFormData(prev => ({...prev, workHours: ''}));
                                    } else {
                                        setIsCustomSchedule(false);
                                        setFormData(prev => ({...prev, workHours: e.target.value}));
                                    }
                                }}
                            >
                                {WORK_SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                                <option value="custom">Другое...</option>
                            </select>
                        </div>
                    </div>
                    {isCustomSchedule && (
                        <div>
                            <input 
                                className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                value={formData.workHours} 
                                onChange={e => setFormData({...formData, workHours: e.target.value})} 
                                placeholder="Введите свой график"
                                required 
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Адрес</label>
                        <input className="w-full border rounded-lg p-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required placeholder="ул. Ленина, 15" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Описание</label>
                        <textarea className="w-full border rounded-lg p-2 resize-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-700/50">
                            <div className="relative cursor-pointer">
                                {formData.image && <img src={formData.image} alt="" className="h-20 w-full object-cover rounded mb-2" />}
                                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    <span className="text-xs">{uploadingImage ? "..." : "Логотип"}</span>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'image')} />
                            </div>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-700/50">
                            <div className="relative cursor-pointer">
                                {formData.coverImage && <img src={formData.coverImage} alt="" className="h-20 w-full object-cover rounded mb-2" />}
                                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                    {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    <span className="text-xs">{uploadingCover ? "..." : "Обложка"}</span>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                            </div>
                        </div>
                    </div>

                    <Button className="w-full" disabled={loading || uploadingImage || uploadingCover}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Сохранить изменения'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
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
            {user && (
                <EditProfileModal 
                    user={user}
                    isOpen={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['user'] })}
                />
            )}
            {editingBusiness && (
                <EditBusinessModal 
                    business={editingBusiness}
                    isOpen={!!editingBusiness}
                    onClose={() => setEditingBusiness(null)}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['myBusinesses'] })}
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
                
                <div className="flex-1 text-center md:text-left z-10 w-full">
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{user.name}</h1>
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

                <div className="flex flex-col gap-3 w-full md:w-auto min-w-[140px] z-10">
                    <button onClick={() => setIsIdeaModalOpen(true)} className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800">
                        <Lightbulb className="w-4 h-4 mr-2" /> Предложить идею
                    </button>
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
                                        <img src={biz.coverImage || biz.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
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
    const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'content' | 'ads' | 'stories' | 'feedback' | 'transport'>('overview');
    
    // Poll State
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    
    // Transport State
    const [newTransport, setNewTransport] = useState({ type: 'city', routeNumber: '', title: '', schedule: '', workHours: '', price: '' });

    const queryClient = useQueryClient();

    // Use React Query for all data
    const { data: stats = { users: 0, ads: 0, businesses: 0, news: 0, stories: 0 } } = useQuery({
        queryKey: ['adminStats'],
        queryFn: api.getSystemStats
    });

    const { data: analytics = { activity: [], distribution: [] } } = useQuery({
        queryKey: ['adminAnalytics'],
        queryFn: api.getAdminAnalytics
    });

    const { data: pendingAds = [] } = useQuery({
        queryKey: ['ads', 'pending'],
        queryFn: api.getPendingAds
    });

    const { data: allAds = [] } = useQuery({
        queryKey: ['ads', 'admin'],
        queryFn: api.getAllAdsForAdmin
    });

    const { data: allStories = [] } = useQuery({
        queryKey: ['stories'],
        queryFn: api.getStories,
        staleTime: 0,
    });

    const { data: transportSchedules = [] } = useQuery({
        queryKey: ['transport'],
        queryFn: api.getTransportSchedules
    });

    const { data: suggestions = [] } = useQuery({
        queryKey: ['suggestions'],
        queryFn: api.getSuggestions,
        staleTime: 0
    });

    const { data: reports = [] } = useQuery({
        queryKey: ['reports'],
        queryFn: api.getReports,
        staleTime: 0
    });

    // Mutations
    const deleteStoryMutation = useMutation({
        mutationFn: api.deleteStory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
        onError: (e: any) => alert(e.message)
    });

    const deleteSuggestionMutation = useMutation({
        mutationFn: api.deleteSuggestion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suggestions'] }),
        onError: (e: any) => alert(e.message)
    });

    const deleteReportMutation = useMutation({
        mutationFn: api.deleteReport,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
        onError: (e: any) => alert(e.message)
    });

    const addTransportMutation = useMutation({
        mutationFn: (data: any) => api.addTransportSchedule({ ...data, price: data.price ? Number(data.price) : undefined }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transport'] });
            setNewTransport({ type: 'city', routeNumber: '', title: '', schedule: '', workHours: '', price: '' });
        },
        onError: (e: any) => alert(e.message)
    });

    const deleteTransportMutation = useMutation({
        mutationFn: api.deleteTransportSchedule,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transport'] })
    });

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
        try {
            await api.approveAd(id);
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        } catch (e: any) {
            alert("Ошибка одобрения: " + e.message);
        }
    };

    const rejectAd = async (id: string) => {
        if(confirm("Отклонить объявление?")) {
            try {
                await api.rejectAd(id);
                queryClient.invalidateQueries({ queryKey: ['ads'] });
            } catch (e: any) {
                alert("Ошибка отклонения: " + e.message);
            }
        }
    };

    const toggleVipAd = async (ad: Ad) => {
        try {
            await api.adminToggleVip(ad.id, !!ad.isVip);
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        } catch(e:any) {
            alert(e.message);
        }
    };

    const deleteAdPermanently = async (id: string) => {
        if(confirm("Удалить это объявление навсегда?")) {
            try {
                await api.deleteAd(id);
                queryClient.invalidateQueries({ queryKey: ['ads'] });
            } catch(e:any) {
                alert(e.message);
            }
        }
    };

    const handleDeleteStory = (id: string) => {
        if (confirm("Удалить эту историю навсегда?")) {
            deleteStoryMutation.mutate(id);
        }
    };

    const handleDeleteSuggestion = (id: string) => {
        if (confirm("Удалить это сообщение?")) {
            deleteSuggestionMutation.mutate(id);
        }
    };

    const handleDeleteReport = (id: string) => {
        if (confirm("Удалить жалобу?")) {
            deleteReportMutation.mutate(id);
        }
    };

    const handleAddTransport = (e: React.FormEvent) => {
        e.preventDefault();
        addTransportMutation.mutate(newTransport);
    };

    const handleDeleteTransport = (id: string) => {
        if(confirm("Удалить этот рейс?")) deleteTransportMutation.mutate(id);
    };

    const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

    // Helper for displaying reports nicely
    const getTargetLabel = (type: string) => {
        const map: Record<string, string> = {
            app: 'Приложение',
            ad: 'Объявление',
            user: 'Пользователь',
            comment: 'Комментарий',
            business: 'Бизнес',
            post: 'Пост'
        };
        return map[type] || type.toUpperCase();
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-24">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 dark:text-white flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-blue-600" /> Администрирование
            </h1>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700 mb-8 overflow-x-auto">
                {['overview', 'moderation', 'ads', 'content', 'stories', 'feedback', 'transport'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 lg:px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap text-sm lg:text-base capitalize ${activeTab === tab ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {tab === 'overview' && <><BarChart3 className="w-4 h-4" /> Обзор</>}
                        {tab === 'moderation' && <><Shield className="w-4 h-4" /> Модерация {pendingAds.length > 0 && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{pendingAds.length}</span>}</>}
                        {tab === 'ads' && <><List className="w-4 h-4" /> Объявления</>}
                        {tab === 'content' && <><FileText className="w-4 h-4" /> Контент</>}
                        {tab === 'stories' && <><Film className="w-4 h-4" /> Истории</>}
                        {tab === 'feedback' && <><MessageSquare className="w-4 h-4" /> Идеи/Жалобы</>}
                        {tab === 'transport' && <><Bus className="w-4 h-4" /> Транспорт</>}
                    </button>
                ))}
            </div>

            {/* Overview Tab - RESTORED */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                        {/* Users */}
                        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between h-28 lg:h-32 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm font-medium uppercase tracking-wider">Пользователи</p>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.users}</h3>
                            </div>
                            <div className="absolute right-3 bottom-3 text-blue-100 dark:text-blue-900/20">
                                <Users className="w-12 h-12 lg:w-16 lg:h-16" />
                            </div>
                        </div>
                        
                        {/* Ads */}
                        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between h-28 lg:h-32 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm font-medium uppercase tracking-wider">Объявления</p>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.ads}</h3>
                            </div>
                            <div className="absolute right-3 bottom-3 text-green-100 dark:text-green-900/20">
                                <ShoppingBag className="w-12 h-12 lg:w-16 lg:h-16" />
                            </div>
                        </div>

                        {/* Businesses */}
                        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between h-28 lg:h-32 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm font-medium uppercase tracking-wider">Бизнес</p>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.businesses}</h3>
                            </div>
                            <div className="absolute right-3 bottom-3 text-purple-100 dark:text-purple-900/20">
                                <Briefcase className="w-12 h-12 lg:w-16 lg:h-16" />
                            </div>
                        </div>

                        {/* News */}
                        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between h-28 lg:h-32 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm font-medium uppercase tracking-wider">Новости</p>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.news}</h3>
                            </div>
                            <div className="absolute right-3 bottom-3 text-orange-100 dark:text-orange-900/20">
                                <FileText className="w-12 h-12 lg:w-16 lg:h-16" />
                            </div>
                        </div>

                        {/* Stories */}
                        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between h-28 lg:h-32 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm font-medium uppercase tracking-wider">Истории</p>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.stories}</h3>
                            </div>
                            <div className="absolute right-3 bottom-3 text-pink-100 dark:text-pink-900/20">
                                <Film className="w-12 h-12 lg:w-16 lg:h-16" />
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm h-80">
                            <h3 className="font-bold mb-4 dark:text-white">Активность за неделю</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.activity}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#6b7280" />
                                    <YAxis axisLine={false} tickLine={false} stroke="#6b7280" />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    />
                                    <Bar dataKey="users" name="Пользователи" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="ads" name="Объявления" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm h-80">
                            <h3 className="font-bold mb-4 dark:text-white">Распределение контента</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analytics.distribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Transport Tab */}
            {activeTab === 'transport' && (
                <div className="animate-in fade-in">
                    <h2 className="text-xl font-bold mb-6 dark:text-white">Управление транспортом</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm sticky top-24">
                                <h3 className="font-bold mb-4 dark:text-white">Добавить рейс</h3>
                                <form onSubmit={handleAddTransport} className="space-y-3">
                                    <select 
                                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newTransport.type}
                                        onChange={e => setNewTransport({...newTransport, type: e.target.value})}
                                    >
                                        <option value="city">Городской</option>
                                        <option value="intercity">Междугородний</option>
                                    </select>
                                    
                                    {newTransport.type === 'city' && (
                                        <input 
                                            placeholder="Номер маршрута (напр. 7)"
                                            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={newTransport.routeNumber}
                                            onChange={e => setNewTransport({...newTransport, routeNumber: e.target.value})}
                                        />
                                    )}
                                    
                                    <input 
                                        placeholder={newTransport.type === 'city' ? "Название маршрута" : "Направление"}
                                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newTransport.title}
                                        onChange={e => setNewTransport({...newTransport, title: e.target.value})}
                                        required
                                    />
                                    
                                    <input 
                                        placeholder={newTransport.type === 'city' ? "Интервал (напр. 10 мин)" : "Время отправления"}
                                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newTransport.schedule}
                                        onChange={e => setNewTransport({...newTransport, schedule: e.target.value})}
                                        required
                                    />
                                    
                                    <input 
                                        placeholder={newTransport.type === 'city' ? "Часы работы" : "Время в пути"}
                                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newTransport.workHours}
                                        onChange={e => setNewTransport({...newTransport, workHours: e.target.value})}
                                    />
                                    
                                    {newTransport.type === 'intercity' && (
                                        <input 
                                            type="number"
                                            placeholder="Цена (₽)"
                                            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={newTransport.price}
                                            onChange={e => setNewTransport({...newTransport, price: e.target.value})}
                                        />
                                    )}

                                    <Button className="w-full" disabled={addTransportMutation.isPending}>
                                        {addTransportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Добавить'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 font-bold dark:text-white">
                                    Городские маршруты
                                </div>
                                <div className="divide-y dark:divide-gray-700">
                                    {transportSchedules.filter(t => t.type === 'city').map(t => (
                                        <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <div>
                                                <div className="font-bold text-lg dark:text-white">
                                                    <span className="text-blue-600 mr-2">#{t.routeNumber}</span> 
                                                    {t.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Интервал: {t.schedule} • {t.workHours}
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteTransport(t.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {transportSchedules.filter(t => t.type === 'city').length === 0 && (
                                        <div className="p-4 text-center text-gray-400">Нет маршрутов</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 font-bold dark:text-white">
                                    Междугородние рейсы
                                </div>
                                <div className="divide-y dark:divide-gray-700">
                                    {transportSchedules.filter(t => t.type === 'intercity').map(t => (
                                        <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <div>
                                                <div className="font-bold text-lg dark:text-white">{t.title}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Отправление: {t.schedule}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    В пути: {t.workHours} • {t.price} ₽
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteTransport(t.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {transportSchedules.filter(t => t.type === 'intercity').length === 0 && (
                                        <div className="p-4 text-center text-gray-400">Нет рейсов</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'moderation' && (
                <div className="animate-in fade-in">
                    {/* ... moderation content ... */}
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
                                <div key={ad.id} className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 lg:gap-6">
                                    <img src={ad.image} className="w-full md:w-48 h-48 md:h-32 rounded-xl object-cover bg-gray-100" alt="" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg dark:text-white line-clamp-1">{ad.title}</h3>
                                            <span className="font-bold text-blue-600">{ad.price} ₽</span>
                                        </div>
                                        <div className="flex gap-2 mb-3">
                                            <Badge color="gray">{ad.category}</Badge>
                                            <span className="text-xs text-gray-400 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {ad.location}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{ad.description}</p>
                                        
                                        <div className="flex gap-3">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none flex-1 md:flex-none" onClick={() => approveAd(ad.id)}>
                                                <Check className="w-4 h-4 mr-2" /> Одобрить
                                            </Button>
                                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white flex-1 md:flex-none shadow-red-200 dark:shadow-none" onClick={() => rejectAd(ad.id)}>
                                                <X className="w-4 h-4 mr-2" /> Отклонить
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    }
                    </div>
                </div>
            )}

            {/* Other tabs logic remains mostly the same, just keeping the structure */}
            {activeTab === 'ads' && (
                <div className="animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 lg:px-6 py-4">Фото</th>
                                    <th className="px-4 lg:px-6 py-4">Заголовок</th>
                                    <th className="px-4 lg:px-6 py-4">Цена</th>
                                    <th className="px-4 lg:px-6 py-4">Статус</th>
                                    <th className="px-4 lg:px-6 py-4 text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {allAds.map(ad => (
                                    <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 lg:px-6 py-3">
                                            <img src={ad.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100" alt="" />
                                        </td>
                                        <td className="px-4 lg:px-6 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white line-clamp-1 text-sm lg:text-base">{ad.title}</div>
                                            <div className="text-xs text-gray-500">{ad.category}</div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 text-sm font-bold text-gray-900 dark:text-gray-200">
                                            {ad.price.toLocaleString()} ₽
                                        </td>
                                        <td className="px-4 lg:px-6 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                ad.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                ad.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {ad.status === 'approved' ? 'Активно' : ad.status === 'pending' ? 'Ждет' : 'Отклонено'}
                                            </span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 text-right">
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
            )}

            {activeTab === 'stories' && (
                <div className="animate-in fade-in">
                    {/* ... stories content ... */}
                    <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                        Управление историями <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-0.5 rounded-full">{allStories.length}</span>
                    </h2>
                    
                    {allStories.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed dark:border-gray-700">
                            <Film className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Историй пока нет.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {allStories.map(story => (
                                <div key={story.id} className="relative aspect-[9/16] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm group">
                                    <img src={story.media} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                    <div className="absolute top-2 left-2 right-2 flex items-center gap-2">
                                        <img src={story.authorAvatar} className="w-6 h-6 rounded-full border border-white/50" alt="" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-white font-bold truncate">{story.authorName}</p>
                                            <p className="text--[9px] text-gray-300">{new Date(story.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteStory(story.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full z-20 shadow-lg hover:bg-red-700 transition-colors"
                                        title="Удалить историю"
                                    >
                                        {deleteStoryMutation.isPending && deleteStoryMutation.variables === story.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="animate-in fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ideas Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                            Предложения <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm px-2 py-0.5 rounded-full">{suggestions.length}</span>
                        </h2>
                        <div className="space-y-4">
                            {suggestions.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 italic">Предложений пока нет.</p>
                            ) : (
                                suggestions.map(s => (
                                    <div key={s.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center shrink-0">
                                            <Lightbulb className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{s.userName || 'Аноним'}</div>
                                                    <div className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</div>
                                                </div>
                                                <button onClick={() => handleDeleteSuggestion(s.id)} className="text-gray-400 hover:text-red-500 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">{s.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Reports Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                            Жалобы <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm px-2 py-0.5 rounded-full">{reports.length}</span>
                        </h2>
                        <div className="space-y-4">
                            {reports.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 italic">Жалоб пока нет.</p>
                            ) : (
                                reports.map(r => (
                                    <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex gap-4 border-l-4 border-l-red-500">
                                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                                        {r.userName || 'Аноним'}
                                                        <span className="text-xs font-normal text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border dark:border-gray-600">
                                                            {getTargetLabel(r.targetType)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                                                </div>
                                                <button onClick={() => handleDeleteReport(r.id)} className="text-gray-400 hover:text-red-500 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-gray-800 dark:text-gray-200 text-sm font-medium mb-1">{r.reason}</p>
                                            {r.targetId && r.targetId !== 'general' && (
                                                <div className="text-gray-500 dark:text-gray-400 text-xs mt-2 p-1.5 bg-gray-50 dark:bg-gray-700/30 rounded border dark:border-gray-700 font-mono">
                                                    ID: {r.targetId}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'content' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b dark:border-gray-700 pb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                                <PieChartIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg dark:text-white">Создать опрос</h3>
                        </div>
                        <form onSubmit={handleCreatePoll} className="space-y-4">
                            {/* ... poll form ... */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Вопрос</label>
                                <input required className="w-full border rounded-xl p-3 mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Например: Где установить елку?" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Варианты ответов</label>
                                {pollOptions.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="py-3 px-1 text-gray-400 text-sm font-mono">{idx + 1}.</span>
                                        <input className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder={`Вариант ответа`} value={opt} onChange={e => handleOptionChange(idx, e.target.value)} required />
                                    </div>
                                ))}
                                <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="text-sm text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors">
                                    <Plus className="w-4 h-4" /> Добавить вариант
                                </button>
                            </div>
                            <div className="pt-4 border-t dark:border-gray-700">
                                <Button className="w-full py-3 shadow-lg shadow-blue-200 dark:shadow-none">Опубликовать опрос</Button>
                            </div>
                        </form>
                    </div>
                    {/* ... news banner ... */}
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

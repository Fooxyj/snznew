
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import { Button, BadgeIcon } from '../components/ui/Common';
import { PhoneInput } from '../components/ui/PhoneInput';
import { 
    Moon, Sun, Bell, Shield, Lock, Trash2, Smartphone, 
    Mail, Loader2, FileText, ChevronRight, User as UserIcon, 
    Camera, Check, Save, FileJson, MapPinOff, ShieldAlert, Navigation, X, AlertTriangle, Trophy, Star, MapPin, AlignLeft, Calendar, UserCheck, Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const queryClient = useQueryClient();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        bio: '',
        phone: '',
        birthDate: '',
        gender: 'none' as 'male' | 'female' | 'other' | 'none',
        occupation: ''
    });
    const [uploading, setUploading] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
    
    const [geoEnabled, setGeoEnabled] = useState(() => {
        return localStorage.getItem('app_geo_enabled') !== 'false';
    });
    const [isExporting, setIsExporting] = useState(false);

    const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                avatar: user.avatar || '',
                bio: user.bio || '',
                phone: user.phone || '',
                birthDate: user.birthDate || '',
                gender: user.gender || 'none',
                occupation: user.occupation || ''
            });
            // Если в БД showcased_badges есть (даже пустой), берем его. Если null - берем 3 первых для пресета.
            setSelectedBadges(Array.isArray(user.showcasedBadges) ? user.showcasedBadges : user.badges.slice(0, 3));
        }
    }, [user]);

    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => api.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            success("Профиль успешно обновлен!");
        },
        onError: (e: any) => showError("Ошибка: " + e.message)
    });

    const updateShowcaseMutation = useMutation({
        mutationFn: (ids: string[]) => api.updateShowcasedBadges(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            success("Витрина наград обновлена");
        }
    });

    const handleToggleBadge = (bId: string) => {
        setSelectedBadges(prev => {
            if (prev.includes(bId)) {
                return prev.filter(i => i !== bId);
            }
            if (prev.length >= 3) {
                showError("Максимум 3 награды для показа");
                return prev;
            }
            return [...prev, bId];
        });
    };

    const handleSaveShowcase = () => {
        // Теперь передаем массив как есть, даже если он []
        updateShowcaseMutation.mutate(selectedBadges);
    };

    const deleteAccountMutation = useMutation({
        mutationFn: () => api.deleteAccount(),
        onSuccess: () => {
            success("Ваш аккаунт и данные были безвозвратно удалены.");
            queryClient.invalidateQueries({ queryKey: ['user'] });
            navigate('/');
        },
        onError: (e: any) => {
            showError("Не удалось удалить данные: " + e.message);
            setIsDeleteModalOpen(false);
        }
    });

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, avatar: url }));
            success("Фото загружено.");
        } catch (e: any) {
            showError(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = () => {
        if (!formData.name.trim()) return showError("Имя не может быть пустым");
        updateProfileMutation.mutate(formData);
    };

    const handleToggleGeo = () => {
        const newState = !geoEnabled;
        setGeoEnabled(newState);
        localStorage.setItem('app_geo_enabled', String(newState));
        success(newState ? "Доступ к геолокации разрешен" : "Доступ к геолокации ограничен");
    };

    const handleExportData = async () => {
        if (!user) return;
        setIsExporting(true);
        try {
            const content = await api.getUserContent(user.id);
            const exportObj = {
                profile: { id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp, createdAt: user.createdAt },
                ads: content.ads,
                favorites: user.favorites,
                exportedAt: new Date().toISOString(),
                platform: "Простор"
            };
            const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prostor_data_${user.name.replace(/\s+/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            success("Архив с данными успешно загружен");
        } catch (e) { showError("Не удалось выгрузить данные"); } finally { setIsExporting(false); }
    };

    const isDeleteButtonActive = deleteConfirmEmail.trim().toLowerCase() === user?.email.toLowerCase();

    if (userLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    const isDirty = user && (
        formData.name !== user.name ||
        formData.avatar !== user.avatar ||
        formData.bio !== user.bio ||
        formData.phone !== user.phone ||
        formData.birthDate !== user.birthDate ||
        formData.gender !== user.gender ||
        formData.occupation !== user.occupation
    );

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-8 pb-32">
            <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white uppercase tracking-tight">Настройки</h1>

            {/* Account Deletion Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border-2 border-red-500/20 relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
                        
                        <div className="flex justify-between items-center mb-8">
                             <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600">
                                 <AlertTriangle className="w-8 h-8" />
                             </div>
                             <button onClick={() => setIsDeleteModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
                                 <X className="w-6 h-6" />
                             </button>
                        </div>

                        <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white mb-4">Удаление аккаунта</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-4 mb-10 leading-relaxed">
                            <p>Это действие <strong>необратимо</strong>. Ваши объявления, переписки, опыт (XP) и бизнес-профили будут удалены с платформы навсегда.</p>
                            <p className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 text-red-600 font-bold italic">Для подтверждения введите ваш Email ниже:</p>
                        </div>

                        <div className="space-y-6">
                            <input 
                                className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-red-100 dark:border-red-900/30 rounded-2xl px-6 py-4 text-center font-bold dark:text-white focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300"
                                placeholder={user?.email}
                                value={deleteConfirmEmail}
                                onChange={e => setDeleteConfirmEmail(e.target.value)}
                            />

                            <Button 
                                variant="danger" 
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl ${!isDeleteButtonActive ? 'opacity-30 grayscale cursor-not-allowed' : 'shadow-red-500/20 active:scale-95'}`}
                                disabled={!isDeleteButtonActive || deleteAccountMutation.isPending}
                                onClick={() => deleteAccountMutation.mutate()}
                            >
                                {deleteAccountMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Удалить мой аккаунт'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
                <div className="p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <UserIcon className="w-4 h-4" /> Анкета жителя
                    </h2>
                </div>
                <div className="p-6 sm:p-8 space-y-8">
                    <div className="flex flex-col items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-xl bg-gray-50 dark:bg-gray-900">
                                {formData.avatar ? (
                                    <img src={formData.avatar} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <UserIcon className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-90 z-10">
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                            </label>
                        </div>
                        
                        <div className="flex-1 w-full space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Имя или Псевдоним</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ваше имя"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Дата рождения</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input 
                                            type="date" 
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                            value={formData.birthDate}
                                            onChange={e => setFormData({...formData, birthDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Пол</label>
                                    <div className="relative">
                                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <select 
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-bold appearance-none"
                                            value={formData.gender}
                                            onChange={e => setFormData({...formData, gender: e.target.value as any})}
                                        >
                                            <option value="none">Не указан</option>
                                            <option value="male">Мужской</option>
                                            <option value="female">Женский</option>
                                            <option value="other">Другой</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Телефон</label>
                                    <PhoneInput 
                                        value={formData.phone} 
                                        onChangeText={val => setFormData({...formData, phone: val})} 
                                        className="bg-gray-50 dark:bg-gray-900 border-none px-5 py-4 h-[56px] font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Род деятельности</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                            value={formData.occupation}
                                            onChange={e => setFormData({...formData, occupation: e.target.value})}
                                            placeholder="Напр: Студент, Инженер..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">О себе (Био)</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                    <textarea 
                                        rows={3}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium resize-none leading-relaxed"
                                        value={formData.bio}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                        placeholder="Расскажите немного о себе..."
                                    />
                                </div>
                            </div>

                            <Button 
                                onClick={handleSaveProfile} 
                                disabled={updateProfileMutation.isPending || !isDirty}
                                className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
                            >
                                {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Сохранить анкету</>}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Showcase Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
                <div className="p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Trophy className="w-4 h-4" /> Витрина наград
                    </h2>
                </div>
                <div className="p-6 sm:p-8">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">Выберите до 3 наград, которые будут отображаться рядом с вашим именем в профиле и комментариях.</p>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-8">
                        {user?.badges.length === 0 ? (
                            <div className="col-span-full py-4 text-center text-gray-400 italic text-xs">У вас пока нет разблокированных наград</div>
                        ) : (
                            user?.badges.map(bId => (
                                <button 
                                    key={bId} 
                                    onClick={() => handleToggleBadge(bId)}
                                    className={`relative p-1 rounded-2xl transition-all ${selectedBadges.includes(bId) ? 'ring-4 ring-blue-600/20' : 'hover:scale-105'}`}
                                >
                                    <BadgeIcon name={bId} size="md" />
                                    {selectedBadges.includes(bId) && (
                                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                            <Check className="w-2 h-2 stroke-[4]" />
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    <Button 
                        onClick={handleSaveShowcase}
                        disabled={updateShowcaseMutation.isPending}
                        className="w-full sm:w-auto"
                    >
                        {updateShowcaseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Обновить витрину'}
                    </Button>
                </div>
            </div>

            {/* Privacy Management */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
                <div className="p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Shield className="w-4 h-4" /> Конфиденциальность и данные
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-colors ${geoEnabled ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                {geoEnabled ? <Navigation className="w-5 h-5" /> : <MapPinOff className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900 dark:text-white">Доступ к геолокации</div>
                                <div className="text-xs text-gray-500">Нужен для поиска объявлений рядом и квестов</div>
                            </div>
                        </div>
                        <button 
                            onClick={handleToggleGeo}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${geoEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform ${geoEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="pt-4 border-t dark:border-gray-700">
                        <button 
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors group"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <FileJson className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <div>
                                    <div className="font-bold text-sm text-gray-900 dark:text-white">Экспорт моих данных</div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">JSON Архив</p>
                                </div>
                            </div>
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4 text-gray-300" />}
                        </button>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                <div>
                                    <div className="font-bold text-sm text-red-600">Отозвать согласие</div>
                                    <p className="text-[10px] text-red-500/60 uppercase font-black">Прекратить обработку</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-red-200 group-hover:text-red-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
                <div className="p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Sun className="w-4 h-4" /> Интерфейс
                    </h2>
                </div>
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Темная тема</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Снижает нагрузку на зрение в темноте</div>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className={`w-16 h-9 rounded-2xl p-1 transition-all duration-500 flex items-center ${theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-gray-200 justify-start'}`}
                    >
                        <div className="w-7 h-7 bg-white rounded-xl shadow-lg flex items-center justify-center">
                            {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                        </div>
                    </button>
                </div>
            </div>

            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                <div>
                    <div className="font-bold text-red-700 dark:text-red-400">Удалить аккаунт</div>
                    <div className="text-xs text-red-600/60 dark:text-red-400/60">Все данные будут стерты навсегда</div>
                </div>
                <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => setIsDeleteModalOpen(true)} 
                    className="rounded-xl px-6"
                >
                    Удалить
                </Button>
            </div>
        </div>
    );
};

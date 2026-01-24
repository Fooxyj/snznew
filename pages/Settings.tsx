
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import { Button } from '../components/ui/Common';
import { 
    Moon, Sun, Bell, Shield, Lock, Trash2, Smartphone, 
    Mail, Loader2, FileText, ChevronRight, User as UserIcon, 
    Camera, Check, Save, FileJson, MapPinOff, ShieldAlert, Navigation
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

    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [uploading, setUploading] = useState(false);
    const [notificationsEmail, setNotificationsEmail] = useState(true);
    const [notificationsPush, setNotificationsPush] = useState(true);
    
    // Новые состояния для приватности
    const [geoEnabled, setGeoEnabled] = useState(() => {
        return localStorage.getItem('app_geo_enabled') !== 'false';
    });
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setAvatar(user.avatar);
        }
    }, [user]);

    const updateProfileMutation = useMutation({
        mutationFn: (data: { name: string, avatar: string }) => api.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            success("Профиль успешно обновлен!");
        },
        onError: (e: any) => showError("Ошибка: " + e.message)
    });

    const deleteAccountMutation = useMutation({
        mutationFn: () => api.deleteAccount(),
        onSuccess: () => {
            success("Ваш аккаунт и данные были безвозвратно удалены.");
            queryClient.invalidateQueries({ queryKey: ['user'] });
            navigate('/');
        },
        onError: (e: any) => showError("Не удалось удалить данные: " + e.message)
    });

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setAvatar(url);
            success("Фото загружено.");
        } catch (e: any) {
            showError(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = () => {
        if (!name.trim()) return showError("Имя не может быть пустым");
        updateProfileMutation.mutate({ name, avatar });
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
            // Собираем данные для выгрузки
            const content = await api.getUserContent(user.id);
            const exportObj = {
                profile: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    xp: user.xp,
                    createdAt: user.createdAt
                },
                ads: content.ads,
                favorites: user.favorites,
                exportedAt: new Date().toISOString(),
                platform: "Снежинск Лайф"
            };

            const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my_data_${user.name.replace(/\s+/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            success("Архив с данными успешно сформирован и загружен");
        } catch (e) {
            showError("Не удалось сформировать архив данных");
        } finally {
            setIsExporting(false);
        }
    };

    const handleWithdrawConsent = () => {
        const confirmed = window.confirm(
            "Отзыв согласия на обработку данных приведет к немедленному удалению вашего аккаунта и всей связанной информации (объявлений, сообщений, XP). Продолжить?"
        );
        if (confirmed) {
            deleteAccountMutation.mutate();
        }
    };

    if (userLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-8 pb-32">
            <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white uppercase tracking-tight">Настройки</h1>

            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
                <div className="p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <UserIcon className="w-4 h-4" /> Личные данные
                    </h2>
                </div>
                <div className="p-6 sm:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-xl bg-gray-50 dark:bg-gray-900">
                                {avatar ? (
                                    <img src={avatar} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <UserIcon className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-90">
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                            </label>
                        </div>
                        
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Имя в системе</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ваше имя"
                                />
                            </div>
                            <Button 
                                onClick={handleSaveProfile} 
                                disabled={updateProfileMutation.isPending || (name === user?.name && avatar === user?.avatar)}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl"
                            >
                                {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Сохранить изменения</>}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Management - НОВЫЙ БЛОК */}
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
                            onClick={handleWithdrawConsent}
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
                    onClick={() => { if(window.confirm("Удалить аккаунт навсегда?")) deleteAccountMutation.mutate(); }} 
                    className="rounded-xl"
                    disabled={deleteAccountMutation.isPending}
                >
                    {deleteAccountMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить'}
                </Button>
            </div>
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import { Button } from '../components/ui/Common';
import { 
    Moon, Sun, Bell, Shield, Lock, Trash2, Smartphone, 
    Mail, Loader2, FileText, ChevronRight, User as UserIcon, 
    Camera, Check, Save
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

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setAvatar(url);
            success("Фото загружено. Не забудьте сохранить изменения.");
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

    const handleDeleteAccount = () => {
        if(confirm("Вы уверены? Это действие необратимо. Все ваши данные будут удалены.")) {
            alert("Запрос на удаление отправлен.");
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
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Как вас зовут?</label>
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
                                {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Сохранить профиль</>}
                            </Button>
                        </div>
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

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
                <div className="p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Bell className="w-4 h-4" /> Уведомления
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">Email рассылка</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Только важные новости города</div>
                            </div>
                        </div>
                        <input type="checkbox" checked={notificationsEmail} onChange={e => setNotificationsEmail(e.target.checked)} className="w-6 h-6 rounded-lg text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">Push уведомления</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">О новых сообщениях в чате</div>
                            </div>
                        </div>
                        <input type="checkbox" checked={notificationsPush} onChange={e => setNotificationsPush(e.target.checked)} className="w-6 h-6 rounded-lg text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Legal */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
                <Link to="/legal" className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-bold text-gray-900 dark:text-white">Правовая информация</span>
                            <p className="text-xs text-gray-500">Условия и приватность</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </Link>
            </div>

            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                <div>
                    <div className="font-bold text-red-700 dark:text-red-400">Удалить аккаунт</div>
                    <div className="text-xs text-red-600/60 dark:text-red-400/60">Все данные будут стерты</div>
                </div>
                <Button variant="danger" size="sm" onClick={handleDeleteAccount} className="rounded-xl">Удалить</Button>
            </div>
        </div>
    );
};

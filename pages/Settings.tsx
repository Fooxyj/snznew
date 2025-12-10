
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import { Button } from '../components/ui/Common';
import { Moon, Sun, Bell, Shield, Lock, Trash2, Smartphone, Mail, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [notificationsEmail, setNotificationsEmail] = useState(true);
    const [notificationsPush, setNotificationsPush] = useState(true);

    // Use Mutation for saving settings
    const saveSettingsMutation = useMutation({
        mutationFn: async () => {
            // In a real app, you would call an API method here like api.updateSettings(...)
            // For now we simulate an async delay
            await new Promise(resolve => setTimeout(resolve, 800));
            return true;
        },
        onSuccess: () => {
            alert("Настройки сохранены");
        },
        onError: () => {
            alert("Ошибка сохранения");
        }
    });

    const handleDeleteAccount = () => {
        if(confirm("Вы уверены? Это действие необратимо. Все ваши данные будут удалены.")) {
            // api.deleteAccount();
            alert("Запрос на удаление отправлен.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Настройки</h1>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Sun className="w-5 h-5" /> Внешний вид
                    </h2>
                </div>
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">Темная тема</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Переключение между светлым и темным оформлением</div>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-gray-200 justify-start'}`}
                    >
                        <div className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center">
                            {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                        </div>
                    </button>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Bell className="w-5 h-5" /> Уведомления
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Email рассылка</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Новости и важные события</div>
                            </div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={notificationsEmail} 
                            onChange={e => setNotificationsEmail(e.target.checked)}
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Push уведомления</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Сообщения чата и ответы</div>
                            </div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={notificationsPush} 
                            onChange={e => setNotificationsPush(e.target.checked)}
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Shield className="w-5 h-5" /> Безопасность
                    </h2>
                </div>
                <div className="p-6">
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        <Lock className="w-4 h-4 mr-2" /> Сменить пароль
                    </Button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden bg-red-50 dark:bg-red-900/10">
                <div className="p-4 border-b border-red-200 dark:border-red-900/50">
                    <h2 className="font-bold text-red-700 dark:text-red-400">Опасная зона</h2>
                </div>
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">Удалить аккаунт</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Это действие нельзя отменить</div>
                    </div>
                    <Button variant="danger" onClick={handleDeleteAccount}>
                        <Trash2 className="w-4 h-4 mr-2" /> Удалить
                    </Button>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <Button size="lg" onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}>
                    {saveSettingsMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Сохранение...</> : 'Сохранить изменения'}
                </Button>
            </div>
        </div>
    );
};

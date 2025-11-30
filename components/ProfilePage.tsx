import React, { useState, useEffect } from 'react';
import { User, Ad, Order } from '../types';
import { AdCard } from './AdCard';
import { getLevelInfo } from '../utils';
import { api } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { useToast } from './Toast';
import { useQueryClient } from '@tanstack/react-query';

interface ProfilePageProps {
    user: User;
    onBack: () => void;
    onLogout: () => void;
    favorites: string[];
    allAds: Ad[];
    onToggleFavorite: (id: string) => void;
    onShowAd: (ad: Ad) => void;
    onEditAd?: (ad: Ad) => void;
    onDeleteAd?: (adId: string) => void;
    onUpdateUser: (user: User) => void;
    onOpenAdminPanel: () => void;
    onOpenMerchantDashboard: () => void;
    onOpenPartnerModal?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
    user, onBack, onLogout, favorites, allAds, onToggleFavorite, onShowAd, onEditAd, onDeleteAd, onUpdateUser, onOpenAdminPanel, onOpenMerchantDashboard, onOpenPartnerModal
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'orders' | 'my_ads'>('profile');
    const [name, setName] = useState(user.name || '');
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const levelInfo = getLevelInfo(user.xp || 0);

    useEffect(() => {
        setName(user.name || '');
        setAvatar(user.avatar || '');
    }, [user]);

    // Filter ads
    const favoriteAds = allAds.filter(ad => favorites.includes(ad.id));
    const myAds = allAds.filter(ad => ad.userId === user.id);

    // Mock Orders if none exist
    const orders: Order[] = user.orders || [
        { id: '1023', date: '12 окт', shopName: 'Суши Хаус', total: 1200, status: 'completed', itemsString: 'Сет Филадельфия' },
        { id: '1024', date: '14 окт', shopName: 'Олива', total: 650, status: 'processing', itemsString: 'Пицца Пепперони' }
    ];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: name, avatar_url: avatar }
            });

            if (error) throw error;

            // Update profiles table
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                await supabase
                    .from('profiles')
                    .update({
                        full_name: name,
                        avatar_url: avatar,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', authUser.id);
            }

            const isNewProfile = !user.name;
            onUpdateUser({ ...user, name, avatar });

            // Invalidate all ads queries to refresh with new profile data
            await queryClient.invalidateQueries({ queryKey: ['ads'] });

            if (isNewProfile) {
                showToast('Профиль заполнен! +30 XP', 'success');
            } else {
                showToast('Профиль обновлен!', 'success');
            }
        } catch (err: any) {
            console.error(err);
            showToast('Ошибка сохранения профиля: ' + err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (adId: string) => {
        if (confirm("Вы действительно хотите удалить это объявление?")) {
            if (onDeleteAd) onDeleteAd(adId);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const publicUrl = await api.uploadFile(file, 'images');
                setAvatar(publicUrl);
            } catch (err) {
                console.error(err);
                alert("Ошибка загрузки аватара");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row animate-fade-in">

            {/* --- MOBILE HEADER --- */}
            <div className="md:hidden bg-white p-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-dark">Профиль</h1>
            </div>

            {/* --- MOBILE USER INFO --- */}
            <div className="md:hidden bg-white p-4 flex flex-col border-b border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="User" /> : user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div className="leading-tight">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-dark text-lg">{name || 'Пользователь'}</p>
                            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${levelInfo.color}`}>Lvl {levelInfo.level}</span>
                        </div>
                        <p className="text-xs text-secondary font-medium">{levelInfo.title}</p>
                    </div>
                </div>

                <div className="w-full">
                    <div className="flex justify-between text-xs text-secondary mb-1">
                        <span>XP: {user.xp || 0}</span>
                        <span>До уровня {levelInfo.level + 1}: {levelInfo.nextLevelXp - (user.xp || 0)}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${levelInfo.color} transition-all duration-500`} style={{ width: `${levelInfo.progressPercent}%` }}></div>
                    </div>
                </div>
            </div>

            {/* --- MOBILE TAB BAR --- */}
            <div className="md:hidden bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar sticky top-[73px] z-10">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'profile' ? 'bg-dark text-white' : 'bg-gray-100 text-secondary'}`}>Профиль</button>
                <button onClick={() => { window.dispatchEvent(new CustomEvent('open-chat-list')); onBack(); }} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors bg-gray-100 text-secondary`}>Сообщения</button>
                <button onClick={() => setActiveTab('favorites')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'favorites' ? 'bg-dark text-white' : 'bg-gray-100 text-secondary'}`}>Избранное ({favorites.length})</button>
                <button onClick={() => setActiveTab('my_ads')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'my_ads' ? 'bg-dark text-white' : 'bg-gray-100 text-secondary'}`}>Мои объявления</button>
                <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-dark text-white' : 'bg-gray-100 text-secondary'}`}>Заказы</button>
            </div>

            {/* --- DESKTOP SIDEBAR --- */}
            <div className="hidden md:flex w-80 bg-white border-r border-gray-200 p-6 flex-col shrink-0 h-screen sticky top-0">
                <button onClick={onBack} className="flex items-center gap-2 text-secondary hover:text-dark font-bold mb-6 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Назад
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl overflow-hidden border-4 border-white">
                            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="User" /> : user.name?.charAt(0) || user.email.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full ${levelInfo.color} border-2 border-white shadow-sm whitespace-nowrap`}>
                            Lvl {levelInfo.level} {levelInfo.title}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-dark text-center mt-4">{name || `Пользователь`}</h2>
                    <p className="text-sm text-secondary">{user.email}</p>

                    <div className="w-full mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex justify-between text-xs font-bold text-secondary mb-2">
                            <span>{user.xp || 0} XP</span>
                            <span>{levelInfo.nextLevelXp} XP</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full ${levelInfo.color} transition-all duration-500`} style={{ width: `${levelInfo.progressPercent}%` }}></div>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-2">До след. уровня: {levelInfo.nextLevelXp - (user.xp || 0)} XP</p>
                    </div>

                    {user.isAdmin && <span className="mt-4 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">Администратор</span>}
                    {user.managedShopId && <span className="mt-2 bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{user.managedShopId.startsWith('cinema') ? 'Кинотеатр' : 'Владелец бизнеса'}</span>}
                </div>

                <nav className="space-y-2 flex-grow">
                    {user.isAdmin && (
                        <button onClick={onOpenAdminPanel} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md hover:scale-[1.02] transition-transform mb-2 group">
                            Админ Панель
                        </button>
                    )}
                    {user.managedShopId && (
                        <button onClick={onOpenMerchantDashboard} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md hover:scale-[1.02] transition-transform mb-2 group">
                            {user.managedShopId.startsWith('cinema') ? 'Кабинет Кино' : 'Мой Бизнес'}
                        </button>
                    )}

                    <button onClick={onOpenPartnerModal} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-md hover:scale-[1.02] transition-transform mb-2 group">
                        Подключить бизнес
                    </button>

                    <div className="h-px bg-gray-100 my-4"></div>

                    <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-gray-100 text-dark' : 'text-secondary hover:bg-gray-50'}`}>
                        Профиль
                    </button>
                    <button onClick={() => { window.dispatchEvent(new CustomEvent('open-chat-list')); onBack(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors text-secondary hover:bg-gray-50`}>
                        Сообщения
                    </button>
                    <button onClick={() => setActiveTab('favorites')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'favorites' ? 'bg-gray-100 text-dark' : 'text-secondary hover:bg-gray-50'}`}>
                        Избранное <span className="ml-auto bg-gray-200 text-xs px-2 py-0.5 rounded-full">{favorites.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('my_ads')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'my_ads' ? 'bg-gray-100 text-dark' : 'text-secondary hover:bg-gray-50'}`}>
                        Мои объявления <span className="ml-auto bg-gray-200 text-xs px-2 py-0.5 rounded-full">{myAds.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-gray-100 text-dark' : 'text-secondary hover:bg-gray-50'}`}>
                        Мои заказы
                    </button>
                </nav>

                <button onClick={() => { onLogout(); onBack(); }} className="mt-4 flex items-center gap-2 text-red-500 hover:text-red-600 font-medium text-sm px-4 py-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Выйти
                </button>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-grow p-4 md:p-10 overflow-y-auto custom-scrollbar">

                {activeTab === 'profile' && (
                    <div className="max-w-2xl mx-auto md:mx-0">
                        <h2 className="text-3xl font-bold mb-8 hidden md:block">Настройки профиля</h2>

                        <div className="md:hidden mb-6 space-y-2">
                            {user.isAdmin && (
                                <button onClick={onOpenAdminPanel} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200">Админ Панель</button>
                            )}
                            {user.managedShopId && (
                                <button onClick={onOpenMerchantDashboard} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold shadow-lg shadow-gray-300">Бизнес Кабинет</button>
                            )}
                            <button onClick={onOpenPartnerModal} className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20">Подключить бизнес</button>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-2">Аватар</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Avatar" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{user.name?.charAt(0) || user.email.charAt(0)}</div>}
                                    </div>
                                    <label className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-xl text-dark font-bold text-sm cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2">
                                        {isUploading ? 'Загрузка...' : 'Изменить фото'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-2">Имя</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ваше имя"
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-2">Email</label>
                                    <input type="text" value={user.email} disabled className="w-full p-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 w-full md:w-auto disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                            </button>
                        </div>

                        <div className="mt-8 pt-4 md:hidden">
                            <button
                                onClick={() => { onLogout(); onBack(); }}
                                className="w-full bg-red-50 text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Выйти из аккаунта
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'favorites' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8 hidden md:block">Избранное</h2>
                        {favoriteAds.length === 0 ? (
                            <div className="text-center py-20 text-secondary">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                <p className="text-lg">У вас пока нет избранных объявлений</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favoriteAds.map(ad => (
                                    <div key={ad.id} className="relative">
                                        <AdCard
                                            ad={ad}
                                            onShow={() => { onShowAd(ad); onBack(); }}
                                            variant="standard"
                                            isFavorite={true}
                                            onToggleFavorite={() => onToggleFavorite(ad.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'my_ads' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8 hidden md:block">Мои объявления</h2>
                        {myAds.length === 0 ? (
                            <div className="text-center py-20 text-secondary bg-white rounded-3xl border border-gray-100">
                                <p className="text-lg">Вы еще не разместили ни одного объявления</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-3xl">
                                {myAds.map(ad => (
                                    <div key={ad.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-transform hover:scale-[1.01]">
                                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                            <img src={ad.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-dark text-lg line-clamp-1">{ad.title}</h4>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${ad.status === 'approved' ? 'bg-green-100 text-green-700' : ad.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {ad.status === 'approved' ? 'Активно' : ad.status === 'rejected' ? 'Отклонено' : 'На проверке'}
                                                </span>
                                            </div>
                                            <p className="text-primary font-bold text-lg mt-1">{ad.price} ₽</p>
                                            <div className="mt-3 text-sm text-gray-400 flex flex-wrap gap-4 items-center">
                                                <button onClick={() => { onShowAd(ad); onBack(); }} className="text-primary hover:underline font-medium">Открыть</button>
                                                {onEditAd && (
                                                    <button
                                                        onClick={() => { onEditAd(ad); onBack(); }}
                                                        className="bg-gray-100 text-dark px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                                    >
                                                        Редактировать
                                                    </button>
                                                )}
                                                {onDeleteAd && (
                                                    <button
                                                        onClick={() => handleDelete(ad.id)}
                                                        className="text-red-500 hover:text-red-700 font-bold"
                                                    >
                                                        Удалить
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8 hidden md:block">История заказов</h2>
                        <div className="space-y-4 max-w-3xl">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:scale-[1.01]">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-dark text-lg">{order.shopName}</span>
                                            <span className="text-xs text-secondary bg-gray-100 px-2 py-1 rounded-md font-medium">{order.date}</span>
                                        </div>
                                        <p className="text-secondary">{order.itemsString}</p>
                                        <p className="text-lg font-bold mt-2 text-primary">{order.total} ₽</p>
                                    </div>
                                    <div>
                                        {order.status === 'completed' ? (
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">Выполнен</span>
                                        ) : order.status === 'processing' ? (
                                            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">В работе</span>
                                        ) : (
                                            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">Отменен</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

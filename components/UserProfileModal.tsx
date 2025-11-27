
import React, { useState, useEffect } from 'react';
import { User, Ad, Order } from '../types';
import { AdCard } from './AdCard';
import { getLevelInfo } from '../utils';
import { api } from '../services/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  favorites: string[];
  allAds: Ad[];
  onToggleFavorite: (id: string) => void;
  onShowAd: (ad: Ad) => void;
  onEditAd?: (ad: Ad) => void;
  onUpdateUser: (user: User) => void;
  onOpenAdminPanel: () => void;
  onOpenMerchantDashboard: () => void;
  onOpenPartnerModal?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, onClose, user, onLogout, favorites, allAds, onToggleFavorite, onShowAd, onEditAd, onUpdateUser, onOpenAdminPanel, onOpenMerchantDashboard, onOpenPartnerModal
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'orders' | 'my_ads'>('profile');
  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isUploading, setIsUploading] = useState(false);

  const levelInfo = getLevelInfo(user.xp || 0);

  useEffect(() => {
      setName(user.name || '');
      setAvatar(user.avatar || '');
  }, [user]);

  if (!isOpen) return null;

  // Filter ads
  const favoriteAds = allAds.filter(ad => favorites.includes(ad.id));
  const myAds = allAds.filter(ad => ad.userId === user.id);

  // Mock Orders if none exist
  const orders: Order[] = user.orders || [
     { id: '1023', date: '12 окт', shopName: 'Суши Хаус', total: 1200, status: 'completed', itemsString: 'Сет Филадельфия' },
     { id: '1024', date: '14 окт', shopName: 'Олива', total: 650, status: 'processing', itemsString: 'Пицца Пепперони' }
  ];

  const handleSave = () => {
      const isNewProfile = !user.name;
      onUpdateUser({ ...user, name, avatar });
      if (isNewProfile) {
          alert('Профиль заполнен! +30 XP');
      }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsUploading(true);
        try {
            const publicUrl = await api.uploadFile(file);
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
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-background w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        
        {/* --- MOBILE LAYOUT HEADER (Visible only on mobile) --- */}
        <div className="md:hidden bg-white p-4 flex flex-col border-b border-gray-100 shrink-0 gap-4 relative">
             {/* Close Button (Absolute Top Right) */}
             <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-10"
             >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>

             <div className="flex items-center justify-between pr-12">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm overflow-hidden border-2 border-white shadow-sm">
                        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="User" /> : user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div className="leading-tight">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-dark text-base">{name || 'Пользователь'}</p>
                            <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${levelInfo.color}`}>Lvl {levelInfo.level}</span>
                        </div>
                        <p className="text-[10px] text-secondary font-medium">{levelInfo.title}</p>
                    </div>
                </div>
             </div>
             
             {/* Mobile XP Bar */}
             <div className="w-full">
                <div className="flex justify-between text-[10px] text-secondary mb-1">
                    <span>XP: {user.xp || 0}</span>
                    <span>До уровня {levelInfo.level + 1}: {levelInfo.nextLevelXp - (user.xp || 0)}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${levelInfo.color} transition-all duration-500`} style={{ width: `${levelInfo.progressPercent}%` }}></div>
                </div>
             </div>
        </div>

        {/* --- MOBILE TAB BAR (Visible only on mobile) --- */}
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            <button 
                onClick={() => setActiveTab('profile')} 
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'profile' ? 'bg-dark text-white' : 'bg-gray-100 text-secondary'}`}
            >
                Профиль
            </button>
            <button 
                onClick={() => setActiveTab('favorites')} 
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'favorites' ? 'bg-dark text-white' : 'bg-gray-100 text-secondary'}`}
            >
                Избранное ({favorites.length})
            </button>
             <button 
                onClick={() => setActiveTab('my_ads')} 
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'my_ads' ? 'bg-dark text-white' : 'bg-gray-100 text-secondary'}`}
            >
                Мои объявления
            </button>
            <button 
                onClick={() => setActiveTab('orders')} 
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-dark text-white' : 'bg-gray-100 text-secondary'}`}
            >
                Заказы
            </button>
        </div>

        {/* --- DESKTOP SIDEBAR (Hidden on mobile) --- */}
        <div className="hidden md:flex w-72 bg-white border-r border-gray-200 p-6 flex-col shrink-0">
           <div className="flex flex-col items-center mb-6">
              <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg overflow-hidden border-4 border-white">
                    {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="User" /> : user.name?.charAt(0) || user.email.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white px-3 py-0.5 rounded-full ${levelInfo.color} border-2 border-white shadow-sm whitespace-nowrap`}>
                      Lvl {levelInfo.level} {levelInfo.title}
                  </div>
              </div>

              <h2 className="text-xl font-bold text-dark text-center mt-2">{name || `Пользователь`}</h2>
              <p className="text-sm text-secondary">{user.email}</p>

              {/* Desktop XP Bar */}
              <div className="w-full mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between text-[10px] font-bold text-secondary mb-1">
                      <span>{user.xp || 0} XP</span>
                      <span>{levelInfo.nextLevelXp} XP</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${levelInfo.color} transition-all duration-500`} style={{ width: `${levelInfo.progressPercent}%` }}></div>
                  </div>
                  <p className="text-[10px] text-center text-gray-400 mt-1">До след. уровня: {levelInfo.nextLevelXp - (user.xp || 0)} XP</p>
              </div>
              
              {user.isAdmin && <span className="mt-2 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">Администратор</span>}
              {user.managedShopId && <span className="mt-2 bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{user.managedShopId.startsWith('cinema') ? 'Кинотеатр' : 'Владелец бизнеса'}</span>}
           </div>

           <nav className="space-y-2 flex-grow overflow-y-auto custom-scrollbar">
              {/* Access Panels */}
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

              <div className="h-px bg-gray-100 my-2"></div>

              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-gray-100 text-dark' : 'text-secondary hover:bg-gray-50'}`}>
                 Профиль
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

           <button onClick={() => { onLogout(); onClose(); }} className="mt-4 flex items-center gap-2 text-red-500 hover:text-red-600 font-medium text-sm px-4 py-2">
              Выйти
           </button>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-grow p-4 md:p-8 overflow-y-auto bg-gray-50 custom-scrollbar relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-500 hover:text-dark shadow-sm z-10 hidden md:block">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {activeTab === 'profile' && (
               <div className="max-w-md mx-auto md:mx-0">
                  <h2 className="text-2xl font-bold mb-6 hidden md:block">Настройки профиля</h2>
                  
                  {/* Mobile-only access buttons */}
                  <div className="md:hidden mb-6 space-y-2">
                      {user.isAdmin && (
                          <button onClick={onOpenAdminPanel} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold">Админ Панель</button>
                      )}
                      {user.managedShopId && (
                           <button onClick={onOpenMerchantDashboard} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold">Бизнес Кабинет</button>
                      )}
                  </div>

                  <div className="space-y-4">
                     {/* Avatar Row (Explicitly First) */}
                     <div>
                         <label className="block text-sm font-bold text-secondary mb-1">Аватар</label>
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Avatar" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{user.name?.charAt(0) || user.email.charAt(0)}</div>}
                            </div>
                            <label className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-dark font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
                                {isUploading ? 'Загрузка...' : 'Изменить фото'}
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                            </label>
                         </div>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-bold text-secondary mb-1">Имя</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ваше имя" 
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" 
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-secondary mb-1">Email</label>
                        <input type="text" value={user.email} disabled className="w-full p-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                     </div>

                     <button 
                        onClick={handleSave}
                        className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 mt-4 hover:bg-primary-dark transition-all active:scale-95 w-full md:w-auto"
                     >
                        Сохранить изменения
                     </button>
                     
                     {/* Logout Button (At bottom, under Save) */}
                     <div className="mt-8 border-t border-gray-200 pt-4 md:hidden">
                        <button 
                            onClick={() => { onLogout(); onClose(); }}
                            className="w-full bg-red-50 text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Выйти из аккаунта
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'favorites' && (
               <div>
                  <h2 className="text-2xl font-bold mb-6 hidden md:block">Избранное</h2>
                  {favoriteAds.length === 0 ? (
                      <div className="text-center py-20 text-secondary">
                          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          <p>У вас пока нет избранных объявлений</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {favoriteAds.map(ad => (
                             <div key={ad.id} className="relative">
                                <AdCard 
                                   ad={ad} 
                                   onShow={() => { onShowAd(ad); onClose(); }} 
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
                    <h2 className="text-2xl font-bold mb-6 hidden md:block">Мои объявления</h2>
                    {myAds.length === 0 ? (
                        <div className="text-center py-20 text-secondary bg-white rounded-2xl border border-gray-100">
                             <p>Вы еще не разместили ни одного объявления</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myAds.map(ad => (
                                <div key={ad.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        <img src={ad.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-dark text-sm line-clamp-1">{ad.title}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ad.status === 'approved' ? 'bg-green-100 text-green-700' : ad.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {ad.status === 'approved' ? 'Активно' : ad.status === 'rejected' ? 'Отклонено' : 'На проверке'}
                                            </span>
                                        </div>
                                        <p className="text-primary font-bold text-sm mt-1">{ad.price} ₽</p>
                                        <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-3 items-center">
                                            <button onClick={() => { onShowAd(ad); onClose(); }} className="text-primary hover:underline">Открыть</button>
                                            {onEditAd && (
                                                <button 
                                                    onClick={() => { onEditAd(ad); onClose(); }} 
                                                    className="bg-gray-100 text-dark px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                                >
                                                    Редактировать
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
                   <h2 className="text-2xl font-bold mb-6 hidden md:block">История заказов</h2>
                   <div className="space-y-4">
                      {orders.map(order => (
                         <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-dark">{order.shopName}</span>
                                  <span className="text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded-md">{order.date}</span>
                               </div>
                               <p className="text-sm text-secondary">{order.itemsString}</p>
                               <p className="text-sm font-bold mt-1 text-primary">{order.total} ₽</p>
                            </div>
                            <div>
                                {order.status === 'completed' ? (
                                   <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">Выполнен</span>
                                ) : order.status === 'processing' ? (
                                   <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">В работе</span>
                                ) : (
                                   <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">Отменен</span>
                                )}
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

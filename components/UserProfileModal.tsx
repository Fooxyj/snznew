
import React, { useState, useEffect } from 'react';
import { User, Ad, Order } from '../types';
import { AdCard } from './AdCard';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  favorites: string[];
  allAds: Ad[];
  onToggleFavorite: (id: string) => void;
  onShowAd: (ad: Ad) => void;
  onUpdateUser: (user: User) => void;
  onOpenAdminPanel: () => void;
  onOpenMerchantDashboard: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, onClose, user, onLogout, favorites, allAds, onToggleFavorite, onShowAd, onUpdateUser, onOpenAdminPanel, onOpenMerchantDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'orders'>('profile');
  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || '');

  useEffect(() => {
      setName(user.name || '');
      setAvatar(user.avatar || '');
  }, [user]);

  if (!isOpen) return null;

  // Filter ads for favorites
  const favoriteAds = allAds.filter(ad => favorites.includes(ad.id));

  // Mock Orders if none exist
  const orders: Order[] = user.orders || [
     { id: '1023', date: '12 окт', shopName: 'Суши Хаус', total: 1200, status: 'completed', itemsString: 'Сет Филадельфия' },
     { id: '1024', date: '14 окт', shopName: 'Олива', total: 650, status: 'processing', itemsString: 'Пицца Пепперони' }
  ];

  const handleSave = () => {
      onUpdateUser({ ...user, name, avatar });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setAvatar(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-background w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-white border-r border-gray-200 p-6 flex flex-col shrink-0">
           <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg overflow-hidden">
                 {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="User" /> : user.name?.charAt(0) || user.email.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-dark text-center">{name || `Пользователь`}</h2>
              <p className="text-sm text-secondary">{user.email}</p>
              
              {user.isAdmin && <span className="mt-2 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">Администратор</span>}
              {user.managedShopId && <span className="mt-2 bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{user.managedShopId.startsWith('cinema') ? 'Кинотеатр' : 'Владелец бизнеса'}</span>}
           </div>

           <nav className="space-y-2 flex-grow overflow-y-auto">
              
              {/* Access Panels - Prominently Displayed at top of nav */}
              {user.isAdmin && (
                  <button 
                    onClick={onOpenAdminPanel}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md hover:scale-[1.02] transition-transform mb-2 group"
                  >
                     <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     </div>
                     Админ Панель
                  </button>
              )}
              {user.managedShopId && (
                  <button 
                    onClick={onOpenMerchantDashboard}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md hover:scale-[1.02] transition-transform mb-2 group"
                  >
                     <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                     </div>
                     {user.managedShopId.startsWith('cinema') ? 'Кабинет Кино' : 'Мой Бизнес'}
                  </button>
              )}

              <div className="h-px bg-gray-100 my-2"></div>

              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors
                   ${activeTab === 'profile' ? 'bg-gray-100 text-dark' : 'text-secondary hover:bg-gray-50'}`}
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                 Профиль
              </button>
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors
                   ${activeTab === 'favorites' ? 'bg-gray-100 text-dark' : 'text-secondary hover:bg-gray-50'}`}
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                 Избранное
                 <span className="ml-auto bg-gray-200 text-xs px-2 py-0.5 rounded-full">{favorites.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors
                   ${activeTab === 'orders' ? 'bg-gray-100 text-dark' : 'text-secondary hover:bg-gray-50'}`}
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                 Мои заказы
              </button>
           </nav>

           <button 
             onClick={() => { onLogout(); onClose(); }}
             className="mt-4 flex items-center gap-2 text-red-500 hover:text-red-600 font-medium text-sm px-4 py-2"
           >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Выйти
           </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto bg-gray-50 custom-scrollbar relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-500 hover:text-dark shadow-sm z-10">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {activeTab === 'profile' && (
               <div className="max-w-md">
                  <h2 className="text-2xl font-bold mb-6">Настройки профиля</h2>
                  <div className="space-y-4">
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
                     <div>
                         <label className="block text-sm font-bold text-secondary mb-1">Аватар</label>
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Avatar" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{user.name?.charAt(0) || user.email.charAt(0)}</div>}
                            </div>
                            <label className="text-primary font-bold text-sm cursor-pointer hover:underline">
                                Загрузить фото
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </label>
                         </div>
                     </div>
                     <button 
                        onClick={handleSave}
                        className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 mt-4 hover:bg-primary-dark transition-all active:scale-95"
                     >
                        Сохранить
                     </button>
                  </div>
               </div>
            )}

            {activeTab === 'favorites' && (
               <div>
                  <h2 className="text-2xl font-bold mb-6">Избранное</h2>
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

            {activeTab === 'orders' && (
                <div>
                   <h2 className="text-2xl font-bold mb-6">История заказов</h2>
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

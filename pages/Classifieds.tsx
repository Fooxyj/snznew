
import React, { useState, useEffect } from 'react';
import { Badge, Button, LocationBadge } from '../components/ui/Common';
import { Filter, Search, Grid, List, Heart, MessageCircle, Loader2, Sparkles, CreditCard, ShoppingBag, Crown, Star, User as UserIcon } from 'lucide-react';
import { Ad, UserRole } from '../types';
import { api } from '../services/api';
import { CreateAdModal } from '../components/CreateAdModal';
import { useNavigate } from 'react-router-dom';

// New Payment Modal with Selection
const PromoteModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (level: 'vip' | 'premium') => void }> = ({ isOpen, onClose, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<'vip' | 'premium'>('premium');

    if (!isOpen) return null;

    const handlePay = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onConfirm(selectedLevel);
            onClose();
            alert(selectedLevel === 'vip' ? "Оплата успешна! VIP активирован." : "Оплата успешна! Premium активирован.");
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in duration-200">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold dark:text-white">Ускорить продажу</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Выберите способ продвижения</p>
                </div>

                <div className="space-y-4 mb-6">
                    {/* VIP Option */}
                    <div 
                        onClick={() => setSelectedLevel('vip')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedLevel === 'vip' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${selectedLevel === 'vip' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Crown className="w-6 h-6 fill-current" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900 dark:text-white">VIP Статус</span>
                                <span className="font-bold text-orange-600 dark:text-orange-400">99 ₽</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Закрепление вверху, золотая рамка, значок короны.</p>
                        </div>
                    </div>

                    {/* Premium Option */}
                    <div 
                        onClick={() => setSelectedLevel('premium')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedLevel === 'premium' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${selectedLevel === 'premium' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Sparkles className="w-6 h-6 fill-current" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900 dark:text-white">Premium</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">49 ₽</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Синяя рамка, выделение в ленте, значок.</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-gray-300" onClick={onClose} disabled={loading}>Отмена</Button>
                    <Button className="flex-[2] bg-gray-900 dark:bg-white dark:text-black text-white hover:bg-gray-800" onClick={handlePay} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Оплатить картой'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const Classifieds: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [userFavs, setUserFavs] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [promoteId, setPromoteId] = useState<string | null>(null);

  const navigate = useNavigate();

  const categories = ['Все', 'Транспорт', 'Недвижимость', 'Работа', 'Услуги', 'Личные вещи', 'Хобби'];

  const fetchAds = async () => {
      setIsLoading(true);
      try {
        const [adsData, user] = await Promise.all([
             api.getAds(),
             api.getCurrentUser()
        ]);
        setAds(adsData);
        if (user) {
            setUserFavs(user.favorites);
            setCurrentUserId(user.id);
            setCurrentUserRole(user.role);
        }
      } catch (error) {
        console.error("Failed to load ads", error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleAdCreated = (newAd: Ad) => {
    setAds(prev => [newAd, ...prev]);
  };

  const toggleFav = async (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const isNowFav = await api.toggleFavorite(id, 'ad');
        if (isNowFav) {
            setUserFavs([...userFavs, id]);
        } else {
            setUserFavs(userFavs.filter(fid => fid !== id));
        }
      } catch (err: any) {
        alert(err.message || "Ошибка");
      }
  };

  const handleWrite = async (ad: Ad, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!currentUserId) return navigate('/auth');
      try {
          const payload = JSON.stringify({
                type: 'ad_inquiry',
                adId: ad.id,
                title: ad.title,
                price: `${ad.price.toLocaleString()} ${ad.currency}`,
                image: ad.image,
                text: "Здравствуйте! Меня интересует это объявление."
          });
          const chatId = await api.startChat(ad.authorId, payload);
          navigate(`/chat?id=${chatId}`);
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handlePromoteConfirm = async (level: 'vip' | 'premium') => {
      if (promoteId) {
          try {
            await api.promoteAd(promoteId, level);
            setPromoteId(null);
            fetchAds(); 
          } catch (e: any) {
            alert(e.message || "Ошибка оплаты");
          }
      }
  };

  const handleAdminToggleVip = async (ad: Ad) => {
      if (!confirm(`Админ: ${ad.isVip ? 'Снять' : 'Назначить'} VIP статус для "${ad.title}"?`)) return;
      try {
          await api.adminToggleVip(ad.id, !!ad.isVip);
          fetchAds();
      } catch (e: any) {
          alert(e.message);
      }
  };

  const filteredAds = ads.filter(ad => 
    (selectedCategory === 'Все' || ad.category === selectedCategory) &&
    ad.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = currentUserRole === UserRole.ADMIN;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <PromoteModal 
         isOpen={!!promoteId} 
         onClose={() => setPromoteId(null)} 
         onConfirm={handlePromoteConfirm} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-7 h-7 text-blue-600" /> Доска объявлений
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
             {isLoading ? 'Загрузка...' : `Найдено ${filteredAds.length} объявлений`}
          </p>
        </div>
        <Button size="md" variant="secondary" onClick={() => setIsCreateModalOpen(true)}>
          Подать объявление
        </Button>
      </div>

      <CreateAdModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAdCreated}
      />

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Поиск по объявлениям..." 
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredAds.length > 0 ? (
                filteredAds.map(ad => (
                <AdCard 
                    key={ad.id} 
                    ad={ad} 
                    mode={viewMode} 
                    isFav={userFavs.includes(ad.id)} 
                    isMine={currentUserId === ad.authorId}
                    isAdmin={isAdmin}
                    onToggleFav={(e) => toggleFav(ad.id, e)}
                    onPromote={() => setPromoteId(ad.id)}
                    onAdminToggleVip={() => handleAdminToggleVip(ad)}
                    onClick={() => navigate(`/ad/${ad.id}`)}
                    onWrite={(e) => handleWrite(ad, e)}
                />
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                    По вашему запросу ничего не найдено.
                </div>
            )}
        </div>
      )}
    </div>
  );
};

interface AdCardProps { 
    ad: Ad; 
    mode: 'grid' | 'list'; 
    isFav: boolean; 
    isMine: boolean;
    isAdmin: boolean;
    onToggleFav: (e: any) => void; 
    onPromote: () => void;
    onAdminToggleVip: () => void;
    onClick: () => void;
    onWrite: (e: any) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, mode, isFav, isMine, isAdmin, onToggleFav, onPromote, onAdminToggleVip, onClick, onWrite }) => {
  // 3-Tier Visual Logic
  let containerClass = "bg-white dark:bg-gray-800 border dark:border-gray-700";
  let badge = null;

  if (ad.isVip) {
      containerClass = "bg-orange-50/30 dark:bg-orange-900/10 border-2 border-orange-400 dark:border-orange-500 shadow-md ring-2 ring-orange-100 dark:ring-orange-900/20";
      badge = (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm z-10 flex items-center gap-1">
            <Crown className="w-3 h-3 fill-current" /> VIP
        </div>
      );
  } else if (ad.isPremium) {
      containerClass = "bg-blue-50/30 dark:bg-blue-900/10 border-2 border-blue-400 dark:border-blue-500 shadow-sm";
      badge = (
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm z-10 flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-current" /> PREMIUM
        </div>
      );
  }

  // LIST VIEW
  if (mode === 'list') {
    return (
      <div 
        onClick={onClick}
        className={`p-4 rounded-xl shadow-sm flex gap-4 hover:shadow-md transition-all group cursor-pointer ${containerClass}`}
      >
        <div className="w-48 h-32 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 relative">
          <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          {badge}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button 
                onClick={onToggleFav}
                className={`p-1.5 rounded-full hover:bg-white shadow-sm transition-all ${isFav ? 'bg-white text-red-500' : 'bg-white/80 text-gray-500 hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
            {isAdmin && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onAdminToggleVip(); }}
                    className="p-1.5 rounded-full hover:bg-white shadow-sm transition-all bg-white/80 text-gray-500 hover:text-orange-500"
                    title="Админ: Toggle VIP"
                >
                    <Crown className="w-4 h-4" />
                </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className={`text-lg font-bold truncate pr-4 ${ad.isVip ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-white'}`}>{ad.title}</h3>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{ad.price.toLocaleString()} {ad.currency}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ad.description}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4">
              <Badge color={ad.isVip ? "orange" : ad.isPremium ? "blue" : "gray"}>{ad.category}</Badge>
              <LocationBadge location={ad.location} />
              <div className="flex items-center text-xs text-gray-400 gap-1">
                  {ad.authorAvatar ? (
                      <img src={ad.authorAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                      <UserIcon className="w-3 h-3" />
                  )}
                  {ad.authorName}
              </div>
            </div>
            <div className="flex gap-2">
                {!isMine && (
                    <Button 
                        size="sm" 
                        className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 text-white" 
                        onClick={onWrite}
                    >
                        <MessageCircle className="w-3 h-3 mr-1" /> Написать
                    </Button>
                )}
                {isMine && !ad.isVip && (
                    <Button 
                        size="sm" 
                        className="bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600 h-8 text-xs px-3 dark:bg-gray-700 dark:text-gray-300" 
                        onClick={(e) => { e.stopPropagation(); onPromote(); }}
                    >
                        <Sparkles className="w-3 h-3 mr-1" /> Продвинуть
                    </Button>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div 
        onClick={onClick}
        className={`rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group flex flex-col cursor-pointer relative ${containerClass}`}
    >
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {badge}
        
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            <button 
                onClick={onToggleFav}
                className={`p-1.5 rounded-full shadow-sm transition-all ${isFav ? 'bg-white text-red-500' : 'bg-white/80 text-gray-500 hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
            {isAdmin && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onAdminToggleVip(); }}
                    className="p-1.5 rounded-full shadow-sm transition-all bg-white/80 text-gray-500 hover:text-orange-500"
                    title="Админ: Toggle VIP"
                >
                    <Crown className="w-4 h-4" />
                </button>
            )}
        </div>
        <div className="absolute bottom-2 left-2">
           <Badge color={ad.isVip ? "orange" : ad.isPremium ? "blue" : "gray"}>{ad.category}</Badge>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className={`font-bold line-clamp-1 mb-1 text-sm ${ad.isVip ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-white'}`}>{ad.title}</h3>
          <p className="text-base font-bold text-blue-600 dark:text-blue-400 mb-1">{ad.price.toLocaleString()} {ad.currency}</p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
             <span className="truncate">{ad.location}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
             {ad.authorAvatar && <img src={ad.authorAvatar} className="w-4 h-4 rounded-full" />}
             <span className="truncate max-w-[60px]">{ad.authorName}</span>
          </div>
          
          {isMine && !ad.isVip && (
               <Button 
                size="sm" 
                className="bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700 h-6 text-[10px] px-2 dark:bg-gray-700 dark:text-gray-300" 
                onClick={(e) => { e.stopPropagation(); onPromote(); }}
               >
                   <Sparkles className="w-3 h-3 mr-1" /> Продвинуть
               </Button>
          )}
        </div>
      </div>
    </div>
  );
};

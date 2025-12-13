
import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, LocationBadge } from '../components/ui/Common';
import { Filter, Search, Grid, List, Heart, MessageCircle, Loader2, Sparkles, CreditCard, ShoppingBag, Crown, Star, User as UserIcon } from 'lucide-react';
import { Ad, UserRole } from '../types';
import { api } from '../services/api';
import { CreateAdModal } from '../components/CreateAdModal';
import { useNavigate } from 'react-router-dom';
import { AdGridSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { AD_CATEGORIES } from '../constants';

// New Payment Modal with Selection
const PromoteModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (level: 'vip' | 'premium') => void }> = ({ isOpen, onClose, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<'vip' | 'premium'>('premium');
    
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    if (!isOpen) return null;

    const price = selectedLevel === 'vip' ? 100 : 50;
    const canAfford = (user?.balance || 0) >= price;

    const handlePay = () => {
        if (!canAfford) {
            alert("Недостаточно средств на кошельке. Пополните баланс в профиле.");
            return;
        }
        setLoading(true);
        // Simulate slight delay for UX
        setTimeout(() => {
            setLoading(false);
            onConfirm(selectedLevel);
            onClose();
        }, 1000);
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
                                <span className="font-bold text-orange-600 dark:text-orange-400">100 ₽</span>
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
                                <span className="font-bold text-blue-600 dark:text-blue-400">50 ₽</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Синяя рамка, выделение в ленте, значок.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-4 text-sm">
                    <span className="text-gray-500">Ваш баланс: </span>
                    <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                        {user?.balance || 0} ₽
                    </span>
                    {!canAfford && <div className="text-xs text-red-500 mt-1">Недостаточно средств</div>}
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-gray-300" onClick={onClose} disabled={loading}>Отмена</Button>
                    <Button 
                        className={`flex-[2] ${canAfford ? 'bg-gray-900 dark:bg-white dark:text-black text-white hover:bg-gray-800' : 'bg-gray-300 cursor-not-allowed text-gray-500'}`} 
                        onClick={handlePay} 
                        disabled={loading || !canAfford}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Оплатить ${price} ₽`}
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
  const [promoteId, setPromoteId] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading } = useQuery({
      queryKey: ['ads'],
      queryFn: api.getAds
  });

  const { data: user } = useQuery({
      queryKey: ['user'],
      queryFn: api.getCurrentUser
  });

  const categories = ['Все', ...AD_CATEGORIES];

  const userFavs = user?.favorites || [];
  const currentUserId = user?.id || null;
  const currentUserRole = user?.role || null;

  const handleCreateClick = () => {
      if (!user) {
          if (confirm("Необходимо войти в систему, чтобы подать объявление. Перейти на страницу входа?")) {
              navigate('/auth');
          }
          return;
      }
      setIsCreateModalOpen(true);
  };

  const handleAdCreated = (newAd: Ad) => {
    // Invalidate ads to refetch
    queryClient.invalidateQueries({ queryKey: ['ads'] });
  };

  const toggleFav = async (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await api.toggleFavorite(id, 'ad');
        queryClient.invalidateQueries({ queryKey: ['user'] });
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
                description: ad.description,
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
            queryClient.invalidateQueries({ queryKey: ['ads'] });
            queryClient.invalidateQueries({ queryKey: ['user'] }); // update balance
            alert("Услуга успешно активирована!");
          } catch (e: any) {
            alert(e.message || "Ошибка оплаты");
          }
      }
  };

  const handleAdminToggleVip = async (ad: Ad) => {
      if (!confirm(`Админ: ${ad.isVip ? 'Снять' : 'Назначить'} VIP статус для "${ad.title}"?`)) return;
      try {
          await api.adminToggleVip(ad.id, !!ad.isVip);
          queryClient.invalidateQueries({ queryKey: ['ads'] });
      } catch (e: any) {
          alert(e.message);
      }
  };

  // Performance Optimization: Memoize filtered results to prevent recalculation on every render
  const filteredAds = useMemo(() => {
      return ads.filter(ad => 
        (selectedCategory === 'Все' || ad.category === selectedCategory) &&
        ad.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [ads, selectedCategory, searchTerm]);

  // Performance Optimization: Memoize grouped ads
  const { vipAds, premiumAds, regularAds } = useMemo(() => {
      return {
          vipAds: filteredAds.filter(ad => ad.isVip),
          premiumAds: filteredAds.filter(ad => !ad.isVip && ad.isPremium),
          regularAds: filteredAds.filter(ad => !ad.isVip && !ad.isPremium)
      };
  }, [filteredAds]);

  const isAdmin = currentUserRole === UserRole.ADMIN;

  const renderAdList = (adList: Ad[]) => (
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {adList.map(ad => (
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
                  onAuthorClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${ad.authorId}`);
                  }}
              />
          ))}
      </div>
  );

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
        <Button size="md" variant="secondary" onClick={handleCreateClick}>
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

      {/* Content */}
      {isLoading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                viewMode === 'grid' ? <AdGridSkeleton key={i} /> : <CardSkeleton key={i} />
            ))}
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-500">
            По вашему запросу ничего не найдено.
        </div>
      ) : (
        <div className="space-y-10">
            {/* VIP Section */}
            {vipAds.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                            <Crown className="w-5 h-5 fill-current" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">VIP Объявления</h2>
                    </div>
                    {renderAdList(vipAds)}
                </div>
            )}

            {/* PRO Section */}
            {premiumAds.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Sparkles className="w-5 h-5 fill-current" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">PRO Объявления</h2>
                    </div>
                    {renderAdList(premiumAds)}
                </div>
            )}

            {/* Fresh/Regular Section */}
            {regularAds.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Свежие объявления</h2>
                    </div>
                    {renderAdList(regularAds)}
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
    onAuthorClick?: (e: any) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, mode, isFav, isMine, isAdmin, onToggleFav, onPromote, onAdminToggleVip, onClick, onWrite, onAuthorClick }) => {
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
              <div 
                className="flex items-center text-xs text-gray-400 gap-1 hover:text-blue-500 cursor-pointer"
                onClick={onAuthorClick}
              >
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
                        variant="ghost"
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
          <div 
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-500 cursor-pointer"
            onClick={onAuthorClick}
          >
             {ad.authorAvatar && <img src={ad.authorAvatar} className="w-4 h-4 rounded-full" />}
             <span className="truncate max-w-[60px]">{ad.authorName}</span>
          </div>
          
          {isMine && !ad.isVip && (
               <Button 
                size="sm" 
                variant="ghost"
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

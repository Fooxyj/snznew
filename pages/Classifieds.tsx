import React, { useState, useEffect } from 'react';
import { Badge, Button, LocationBadge } from '../components/ui/Common';
import { Filter, Search, Grid, List, Heart, MessageCircle, Loader2, Sparkles, CreditCard, ShoppingBag, Crown } from 'lucide-react';
import { Ad, UserRole } from '../types';
import { api } from '../services/api';
import { CreateAdModal } from '../components/CreateAdModal';
import { useNavigate } from 'react-router-dom';

// Fake Payment Modal
const PromoteModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handlePay = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onConfirm();
            onClose();
            alert("Оплата прошла успешно! Объявление теперь VIP.");
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in duration-200">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Продвижение в VIP</h3>
                <p className="text-gray-500 mb-6 text-sm">
                    Ваше объявление будет закреплено вверху списка и выделено золотой рамкой.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Стоимость:</span>
                        <span className="font-bold text-lg">99 ₽</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CreditCard className="w-3 h-3" /> Оплата картой (тест)
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Отмена</Button>
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={handlePay} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Оплатить'}
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
  
  // Promotion State
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

  const handlePromoteConfirm = async () => {
      if (promoteId) {
          try {
            await api.promoteAd(promoteId);
            setPromoteId(null);
            fetchAds(); // Reload to see VIP status
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
}

const AdCard: React.FC<AdCardProps> = ({ ad, mode, isFav, isMine, isAdmin, onToggleFav, onPromote, onAdminToggleVip, onClick }) => {
  const vipClass = ad.isVip ? "border-2 border-orange-300 ring-2 ring-orange-100 dark:ring-orange-900" : "border dark:border-gray-700";

  if (mode === 'list') {
    return (
      <div 
        onClick={onClick}
        className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex gap-4 hover:shadow-md transition-shadow group cursor-pointer ${vipClass}`}
      >
        <div className="w-48 h-32 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 relative">
          <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          {ad.isVip && <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">VIP</div>}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">{ad.title}</h3>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{ad.price.toLocaleString()} {ad.currency}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ad.description}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4">
              <Badge color={ad.isVip ? "orange" : "gray"}>{ad.category}</Badge>
              <LocationBadge location={ad.location} />
              <span className="text-xs text-gray-400">{ad.date}</span>
            </div>
            {isMine && !ad.isVip && (
                 <Button 
                    size="sm" 
                    className="bg-orange-500 hover:bg-orange-600 text-white" 
                    onClick={(e) => { e.stopPropagation(); onPromote(); }}
                 >
                     <Sparkles className="w-3 h-3 mr-1" /> Продвинуть
                 </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
        onClick={onClick}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col cursor-pointer ${vipClass}`}
    >
      {/* Square Aspect Ratio */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {ad.isVip && <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">VIP</div>}
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
           <Badge color={ad.isVip ? "orange" : "gray"}>{ad.category}</Badge>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 mb-1 text-sm">{ad.title}</h3>
          <p className="text-base font-bold text-blue-600 dark:text-blue-400 mb-1">{ad.price.toLocaleString()} {ad.currency}</p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
             <span className="truncate">{ad.location}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t dark:border-gray-700 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{ad.date}</span>
          
          {isMine && !ad.isVip && (
               <Button 
                size="sm" 
                className="bg-orange-100 text-orange-700 hover:bg-orange-200 h-6 text-[10px] px-2" 
                onClick={(e) => { e.stopPropagation(); onPromote(); }}
               >
                   VIP
               </Button>
          )}
        </div>
      </div>
    </div>
  );
};
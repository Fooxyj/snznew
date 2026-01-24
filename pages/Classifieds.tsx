import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button } from '../components/ui/Common';
import { Search, Grid, List, ShoppingBag, Crown, Megaphone, Users, ArrowRight, MapPin, Wand2, Heart } from 'lucide-react';
import { Ad, PromoAd } from '../types';
import { api } from '../services/api';
import { CreateAdModal } from '../components/CreateAdModal';
import { useNavigate } from 'react-router-dom';
import { CardSkeleton } from '../components/ui/Skeleton';
import { AD_CATEGORIES } from '../constants';
import { BannerSlot } from '../components/BannerSlot';

export const Classifieds: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'partners' | 'residents'>('residents');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading: adsLoading } = useQuery({ queryKey: ['ads'], queryFn: () => api.getAds() });
  const { data: promoAds = [], isLoading: promoLoading } = useQuery({ queryKey: ['promoAds'], queryFn: () => api.getPromoAds() });
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });

  const handleCreateClick = () => { if (!user) navigate('/auth'); else setIsCreateModalOpen(true); };

  const filteredAds = useMemo(() => {
      return ads.filter(ad => (selectedCategory === 'Все' || ad.category === selectedCategory) && ad.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [ads, selectedCategory, searchTerm]);

  const { vipAds, proAds, regularAds } = useMemo(() => {
      return { 
          vipAds: filteredAds.filter(ad => ad.isVip), 
          proAds: filteredAds.filter(ad => ad.isPremium && !ad.isVip),
          regularAds: filteredAds.filter(ad => !ad.isVip && !ad.isPremium) 
      };
  }, [filteredAds]);

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        navigate('/auth');
        return;
    }
    await api.toggleFavorite(id, 'ad');
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                <ShoppingBag className="w-10 h-10 text-blue-600" /> Объявления
            </h1>
        </div>
        <Button size="md" variant="primary" onClick={handleCreateClick} className="rounded-lg px-8 uppercase font-black text-xs tracking-widest shadow-lg">Подать объявление</Button>
      </div>

      <CreateAdModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['ads'] })} />
      
      <BannerSlot position="classifieds_top" />

      <div className="flex gap-4 border-b dark:border-gray-800">
          <button 
            onClick={() => setActiveTab('residents')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'residents' ? 'text-orange-600 border-b-4 border-orange-600' : 'text-gray-400'}`}
          >
              <Users className="w-4 h-4" /> От жителей
          </button>
          <button 
            onClick={() => setActiveTab('partners')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'partners' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}
          >
              <Megaphone className="w-4 h-4" /> Партнеры
          </button>
      </div>

      {activeTab === 'partners' ? (
          <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {promoAds.map(ad => (
                      <a key={ad.id} href={ad.link_url || '#'} target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
                          <div className="relative aspect-[16/9] overflow-hidden bg-gray-50 dark:bg-gray-900">
                              <img src={ad.image_url} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" alt="" />
                              <div className="absolute top-4 left-4"><Badge color="blue" className="px-2 py-0.5 rounded font-black text-[8px] uppercase tracking-widest shadow-md">Партнер</Badge></div>
                              {ad.price && <div className="absolute bottom-4 right-4 bg-orange-600 text-white px-3 py-1 rounded font-black text-sm shadow-xl">от {ad.price.toLocaleString()} ₽</div>}
                          </div>
                          <div className="p-6">
                              <h3 className="text-xl font-black dark:text-white mb-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{ad.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{ad.description}</p>
                              <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Перейти</span>
                                  <ArrowRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                              </div>
                          </div>
                      </a>
                  ))}
              </div>
          </div>
      ) : (
          <div className="space-y-6 animate-in fade-in">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" placeholder="Поиск по объявлениям..." className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-lg outline-none dark:text-white text-sm font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {['Все', ...AD_CATEGORIES].map(cat => (
                          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>{cat}</button>
                      ))}
                  </div>
              </div>

              {adsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
                  </div>
              ) : (
                  <div className="space-y-12">
                      {/* VIP Section */}
                      {vipAds.length > 0 && (
                          <div className="space-y-4">
                              <div className="flex items-center gap-2 px-1"><Crown className="w-5 h-5 text-orange-500 fill-current" /><h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">VIP Размещение</h2></div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                                  {vipAds.map(ad => <AdCard key={ad.id} ad={ad} isFav={user?.favorites?.includes(ad.id)} onToggleFav={handleToggleFavorite} onClick={() => navigate(`/ad/${ad.id}`)} />)}
                              </div>
                          </div>
                      )}

                      {/* PRO Section */}
                      {proAds.length > 0 && (
                          <div className="space-y-4">
                              <div className="flex items-center gap-2 px-1"><Wand2 className="w-5 h-5 text-indigo-500" /><h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">PRO Предложения</h2></div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                                  {proAds.map(ad => <AdCard key={ad.id} ad={ad} isFav={user?.favorites?.includes(ad.id)} onToggleFav={handleToggleFavorite} onClick={() => navigate(`/ad/${ad.id}`)} />)}
                              </div>
                          </div>
                      )}

                      {/* Regular Section */}
                      <div className="space-y-4 px-1">
                          <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Все свежее</h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                              {regularAds.length === 0 && vipAds.length === 0 && proAds.length === 0 ? (
                                  <p className="col-span-full text-center py-10 text-gray-400 font-bold uppercase text-xs">Нет объявлений</p>
                              ) : (
                                  regularAds.map(ad => <AdCard key={ad.id} ad={ad} isFav={user?.favorites?.includes(ad.id)} onToggleFav={handleToggleFavorite} onClick={() => navigate(`/ad/${ad.id}`)} />)
                              )}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

const AdCard: React.FC<{ ad: Ad, isFav?: boolean, onToggleFav?: (e: React.MouseEvent, id: string) => void, onClick: () => void }> = ({ ad, isFav, onToggleFav, onClick }) => {
  const containerClass = ad.isVip 
    ? "border border-orange-500/30 shadow-orange-500/5 shadow-lg" 
    : ad.isPremium
        ? "border border-indigo-500/30 shadow-indigo-500/5 shadow-md"
        : "border border-gray-100 dark:border-gray-800 shadow-sm";
    
  return (
    <div onClick={onClick} className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer relative h-full ${containerClass}`}>
      <div className="aspect-[3/4] relative overflow-hidden bg-gray-50 dark:bg-gray-900 shrink-0">
        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]" />
        
        {/* Кнопка избранного в верхнем правом углу */}
        {onToggleFav && (
            <button 
                onClick={(e) => onToggleFav(e, ad.id)}
                className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md border transition-all z-20 ${isFav ? 'bg-red-500 border-red-400 text-white shadow-lg' : 'bg-black/20 border-white/10 text-white hover:bg-black/40'}`}
            >
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
            <p className={`text-base sm:text-lg font-black leading-none mb-1.5 ${ad.isVip ? 'text-orange-600' : ad.isPremium ? 'text-indigo-600' : 'text-blue-600'}`}>
                {ad.price.toLocaleString()} {ad.currency}
            </p>
            <h3 className="font-bold line-clamp-2 text-[11px] sm:text-[12px] dark:text-white leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ad.title}</h3>
        </div>
        <div className="pt-2 mt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-[8px] text-gray-400 font-black uppercase tracking-widest">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-2.5 h-2.5 shrink-0 text-gray-400" />
            <span className="truncate">{ad.location}</span>
          </div>
          <span className="shrink-0">{ad.date.split(',')[0]}</span>
        </div>
      </div>
    </div>
  );
};

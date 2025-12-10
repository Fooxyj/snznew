
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button } from '../components/ui/Common';
import { Calendar, ChevronRight, MapPin, CloudSun, Wind, Droplets, ExternalLink, Flame, Bus, Loader2, Plus, PenSquare, Sun, CloudRain, Snowflake, Cloud, PieChart, Check, Gauge, X, Crown, Heart, Sparkles } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Ad, Event, NewsItem, Poll, UserRole } from '../types';
import { api } from '../services/api';
import { CreateEventModal } from '../components/CreateEventModal';
import { CreateNewsModal } from '../components/CreateNewsModal';
import { StoriesRail } from '../components/StoriesRail';

// NEW: Events Page Component
export const EventsPage: React.FC = () => {
    const [isEventModalOpen, setEventModalOpen] = useState(false);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    
    const categoryFilter = searchParams.get('cat');

    const { data: events = [], isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: api.getEvents
    });

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

    const filteredEvents = categoryFilter 
        ? events.filter(e => e.category === categoryFilter)
        : events;

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <CreateEventModal 
                isOpen={isEventModalOpen}
                onClose={() => setEventModalOpen(false)}
                onSuccess={(evt) => {
                    queryClient.invalidateQueries({ queryKey: ['events'] });
                }}
            />

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-3 dark:text-white">
                    <Calendar className="w-8 h-8 text-blue-600" /> Афиша мероприятий
                </h1>
                {user && (
                    <Button onClick={() => setEventModalOpen(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Добавить
                    </Button>
                )}
            </div>

            {categoryFilter && (
                <div className="mb-6 flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Фильтр:</span>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                        {categoryFilter}
                        <button onClick={() => setSearchParams({})} className="hover:text-blue-600 dark:hover:text-blue-200"><X className="w-3 h-3" /></button>
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.length > 0 ? filteredEvents.map(event => (
                    <div 
                        key={event.id} 
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col h-full group"
                    >
                        <div className="h-48 relative overflow-hidden">
                            <img 
                                src={event.image} 
                                alt={event.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider dark:text-white">
                                {event.category}
                            </div>
                            {event.price && (
                                <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                                    {event.price} ₽
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {event.title}
                            </h3>
                            <div className="mt-auto space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-blue-500" /> {event.date}
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-blue-500" /> {event.location}
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-20 text-gray-400">
                        {categoryFilter ? 'В этой категории событий пока нет' : 'Событий пока нет'}
                    </div>
                )}
            </div>
        </div>
    );
};

// Modified Home Component
export const Home: React.FC = () => {
  const [isNewsModalOpen, setNewsModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Queries
  const { data: news = [] } = useQuery({
    queryKey: ['news'],
    queryFn: api.getNews
  });

  const { data: ads = [], isLoading: adsLoading } = useQuery({
    queryKey: ['ads'],
    queryFn: api.getAds
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: api.getCurrentUser
  });

  // Local state for optimistic updates if needed, but here we rely on React Query cache
  // For favorites, we might want local state to avoid refetching everything or use optimistic updates
  // For simplicity in this step, we'll fetch user to get latest favs
  
  const userFavs = user?.favorites || [];

  const handleAdminToggleVip = async (ad: Ad, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user || user.role !== UserRole.ADMIN) return;
      
      const action = ad.isVip ? 'Снять' : 'Назначить';
      if (!confirm(`Админ: ${action} VIP статус для "${ad.title}"?`)) return;

      try {
          await api.adminToggleVip(ad.id, !!ad.isVip);
          queryClient.invalidateQueries({ queryKey: ['ads'] });
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleToggleFav = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.toggleFavorite(id, 'ad');
            queryClient.invalidateQueries({ queryKey: ['user'] });
        } catch (err: any) {
            alert(err.message || "Ошибка");
        }
  };

  if (adsLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Загрузка портала...</p>
        </div>
      </div>
    );
  }

  // Split ads into buckets
  const vipAds = ads.filter(ad => ad.isVip).slice(0, 5);
  const premiumAds = ads.filter(ad => !ad.isVip && ad.isPremium).slice(0, 8);
  const regularAds = ads.filter(ad => !ad.isVip && !ad.isPremium);

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-6 lg:space-y-12">
      
      <CreateNewsModal 
        isOpen={isNewsModalOpen}
        onClose={() => setNewsModalOpen(false)}
        onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
        }}
      />

      {/* Stories Rail */}
      <section className="mt-2 lg:mt-0">
          <StoriesRail />
      </section>

      {/* Main Container - Full Width */}
      <div className="space-y-12">
        
        {/* VIP Section (Limit 5) */}
        {vipAds.length > 0 && (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full text-white shadow-md">
                        <Crown className="w-5 h-5 fill-current" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">VIP Объявления</h2>
                </div>
                
                {/* VIP Grid - 1 Col Mobile, 2 Col Tablet, 3 Col Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vipAds.map(ad => (
                    <VipAdCard 
                        key={ad.id} 
                        ad={ad} 
                        onClick={() => navigate(`/ad/${ad.id}`)} 
                        isAdmin={isAdmin}
                        onToggleVip={(e) => handleAdminToggleVip(ad, e)}
                        isFav={userFavs.includes(ad.id)}
                        onToggleFav={(e) => handleToggleFav(ad.id, e)}
                    />
                    ))}
                </div>
            </div>
        )}

        {/* PRO / Premium Section */}
        {premiumAds.length > 0 && (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-full text-white shadow-md">
                        <Sparkles className="w-5 h-5 fill-current" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PRO Объявления</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {premiumAds.map(ad => (
                    <GridAdCard 
                        key={ad.id} 
                        ad={ad} 
                        onClick={() => navigate(`/ad/${ad.id}`)} 
                        isAdmin={isAdmin}
                        onToggleVip={(e) => handleAdminToggleVip(ad, e)}
                        isFav={userFavs.includes(ad.id)}
                        onToggleFav={(e) => handleToggleFav(ad.id, e)}
                    />
                    ))}
                </div>
            </div>
        )}

        {/* Regular Feed Grid */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Свежие объявления</h2>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs px-2 py-1 rounded-full">{regularAds.length}</span>
                </div>
                <Link to="/classifieds" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Смотреть всё</Link>
            </div>
            
            {/* Feed Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {regularAds.length > 0 ? regularAds.slice(0, 12).map(ad => (
                <GridAdCard 
                    key={ad.id} 
                    ad={ad} 
                    onClick={() => navigate(`/ad/${ad.id}`)} 
                    isAdmin={isAdmin}
                    onToggleVip={(e) => handleAdminToggleVip(ad, e)}
                    isFav={userFavs.includes(ad.id)}
                    onToggleFav={(e) => handleToggleFav(ad.id, e)}
                />
                )) : (
                    <div className="col-span-full text-center py-10 text-gray-400">
                        Нет свежих объявлений.
                    </div>
                )}
            </div>
            <Link to="/classifieds" className="block mt-6">
                <Button variant="secondary" className="w-full py-4 text-gray-500 hover:text-blue-600 rounded-2xl shadow-sm border-transparent bg-white hover:bg-white hover:shadow-md transition-all dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white">
                    Показать еще объявления
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
};

// Redesigned VipAdCard - Large Vertical
const VipAdCard: React.FC<any> = ({ ad, onClick, isAdmin, onToggleVip, isFav, onToggleFav }) => (
    <div onClick={onClick} className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-800/80 rounded-3xl shadow-lg hover:shadow-2xl transition-all relative group cursor-pointer overflow-hidden border-2 border-orange-400 dark:border-orange-500/60 ring-4 ring-orange-100 dark:ring-orange-900/20 flex flex-col h-full">
        {/* Large Image Area - Square Aspect for massive size */}
        <div className="aspect-square relative overflow-hidden">
            <img src={ad.image} alt={ad.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
            
            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 uppercase tracking-widest flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 fill-current" /> VIP
            </div>

            {/* Hover Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                 {onToggleFav && (
                    <button
                        onClick={onToggleFav}
                        className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all ${isFav ? 'bg-white text-red-500' : 'bg-black/30 text-white hover:bg-white hover:text-red-500'}`}
                    >
                        <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                )}
                {isAdmin && onToggleVip && (
                    <button 
                        onClick={onToggleVip} 
                        className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-white hover:text-orange-500 transition-colors"
                        title="Убрать VIP статус"
                    >
                        <Crown className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="absolute bottom-4 left-4 right-4">
                 <span className="text-xs font-bold text-white/90 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg">
                    {ad.category}
                 </span>
            </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-1">
            <div className="mb-2">
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-yellow-400">
                    {ad.price.toLocaleString()} {ad.currency}
                </p>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {ad.title}
            </h3>
            
            <div className="mt-auto pt-4 border-t border-orange-100 dark:border-orange-500/20 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1 truncate max-w-[60%]">
                    <MapPin className="w-3.5 h-3.5" /> {ad.location}
                </span>
                <span>{ad.date}</span>
            </div>
        </div>
    </div>
);

// Grid Ad Card
const GridAdCard: React.FC<any> = ({ ad, onClick, isAdmin, onToggleVip, isFav, onToggleFav }) => {
    // Determine styling based on tier
    let borderClass = "border dark:border-gray-700";
    let bgClass = "bg-white dark:bg-gray-800";
    let badge = null;

    if (ad.isPremium) {
        borderClass = "border-2 border-blue-400 dark:border-blue-500 shadow-md";
        bgClass = "bg-blue-50/10 dark:bg-blue-900/10";
        badge = (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm z-10 flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" /> PRO
            </div>
        );
    } else {
        badge = (
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/50 backdrop-blur text-xs px-2 py-1 rounded-lg font-medium text-gray-700 dark:text-gray-200">
               {ad.category}
            </div>
        );
    }

    return (
        <div 
            onClick={onClick}
            className={`${bgClass} rounded-2xl shadow-sm hover:shadow-lg transition-all group flex flex-col cursor-pointer overflow-hidden relative ${borderClass}`}
        >
          {/* Image */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                <img src={ad.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {badge}
                <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
                    {onToggleFav && (
                        <button
                            onClick={onToggleFav}
                            className={`p-1.5 rounded-full backdrop-blur shadow-sm transition-all ${isFav ? 'bg-white text-red-500' : 'bg-white/70 text-gray-500 hover:text-red-500'}`}
                        >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                    )}
                    {isAdmin && onToggleVip && (
                        <button 
                            onClick={onToggleVip} 
                            className="p-1.5 rounded-full bg-white/70 backdrop-blur text-gray-500 hover:text-orange-500 dark:text-gray-300 transition-colors"
                            title="Сделать VIP"
                        >
                            <Crown className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
          {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">{ad.price.toLocaleString()} {ad.currency}</p>
                </div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300 line-clamp-2 text-sm leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ad.title}</h3>
                </div>
                <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400">
                <span className="truncate max-w-[60%]">{ad.location}</span>
                <span>{ad.date}</span>
                </div>
            </div>
        </div>
    );
};

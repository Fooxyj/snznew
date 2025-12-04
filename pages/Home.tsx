
import React, { useEffect, useState } from 'react';
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
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEventModalOpen, setEventModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const categoryFilter = searchParams.get('cat');

    useEffect(() => {
        const load = async () => {
            const [e, u] = await Promise.all([api.getEvents(), api.getCurrentUser()]);
            setEvents(e);
            setUser(u);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

    const filteredEvents = categoryFilter 
        ? events.filter(e => e.category === categoryFilter)
        : events;

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <CreateEventModal 
                isOpen={isEventModalOpen}
                onClose={() => setEventModalOpen(false)}
                onSuccess={(evt) => setEvents([evt, ...events])}
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [vipAds, setVipAds] = useState<Ad[]>([]);
  const [feedAds, setFeedAds] = useState<Ad[]>([]); // Combined Premium + Standard
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewsModalOpen, setNewsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [voting, setVoting] = useState(false);
  const [userFavs, setUserFavs] = useState<string[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [newsData, adsData, currentUser, weatherData, pollData] = await Promise.all([
          api.getNews(),
          api.getAds(), // Now returns sorted VIP -> Premium -> Standard
          api.getCurrentUser(),
          api.getWeather(),
          api.getActivePoll()
        ]);

        setNews(newsData);
        
        // Strict logic: VIP are ads with isVip=true (max 5)
        const vips = adsData.filter(ad => ad.isVip).slice(0, 5);
        // Feed ads are the rest (Premium + Standard), already sorted by API
        const others = adsData.filter(ad => !ad.isVip);
        
        setVipAds(vips);
        setFeedAds(others);

        setUser(currentUser);
        if (currentUser) {
            setUserFavs(currentUser.favorites || []);
        }
        setWeather(weatherData);
        setPoll(pollData);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleVote = async (optionId: string) => {
      if (!poll) return;
      setVoting(true);
      try {
          await api.votePoll(poll.id, optionId);
          // Refresh poll to show new results
          const updatedPoll = await api.getActivePoll();
          setPoll(updatedPoll);
      } catch (e: any) {
          alert(e.message || "Ошибка голосования");
      } finally {
          setVoting(false);
      }
  };

  const handleAdminToggleVip = async (ad: Ad, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user || user.role !== UserRole.ADMIN) return;
      
      const action = ad.isVip ? 'Снять' : 'Назначить';
      if (!confirm(`Админ: ${action} VIP статус для "${ad.title}"?`)) return;

      try {
          await api.adminToggleVip(ad.id, !!ad.isVip);
          // Reload ads locally
          const updatedAds = await api.getAds();
          setVipAds(updatedAds.filter(a => a.isVip).slice(0, 5));
          setFeedAds(updatedAds.filter(a => !a.isVip));
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleToggleFav = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const isNowFav = await api.toggleFavorite(id, 'ad');
            if (isNowFav) {
                setUserFavs(prev => [...prev, id]);
            } else {
                setUserFavs(prev => prev.filter(fid => fid !== id));
            }
        } catch (err: any) {
            alert(err.message || "Ошибка");
        }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Загрузка портала...</p>
        </div>
      </div>
    );
  }

  // Weather Icon Logic
  const getWeatherIcon = (code: number) => {
      if (code <= 1) return <Sun className="w-12 h-12 text-yellow-300 drop-shadow-lg" />;
      if (code <= 3) return <CloudSun className="w-12 h-12 text-yellow-100 drop-shadow-lg" />;
      if (code <= 67) return <CloudRain className="w-12 h-12 text-blue-200 drop-shadow-lg" />;
      if (code <= 77) return <Snowflake className="w-12 h-12 text-white drop-shadow-lg" />;
      return <Cloud className="w-12 h-12 text-gray-200 drop-shadow-lg" />;
  };

  const getWeatherDesc = (code: number) => {
      if (code <= 1) return 'Ясно';
      if (code <= 3) return 'Облачно';
      if (code <= 67) return 'Дождь';
      if (code <= 77) return 'Снег';
      return 'Пасмурно';
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-6 lg:space-y-12">
      
      <CreateNewsModal 
        isOpen={isNewsModalOpen}
        onClose={() => setNewsModalOpen(false)}
        onSuccess={(newItem) => setNews([newItem, ...news])}
      />

      {/* Stories Rail */}
      <section className="mt-2 lg:mt-0">
          <StoriesRail />
      </section>

      {/* Main Grid: Ads Left, Widgets Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Ads */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* VIP Section (Limit 5) */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full text-white shadow-md">
                    <Crown className="w-5 h-5 fill-current" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">VIP Объявления</h2>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {vipAds.length > 0 ? vipAds.map(ad => (
                  <VipAdCard 
                    key={ad.id} 
                    ad={ad} 
                    onClick={() => navigate(`/ad/${ad.id}`)} 
                    isAdmin={isAdmin}
                    onToggleVip={(e) => handleAdminToggleVip(ad, e)}
                    isFav={userFavs.includes(ad.id)}
                    onToggleFav={(e) => handleToggleFav(ad.id, e)}
                  />
                )) : (
                   <div className="col-span-2 text-center py-8 text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed dark:border-gray-700">
                       Здесь могут быть ваши VIP объявления
                   </div>
                )}
             </div>
          </div>

          {/* Regular Feed Grid (Premium + Standard) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Свежее</h2>
               </div>
               <Link to="/classifieds" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Смотреть всё</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
               {feedAds.slice(0, 9).map(ad => (
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
            <Link to="/classifieds" className="block mt-6">
               <Button variant="secondary" className="w-full py-4 text-gray-500 hover:text-blue-600 rounded-2xl shadow-sm border-transparent bg-white hover:bg-white hover:shadow-md transition-all dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white">
                   Показать еще объявления
               </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-8">
          
          {/* Weather Widget (Real) */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-950 rounded-[2rem] shadow-xl shadow-blue-500/20 p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
             <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
             <div className="relative z-10">
                {weather ? (
                    <>
                        <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium opacity-80 text-sm uppercase tracking-wider">Снежинск</p>
                            <h3 className="text-5xl font-black mt-2 tracking-tighter">{weather.temp > 0 ? '+' : ''}{weather.temp}°</h3>
                            <p className="text-lg font-medium opacity-90 mt-1">{getWeatherDesc(weather.code)}</p>
                        </div>
                        <div className="transform scale-125 origin-top-right">{getWeatherIcon(weather.code)}</div>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium opacity-90">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                <Wind className="w-4 h-4" /> {weather.wind} м/с
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                <Droplets className="w-4 h-4" /> {weather.humidity}%
                            </div>
                            {weather.pressure && (
                                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm" title="Атмосферное давление">
                                    <Gauge className="w-4 h-4" /> {weather.pressure} мм рт. ст.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="animate-spin w-8 h-8 opacity-50" />
                    </div>
                )}
             </div>
          </div>

          {/* POLL WIDGET */}
          {poll && (
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-lg shadow-gray-200/50 dark:shadow-none p-6 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                        <PieChart className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Городской опрос</h3>
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-5 leading-snug">{poll.question}</h4>
                  
                  <div className="space-y-3">
                      {poll.options.map(opt => {
                          const totalVotes = poll.options.reduce((acc, o) => acc + o.votes, 0);
                          const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                          const isVoted = poll.userVotedOptionId !== null;
                          const isSelected = poll.userVotedOptionId === opt.id;

                          return (
                              <div key={opt.id} className="relative">
                                  {isVoted ? (
                                      // Result View
                                      <div className={`relative h-12 w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden flex items-center px-4 ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''}`}>
                                          <div 
                                            className={`absolute inset-y-0 left-0 ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-200/50 dark:bg-gray-600'} transition-all duration-1000 rounded-r-xl`} 
                                            style={{width: `${percentage}%`}}
                                          ></div>
                                          <div className="relative z-10 flex justify-between w-full text-sm">
                                              <span className={`font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{opt.text}</span>
                                              <span className="text-gray-500 dark:text-gray-400 font-bold">{percentage}%</span>
                                          </div>
                                          {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute right-12 z-10" />}
                                      </div>
                                  ) : (
                                      // Voting View
                                      <button 
                                        onClick={() => handleVote(opt.id)}
                                        disabled={voting || !user}
                                        className="w-full text-left p-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-300 transition-all text-sm font-bold text-gray-600 dark:text-gray-300 group flex justify-between items-center"
                                      >
                                          {opt.text}
                                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors"></div>
                                      </button>
                                  )}
                              </div>
                          );
                      })}
                  </div>
                  {!user && !poll.userVotedOptionId && (
                      <p className="text-xs text-center text-gray-400 mt-4">Войдите, чтобы проголосовать</p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400 font-medium">
                      <span>Голосов: {poll.options.reduce((acc, o) => acc + o.votes, 0)}</span>
                      <span>Активен до завтра</span>
                  </div>
              </div>
          )}

          {/* News Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-lg shadow-gray-200/50 dark:shadow-none p-6">
            <div className="flex items-center justify-between mb-5">
               <h3 className="font-bold text-lg text-gray-900 dark:text-white">Новости</h3>
               {user && (
                <button 
                  onClick={() => setNewsModalOpen(true)}
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                >
                    + Предложить
                </button>
               )}
            </div>
            
            <div className="space-y-6">
              {news.length > 0 ? news.map(n => (
                 <Link key={n.id} to={`/news/${n.id}`} className="flex gap-4 group">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                        <img src={n.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">{n.date}</span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2">
                        {n.title}
                        </h4>
                    </div>
                 </Link>
              )) : (
                <div className="text-center text-gray-400 text-sm py-4">Новостей пока нет</div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-lg shadow-gray-200/50 dark:shadow-none p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-5">Быстрый доступ</h3>
            <ul className="space-y-2">
              <li>
                  <Link to="/category/transport" className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <Bus className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Транспорт</span>
                  </Link>
              </li>
              <li>
                  <Link to="/category/med" className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <ExternalLink className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400">Запись к врачу</span>
                  </Link>
              </li>
              <li>
                  <Link to="/category/emergency" className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <PhoneIcon />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">Экстренные службы</span>
                  </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

// ... (VipAdCard update visual)
const VipAdCard: React.FC<any> = ({ ad, onClick, isAdmin, onToggleVip, isFav, onToggleFav }) => (
    <div onClick={onClick} className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl shadow-lg hover:shadow-xl transition-all relative group cursor-pointer overflow-hidden border-2 border-orange-300 dark:border-orange-500/50">
        <div className="flex h-36">
            <div className="w-2/5 relative overflow-hidden">
                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm z-10 uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-current" /> VIP
                </div>
            </div>
            <div className="w-3/5 p-4 flex flex-col justify-between">
                <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {ad.title}
                    </h4>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">{ad.price.toLocaleString()} {ad.currency}</p>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md max-w-[100px] truncate">{ad.category}</span>
                    <div className="flex items-center gap-2">
                        {onToggleFav && (
                            <button
                                onClick={onToggleFav}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isFav ? 'bg-red-50 text-red-500' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-400'}`}
                            >
                                <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                            </button>
                        )}
                        {isAdmin && onToggleVip && (
                            <button 
                                onClick={onToggleVip} 
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors"
                                title="Убрать VIP статус"
                            >
                                <Crown className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ... (GridAdCard update visual for Premium)
const GridAdCard: React.FC<any> = ({ ad, onClick, isAdmin, onToggleVip, isFav, onToggleFav }) => {
    // Determine styling based on tier
    let borderClass = "border dark:border-gray-700";
    let bgClass = "bg-white dark:bg-gray-800";
    let badge = null;

    if (ad.isPremium) {
        borderClass = "border-2 border-blue-400 dark:border-blue-500 shadow-md";
        bgClass = "bg-blue-50/20 dark:bg-blue-900/10";
        badge = (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10 flex items-center gap-1">
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
          {/* ... (image container) */}
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
          {/* ... (content) */}
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

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

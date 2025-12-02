import React, { useEffect, useState } from 'react';
import { Badge, Button } from '../components/ui/Common';
import { Calendar, ChevronRight, MapPin, CloudSun, Wind, Droplets, ExternalLink, Flame, Bus, Loader2, Plus, PenSquare, Sun, CloudRain, Snowflake, Cloud, PieChart, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Ad, Event, NewsItem, Poll } from '../types';
import { api } from '../services/api';
import { CreateEventModal } from '../components/CreateEventModal';
import { CreateNewsModal } from '../components/CreateNewsModal';
import { StoriesRail } from '../components/StoriesRail';

export const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [vipAds, setVipAds] = useState<Ad[]>([]);
  const [regularAds, setRegularAds] = useState<Ad[]>([]);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isNewsModalOpen, setNewsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [voting, setVoting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [newsData, eventsData, adsData, currentUser, weatherData, pollData] = await Promise.all([
          api.getNews(),
          api.getEvents(),
          api.getAds(),
          api.getCurrentUser(),
          api.getWeather(),
          api.getActivePoll()
        ]);

        setNews(newsData);
        setEvents(eventsData);
        setVipAds(adsData.filter(ad => ad.isVip));
        setRegularAds(adsData.filter(ad => !ad.isVip));
        setUser(currentUser);
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
      if (code <= 1) return <Sun className="w-12 h-12 text-yellow-300" />;
      if (code <= 3) return <CloudSun className="w-12 h-12 text-yellow-100" />;
      if (code <= 67) return <CloudRain className="w-12 h-12 text-blue-200" />;
      if (code <= 77) return <Snowflake className="w-12 h-12 text-white" />;
      return <Cloud className="w-12 h-12 text-gray-200" />;
  };

  const getWeatherDesc = (code: number) => {
      if (code <= 1) return 'Ясно';
      if (code <= 3) return 'Облачно';
      if (code <= 67) return 'Дождь';
      if (code <= 77) return 'Снег';
      return 'Пасмурно';
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      <CreateEventModal 
        isOpen={isEventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSuccess={(evt) => setEvents([evt, ...events])}
      />

      <CreateNewsModal 
        isOpen={isNewsModalOpen}
        onClose={() => setNewsModalOpen(false)}
        onSuccess={(newItem) => setNews([newItem, ...news])}
      />

      {/* Stories Rail */}
      <section>
          <StoriesRail />
      </section>

      {/* Hero / Events */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Афиша Снежинска</h2>
             {user && (
                <button 
                  onClick={() => setEventModalOpen(true)}
                  className="p-1.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  title="Добавить событие"
                >
                    <Plus className="w-4 h-4" />
                </button>
             )}
          </div>
          <Link to="/category/culture" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center">
            Все мероприятия <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length > 0 ? events.map(event => (
            <div 
                key={event.id} 
                onClick={() => navigate(`/event/${event.id}`)}
                className="relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer h-60 hover:ring-4 hover:ring-blue-200 dark:hover:ring-blue-900 transition-all"
            >
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <div className="flex justify-between items-start">
                   <Badge color="orange">{event.category}</Badge>
                   {event.price && <span className="bg-white/20 backdrop-blur text-white px-2 py-1 rounded text-xs font-bold">{event.price} ₽</span>}
                </div>
                <h3 className="text-white text-xl font-bold mt-2 leading-tight group-hover:text-blue-200 transition-colors">{event.title}</h3>
                <div className="flex items-center text-gray-300 text-sm mt-2">
                  <Calendar className="w-4 h-4 mr-1.5" /> {event.date}
                  <div className="w-1 h-1 bg-gray-500 rounded-full mx-3"></div>
                  <MapPin className="w-4 h-4 mr-1.5" /> {event.location}
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 h-40 flex flex-col items-center justify-center text-gray-400">
                <Calendar className="w-8 h-8 mb-2 opacity-50" />
                <p>Событий пока нет. Добавьте первое!</p>
            </div>
          )}
        </div>
      </section>

      {/* Main Grid: Ads Left, Widgets Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Ads */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* VIP Section */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500 fill-current" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">VIP Объявления</h2>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vipAds.length > 0 ? vipAds.map(ad => (
                  <VipAdCard key={ad.id} ad={ad} onClick={() => navigate(`/ad/${ad.id}`)} />
                )) : (
                   <div className="col-span-2 text-center py-4 text-gray-400 text-sm">Нет VIP объявлений</div>
                )}
             </div>
          </div>

          {/* Regular Feed Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">Свежее</h2>
               <Link to="/classifieds" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Смотреть всё</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {regularAds.slice(0, 9).map(ad => (
                 <GridAdCard key={ad.id} ad={ad} onClick={() => navigate(`/ad/${ad.id}`)} />
               ))}
            </div>
            <Link to="/classifieds" className="block mt-4">
               <Button variant="outline" className="w-full py-3 text-gray-500 border-dashed dark:border-gray-600 dark:text-gray-400">
                   Показать еще объявления
               </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* Weather Widget (Real) */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-950 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden transition-all hover:scale-[1.02]">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
             <div className="relative z-10">
                {weather ? (
                    <>
                        <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium opacity-90">Снежинск</p>
                            <h3 className="text-4xl font-bold mt-1">{weather.temp > 0 ? '+' : ''}{weather.temp}°C</h3>
                            <p className="text-sm opacity-90 mt-1">{getWeatherDesc(weather.code)}</p>
                        </div>
                        {getWeatherIcon(weather.code)}
                        </div>
                        <div className="mt-6 flex items-center gap-4 text-sm opacity-80">
                            <div className="flex items-center gap-1">
                                <Wind className="w-4 h-4" /> {weather.wind} м/с
                            </div>
                            <div className="flex items-center gap-1">
                                <Droplets className="w-4 h-4" /> {weather.humidity}%
                            </div>
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
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-5 relative overflow-hidden transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                      <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-bold text-gray-900 dark:text-white">Городской опрос</h3>
                  </div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">{poll.question}</h4>
                  
                  <div className="space-y-2">
                      {poll.options.map(opt => {
                          const totalVotes = poll.options.reduce((acc, o) => acc + o.votes, 0);
                          const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                          const isVoted = poll.userVotedOptionId !== null;
                          const isSelected = poll.userVotedOptionId === opt.id;

                          return (
                              <div key={opt.id} className="relative">
                                  {isVoted ? (
                                      // Result View
                                      <div className={`relative h-10 w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center px-3 ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800' : ''}`}>
                                          <div 
                                            className={`absolute inset-y-0 left-0 ${isSelected ? 'bg-blue-200 dark:bg-blue-900' : 'bg-gray-200 dark:bg-gray-600'} transition-all duration-1000`} 
                                            style={{width: `${percentage}%`}}
                                          ></div>
                                          <div className="relative z-10 flex justify-between w-full text-sm">
                                              <span className="font-medium text-gray-800 dark:text-gray-200">{opt.text}</span>
                                              <span className="text-gray-600 dark:text-gray-300 font-bold">{percentage}%</span>
                                          </div>
                                          {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute right-12 z-10" />}
                                      </div>
                                  ) : (
                                      // Voting View
                                      <button 
                                        onClick={() => handleVote(opt.id)}
                                        disabled={voting || !user}
                                        className="w-full text-left p-3 rounded-lg border dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                                      >
                                          {opt.text}
                                      </button>
                                  )}
                              </div>
                          );
                      })}
                  </div>
                  {!user && !poll.userVotedOptionId && (
                      <p className="text-xs text-center text-gray-400 mt-3">Войдите, чтобы проголосовать</p>
                  )}
                  <div className="mt-4 text-xs text-gray-400 text-center">
                      Проголосовало: {poll.options.reduce((acc, o) => acc + o.votes, 0)} человек
                  </div>
              </div>
          )}

          {/* News Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-5 transition-colors">
            <div className="flex items-center justify-between mb-4 border-b dark:border-gray-700 pb-3">
               <h3 className="font-bold text-gray-900 dark:text-white">Новости</h3>
            </div>
            
            {user && (
                <button 
                  onClick={() => setNewsModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 mb-4 p-3 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                    <PenSquare className="w-4 h-4" /> Предложить новость
                </button>
            )}

            <div className="space-y-5">
              {news.length > 0 ? news.map(n => (
                 <Link key={n.id} to={`/news/${n.id}`} className="block group">
                    <span className="text-xs text-gray-400 block mb-1">{n.date}</span>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2">
                       {n.title}
                    </h4>
                 </Link>
              )) : (
                <div className="text-center text-gray-400 text-sm py-4">Новостей пока нет</div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-5 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Полезное</h3>
            <ul className="space-y-3 text-sm">
              <li>
                  <Link to="/category/transport" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                          <Bus className="w-4 h-4" />
                      </div>
                      Расписание транспорта
                  </Link>
              </li>
              <li>
                  <Link to="/category/med" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 group">
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mr-3 group-hover:bg-red-100 dark:group-hover:bg-red-800 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                      </div>
                      Запись к врачу
                  </Link>
              </li>
              <li>
                  <Link to="/category/emergency" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 group">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mr-3 group-hover:bg-orange-100 dark:group-hover:bg-orange-800 transition-colors">
                          <PhoneIcon />
                      </div>
                      Экстренные телефоны
                  </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

// Component for VIP Ads
const VipAdCard: React.FC<{ ad: Ad, onClick: () => void }> = ({ ad, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-xl border-2 border-orange-200 dark:border-orange-900 shadow-sm overflow-hidden hover:shadow-md transition-all relative group cursor-pointer">
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">
            VIP
        </div>
        <div className="flex h-32">
            <div className="w-1/3 relative">
                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
            </div>
            <div className="w-2/3 p-3 flex flex-col justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {ad.title}
                    </h4>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{ad.price.toLocaleString()} {ad.currency}</p>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-400 truncate max-w-[80px]">{ad.category}</span>
                    <Button size="sm" variant="secondary" className="px-2 py-1 h-7 text-xs">Показать</Button>
                </div>
            </div>
        </div>
    </div>
);

// Component for Regular Ads in Grid format (replaces old list style)
const GridAdCard: React.FC<{ ad: Ad, onClick: () => void }> = ({ ad, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col cursor-pointer border dark:border-gray-700"
    >
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute bottom-2 left-2">
           <Badge color="gray">{ad.category}</Badge>
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
        </div>
      </div>
    </div>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
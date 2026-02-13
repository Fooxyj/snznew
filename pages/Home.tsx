
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    Loader2, MapPin, ChevronLeft, ChevronRight, 
    Crown, ShoppingBag, Activity, Newspaper, Wand2, 
    ArrowRight, Star, Sparkles, Building2, Info, Eye, Heart, Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StoriesRail } from '../components/StoriesRail';
import { BannerSlot } from '../components/BannerSlot';
import { LaunchTicker } from '../components/LaunchTicker';
import { Button, Badge } from '../components/ui/Common';
import { PageBlock, NewsItem, Ad, Event } from '../types';

// Вспомогательная функция для перемешивания массива
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const BlockRenderer: React.FC<{ block: PageBlock }> = ({ block }) => {
    switch (block.type) {
        case 'hero':
            return (
                <section className="relative h-[60vh] min-h-[450px] w-full flex items-center justify-center overflow-hidden rounded-3xl my-4 shadow-2xl">
                    <img src={block.config?.bg || ''} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"></div>
                    <div className="relative z-10 text-center px-6 max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-none">{block.title}</h1>
                        <p className="text-xl md:text-2xl text-blue-100/80 mb-8 uppercase tracking-widest font-medium">{block.subtitle}</p>
                        <Button className="rounded-2xl px-12 py-6 text-lg font-black uppercase tracking-[0.2em] bg-blue-600 border-none shadow-2xl hover:scale-105 transition-transform">Узнать больше</Button>
                    </div>
                </section>
            );
        case 'grid':
            return (
                <section className="py-12">
                    <h2 className="text-3xl font-black uppercase mb-10 dark:text-white tracking-tighter border-l-8 border-blue-600 pl-6">{block.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {block.items?.map((item, i) => (
                            <div key={i} className="group flex flex-col h-full">
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 shadow-sm border dark:border-gray-700 shrink-0">
                                    <img src={item.img || 'https://picsum.photos/seed/item/400/600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <h4 className="font-black text-sm uppercase dark:text-white mb-1 line-clamp-2 h-10 leading-5 overflow-hidden">{item.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 line-clamp-2">{item.desc}</p>
                                    <div className="mt-auto text-blue-600 font-black text-lg">{item.price} ₽</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            );
        default:
            return null;
    }
};

const formatDateShort = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
    } catch (e) {
        return 'Недавно';
    }
};

const formatViews = (count: number) => {
    if (!count || count === 0) return '0';
    if (count < 1000) return count.toString();
    return (count / 1000).toFixed(1) + 'к';
};

export const Home: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: exclusivePages = [], isLoading: exclusiveLoading } = useQuery({ 
    queryKey: ['exclusivePages'], 
    queryFn: () => api.getExclusivePages() 
  });
  
  const { data: ads = [], isLoading: adsLoading } = useQuery({ queryKey: ['ads'], queryFn: () => api.getAds() });
  const { data: news = [], isLoading: newsLoading } = useQuery({ queryKey: ['news'], queryFn: () => api.getNews() });
  const { data: events = [], isLoading: eventsLoading } = useQuery({ queryKey: ['events'], queryFn: () => api.getEvents() });
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });

  const exclusiveCount = Math.max(1, exclusivePages.length);
  const proPageStart = 2 + exclusiveCount;
  const privatePageStart = 3 + exclusiveCount;
  const totalPages = privatePageStart;

  const pageContent = useMemo(() => {
    const adsPerPage = 8;
    
    // 1. VIP Страница (Главная: Новости + Афиша)
    if (currentPage === 1) {
        return {
            type: 'standard',
            title: 'VIP Город',
            subtitle: 'ГЛАВНОЕ В СНЕЖИНСКЕ',
            icon: <Crown className="w-6 h-6 text-orange-500" />,
            news: news.slice(0, 4),
            events: events.slice(0, 4),
            ads: shuffleArray(ads.filter(a => a.isVip)).slice(0, adsPerPage),
            adLabel: 'VIP Объявления'
        };
    }
    
    // 2. ИНФО (Exclusive Pages)
    if (currentPage >= 2 && currentPage < proPageStart) {
        return { type: 'exclusive' };
    }

    // 3. PRO Страница (Теперь больше новостей + PRO Объявления)
    if (currentPage === proPageStart) {
        return {
            type: 'standard',
            title: 'PRO Снежинск',
            subtitle: 'ЛУЧШИЕ ПРЕДЛОЖЕНИЯ',
            icon: <Wand2 className="w-6 h-6 text-indigo-500" />,
            news: news.slice(8, 12),
            ads: shuffleArray(ads.filter(a => a.isPremium && !a.isVip)).slice(0, adsPerPage),
            adLabel: 'PRO Предложения'
        };
    }

    // 4. Маркет (Новости + Частные объявления)
    if (currentPage === privatePageStart) {
        return {
            type: 'standard',
            title: 'Маркет',
            subtitle: 'ЧАСТНЫЕ ОБЪЯВЛЕНИЯ И ЛЕНТА',
            icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
            news: news.slice(4, 8),
            ads: shuffleArray(ads.filter(a => !a.isVip && !a.isPremium)).slice(0, adsPerPage),
            adLabel: 'Частные объявления'
        };
    }
    
    return null;
  }, [currentPage, news, ads, events, proPageStart, privatePageStart]);

  const activeExclusivePage = useMemo(() => {
    if (currentPage >= 2 && currentPage < proPageStart) {
        return exclusivePages[currentPage - 2] || exclusivePages[0];
    }
    return null;
  }, [exclusivePages, currentPage, proPageStart]);

  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentPage]);

  if (adsLoading || newsLoading || exclusiveLoading || eventsLoading) return (
    <div className="flex h-screen items-center justify-center dark:bg-gray-900">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  const navigationTabs = [
      { id: 1, label: 'VIP', icon: <Crown className="w-3.5 h-3.5"/> },
      { id: 2, label: 'Инфо', icon: <Building2 className="w-3.5 h-3.5"/> },
      { id: proPageStart, label: 'PRO', icon: <Wand2 className="w-3.5 h-3.5"/> },
      { id: privatePageStart, label: 'Частные', icon: <ShoppingBag className="w-3.5 h-3.5"/> }
  ];

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    await api.toggleFavorite(id, 'ad');
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  return (
    <div className="max-w-full mx-auto px-4 md:px-8 py-6 space-y-16 pb-40 overflow-x-hidden w-full relative">
      
      {pageContent?.type === 'standard' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16 max-w-[1440px] mx-auto overflow-x-hidden">
              
              {/* Бегущая строка сверху */}
              {currentPage === 1 && <LaunchTicker />}

              <StoriesRail />

              <BannerSlot position={`home_top_p${currentPage}`} />

              {/* СЕКЦИЯ НОВОСТЕЙ */}
              {pageContent.news && pageContent.news.length > 0 && (
                <section className="space-y-8">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 shadow-sm border border-blue-100 dark:border-blue-800">
                               <Newspaper className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter leading-none">Новости города</h2>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                        {pageContent.news.map(item => (
                            <Link key={item.id} to={`/news/${item.id}`} className="group block h-full flex flex-col">
                                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 shadow-sm border dark:border-gray-700 shrink-0">
                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                </div>
                                <div className="px-1 flex flex-col flex-1">
                                    <h4 className="text-[12px] font-black dark:text-white line-clamp-2 leading-4 uppercase group-hover:text-blue-600 transition-colors tracking-tight mb-3 h-8 overflow-hidden">{item.title}</h4>
                                    <div className="mt-auto flex items-center gap-3 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-blue-500" /> {formatViews(item.views)}</span>
                                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                                        <span>{formatDateShort(item.date)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
              )}

              {/* СЕКЦИЯ АФИШИ (Только если есть на текущей странице) */}
              {pageContent.events && pageContent.events.length > 0 && (
                <section className="space-y-8 animate-in slide-in-from-bottom-2 duration-1000">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-800">
                               <Calendar className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter leading-none">Городская Афиша</h2>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                        {pageContent.events.map(item => (
                            <Link key={item.id} to={`/event/${item.id}`} className="group block h-full flex flex-col">
                                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 shadow-sm border dark:border-gray-700 shrink-0">
                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                </div>
                                <div className="px-1 flex flex-col flex-1">
                                    <h4 className="text-[12px] font-black dark:text-white line-clamp-2 leading-4 uppercase group-hover:text-blue-600 transition-colors tracking-tight mb-3 h-8 overflow-hidden">{item.title}</h4>
                                    <div className="mt-auto flex items-center gap-3 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-500" /> {item.date}</span>
                                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                                        <span className="truncate">{item.location}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
              )}

              <BannerSlot position={`home_mid_p${currentPage}`} />

              {/* ОБЪЯВЛЕНИЯ СТРАНИЦЫ */}
              <section className="space-y-10">
                  <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700">
                             {pageContent.icon}
                          </div>
                          <div>
                            <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter leading-none">{pageContent.adLabel}</h2>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                      {pageContent.ads.map(ad => {
                          const isFav = user?.favorites?.includes(ad.id);
                          return (
                          <Link key={ad.id} to={`/ad/${ad.id}`} className="group block flex flex-col h-full relative">
                              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 mb-5 shadow-sm shrink-0">
                                  <img src={ad.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                                  
                                  <button 
                                    onClick={(e) => handleToggleFavorite(e, ad.id)}
                                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all z-10 ${isFav ? 'bg-red-500 border-red-400 text-white shadow-xl' : 'bg-black/20 border-white/10 text-white hover:bg-black/40'}`}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                                  </button>
                              </div>
                              <div className="px-2 flex flex-col flex-1">
                                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter leading-none mb-3">
                                      {ad.price.toLocaleString()} ₽
                                  </div>
                                  <h4 className="font-black text-sm dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-5 h-10 overflow-hidden mb-4">{ad.title}</h4>
                                  <div className="mt-auto flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest pt-3 border-t dark:border-gray-800">
                                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> {ad.location}
                                  </div>
                              </div>
                          </Link>
                          )})}
                  </div>
              </section>
          </div>
      ) : (
          <div className="animate-in fade-in duration-1000 max-w-[1440px] mx-auto overflow-x-hidden">
              {activeExclusivePage ? (
                  <div className="space-y-20">
                      <div className="flex items-center gap-3 px-1">
                         <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                         <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">Эксклюзив • Инфо</h3>
                      </div>
                      {activeExclusivePage.blocks_config?.map((block) => (
                          <BlockRenderer key={block.id} block={block} />
                      ))}
                  </div>
              ) : (
                  <div className="py-40 text-center space-y-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed mx-4">
                      <Building2 className="w-20 h-20 mx-auto text-gray-200 animate-bounce" />
                      <h3 className="text-2xl font-black uppercase dark:text-white">Информационный раздел</h3>
                      <p className="text-gray-500 uppercase font-bold text-xs tracking-widest">Здесь скоро появятся важные городские данные</p>
                  </div>
              )}
          </div>
      )}

      {/* НИЖНЯЯ ПАГИНАЦИЯ */}
      <div className="pt-20 border-t dark:border-gray-800 flex flex-col items-center gap-8 max-w-[1440px] mx-auto overflow-x-hidden">
          <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-3 sm:p-5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-blue-600 disabled:opacity-20 transition-all active:scale-90"
              >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="flex gap-1 sm:gap-2 p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] sm:rounded-[2.5rem]">
                  {navigationTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setCurrentPage(tab.id)}
                        className={`flex flex-col items-center gap-1 sm:gap-1.5 px-3 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] sm:rounded-[2rem] transition-all ${currentPage === tab.id ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xl scale-105 sm:scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                          <div className="text-base sm:text-lg font-black leading-none">{tab.label === 'Инфо' ? '2' : tab.label === 'PRO' ? '3' : tab.label === 'Частные' ? '4' : '1'}</div>
                          <div className="flex items-center gap-1 font-black uppercase text-[7px] sm:text-[8px] tracking-widest">
                             {tab.icon} {tab.label}
                          </div>
                      </button>
                  ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-3 sm:p-5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-blue-600 disabled:opacity-20 transition-all active:scale-90"
              >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
          </div>
      </div>
    </div>
  );
};

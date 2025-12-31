
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    Loader2, ArrowRight, Clock, MapPin, ChevronLeft, ChevronRight, 
    CheckCircle2, Phone, Globe, MessageCircle, Star, Ticket, 
    Sparkles, Zap, Award, ShieldCheck, Navigation, Heart, ArrowDown,
    MousePointer2, ExternalLink, Mail, Building2, UserRound, Utensils, Wand2, Crown,
    ShoppingBag, Activity, Radio
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CreateNewsModal } from '../components/CreateNewsModal';
import { StoriesRail } from '../components/StoriesRail';
import { BannerSlot } from '../components/BannerSlot';
import { Button, Badge } from '../components/ui/Common';
import { ExclusivePage, PageBlock } from '../types';

// Компоненты динамических блоков
const BlockRenderer: React.FC<{ block: PageBlock }> = ({ block }) => {
    switch (block.type) {
        case 'hero':
            return (
                <section className="relative h-[70vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden rounded-xl">
                    <img src={block.config?.bg || ''} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 text-center px-6 max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">{block.title}</h1>
                        <p className="text-xl md:text-2xl text-blue-100/80 mb-8">{block.subtitle}</p>
                        <Button className="rounded-xl px-10 py-6 text-lg font-black uppercase tracking-widest bg-blue-600">Начать</Button>
                    </div>
                </section>
            );

        case 'grid':
            return (
                <section className="py-20 bg-white dark:bg-gray-900 px-6">
                    <div className="max-w-7xl mx-auto space-y-12">
                        <div className="text-center md:text-left border-l-4 border-blue-600 pl-6">
                            <h2 className="text-4xl md:text-5xl font-black dark:text-white uppercase tracking-tighter">{block.title}</h2>
                            <p className="text-gray-500 mt-2 font-bold uppercase text-xs tracking-[0.3em]">{block.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {block.items?.map((item: any, i: number) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 group hover:shadow-xl transition-all duration-300">
                                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                                        {item.img && <img src={item.img} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" alt="" />}
                                        {item.price && <div className="absolute bottom-4 left-4 bg-white dark:bg-black px-3 py-1 rounded font-black text-blue-600 text-sm shadow-lg">{item.price} ₽</div>}
                                    </div>
                                    <div className="p-6">
                                        <h4 className="text-lg font-black dark:text-white uppercase mb-2">{item.name || item.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc || item.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );

        case 'pricing':
            return (
                <section className="py-20 bg-gray-50 dark:bg-gray-950 px-6">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border dark:border-gray-800">
                        <h2 className="text-2xl font-black dark:text-white uppercase mb-8 text-center">{block.title}</h2>
                        <div className="space-y-2">
                            {block.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100">
                                    <div className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs">{item.name}</div>
                                    <div className="h-px bg-gray-100 flex-1 mx-4"></div>
                                    <div className="font-black text-blue-600">{item.price} ₽</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );

        default:
            return null;
    }
};

export const Home: React.FC = () => {
  const [isNewsModalOpen, setNewsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: exclusivePages = [], isLoading: exclusiveLoading } = useQuery({ 
    queryKey: ['exclusivePages'], 
    queryFn: () => api.getExclusivePages() 
  });
  
  const { data: ads = [], isLoading: adsLoading } = useQuery({ queryKey: ['ads'], queryFn: () => api.getAds() });
  const { data: news = [], isLoading: newsLoading } = useQuery({ queryKey: ['news'], queryFn: () => api.getNews() });

  const totalPages = 3 + exclusivePages.length;

  const activeExclusivePage = useMemo(() => {
    if (currentPage <= 3) return null;
    return exclusivePages[currentPage - 4];
  }, [exclusivePages, currentPage]);

  const displayedAds = useMemo(() => {
      if (currentPage === 1) return ads.filter(ad => ad.isVip);
      if (currentPage === 2) return ads.filter(ad => ad.isPremium && !ad.isVip);
      if (currentPage === 3) return ads.filter(ad => !ad.isVip && !ad.isPremium);
      return [];
  }, [ads, currentPage]);

  const adHeader = useMemo(() => {
      if (currentPage === 1) return { title: 'VIP Объявления', icon: <Crown className="w-8 h-8 text-orange-500" />, color: 'text-orange-600' };
      if (currentPage === 2) return { title: 'PRO Предложения', icon: <Wand2 className="w-8 h-8 text-indigo-500" />, color: 'text-indigo-600' };
      return { title: 'Новые объявления', icon: <ShoppingBag className="w-8 h-8 text-blue-600" />, color: 'text-blue-600' };
  }, [currentPage]);

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleBecomePartner = async () => {
      const adminId = await api.getAdminUserId();
      try {
          const chatId = await api.startChat(adminId || "b5db0ccd-1c12-4231-b95a-497afe50dcac", "Здравствуйте! Я хочу заказать такой же эксклюзивный лендинг для своего бизнеса.");
          navigate(`/chat?id=${chatId}`);
      } catch (e) {
          alert("Не удалось открыть чат. Пожалуйста, попробуйте позже.");
      }
  };

  if (adsLoading || newsLoading || exclusiveLoading) return (
    <div className="flex h-screen items-center justify-center dark:bg-gray-900">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  const isExclusiveMode = currentPage > 3 && !!activeExclusivePage;

  return (
    <div className={`w-full ${isExclusiveMode ? '' : 'max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6 md:space-y-8 pb-32'}`}>
      <CreateNewsModal isOpen={isNewsModalOpen} onClose={() => setNewsModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['news'] })} />
      
      {!isExclusiveMode && (
        <section className="w-full">
          <StoriesRail />
        </section>
      )}

      {currentPage <= 3 && (
        <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 w-full">
            <section className="w-full"><BannerSlot position={`home_top_p${currentPage}`} /></section>

            <section className="space-y-6">
                <div className="flex items-center justify-between border-l-4 border-blue-600 pl-4">
                    <div><h2 className="text-2xl md:text-3xl font-black dark:text-white uppercase tracking-tighter">Новости</h2></div>
                    <Link to="/news" className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded text-[10px] font-black text-blue-600 uppercase">Все новости</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {news.slice((currentPage-1)*4, currentPage*4).map(item => (
                        <div key={item.id} onClick={() => navigate(`/news/${item.id}`)} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="relative h-40 overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" alt="" /></div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-sm font-black dark:text-white mb-3 line-clamp-2 uppercase leading-tight">{item.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="w-full"><BannerSlot position={`home_mid_p${currentPage}`} /></section>

            <section className="space-y-6 md:space-y-10 border-t dark:border-gray-800 pt-12 md:pt-16">
                <div className="flex items-center justify-between border-b dark:border-gray-800 pb-4 md:pb-6">
                    <div className="flex items-center gap-3">
                        {adHeader.icon}
                        <h2 className="text-2xl md:text-4xl font-black dark:text-white uppercase tracking-tighter">{adHeader.title}</h2>
                    </div>
                    <Link to="/classifieds" className="bg-gray-100 dark:bg-gray-800 px-6 py-2 rounded text-[10px] font-black text-gray-500 uppercase">Все объявления</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {displayedAds.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed dark:border-gray-700">
                            <p className="text-gray-400 font-bold uppercase text-xs">В этом разделе пока пусто</p>
                        </div>
                    ) : (
                        displayedAds.map((ad) => (
                            <div 
                                key={ad.id} 
                                onClick={() => navigate(`/ad/${ad.id}`)} 
                                className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col ${
                                    currentPage === 1 ? 'border-orange-100 dark:border-orange-900/30 hover:shadow-orange-500/10' :
                                    currentPage === 2 ? 'border-indigo-100 dark:border-indigo-900/30 hover:shadow-indigo-500/10' :
                                    'border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-gray-950 shrink-0">
                                    <img src={ad.image} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500" alt="" />
                                    {currentPage === 1 && <div className="absolute top-2 left-2 bg-orange-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">VIP</div>}
                                    {currentPage === 2 && <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">PRO</div>}
                                </div>
                                <div className="p-4 flex-1">
                                    <p className={`text-sm md:text-lg font-black mb-1 ${
                                        currentPage === 1 ? 'text-orange-600' :
                                        currentPage === 2 ? 'text-indigo-600' :
                                        'text-blue-600'
                                    }`}>{ad.price.toLocaleString()} {ad.currency}</p>
                                    <h3 className="text-[11px] md:text-[12px] font-bold dark:text-white mb-2 line-clamp-2 leading-tight uppercase tracking-tight">{ad.title}</h3>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
      )}

      {isExclusiveMode && (
        <div className="animate-in slide-in-from-bottom-4 duration-700 flex flex-col bg-white dark:bg-gray-950">
            {/* Рендеринг модульных блоков */}
            {(activeExclusivePage.blocks_config || []).map((block) => (
                <BlockRenderer key={block.id} block={block} />
            ))}

            {/* Стандартный блок CTA */}
            <section className="py-20 md:py-24 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/40 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 p-2 pr-6 rounded-full shadow-sm">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs">S</div>
                        <span className="text-[10px] font-black uppercase tracking-tighter dark:text-white">Снежинск Онлайн • Бизнес</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black dark:text-white uppercase tracking-tighter">Хотите такую же страницу?</h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">Получите полноценный мини-сайт внутри главного городского портала для своего дела.</p>
                    <div className="pt-4">
                        <Button 
                            className="rounded-xl px-12 py-6 text-lg font-black uppercase tracking-widest bg-gray-900 hover:bg-black text-white"
                            onClick={handleBecomePartner}
                        >
                            Узнать условия
                        </Button>
                    </div>
                </div>
            </section>

            {/* Пагинация в эксклюзивном режиме */}
            <div className="py-16 flex flex-col items-center bg-gray-50 dark:bg-gray-900 px-6">
                <div className="flex justify-center items-center gap-4">
                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-gray-400 hover:text-blue-600 transition-all shadow-sm"><ChevronLeft className="w-6 h-6" /></button>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[280px] sm:max-w-none">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-xl font-black text-sm transition-all shadow-sm shrink-0 ${currentPage === i + 1 ? 'bg-blue-600 text-white scale-110 z-10' : 'bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700'}`}>{i + 1}</button>
                        ))}
                    </div>
                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-gray-400 hover:text-blue-600 transition-all shadow-sm"><ChevronRight className="w-6 h-6" /></button>
                </div>
            </div>
        </div>
      )}

      {/* Футер для первых 3 страниц */}
      {!isExclusiveMode && (
        <div className="flex flex-col items-center gap-8 pt-12 border-t dark:border-gray-800 w-full">
            <div className="flex justify-center items-center gap-3">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-gray-500 disabled:opacity-20 hover:text-blue-600 transition-all shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[280px] sm:max-w-none">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg font-black text-xs transition-all shadow-sm shrink-0 ${currentPage === i + 1 ? 'bg-blue-600 text-white scale-110 z-10' : 'bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700'}`}>{i + 1}</button>
                    ))}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-gray-400 hover:text-blue-600 transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>
      )}
    </div>
  );
};

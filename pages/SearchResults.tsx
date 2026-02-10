
import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Loader2, ArrowRight, MapPin, Search, Heart, Building2, ShoppingBag, Newspaper, ChevronRight } from 'lucide-react';
// Comment above fix: Added Button to imports to fix "Cannot find name 'Button'" error on line 93
import { Badge, Rating, Button } from '../components/ui/Common';

// Helper component for highlighting matching text
const HighlightText: React.FC<{ text: string, highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) => 
                regex.test(part) ? (
                    <span key={i} className="bg-yellow-200 dark:bg-yellow-600/50 text-gray-900 dark:text-white font-black rounded-sm px-0.5 shadow-sm">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [filter, setFilter] = useState<'all' | 'business' | 'ads' | 'news'>('all');

    const { data: results = { ads: [], businesses: [], news: [] }, isLoading } = useQuery({
        queryKey: ['search', query],
        queryFn: () => api.globalSearch(query),
        enabled: !!query,
        initialData: { ads: [], businesses: [], news: [] }
    });

    if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;

    const isEmpty = results.ads.length === 0 && results.businesses.length === 0 && results.news.length === 0;

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-32">
            <div className="mb-10">
                <h1 className="text-3xl font-black mb-2 dark:text-white uppercase tracking-tighter italic">Поиск по городу</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    Результаты для: <span className="text-blue-600">"{query}"</span>
                </p>
            </div>

            {/* Filters */}
            {!isEmpty && (
                <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    <button 
                        onClick={() => setFilter('all')} 
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700'}`}
                    >
                        Все ({results.businesses.length + results.ads.length + results.news.length})
                    </button>
                    <button 
                        onClick={() => setFilter('business')} 
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'business' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700'}`}
                    >
                        Места ({results.businesses.length})
                    </button>
                    <button 
                        onClick={() => setFilter('ads')} 
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'ads' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700'}`}
                    >
                        Маркет ({results.ads.length})
                    </button>
                    <button 
                        onClick={() => setFilter('news')} 
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'news' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700'}`}
                    >
                        Новости ({results.news.length})
                    </button>
                </div>
            )}

            {isEmpty && (
                <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed dark:border-gray-700 animate-in zoom-in-95 duration-500">
                    <Search className="w-20 h-20 mx-auto mb-6 opacity-10 text-gray-400" />
                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Ничего не найдено</h3>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Попробуйте изменить запрос или поискать в других категориях</p>
                    <Link to="/" className="inline-block mt-10">
                        <Button variant="outline" className="rounded-2xl px-10 py-4 font-black uppercase text-[10px] tracking-widest">Вернуться на главную</Button>
                    </Link>
                </div>
            )}

            <div className="space-y-16">
                {/* Businesses */}
                {(filter === 'all' || filter === 'business') && results.businesses.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6 px-1">
                            <Building2 className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Организации и услуги</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.businesses.map(biz => (
                                <Link key={biz.id} to={`/business/${biz.id}`} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border dark:border-gray-700 shadow-sm flex gap-6 hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 shrink-0 border dark:border-gray-700">
                                        <img src={biz.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Badge color={biz.isMaster ? 'orange' : 'blue'} className="px-2 py-0.5 text-[8px]">{biz.category}</Badge>
                                            {biz.verificationStatus === 'verified' && <div className="p-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-full"><ChevronRight className="w-3 h-3 text-blue-500" /></div>}
                                        </div>
                                        <h3 className="font-black text-lg dark:text-white uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors truncate">
                                            <HighlightText text={biz.name} highlight={query} />
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 mb-3">
                                            <Rating value={biz.rating} count={biz.reviewsCount} />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 truncate">
                                            <MapPin className="w-3.5 h-3.5 text-blue-500" /> 
                                            {biz.address}
                                        </p>
                                    </div>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                                        <ChevronRight className="w-6 h-6 text-blue-600" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ads */}
                {(filter === 'all' || filter === 'ads') && results.ads.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <div className="flex items-center gap-3 mb-6 px-1">
                            <ShoppingBag className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Объявления на маркете</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {results.ads.map(ad => (
                                <Link key={ad.id} to={`/ad/${ad.id}`} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                                    <div className="aspect-[3/4] relative overflow-hidden bg-gray-50 dark:bg-gray-900 shrink-0">
                                        <img src={ad.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute top-2 left-2"><Badge color="gray" className="px-1.5 py-0.5 text-[7px]">{ad.category}</Badge></div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="text-lg font-black text-blue-600 dark:text-blue-400 mb-1 leading-none">{ad.price.toLocaleString()} ₽</div>
                                        <h4 className="font-bold text-[11px] dark:text-white line-clamp-2 uppercase leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                                            <HighlightText text={ad.title} highlight={query} />
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* News */}
                {(filter === 'all' || filter === 'news') && results.news.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                        <div className="flex items-center gap-3 mb-6 px-1">
                            <Newspaper className="w-6 h-6 text-indigo-600" />
                            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Городские новости</h2>
                        </div>
                        <div className="grid gap-4">
                            {results.news.map(n => (
                                <Link key={n.id} to={`/news/${n.id}`} className="block bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">{n.category}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{new Date(n.date).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-black text-lg mb-2 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight relative z-10">
                                        <HighlightText text={n.title} highlight={query} />
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 font-medium italic relative z-10">
                                        "{n.content}"
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-20 pt-10 border-t dark:border-gray-800 text-center">
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em]">ПРОСТОР ПОИСК • СНЕЖИНСК 2025</p>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Loader2, ArrowRight, MapPin, Search, Heart } from 'lucide-react';
import { Badge, Rating } from '../components/ui/Common';

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
                    <span key={i} className="bg-yellow-200 dark:bg-yellow-600/50 text-gray-900 dark:text-white font-medium rounded-sm px-0.5">
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

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

    const isEmpty = results.ads.length === 0 && results.businesses.length === 0 && results.news.length === 0;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 dark:text-white">Результаты поиска по запросу "{query}"</h1>

            {/* Filters */}
            {!isEmpty && (
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    <button 
                        onClick={() => setFilter('all')} 
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        Все
                    </button>
                    <button 
                        onClick={() => setFilter('business')} 
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'business' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        Организации ({results.businesses.length})
                    </button>
                    <button 
                        onClick={() => setFilter('ads')} 
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'ads' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        Объявления ({results.ads.length})
                    </button>
                    <button 
                        onClick={() => setFilter('news')} 
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'news' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        Новости ({results.news.length})
                    </button>
                </div>
            )}

            {isEmpty && (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Ничего не найдено</p>
                    <p className="text-sm">Попробуйте изменить запрос</p>
                </div>
            )}

            {/* Businesses */}
            {(filter === 'all' || filter === 'business') && results.businesses.length > 0 && (
                <div className="mb-10 animate-in fade-in">
                    <h2 className="text-xl font-bold mb-4 flex items-center dark:text-white">
                        Организации <span className="ml-2 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">{results.businesses.length}</span>
                    </h2>
                    <div className="grid gap-4">
                        {results.businesses.map(biz => (
                            <div key={biz.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                                <img src={biz.image} alt="" className="w-20 h-20 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white">
                                        <HighlightText text={biz.name} highlight={query} />
                                    </h3>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Rating value={biz.rating} count={biz.reviewsCount} />
                                        {biz.isMaster && <Badge color="red" className="text-[8px] px-1.5 py-0.5 rounded"><Heart className="w-2 h-2 mr-1 inline fill-current"/> МАСТЕР</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" /> 
                                        <HighlightText text={biz.address} highlight={query} />
                                    </p>
                                </div>
                                <div className="ml-auto flex items-center">
                                    <Link to={`/business/${biz.id}`} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-full">
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ads */}
            {(filter === 'all' || filter === 'ads') && results.ads.length > 0 && (
                <div className="mb-10 animate-in fade-in">
                    <h2 className="text-xl font-bold mb-4 flex items-center dark:text-white">
                        Объявления <span className="ml-2 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">{results.ads.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.ads.map(ad => (
                            <Link key={ad.id} to={`/ad/${ad.id}`}>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 shadow-sm flex gap-3 hover:shadow-md transition-shadow h-full">
                                    <img src={ad.image} alt="" className="w-24 h-24 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 shrink-0" />
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <h4 className="font-medium truncate dark:text-white">
                                            <HighlightText text={ad.title} highlight={query} />
                                        </h4>
                                        <p className="font-bold text-blue-600 dark:text-blue-400 mb-auto">{ad.price.toLocaleString()} {ad.currency}</p>
                                        <div className="mt-2 flex gap-2">
                                            <Badge color="gray">{ad.category}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* News */}
            {(filter === 'all' || filter === 'news') && results.news.length > 0 && (
                <div className="mb-10 animate-in fade-in">
                    <h2 className="text-xl font-bold mb-4 flex items-center dark:text-white">
                        Новости <span className="ml-2 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">{results.news.length}</span>
                    </h2>
                    <div className="space-y-4">
                        {results.news.map(n => (
                            <Link key={n.id} to={`/news/${n.id}`} className="block bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1 block">{n.category}</span>
                                <h3 className="font-bold text-lg mb-1 dark:text-white">
                                    <HighlightText text={n.title} highlight={query} />
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                                    <HighlightText text={n.content} highlight={query} />
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Ad, Business, NewsItem } from '../types';
import { Loader2, ArrowRight, MapPin, Search } from 'lucide-react';
import { Badge, Rating } from '../components/ui/Common';

export const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [results, setResults] = useState<{ads: Ad[], businesses: Business[], news: NewsItem[]}>({ ads: [], businesses: [], news: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                const data = await api.globalSearch(query);
                setResults(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            performSearch();
        } else {
            setLoading(false);
        }
    }, [query]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

    const isEmpty = results.ads.length === 0 && results.businesses.length === 0 && results.news.length === 0;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6">Результаты поиска по запросу "{query}"</h1>

            {isEmpty && (
                <div className="text-center py-20 text-gray-500">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Ничего не найдено</p>
                    <p className="text-sm">Попробуйте изменить запрос</p>
                </div>
            )}

            {/* Businesses */}
            {results.businesses.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        Организации <span className="ml-2 text-sm bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{results.businesses.length}</span>
                    </h2>
                    <div className="grid gap-4">
                        {results.businesses.map(biz => (
                            <div key={biz.id} className="bg-white p-4 rounded-xl border shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                                <img src={biz.image} alt="" className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                                <div>
                                    <h3 className="font-bold text-lg">{biz.name}</h3>
                                    <Rating value={biz.rating} count={biz.reviewsCount} />
                                    <p className="text-sm text-gray-500 mt-1 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {biz.address}</p>
                                </div>
                                <div className="ml-auto flex items-center">
                                    <Link to={`/category/${getCategorySlug(biz.category)}`} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full">
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ads */}
            {results.ads.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        Объявления <span className="ml-2 text-sm bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{results.ads.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.ads.map(ad => (
                            <div key={ad.id} className="bg-white p-3 rounded-xl border shadow-sm flex gap-3 hover:shadow-md transition-shadow">
                                <img src={ad.image} alt="" className="w-24 h-24 rounded-lg object-cover bg-gray-100 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{ad.title}</h4>
                                    <p className="font-bold text-blue-600">{ad.price.toLocaleString()} {ad.currency}</p>
                                    <div className="mt-2 flex gap-2">
                                        <Badge color="gray">{ad.category}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-4">
                        <Link to="/classifieds" className="text-blue-600 text-sm hover:underline">Перейти в объявления →</Link>
                    </div>
                </div>
            )}

            {/* News */}
            {results.news.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        Новости <span className="ml-2 text-sm bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{results.news.length}</span>
                    </h2>
                    <div className="space-y-4">
                        {results.news.map(n => (
                            <Link key={n.id} to={`/news/${n.id}`} className="block bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                <span className="text-xs text-blue-600 font-medium mb-1 block">{n.category}</span>
                                <h3 className="font-bold text-lg mb-1">{n.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2">{n.content}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const getCategorySlug = (catName: string) => {
    // Helper to link to correct category page (simplified)
    if (catName === 'Магазины') return 'shops';
    if (catName === 'Кафе и рестораны') return 'cafe';
    return 'shops'; // fallback
};
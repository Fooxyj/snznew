
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NewsItem } from '../types';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, Newspaper, PenSquare } from 'lucide-react';
import { CreateNewsModal } from '../components/CreateNewsModal';
import { Button } from '../components/ui/Common';

export const NewsFeed: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [n, u] = await Promise.all([api.getNews(), api.getCurrentUser()]);
            setNews(n);
            setUser(u);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleNewsCreated = (newItem: NewsItem) => {
        setNews([newItem, ...news]);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <CreateNewsModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={handleNewsCreated} />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-3 dark:text-white">
                    <Newspaper className="w-8 h-8 text-blue-600" /> Новости города
                </h1>
                {user && (
                    <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
                        <PenSquare className="w-4 h-4" /> Предложить
                    </Button>
                )}
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div> : (
                <div className="grid gap-6">
                    {news.map(n => (
                        <Link key={n.id} to={`/news/${n.id}`} className="block group">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow h-full md:h-48">
                                <div className="md:w-64 h-48 md:h-full relative shrink-0">
                                    <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">
                                        {n.category}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                                            {n.title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{n.content}</p>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400 mt-4">
                                        <Calendar className="w-3 h-3 mr-1" /> {n.date}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

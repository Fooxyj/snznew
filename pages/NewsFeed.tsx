
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { NewsItem, UserRole } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Calendar, Newspaper, PenSquare, Trash2, Filter, X } from 'lucide-react';
import { CreateNewsModal } from '../components/CreateNewsModal';
import { Button } from '../components/ui/Common';
import { CardSkeleton } from '../components/ui/Skeleton';

const formatDate = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Недавно';
        return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return 'Недавно';
    }
};

export const NewsFeed: React.FC = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    
    const categoryFilter = searchParams.get('cat');

    const { data: news = [], isLoading } = useQuery({
        queryKey: ['news'],
        queryFn: api.getNews
    });

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const handleNewsCreated = (newItem: NewsItem) => {
        queryClient.invalidateQueries({ queryKey: ['news'] });
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if(confirm("АДМИН: Удалить эту новость?")) {
            try {
                await api.deleteNews(id);
                queryClient.invalidateQueries({ queryKey: ['news'] });
            } catch(e: any) {
                alert(e.message);
            }
        }
    };

    const isAdmin = user?.role === UserRole.ADMIN;

    const filteredNews = categoryFilter 
        ? news.filter(n => n.category === categoryFilter)
        : news;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <CreateNewsModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={handleNewsCreated} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <Newspaper className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white leading-none">Новости</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {categoryFilter ? `Категория: ${categoryFilter}` : 'Все события города'}
                        </p>
                    </div>
                </div>
                {user && (
                    <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
                        <PenSquare className="w-4 h-4" /> Предложить
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

            {isLoading ? (
                <div className="grid gap-6">
                    {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredNews.length > 0 ? filteredNews.map(n => (
                        <Link key={n.id} to={`/news/${n.id}`} className="block group relative">
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
                                        <Calendar className="w-3 h-3 mr-1" /> {formatDate(n.date)}
                                    </div>
                                </div>
                            </div>
                            {isAdmin && (
                                <button 
                                    onClick={(e) => handleDelete(e, n.id)} 
                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Удалить новость"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </Link>
                    )) : (
                        <div className="text-center py-20 text-gray-400">
                            В этой категории пока нет новостей.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

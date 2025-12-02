import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Ad, User } from '../types';
import { Button, Badge } from '../components/ui/Common';
import { ChevronLeft, MapPin, Calendar, User as UserIcon, MessageCircle, Heart, Share2, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export const AdDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ad, setAd] = useState<Ad | null>(null);
    const [seller, setSeller] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const data = await api.getAdById(id);
                setAd(data);
                
                const user = await api.getCurrentUser();
                if (user) {
                    setCurrentUserId(user.id);
                    const content = await api.getUserContent(user.id);
                    if (content.favorites && content.favorites.find(f => f.id === id)) {
                        setIsFav(true);
                    }
                }

                if (data && data.authorId) {
                    const sellerProfile = await api.getUserById(data.authorId);
                    setSeller(sellerProfile);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleWrite = async () => {
        if (!ad) return;
        try {
            const chatId = await api.startChat(ad.authorId);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleFav = async () => {
        if (!ad) return;
        try {
            await api.toggleFavorite(ad.id, 'ad');
            setIsFav(!isFav);
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!ad) return <div className="p-10 text-center">Объявление не найдено</div>;

    const isMine = currentUserId === ad.authorId;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Назад
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative border dark:border-gray-700 shadow-sm">
                        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                        {ad.isVip && (
                            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1.5 backdrop-blur-sm bg-opacity-90">
                                <Sparkles className="w-3.5 h-3.5" /> VIP Объявление
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{ad.date}</span>
                            <Badge color="gray">{ad.category}</Badge>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">{ad.title}</h1>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{ad.price.toLocaleString()} {ad.currency}</div>
                    </div>

                    {/* Seller Card */}
                    <div className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <img 
                            src={seller?.avatar || 'https://ui-avatars.com/api/?name=User'} 
                            className="w-14 h-14 rounded-full object-cover bg-gray-200 border-2 border-white dark:border-gray-600 shadow-sm" 
                            alt="" 
                        />
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide font-semibold">Продавец</div>
                            <div className="font-bold text-gray-900 dark:text-white text-lg leading-none mb-1">
                                {seller?.name || `Пользователь #${ad.authorId.slice(0, 5)}`}
                            </div>
                            {isMine ? (
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">Это вы</span>
                            ) : (
                                <div className="text-xs text-gray-400">На сайте с 2024</div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {!isMine ? (
                            <Button size="lg" className="w-full flex items-center justify-center gap-2 py-3.5 shadow-lg shadow-blue-100 dark:shadow-none" onClick={handleWrite}>
                                <MessageCircle className="w-5 h-5" /> Написать продавцу
                            </Button>
                        ) : (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl text-center font-medium flex items-center justify-center gap-2 border border-blue-100 dark:border-blue-900">
                                <AlertCircle className="w-5 h-5" /> Вы автор этого объявления
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={handleFav}
                                className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${isFav ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} /> {isFav ? 'В избранном' : 'В избранное'}
                            </button>
                            <button className="flex-1 py-3 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-all">
                                <Share2 className="w-5 h-5" /> Поделиться
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 dark:text-white border-b dark:border-gray-700 pb-2">Описание</h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base">{ad.description}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 dark:text-white border-b dark:border-gray-700 pb-2">Местоположение</h3>
                        <div className="flex items-center text-gray-700 dark:text-gray-300 mb-4 font-medium">
                            <MapPin className="w-5 h-5 mr-2 text-red-500" />
                            {ad.location}
                        </div>
                        {/* Placeholder Map */}
                        <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl w-full flex items-center justify-center text-gray-400 text-sm border dark:border-gray-600 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/img/osm-intl,13,56.08,60.73,300x200.png')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all"></div>
                            <span className="relative z-10 bg-white/80 dark:bg-black/50 px-3 py-1 rounded backdrop-blur">Карта загружается...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
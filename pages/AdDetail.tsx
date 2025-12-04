
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Ad, User } from '../types';
import { Button, Badge, LocationBadge } from '../components/ui/Common';
import { Loader2, ChevronLeft, Heart, MessageCircle, Share2, MapPin, Calendar, User as UserIcon } from 'lucide-react';

export const AdDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFav, setIsFav] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            const data = await api.getAdById(id);
            setAd(data);
            
            const user = await api.getCurrentUser();
            setCurrentUser(user);
            if (user && user.favorites.includes(id)) setIsFav(true);
            
            setLoading(false);
        };
        load();
    }, [id]);

    const handleWrite = async () => {
        if (!ad) return;
        if (!currentUser) return navigate('/auth');
        try {
            // Create a structured payload for the chat
            const payload = JSON.stringify({
                type: 'ad_inquiry',
                adId: ad.id,
                title: ad.title,
                price: `${ad.price.toLocaleString()} ${ad.currency}`,
                image: ad.image,
                text: "Здравствуйте! Меня интересует это объявление."
            });
            
            const chatId = await api.startChat(ad.authorId, payload);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const toggleFav = async () => {
        if (!ad) return;
        if (!currentUser) return navigate('/auth');
        try {
            await api.toggleFavorite(ad.id, 'ad');
            setIsFav(!isFav);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleShare = () => {
        if (navigator.share && ad) {
            navigator.share({
                title: ad.title,
                text: `Посмотри это объявление: ${ad.title}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Ссылка скопирована!");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!ad) return <div className="p-10 text-center text-gray-500">Объявление не найдено</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4">
                <ChevronLeft className="w-4 h-4 mr-1" /> Назад
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery (Single Image for now) */}
                <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 h-[300px] md:h-[400px] relative group">
                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                    {ad.isVip && (
                        <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-lg shadow-lg font-bold text-sm">
                            VIP
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-gray-500 text-sm">{ad.date}</div>
                        <div className="flex gap-2">
                            <button onClick={toggleFav} className={`p-2 rounded-full transition-colors ${isFav ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                            </button>
                            <button onClick={handleShare} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{ad.title}</h1>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">{ad.price.toLocaleString()} {ad.currency}</div>

                    <div className="flex flex-col gap-3 mb-8">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>{ad.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                            <Badge color="gray">{ad.category}</Badge>
                        </div>
                    </div>

                    <div className="mt-auto">
                        {currentUser?.id !== ad.authorId ? (
                            <Button className="w-full py-4 text-lg shadow-lg shadow-blue-200 dark:shadow-none bg-blue-600 hover:bg-blue-700 text-white" onClick={handleWrite}>
                                <MessageCircle className="w-5 h-5 mr-2" /> Написать продавцу
                            </Button>
                        ) : (
                            <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-xl">Это ваше объявление</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-10 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 lg:p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Описание</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{ad.description}</p>
            </div>

            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {ad.authorAvatar ? (
                        <img src={ad.authorAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-500" />
                        </div>
                    )}
                    <div>
                        <div className="text-sm text-gray-500">Продавец</div>
                        <div className="font-bold dark:text-white text-lg">{ad.authorName}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

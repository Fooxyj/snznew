
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Ad, User } from '../types';
import { Button, Badge } from '../components/ui/Common';
import { Img } from '../components/ui/Image';
import { ImageViewer } from '../components/ImageViewer';
import { Loader2, ChevronLeft, Heart, MessageCircle, Share2, MapPin, ChevronRight, User as UserIcon, AlertTriangle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { NotFound } from './NotFound';
import { ReportModal } from '../components/ReportModal';

export const AdDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Gallery State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    
    // Reporting
    const [isReportOpen, setIsReportOpen] = useState(false);

    // Queries
    const { data: ad, isLoading: adLoading } = useQuery({
        queryKey: ['ad', id],
        queryFn: () => api.getAdById(id!),
        enabled: !!id
    });

    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const isFav = currentUser?.favorites?.includes(id!) || false;

    const handleWrite = async () => {
        if (!ad) return;
        if (!currentUser) return navigate('/auth');
        try {
            const payload = JSON.stringify({
                type: 'ad_inquiry',
                adId: ad.id,
                title: ad.title,
                price: `${ad.price.toLocaleString()} ${ad.currency}`,
                image: ad.image,
                description: ad.description,
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
            // Invalidate user query to update favorites list
            // Note: This relies on parent queryClient provider
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

    const handleReport = () => {
        if (!currentUser) {
            if(confirm("Войдите, чтобы отправить жалобу. Перейти?")) navigate('/auth');
            return;
        }
        setIsReportOpen(true);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ad && ad.images && currentImageIndex < ad.images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    if (adLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!ad) return <NotFound />;

    const images = ad.images && ad.images.length > 0 ? ad.images : [ad.image];

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <SEO title={ad.title} description={`${ad.title} - ${ad.price} ${ad.currency}. ${ad.description.substring(0, 100)}`} />
            
            <ImageViewer 
                isOpen={isViewerOpen} 
                onClose={() => setIsViewerOpen(false)} 
                src={images[currentImageIndex]} 
                alt={ad.title} 
            />

            <ReportModal 
                isOpen={isReportOpen} 
                onClose={() => setIsReportOpen(false)} 
                targetId={ad.id} 
                targetType="ad" 
            />

            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Назад
                </button>
                <button onClick={handleReport} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors" title="Пожаловаться">
                    <AlertTriangle className="w-3.5 h-3.5" /> Пожаловаться
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div 
                    className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 h-[350px] md:h-[450px] relative group select-none cursor-zoom-in"
                    onClick={() => setIsViewerOpen(true)}
                >
                    <Img 
                        src={images[currentImageIndex]} 
                        alt={ad.title} 
                        className="w-full h-full object-cover" 
                        containerClassName="w-full h-full"
                    />
                    
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button 
                                onClick={prevImage}
                                disabled={currentImageIndex === 0}
                                className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all ${currentImageIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={nextImage}
                                disabled={currentImageIndex === images.length - 1}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all ${currentImageIndex === images.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            
                            {/* Pagination Dots */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                {images.map((_, idx) => (
                                    <div 
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {ad.isVip && (
                        <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-lg shadow-lg font-bold text-sm z-10">
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

            <div 
                className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => navigate(`/user/${ad.authorId}`)}
            >
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
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
        </div>
    );
};


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Ad, User } from '../types';
import { Button, Badge, UserStatus } from '../components/ui/Common';
import { Img } from '../components/ui/Image';
import { ImageViewer } from '../components/ImageViewer';
import { Loader2, ChevronLeft, Heart, MessageCircle, Share2, MapPin, ChevronRight, User as UserIcon, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { SEO } from '../components/SEO';
import { NotFound } from './NotFound';
import { ReportModal } from '../components/ReportModal';

export const AdDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

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
        if (!ad || !currentUser) return navigate('/auth');
        try {
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
        if (ad && currentUser) await api.toggleFavorite(ad.id, 'ad'); 
    };

    const handleBack = () => {
        if (window.history.length <= 1) {
            navigate('/classifieds');
        } else {
            navigate(-1);
        }
    };

    if (adLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!ad) return <NotFound />;

    const images = ad.images && ad.images.length > 0 ? ad.images : [ad.image];
    const isPaid = ad.isVip || ad.isPremium;

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8 pb-24">
            <SEO title={ad.title} />
            <ImageViewer isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} src={images[currentImageIndex]} alt={ad.title} />
            <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} targetId={ad.id} targetType="ad" />

            <div className="flex justify-between items-center mb-6">
                <button onClick={handleBack} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl shadow-sm border dark:border-gray-700 font-medium text-sm">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Назад
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="rounded-3xl overflow-hidden bg-white dark:bg-gray-950 border dark:border-gray-700 relative group cursor-zoom-in shadow-xl" onClick={() => setIsViewerOpen(true)}>
                        <img 
                            src={images[currentImageIndex]} 
                            alt={ad.title} 
                            className="w-full h-auto max-h-[70vh] object-contain block mx-auto" 
                        />
                        
                        {/* Маркировка рекламы */}
                        {isPaid && (
                            <div className="absolute top-4 right-4 z-20">
                                <div className="relative group/legal">
                                    <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[7px] text-white/80 font-bold uppercase tracking-widest flex items-center gap-1.5 border border-white/10 hover:bg-black/60 transition-colors cursor-help">
                                        <span>Реклама</span>
                                        <Info className="w-2.5 h-2.5" />
                                    </div>
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-2xl border dark:border-gray-700 opacity-0 invisible group-hover/legal:opacity-100 group-hover/legal:visible transition-all z-50 text-gray-900 dark:text-gray-100 normal-case tracking-normal">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-1.5 border-b dark:border-gray-700 pb-1.5 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3 text-blue-500" /> Рекламодатель
                                        </p>
                                        <p className="text-[11px] font-bold leading-tight mb-2">
                                            {ad.advertiser_info || 'Частное лицо'}
                                        </p>
                                        <p className="text-blue-500 dark:text-blue-400 font-mono text-[8px] break-all bg-gray-50 dark:bg-gray-900 p-1.5 rounded uppercase">
                                            erid: {ad.erid || 'not_specified'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {images.length > 1 && (
                            <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
                                {images.map((_, idx) => (
                                    <div key={idx} className={`w-2 h-2 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-blue-600 w-6' : 'bg-white/50'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all shadow-sm ${idx === currentImageIndex ? 'border-blue-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 border dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">{ad.date}</div>
                            <button onClick={toggleFav} className={`p-2.5 rounded-full transition-all shadow-md ${isFav ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                        
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{ad.title}</h1>
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-8">{ad.price.toLocaleString()} {ad.currency}</div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                                <div className="p-2 bg-white dark:bg-gray-600 rounded-xl shadow-sm text-blue-500"><MapPin className="w-5 h-5" /></div>
                                <span className="font-medium">{ad.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge color="gray" className="px-4 py-1.5 text-sm">{ad.category}</Badge>
                            </div>
                        </div>

                        <Button className="w-full py-4 text-lg font-bold shadow-xl shadow-blue-500/20 bg-blue-600 text-white rounded-2xl hover:scale-[1.02] transition-transform active:scale-[0.98]" onClick={handleWrite}>
                            <MessageCircle className="w-5 h-5 mr-2" /> Написать продавцу
                        </Button>
                    </div>

                    <Link 
                        to={`/user/${ad.authorId}`} 
                        className="bg-white dark:bg-gray-800 rounded-3xl p-5 border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
                    >
                        <div className="relative">
                            <img 
                                src={ad.authorAvatar} 
                                alt={ad.authorName} 
                                className="w-14 h-14 rounded-2xl object-cover bg-gray-100" 
                            />
                            <UserStatus lastSeen={ad.authorLastSeen} showText={false} className="absolute -bottom-1 -right-1 border-2 border-white dark:border-gray-800 rounded-full bg-white dark:bg-gray-800" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-0.5">
                                <UserStatus lastSeen={ad.authorLastSeen} />
                            </div>
                            <div className="font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                                {ad.authorName}
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>

                    <button onClick={() => setIsReportOpen(true)} className="text-xs text-gray-400 hover:text-red-500 flex items-center justify-center gap-1 w-full transition-colors">
                        <AlertTriangle className="w-3 h-3" /> Пожаловаться на объявление
                    </button>
                </div>
            </div>

            <div className="mt-10 bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 p-8 shadow-sm">
                <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tight">Описание</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">{ad.description}</p>
            </div>
        </div>
    );
};

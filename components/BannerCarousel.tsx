
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Banner } from '../types';
import { ChevronLeft, ChevronRight, Loader2, ExternalLink } from 'lucide-react';
import { Badge } from './ui/Common';

interface BannerCarouselProps {
    position?: 'home_top' | 'home_mid' | 'sidebar' | 'footer' | 'news_inline';
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ position = 'home_top' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { data: banners = [], isLoading } = useQuery({
        queryKey: ['banners', position],
        queryFn: () => api.getBanners(position)
    });

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % banners.length);
        }, 8000); 
        return () => clearInterval(interval);
    }, [banners.length]);

    if (isLoading) return (
        <div className="w-full aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1] bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Загрузка города...</span>
            </div>
        </div>
    );
    
    if (banners.length === 0) return null;

    const next = () => setCurrentIndex(prev => (prev + 1) % banners.length);
    const prev = () => setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1));

    const activeBanner = banners[currentIndex];
    const isTop = position === 'home_top';

    return (
        <div className={`relative group w-full ${isTop ? 'aspect-[2/1] md:aspect-[3/1] lg:aspect-[21/7]' : 'aspect-[3/1]'} rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-800 border dark:border-gray-700`}>
            <a 
                href={activeBanner.link_url || '#'} 
                target={activeBanner.link_url?.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block w-full h-full relative"
            >
                <img 
                    key={activeBanner.id}
                    src={activeBanner.image_url} 
                    alt={activeBanner.title || "Banner"} 
                    className="w-full h-full object-cover animate-fade-in transition-transform duration-[4000ms] group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-6 lg:p-10">
                    <div className="animate-in slide-in-from-bottom-6 duration-1000 max-w-2xl">
                        <Badge color="blue" className="mb-3 bg-blue-600 text-white border-none px-3 py-1 rounded-full font-black uppercase text-[8px] tracking-widest shadow-xl">Рекламный проект</Badge>
                        {activeBanner.title && (
                            <h2 className="text-white font-black text-xl md:text-3xl lg:text-4xl drop-shadow-2xl leading-tight tracking-tighter">
                                {activeBanner.title}
                            </h2>
                        )}
                        <div className="mt-4 flex items-center gap-3 text-white/70 text-[10px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                Подробнее <ChevronRight className="w-3 h-3" />
                            </span>
                            {activeBanner.link_url && <ExternalLink className="w-3 h-3 opacity-50" />}
                        </div>
                    </div>
                </div>
            </a>

            {banners.length > 1 && (
                <>
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }} 
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/20 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all transform -translate-x-4 group-hover:translate-x-0 shadow-2xl"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }} 
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/20 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 shadow-2xl"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    <div className="absolute bottom-6 left-8 right-8 z-30 flex gap-2 pointer-events-none">
                        {banners.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-700 ${idx === currentIndex ? 'w-12 bg-white shadow-lg shadow-white/50' : 'w-2 bg-white/20'}`} 
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

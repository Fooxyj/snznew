
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Badge } from './ui/Common';
import { ChevronRight } from 'lucide-react';

interface BannerSlotProps {
    position: string;
    className?: string;
}

export const BannerSlot: React.FC<BannerSlotProps> = ({ position, className = "" }) => {
    const { data: allBanners = [], isLoading } = useQuery({
        queryKey: ['banners_all'],
        queryFn: () => api.getBanners()
    });

    if (isLoading) return <div className="w-full aspect-[3/1] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />;

    let validBanners = allBanners.filter(b => b.position === position && b.is_active);
    
    if (validBanners.length === 0) {
        validBanners = allBanners.filter(b => b.position === 'home_top' && b.is_active);
    }

    if (validBanners.length === 0) return null;

    const banner = validBanners[0];
    const isHero = position.includes('top') || position.includes('mid');

    return (
        <a 
            href={banner.link_url || '#'} 
            target={banner.link_url?.startsWith('http') ? '_blank' : '_self'}
            className={`block w-full overflow-hidden shadow-sm relative group transition-all duration-300 ${isHero ? 'aspect-[2/1] md:aspect-[3/1] lg:aspect-[21/6]' : 'aspect-[4/1]'} rounded-xl border dark:border-gray-800 ${className}`}
        >
            <img 
                src={banner.image_url} 
                className="w-full h-full object-cover transition-transform duration-[6000ms] group-hover:scale-[1.02]" 
                alt="" 
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-6 lg:p-8`}>
                <div className="max-w-3xl text-left">
                    <Badge color="blue" className="mb-2 bg-blue-600 text-white border-none px-2 py-0.5 rounded font-black uppercase text-[8px] tracking-[0.1em] shadow-lg">
                        Партнерский проект
                    </Badge>
                    {banner.title && (
                        <h2 className={`text-white font-black drop-shadow-lg leading-tight tracking-tighter not-italic ${isHero ? 'text-xl md:text-2xl lg:text-3xl' : 'text-lg md:text-xl'}`}>
                            {banner.title}
                        </h2>
                    )}
                </div>
            </div>
        </a>
    );
};

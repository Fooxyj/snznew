
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Badge } from './ui/Common';
import { Info } from 'lucide-react';

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

    const validBanners = allBanners.filter(b => b.position === position && b.is_active);
    if (validBanners.length === 0) return null;

    const banner = validBanners[0];
    const isHero = position.includes('top') || position.includes('mid');

    return (
        <div className={`relative group ${className}`}>
            <a 
                href={banner.link_url || '#'} 
                target={banner.link_url?.startsWith('http') ? '_blank' : '_self'}
                className={`block w-full overflow-hidden shadow-sm relative transition-all duration-300 ${isHero ? 'aspect-[2/1] md:aspect-[3/1] lg:aspect-[21/6]' : 'aspect-[4/1]'} rounded-xl border dark:border-gray-800`}
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
            
            {/* Юридическая маркировка (Floating) */}
            <div className="absolute top-2 right-2 z-10 opacity-60 hover:opacity-100 transition-opacity">
                <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[7px] text-white/80 font-bold uppercase tracking-widest flex items-center gap-1.5 border border-white/10 group/legal">
                    <span>Реклама</span>
                    <Info className="w-2 h-2" />
                    
                    {/* Tooltip с данными рекламодателя */}
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl border dark:border-gray-700 hidden group-hover/legal:block text-gray-900 dark:text-gray-100 normal-case tracking-normal">
                        <p className="font-bold border-b dark:border-gray-700 pb-1 mb-1">Информация о рекламе</p>
                        <p className="mb-1 leading-tight">{banner.advertiser_info || 'Владелец портала'}</p>
                        <p className="text-blue-500 font-mono text-[9px] break-all">erid: {banner.erid || 'not_required_internal'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

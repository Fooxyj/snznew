
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Badge } from './ui/Common';
import { Info, ShieldCheck } from 'lucide-react';

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

    // Исправленная логика: ищем точное совпадение ИЛИ если запрашивается конкретная страница (home_top_p1), 
    // но в базе есть только общий баннер (home_top), показываем его.
    const validBanners = allBanners.filter(b => {
        if (!b.is_active) return false;
        if (b.position === position) return true;
        if (position.startsWith('home_top') && b.position === 'home_top') return true;
        if (position.startsWith('home_mid') && b.position === 'home_mid') return true;
        return false;
    });

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
            
            {/* Юридическая маркировка */}
            <div className="absolute top-4 right-4 z-20">
                <div className="relative group/legal">
                    <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[7px] text-white/80 font-bold uppercase tracking-widest flex items-center gap-1.5 border border-white/10 hover:bg-black/60 transition-colors cursor-help">
                        <span>Реклама</span>
                        <Info className="w-2 h-2" />
                    </div>
                    
                    {/* Tooltip с данными рекламодателя (erid и инфо) */}
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-2xl border dark:border-gray-700 opacity-0 invisible group-hover/legal:opacity-100 group-hover/legal:visible transition-all z-50 text-gray-900 dark:text-gray-100 normal-case tracking-normal">
                        <p className="text-[9px] font-black uppercase text-gray-400 mb-1.5 border-b dark:border-gray-700 pb-1.5 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-blue-500" /> Рекламодатель
                        </p>
                        <p className="text-[11px] font-bold leading-tight mb-2">
                            {banner.advertiser_info || 'Администрация платформы ПРОСТОР'}
                        </p>
                        <p className="text-blue-500 dark:text-blue-400 font-mono text-[8px] break-all bg-gray-50 dark:bg-gray-900 p-1.5 rounded uppercase">
                            erid: {banner.erid || 'not_required_internal'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


import React from 'react';
import { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
  variant?: 'standard' | 'premium' | 'rental';
  onShow?: (ad: Ad) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, variant = 'standard', onShow, isFavorite, onToggleFavorite }) => {
  const isPremium = variant === 'premium' || ad.isPremium;

  // Calculate rating
  const rating = ad.reviews && ad.reviews.length > 0 
    ? (ad.reviews.reduce((acc, r) => acc + r.rating, 0) / ad.reviews.length).toFixed(1) 
    : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onToggleFavorite) {
          onToggleFavorite(ad.id);
      }
  };

  return (
    <div className={`group relative bg-surface rounded-2xl flex flex-col h-full overflow-hidden transition-all duration-300
      ${isPremium 
        ? 'border-2 border-yellow-400 shadow-[0_4px_20px_-5px_rgba(250,204,21,0.4)] hover:shadow-[0_8px_30px_-5px_rgba(250,204,21,0.6)] hover:-translate-y-1 z-10 ring-1 ring-yellow-400/50' 
        : 'border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20'
      }`}>
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => onShow && onShow(ad)}>
        <img 
          src={ad.image} 
          alt={ad.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges on Image - ONLY for VIP (and only VIP badge) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
          {isPremium && (
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md flex items-center gap-1 border border-yellow-300 animate-pulse-slow">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              VIP
            </span>
          )}
        </div>

        {/* Action Buttons (Top Right) */}
        {/* Opacity-0 on LG screens, appearing on Hover. Always visible on mobile */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            {/* Favorite Button */}
            <button 
            onClick={handleFavoriteClick}
            className={`p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:shadow-md transition-all duration-300
                ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
            `}
            title="В избранное"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            </button>
        </div>

        <div className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-dark shadow-sm">
          {ad.date}
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 flex flex-col flex-grow relative ${isPremium ? 'bg-gradient-to-b from-yellow-50/50 via-white to-white' : ''}`}>
        
        {/* Badges in Content Area - FOR ALL ADS */}
        <div className="flex flex-wrap gap-2 mb-3">
            {ad.bookingAvailable && (
              <span className="bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
                <svg className="w-3 h-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Бронь
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border
              ${ad.category === 'sale' ? 'bg-green-50 text-green-700 border-green-100' : 
                ad.category === 'rent' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                ad.category === 'services' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {ad.category === 'rent' ? 'Аренда' : ad.category === 'sale' ? 'Продажа' : ad.category === 'services' ? 'Услуги' : 'Работа'}
            </span>
        </div>

        <div className="flex justify-between items-start mb-2">
          <h3 
            onClick={() => onShow && onShow(ad)}
            className="font-bold text-lg text-dark leading-snug group-hover:text-primary transition-colors line-clamp-2 cursor-pointer"
          >
            {ad.title}
          </h3>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <span className="text-xl font-extrabold text-primary">
            {ad.price > 0 ? `${ad.price.toLocaleString('ru-RU')} ₽` : 'Договорная'}
          </span>
          {rating && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
               <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
               <span className="text-xs font-bold text-dark">{rating}</span>
               <span className="text-[10px] text-gray-400">({ad.reviews?.length})</span>
            </div>
          )}
        </div>

        <p className="text-secondary text-sm leading-relaxed line-clamp-2 mb-4 break-words">
          {ad.description}
        </p>
        
        {/* Specs Badges (New) */}
        {ad.specs && (
           <div className="flex flex-wrap gap-1.5 mb-3 text-[10px] text-gray-500 font-medium">
             {ad.specs.year && <span className="bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{ad.specs.year} г.</span>}
             {ad.specs.mileage && <span className="bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{(ad.specs.mileage / 1000).toFixed(0)}т. км</span>}
             {ad.specs.rooms && <span className="bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{ad.specs.rooms} комн.</span>}
             {ad.specs.area && <span className="bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{ad.specs.area} м²</span>}
             {ad.specs.condition && <span className="bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{ad.specs.condition === 'new' ? 'Новое' : 'Б/У'}</span>}
             {ad.specs.brand && <span className="bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{ad.specs.brand}</span>}
           </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="flex items-center text-xs text-secondary font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-[120px]">{ad.location}</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShow && onShow(ad);
            }}
            className={`text-xs font-bold py-2 px-3 rounded-lg transition-colors
              ${isPremium ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-md' : 'bg-gray-100 hover:bg-dark hover:text-white text-dark'}
            `}
          >
            Показать
          </button>
        </div>
      </div>
    </div>
  );
};

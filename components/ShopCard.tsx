import React from 'react';
import { Shop } from '../types';

interface ShopCardProps {
  shop: Shop;
  onClick: (shop: Shop) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onClick }) => {
  return (
    <div 
      onClick={() => onClick(shop)}
      className="group bg-surface rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* Cover Image */}
      <div className="h-32 relative overflow-hidden">
        <img 
          src={shop.coverImage} 
          alt={shop.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="px-5 pb-5 pt-0 flex-grow flex flex-col relative">
        {/* Logo overlapping the cover */}
        <div className="flex justify-between items-end -mt-8 mb-3">
            <div className="w-16 h-16 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
                <img src={shop.logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 mb-1">
                <span className="text-yellow-500 font-bold">★</span>
                <span className="text-sm font-bold text-dark">{shop.rating}</span>
            </div>
        </div>

        <h3 className="font-bold text-lg text-dark leading-tight mb-1 group-hover:text-primary transition-colors">
            {shop.name}
        </h3>
        <p className="text-xs text-secondary mb-3 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {shop.address}
        </p>

        {/* Product Preview Strip */}
        <div className="mt-auto pt-3 border-t border-gray-50">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Витрина</p>
            <div className="flex gap-2 overflow-hidden">
                {shop.products.slice(0, 4).map((product) => (
                    <div key={product.id} className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                ))}
                {shop.products.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xs text-secondary font-medium shrink-0">
                        +{shop.products.length - 4}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

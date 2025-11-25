
import React, { useEffect } from 'react';
import { Shop, Product } from '../types';

interface ShopPageProps {
  shop: Shop;
  onBack: () => void;
  variant?: 'shop' | 'cafe';
  onProductClick?: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ shop, onBack, variant = 'shop', onProductClick }) => {
  const isCafe = variant === 'cafe';

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on mount
  }, [shop]);

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Navigation */}
      <nav className="flex items-center gap-2 text-sm text-secondary mb-6">
        <button 
          onClick={onBack}
          className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {isCafe ? 'Все кафе' : 'Все магазины'}
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-dark font-medium">{shop.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-md">
        <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex items-end gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden shrink-0 relative top-4">
                <img src={shop.logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-white pb-2 flex-grow">
                <h1 className="text-3xl md:text-5xl font-bold mb-2 shadow-black drop-shadow-md">{shop.name}</h1>
                <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                        <span className="text-yellow-400">★</span> {shop.rating}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {shop.workingHours}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar: Info */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                  <h3 className="font-bold text-dark text-lg mb-4 border-b border-gray-100 pb-2">Информация</h3>
                  
                  <div className="space-y-4 text-sm">
                      <div>
                          <p className="text-gray-400 text-xs mb-1">Адрес</p>
                          <p className="font-medium text-dark">{shop.address}</p>
                      </div>
                      <div>
                          <p className="text-gray-400 text-xs mb-1">Телефон</p>
                          <a href={`tel:${shop.phone}`} className="font-medium text-primary hover:underline">{shop.phone}</a>
                      </div>
                      <div>
                          <p className="text-gray-400 text-xs mb-1">О {isCafe ? 'заведении' : 'компании'}</p>
                          <p className="text-secondary leading-relaxed">{shop.description}</p>
                      </div>
                  </div>

                  <button className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-dark font-bold py-3 rounded-xl transition-colors text-sm">
                      {isCafe ? 'Забронировать столик' : 'Написать сообщение'}
                  </button>
              </div>
          </div>

          {/* Right Content: Products */}
          <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
                  {isCafe ? 'Меню' : 'Витрина товаров'}
                  <span className="bg-gray-100 text-secondary text-sm font-normal px-2 py-1 rounded-lg">{shop.products.length}</span>
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                  {shop.products.map(product => (
                      <div 
                        key={product.id} 
                        onClick={() => onProductClick && onProductClick(product)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                      >
                          <div className="aspect-square relative overflow-hidden bg-gray-50">
                              <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                              </div>
                          </div>
                          <div className="p-4">
                              <h3 className="font-medium text-dark line-clamp-2 mb-2 min-h-[40px] leading-snug">{product.title}</h3>
                              <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-primary">{product.price.toLocaleString('ru-RU')} ₽</span>
                                  <button className="w-8 h-8 rounded-full bg-gray-100 text-dark flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

      </div>
    </div>
  );
};

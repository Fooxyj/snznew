
import React, { useEffect, useRef } from 'react';
import { Ad, Shop, NewsItem, Movie, Product } from '../types';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
  // Data props
  ads: Ad[];
  shops: Shop[];
  news: NewsItem[];
  movies: Movie[];
  // Handlers
  onSelectAd: (ad: Ad) => void;
  onSelectShop: (shop: Shop) => void;
  onSelectNews: (news: NewsItem) => void;
  onSelectMovie: (movie: Movie) => void;
  onSelectProduct: (product: Product, shop: Shop) => void;
}

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({ 
    isOpen, onClose, value, onChange,
    ads, shops, news, movies,
    onSelectAd, onSelectShop, onSelectNews, onSelectMovie, onSelectProduct
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- SEARCH LOGIC ---
  const q = value.toLowerCase().trim();

  // Keyword mapping for smarter search
  const isMedicine = q.includes('больниц') || q.includes('врач') || q.includes('аптек') || q.includes('лекарств');
  const isFood = q.includes('еда') || q.includes('кафе') || q.includes('пицц') || q.includes('суши');
  const isAuto = q.includes('авто') || q.includes('машин') || q.includes('колес');

  const foundAds = ads.filter(ad => 
      (ad.title.toLowerCase().includes(q) || ad.description.toLowerCase().includes(q) || (isAuto && ad.category === 'sale' && ad.subCategory === 'Автомобили')) &&
      (ad.status === 'approved')
  );

  const foundShops = shops.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.description.toLowerCase().includes(q) ||
      (isMedicine && s.id.includes('med')) || // Assuming med IDs start with med or category check
      (isFood && (s.id.includes('c') || s.description.toLowerCase().includes('ресторан')))
  );

  const foundNews = news.filter(n => 
      n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)
  );

  const foundMovies = movies.filter(m => 
      m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q)
  );

  // Search products inside shops
  const foundProducts: { product: Product, shop: Shop }[] = [];
  shops.forEach(shop => {
      shop.products.forEach(p => {
          if (p.title.toLowerCase().includes(q)) {
              foundProducts.push({ product: p, shop });
          }
      });
  });

  const hasResults = foundAds.length > 0 || foundShops.length > 0 || foundNews.length > 0 || foundMovies.length > 0 || foundProducts.length > 0;

  return (
    <div className="fixed inset-0 bg-background z-[100] animate-fade-in-up flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-grow relative">
           <input 
              ref={inputRef}
              type="text" 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Поиск (например: больница, суши...)" 
              className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-10 text-dark focus:ring-2 focus:ring-primary/20 outline-none"
           />
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
           {value && (
               <button 
                onClick={() => onChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-gray-200 rounded-full p-0.5 hover:text-dark"
               >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
           )}
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-grow overflow-y-auto bg-gray-50 p-4 custom-scrollbar">
          {!value ? (
              <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-3">Популярные запросы</p>
                    <div className="flex flex-wrap gap-2">
                        {['Больница', 'Такси', 'Суши', 'Квартира', 'Работа', 'Кино'].map(tag => (
                            <button 
                                key={tag}
                                onClick={() => onChange(tag)}
                                className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm text-dark hover:border-primary hover:text-primary transition-colors shadow-sm"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                  </div>
                  
                  {/* Quick Categories */}
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => onChange('Недвижимость')} className="p-3 bg-white rounded-xl shadow-sm text-left flex items-center gap-3">
                        <span className="text-xl">🏠</span>
                        <span className="text-sm font-bold">Недвижимость</span>
                     </button>
                     <button onClick={() => onChange('Авто')} className="p-3 bg-white rounded-xl shadow-sm text-left flex items-center gap-3">
                        <span className="text-xl">🚗</span>
                        <span className="text-sm font-bold">Авто</span>
                     </button>
                     <button onClick={() => onChange('Еда')} className="p-3 bg-white rounded-xl shadow-sm text-left flex items-center gap-3">
                        <span className="text-xl">🍕</span>
                        <span className="text-sm font-bold">Еда</span>
                     </button>
                     <button onClick={() => onChange('Услуги')} className="p-3 bg-white rounded-xl shadow-sm text-left flex items-center gap-3">
                        <span className="text-xl">🛠️</span>
                        <span className="text-sm font-bold">Услуги</span>
                     </button>
                  </div>
              </div>
          ) : !hasResults ? (
              <div className="text-center py-10 text-secondary">
                  <p className="text-lg font-medium text-dark">Ничего не найдено</p>
                  <p className="text-sm">Попробуйте изменить запрос</p>
              </div>
          ) : (
              <div className="space-y-6 pb-20">
                  
                  {/* Places */}
                  {foundShops.length > 0 && (
                      <div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Места и Заведения</h3>
                          <div className="space-y-3">
                              {foundShops.map(shop => (
                                  <div key={shop.id} onClick={() => { onSelectShop(shop); onClose(); }} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 active:scale-98 transition-transform">
                                      <img src={shop.logo} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                      <div>
                                          <h4 className="font-bold text-sm text-dark">{shop.name}</h4>
                                          <p className="text-xs text-secondary line-clamp-1">{shop.description}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Products */}
                  {foundProducts.length > 0 && (
                      <div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Товары</h3>
                          <div className="space-y-3">
                              {foundProducts.map(({product, shop}) => (
                                  <div key={product.id} onClick={() => { onSelectProduct(product, shop); onClose(); }} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 active:scale-98 transition-transform">
                                      <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                      <div className="flex-grow">
                                          <h4 className="font-bold text-sm text-dark">{product.title}</h4>
                                          <p className="text-xs text-secondary">{shop.name}</p>
                                      </div>
                                      <span className="text-sm font-bold text-primary whitespace-nowrap">{product.price} ₽</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Ads */}
                  {foundAds.length > 0 && (
                      <div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Объявления</h3>
                          <div className="space-y-3">
                              {foundAds.map(ad => (
                                  <div key={ad.id} onClick={() => { onSelectAd(ad); onClose(); }} className="bg-white p-3 rounded-xl shadow-sm flex gap-3 active:scale-98 transition-transform">
                                      <img src={ad.image} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" />
                                      <div className="flex-grow">
                                          <h4 className="font-bold text-sm text-dark line-clamp-1">{ad.title}</h4>
                                          <p className="text-primary font-bold text-xs mb-1">{ad.price > 0 ? `${ad.price} ₽` : 'Договорная'}</p>
                                          <p className="text-[10px] text-gray-400">{ad.date}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* News */}
                  {foundNews.length > 0 && (
                      <div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Новости</h3>
                          <div className="space-y-3">
                              {foundNews.map(item => (
                                  <div key={item.id} onClick={() => { onSelectNews(item); onClose(); }} className="bg-white p-3 rounded-xl shadow-sm active:scale-98 transition-transform">
                                      <h4 className="font-bold text-sm text-dark mb-1">{item.title}</h4>
                                      <p className="text-xs text-secondary line-clamp-2">{item.excerpt}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                   {/* Movies */}
                   {foundMovies.length > 0 && (
                      <div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Кино</h3>
                          <div className="space-y-3">
                              {foundMovies.map(movie => (
                                  <div key={movie.id} onClick={() => { onSelectMovie(movie); onClose(); }} className="bg-white p-3 rounded-xl shadow-sm flex gap-3 active:scale-98 transition-transform">
                                      <img src={movie.image} className="w-10 h-14 rounded object-cover bg-gray-100" />
                                      <div>
                                          <h4 className="font-bold text-sm text-dark">{movie.title}</h4>
                                          <p className="text-xs text-secondary">{movie.genre}</p>
                                          <p className="text-[10px] text-green-600 font-bold mt-1">{movie.showtimes[0]}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

              </div>
          )}
      </div>
    </div>
  );
};

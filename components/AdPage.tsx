
import React, { useState, useEffect } from 'react';
import { Ad, ChatSession } from '../types';
import { ReviewsModal } from './ReviewsModal';
import { BookingModal } from './BookingModal';
import { formatPhoneNumber, getLevelInfo } from '../utils';

interface AdPageProps {
  ad: Ad;
  onBack: () => void;
  onAddReview: (adId: string, rating: number, text: string) => void;
  onOpenChat: (session: ChatSession) => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  onOpenProfile?: (userId: string, userName: string) => void;
}

export const AdPage: React.FC<AdPageProps> = ({ ad, onBack, onAddReview, onOpenChat, isLoggedIn, onRequireLogin, onOpenProfile }) => {
  const [activeImage, setActiveImage] = useState(ad.image);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const images = ad.images && ad.images.length > 0 ? ad.images : [ad.image];
  const sellerLevel = ad.authorLevel || Math.floor(Math.random() * 4) + 1;
  const sellerLevelInfo = getLevelInfo(sellerLevel === 1 ? 50 : sellerLevel === 2 ? 150 : sellerLevel === 3 ? 400 : 800); 

  const getBadgeColor = (lvl: number) => {
      if (lvl <= 1) return 'bg-gray-400';
      if (lvl === 2) return 'bg-blue-500';
      if (lvl === 3) return 'bg-green-500';
      if (lvl === 4) return 'bg-purple-500';
      return 'bg-yellow-500';
  };

  useEffect(() => {
    setActiveImage(ad.image);
    window.scrollTo(0, 0);
  }, [ad]);

  const getDisplayPhone = () => {
      if (!isLoggedIn) return formatPhoneNumber(ad.contact).substring(0, 7) + ' ... .. ..';
      return formatPhoneNumber(ad.contact);
  };

  const handleContactClick = (e: React.MouseEvent, type: 'phone' | 'chat') => {
      e.preventDefault();
      if (!isLoggedIn) {
          onRequireLogin();
          return;
      }
      
      if (type === 'phone') {
           window.location.href = `tel:${ad.contact}`;
      } else {
          onOpenChat({
            adId: ad.id,
            adTitle: ad.title,
            category: ad.category,
            subCategory: ad.subCategory
        });
      }
  };

  const handleReviewClick = () => {
      if(!isLoggedIn) {
          onRequireLogin();
          return;
      }
      setIsReviewsModalOpen(true);
  };

  const handleBookingClick = () => {
      if (!isLoggedIn) {
          onRequireLogin();
          return;
      }
      setIsBookingModalOpen(true);
  };

  const handleProfileClick = () => {
      if (onOpenProfile && ad.userId && ad.authorName) {
          onOpenProfile(ad.userId, ad.authorName);
      }
  };

  const rating = ad.reviews && ad.reviews.length > 0 
    ? (ad.reviews.reduce((acc, r) => acc + r.rating, 0) / ad.reviews.length).toFixed(1) 
    : null;

  const handleShare = async () => {
    const safeUrl = 'https://snezhinsk-vestnik.ru/ad/' + ad.id;
    const shareData = {
        title: ad.title,
        text: `Посмотри это объявление: ${ad.title} за ${ad.price}₽`,
        url: safeUrl
    };

    try {
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
             await navigator.share(shareData);
        } else {
             throw new Error("Share API not supported");
        }
    } catch (err) {
       console.log("Share failed:", err);
       navigator.clipboard.writeText(`${ad.title} - ${ad.price}₽\n${safeUrl}`);
       alert('Ссылка скопирована!');
    }
  };

  // Shared Action Card Component
  const ActionCard = () => (
    <div className="bg-surface rounded-3xl p-6 shadow-lg border border-gray-100">
        
        <div className="mb-6 pb-6 border-b border-gray-100">
           <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-dark leading-tight mb-2 flex-grow">{ad.title}</h1>
              <button onClick={handleShare} className="p-2 -mt-1 -mr-2 text-gray-400 hover:text-primary transition-colors" title="Поделиться">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
           </div>
           
           <div className="flex justify-between items-center mt-2">
              <span className="text-3xl font-extrabold text-primary">
                {ad.price > 0 ? `${ad.price.toLocaleString('ru-RU')} ₽` : 'Договорная'}
              </span>
           </div>
           <div className="mt-4 flex gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-md text-secondary">
                 {ad.date}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-md text-secondary">
                 ID: {ad.id.slice(0, 8)}
              </span>
           </div>
        </div>

        <div className="space-y-4">
           {/* Seller Profile Card - NOW CLICKABLE */}
           <div 
                className="flex items-center gap-3 mb-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200" 
                onClick={handleProfileClick}
                title="Открыть профиль продавца"
           >
              <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden">
                    {ad.authorName ? ad.authorName.charAt(0).toUpperCase() : 'Ч'}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getBadgeColor(sellerLevel)} border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                      {sellerLevel}
                  </div>
              </div>
              <div className="flex-grow">
                 <div className="flex items-center gap-2">
                    <p className="text-xs text-secondary font-bold uppercase">Продавец</p>
                 </div>
                 <p className="font-bold text-dark text-lg leading-tight">{ad.authorName || 'Частное лицо'}</p>
                 {rating ? (
                    <div className="flex items-center gap-1 mt-1">
                       <span className="text-xs font-bold text-dark">★ {rating}</span>
                       <span className="text-xs text-secondary">({ad.reviews?.length} отзывов)</span>
                    </div>
                 ) : (
                    <span className="text-xs text-secondary mt-1 block">На сайте недавно</span>
                 )}
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
           </div>

           {ad.bookingAvailable && (
             <button 
               onClick={handleBookingClick}
               className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex flex-col items-center justify-center group relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="flex items-center gap-2 mb-1 relative z-10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="font-bold text-lg">Забронировать</span>
                </div>
                <span className="text-sm opacity-90 relative z-10">Онлайн без звонка</span>
             </button>
           )}

           <button 
             onClick={(e) => handleContactClick(e, 'phone')}
             className={`w-full text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center group
                ${isLoggedIn ? 'bg-primary shadow-primary/30 hover:bg-primary-dark' : 'bg-gray-800 shadow-gray-400/30 hover:bg-gray-900'}`}
           >
              <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span className="font-medium text-lg">{isLoggedIn ? 'Позвонить' : 'Показать номер'}</span>
              </div>
              <span className="text-xl font-bold tracking-wider">{getDisplayPhone()}</span>
           </button>
           
           <button 
             onClick={(e) => handleContactClick(e, 'chat')}
             className="w-full bg-gray-100 text-dark font-bold text-lg py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
           >
              <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Написать сообщение
           </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-secondary space-y-2">
           {!isLoggedIn && (
               <p className="flex items-start gap-2 text-primary font-bold">
                   <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Авторизуйтесь, чтобы видеть контакты
               </p>
           )}
           <p className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Не отправляйте предоплату, если не уверены в продавце.
           </p>
        </div>

    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-10">
      {/* Breadcrumb / Back Navigation */}
      <nav className="flex items-center gap-2 text-sm text-secondary mb-6">
        <button 
          onClick={onBack}
          className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7" /></svg>
          Назад к поиску
        </button>
        <span className="text-gray-300">/</span>
        <span className="capitalize">{ad.category === 'sale' ? 'Продажа' : ad.category === 'rent' ? 'Аренда' : ad.category === 'services' ? 'Услуги' : 'Работа'}</span>
        <span className="text-gray-300">/</span>
        <span className="text-dark truncate max-w-[200px]">{ad.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Images, Content */}
        <div className="lg:col-span-8 space-y-6">
           <div 
             className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative aspect-[4/3] group cursor-zoom-in"
             onClick={() => setIsLightboxOpen(true)}
           >
             <img src={activeImage} alt={ad.title} className="w-full h-full object-cover transition-opacity duration-300" />
             <div className="absolute top-4 left-4 flex gap-2">
                {ad.isPremium && (
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-lg border border-yellow-300 flex items-center gap-1 animate-pulse-slow">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    VIP Размещение
                  </span>
                )}
                {ad.bookingAvailable && (
                  <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-lg border border-violet-400 flex items-center gap-1">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Онлайн-бронь
                  </span>
                )}
             </div>
           </div>

           {/* Thumbnails Gallery */}
           {images.length > 1 && (
             <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                      ${activeImage === img ? 'border-primary shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
             </div>
           )}
           
           {/* Mobile Action Card */}
           <div className="lg:hidden">
              <ActionCard />
           </div>

            {/* Characteristics */}
            {ad.specs && Object.keys(ad.specs).length > 0 && (
                <div className="bg-surface rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-dark mb-6">Характеристики</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                        {ad.specs.year && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-secondary">Год выпуска</span>
                                <span className="font-bold text-dark">{ad.specs.year}</span>
                            </div>
                        )}
                         {ad.specs.mileage && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-secondary">Пробег</span>
                                <span className="font-bold text-dark">{ad.specs.mileage.toLocaleString()} км</span>
                            </div>
                        )}
                        {ad.specs.brand && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-secondary">Бренд</span>
                                <span className="font-bold text-dark">{ad.specs.brand}</span>
                            </div>
                        )}
                         {ad.specs.condition && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-secondary">Состояние</span>
                                <span className="font-bold text-dark">{ad.specs.condition === 'new' ? 'Новое' : 'Б/У'}</span>
                            </div>
                        )}
                        {ad.specs.rooms && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-secondary">Количество комнат</span>
                                <span className="font-bold text-dark">{ad.specs.rooms}</span>
                            </div>
                        )}
                         {ad.specs.area && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-secondary">Общая площадь</span>
                                <span className="font-bold text-dark">{ad.specs.area} м²</span>
                            </div>
                        )}
                        {ad.specs.floor && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-secondary">Этаж</span>
                                <span className="font-bold text-dark">{ad.specs.floor}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
           
           {/* Description Block */}
           <div className="bg-surface rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-dark mb-4">Описание</h2>
              <div className="prose prose-lg text-secondary max-w-none whitespace-pre-wrap leading-relaxed">
                {ad.description}
              </div>
           </div>

           {/* Location Block */}
           <div className="bg-surface rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-dark mb-4">Расположение</h2>
              <div className="flex items-center gap-2 text-dark font-medium text-lg mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {ad.location}, Снежинск
              </div>
              <div className="h-72 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 relative shadow-inner">
                  <iframe 
                    src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent('Снежинск, ' + ad.location)}&z=15`}
                    width="100%" 
                    height="100%" 
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                    title="Расположение на карте"
                  />
                  <a 
                    href={`https://yandex.ru/maps/?text=${encodeURIComponent('Снежинск, ' + ad.location)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-white text-dark transition-colors z-10 flex items-center gap-2"
                  >
                    Открыть в Яндекс.Картах
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
              </div>
           </div>
        </div>

        {/* Right Column: Price & Actions (Desktop only) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
           <div className="sticky top-24">
              <ActionCard />
           </div>
        </div>

        <ReviewsModal
          isOpen={isReviewsModalOpen}
          onClose={() => setIsReviewsModalOpen(false)}
          sellerName={ad.authorName || 'Частное лицо'}
          reviews={ad.reviews || []}
          onAddReview={(r, t) => onAddReview(ad.id, r, t)}
        />

        <BookingModal
           isOpen={isBookingModalOpen}
           onClose={() => setIsBookingModalOpen(false)}
           ad={ad}
        />

        {/* Lightbox / Full Image Viewer */}
        {isLightboxOpen && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in-up" onClick={() => setIsLightboxOpen(false)}>
                <button 
                    onClick={() => setIsLightboxOpen(false)} 
                    className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <img 
                    src={activeImage} 
                    alt="Full View" 
                    className="max-h-screen max-w-screen object-contain p-4"
                    onClick={(e) => e.stopPropagation()}
                />

                {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 p-4 overflow-x-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
                        {images.map((img, idx) => (
                            <img 
                                key={idx}
                                src={img}
                                alt={`Thumbnail ${idx}`}
                                onClick={() => setActiveImage(img)}
                                className={`h-16 w-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${activeImage === img ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

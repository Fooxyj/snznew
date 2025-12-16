
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CATEGORIES } from '../constants';
import { Button, Rating, formatAddress, formatPhone } from '../components/ui/Common';
import { MapPin, Phone, Clock, Map as MapIcon, List, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { YandexMap } from '../components/YandexMap';
import { BusinessCardSkeleton } from '../components/ui/Skeleton';

export const BusinessDirectory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showMap, setShowMap] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const navigate = useNavigate();
  
  // Set random seed on mount to randomize list order
  useEffect(() => {
      setShuffleSeed(Math.random());
  }, []);

  const categoryLabel = CATEGORIES.find(c => c.id === id)?.label || 'Каталог организаций';

  const { data: businesses = [], isLoading } = useQuery({
      queryKey: ['businesses', id],
      queryFn: () => api.getBusinesses(id)
  });

  // Randomize businesses list based on seed
  const displayedBusinesses = useMemo(() => {
      const shuffle = (array: typeof businesses) => {
          const newArr = [...array];
          for (let i = newArr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
          }
          return newArr;
      };
      return shuffle(businesses);
  }, [businesses, shuffleSeed]);

  const mapMarkers = displayedBusinesses.map(b => ({
      lat: b.lat,
      lng: b.lng,
      title: b.name,
      onClick: () => navigate(`/business/${b.id}`)
  }));

  const handleCall = (e: React.MouseEvent, phone: string) => {
      e.stopPropagation();
      window.location.href = `tel:${phone}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{categoryLabel}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
             {isLoading ? 'Загрузка...' : `Найдено ${businesses.length} организаций`}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowMap(!showMap)} className="dark:border-gray-600 dark:text-gray-200">
          {showMap ? <><List className="w-4 h-4 mr-2" /> Список</> : <><MapIcon className="w-4 h-4 mr-2" /> На карте</>}
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* List View */}
        <div className={`flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50 dark:bg-gray-900 ${showMap ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
          
          {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <BusinessCardSkeleton key={i} />)}
              </div>
          ) : displayedBusinesses.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <List className="w-8 h-8 opacity-30" />
                </div>
                <p>В этой категории пока нет организаций.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedBusinesses.map(biz => {
                    const cleanPhone = formatPhone(biz.phone);
                    const cleanAddress = formatAddress(biz.address);

                    return (
                        <div 
                            key={biz.id} 
                            onClick={() => navigate(`/business/${biz.id}`)}
                            className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col group overflow-hidden h-full"
                        >
                            {/* Image Area */}
                            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img 
                                    src={biz.image} 
                                    alt={biz.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/70 backdrop-blur px-2 py-1 rounded-lg shadow-sm">
                                    <Rating value={biz.rating} count={biz.reviewsCount} />
                                </div>
                                <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                    {biz.category}
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {biz.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5em]">
                                        {biz.description || 'Описание отсутствует'}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                        <MapPin className="w-4 h-4 mr-2.5 text-gray-400 shrink-0 mt-0.5" /> 
                                        <span className="line-clamp-1" title={cleanAddress}>{cleanAddress}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <Clock className="w-4 h-4 mr-2.5 text-gray-400 shrink-0" /> 
                                        <span className="line-clamp-1">{biz.workHours}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-2">
                                        {cleanPhone ? (
                                            <button 
                                                onClick={(e) => handleCall(e, cleanPhone)}
                                                className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg"
                                            >
                                                <Phone className="w-3.5 h-3.5 mr-2" /> {cleanPhone}
                                            </button>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">Нет телефона</span>
                                        )}
                                        
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          )}
        </div>

        {/* Yandex Map View */}
        <div className={`flex-1 bg-gray-100 dark:bg-gray-800 relative ${!showMap ? 'hidden' : 'block'}`}>
           <YandexMap center={[56.08, 60.73]} zoom={13} markers={mapMarkers} />
        </div>
      </div>
    </div>
  );
};

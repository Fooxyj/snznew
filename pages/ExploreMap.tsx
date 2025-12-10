
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { YandexMap } from '../components/YandexMap';
import { Drawer } from '../components/ui/Drawer';
import { Button, Rating } from '../components/ui/Common';
import { Loader2, ShoppingBag, Map, AlertCircle, ArrowRight, Filter, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExploreMap: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [filters, setFilters] = useState({
        business: true,
        quest: true,
        appeal: true
    });
    const navigate = useNavigate();

    const { data: mapItems = [], isLoading } = useQuery({
        queryKey: ['exploreMap'],
        queryFn: () => api.getExploreData()
    });

    const filteredItems = useMemo(() => {
        return mapItems.filter(item => {
            if (item.type === 'business' && !filters.business) return false;
            if (item.type === 'quest' && !filters.quest) return false;
            if (item.type === 'appeal' && !filters.appeal) return false;
            return true;
        });
    }, [mapItems, filters]);

    const markers = filteredItems.map(item => ({
        lat: item.lat,
        lng: item.lng,
        title: item.title,
        onClick: () => setSelectedItem(item)
    }));

    const toggleFilter = (key: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="relative h-[calc(100vh-64px)] lg:h-screen w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
            
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2 pointer-events-none">
                <div className="flex gap-2 overflow-x-auto pb-2 pointer-events-auto scrollbar-hide">
                    <button 
                        onClick={() => toggleFilter('business')}
                        className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${filters.business ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                    >
                        <ShoppingBag className="w-4 h-4" /> Места
                    </button>
                    <button 
                        onClick={() => toggleFilter('quest')}
                        className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${filters.quest ? 'bg-purple-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                    >
                        <Map className="w-4 h-4" /> Квесты
                    </button>
                    <button 
                        onClick={() => toggleFilter('appeal')}
                        className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${filters.appeal ? 'bg-red-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                    >
                        <AlertCircle className="w-4 h-4" /> Проблемы
                    </button>
                </div>
            </div>

            {/* Map */}
            <YandexMap 
                center={[56.08, 60.73]} 
                zoom={14} 
                markers={markers} 
                className="w-full h-full"
            />

            {/* Drawer Detail */}
            <Drawer 
                isOpen={!!selectedItem} 
                onClose={() => setSelectedItem(null)}
                title={selectedItem?.type === 'business' ? 'Организация' : selectedItem?.type === 'quest' ? 'Городской квест' : 'Обращение'}
            >
                {selectedItem && (
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                                <img src={selectedItem.image} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold dark:text-white leading-tight mb-1">{selectedItem.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{selectedItem.subtitle}</p>
                                
                                {selectedItem.type === 'business' && (
                                    <Rating value={selectedItem.data.rating} count={selectedItem.data.reviewsCount} />
                                )}
                                {selectedItem.type === 'quest' && (
                                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                                        Награда: {selectedItem.data.xpReward} XP
                                    </span>
                                )}
                                {selectedItem.type === 'appeal' && (
                                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${selectedItem.data.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {selectedItem.data.status === 'done' ? 'Решено' : 'В работе'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <Button variant="secondary" className="flex-1" onClick={() => setSelectedItem(null)}>
                                Закрыть
                            </Button>
                            
                            {selectedItem.type === 'business' && (
                                <Button className="flex-[2]" onClick={() => navigate(`/business/${selectedItem.id}`)}>
                                    Открыть <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                            {selectedItem.type === 'quest' && (
                                <Button className="flex-[2] bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/quests')}>
                                    К заданию <Navigation className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                            {selectedItem.type === 'appeal' && (
                                <Button className="flex-[2] bg-red-600 hover:bg-red-700" onClick={() => navigate('/city-monitor')}>
                                    Подробнее
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

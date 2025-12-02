

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { Button, Rating } from '../components/ui/Common';
import { MapPin, Phone, Clock, Map as MapIcon, List, Loader2, MessageSquare } from 'lucide-react';
import { Business } from '../types';
import { api } from '../services/api';

// Use global Leaflet object from script tag to avoid ESM/default export issues
declare global {
  interface Window { L: any; }
}

export const BusinessDirectory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showMap, setShowMap] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  const categoryLabel = CATEGORIES.find(c => c.id === id)?.label || 'Каталог организаций';

  useEffect(() => {
    const fetchBiz = async () => {
        setIsLoading(true);
        try {
            const data = await api.getBusinesses(id);
            setBusinesses(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchBiz();
  }, [id]);

  // Leaflet Map Logic
  useEffect(() => {
    if (showMap && mapRef.current && businesses.length > 0) {
        // Ensure L is available
        const L = window.L;
        if (!L) return;

        if (!mapInstance.current) {
            // Init map centered on Snezhinsk
            mapInstance.current = L.map(mapRef.current).setView([56.08, 60.73], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapInstance.current);
        }
        
        // Clear old markers if needed, for now just add
        businesses.forEach(biz => {
            const marker = L.marker([biz.lat, biz.lng]).addTo(mapInstance.current);
            marker.bindPopup(`<b>${biz.name}</b><br>${biz.address}<br><a href="#/business/${biz.id}">Перейти</a>`);
            marker.on('click', () => {
                navigate(`/business/${biz.id}`);
            });
        });
        
        setTimeout(() => {
             mapInstance.current.invalidateSize();
        }, 100);
    }
  }, [showMap, businesses]);

  if (isLoading) {
      return (
          <div className="flex h-[calc(100vh-64px)] items-center justify-center">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen">
      
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{categoryLabel}</h1>
          <p className="text-sm text-gray-500">Найдено {businesses.length} организаций</p>
        </div>
        <Button variant="outline" onClick={() => setShowMap(!showMap)}>
          {showMap ? <><List className="w-4 h-4 mr-2" /> Список</> : <><MapIcon className="w-4 h-4 mr-2" /> На карте</>}
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* List View */}
        <div className={`flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-slate-50 ${showMap ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
          {businesses.map(biz => (
            <div key={biz.id} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow flex gap-4 cursor-pointer" onClick={() => navigate(`/business/${biz.id}`)}>
              <img src={biz.image} alt={biz.name} className="w-24 h-24 rounded-lg object-cover bg-gray-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900">{biz.name}</h3>
                  <Rating value={biz.rating} count={biz.reviewsCount} />
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{biz.description}</p>
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" /> {biz.address}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" /> {biz.workHours}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" /> {biz.phone}
                    </div>
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        Подробнее
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {businesses.length === 0 && (
            <div className="text-center py-10 text-gray-500">В этой категории пока нет организаций.</div>
          )}
        </div>

        {/* Real Map View */}
        <div className={`flex-1 bg-gray-100 relative ${!showMap ? 'hidden' : 'block'}`}>
           <div ref={mapRef} className="w-full h-full z-0"></div>
        </div>
      </div>
    </div>
  );
};
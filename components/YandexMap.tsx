
import React, { useEffect, useRef, useState } from 'react';
import { YANDEX_MAPS_API_KEY } from '../config';

declare global {
  interface Window {
    ymaps: any;
  }
}

interface YandexMapProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  markers?: {
    lat: number;
    lng: number;
    title?: string;
    onClick?: () => void;
  }[];
  className?: string;
}

// Singleton promise to ensure we only load the script once per app session
let ymapsLoadPromise: Promise<void> | null = null;

const loadYandexMaps = (): Promise<void> => {
    if (window.ymaps) return Promise.resolve();
    
    if (!ymapsLoadPromise) {
        ymapsLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const apiKeyParam = YANDEX_MAPS_API_KEY ? `&apikey=${YANDEX_MAPS_API_KEY}` : '';
            script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&load=package.standard${apiKeyParam}`;
            script.type = "text/javascript";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = (err) => {
                console.error("Failed to load Yandex Maps script", err);
                reject(err);
            };
            document.head.appendChild(script);
        });
    }
    return ymapsLoadPromise;
};

export const YandexMap: React.FC<YandexMapProps> = ({ 
  center = [56.08, 60.73], 
  zoom = 13, 
  markers = [], 
  className = "w-full h-full"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;

    const init = async () => {
        try {
            await loadYandexMaps();
            
            // Wait for ymaps.ready
            if (!window.ymaps) throw new Error("Yandex Maps API not available after load");
            
            window.ymaps.ready(() => {
                if (!active || !mapRef.current) return;

                try {
                    // Destroy existing instance if any
                    if (mapInstance.current) {
                        mapInstance.current.destroy();
                    }

                    mapInstance.current = new window.ymaps.Map(mapRef.current, {
                        center: center,
                        zoom: zoom,
                        controls: ['zoomControl', 'fullscreenControl']
                    });

                    markers.forEach(marker => {
                        const placemark = new window.ymaps.Placemark(
                            [marker.lat, marker.lng], 
                            { balloonContent: marker.title },
                            { preset: 'islands#blueIcon' }
                        );

                        if (marker.onClick) {
                            placemark.events.add('click', marker.onClick);
                        }

                        mapInstance.current.geoObjects.add(placemark);
                    });

                    setStatus('ready');
                } catch (err) {
                    console.error("Yandex Map initialization error:", err);
                    setStatus('error');
                }
            });
        } catch (err) {
            console.error("Yandex Maps load error:", err);
            if (active) setStatus('error');
        }
    };

    init();

    return () => {
        active = false;
        if (mapInstance.current) {
            try { mapInstance.current.destroy(); } catch(e) {}
            mapInstance.current = null;
        }
    };
  }, [center[0], center[1], zoom, markers.length]);

  return (
    <div className={`relative ${className} bg-gray-100 overflow-hidden`}>
        <div ref={mapRef} className="w-full h-full" />
        
        {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10 backdrop-blur-sm">
                <span className="text-gray-400 text-xs flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div> 
                    Загрузка карты...
                </span>
            </div>
        )}
        
        {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10 text-gray-400 text-center p-4">
                <p className="text-xs font-medium">Карта временно недоступна</p>
                <p className="text-[10px] mt-1 opacity-70">Проверьте соединение или API ключ</p>
            </div>
        )}
    </div>
  );
};

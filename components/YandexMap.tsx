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

let ymapsLoadPromise: Promise<void> | null = null;

const loadYandexMaps = (): Promise<void> => {
    if (window.ymaps && typeof window.ymaps.ready === 'function') return Promise.resolve();
    
    if (!ymapsLoadPromise) {
        ymapsLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const apiKeyParam = YANDEX_MAPS_API_KEY ? `&apikey=${YANDEX_MAPS_API_KEY}` : '';
            script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&load=Map,Placemark,control.ZoomControl,control.FullscreenControl&coordorder=longlat${apiKeyParam}`;
            script.type = "text/javascript";
            script.async = true;
            script.onload = () => {
                const checkReady = () => {
                    if (window.ymaps && window.ymaps.ready) {
                        resolve();
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            };
            script.onerror = (err) => {
                ymapsLoadPromise = null;
                reject(new Error("Script load error"));
            };
            document.head.appendChild(script);
        });
    }
    return ymapsLoadPromise;
};

export const YandexMap: React.FC<YandexMapProps> = ({ 
  center = [60.73, 56.08], 
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
            if (!window.ymaps || !window.ymaps.ready) return;
            
            window.ymaps.ready(() => {
                // ПРОВЕРКА: Если компонент размонтирован или контейнер исчез, не создаем карту
                if (!active || !mapRef.current) return;

                try {
                    if (mapInstance.current) {
                        mapInstance.current.destroy();
                    }

                    const mapCenter = [center[1], center[0]];

                    mapInstance.current = new window.ymaps.Map(mapRef.current, {
                        center: mapCenter,
                        zoom: zoom,
                        controls: ['zoomControl', 'fullscreenControl']
                    });

                    markers.forEach(marker => {
                        const placemark = new window.ymaps.Placemark(
                            [marker.lng, marker.lat], 
                            { balloonContent: marker.title },
                            { preset: 'islands#blueIcon' }
                        );

                        if (marker.onClick) {
                            placemark.events.add('click', (e: any) => {
                                e.preventDefault();
                                marker.onClick?.();
                            });
                        }

                        mapInstance.current.geoObjects.add(placemark);
                    });

                    setStatus('ready');
                } catch (err) {
                    console.error("Yandex Map constructor error:", err);
                    setStatus('error');
                }
            });
        } catch (err: any) {
            if (active) setStatus('error');
        }
    };

    init();

    return () => {
        active = false;
        if (mapInstance.current) {
            try { 
                mapInstance.current.destroy(); 
            } catch(e) {
                // Игнорируем ошибки при уничтожении, если API уже недоступен
            }
            mapInstance.current = null;
        }
    };
  }, [center[0], center[1], zoom, markers.length]);

  return (
    <div className={`relative ${className} bg-gray-100 dark:bg-gray-800 overflow-hidden`}>
        <div ref={mapRef} className="w-full h-full" />
        {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 z-10 backdrop-blur-sm">
                <span className="text-gray-400 text-xs flex items-center gap-2 animate-pulse">Загрузка карты...</span>
            </div>
        )}
        {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 z-10 text-gray-400 text-center p-4">
                <p className="text-xs font-medium">Карта временно недоступна</p>
            </div>
        )}
    </div>
  );
};
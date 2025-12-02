
import React, { useEffect, useRef, useState } from 'react';

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

export const YandexMap: React.FC<YandexMapProps> = ({ 
  center = [56.08, 60.73], 
  zoom = 13, 
  markers = [], 
  className = "w-full h-full"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check if API is loaded
    if (!window.ymaps) {
        // Retry once after 1 sec in case script is slow
        setTimeout(() => {
            if (!window.ymaps) {
                console.error("Yandex Maps API not loaded");
                setError(true);
            }
        }, 1500);
        return;
    }

    try {
        window.ymaps.ready(() => {
          if (!mapRef.current) return;

          // If map already exists, just destroy it to re-init (simplest for React without complex diffing)
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
              {
                balloonContent: marker.title
              },
              {
                preset: 'islands#blueIcon'
              }
            );

            if (marker.onClick) {
              placemark.events.add('click', marker.onClick);
            }

            mapInstance.current.geoObjects.add(placemark);
          });
        });
    } catch (e) {
        console.error("Error initializing map", e);
        setError(true);
    }

    return () => {
      // Cleanup
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [center[0], center[1], zoom, markers.length]);

  if (error) {
      return (
          <div className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs p-4 ${className}`}>
              Карта недоступна
          </div>
      );
  }

  return <div ref={mapRef} className={className} />;
};


import React, { useState } from 'react';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
}

export const Img: React.FC<ImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  fallbackSrc, 
  ...props 
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleLoad = () => setStatus('loaded');
  const handleError = () => setStatus('error');

  return (
    <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${containerClassName} ${className}`}>
      {/* Skeleton / Loading State */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse z-10">
          <ImageIcon className="w-8 h-8 text-gray-400 opacity-50" />
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 z-20">
          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">Ошибка загрузки</span>
        </div>
      )}

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  // Reset scale when opening new image
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    // Remove scroll lock immediately for better UX
    document.body.style.overflow = '';
    setTimeout(onClose, 300); // Wait for animation
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => prev === 1 ? 2 : 1);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`fixed inset-0 z-[150] flex items-center justify-center bg-black/95 transition-opacity duration-300 ${isClosing ? 'opacity-0 pointer-events-none cursor-default' : 'opacity-100'}`}
      onClick={handleClose}
    >
      {/* Toolbar */}
      <div className={`absolute top-4 right-4 flex gap-4 z-[160] ${isClosing ? 'pointer-events-none' : ''}`}>
        <button 
          onClick={toggleZoom}
          className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors cursor-pointer"
        >
          {scale === 1 ? <ZoomIn className="w-6 h-6" /> : <ZoomOut className="w-6 h-6" />}
        </button>
        <button 
          onClick={handleClose}
          className="p-2 bg-white/10 rounded-full text-white hover:bg-red-500/80 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden pointer-events-none"
      >
        <img 
          src={src} 
          alt={alt} 
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ease-out ${isClosing ? 'pointer-events-none' : 'pointer-events-auto cursor-zoom-in'}`}
          style={{ transform: `scale(${scale})` }}
          onClick={toggleZoom}
        />
      </div>
      
      {alt && (
        <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
            <span className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm">
                {alt}
            </span>
        </div>
      )}
    </div>
  );
};

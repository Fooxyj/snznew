
import React, { useState, useEffect } from 'react';
import { Story } from '../types';

interface StoriesBarProps {
  stories: Story[];
  onOpenShop?: (shopId: string) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ stories, onOpenShop }) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  // Auto-advance logic
  useEffect(() => {
    let interval: any;
    if (activeStory) {
      // Reset progress when story changes
      setProgress(0);
      
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
             // Auto-go to next story
             handleNext();
             return 0;
          }
          return prev + 1.5; // Speed of story
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [activeStoryIndex]); // Depend on Index to reset timer on manual change

  const handleNext = () => {
      if (activeStoryIndex === null) return;
      if (activeStoryIndex < stories.length - 1) {
          setActiveStoryIndex(activeStoryIndex + 1);
          setProgress(0);
      } else {
          setActiveStoryIndex(null); // Close if last
      }
  };

  const handlePrev = () => {
      if (activeStoryIndex === null) return;
      if (activeStoryIndex > 0) {
          setActiveStoryIndex(activeStoryIndex - 1);
          setProgress(0);
      } else {
          // If first story, maybe restart or do nothing.
          // For now, let's just restart current story
          setProgress(0);
      }
  };

  const onStoryClick = (index: number) => {
      setActiveStoryIndex(index);
      setProgress(0);
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    if (activeStory && onOpenShop) {
      setActiveStoryIndex(null); // Close story
      onOpenShop(activeStory.shopId);
    }
  };

  return (
    <>
      {/* Horizontal Bar (Mobile Only) */}
      <div className="flex gap-4 overflow-x-auto px-1 py-1 no-scrollbar">
        {stories.map((story, idx) => (
          <div 
            key={story.id} 
            className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0"
            onClick={() => onStoryClick(idx)}
          >
            {/* Outline: Solid Blue or Gray if viewed */}
            <div className={`p-[2px] rounded-full transition-colors ${story.isViewed ? 'bg-gray-200' : 'bg-primary'}`}>
              <div className="p-[2px] bg-white rounded-full">
                <img 
                  src={story.avatar} 
                  alt={story.shopName} 
                  className="w-14 h-14 rounded-full object-cover transition-transform group-active:scale-95" 
                />
              </div>
            </div>
            <span className="text-[10px] font-medium text-dark truncate max-w-[60px]">{story.shopName}</span>
          </div>
        ))}
      </div>

      {/* Full Screen Overlay */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in-up h-[100dvh] w-screen">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-4 md:pt-2">
             {stories.map((s, idx) => (
                 <div key={s.id} className="h-1 bg-white/30 rounded-full flex-grow overflow-hidden">
                    <div 
                        className={`h-full bg-white transition-all duration-100 ease-linear ${idx < activeStoryIndex! ? 'w-full' : idx > activeStoryIndex! ? 'w-0' : ''}`}
                        style={{ width: idx === activeStoryIndex ? `${progress}%` : undefined }}
                    ></div>
                 </div>
             ))}
          </div>

          {/* Header - Clickable for Shop Profile */}
          <div className="absolute top-6 left-0 right-0 z-20 px-4 flex items-center justify-between pointer-events-none">
            <div 
                className="flex items-center gap-2 pointer-events-auto cursor-pointer active:opacity-70 transition-opacity"
                onClick={handleHeaderClick}
            >
               <img src={activeStory.avatar} className="w-8 h-8 rounded-full border border-white/50" alt="" />
               <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{activeStory.shopName}</span>
               <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
               <span className="text-white/70 text-xs ml-2">{activeStoryIndex! + 1} из {stories.length}</span>
            </div>
            <button onClick={() => setActiveStoryIndex(null)} className="text-white p-2 pointer-events-auto">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Image */}
          <div className="flex-grow relative bg-gray-900 flex items-center justify-center">
             <img src={activeStory.image} alt="Story" className="w-full h-full object-contain md:object-cover" />
             {activeStory.text && (
                 <div className="absolute bottom-20 left-0 right-0 p-6 text-center pointer-events-none">
                    <span className="inline-block bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-lg font-medium">
                        {activeStory.text}
                    </span>
                 </div>
             )}
          </div>
          
          {/* Touch Zones */}
          <div className="absolute inset-0 z-10 flex">
              {/* Left 30% for Prev */}
              <div className="w-[30%] h-full" onClick={(e) => { e.stopPropagation(); handlePrev(); }}></div>
              {/* Right 70% for Next */}
              <div className="w-[70%] h-full" onClick={(e) => { e.stopPropagation(); handleNext(); }}></div>
          </div>
        </div>
      )}
    </>
  );
};

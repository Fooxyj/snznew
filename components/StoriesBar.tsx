
import React, { useState, useEffect } from 'react';
import { Story } from '../types';

interface StoriesBarProps {
  stories: Story[];
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ stories }) => {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [progress, setProgress] = useState(0);

  // Auto-close story after 5 seconds
  useEffect(() => {
    let interval: any; // Use 'any' to avoid NodeJS.Timeout vs number TypeScript conflict
    if (activeStory) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveStory(null);
            return 0;
          }
          return prev + 2; // Updates every 100ms, total 5000ms
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeStory]);

  return (
    <>
      {/* Horizontal Bar (Mobile Only) */}
      <div className="lg:hidden flex gap-4 overflow-x-auto px-4 py-4 no-scrollbar bg-white border-b border-gray-100">
        {stories.map((story) => (
          <div 
            key={story.id} 
            className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0"
            onClick={() => setActiveStory(story)}
          >
            <div className={`p-[2px] rounded-full bg-gradient-to-tr ${story.isViewed ? 'from-gray-300 to-gray-300' : 'from-yellow-400 to-red-500'}`}>
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
        <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-fade-in-up">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
             <div className="h-1 bg-white/30 rounded-full flex-grow overflow-hidden">
                <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
             </div>
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <img src={activeStory.avatar} className="w-8 h-8 rounded-full border border-white/50" alt="" />
               <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{activeStory.shopName}</span>
            </div>
            <button onClick={() => setActiveStory(null)} className="text-white p-2">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Image */}
          <div className="flex-grow relative bg-gray-900">
             <img src={activeStory.image} alt="Story" className="w-full h-full object-cover" />
             {activeStory.text && (
                 <div className="absolute bottom-20 left-0 right-0 p-6 text-center">
                    <span className="inline-block bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-lg font-medium">
                        {activeStory.text}
                    </span>
                 </div>
             )}
          </div>
          
          {/* Interactive Layer to close on tap */}
          <div className="absolute inset-0 z-10" onClick={() => setActiveStory(null)}></div>
        </div>
      )}
    </>
  );
};

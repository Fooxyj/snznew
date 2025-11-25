
import React, { useEffect } from 'react';
import { NewsItem } from '../types';

interface NewsPageProps {
  news: NewsItem;
  onBack: () => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ news, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [news]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-10">
      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-secondary hover:text-primary mb-6 transition-colors font-medium group"
      >
         <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all border border-gray-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         </div>
         Назад к новостям
      </button>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-lg group">
        <img src={news.image} alt={news.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white w-full">
           <span className="inline-block bg-primary/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-lg uppercase tracking-wide border border-white/10">
              {news.category}
           </span>
           <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight shadow-black drop-shadow-md max-w-3xl">
              {news.title}
           </h1>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-surface rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100 relative">
         
         {/* Meta Info */}
         <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-secondary mb-8 pb-8 border-b border-gray-100">
            <span className="flex items-center gap-2 font-medium text-dark bg-gray-50 px-3 py-1.5 rounded-lg">
               <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               {news.date}
            </span>
            <span className="hidden md:inline-block w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
            <span className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-primary flex items-center justify-center text-[10px] text-white font-bold">
                    СВ
                </div>
                Редакция Снежинск.Вестник
            </span>
            
            <button className="ml-auto text-primary font-bold hover:underline flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Поделиться
            </button>
         </div>

         {/* Article Body */}
         <div className="prose prose-lg text-dark max-w-none">
             <p className="text-xl md:text-2xl font-medium text-secondary mb-8 italic pl-6 border-l-4 border-primary/50 leading-relaxed">
                {news.excerpt}
             </p>
             <div className="whitespace-pre-wrap leading-relaxed text-gray-800 text-base md:text-lg">
                {news.content}
             </div>
         </div>
      </div>
      
      {/* Read Next Section (Mock) */}
      <div className="mt-12">
          <h3 className="text-xl font-bold text-dark mb-6">Читайте также</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0"></div>
                  <div>
                      <div className="w-16 h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="w-full h-4 bg-gray-100 rounded mb-1"></div>
                      <div className="w-2/3 h-4 bg-gray-100 rounded"></div>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0"></div>
                  <div>
                      <div className="w-16 h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="w-full h-4 bg-gray-100 rounded mb-1"></div>
                      <div className="w-2/3 h-4 bg-gray-100 rounded"></div>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

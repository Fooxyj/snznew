import React from 'react';
import { NewsItem } from '../types';

interface NewsDetailsModalProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NewsDetailsModal: React.FC<NewsDetailsModalProps> = ({ news, isOpen, onClose }) => {
  if (!isOpen || !news) return null;

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-4xl rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Header */}
        {news.image && (
          <div className="w-full h-64 md:h-96 relative overflow-hidden">
            <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                {news.category}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-10">
          {/* Title & Date */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-secondary mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{news.date}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
              {news.title}
            </h1>
            {news.excerpt && (
              <p className="text-lg text-secondary leading-relaxed font-medium">
                {news.excerpt}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Full Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-dark leading-relaxed whitespace-pre-wrap">
              {news.content}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-dark font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

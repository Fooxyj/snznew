
import React from 'react';
import { Ad } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: Ad;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, ad }) => {
  if (!isOpen) return null;

  // Generate valid HTML for the iframe to run the widget in isolation
  const getWidgetHtml = (id: number, wid: number) => `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          background-color: #ffffff;
        }
        /* Ensure the widget container takes full width */
        #litepmsiframe { width: 100%; }
        /* Style scrollbars to match the app */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div id="litepmsiframe"></div>
      <script type="text/javascript">
        var litepmsembed_id = ${id};
        var litepmsembed_wid = ${wid};
      </script>
      <script type="text/javascript" src="https://litepms.ru/js/widget_embed.js" charset="utf-8"></script>
    </body>
    </html>
  `;

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-4xl rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh] h-[800px]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <div>
             <h2 className="text-xl font-bold text-dark">Бронирование</h2>
             <p className="text-xs text-secondary truncate max-w-[200px]">{ad.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Widget Container */}
        <div className="flex-grow bg-white relative overflow-hidden">
          {ad.bookingWidget && ad.bookingWidget.type === 'litepms' ? (
             <iframe 
               title="Booking Widget"
               srcDoc={getWidgetHtml(ad.bookingWidget.id, ad.bookingWidget.wid)}
               className="w-full h-full border-none"
             />
          ) : (
            <div className="p-10 text-center text-secondary">
               Модуль бронирования не настроен для этого объявления.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

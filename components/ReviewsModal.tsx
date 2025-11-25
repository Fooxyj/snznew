
import React, { useState } from 'react';
import { Review } from '../types';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string; // usually 'Частное лицо' or phone
  reviews: Review[];
  onAddReview: (rating: number, text: string) => void;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({ isOpen, onClose, sellerName, reviews, onAddReview }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [view, setView] = useState<'list' | 'add'>('list');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onAddReview(rating, text);
    setText('');
    setRating(0);
    setView('list');
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-dark">Отзывы</h2>
            <p className="text-xs text-secondary">О продавце: {sellerName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-gray-50">
           
           {/* Summary Block */}
           {view === 'list' && (
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="text-4xl font-extrabold text-dark">{averageRating}</div>
                   <div>
                      <div className="flex text-yellow-400 text-sm">
                         {[1,2,3,4,5].map(star => (
                            <svg key={star} className={`w-4 h-4 ${star <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-300 fill-gray-300'}`} viewBox="0 0 20 20">
                               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                         ))}
                      </div>
                      <p className="text-xs text-secondary mt-0.5">{reviews.length} оценок</p>
                   </div>
                </div>
                <button 
                  onClick={() => setView('add')}
                  className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors"
                >
                   Написать
                </button>
             </div>
           )}

           {view === 'list' ? (
              <div className="space-y-4">
                 {reviews.length === 0 ? (
                    <div className="text-center py-8 text-secondary">
                       Нет отзывов. Будьте первым!
                    </div>
                 ) : (
                    reviews.map((rev) => (
                       <div key={rev.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                             <div className="font-bold text-dark text-sm">{rev.author}</div>
                             <div className="text-xs text-gray-400">{rev.date}</div>
                          </div>
                          <div className="flex text-yellow-400 w-20 mb-2">
                             {[1,2,3,4,5].map(star => (
                                <svg key={star} className={`w-3 h-3 ${star <= rev.rating ? 'fill-current' : 'text-gray-200 fill-gray-200'}`} viewBox="0 0 20 20">
                                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                             ))}
                          </div>
                          <p className="text-sm text-secondary leading-relaxed">{rev.text}</p>
                       </div>
                    ))
                 )}
              </div>
           ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-dark mb-2">Ваша оценка</label>
                    <div className="flex gap-2">
                       {[1,2,3,4,5].map(star => (
                          <button 
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform active:scale-90 hover:scale-110"
                          >
                             <svg className={`w-10 h-10 ${rating > 0 && star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                             </svg>
                          </button>
                       ))}
                    </div>
                    {rating === 0 && <p className="text-xs text-red-500 mt-2">Пожалуйста, выберите оценку</p>}
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-dark mb-2">Комментарий</label>
                    <textarea 
                       rows={4}
                       className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                       placeholder="Расскажите, как все прошло..."
                       value={text}
                       onChange={e => setText(e.target.value)}
                       required
                    ></textarea>
                 </div>

                 <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => { setView('list'); setRating(0); setText(''); }}
                      className="flex-1 py-3 bg-gray-100 text-dark font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                       Отмена
                    </button>
                    <button 
                      type="submit" 
                      disabled={rating === 0}
                      className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                       Отправить
                    </button>
                 </div>
              </form>
           )}

        </div>
      </div>
    </div>
  );
};

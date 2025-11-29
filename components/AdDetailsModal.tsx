import React, { useState } from 'react';
import { Ad } from '../types';

interface AdDetailsModalProps {
    ad: Ad | null;
    isOpen: boolean;
    onClose: () => void;
}

export const AdDetailsModal: React.FC<AdDetailsModalProps> = ({ ad, isOpen, onClose }) => {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    if (!isOpen || !ad) return null;

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsGalleryOpen(true);
    };

    const closeGallery = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsGalleryOpen(false);
    };

    // Gallery Overlay
    if (isGalleryOpen) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={closeGallery}>
                <button onClick={closeGallery} className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="w-full h-full md:w-auto md:h-auto md:max-w-5xl md:max-h-[90vh] flex items-center justify-center p-0 md:p-4">
                    <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-full h-full md:w-auto md:h-auto object-contain md:rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-surface w-full h-full md:h-auto md:max-w-4xl md:rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col md:flex-row md:max-h-[90vh]" onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/50 backdrop-blur-md hover:bg-white rounded-full text-dark transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 h-72 md:h-auto relative bg-gray-100 flex-shrink-0 cursor-pointer group" onClick={handleImageClick}>
                    <img src={ad.image} alt={ad.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>

                    {/* Badges Overlay */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md text-white
                    ${ad.category === 'sale' ? 'bg-green-500' :
                                ad.category === 'rent' ? 'bg-blue-500' :
                                    ad.category === 'services' ? 'bg-purple-500' : 'bg-gray-500'}`}>
                            {ad.category === 'rent' ? 'Аренда' : ad.category === 'sale' ? 'Продажа' : ad.category === 'services' ? 'Услуги' : 'Работа'}
                        </span>
                        {ad.isPremium && (
                            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md w-max">
                                VIP
                            </span>
                        )}
                    </div>

                    <div className="absolute bottom-4 left-4 text-white md:hidden">
                        <p className="text-sm opacity-90">{ad.date}</p>
                    </div>

                    {/* Zoom Hint */}
                    <div className="absolute center inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            <span className="text-sm font-medium">Открыть фото</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 flex flex-col h-full bg-surface">
                    <div className="p-6 md:p-8 overflow-y-auto flex-grow custom-scrollbar">

                        <div className="mb-6">
                            {/* Added pr-12 to prevent overlap with close button */}
                            <div className="hidden md:flex items-center justify-between mb-2 pr-12">
                                <span className="text-sm text-secondary bg-gray-100 px-2 py-1 rounded-md">{ad.date}</span>
                                <span className="text-sm font-medium text-secondary">ID: {ad.id}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-dark leading-tight mb-2">{ad.title}</h2>

                            {/* Mobile Description (Visible only on mobile, below title) */}
                            <div className="md:hidden mb-4">
                                <p className="text-dark text-sm leading-relaxed whitespace-pre-wrap">{ad.description}</p>
                            </div>

                            <div className="text-3xl md:text-4xl font-extrabold text-primary mb-4 md:mb-0">
                                {ad.price > 0 ? `${ad.price.toLocaleString('ru-RU')} ₽` : 'Договорная'}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="hidden md:block">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Описание</h3>
                                <p className="text-dark text-base leading-relaxed whitespace-pre-wrap">{ad.description}</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-xs text-gray-400 mb-1">Расположение</span>
                                    <span className="font-medium text-dark flex items-center gap-1">
                                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {ad.location}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400 mb-1">Категория</span>
                                    <span className="font-medium text-dark capitalize">
                                        {ad.category === 'sale' ? 'Продажа' : ad.category === 'rent' ? 'Аренда' : ad.category === 'services' ? 'Услуги' : 'Работа'}
                                    </span>
                                </div>
                                {ad.subCategory && (
                                    <div className="col-span-2">
                                        <span className="block text-xs text-gray-400 mb-1">Подкатегория</span>
                                        <span className="font-medium text-dark">{ad.subCategory}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Contact Actions */}
                    <div className="p-6 border-t border-gray-100 bg-white z-10 safe-bottom">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                {ad.authorAvatar ? (
                                    <img src={ad.authorAvatar} alt={ad.authorName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-white shadow-sm">
                                        {ad.authorName?.charAt(0) || 'П'}
                                    </div>
                                )}
                                <div>
                                    <span className="block text-xs text-primary font-bold uppercase mb-0.5">Продавец</span>
                                    <span className="block text-lg font-bold text-dark tracking-tight leading-none">{ad.authorName || 'Частное лицо'}</span>
                                </div>
                            </div>
                            <a href={`tel:${ad.contact}`} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="font-bold hidden sm:inline">Позвонить</span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
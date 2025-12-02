import React from 'react';
import { Ad } from '../types';
import { AdCard } from './AdCard';

interface PublicProfilePageProps {
    profile: {
        id: string;
        name: string;
        avatar?: string;
        createdAt?: string;
    };
    ads: Ad[];
    onBack: () => void;
    onShowAd: (ad: Ad) => void;
    onToggleFavorite: (id: string) => void;
    favorites: string[];
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
    profile, ads, onBack, onShowAd, onToggleFavorite, favorites
}) => {
    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row animate-fade-in">

            {/* Mobile Header */}
            <div className="md:hidden bg-white p-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-dark">{profile.name}</h1>
            </div>

            {/* Sidebar Info */}
            <div className="w-full md:w-80 bg-white border-r border-gray-200 p-8 flex flex-col items-center shrink-0 md:h-screen md:sticky md:top-0">
                <div className="hidden md:flex w-full mb-6">
                    <button onClick={onBack} className="flex items-center gap-2 text-secondary hover:text-dark font-bold transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Назад
                    </button>
                </div>

                <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden border-4 border-white">
                        {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" alt={profile.name} /> : profile.name.charAt(0).toUpperCase()}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-dark text-center">{profile.name}</h2>
                <p className="text-sm text-secondary mb-6">ID: {profile.id.slice(0, 8)}</p>

                <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                    <p className="text-xs text-secondary font-bold uppercase mb-1">Активных объявлений</p>
                    <p className="text-2xl font-black text-dark">{ads.length}</p>
                </div>
            </div>

            {/* Ads List */}
            <div className="flex-grow p-4 md:p-10 overflow-y-auto custom-scrollbar">
                <h3 className="text-2xl font-bold text-dark mb-6 hidden md:block">Объявления пользователя</h3>
                {ads.length === 0 ? (
                    <div className="text-center py-20 text-secondary">
                        <p>У пользователя нет активных объявлений</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map(ad => (
                            <AdCard
                                key={ad.id}
                                ad={ad}
                                onShow={() => { onShowAd(ad); }}
                                isFavorite={favorites.includes(ad.id)}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

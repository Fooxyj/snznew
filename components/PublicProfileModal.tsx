
import React from 'react';
import { Ad } from '../types';
import { AdCard } from './AdCard';
import { getLevelInfo } from '../utils';

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    createdAt?: string;
  } | null;
  ads: Ad[];
  onShowAd: (ad: Ad) => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ 
  isOpen, onClose, profile, ads, onShowAd, onToggleFavorite, favorites 
}) => {
  if (!isOpen || !profile) return null;

  const levelInfo = getLevelInfo(profile.level * 100); // Approximation if we store level directly

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-background w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full text-dark hover:bg-white shadow-sm">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Sidebar Info */}
        <div className="w-full md:w-80 bg-white border-r border-gray-100 p-8 flex flex-col items-center shrink-0">
             <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden border-4 border-white">
                    {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" alt={profile.name} /> : profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full ${levelInfo.color} border-2 border-white shadow-sm whitespace-nowrap`}>
                      Lvl {levelInfo.level} {levelInfo.title}
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
        <div className="flex-grow p-6 md:p-8 overflow-y-auto bg-gray-50 custom-scrollbar">
            <h3 className="text-xl font-bold text-dark mb-6">Объявления пользователя</h3>
            {ads.length === 0 ? (
                <div className="text-center py-20 text-secondary">
                    <p>У пользователя нет активных объявлений</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ads.map(ad => (
                        <AdCard 
                            key={ad.id} 
                            ad={ad} 
                            onShow={() => { onShowAd(ad); onClose(); }}
                            isFavorite={favorites.includes(ad.id)}
                            onToggleFavorite={onToggleFavorite}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

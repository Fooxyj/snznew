
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Button, XPBar, Badge } from '../components/ui/Common';
import { Loader2, MessageCircle, Star, Shield, Zap, Crown, User as UserIcon, Calendar, MapPin, ChevronLeft } from 'lucide-react';
import { Ad } from '../types';

// Helper for Badges
const BadgeIcon: React.FC<{ name: string }> = ({ name }) => {
    switch(name) {
        case 'verified': return <div className="text-blue-500 bg-blue-50 p-1.5 rounded-full" title="Проверенный"><Star className="w-3.5 h-3.5 fill-current" /></div>;
        case 'admin': return <div className="text-red-500 bg-red-50 p-1.5 rounded-full" title="Администратор"><Shield className="w-3.5 h-3.5 fill-current" /></div>;
        case 'quest_master': return <div className="text-purple-500 bg-purple-50 p-1.5 rounded-full" title="Мастер квестов"><Zap className="w-3.5 h-3.5 fill-current" /></div>;
        case 'early_adopter': return <div className="text-orange-500 bg-orange-50 p-1.5 rounded-full" title="Старожил"><Crown className="w-3.5 h-3.5 fill-current" /></div>;
        default: return <div className="text-gray-500 bg-gray-50 p-1.5 rounded-full"><Star className="w-3.5 h-3.5" /></div>;
    }
};

export const PublicProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch Target User
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['publicUser', id],
        queryFn: () => api.getUserById(id!),
        enabled: !!id
    });

    // Fetch Target User's Ads
    const { data: content, isLoading: contentLoading } = useQuery({
        queryKey: ['publicContent', id],
        queryFn: () => api.getUserContent(id!),
        enabled: !!id
    });

    // Fetch Current Logged-in User (to check if it's me)
    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    if (userLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <UserIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Пользователь не найден</h2>
                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Назад</Button>
            </div>
        );
    }

    const isMe = currentUser?.id === user.id;
    const ads = content?.ads || [];

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Назад
            </button>

            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 pointer-events-none"></div>

                <div className="relative z-10 -mt-4 md:mt-0">
                    <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg bg-gray-200" />
                </div>
                
                <div className="flex-1 text-center md:text-left z-10 w-full">
                    <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white flex items-center justify-center md:justify-start gap-2">
                                {user.name}
                                {user.badges?.map(b => <BadgeIcon key={b} name={b} />)}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {user.createdAt && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> На сайте с {new Date(user.createdAt).getFullYear()}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {isMe && (
                            <Link to="/profile">
                                <Button variant="outline">Мой профиль</Button>
                            </Link>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl max-w-sm mx-auto md:mx-0">
                        <XPBar xp={user.xp} />
                    </div>
                </div>
            </div>

            {/* Ads Section */}
            <div>
                <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    Активные объявления <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-sm">{ads.length}</span>
                </h2>

                {contentLoading ? (
                    <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
                ) : ads.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map(ad => (
                            <Link key={ad.id} to={`/ad/${ad.id}`} className="block group">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {ad.isVip && <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold shadow">VIP</div>}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{ad.title}</h3>
                                        <div className="mt-auto pt-2 flex items-center justify-between">
                                            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{ad.price.toLocaleString()} {ad.currency}</span>
                                            <span className="text-xs text-gray-400 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {ad.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed dark:border-gray-700 text-gray-500">
                        У пользователя нет активных объявлений.
                    </div>
                )}
            </div>
        </div>
    );
};

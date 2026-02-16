
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { User } from '../types';
import { Loader2, Trophy, Crown, Info, X, Zap, Heart, MessageSquare, ShoppingBag, Flag } from 'lucide-react';
import { BadgeIcon, Button } from '../components/ui/Common';

export const Leaderboard: React.FC = () => {
    const [showInfo, setShowInfo] = useState(false);
    
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: api.getLeaderboard
    });

    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

    const getDisplayBadges = (u: User) => {
        return Array.isArray(u.showcasedBadges) ? u.showcasedBadges : u.badges.slice(0, 3);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-32">
            <div className="flex flex-col items-center mb-12">
                <h1 className="text-3xl font-black text-center flex items-center justify-center gap-3 dark:text-white uppercase tracking-tighter">
                    <Trophy className="w-10 h-10 text-yellow-500" /> Доска Почета
                </h1>
                <button 
                    onClick={() => setShowInfo(true)}
                    className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <Info className="w-4 h-4" /> Как попасть в топ?
                </button>
            </div>

            {/* Modal Info */}
            {showInfo && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border dark:border-gray-700 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Правила рейтинга</h3>
                            <button onClick={() => setShowInfo(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-6">
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">На Доску Почета попадают самые активные и полезные жители Снежинска. Ваш статус определяется количеством накопленного опыта (XP).</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                    <Flag className="w-5 h-5 text-blue-600 mb-2" />
                                    <div className="font-bold text-xs dark:text-white">Квесты</div>
                                    <p className="text-[10px] text-gray-400">Проходите городские задания</p>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                                    <Heart className="w-5 h-5 text-red-500 mb-2" />
                                    <div className="font-bold text-xs dark:text-white">Добро</div>
                                    <p className="text-[10px] text-gray-400">Участвуйте в благотворительности</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                                    <ShoppingBag className="w-5 h-5 text-green-600 mb-2" />
                                    <div className="font-bold text-xs dark:text-white">Маркет</div>
                                    <p className="text-[10px] text-gray-400">Размещайте объявления</p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
                                    <MessageSquare className="w-5 h-5 text-purple-600 mb-2" />
                                    <div className="font-bold text-xs dark:text-white">Социум</div>
                                    <p className="text-[10px] text-gray-400">Общайтесь в клубах и чатах</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl text-[11px] text-gray-500 italic">
                                * Рейтинг обновляется в реальном времени. Лидеры месяца могут получать специальные награды от партнеров Простора.
                            </div>
                        </div>
                        <Button className="w-full mt-8 py-4 rounded-2xl font-black uppercase tracking-widest" onClick={() => setShowInfo(false)}>Понятно</Button>
                    </div>
                </div>
            )}

            {/* Podium */}
            <div className="flex justify-center items-end gap-2 sm:gap-6 mb-16 px-2">
                {/* 2nd Place */}
                {top3[1] && (
                    <div className="flex flex-col items-center flex-1 max-w-[120px] animate-in slide-in-from-bottom-4 duration-700 delay-100">
                        <img src={top3[1].avatar} className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] border-4 border-gray-200 dark:border-gray-700 shadow-lg object-cover bg-gray-100" alt="" />
                        <div className="bg-gray-200 dark:bg-gray-700 w-full h-24 rounded-t-[1.5rem] flex items-center justify-center text-3xl font-black text-gray-400 mt-3 shadow-inner relative">
                            2
                        </div>
                        <div className="mt-3 text-center w-full">
                            <div className="font-black text-[11px] uppercase truncate dark:text-white mb-1">{top3[1].name}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{top3[1].xp} XP</div>
                            <div className="flex justify-center gap-1 mt-2">
                                {getDisplayBadges(top3[1]).map(bId => <BadgeIcon key={bId} name={bId} size="sm" />)}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 1st Place */}
                {top3[0] && (
                    <div className="flex flex-col items-center flex-1 max-w-[150px] z-10 animate-in slide-in-from-bottom-6 duration-1000">
                        <div className="relative">
                            <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500 w-10 h-10 fill-current animate-bounce drop-shadow-xl" />
                            <img src={top3[0].avatar} className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] border-4 border-yellow-400 shadow-2xl object-cover bg-gray-100" alt="" />
                        </div>
                        <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 w-full h-36 rounded-t-[2rem] flex items-center justify-center text-5xl font-black text-white mt-4 shadow-xl border-t border-white/20">
                            1
                        </div>
                        <div className="mt-4 text-center w-full">
                            <div className="font-black text-sm uppercase dark:text-white mb-1 truncate">{top3[0].name}</div>
                            <div className="text-xs font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">{top3[0].xp} XP</div>
                            <div className="flex justify-center gap-1 mt-2">
                                {getDisplayBadges(top3[0]).map(bId => <BadgeIcon key={bId} name={bId} size="sm" />)}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                    <div className="flex flex-col items-center flex-1 max-w-[120px] animate-in slide-in-from-bottom-4 duration-700 delay-200">
                        <img src={top3[2].avatar} className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] border-4 border-orange-200 dark:border-gray-700 shadow-lg object-cover bg-gray-100" alt="" />
                        <div className="bg-orange-200 dark:bg-gray-700 w-full h-20 rounded-t-[1.5rem] flex items-center justify-center text-3xl font-black text-orange-400 mt-3 shadow-inner">
                            3
                        </div>
                        <div className="mt-3 text-center w-full">
                            <div className="font-black text-[11px] uppercase truncate dark:text-white mb-1">{top3[2].name}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{top3[2].xp} XP</div>
                            <div className="flex justify-center gap-1 mt-2">
                                {getDisplayBadges(top3[2]).map(bId => <BadgeIcon key={bId} name={bId} size="sm" />)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border dark:border-gray-700 overflow-hidden">
                {rest.length === 0 && top3.length < 4 && (
                    <div className="p-12 text-center text-gray-400 uppercase font-black text-[10px] tracking-widest italic">
                        Здесь будут отображаться остальные жители
                    </div>
                )}
                {rest.map((u, idx) => (
                    <div key={u.id} className="flex items-center p-5 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all group">
                        <div className="w-10 font-black text-gray-300 dark:text-gray-600 text-sm italic">{idx + 4}</div>
                        <img src={u.avatar} className="w-12 h-12 rounded-2xl bg-gray-100 object-cover ml-4 border dark:border-gray-700" alt="" />
                        <div className="ml-4 flex-1 min-w-0">
                            <div className="font-black text-sm uppercase dark:text-white truncate tracking-tight group-hover:text-blue-600 transition-colors">
                                {u.name}
                            </div>
                        </div>
                        <div className="flex gap-1 mx-4 shrink-0">
                             {getDisplayBadges(u).map(bId => <BadgeIcon key={bId} name={bId} size="sm" />)}
                        </div>
                        <div className="font-black text-blue-600 dark:text-blue-400 text-sm shrink-0">{u.xp} XP</div>
                    </div>
                ))}
            </div>

            {/* My Rank Footer */}
            {currentUser && (
                <div className="fixed bottom-24 left-4 right-4 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-4xl z-50 animate-in slide-in-from-bottom-10">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-blue-500/30 p-4 rounded-[2rem] shadow-2xl flex items-center gap-4">
                        <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg">Вы</div>
                        <img src={currentUser.avatar} className="w-11 h-11 rounded-xl border-2 border-white dark:border-gray-700 shadow-md object-cover" alt="" />
                        <div className="flex-1 min-w-0">
                            <div className="font-black text-sm dark:text-white uppercase truncate">{currentUser.name}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase">{currentUser.xp} XP</div>
                        </div>
                        <div className="flex gap-1">
                             {getDisplayBadges(currentUser).map(bId => <BadgeIcon key={bId} name={bId} size="sm" />)}
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-xl px-4 py-2 rounded-2xl">
                           #{users.findIndex(u => u.id === currentUser.id) + 1}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

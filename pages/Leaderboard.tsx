
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { Loader2, Trophy, Shield, Star, Zap, Crown } from 'lucide-react';
import { XPBar } from '../components/ui/Common';

const BadgeIcon: React.FC<{ name: string }> = ({ name }) => {
    switch(name) {
        case 'verified': return <div className="text-blue-500 bg-blue-100 p-1 rounded-full" title="Проверенный"><Star className="w-3 h-3 fill-current" /></div>;
        case 'admin': return <div className="text-red-500 bg-red-100 p-1 rounded-full" title="Администратор"><Shield className="w-3 h-3 fill-current" /></div>;
        case 'quest_master': return <div className="text-purple-500 bg-purple-100 p-1 rounded-full" title="Мастер квестов"><Zap className="w-3 h-3 fill-current" /></div>;
        case 'early_adopter': return <div className="text-orange-500 bg-orange-100 p-1 rounded-full" title="Старожил"><Crown className="w-3 h-3 fill-current" /></div>;
        default: return null;
    }
};

export const Leaderboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const load = async () => {
            const [u, me] = await Promise.all([api.getLeaderboard(), api.getCurrentUser()]);
            setUsers(u);
            setCurrentUser(me);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <h1 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-3 dark:text-white">
                <Trophy className="w-8 h-8 text-yellow-500" /> Доска Почета
            </h1>

            {/* Podium */}
            <div className="flex justify-center items-end gap-4 mb-10">
                {/* 2nd Place */}
                {top3[1] && (
                    <div className="flex flex-col items-center">
                        <img src={top3[1].avatar} className="w-16 h-16 rounded-full border-4 border-gray-300 shadow-lg object-cover" alt="" />
                        <div className="bg-gray-300 w-20 h-24 rounded-t-lg flex items-center justify-center text-2xl font-bold text-gray-700 mt-2 shadow-sm relative">
                            2
                        </div>
                        <div className="mt-2 text-center">
                            <div className="font-bold text-sm dark:text-gray-200">{top3[1].name}</div>
                            <div className="text-xs text-gray-500">{top3[1].xp} XP</div>
                        </div>
                    </div>
                )}
                
                {/* 1st Place */}
                {top3[0] && (
                    <div className="flex flex-col items-center z-10 -mx-2">
                        <div className="relative">
                            <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 w-8 h-8 fill-current animate-bounce" />
                            <img src={top3[0].avatar} className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl object-cover" alt="" />
                        </div>
                        <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 w-24 h-32 rounded-t-lg flex items-center justify-center text-4xl font-bold text-white mt-3 shadow-lg">
                            1
                        </div>
                        <div className="mt-2 text-center">
                            <div className="font-bold text-base dark:text-white">{top3[0].name}</div>
                            <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{top3[0].xp} XP</div>
                            <div className="flex justify-center gap-1 mt-1">
                                {top3[0].badges?.map(b => <BadgeIcon key={b} name={b} />)}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                    <div className="flex flex-col items-center">
                        <img src={top3[2].avatar} className="w-16 h-16 rounded-full border-4 border-orange-300 shadow-lg object-cover" alt="" />
                        <div className="bg-orange-300 w-20 h-20 rounded-t-lg flex items-center justify-center text-2xl font-bold text-orange-800 mt-2 shadow-sm">
                            3
                        </div>
                        <div className="mt-2 text-center">
                            <div className="font-bold text-sm dark:text-gray-200">{top3[2].name}</div>
                            <div className="text-xs text-gray-500">{top3[2].xp} XP</div>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                {rest.map((u, idx) => (
                    <div key={u.id} className="flex items-center p-4 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="w-8 font-bold text-gray-400 text-center">{idx + 4}</div>
                        <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-100 object-cover ml-4" alt="" />
                        <div className="ml-4 flex-1">
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {u.name}
                                {u.badges?.map(b => <BadgeIcon key={b} name={b} />)}
                            </div>
                        </div>
                        <div className="font-bold text-blue-600 dark:text-blue-400">{u.xp} XP</div>
                    </div>
                ))}
            </div>

            {/* My Rank Footer */}
            {currentUser && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 p-4 shadow-2xl lg:hidden">
                    <div className="flex items-center">
                        <div className="font-bold text-gray-500 mr-4">Вы</div>
                        <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" alt="" />
                        <div className="ml-4 flex-1">
                            <div className="font-bold dark:text-white">{currentUser.name}</div>
                            <div className="text-xs text-gray-500">{currentUser.xp} XP</div>
                        </div>
                        <div className="font-bold text-blue-600 dark:text-blue-400">
                           #{users.findIndex(u => u.id === currentUser.id) + 1}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

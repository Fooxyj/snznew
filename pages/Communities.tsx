
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Community } from '../types';
import { Button } from '../components/ui/Common';
import { Users, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Communities: React.FC = () => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.getCommunities();
                setCommunities(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleJoin = async (id: string, isMember?: boolean) => {
        if (isMember) return; // Already member, go to detail
        try {
            await api.joinCommunity(id);
            // Optimistic update
            setCommunities(prev => prev.map(c => c.id === id ? { ...c, isMember: true, membersCount: c.membersCount + 1 } : c));
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3 dark:text-white">
                <Users className="text-indigo-600 dark:text-indigo-400 w-8 h-8" /> Сообщества Снежинска
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Вступайте в клубы по интересам, находите друзей и обсуждайте важное.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communities.map(c => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gray-100 dark:bg-gray-700 relative">
                            <img src={c.image} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <h3 className="text-white font-bold text-xl text-center px-4 shadow-black drop-shadow-md">{c.name}</h3>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1">{c.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                    {c.membersCount} участников
                                </span>
                                {c.isMember ? (
                                    <Link to={`/community/${c.id}`}>
                                        <Button variant="secondary" size="sm" className="flex items-center gap-2 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                            Открыть <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button size="sm" onClick={() => handleJoin(c.id, c.isMember)}>
                                        Вступить
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Quest } from '../types';
import { Button } from '../components/ui/Common';
import { Map, Loader2, Navigation, CheckCircle2, Trophy } from 'lucide-react';
import { YandexMap } from '../components/YandexMap';

export const Quests: React.FC = () => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);

    const loadData = async () => {
        try {
            const data = await api.getQuests();
            setQuests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCheckIn = (quest: Quest) => {
        setChecking(true);
        if (!navigator.geolocation) {
            alert("Геолокация не поддерживается вашим браузером");
            setChecking(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const reward = await api.completeQuest(quest.id, latitude, longitude);
                    alert(`🎉 Квест пройден! Вы получили ${reward} XP!`);
                    loadData(); // Refresh state
                } catch (e: any) {
                    alert(e.message);
                } finally {
                    setChecking(false);
                }
            },
            (err) => {
                alert("Не удалось определить местоположение. Разрешите доступ к GPS.");
                setChecking(false);
            }
        );
    };

    const handleCheat = async (quest: Quest) => {
        // Dev function to test completion without walking to Siberia
        if (confirm("DEV: Телепортироваться к цели и пройти квест?")) {
             try {
                const reward = await api.completeQuest(quest.id, quest.lat, quest.lng);
                alert(`🎉 Квест пройден! Вы получили ${reward} XP!`);
                loadData();
             } catch (e: any) {
                 alert(e.message);
             }
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    const completedCount = quests.filter(q => q.isCompleted).length;
    const progress = Math.round((completedCount / quests.length) * 100) || 0;

    const markers = quests.map(q => ({
        lat: q.lat,
        lng: q.lng,
        title: q.title
    }));

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen">
            <div className="bg-white p-4 border-b flex justify-between items-center z-10 shadow-sm shrink-0">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Map className="w-6 h-6 text-red-600" /> Городские квесты
                    </h1>
                    <p className="text-sm text-gray-500">Исследуй Снежинск и получай награды</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">{progress}%</div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* List */}
                <div className="w-full lg:w-96 bg-gray-50 overflow-y-auto p-4 space-y-4 border-r order-2 lg:order-1">
                    {quests.map(q => (
                        <div key={q.id} className={`bg-white rounded-xl shadow-sm border p-4 transition-all ${q.isCompleted ? 'opacity-70 grayscale' : 'hover:shadow-md'}`}>
                            <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                                <img src={q.image} className="w-full h-full object-cover" alt="" />
                                <div className="absolute top-2 right-2 bg-black/60 text-yellow-400 font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                    <Trophy className="w-3 h-3" /> {q.xpReward} XP
                                </div>
                                {q.isCompleted && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900">{q.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{q.description}</p>
                            
                            {!q.isCompleted ? (
                                <div className="flex gap-2">
                                    <Button 
                                        className="w-full flex items-center justify-center gap-2" 
                                        onClick={() => handleCheckIn(q)}
                                        disabled={checking}
                                    >
                                        <Navigation className="w-4 h-4" /> {checking ? 'Проверка...' : 'Я на месте'}
                                    </Button>
                                    {/* Dev button hidden on mobile usually */}
                                    <button onClick={() => handleCheat(q)} className="text-xs text-gray-300 px-2">dev</button>
                                </div>
                            ) : (
                                <div className="bg-green-50 text-green-700 text-center py-2 rounded-lg font-bold text-sm">
                                    Выполнено!
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Map */}
                <div className="flex-1 bg-gray-100 relative order-1 lg:order-2 h-64 lg:h-auto">
                     <YandexMap center={[56.08, 60.73]} zoom={13} markers={markers} />
                </div>
            </div>
        </div>
    );
};

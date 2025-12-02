import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Campaign, User } from '../types';
import { Button } from '../components/ui/Common';
import { Heart, Loader2, Share2, Users, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';

const DonateModal: React.FC<{ campaign: Campaign; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ campaign, isOpen, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.donateToCampaign(campaign.id, Number(amount));
            alert("Спасибо за вашу доброту! ❤️");
            onSuccess();
            onClose();
            setAmount('');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <Heart className="w-8 h-8 fill-current" />
                    </div>
                    <h3 className="font-bold text-xl dark:text-white">Помочь проекту</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{campaign.title}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Сумма пожертвования</label>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {['100', '500', '1000'].map(val => (
                                <button 
                                    type="button" 
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className={`py-2 rounded-lg border text-sm font-medium transition-colors ${amount === val ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-300' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
                                >
                                    {val} ₽
                                </button>
                            ))}
                        </div>
                        <input 
                            type="number" 
                            placeholder="Другая сумма" 
                            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            min="10"
                        />
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 shadow-lg shadow-red-200 dark:shadow-none" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Пожертвовать'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const CharityPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const loadData = async () => {
        try {
            const [c, u] = await Promise.all([api.getCampaigns(), api.getCurrentUser()]);
            setCampaigns(c);
            setUser(u);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDonateClick = (campaign: Campaign) => {
        if (!user) {
            alert("Пожалуйста, войдите в систему, чтобы сделать пожертвование.");
            return;
        }
        setSelectedCampaign(campaign);
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8 pb-24">
            {selectedCampaign && (
                <DonateModal 
                    campaign={selectedCampaign} 
                    isOpen={!!selectedCampaign} 
                    onClose={() => setSelectedCampaign(null)} 
                    onSuccess={loadData} 
                />
            )}

            <div className="bg-red-600 rounded-3xl p-8 text-white mb-10 shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
                        <Heart className="w-8 h-8 fill-white" /> Добро Снежинска
                    </h1>
                    <p className="text-lg opacity-90 mb-6">
                        Маленькая помощь лучше большого сочувствия. Поддержите городские инициативы, приюты и тех, кто попал в беду.
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                            <span className="block text-2xl font-bold">{campaigns.length}</span>
                            <span className="text-xs opacity-80">Активных сборов</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                            <span className="block text-2xl font-bold">{Math.floor(campaigns.reduce((acc, c) => acc + c.collectedAmount, 0) / 1000)}k+</span>
                            <span className="text-xs opacity-80">Рублей собрано</span>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
                <Heart className="absolute -bottom-10 -right-10 w-64 h-64 text-red-500 fill-current opacity-50 rotate-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.map(camp => {
                    const percent = Math.min(100, Math.round((camp.collectedAmount / camp.targetAmount) * 100));
                    return (
                        <div key={camp.id} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                            <div className="h-48 relative">
                                <img src={camp.image} className="w-full h-full object-cover" alt="" />
                                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-md">
                                    {camp.organizerName}
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{camp.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-1">{camp.description}</p>
                                
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm font-medium mb-2 dark:text-gray-300">
                                        <span>Собрано {camp.collectedAmount.toLocaleString()} ₽</span>
                                        <span className="text-gray-400">из {camp.targetAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-xs text-red-500 font-bold mt-1">{percent}%</div>
                                </div>

                                <Button 
                                    className="w-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 border-none"
                                    onClick={() => handleDonateClick(camp)}
                                >
                                    Помочь сейчас
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
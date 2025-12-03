
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Coupon, UserCoupon, User } from '../types';
import { Button, XPBar } from '../components/ui/Common';
import { Gift, Loader2, Coins, Tag, ShoppingBag, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BonusShop: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');

    const loadData = async () => {
        try {
            const [c, u] = await Promise.all([api.getCoupons(), api.getCurrentUser()]);
            setCoupons(c);
            setUser(u);
            if (u) {
                const mc = await api.getMyCoupons();
                setMyCoupons(mc);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleBuy = async (coupon: Coupon) => {
        if (!user) return alert("Войдите, чтобы покупать");
        if (confirm(`Купить "${coupon.title}" за ${coupon.price} XP?`)) {
            setBuyingId(coupon.id);
            try {
                await api.buyCoupon(coupon.id);
                alert("Купон успешно куплен! Код доступен во вкладке 'Мои купоны'.");
                // Reload data to update XP and Inventory
                loadData();
            } catch (e: any) {
                alert(e.message);
            } finally {
                setBuyingId(null);
            }
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-3xl text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Gift className="w-8 h-8 text-yellow-300" /> Магазин Бонусов
                    </h1>
                    <p className="opacity-90 mt-2 max-w-xl">
                        Обменивайте накопленный опыт (XP) на реальные скидки и подарки от партнеров города.
                    </p>
                </div>
                {user ? (
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl min-w-[200px] border border-white/20">
                        <div className="text-sm opacity-80 mb-1">Ваш баланс</div>
                        <div className="text-3xl font-bold text-yellow-300 flex items-center gap-2">
                            {user.xp} <span className="text-base font-medium text-white">XP</span>
                        </div>
                    </div>
                ) : (
                    <Link to="/auth">
                        <Button variant="secondary" className="text-purple-600 border-none hover:bg-purple-50 shadow-lg">
                            Войти в профиль
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex border-b dark:border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('shop')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'shop' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <ShoppingBag className="w-4 h-4" /> Витрина
                </button>
                <button 
                    onClick={() => setActiveTab('inventory')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'inventory' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Tag className="w-4 h-4" /> Мои купоны ({myCoupons.length})
                </button>
            </div>

            {activeTab === 'shop' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(coupon => (
                        <div key={coupon.id} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="h-48 relative">
                                <img src={coupon.image} alt="" className="w-full h-full object-cover" />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-purple-700 font-bold px-3 py-1 rounded-full text-sm shadow-sm flex items-center gap-1">
                                    <Coins className="w-3 h-3" /> {coupon.price} XP
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wide">{coupon.partnerName}</div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{coupon.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1">{coupon.description}</p>
                                <Button 
                                    onClick={() => handleBuy(coupon)} 
                                    disabled={!user || user.xp < coupon.price || buyingId === coupon.id}
                                    className={`w-full ${(!user || user.xp < coupon.price) ? 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700 dark:text-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    {buyingId === coupon.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (!user || user.xp < coupon.price) ? 'Недостаточно XP' : 'Купить за баллы'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {myCoupons.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">У вас пока нет купонов. Самое время что-нибудь купить!</div>
                    ) : (
                        myCoupons.map(mc => (
                            <div key={mc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                                <img src={mc.couponImage} alt="" className="w-24 h-24 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold dark:text-white">{mc.couponTitle}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Покажите этот код на кассе</p>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center min-w-[200px]">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ваш промокод</div>
                                    <div className="text-xl font-mono font-bold tracking-widest text-gray-800 dark:text-gray-200">{mc.code}</div>
                                </div>
                                <div className="text-green-500 flex items-center gap-2 font-medium">
                                    <CheckCircle className="w-5 h-5" /> Активен
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

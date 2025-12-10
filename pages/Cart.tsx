
import React, { useState } from 'react';
import { useCart } from '../components/CartProvider';
import { Button } from '../components/ui/Common';
import { Trash2, ShoppingCart, ArrowLeft, Loader2, CreditCard, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/ToastProvider';

export const CartPage: React.FC = () => {
    const { items = [], removeFromCart, clearCart, cartTotal, businessId } = useCart();
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useToast();

    const handleOrder = async () => {
        const user = await api.getCurrentUser();
        if (!user) {
            if (confirm("Для оформления заказа необходимо войти в систему. Перейти к входу?")) {
                navigate('/auth');
            }
            return;
        }

        if (!businessId) return;
        if (!address.trim()) {
            showError("Укажите адрес доставки");
            return;
        }
        
        setLoading(true);
        try {
            await api.createOrder(
                businessId, 
                items.map(i => ({ productName: i.name, price: i.price, quantity: i.quantity })),
                address,
                cartTotal
            );
            clearCart();
            success("Заказ оформлен! Отслеживайте статус в профиле.");
            navigate('/profile');
        } catch (e: any) {
            showError("Ошибка: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center p-4">
                <ShoppingCart className="w-24 h-24 text-gray-200 dark:text-gray-700 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Корзина пуста</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Посмотрите каталог заведений, там много вкусного!</p>
                <Link to="/category/cafe">
                    <Button>Перейти к покупкам</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 dark:text-white">
                <ShoppingCart className="w-8 h-8 text-blue-600" /> Оформление заказа
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden mb-6">
                <div className="divide-y dark:divide-gray-700">
                    {items.map(item => (
                        <div key={item.id} className="p-4 flex items-center gap-4">
                            <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                <p className="text-gray-500 text-sm">{item.quantity} x {item.price} ₽</p>
                            </div>
                            <div className="font-bold text-lg dark:text-gray-200">{item.price * item.quantity} ₽</div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 flex justify-between items-center border-t dark:border-gray-700">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Итого:</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cartTotal} ₽</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6 space-y-4">
                <h3 className="font-bold text-lg dark:text-white">Доставка</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Адрес</label>
                    <input 
                        type="text" 
                        className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2.5"
                        placeholder="Улица, дом, подъезд, этаж"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Способ оплаты</label>
                    <div className="flex gap-2">
                        <div className="flex-1 border dark:border-gray-600 rounded-lg p-3 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 cursor-pointer">
                            <CreditCard className="w-4 h-4" /> Картой онлайн
                        </div>
                        <div className="flex-1 border dark:border-gray-600 rounded-lg p-3 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 opacity-50 cursor-not-allowed">
                            <Clock className="w-4 h-4" /> При получении
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-gray-300" onClick={() => navigate(-1)}>
                    Назад
                </Button>
                <Button className="flex-[2]" onClick={handleOrder} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Оплатить заказ'}
                </Button>
            </div>
        </div>
    );
};

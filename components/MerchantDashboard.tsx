
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Shop, Product, PaymentConfig, Movie } from '../types';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';

interface MerchantDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    shop: Shop;
    onUpdateShop: (updatedShop: Shop) => void;
    movies?: Movie[];
    onUpdateMovies?: (movies: Movie[]) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ isOpen, onClose, shop, onUpdateShop, movies, onUpdateMovies }) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'info' | 'products' | 'settings' | 'movies' | 'integration' | 'analytics'>('info');
    const [formData, setFormData] = useState<Shop>(shop);
    const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({ title: '', price: 0, image: '', description: '' });

    // Cinema State
    const isCinema = shop.id.includes('cinema');
    const [isEditingMovie, setIsEditingMovie] = useState<boolean>(false);

    // Use a separate local state for the form to handle string inputs safely
    const [movieForm, setMovieForm] = useState({
        title: '',
        genre: '',
        rating: '',
        ageLimit: '',
        showtimes: '', // String input
        price: '',     // String input
        image: ''
    });

    const [integrationUrl, setIntegrationUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    // Payment Config State
    const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(shop.paymentConfig || {
        enabled: false,
        type: 'manual',
        phone: shop.phone
    });

    const [isUploading, setIsUploading] = useState(false);

    // Analytics State
    const [stats, setStats] = useState<any[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    useEffect(() => {
        setFormData(shop);
        setPaymentConfig(shop.paymentConfig || { enabled: false, type: 'manual', phone: shop.phone });
    }, [shop]);

    useEffect(() => {
        if (activeTab === 'analytics') {
            fetchStats();
        }
    }, [activeTab]);

    if (!isOpen) return null;

    const fetchStats = async () => {
        setIsLoadingStats(true);
        try {
            const { data, error } = await supabase
                .from('business_stats')
                .select('*')
                .eq('business_id', shop.id)
                .order('date', { ascending: true })
                .limit(7);

            if (error) throw error;
            setStats(data || []);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setIsLoadingStats(false);
        }
    };

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'header') => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const bucket = 'business-images';
                const url = await api.uploadFile(file, bucket);

                setFormData(prev => ({ ...prev, [field]: url }));
                alert(`✅ ${field === 'avatar' ? 'Аватар' : 'Обложка'} успешно загружен${field === 'avatar' ? '' : 'а'}!`);
            } catch (err: any) {
                console.error('Image upload error:', err);
                let msg = 'Ошибка загрузки изображения';

                if (err.message && err.message.includes('BLOCKED_BY_CLIENT')) {
                    msg = '🚫 Загрузка заблокирована браузером. Отключите AdBlock или расширения блокировки.';
                } else if (err.message && err.message.includes('bucket')) {
                    msg = '⚠️ Хранилище изображений не настроено. Запустите миграцию migration_fix_business_storage.sql';
                } else if (err.message && err.message.includes('not found')) {
                    msg = '⚠️ Bucket не найден. Создайте bucket "business-images" в Supabase Storage.';
                } else if (err.message) {
                    msg = `Ошибка: ${err.message}`;
                }

                alert(msg);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Необходимо войти в систему');
                return;
            }

            // Проверяем, является ли ID бизнеса валидным UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(shop.id)) {
                alert('⚠️ Этот бизнес является демонстрационным и не может быть отредактирован.\n\nДля управления реальным бизнесом:\n1. Подайте заявку через "Для бизнеса"\n2. Дождитесь одобрения администратора\n3. После одобрения вы сможете редактировать свой бизнес');
                return;
            }

            // Update in Supabase
            const businessData = {
                description: formData.description,
                address: formData.address,
                phone: formData.phone,
                hours: formData.workingHours,
                avatar: formData.logo,
                header: formData.coverImage,
                email: '',
                contact_person: ''
            };

            const { error } = await supabase
                .from('managed_businesses')
                .update({
                    business_name: formData.name,
                    business_data: businessData,
                    last_edited_by: user.id
                })
                .eq('id', shop.id);

            if (error) throw error;

            onUpdateShop(formData);
            queryClient.invalidateQueries({ queryKey: ['managed_businesses'] });
            alert('✅ Информация о бизнесе успешно обновлена!');
        } catch (err: any) {
            console.error('Error updating business:', err);
            let errorMessage = 'Ошибка сохранения: ';

            if (err.message.includes('uuid')) {
                errorMessage += 'Неверный формат ID бизнеса. Обратитесь к администратору.';
            } else if (err.message.includes('not found')) {
                errorMessage += 'Бизнес не найден в базе данных.';
            } else {
                errorMessage += err.message;
            }

            alert(errorMessage);
        }
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedShop = { ...formData, paymentConfig };
        setFormData(updatedShop);
        onUpdateShop(updatedShop);
        alert('Настройки оплаты сохранены!');
    };

    const handleDeleteProduct = (productId: string) => {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            const updatedProducts = formData.products.filter(p => p.id !== productId);
            const updatedShop = { ...formData, products: updatedProducts };
            setFormData(updatedShop);
            onUpdateShop(updatedShop);
        }
    };

    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.title || !newProduct.price) return;

        const product: Product = {
            id: Date.now().toString(),
            title: newProduct.title,
            price: Number(newProduct.price),
            image: newProduct.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', // Placeholder
            description: newProduct.description
        };

        const updatedShop = { ...formData, products: [product, ...formData.products] };
        setFormData(updatedShop);
        onUpdateShop(updatedShop);
        setIsEditingProduct(false);
        setNewProduct({ title: '', price: 0, image: '', description: '' });
    };

    // Cinema Logic
    const handleAddMovie = (e: React.FormEvent) => {
        e.preventDefault();
        if (!movieForm.title || !onUpdateMovies || !movies) return;

        const movie: Movie = {
            id: Date.now().toString(),
            title: movieForm.title,
            genre: movieForm.genre || 'Кино',
            rating: movieForm.rating || '0',
            ageLimit: movieForm.ageLimit || '0+',
            image: movieForm.image || 'https://avatars.mds.yandex.net/get-kinopoisk-image/10535692/d4050d27-6f01-49b0-9f1c-755106596131/1920x',
            description: '',
            showtimes: movieForm.showtimes.split(',').map(s => s.trim()).filter(Boolean),
            price: Number(movieForm.price)
        };

        onUpdateMovies([...movies, movie]);
        setIsEditingMovie(false);
        setMovieForm({ title: '', genre: '', rating: '', ageLimit: '', showtimes: '', price: '', image: '' });
    };

    const handleDeleteMovie = (id: string) => {
        if (confirm('Удалить фильм из расписания?') && onUpdateMovies && movies) {
            onUpdateMovies(movies.filter(m => m.id !== id));
        }
    };

    const handleSyncSite = () => {
        setIsSyncing(true);
        // Simulate API call
        setTimeout(() => {
            setIsSyncing(false);
            alert('Данные успешно синхронизированы с внешним сайтом!');
        }, 2000);
    };

    const maxViews = Math.max(...stats.map(s => s.views), 10);

    return (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div
                className="bg-background w-full max-w-5xl rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col h-[85vh]"
                onClick={e => e.stopPropagation()}
            >

                {/* Header */}
                <div className="px-8 py-5 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-dark">Кабинет партнера</h2>
                            <p className="text-xs text-secondary">Управление: {formData.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'info' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Информация
                        </button>

                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'analytics' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Аналитика
                        </button>

                        {isCinema ? (
                            <>
                                <button
                                    onClick={() => setActiveTab('movies')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                                ${activeTab === 'movies' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                                >
                                    <span className="text-lg leading-none">🎬</span>
                                    Репертуар
                                </button>
                                <button
                                    onClick={() => setActiveTab('integration')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                                ${activeTab === 'integration' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Интеграция
                                </button>
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                                ${activeTab === 'products' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    Бар
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                            ${activeTab === 'products' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                Товары / Меню
                            </button>
                        )}

                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'settings' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Настройки оплаты
                        </button>
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Закрыть
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">

                        {activeTab === 'analytics' && (
                            <div className="max-w-4xl">
                                <h3 className="text-2xl font-bold text-dark mb-6">Аналитика переходов</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-secondary text-sm font-medium mb-1">Просмотры (7 дней)</p>
                                        <p className="text-3xl font-bold text-dark">
                                            {stats.reduce((acc, curr) => acc + curr.views, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-secondary text-sm font-medium mb-1">Клики (7 дней)</p>
                                        <p className="text-3xl font-bold text-primary">
                                            {stats.reduce((acc, curr) => acc + curr.clicks, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-secondary text-sm font-medium mb-1">Заказы (7 дней)</p>
                                        <p className="text-3xl font-bold text-green-500">
                                            {stats.reduce((acc, curr) => acc + curr.orders, 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-dark mb-6">График просмотров</h4>
                                    <div className="h-64 flex items-end justify-between gap-2">
                                        {stats.map((stat, idx) => (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div
                                                    className="w-full bg-primary/20 rounded-t-lg transition-all group-hover:bg-primary/40 relative"
                                                    style={{ height: `${(stat.views / maxViews) * 100}%` }}
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {stat.views}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-secondary">
                                                    {new Date(stat.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        ))}
                                        {stats.length === 0 && (
                                            <div className="w-full h-full flex items-center justify-center text-secondary">
                                                Нет данных за этот период
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className="max-w-2xl">
                                <h3 className="text-2xl font-bold text-dark mb-6">Настройки {isCinema ? 'Кинотеатра' : 'Магазина'}</h3>
                                <form onSubmit={handleSaveInfo} className="space-y-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">Логотип (Аватар)</label>
                                            <div className="flex items-center gap-4">
                                                {formData.logo && <img src={formData.logo} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-100" />}
                                                <label className={`cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-secondary transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    {isUploading ? '...' : 'Изменить'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={isUploading} />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">Обложка (Шапка)</label>
                                            <div className="flex items-center gap-4">
                                                {formData.coverImage && <img src={formData.coverImage} alt="Cover" className="w-32 h-16 rounded-xl object-cover border border-gray-100" />}
                                                <label className={`cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-secondary transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    {isUploading ? '...' : 'Изменить'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'header')} disabled={isUploading} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">Название</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInfoChange}
                                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">Телефон</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInfoChange}
                                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-dark mb-2">Описание</label>
                                        <textarea
                                            name="description"
                                            rows={4}
                                            value={formData.description}
                                            onChange={handleInfoChange}
                                            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">Адрес</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInfoChange}
                                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">Режим работы</label>
                                            <input
                                                type="text"
                                                name="workingHours"
                                                value={formData.workingHours}
                                                onChange={handleInfoChange}
                                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                                            Сохранить изменения
                                        </button>
                                    </div>

                                </form>
                            </div>
                        )}

                        {activeTab === 'movies' && isCinema && movies && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-dark">Репертуар</h3>
                                    <button
                                        onClick={() => setIsEditingMovie(true)}
                                        className="bg-dark text-white font-bold text-sm py-2 px-4 rounded-xl hover:bg-black transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Добавить фильм
                                    </button>
                                </div>

                                {isEditingMovie && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6 animate-fade-in-up">
                                        <h4 className="font-bold text-lg mb-4">Новый сеанс</h4>
                                        <form onSubmit={handleAddMovie} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input type="text" placeholder="Название фильма" value={movieForm.title} onChange={e => setMovieForm({ ...movieForm, title: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4" required />
                                                <input type="text" placeholder="Жанр" value={movieForm.genre} onChange={e => setMovieForm({ ...movieForm, genre: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4" />
                                                <input type="text" placeholder="Рейтинг (7.8)" value={movieForm.rating} onChange={e => setMovieForm({ ...movieForm, rating: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4" />
                                                <input type="text" placeholder="Возраст (16+)" value={movieForm.ageLimit} onChange={e => setMovieForm({ ...movieForm, ageLimit: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4" />
                                                <input type="text" placeholder="Сеансы (через запятую: 10:00, 12:00)" value={movieForm.showtimes} onChange={e => setMovieForm({ ...movieForm, showtimes: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4" />
                                                <input type="number" placeholder="Цена билета" value={movieForm.price} onChange={e => setMovieForm({ ...movieForm, price: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4" required />
                                                <input type="text" placeholder="Ссылка на обложку" value={movieForm.image} onChange={e => setMovieForm({ ...movieForm, image: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4" />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button type="button" onClick={() => setIsEditingMovie(false)} className="text-secondary font-medium px-4 py-2 hover:bg-gray-100 rounded-lg">Отмена</button>
                                                <button type="submit" className="bg-primary text-white font-bold px-6 py-2 rounded-lg">Добавить</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {movies.map(movie => (
                                        <div key={movie.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-4">
                                            <div className="w-full sm:w-24 h-32 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                                                <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-dark text-lg">{movie.title}</h4>
                                                    <button onClick={() => handleDeleteMovie(movie.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Удалить</button>
                                                </div>
                                                <p className="text-sm text-secondary mb-2">{movie.genre} | {movie.ageLimit}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {movie.showtimes.map(time => (
                                                        <span key={time} className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-dark">{time}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'integration' && isCinema && (
                            <div className="max-w-2xl">
                                <h3 className="text-2xl font-bold text-dark mb-4">Интеграция с сайтом</h3>
                                <p className="text-secondary mb-6 text-sm leading-relaxed">
                                    Если у вашего кинотеатра есть свой сайт, мы можем автоматически загружать расписание и свободные места оттуда.
                                    Для этого укажите ссылку на XML/JSON фид или API вашего сайта.
                                </p>

                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-dark mb-2">Адрес сайта / API Endpoint</label>
                                        <input
                                            type="text"
                                            placeholder="https://mysite.ru/api/feed.xml"
                                            value={integrationUrl}
                                            onChange={e => setIntegrationUrl(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="autoSync" className="w-4 h-4 text-primary rounded" />
                                        <label htmlFor="autoSync" className="text-sm text-dark cursor-pointer">Автоматически обновлять каждый час</label>
                                    </div>

                                    <button
                                        onClick={handleSyncSite}
                                        disabled={isSyncing || !integrationUrl}
                                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                    ${isSyncing ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-primary-dark shadow-primary/20'}`}
                                    >
                                        {isSyncing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Загрузка данных...
                                            </>
                                        ) : (
                                            'Синхронизировать сейчас'
                                        )}
                                    </button>
                                </div>

                                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <h4 className="font-bold text-blue-800 text-sm mb-1">Справка для разработчиков</h4>
                                    <p className="text-xs text-blue-700">
                                        Мы поддерживаем форматы: Afisha XML, Yandex Feed, JSON Custom.
                                        <br />Для настройки API ключа обратитесь в поддержку платформы.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-dark">{isCinema ? 'Бар и Снеки' : 'Товары и Услуги'}</h3>
                                    <button
                                        onClick={() => setIsEditingProduct(true)}
                                        className="bg-dark text-white font-bold text-sm py-2 px-4 rounded-xl hover:bg-black transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Добавить товар
                                    </button>
                                </div>

                                {isEditingProduct && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6 animate-fade-in-up">
                                        <h4 className="font-bold text-lg mb-4">Новый товар</h4>
                                        <form onSubmit={handleAddProduct} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Название товара"
                                                    value={newProduct.title}
                                                    onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                                    className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Цена (₽)"
                                                    value={newProduct.price || ''}
                                                    onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                                    className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <textarea
                                                    placeholder="Описание товара (состав, характеристики, вес...)"
                                                    value={newProduct.description || ''}
                                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 resize-none h-20"
                                                ></textarea>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingProduct(false)}
                                                    className="text-secondary font-medium px-4 py-2 hover:bg-gray-100 rounded-lg"
                                                >
                                                    Отмена
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="bg-primary text-white font-bold px-6 py-2 rounded-lg"
                                                >
                                                    Добавить
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {formData.products.map(product => (
                                        <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex gap-4 items-center group">
                                            <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-bold text-dark truncate">{product.title}</h4>
                                                <p className="text-primary font-bold text-sm">{product.price} ₽</p>
                                                {product.description && <p className="text-xs text-gray-400 truncate">{product.description}</p>}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Удалить"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="max-w-2xl">
                                <h3 className="text-2xl font-bold text-dark mb-6">Настройки приема платежей</h3>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        <strong>Важно:</strong> Вы можете выбрать, как принимать заказы.
                                        <br />1. <strong>"Заказ в мессенджер"</strong> — клиент формирует корзину, а заказ отправляется вам в WhatsApp/Telegram.
                                        <br />2. <strong>"Онлайн-оплата"</strong> — прямое подключение вашей кассы (требуется договор с эквайрингом).
                                    </p>
                                </div>

                                <form onSubmit={handleSaveSettings} className="space-y-6">

                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                        <label className="flex items-center justify-between cursor-pointer mb-4">
                                            <span className="font-bold text-dark">Принимать онлайн-платежи</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={paymentConfig.enabled}
                                                    onChange={e => setPaymentConfig({ ...paymentConfig, enabled: e.target.checked })}
                                                />
                                                <div className={`w-14 h-8 rounded-full shadow-inner transition-colors ${paymentConfig.enabled ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${paymentConfig.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </label>

                                        {paymentConfig.enabled ? (
                                            <div className="mt-4 animate-fade-in-up">
                                                <label className="block text-sm font-bold text-dark mb-2">Настройки Эквайринга (API)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Введите ваш Shop ID / Secret Key"
                                                    value={paymentConfig.details || ''}
                                                    onChange={e => setPaymentConfig({ ...paymentConfig, details: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                                <p className="text-xs text-secondary mt-2">
                                                    Мы поддерживаем прямую интеграцию с ЮKassa, CloudPayments и Т-Банк.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mt-4 animate-fade-in-up">
                                                <label className="block text-sm font-bold text-dark mb-2">Номер для заказов (WhatsApp)</label>
                                                <input
                                                    type="tel"
                                                    placeholder="+7 (999) 000-00-00"
                                                    value={paymentConfig.phone || ''}
                                                    onChange={e => setPaymentConfig({ ...paymentConfig, phone: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                                <p className="text-xs text-secondary mt-2">
                                                    Заказы из корзины будут формироваться в сообщение и открывать WhatsApp чат с этим номером.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                                            Сохранить настройки
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

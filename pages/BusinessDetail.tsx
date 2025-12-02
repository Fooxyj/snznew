
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Business, Review, Product, User, Service } from '../types';
import { Button } from '../components/ui/Common';
import { MapPin, Phone, Clock, Loader2, Star, ChevronLeft, ShoppingBag, Plus, X, Upload, Calendar, Clock4, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../components/CartProvider';

declare global {
  interface Window { L: any; }
}

const CreateProductModal: React.FC<{ businessId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ businessId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '', category: 'Товары' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createProduct({ ...formData, businessId, price: Number(formData.price) });
            onSuccess();
            onClose();
            setFormData({ name: '', description: '', price: '', image: '', category: 'Товары' });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Добавить товар/услугу</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Название</label>
                        <input className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Цена (₽)</label>
                        <input type="number" className="w-full border rounded-lg p-2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    </div>
                    <div>
                         <label className="text-xs font-bold text-gray-500">Категория</label>
                         <select className="w-full border rounded-lg p-2 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                             <option>Еда</option>
                             <option>Напитки</option>
                             <option>Товары</option>
                             <option>Услуги</option>
                         </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Описание</label>
                        <textarea className="w-full border rounded-lg p-2 resize-none" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {formData.image ? (
                            <img src={formData.image} alt="" className="h-24 mx-auto rounded object-cover" />
                        ) : (
                            <div className="relative cursor-pointer">
                                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">{uploading ? "..." : "Фото"}</span>
                                <input type="file" className="absolute inset-0 opacity-0" onChange={handleImageUpload} />
                            </div>
                        )}
                    </div>
                    <Button className="w-full" disabled={loading || uploading}>{loading ? <Loader2 className="animate-spin" /> : 'Добавить'}</Button>
                </form>
            </div>
        </div>
    );
};

const CreateServiceModal: React.FC<{ businessId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ businessId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', price: '', durationMin: '60' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createService({ ...formData, businessId, price: Number(formData.price), durationMin: Number(formData.durationMin) });
            onSuccess();
            onClose();
            setFormData({ title: '', price: '', durationMin: '60' });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Добавить услугу для записи</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Название услуги</label>
                        <input className="w-full border rounded-lg p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Мужская стрижка" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Цена (₽)</label>
                            <input type="number" className="w-full border rounded-lg p-2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Длительность (мин)</label>
                            <input type="number" className="w-full border rounded-lg p-2" value={formData.durationMin} onChange={e => setFormData({...formData, durationMin: e.target.value})} required />
                        </div>
                    </div>
                    <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Создать'}</Button>
                </form>
            </div>
        </div>
    );
};

const BookingModal: React.FC<{ service: Service | null; isOpen: boolean; onClose: () => void }> = ({ service, isOpen, onClose }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock slots generator
    const generateSlots = () => {
        const slots = [];
        for (let i = 10; i < 20; i++) {
            slots.push(`${i}:00`);
            slots.push(`${i}:30`);
        }
        return slots;
    };
    const slots = generateSlots();

    if (!isOpen || !service) return null;

    const handleBook = async () => {
        if (!selectedDate || !selectedTime) return alert("Выберите дату и время");
        setLoading(true);
        try {
            await api.bookService(service, selectedDate, selectedTime);
            alert("Вы успешно записаны!");
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg">Запись онлайн</h3>
                        <p className="text-blue-600 font-medium">{service.title}</p>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Дата</label>
                        <input 
                            type="date" 
                            className="w-full border rounded-lg p-2" 
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                        />
                    </div>
                    
                    {selectedDate && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block">Свободное время</label>
                            <div className="grid grid-cols-4 gap-2">
                                {slots.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2 text-sm rounded-lg border transition-colors ${selectedTime === time ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-blue-50 border-gray-200'}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t flex justify-between items-center">
                        <div>
                            <div className="text-xs text-gray-400">Стоимость</div>
                            <div className="font-bold text-lg">{service.price} ₽</div>
                        </div>
                        <Button onClick={handleBook} disabled={loading || !selectedTime}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Подтвердить запись'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BusinessDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<Business | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<'menu' | 'services' | 'reviews'>('menu');
    const [user, setUser] = useState<User | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    
    // Cart Hook
    const { addToCart, cartCount } = useCart();
    
    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [bookingService, setBookingService] = useState<Service | null>(null);
    
    // Map
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    // Reviews
    const [newReviewText, setNewReviewText] = useState('');
    const [rating, setRating] = useState(5);

    const loadData = async () => {
        if (!id) return;
        try {
            const [b, p, s, r, u] = await Promise.all([
                api.getBusinessById(id),
                api.getProducts(id),
                api.getServices(id),
                api.getReviews(id),
                api.getCurrentUser()
            ]);
            setBusiness(b);
            setProducts(p);
            setServices(s);
            setReviews(r);
            setUser(u);
            if (u && b && u.id === b.authorId) setIsOwner(true);
            
            // Default tab logic
            if (p.length === 0 && s.length > 0) setActiveTab('services');
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        if (business && mapRef.current && window.L && !mapInstance.current) {
            mapInstance.current = window.L.map(mapRef.current).setView([business.lat, business.lng], 15);
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
            window.L.marker([business.lat, business.lng]).addTo(mapInstance.current).bindPopup(business.name).openPopup();
        }
    }, [business]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            await api.addReview(id, rating, newReviewText);
            setNewReviewText('');
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleDeleteProduct = async (pid: string) => {
        if (!confirm("Удалить этот товар?")) return;
        try {
            await api.deleteProduct(pid);
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleDeleteService = async (sid: string) => {
        if (!confirm("Удалить эту услугу?")) return;
        try {
            await api.deleteService(sid);
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (!business) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            {id && <CreateProductModal businessId={id} isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSuccess={loadData} />}
            {id && <CreateServiceModal businessId={id} isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onSuccess={loadData} />}
            <BookingModal service={bookingService} isOpen={!!bookingService} onClose={() => setBookingService(null)} />

            <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Назад
                </button>
            </div>

            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
                <div className="h-48 md:h-64 relative">
                    <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h1 className="text-3xl font-bold">{business.name}</h1>
                        <p className="opacity-90">{business.category}</p>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <p className="text-gray-700 dark:text-gray-300">{business.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {business.address}</div>
                            <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {business.workHours}</div>
                            <div className="flex items-center"><Phone className="w-4 h-4 mr-2" /> {business.phone}</div>
                        </div>
                    </div>
                    <div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl h-40 w-full z-0 overflow-hidden" ref={mapRef}></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('menu')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'menu' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <ShoppingBag className="w-4 h-4" /> Меню / Товары
                </button>
                <button 
                    onClick={() => setActiveTab('services')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'services' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Calendar className="w-4 h-4" /> Услуги / Запись
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Star className="w-4 h-4" /> Отзывы ({reviews.length})
                </button>
            </div>

            {activeTab === 'menu' && (
                <div>
                    {isOwner && (
                        <Button onClick={() => setIsProductModalOpen(true)} className="mb-6 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Добавить товар
                        </Button>
                    )}

                    {products.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>В меню пока пусто</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {products.map(p => (
                                <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex gap-4 hover:shadow-md transition-shadow relative group">
                                    <img src={p.image} alt="" className="w-24 h-24 rounded-lg object-cover bg-gray-100 shrink-0" />
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{p.name}</h3>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">{p.price} ₽</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">{p.description}</p>
                                        <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300" onClick={() => addToCart(p)}>
                                            <Plus className="w-4 h-4 mr-1" /> В корзину
                                        </Button>
                                    </div>
                                    {isOwner && (
                                        <button 
                                            onClick={() => handleDeleteProduct(p.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'services' && (
                <div>
                    {isOwner && (
                         <Button onClick={() => setIsServiceModalOpen(true)} className="mb-6 flex items-center gap-2">
                             <Plus className="w-4 h-4" /> Добавить услугу
                         </Button>
                    )}
                    
                    {services.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed">
                             <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                             <p>Нет услуг для онлайн-записи</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map(s => (
                                <div key={s.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative group">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{s.title}</h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Clock4 className="w-3 h-3" /> {s.durationMin} мин</span>
                                            <span className="font-medium text-blue-600 dark:text-blue-400">{s.price} ₽</span>
                                        </div>
                                    </div>
                                    <Button onClick={() => setBookingService(s)}>Записаться</Button>
                                    {isOwner && (
                                        <button 
                                            onClick={() => handleDeleteService(s.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="space-y-6">
                    <form onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border dark:border-gray-700">
                        <h4 className="font-bold mb-2 dark:text-white">Оставить отзыв</h4>
                        <div className="flex gap-2 mb-2">
                            {[1,2,3,4,5].map(s => (
                                <button type="button" key={s} onClick={() => setRating(s)}>
                                    <Star className={`w-5 h-5 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                </button>
                            ))}
                        </div>
                        <textarea 
                            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2 text-sm resize-none mb-2" 
                            rows={3} 
                            placeholder="Ваш отзыв..."
                            required
                            value={newReviewText}
                            onChange={e => setNewReviewText(e.target.value)}
                        />
                        <Button size="sm">Отправить</Button>
                    </form>

                    {reviews.map(r => (
                        <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    {r.authorAvatar ? (
                                        <img src={r.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                                            {r.authorName ? r.authorName[0] : '?'}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-bold dark:text-white text-sm">{r.authorName}</div>
                                        <div className="flex text-yellow-400">
                                            {[1,2,3,4,5].map(s => (
                                                <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">{r.date}</div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm pl-11">{r.text}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Cart Button */}
            {cartCount > 0 && activeTab === 'menu' && (
                <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30">
                    <Link to="/cart">
                        <div className="bg-blue-600 text-white p-4 rounded-full shadow-xl flex items-center gap-3 hover:bg-blue-700 transition-colors animate-in zoom-in">
                            <ShoppingCart className="w-6 h-6" />
                            <span className="font-bold">{cartCount} шт.</span>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
};

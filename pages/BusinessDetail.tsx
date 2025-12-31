
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, Service, Event, UserRole, Business } from '../types';
import { Button, formatAddress, formatPhone } from '../components/ui/Common';
import { MapPin, Phone, Clock, Loader2, Star, ChevronLeft, ShoppingBag, Plus, X, Calendar, Clock4, Trash2, Film, CreditCard, Globe, MessageCircle, Heart, User, Sparkles, ExternalLink } from 'lucide-react';
import { YandexMap } from '../components/YandexMap';
import { CreateEventModal } from '../components/CreateEventModal';
import { SeatPicker } from '../components/ui/SeatPicker';
import { CreateProductModal, CreateServiceModal } from '../components/CRMModals';
import { NotFound } from './NotFound';

export const BusinessDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [activeTab, setActiveTab] = useState<'menu' | 'services' | 'reviews'>('menu');
    
    const { data: business, isLoading: businessLoading } = useQuery({
        queryKey: ['business', id],
        queryFn: () => api.getBusinessById(id!),
        enabled: !!id
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products', id],
        queryFn: () => api.getProducts(id!),
        enabled: !!id
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services', id],
        queryFn: () => api.getServices(id!),
        enabled: !!id
    });

    const { data: reviews = [] } = useQuery({
        queryKey: ['reviews', id],
        queryFn: () => api.getReviews(id!),
        enabled: !!id
    });

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const handleCall = () => {
        if (!user) {
            if(confirm("Войдите в систему, чтобы позвонить. Перейти?")) navigate('/auth');
            return;
        }
        if (business?.phone) {
            window.location.href = `tel:${business.phone}`;
        }
    };

    const handleVisitWebsite = () => {
        if (business?.website) {
            const url = business.website.startsWith('http') ? business.website : `https://${business.website}`;
            window.open(url, '_blank');
        } else {
            handleCall();
        }
    };

    const handleContactShop = async (item?: Product | Service | Event, type?: 'product' | 'service' | 'event') => {
        if (!user) {
            if (confirm("Необходимо войти, чтобы написать. Перейти?")) navigate('/auth');
            return;
        }
        if (!business) return;

        try {
            let contextMsg = `Здравствуйте! Пишу по поводу вашего бизнеса "${business.name}"`;
            
            if (item && type) {
                const title = (item as any).name || (item as any).title;
                const price = (item as any).price ? `${(item as any).price.toLocaleString()} ₽` : 'Цена не указана';
                
                contextMsg = JSON.stringify({
                    type: 'ad_inquiry', 
                    adId: item.id,
                    businessId: business.id,
                    title: title,
                    price: price,
                    image: (item as any).image || business.image,
                    text: `Здравствуйте! Меня заинтересовал ваш ${type === 'product' ? 'товар' : 'услуга'}: "${title}".`
                });
            }

            const partnerId = business.authorId;
            if (!partnerId) {
                alert("Ошибка: владелец не найден.");
                return;
            }

            const chatId = await api.startChat(partnerId, contextMsg, business.id);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) {
            alert("Ошибка: " + e.message);
        }
    };

    if (businessLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!business) return <NotFound />;

    const isMaster = business.isMaster;

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-24">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
                    <ChevronLeft className="w-4 h-4 mr-1" /> К списку
                </button>
            </div>

            {/* Header Redesign - Clear cover (no opacity filter) */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border dark:border-gray-700 shadow-sm mb-12">
                <div className="h-32 md:h-56 relative overflow-hidden bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-700">
                    {business.coverImage ? (
                        <img src={business.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-r ${isMaster ? 'from-pink-50 to-rose-100' : 'from-blue-50 to-indigo-100'} dark:from-gray-900 dark:to-gray-800`}></div>
                    )}
                </div>
                
                <div className="px-6 md:px-10 pb-8 relative">
                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                        {/* Avatar / Logo */}
                        <div className="w-24 h-24 md:w-36 md:h-36 rounded-[2rem] border-4 border-white dark:border-gray-800 overflow-hidden shadow-xl bg-white shrink-0 -mt-12 md:-mt-20 z-10">
                            <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 pt-2">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                    {isMaster ? 'ЧАСТНЫЙ МАСТЕР' : 'ОРГАНИЗАЦИЯ'}
                                </span>
                                <div className="bg-[#fef3c7] dark:bg-yellow-900/40 px-3 py-1 rounded-full text-[#92400e] dark:text-yellow-400 text-[9px] font-black uppercase flex items-center gap-1 border border-yellow-100 dark:border-yellow-900/50">
                                    <Star className="w-2.5 h-2.5 fill-current" /> {business.rating || 5}
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] dark:text-white leading-none tracking-tighter uppercase mb-2">
                                {business.name}
                            </h1>
                            <div className="flex items-center text-gray-500 font-bold text-sm">
                                <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                                {business.address}
                            </div>
                        </div>
                        
                        {/* Action Buttons styled like screenshot */}
                        <div className="flex items-stretch gap-3 w-full md:w-auto md:pt-4">
                            <button 
                                onClick={handleVisitWebsite} 
                                className="flex-1 md:flex-none h-14 md:h-16 flex items-center justify-center text-white font-black uppercase text-[11px] tracking-widest bg-[#2563eb] hover:bg-blue-700 px-10 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                                {business.website ? <><Globe className="w-4 h-4 mr-2" /> САЙТ</> : <><Phone className="w-4 h-4 mr-2" /> ПОЗВОНИТЬ</>}
                            </button>
                            <button 
                                onClick={() => handleContactShop()} 
                                className="h-14 md:h-16 px-5 md:px-6 flex items-center justify-center gap-2 text-[#0f172a] dark:text-white font-black uppercase text-[11px] tracking-widest bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-2xl transition-all border border-gray-100 dark:border-gray-600 shadow-sm active:scale-95"
                            >
                                <MessageCircle className="w-5 h-5" /> ЧАТ
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 lg:p-10 border dark:border-gray-700 shadow-sm">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Sparkles className={`w-4 h-4 ${isMaster ? 'text-pink-500' : 'text-blue-500'}`} /> О бизнесе
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                            {business.description || 'Описание пока не заполнено.'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex border-b-2 dark:border-gray-800">
                            <button onClick={() => setActiveTab('menu')} className={`pb-4 px-6 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'menu' ? (isMaster ? 'text-pink-500' : 'text-blue-600') : 'text-gray-400'}`}>
                                {isMaster ? 'Работы' : 'Товары'}
                                {activeTab === 'menu' && <div className={`absolute bottom-[-2px] left-0 right-0 h-1 rounded-full ${isMaster ? 'bg-pink-500' : 'bg-blue-600'}`} />}
                            </button>
                            <button onClick={() => setActiveTab('services')} className={`pb-4 px-6 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'services' ? (isMaster ? 'text-pink-500' : 'text-blue-600') : 'text-gray-400'}`}>
                                Услуги
                                {activeTab === 'services' && <div className={`absolute bottom-[-2px] left-0 right-0 h-1 rounded-full ${isMaster ? 'bg-pink-500' : 'bg-blue-600'}`} />}
                            </button>
                            <button onClick={() => setActiveTab('reviews')} className={`pb-4 px-6 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'reviews' ? (isMaster ? 'text-pink-500' : 'text-blue-600') : 'text-gray-400'}`}>
                                Отзывы ({reviews.length})
                                {activeTab === 'reviews' && <div className={`absolute bottom-[-2px] left-0 right-0 h-1 rounded-full ${isMaster ? 'bg-pink-500' : 'bg-blue-600'}`} />}
                            </button>
                        </div>

                        {activeTab === 'menu' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in">
                                {products.length === 0 ? (
                                    <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed dark:border-gray-800">
                                        <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Каталог пока пуст</p>
                                    </div>
                                ) : products.map(p => (
                                    <div key={p.id} className="bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                                        <div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-gray-900">
                                            <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-xl font-black text-blue-600 dark:text-blue-400 shadow-sm">{p.price.toLocaleString()} ₽</div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight uppercase text-xs mb-4 flex-1">{p.name}</h3>
                                            <button 
                                                className="w-full py-4 bg-[#0f172a] hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2" 
                                                onClick={() => handleContactShop(p, 'product')}
                                            >
                                                <MessageCircle className="w-4 h-4" /> Написать
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {activeTab === 'services' && (
                            <div className="grid grid-cols-1 gap-4 animate-in fade-in">
                                {services.map(s => (
                                    <div key={s.id} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border dark:border-gray-700 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
                                        <img src={s.image || 'https://ui-avatars.com/api/?name=S'} alt="" className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-gray-900 dark:text-white truncate text-lg uppercase tracking-tight">{s.title}</h3>
                                            <div className="flex items-center gap-3 text-gray-400 text-[10px] mt-1 font-black uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Clock4 className="w-3.5 h-3.5" /> {s.durationMin} мин</span>
                                                <span className="text-blue-600 dark:text-blue-400">{s.price.toLocaleString()} ₽</span>
                                            </div>
                                        </div>
                                        <button className={`rounded-xl px-6 py-3 font-black uppercase text-[10px] tracking-widest text-white shadow-md active:scale-95 transition-all ${isMaster ? 'bg-pink-500 hover:bg-pink-600' : 'bg-blue-600 hover:bg-blue-700'}`} onClick={() => handleContactShop(s, 'service')}>
                                            Заказать
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-4 animate-in fade-in">
                                {reviews.map(r => (
                                    <div key={r.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <img src={r.authorAvatar || `https://ui-avatars.com/api/?name=${r.authorName}`} className="w-10 h-10 rounded-full object-cover" alt="" />
                                                <div>
                                                    <div className="font-bold text-sm dark:text-white">{r.authorName}</div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-2.5 h-2.5 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-gray-400">{r.date}</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed text-sm">"{r.text}"</p>
                                    </div>
                                ))}
                                {reviews.length === 0 && <div className="text-center py-10 text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">Будьте первым, кто оставит отзыв!</div>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border dark:border-gray-700 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6">Информация</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-400"><Clock className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Часы работы</p>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{business.workHours || 'По договоренности'}</p>
                                </div>
                            </div>
                            {business.phone && (
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-400"><Phone className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Контактный телефон</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{formatPhone(business.phone)}</p>
                                    </div>
                                </div>
                            )}
                            {business.website && (
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-400"><Globe className="w-5 h-5" /></div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Официальный сайт</p>
                                        <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" className="font-bold text-blue-600 dark:text-blue-400 text-sm truncate block hover:underline">
                                            {business.website.replace('https://', '').replace('http://', '')}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl overflow-hidden h-64 border-4 border-white dark:border-gray-800 shadow-xl">
                        <YandexMap center={[business.lat, business.lng]} zoom={15} markers={[{ lat: business.lat, lng: business.lng, title: business.name }]} />
                    </div>
                </div>
            </div>
        </div>
    );
};

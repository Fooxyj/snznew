
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, Service, Event, UserRole, Business, Vacancy, Review, BusinessPost } from '../types';
import { Button, formatPhone } from '../components/ui/Common';
import { MapPin, Phone, Clock, Loader2, Star, ChevronLeft, ShoppingBag, Plus, X, Calendar, Clock4, Trash2, Film, CreditCard, Globe, MessageCircle, Heart, User, Sparkles, ExternalLink, Send, Briefcase, ShieldCheck, Newspaper, Eye, ArrowRight, Share2, MoreHorizontal, AlertTriangle, FileText, QrCode } from 'lucide-react';
import { YandexMap } from '../components/YandexMap';
import { NotFound } from './NotFound';
import { useToast } from '../components/ToastProvider';
import { ImageViewer } from '../components/ImageViewer';

// Модальное окно деталей товара
const ProductDetailModal: React.FC<{ product: Product | null; onClose: () => void; onContact: () => void; onOpenImage: (url: string) => void }> = ({ product, onClose, onContact, onOpenImage }) => {
    if (!product) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="md:w-1/2 h-64 md:h-auto relative bg-gray-100 dark:bg-gray-900 shrink-0">
                    <img 
                        src={product.image} 
                        className="w-full h-full object-cover cursor-zoom-in" 
                        alt={product.name} 
                        onClick={() => onOpenImage(product.image)}
                    />
                    <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="mb-6">
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block">
                            {product.category || 'Товар'}
                        </span>
                        <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight leading-tight mb-2">{product.name}</h2>
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{product.price} ₽</div>
                    </div>
                    
                    <div className="flex-1 space-y-4 mb-8">
                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b dark:border-gray-700 pb-2">Описание</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap italic">
                            {product.description || "Описание товара временно отсутствует. Вы можете уточнить детали у представителя заведения."}
                        </p>
                    </div>

                    <div className="space-y-3 shrink-0">
                        <Button onClick={onContact} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/10">
                            <ShoppingBag className="w-5 h-5 mr-2" /> Заказать / Спросить
                        </Button>
                        <button onClick={onClose} className="w-full py-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Компонент одного поста в стиле соцсети
const SocialBusinessPost: React.FC<{ post: BusinessPost; business: Business; onOpenImage: (url: string) => void }> = ({ post, business, onOpenImage }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { success } = useToast();
    
    const textLimit = 150;
    const isLongText = post.content.length > textLimit;
    
    const formattedDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
        if (diffHours < 1) return 'только что';
        if (diffHours < 24) return `${diffHours} ч. назад`;
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const ok = await api.toggleBusinessPostLike(post.id);
        if (ok) {
            queryClient.invalidateQueries({ queryKey: ['businessPosts', business.id] });
        } else {
            navigate('/auth');
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = window.location.href;
        if (navigator.share) {
            navigator.share({ 
                title: post.title, 
                text: `${post.title}\n\n${post.content.substring(0, 100)}...`, 
                url: shareUrl 
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(shareUrl);
            success("Ссылка скопирована в буфер обмена!");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all mb-8 max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={business.image} className="w-10 h-10 rounded-full object-cover border dark:border-gray-700" alt="" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm dark:text-white leading-none">{business.name}</span>
                            {business.verificationStatus === 'verified' && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{formattedDate(post.createdAt)}</span>
                    </div>
                </div>
                <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Content Image */}
            {post.image && (
                <div className="w-full aspect-video bg-gray-100 dark:bg-gray-900 cursor-zoom-in overflow-hidden" onClick={() => onOpenImage(post.image!)}>
                    <img src={post.image} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700" alt="" />
                </div>
            )}

            {/* Text Body */}
            <div className="p-5">
                <h3 className="font-black text-lg dark:text-white uppercase tracking-tight mb-2 leading-tight">{post.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {isLongText && !isExpanded ? `${post.content.substring(0, textLimit)}...` : post.content}
                </p>
                {isLongText && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mt-3 hover:text-blue-700 transition-colors"
                    >
                        {isExpanded ? 'Скрыть' : 'Показать ещё'}
                    </button>
                )}
            </div>

            {/* Footer / Interactions */}
            <div className="px-5 py-4 border-t dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-all active:scale-90 ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-[11px] font-black uppercase">{post.likes > 0 ? post.likes : 'Лайк'}</span>
                    </button>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Eye className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-widest">{post.views}</span>
                    </div>
                </div>
                <button onClick={handleShare} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export const BusinessDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [activeTab, setActiveTab] = useState<'menu' | 'services' | 'vacancies' | 'news'>('menu');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [viewerImage, setViewerImage] = useState<string | null>(null);

    const { data: business, isLoading: businessLoading } = useQuery({
        queryKey: ['business', id],
        queryFn: () => api.getBusinessById(id!),
        enabled: !!id,
        staleTime: 0
    });

    const { data: products = [] } = useQuery({ queryKey: ['products', id], queryFn: () => api.getProducts(id!) });
    const { data: services = [] } = useQuery({ queryKey: ['services', id], queryFn: () => api.getServices(id!) });
    const { data: vacancies = [] } = useQuery({ queryKey: ['businessVacancies', id], queryFn: () => api.getVacanciesByBusiness(id!) });
    const { data: posts = [] } = useQuery({ queryKey: ['businessPosts', id], queryFn: () => api.getBusinessPosts(id!) });
    const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });

    // Эффект для инкремента просмотров новостей бизнеса
    useEffect(() => {
        if (activeTab === 'news' && posts.length > 0) {
            posts.forEach(post => {
                api.viewBusinessPost(post.id);
            });
        }
    }, [activeTab, posts]);

    const handleContactShop = async () => {
        if (!user) return navigate('/auth');
        if (!business?.authorId) return;
        try {
            const chatId = await api.startChat(business.authorId, '', business.id);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) { alert(e.message); }
    };

    const isMedical = useMemo(() => {
        const cat = business?.category?.toLowerCase() || '';
        return cat.includes('медицина') || cat.includes('клиник') || cat.includes('зоо') || cat.includes('вет');
    }, [business]);

    if (businessLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;
    if (!business) return <NotFound />;

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-10 pb-32">
            <ImageViewer isOpen={!!viewerImage} onClose={() => setViewerImage(null)} src={viewerImage || ''} />
            
            <ProductDetailModal 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
                onContact={handleContactShop}
                onOpenImage={(url) => setViewerImage(url)}
            />

            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] overflow-hidden border dark:border-gray-700 shadow-sm mb-12 relative">
                <div className="h-48 md:h-72 bg-gray-100 dark:bg-gray-900 relative">
                    {business.coverImage ? (
                        <img 
                            src={business.coverImage} 
                            className="w-full h-full object-cover cursor-zoom-in" 
                            alt="" 
                            onClick={() => setViewerImage(business.coverImage || null)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20"></div>
                    )}
                </div>
                <div className="px-8 md:px-12 pb-10 relative">
                    <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] border-8 border-white dark:border-gray-800 overflow-hidden shadow-2xl bg-white shrink-0 -mt-16 md:-mt-24 z-10 relative">
                            <img src={business.image} className="w-full h-full object-cover" alt={business.name} />
                        </div>
                        <div className="flex-1 pt-4">
                            <div className="flex wrap items-center gap-4 mb-3">
                                <h1 className="text-3xl md:text-4xl font-black dark:text-white uppercase tracking-tighter">{business.name}</h1>
                                {business.verificationStatus === 'verified' && <ShieldCheck className="w-8 h-8 text-blue-500 fill-blue-50" />}
                            </div>
                            <div className="flex wrap items-center gap-6 text-gray-500 dark:text-gray-400 font-bold text-sm">
                                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500" />{business.address}</div>
                                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" />{business.workHours}</div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto pt-6 lg:pt-4">
                            <Button onClick={handleContactShop} className="flex-1 py-5 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/10">
                                <MessageCircle className="w-5 h-5 mr-2" /> Написать
                            </Button>
                            
                            {business.website && (
                                <a 
                                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-5 px-10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm border border-blue-100 dark:border-blue-900/50"
                                >
                                    <Globe className="w-5 h-5" /> Сайт
                                </a>
                            )}

                            {business.phone && (
                                <a 
                                    href={`tel:${business.phone}`}
                                    className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-all shadow-sm border border-blue-100 dark:border-blue-900/50"
                                >
                                    <Phone className="w-6 h-6" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Юридическая плашка для медицины/ветеринарии */}
                    {isMedical && (
                        <div className="mt-8 p-6 rounded-[2rem] bg-red-50 dark:bg-red-950/20 border-2 border-dashed border-red-100 dark:border-red-900/30">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-black uppercase text-red-700 dark:text-red-400 tracking-tight">Важная информация</h4>
                                        <p className="text-xs text-red-600 dark:text-red-300 font-medium leading-relaxed mt-1">
                                            ИМЕЮТСЯ ПРОТИВОПОКАЗАНИЯ, НЕОБХОДИМА КОНСУЛЬТАЦИЯ СПЕЦИАЛИСТА. 
                                            Данная страница носит ознакомительный характер. Платформа «Простор» не оказывает медицинских услуг и не проверяет квалификацию персонала.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                            <FileText className="w-4 h-4 text-blue-500" /> Лицензия: {business.inn ? 'Проверена' : 'Требуется проверка'}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                            <QrCode className="w-4 h-4 text-blue-500" /> Выписка из реестра (QR)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description Section */}
                    {business.description && (
                        <div className="mt-10 pt-10 border-t dark:border-gray-700">
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">О компании</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-lg leading-relaxed whitespace-pre-wrap italic">
                                "{business.description}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-12">
                    <div className="flex border-b-2 dark:border-gray-800 mb-10 overflow-x-auto scrollbar-hide">
                        <button 
                            onClick={() => setActiveTab('menu')} 
                            className={`pb-5 px-8 text-[11px] font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap ${activeTab === 'menu' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Витрина
                            {activeTab === 'menu' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab('news')} 
                            className={`pb-5 px-8 text-[11px] font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap ${activeTab === 'news' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Новости ({posts.length})
                            {activeTab === 'news' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab('services')} 
                            className={`pb-5 px-8 text-[11px] font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap ${activeTab === 'services' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Услуги
                            {activeTab === 'services' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab('vacancies')} 
                            className={`pb-5 px-8 text-[11px] font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap ${activeTab === 'vacancies' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Вакансии ({vacancies.length})
                            {activeTab === 'vacancies' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                        </button>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeTab === 'menu' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {products.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest italic border-2 border-dashed rounded-3xl dark:border-gray-800">Каталог наполняется</div>
                                ) : (
                                    products.map(p => (
                                        <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-white dark:bg-gray-800 rounded-[2rem] border dark:border-gray-700 overflow-hidden shadow-sm flex flex-col group hover:shadow-xl transition-all cursor-pointer">
                                            <div className="aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.name} />
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="font-bold dark:text-white uppercase text-xs mb-3 line-clamp-2 h-8 leading-tight">{p.name}</h3>
                                                <div className="mt-auto flex justify-between items-center gap-2">
                                                    <span className="font-black text-blue-600 text-lg">{p.price} ₽</span>
                                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'news' && (
                            <div className="space-y-6 flex flex-col items-center">
                                {posts.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest italic border-2 border-dashed rounded-3xl dark:border-gray-800 w-full">Пока новостей нет</div>
                                ) : (
                                    posts.map(post => (
                                        <SocialBusinessPost 
                                            key={post.id} 
                                            post={post} 
                                            business={business} 
                                            onOpenImage={(url) => setViewerImage(url)} 
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {services.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest italic border-2 border-dashed rounded-3xl dark:border-gray-800">Список услуг пуст</div>
                                ) : (
                                    services.map(s => (
                                        <div key={s.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 cursor-zoom-in" onClick={() => s.image && setViewerImage(s.image)}>
                                                    {s.image ? <img src={s.image} className="w-full h-full object-cover rounded-2xl" alt="" /> : <Briefcase className="w-8 h-8" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-black dark:text-white uppercase tracking-tight text-sm">{s.title}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1"><Clock4 className="w-3 h-3" /> {s.durationMin} мин</span>
                                                        <span className="font-black text-blue-600">{s.price} ₽</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" className="rounded-xl px-6" onClick={handleContactShop}>Записаться</Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'vacancies' && (
                            <div className="grid gap-6">
                                {vacancies.length === 0 ? (
                                    <div className="py-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest italic border-2 border-dashed rounded-3xl dark:border-gray-800">Вакансий пока нет</div>
                                ) : (
                                    vacancies.map(v => (
                                        <div key={v.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all group">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-black dark:text-white uppercase mb-2 group-hover:text-blue-600 transition-colors">{v.title}</h3>
                                                <div className="flex wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 font-bold">
                                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {v.schedule === 'full' ? 'Полный день' : v.schedule === 'shift' ? 'Сменный' : 'Удаленно'}</span>
                                                    <span className="flex items-center gap-1.5 text-blue-600"><CreditCard className="w-4 h-4" /> {v.salaryMin ? `от ${v.salaryMin.toLocaleString()} ₽` : 'з/п договорная'}</span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap italic line-clamp-2">
                                                    "{v.description}"
                                                </p>
                                            </div>
                                            <Button variant="outline" className="rounded-2xl px-10 py-4 font-black uppercase text-xs tracking-widest shrink-0" onClick={() => handleContactShop()}>Откликнуться</Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

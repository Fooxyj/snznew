
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, Service, Event, UserRole } from '../types';
import { Button, formatAddress, formatPhone } from '../components/ui/Common';
import { MapPin, Phone, Clock, Loader2, Star, ChevronLeft, ShoppingBag, Plus, X, Calendar, Clock4, ShoppingCart, Trash2, Film, CreditCard, Globe, ExternalLink } from 'lucide-react';
import { useCart } from '../components/CartProvider';
import { YandexMap } from '../components/YandexMap';
import { CreateEventModal } from '../components/CreateEventModal';
import { SeatPicker } from '../components/ui/SeatPicker';
import { CreateProductModal, CreateServiceModal } from '../components/CRMModals';
import { NotFound } from './NotFound';

const ProductDetailModal: React.FC<{ product: Product | null; isOpen: boolean; onClose: () => void; canDelete?: boolean; onDelete?: (id:string)=>void }> = ({ product, isOpen, onClose, canDelete, onDelete }) => {
    const { addToCart } = useCart();
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold shadow-lg">
                        {product.price} ₽
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{product.name}</h2>
                        {canDelete && onDelete && (
                            <button onClick={() => { onDelete(product.id); onClose(); }} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {product.category && (
                        <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs px-2 py-1 rounded-md mb-4 font-medium">
                            {product.category}
                        </span>
                    )}
                    <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8">
                        {product.description || "Описание отсутствует."}
                    </p>
                    
                    <Button 
                        className="w-full py-3.5 text-lg shadow-lg shadow-blue-200 dark:shadow-none"
                        onClick={() => { addToCart(product); onClose(); }}
                    >
                        <Plus className="w-5 h-5 mr-2" /> Добавить в корзину
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Booking Ticket Modal for Cinema
const BookingTicketModal: React.FC<{ event: Event | null; sessionTime: string | null; isOpen: boolean; onClose: () => void }> = ({ event, sessionTime, isOpen, onClose }) => {
    const [bookedSeats, setBookedSeats] = useState<{row: number, col: number}[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<{row: number, col: number} | null>(null);
    const [buying, setBuying] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && event) {
            api.getBookedSeats(event.id).then(setBookedSeats);
        }
    }, [isOpen, event]);

    if (!isOpen || !event || !sessionTime) return null;

    const handleBuy = async () => {
        const user = await api.getCurrentUser();
        if (!user) {
            if(confirm("Необходимо войти для покупки билета. Войти?")) navigate('/auth');
            return;
        }

        if (!selectedSeat) return;
        setBuying(true);
        try {
            await api.buyTicket(event.id, selectedSeat.row, selectedSeat.col, event.price || 350);
            alert(`Билет на "${event.title}" (${sessionTime}) успешно куплен!`);
            onClose();
            navigate('/profile');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setBuying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                
                <div className="text-center mb-6">
                    <h3 className="font-bold text-xl dark:text-white">{event.title}</h3>
                    <p className="text-blue-500 font-medium mt-1">Сеанс: {sessionTime}</p>
                </div>

                <SeatPicker 
                    price={event.price || 350} 
                    bookedSeats={bookedSeats}
                    selectedSeat={selectedSeat}
                    onSelect={(r, c) => setSelectedSeat({ row: r, col: c })}
                />

                <div className="max-w-xs mx-auto border-t dark:border-gray-700 pt-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 dark:text-gray-400">К оплате:</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {selectedSeat ? `${event.price} ₽` : '0 ₽'}
                        </span>
                    </div>
                    <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                        disabled={!selectedSeat || buying}
                        onClick={handleBuy}
                    >
                        {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" /> Купить билет</>}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const BookingModal: React.FC<{ service: Service | null; isOpen: boolean; onClose: () => void }> = ({ service, isOpen, onClose }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        const user = await api.getCurrentUser();
        if (!user) {
            if(confirm("Необходимо войти для записи. Войти?")) navigate('/auth');
            return;
        }

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
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">Запись онлайн</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{service.title}</p>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">Дата</label>
                        <input 
                            type="date" 
                            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                        />
                    </div>
                    
                    {selectedDate && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block">Свободное время</label>
                            <div className="grid grid-cols-4 gap-2">
                                {slots.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2 text-sm rounded-lg border transition-colors ${selectedTime === time ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-blue-50 dark:hover:bg-blue-900/30 border-gray-200 dark:border-gray-600 dark:text-gray-200'}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <div className="text-xs text-gray-400">Стоимость</div>
                            <div className="font-bold text-lg dark:text-white">{service.price} ₽</div>
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
    const queryClient = useQueryClient();
    
    const [activeTab, setActiveTab] = useState<'menu' | 'services' | 'reviews'>('menu');
    
    // Cart Hook
    const { addToCart, cartCount } = useCart();
    
    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [bookingService, setBookingService] = useState<Service | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    
    // Cinema Modal Logic
    const [ticketEvent, setTicketEvent] = useState<Event | null>(null);
    const [ticketSession, setTicketSession] = useState<string | null>(null);

    // Reviews
    const [newReviewText, setNewReviewText] = useState('');
    const [rating, setRating] = useState(5);

    // Queries
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

    // Special logic for Cinema Events
    const { data: cinemaEvents = [] } = useQuery({
        queryKey: ['cinemaEvents', business?.authorId],
        queryFn: () => api.getEventsByAuthor(business?.authorId || ''),
        enabled: !!business && business.category === 'Кино' && !!business.authorId
    });

    // Mutations
    const reviewMutation = useMutation({
        mutationFn: () => api.addReview(id!, rating, newReviewText),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', id] });
            queryClient.invalidateQueries({ queryKey: ['business', id] }); // rating updates
            setNewReviewText('');
        },
        onError: (e: any) => alert(e.message)
    });

    const deleteProductMutation = useMutation({
        mutationFn: (pid: string) => api.deleteProduct(pid),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', id] })
    });

    const deleteServiceMutation = useMutation({
        mutationFn: (sid: string) => api.deleteService(sid),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services', id] })
    });

    const deleteEventMutation = useMutation({
        mutationFn: (eid: string) => api.deleteEvent(eid),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cinemaEvents', business?.authorId] })
    });

    const deleteBusinessMutation = useMutation({
        mutationFn: (bid: string) => api.deleteBusiness(bid),
        onSuccess: () => navigate('/'),
        onError: (e: any) => alert(e.message)
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

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        reviewMutation.mutate();
    };

    const handleDeleteProduct = (pid: string) => {
        if (confirm("Удалить этот товар?")) deleteProductMutation.mutate(pid);
    };

    const handleDeleteService = (sid: string) => {
        if (confirm("Удалить эту услугу?")) deleteServiceMutation.mutate(sid);
    };

    const handleDeleteEvent = (eid: string) => {
        if (confirm("Удалить этот фильм?")) deleteEventMutation.mutate(eid);
    };

    const handleAdminDeleteBiz = () => {
        if (confirm("АДМИН: Удалить эту организацию полностью?")) {
            deleteBusinessMutation.mutate(id!);
        }
    };

    if (businessLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!business) return <NotFound />;

    const isAdmin = user?.role === UserRole.ADMIN;
    const isOwner = user?.id === business.authorId;
    const canEdit = isOwner || isAdmin;
    const isCinema = business.category === 'Кино';

    const cleanAddress = formatAddress(business.address);
    const cleanPhone = formatPhone(business.phone);

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            {id && <CreateProductModal businessId={id} isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products', id] })} />}
            {id && <CreateServiceModal businessId={id} isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['services', id] })} />}
            {/* Cinema Event Modal */}
            <CreateEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['cinemaEvents', business.authorId] })} />
            
            <BookingModal service={bookingService} isOpen={!!bookingService} onClose={() => setBookingService(null)} />
            <BookingTicketModal 
                event={ticketEvent} 
                sessionTime={ticketSession} 
                isOpen={!!ticketEvent && !!ticketSession} 
                onClose={() => { setTicketEvent(null); setTicketSession(null); }} 
            />
            <ProductDetailModal 
                product={selectedProduct} 
                isOpen={!!selectedProduct} 
                onClose={() => setSelectedProduct(null)}
                canDelete={canEdit}
                onDelete={handleDeleteProduct} 
            />

            <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Назад
                </button>
            </div>

            {/* New Header: Cover + Logo */}
            <div className="relative mb-8">
                {/* Cover Image */}
                <div className="h-48 md:h-72 rounded-2xl overflow-hidden relative bg-gray-200 dark:bg-gray-700 shadow-md">
                    {business.coverImage ? (
                        <img src={business.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    )}
                    <div className="absolute inset-0 bg-black/20"></div>
                    
                    {isAdmin && (
                         <button onClick={handleAdminDeleteBiz} className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full z-20 shadow-lg hover:bg-red-700" title="Удалить">
                             <Trash2 className="w-5 h-5" />
                         </button>
                    )}
                </div>
                
                {/* Content Overlay */}
                <div className="px-4 md:px-6 relative -mt-12 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                    {/* Logo */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white dark:border-gray-900 overflow-hidden shadow-xl bg-white shrink-0 z-10">
                        <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Text Info */}
                    <div className="flex-1 pt-2 md:pt-14 w-full">
                        <div className="flex flex-col md:flex-row md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{business.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">{business.category}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 text-sm">
                                {business.website && (
                                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 dark:text-white font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-xl transition-colors shadow-sm">
                                        <Globe className="w-4 h-4 mr-2" /> Сайт
                                    </a>
                                )}
                                {cleanPhone && (
                                    <button onClick={handleCall} className="flex items-center text-white font-bold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors shadow-sm">
                                        <Phone className="w-4 h-4 mr-2" /> Позвонить
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{business.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center" title={cleanAddress}>
                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" /> {cleanAddress}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-gray-400" /> {business.workHours}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mini Map */}
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl h-32 w-full overflow-hidden shadow-inner border dark:border-gray-600 hidden md:block">
                                <YandexMap center={[business.lat, business.lng]} zoom={15} markers={[{lat: business.lat, lng: business.lng}]} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('menu')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'menu' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    {isCinema ? <><Film className="w-4 h-4" /> Афиша</> : <><ShoppingBag className="w-4 h-4" /> Меню / Товары</>}
                </button>
                {!isCinema && (
                    <button 
                        onClick={() => setActiveTab('services')}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'services' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <Calendar className="w-4 h-4" /> Услуги / Запись
                    </button>
                )}
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Star className="w-4 h-4" /> Отзывы ({reviews.length})
                </button>
            </div>

            {activeTab === 'menu' && (
                <div>
                    {canEdit && (
                        <div className="mb-6 flex gap-2">
                            {isCinema ? (
                                <Button onClick={() => setIsEventModalOpen(true)} className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Добавить фильм
                                </Button>
                            ) : (
                                <Button onClick={() => setIsProductModalOpen(true)} className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Добавить товар
                                </Button>
                            )}
                        </div>
                    )}

                    {/* CINEMA VIEW */}
                    {isCinema ? (
                        cinemaEvents.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed">
                                <Film className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>В афише пока пусто</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {cinemaEvents.map(evt => (
                                    <div key={evt.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col relative group">
                                        <div className="h-48 relative">
                                            <img src={evt.image} className="w-full h-full object-cover" alt="" />
                                            {canEdit && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteEvent(evt.id); }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-bold text-lg dark:text-white mb-2">{evt.title}</h3>
                                            
                                            {/* Sessions Widget */}
                                            <div className="mt-auto">
                                                <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wide">Ближайшие сеансы</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {evt.sessions && evt.sessions.length > 0 ? evt.sessions.map((time) => (
                                                        <button 
                                                            key={time}
                                                            onClick={() => { setTicketEvent(evt); setTicketSession(time); }}
                                                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-100 dark:border-blue-900"
                                                        >
                                                            {time}
                                                        </button>
                                                    )) : (
                                                        <span className="text-gray-400 text-sm">Нет сеансов на сегодня</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                    /* STANDARD SHOP VIEW */
                        products.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>В меню пока пусто</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {products.map(p => (
                                    <div 
                                        key={p.id} 
                                        className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex gap-4 hover:shadow-md transition-shadow relative group cursor-pointer"
                                        onClick={() => setSelectedProduct(p)}
                                    >
                                        <img src={p.image} alt="" className="w-24 h-24 rounded-lg object-cover bg-gray-100 shrink-0" />
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{p.name}</h3>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{p.price} ₽</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">{p.description}</p>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="dark:border-gray-600 dark:text-gray-300" 
                                                onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> В корзину
                                            </Button>
                                        </div>
                                        {canEdit && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}

            {activeTab === 'services' && !isCinema && (
                <div>
                    {canEdit && (
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
                                    {canEdit && (
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
                        <Button size="sm" disabled={reviewMutation.isPending}>Отправить</Button>
                    </form>

                    {reviews.map(r => (
                        <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={r.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.authorName)}&background=random&color=fff`} 
                                        alt="" 
                                        className="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-gray-700" 
                                    />
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
            {cartCount > 0 && activeTab === 'menu' && !isCinema && (
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

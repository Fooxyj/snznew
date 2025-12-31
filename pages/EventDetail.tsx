
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { UserRole } from '../types';
/* Comment above fix: Added Badge to Common imports and AlignLeft to lucide-react imports */
import { Button, Badge } from '../components/ui/Common';
import { Calendar, MapPin, ChevronLeft, Loader2, CreditCard, Edit, Trash2, Info, Share2, Ticket, AlignLeft } from 'lucide-react';
import { EditEventModal } from '../components/EditEventModal';
import { SeatPicker } from '../components/ui/SeatPicker';
import { NotFound } from './NotFound';

export const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [selectedSeat, setSelectedSeat] = useState<{row: number, col: number} | null>(null);
    const [showSeats, setShowSeats] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Queries
    const { data: event, isLoading: eventLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: () => api.getEventById(id!),
        enabled: !!id
    });

    const { data: bookedSeats = [] } = useQuery({
        queryKey: ['bookedSeats', id],
        queryFn: () => api.getBookedSeats(id!),
        enabled: !!id
    });

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    // Mutations
    const buyTicketMutation = useMutation({
        mutationFn: async () => {
            if (!event || !selectedSeat) return;
            await api.buyTicket(event.id, selectedSeat.row, selectedSeat.col, event.price || 350);
        },
        onSuccess: () => {
            alert("Билет успешно куплен! QR-код в профиле.");
            navigate('/profile');
        },
        onError: (e: any) => alert(e.message)
    });

    const deleteEventMutation = useMutation({
        mutationFn: (eventId: string) => api.deleteEvent(eventId),
        onSuccess: () => {
            navigate('/events');
        },
        onError: (e: any) => alert(e.message)
    });

    const handleBuy = () => {
        if (!user) {
            if (confirm("Необходимо войти в систему для покупки билета. Перейти?")) {
                navigate('/auth');
            }
            return;
        }
        buyTicketMutation.mutate();
    };

    const handleDelete = () => {
        if (!event) return;
        if (confirm("Вы уверены, что хотите удалить это событие?")) {
            deleteEventMutation.mutate(event.id);
        }
    };

    const handleShare = () => {
        if (navigator.share && event) {
            navigator.share({
                title: event.title,
                text: event.description?.substring(0, 100),
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Ссылка скопирована!");
        }
    };

    if (eventLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!event) return <NotFound />;

    const isAdmin = user?.role === UserRole.ADMIN;
    const isFree = !event.price || event.price === 0;

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-10 pb-24">
            <EditEventModal 
                event={event} 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['event', id] })} 
            />

            <div className="flex justify-between items-center mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold group">
                    <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full mr-2">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    Назад к афише
                </button>
                <div className="flex gap-2">
                    <button onClick={handleShare} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 hover:bg-gray-50 transition-colors">
                        <Share2 className="w-5 h-5 text-gray-500" />
                    </button>
                    {isAdmin && (
                        <>
                            <button onClick={() => setIsEditOpen(true)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 hover:text-blue-600 transition-colors">
                                <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={handleDelete} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 hover:text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2 relative bg-gray-100 dark:bg-gray-900 h-64 md:h-auto">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute top-6 left-6">
                        <Badge color="blue" className="px-4 py-2 text-xs font-black uppercase tracking-widest shadow-xl backdrop-blur-md bg-white/90 dark:bg-black/70">
                            {event.category}
                        </Badge>
                    </div>
                </div>
                
                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
                        {event.title}
                    </h1>

                    <div className="space-y-5 mb-10">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Когда</p>
                                <p className="font-bold dark:text-white">{event.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Где</p>
                                <p className="font-bold dark:text-white">{event.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-600 mb-8 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Стоимость входа</p>
                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {isFree ? 'Бесплатно' : `${event.price} ₽`}
                            </p>
                        </div>
                        {isFree ? (
                             <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-2xl font-bold text-xs uppercase tracking-tighter flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4" /> Свободный вход
                             </div>
                        ) : (
                             <Ticket className="w-8 h-8 text-blue-200 dark:text-blue-800" />
                        )}
                    </div>

                    {!isFree && (
                         <Button 
                            className="w-full py-5 text-xl font-black shadow-2xl shadow-blue-500/30 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                            onClick={() => setShowSeats(true)}
                            disabled={showSeats}
                         >
                            {showSeats ? 'Выбирайте места ниже' : 'Купить билет онлайн'}
                         </Button>
                    )}
                </div>
            </div>

            {/* Description Section */}
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <AlignLeft className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">О мероприятии</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                        {event.description || "Приглашаем вас на это замечательное городское мероприятие! Подробности программы будут опубликованы в ближайшее время. Следите за обновлениями в нашей афише."}
                    </p>
                </div>
            </div>

            {/* Seat Selection Area */}
            {showSeats && !isFree && (
                <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] p-8 lg:p-16 border-2 border-dashed border-blue-200 dark:border-blue-900/50 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-black dark:text-white mb-2">Схема зала</h3>
                        <p className="text-gray-500">Выберите подходящие места для покупки</p>
                    </div>
                    
                    <SeatPicker 
                        price={event.price || 350} 
                        bookedSeats={bookedSeats}
                        selectedSeat={selectedSeat}
                        onSelect={(r, c) => setSelectedSeat({ row: r, col: c })}
                    />

                    <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-2xl border dark:border-gray-700 mt-12 transform hover:scale-105 transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">К оплате</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                                {selectedSeat ? `${event.price} ₽` : '0 ₽'}
                            </span>
                        </div>
                        <Button 
                            className="w-full py-4 text-lg font-black bg-green-600 hover:bg-green-700 text-white rounded-2xl" 
                            disabled={!selectedSeat || buyTicketMutation.isPending}
                            onClick={handleBuy}
                        >
                            {buyTicketMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><CreditCard className="w-5 h-5 mr-2" /> Оплатить билет</>}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CheckCircle2: React.FC<any> = (props) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

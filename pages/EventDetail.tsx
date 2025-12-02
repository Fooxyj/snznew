
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Event, UserRole } from '../types';
import { Button } from '../components/ui/Common';
import { Calendar, MapPin, ChevronLeft, Loader2, CreditCard, Ticket, Edit, Trash2 } from 'lucide-react';
import { EditEventModal } from '../components/EditEventModal';

const SeatPicker: React.FC<{ 
    price: number;
    bookedSeats: {row: number, col: number}[];
    onSelect: (row: number, col: number) => void;
    selectedSeat: {row: number, col: number} | null;
}> = ({ price, bookedSeats, onSelect, selectedSeat }) => {
    const rows = 6;
    const cols = 8;

    const isBooked = (r: number, c: number) => bookedSeats.some(s => s.row === r && s.col === c);
    const isSelected = (r: number, c: number) => selectedSeat?.row === r && selectedSeat?.col === c;

    return (
        <div className="flex flex-col items-center">
            {/* Screen */}
            <div className="w-full h-2 bg-gray-300 rounded-full mb-8 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-gray-400 text-xs tracking-widest uppercase">Экран</div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-transparent opacity-50 blur-sm"></div>
            </div>

            <div className="grid gap-2 mb-6">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="flex gap-2">
                        {Array.from({ length: cols }).map((_, c) => {
                            const booked = isBooked(r, c);
                            const selected = isSelected(r, c);
                            return (
                                <button
                                    key={`${r}-${c}`}
                                    disabled={booked}
                                    onClick={() => onSelect(r, c)}
                                    className={`
                                        w-8 h-8 rounded-t-lg text-[10px] flex items-center justify-center font-bold transition-all
                                        ${booked 
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                            : selected 
                                                ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                                                : 'bg-white border border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500'
                                        }
                                    `}
                                >
                                    {c + 1}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="flex gap-4 text-xs text-gray-500 mb-6">
                <div className="flex items-center gap-1"><div className="w-3 h-3 border border-gray-300 rounded-sm"></div> Свободно</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded-sm"></div> Занято</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Ваш выбор</div>
            </div>
        </div>
    );
};

export const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [bookedSeats, setBookedSeats] = useState<{row: number, col: number}[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<{row: number, col: number} | null>(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [showSeats, setShowSeats] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const loadData = async () => {
        if (!id) return;
        const evt = await api.getEventById(id);
        setEvent(evt);
        if (evt) {
            const booked = await api.getBookedSeats(evt.id);
            setBookedSeats(booked);
        }
        const user = await api.getCurrentUser();
        if (user) setUserRole(user.role);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleBuy = async () => {
        if (!selectedSeat || !event) return;
        setBuying(true);
        try {
            await api.buyTicket(event.id, selectedSeat.row, selectedSeat.col, event.price || 350);
            alert("Билет успешно куплен! QR-код в профиле.");
            navigate('/profile');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setBuying(false);
        }
    };

    const handleDelete = async () => {
        if (!event) return;
        if (confirm("Вы уверены, что хотите удалить это событие?")) {
            try {
                await api.deleteEvent(event.id);
                navigate('/');
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!event) return <div className="p-10 text-center">Событие не найдено</div>;

    const isAdmin = userRole === UserRole.ADMIN;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <EditEventModal event={event} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={loadData} />

            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigate('/')} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> На главную
                </button>
                {isAdmin && (
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>
                            <Edit className="w-4 h-4 mr-2" /> Ред.
                        </Button>
                        <Button size="sm" variant="danger" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="h-64 md:h-auto relative">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                    <div className="absolute bottom-4 left-4 text-white md:hidden">
                        <h1 className="text-2xl font-bold">{event.title}</h1>
                    </div>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col h-full">
                    <div className="hidden md:block mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h1>
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">{event.category}</span>
                    </div>

                    <div className="space-y-4 text-gray-600 dark:text-gray-300 flex-1">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span>{event.location}</span>
                        </div>
                        <p className="text-sm pt-2">{event.description || "Приходите, будет интересно!"}</p>
                    </div>

                    <div className="mt-8 pt-6 border-t dark:border-gray-700">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Цена билета</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{event.price} ₽</span>
                        </div>
                        <Button 
                            className="w-full py-3 text-lg shadow-lg shadow-blue-200 dark:shadow-none"
                            onClick={() => setShowSeats(true)}
                            disabled={showSeats}
                        >
                            {showSeats ? 'Выберите место ниже 👇' : 'Купить билет'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Seat Selection Area */}
            {showSeats && (
                <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 border dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold text-center mb-6 dark:text-white">Выберите место</h3>
                    
                    <SeatPicker 
                        price={event.price || 350} 
                        bookedSeats={bookedSeats}
                        selectedSeat={selectedSeat}
                        onSelect={(r, c) => setSelectedSeat({ row: r, col: c })}
                    />

                    <div className="max-w-xs mx-auto border-t dark:border-gray-700 pt-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600 dark:text-gray-400">Итого к оплате:</span>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedSeat ? `${event.price} ₽` : '0 ₽'}
                            </span>
                        </div>
                        <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white" 
                            disabled={!selectedSeat || buying}
                            onClick={handleBuy}
                        >
                            {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" /> Оплатить</>}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

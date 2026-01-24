
// Comment above fix: Added React import to provide access to React namespace types (FC, FormEvent)
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Ride } from '../types';
import { Button, Badge } from '../components/ui/Common';
import { Car, MapPin, Calendar, Loader2, Plus, Users, Search, ArrowRight, X, MessageSquare, ChevronDown, Info, ShieldCheck, Clock, RotateCcw, Scale } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const CreateRideModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        fromCity: 'Снежинск',
        toCity: 'Екатеринбург',
        date: '',
        time: '',
        price: '',
        seats: '3',
        carModel: ''
    });
    
    const createMutation = useMutation({
        mutationFn: (data: any) => api.createRide({ ...data, price: Number(data.price), seats: Number(data.seats) }),
        onSuccess: () => {
            onSuccess();
            onClose();
        },
        onError: (err: any) => alert(err.message)
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Предложить поездку</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 flex gap-3 items-start border border-blue-100 dark:border-blue-800">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-800 dark:text-blue-300 leading-tight">Важно: сумма оплаты не должна превышать расходов на топливо. Коммерческий извоз запрещен.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Откуда</label>
                            <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.fromCity} onChange={e => setFormData({...formData, fromCity: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Куда</label>
                            <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.toCity} onChange={e => setFormData({...formData, toCity: e.target.value})} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Дата</label>
                            <input type="date" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Время</label>
                            <input type="time" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Автомобиль</label>
                        <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} placeholder="Модель и цвет" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Цена (₽)</label>
                            <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Мест</label>
                            <input type="number" className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})} required />
                        </div>
                    </div>
                    <Button className="w-full py-4 rounded-xl font-black uppercase tracking-widest mt-2 shadow-lg" disabled={createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="animate-spin" /> : 'Опубликовать'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const RidesPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState({ from: '', to: '' });
    const [selectedSeatsCount, setSelectedSeatsCount] = useState<Record<string, number>>({});
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: rides = [], isLoading } = useQuery({
        queryKey: ['rides'],
        queryFn: api.getRides
    });

    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const handleBook = async (ride: Ride) => {
        if (!currentUser) return navigate('/auth');
        if (ride.driverId === currentUser.id) return alert("Вы не можете забронировать место у себя");
        
        // Проверка: а не забронировал ли я уже здесь место?
        const isAlreadyPassenger = ride.passengerDetails?.some(p => p.id === currentUser.id);
        if (isAlreadyPassenger) {
            alert("Вы уже забронировали место в этой поездке. Проверьте чат с водителем.");
            return;
        }

        const count = selectedSeatsCount[ride.id] || 1;
        try {
            const contextMsg = JSON.stringify({
                type: 'ride_booking',
                rideId: ride.id,
                fromCity: ride.fromCity,
                toCity: ride.toCity,
                date: ride.date,
                time: ride.time,
                price: `${ride.price} ₽`,
                requestedSeats: count
            });

            const chatId = await api.startChat(ride.driverId, contextMsg);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) { alert(e.message); }
    };

    const handleContact = async (driverId: string, context?: string) => {
        if (!currentUser) return navigate('/auth');
        try {
            const chatId = await api.startChat(driverId, context);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) { alert(e.message); }
    };

    const handleResetSearch = () => {
        setSearch({ from: '', to: '' });
    };

    const filteredRides = rides.filter(r => {
        if (r.seats <= 0) return false;
        const rideDate = new Date(`${r.date}T${r.time || '00:00'}`);
        const now = new Date();
        const diffMs = now.getTime() - rideDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > 24) return false;
        const matchesFrom = search.from === '' || r.fromCity.toLowerCase().includes(search.from.toLowerCase());
        const matchesTo = search.to === '' || r.toCity.toLowerCase().includes(search.to.toLowerCase());
        return matchesFrom && matchesTo;
    });

    const isFiltered = search.from !== '' || search.to !== '';

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-32">
            <CreateRideModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['rides'] });
                    alert("Поездка отправлена на модерацию. Она появится в общем списке после проверки администратором.");
                }} 
            />
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 dark:text-white uppercase tracking-tight">
                        <Car className="text-blue-600 w-10 h-10" /> Попутчики
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Scale className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">Информационный посредник</span>
                    </div>
                </div>
                <Button onClick={() => currentUser ? setIsModalOpen(true) : navigate('/auth')} className="rounded-2xl py-4 px-8 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20">
                    <Plus className="w-5 h-5 mr-2" /> Предложить поездку
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border dark:border-gray-700 mb-8">
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Откуда" value={search.from} onChange={e => setSearch({...search, from: e.target.value})} />
                    </div>
                    <div className="flex items-center justify-center text-gray-300 hidden md:flex"><ArrowRight className="w-6 h-6" /></div>
                    <div className="flex-1 w-full relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Куда" value={search.to} onChange={e => setSearch({...search, to: e.target.value})} />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button className="flex-1 md:w-32 py-4 rounded-2xl">Найти</Button>
                        {isFiltered && (
                            <Button 
                                variant="ghost" 
                                onClick={handleResetSearch}
                                className="px-4 py-4 rounded-2xl text-gray-400 hover:text-red-500 transition-colors"
                                title="Сбросить фильтры"
                            >
                                <RotateCcw className="w-5 h-5" />
                                <span className="md:hidden ml-2 font-bold uppercase text-[10px]">Сбросить</span>
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            <div className="mb-10 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-black text-blue-900 dark:text-blue-300 uppercase tracking-tight">Безопасные поездки</h4>
                    <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed mt-1">Все объявления проходят модерацию. Помните: сервис не проверяет водителей. Пожалуйста, ознакомьтесь с <Link to="/legal#rides" className="text-blue-600 underline font-bold">памяткой по безопасности</Link>.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
            ) : filteredRides.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed dark:border-gray-700">
                    <Car className="w-16 h-16 mx-auto mb-4 opacity-10 text-gray-400" />
                    <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Активных поездок не найдено</p>
                    {isFiltered && (
                        <button onClick={handleResetSearch} className="mt-4 text-blue-600 font-bold uppercase text-[10px] hover:underline">Показать все поездки</button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredRides.map(ride => {
                        const isAlreadyPassenger = currentUser && ride.passengerDetails?.some(p => p.id === currentUser.id);
                        return (
                            <div key={ride.id} className={`bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 p-6 md:p-8 hover:shadow-2xl transition-all group flex flex-col gap-5 ${isAlreadyPassenger ? 'ring-2 ring-green-500/20' : ''}`}>
                                
                                {/* Верхняя строка: Время, Дата и Цена */}
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">
                                            {ride.time}
                                        </div>
                                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500" /> 
                                            {new Date(ride.date).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})}
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
                                        {ride.price} ₽
                                    </div>
                                </div>

                                {/* Основной блок: Маршрут и Инфо */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="font-black text-xl md:text-2xl dark:text-white uppercase tracking-tight truncate max-w-[150px] md:max-w-none">{ride.fromCity}</span>
                                            <ArrowRight className="w-5 h-5 text-gray-300 shrink-0" />
                                            <span className="font-black text-xl md:text-2xl dark:text-white uppercase tracking-tight truncate max-w-[150px] md:max-w-none">{ride.toCity}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-400 uppercase flex items-center gap-2">
                                                <Car className="w-3.5 h-3.5 text-blue-400" /> {ride.carModel || 'Автомобиль'}
                                            </span>
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ${isAlreadyPassenger ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                <Users className="w-3.5 h-3.5" /> {isAlreadyPassenger ? 'Вы едете!' : `Свободно: ${ride.seats}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Нижняя строка: Водитель и Кнопка бронирования */}
                                <div className="pt-5 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-5">
                                    <div 
                                        className="flex items-center gap-3 cursor-pointer group/user bg-gray-50/50 dark:bg-gray-900/50 p-2 pr-4 rounded-2xl border dark:border-gray-700 hover:border-blue-200 transition-all w-full sm:w-auto" 
                                        onClick={() => handleContact(ride.driverId, `По поводу поездки ${ride.fromCity} → ${ride.toCity}`)}
                                    >
                                        <img src={ride.driverAvatar || 'https://ui-avatars.com/api/?name=D'} alt="" className="w-11 h-11 rounded-xl border-2 border-white dark:border-gray-800 shadow-sm object-cover" />
                                        <div className="text-left">
                                            <div className="text-[10px] font-black dark:text-white uppercase group-hover/user:text-blue-600 transition-colors">{ride.driverName}</div>
                                            <div className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Водитель</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {!isAlreadyPassenger && ride.seats > 1 && (
                                            <div className="relative shrink-0">
                                                <select 
                                                    className="appearance-none bg-gray-100 dark:bg-gray-700 border-none rounded-2xl px-5 py-3.5 pr-10 text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500/20" 
                                                    value={selectedSeatsCount[ride.id] || 1} 
                                                    onChange={e => setSelectedSeatsCount({...selectedSeatsCount, [ride.id]: Number(e.target.value)})}
                                                >
                                                    {Array.from({length: ride.seats}, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? 'МЕСТО' : n < 5 ? 'МЕСТА' : 'МЕСТ'}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        )}
                                        <Button 
                                            className={`flex-1 sm:flex-none rounded-2xl px-10 py-3.5 font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 border-none ${isAlreadyPassenger ? 'bg-green-600 text-white cursor-default opacity-80' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'}`} 
                                            onClick={() => !isAlreadyPassenger && handleBook(ride)}
                                            disabled={isAlreadyPassenger}
                                        >
                                            {isAlreadyPassenger ? 'ВЫ ЕДЕТЕ' : 'БРОНЬ'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] flex items-start gap-4 border border-blue-100 dark:border-blue-900/30">
                <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                    Будьте внимательны при бронировании. Оплата поездки производится водителю лично при встрече. Приложение Снежинск Лайф не берет комиссию и не несет ответственности за действия пользователей. <Link to="/legal" className="text-blue-600 underline">Подробнее в правилах</Link>.
                </p>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Ride } from '../types';
import { Button } from '../components/ui/Common';
import { Car, MapPin, Calendar, Loader2, Plus, Users, Search, ArrowRight, X, MessageSquare, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Создать поездку</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Откуда</label>
                            <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.fromCity} onChange={e => setFormData({...formData, fromCity: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Куда</label>
                            <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.toCity} onChange={e => setFormData({...formData, toCity: e.target.value})} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Дата</label>
                            <input type="date" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Время</label>
                            <input type="time" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Автомобиль</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} placeholder="Toyota Camry, Белая" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Цена (₽)</label>
                            <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Мест</label>
                            <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})} required />
                        </div>
                    </div>
                    <Button className="w-full" disabled={createMutation.isPending}>
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
        if (!currentUser) {
            if (confirm("Чтобы забронировать место, нужно войти. Перейти?")) navigate('/auth');
            return;
        }

        if (ride.driverId === currentUser.id) {
            alert("Вы не можете забронировать место в своей поездке");
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
                price: ride.price,
                requestedSeats: count
            });

            const chatId = await api.startChat(ride.driverId, contextMsg);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleContact = async (driverId: string, context?: string) => {
        if (!currentUser) {
            if (confirm("Чтобы написать водителю, нужно войти. Перейти?")) navigate('/auth');
            return;
        }
        try {
            const chatId = await api.startChat(driverId, context);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) {
            alert(e.message);
        }
    };

    // Comment above fix: Added filtering for rides where seats > 0 to hide full rides
    const filteredRides = rides.filter(r => 
        r.seats > 0 && 
        (search.from === '' || r.fromCity.toLowerCase().includes(search.from.toLowerCase())) &&
        (search.to === '' || r.toCity.toLowerCase().includes(search.to.toLowerCase()))
    );

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <CreateRideModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['rides'] })} 
            />
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                        <Car className="text-blue-600" /> Попутчики
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Находите выгодные поездки или подвозите попутчиков</p>
                </div>
                <Button onClick={() => currentUser ? setIsModalOpen(true) : navigate('/auth')} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Предложить поездку
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 mb-6">
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <input 
                            className="w-full pl-9 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                            placeholder="Откуда (Снежинск)" 
                            value={search.from}
                            onChange={e => setSearch({...search, from: e.target.value})}
                        />
                    </div>
                    <div className="flex items-center justify-center text-gray-400">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <input 
                            className="w-full pl-9 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                            placeholder="Куда (Екатеринбург)" 
                            value={search.to}
                            onChange={e => setSearch({...search, to: e.target.value})}
                        />
                    </div>
                    <Button className="md:w-32">Найти</Button>
                </form>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : filteredRides.length === 0 ? (
                <div className="text-center py-20 text-gray-400">Поездок не найдено. Станьте первым водителем!</div>
            ) : (
                <div className="space-y-4">
                    {filteredRides.map(ride => (
                        <div key={ride.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex flex-col items-center md:items-start min-w-[120px]">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{ride.time}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {new Date(ride.date).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})}
                                </div>
                            </div>

                            <div className="flex-1 w-full text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 font-medium text-lg mb-1 dark:text-white">
                                    <span>{ride.fromCity}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <span>{ride.toCity}</span>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-4">
                                    <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {ride.carModel || 'Авто'}</span>
                                    <span className="flex items-center gap-1 font-bold text-blue-600"><Users className="w-3 h-3" /> Свободно: {ride.seats}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t dark:border-gray-700 md:border-t-0 pt-3 md:pt-0">
                                <div 
                                    className="flex items-center gap-2 cursor-pointer" 
                                    onClick={() => handleContact(ride.driverId, `Поездка: ${ride.fromCity} -> ${ride.toCity} (${ride.date})`)}
                                >
                                    <img src={ride.driverAvatar || 'https://ui-avatars.com/api/?name=Driver'} alt="" className="w-10 h-10 rounded-full bg-gray-100 object-cover" />
                                    <div className="text-left hidden md:block">
                                        <div className="text-sm font-bold dark:text-white">{ride.driverName || 'Водитель'}</div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400">Водитель</div>
                                    </div>
                                </div>
                                <div className="text-right ml-4 flex flex-col items-end">
                                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">{ride.price} ₽</div>
                                    {ride.seats > 0 ? (
                                        <div className="flex items-center gap-2">
                                            {ride.seats > 1 && (
                                                <div className="relative group">
                                                    <select 
                                                        className="appearance-none bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 text-[10px] font-bold py-1.5 pl-2 pr-6 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                                        value={selectedSeatsCount[ride.id] || 1}
                                                        onChange={(e) => setSelectedSeatsCount({...selectedSeatsCount, [ride.id]: Number(e.target.value)})}
                                                    >
                                                        {Array.from({length: ride.seats}, (_, i) => i + 1).map(n => (
                                                            <option key={n} value={n}>{n} мест</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                                </div>
                                            )}
                                            <Button size="sm" onClick={() => handleBook(ride)}>
                                                Бронь
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">Мест нет</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

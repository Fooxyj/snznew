import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { RentalItem, RentalBooking } from '../types';
import { Button } from '../components/ui/Common';
import { Repeat, Plus, Loader2, Calendar, ShieldCheck, Tag, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateRentalModal } from '../components/CRMModals';

export const RentalsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'catalog' | 'my'>('catalog');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
    const [dates, setDates] = useState({ start: '', end: '' });
    
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: rentals = [], isLoading: rLoading } = useQuery({ queryKey: ['rentals'], queryFn: api.getRentals });
    const { data: myBookings = [], isLoading: bLoading } = useQuery({ queryKey: ['myRentalBookings'], queryFn: api.getMyRentals });
    const { data: currentUser } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });

    const loading = rLoading || bLoading;

    const handleCreateClick = () => {
        if (!currentUser) return navigate('/auth');
        setIsCreateOpen(true);
    };

    const handleBook = async () => {
        if (!currentUser) return navigate('/auth');
        if (!selectedItem || !dates.start || !dates.end) return;
        if (selectedItem.authorId === currentUser.id) return alert("Это ваша вещь");

        const startD = new Date(dates.start);
        const endD = new Date(dates.end);
        const diffDays = Math.ceil(Math.abs(endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) || 1;
        const totalPrice = diffDays * selectedItem.pricePerDay;

        try {
            const contextMsg = JSON.stringify({
                type: 'rental_inquiry',
                rentalId: selectedItem.id,
                title: selectedItem.title,
                image: selectedItem.image,
                startDate: dates.start,
                endDate: dates.end,
                price: `${totalPrice} ₽ за ${diffDays} дн.`,
                text: `Здравствуйте! Хочу арендовать "${selectedItem.title}" с ${dates.start} по ${dates.end}.`
            });
            const chatId = await api.startChat(selectedItem.authorId, contextMsg);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) { alert(e.message); }
    };

    const handleReturn = async (id: string) => {
        if (confirm("Вы вернули вещь владельцу?")) {
            try {
                await api.returnRental(id);
                queryClient.invalidateQueries({ queryKey: ['myRentalBookings'] });
                queryClient.invalidateQueries({ queryKey: ['rentals'] });
            } catch (e: any) { alert(e.message); }
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-32">
            <CreateRentalModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['rentals'] })} />

            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[3rem] p-10 lg:p-14 text-white mb-12 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 flex items-center gap-5 tracking-tight uppercase">
                        <Repeat className="w-12 h-12 text-yellow-300" /> Шеринг вещей
                    </h1>
                    <p className="opacity-80 max-w-2xl text-xl font-medium leading-relaxed">
                        Берите нужные вещи в аренду у соседей. Инструменты, гаджеты, спорт — без лишних трат и захламления дома.
                    </p>
                    <div className="mt-12">
                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-none font-black uppercase text-xs tracking-[0.2em] px-12 py-5 rounded-2xl shadow-2xl transition-all hover:scale-[1.02]" onClick={handleCreateClick}>
                            <Plus className="w-5 h-5 mr-2" /> Сдать свою вещь
                        </Button>
                    </div>
                </div>
                <Repeat className="absolute -bottom-16 -right-16 w-80 h-80 opacity-5 rotate-12" />
            </div>

            <div className="flex gap-10 border-b dark:border-gray-800 mb-12 px-2 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveTab('catalog')} className={`pb-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'catalog' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                    Каталог вещей
                    {activeTab === 'catalog' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-full" />}
                </button>
                <button onClick={() => setActiveTab('my')} className={`pb-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'my' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                    Мои аренды <span className="ml-1 opacity-50">({myBookings.length})</span>
                    {activeTab === 'my' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-full" />}
                </button>
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 w-16 h-16" /></div> : (
                activeTab === 'catalog' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {rentals.map(item => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all group">
                                <div className="h-64 relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                                    <img src={item.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                                    <div className="absolute top-5 left-5 bg-indigo-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="font-extrabold text-2xl mb-3 dark:text-white leading-tight uppercase tracking-tight">{item.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 line-clamp-2 leading-relaxed italic">
                                        "{item.description}"
                                    </p>
                                    
                                    <div className="mt-auto space-y-6">
                                        <div className="flex justify-between items-end border-t dark:border-gray-700 pt-6">
                                            <div>
                                                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{item.pricePerDay} ₽</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">в сутки</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">Залог: {item.deposit} ₽</div>
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">возвратный</div>
                                            </div>
                                        </div>
                                        
                                        {selectedItem?.id === item.id ? (
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl space-y-5 animate-fade-in border border-indigo-100 dark:border-indigo-800 shadow-inner">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.2em]">Период аренды</span>
                                                    <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5"/></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase ml-2">С</span>
                                                        <input type="date" className="w-full bg-white dark:bg-gray-700 rounded-xl p-3 text-xs border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase ml-2">ПО</span>
                                                        <input type="date" className="w-full bg-white dark:bg-gray-700 rounded-xl p-3 text-xs border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} />
                                                    </div>
                                                </div>
                                                <Button className="w-full bg-indigo-600 font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 active:scale-95" onClick={handleBook} disabled={!dates.start || !dates.end}>Отправить запрос</Button>
                                            </div>
                                        ) : (
                                            <Button className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95" onClick={() => setSelectedItem(item)}>
                                                <Calendar className="w-5 h-5 mr-2" /> Забронировать
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {myBookings.length === 0 ? (
                            <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed dark:border-gray-700 text-gray-400 shadow-inner">
                                <Tag className="w-20 h-20 mx-auto mb-6 opacity-10" />
                                <p className="font-black uppercase tracking-[0.2em] text-sm">Вы пока ничего не арендовали</p>
                            </div>
                        ) : (
                            myBookings.map(b => (
                                <div key={b.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-10 items-center group transition-all hover:shadow-xl">
                                    <img src={b.rentalImage} className="w-32 h-32 rounded-3xl object-cover shadow-2xl bg-gray-100 ring-4 ring-gray-50 dark:ring-gray-700" alt="" />
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="font-extrabold text-2xl dark:text-white leading-tight mb-4 uppercase tracking-tight">{b.rentalTitle}</h3>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                                            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 border border-indigo-100 dark:border-indigo-800">
                                                <Calendar className="w-4 h-4" /> {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                                            </div>
                                            <div className="font-black text-2xl text-gray-900 dark:text-white">{b.totalPrice} ₽</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="text-[10px] text-gray-400 font-black uppercase flex items-center gap-2 tracking-[0.2em]"><ShieldCheck className="w-4 h-4 text-green-500"/> Залог защищен</div>
                                        <Button variant="outline" className="rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] py-4 px-8 border-indigo-100 dark:border-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-all w-full md:w-auto active:scale-95" onClick={() => handleReturn(b.id)}>Вернуть вещь</Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )
            )}
        </div>
    );
};
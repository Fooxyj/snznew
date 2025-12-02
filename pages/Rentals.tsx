
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RentalItem, RentalBooking } from '../types';
import { Button } from '../components/ui/Common';
import { Repeat, Plus, Loader2, Calendar, ShieldCheck, X, Upload } from 'lucide-react';

const CreateRentalModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', description: '', pricePerDay: '', deposit: '', category: 'Инструмент', image: '' });
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
            await api.createRental({ ...formData, pricePerDay: Number(formData.pricePerDay), deposit: Number(formData.deposit) });
            onSuccess();
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Сдать вещь в аренду</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Название</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Цена/сутки (₽)</label>
                            <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Залог (₽)</label>
                            <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Категория</label>
                        <select className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option>Инструмент</option>
                            <option>Электроника</option>
                            <option>Спорт</option>
                            <option>Одежда</option>
                            <option>Другое</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Описание</label>
                        <textarea rows={3} className="w-full border rounded-lg p-2 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
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
                    <Button className="w-full" disabled={loading || uploading}>{loading ? <Loader2 className="animate-spin" /> : 'Разместить'}</Button>
                </form>
            </div>
        </div>
    );
};

export const RentalsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'catalog' | 'my'>('catalog');
    const [rentals, setRentals] = useState<RentalItem[]>([]);
    const [myBookings, setMyBookings] = useState<RentalBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Booking State
    const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
    const [dates, setDates] = useState({ start: '', end: '' });

    const loadData = async () => {
        setLoading(true);
        try {
            const [r, b] = await Promise.all([api.getRentals(), api.getMyRentals()]);
            setRentals(r);
            setMyBookings(b);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleBook = async () => {
        if (!selectedItem || !dates.start || !dates.end) return;
        const start = new Date(dates.start);
        const end = new Date(dates.end);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const totalPrice = diffDays * selectedItem.pricePerDay;

        if (confirm(`Арендовать на ${diffDays} дн. за ${totalPrice}₽ + Залог ${selectedItem.deposit}₽?`)) {
            try {
                await api.bookRental(selectedItem.id, dates.start, dates.end, totalPrice, selectedItem.deposit);
                alert("Успешно забронировано!");
                setSelectedItem(null);
                loadData();
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    const handleReturn = async (id: string) => {
        if (confirm("Вы вернули вещь владельцу? Залог будет возвращен.")) {
            try {
                await api.returnRental(id);
                alert("Залог возвращен!");
                loadData();
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
            <CreateRentalModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={loadData} />

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white mb-8 shadow-xl">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Repeat className="w-8 h-8 text-yellow-300" /> Шеринг вещей
                </h1>
                <p className="opacity-90 max-w-xl">
                    Берите нужные вещи в аренду у соседей. Инструменты, гаджеты, спорт — без лишних покупок.
                </p>
                <div className="mt-6">
                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-none" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Сдать вещь
                    </Button>
                </div>
            </div>

            <div className="flex border-b dark:border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('catalog')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'catalog' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Каталог
                </button>
                <button 
                    onClick={() => setActiveTab('my')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'my' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Мои аренды ({myBookings.length})
                </button>
            </div>

            {loading ? <div className="flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : (
                activeTab === 'catalog' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rentals.map(item => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                                <div className="h-48 relative">
                                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold shadow">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg dark:text-white mb-1">{item.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                                    
                                    <div className="mt-auto pt-4 border-t dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{item.pricePerDay} ₽</div>
                                                <div className="text-xs text-gray-400">в сутки</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium dark:text-gray-300">{item.deposit} ₽</div>
                                                <div className="text-xs text-gray-400">залог</div>
                                            </div>
                                        </div>
                                        
                                        {selectedItem?.id === item.id ? (
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg animate-in fade-in">
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <input type="date" className="border rounded px-2 py-1 text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white" onChange={e => setDates({...dates, start: e.target.value})} />
                                                    <input type="date" className="border rounded px-2 py-1 text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white" onChange={e => setDates({...dates, end: e.target.value})} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setSelectedItem(null)}>Отмена</Button>
                                                    <Button size="sm" className="flex-1 text-xs" onClick={handleBook}>Взять</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button className="w-full" onClick={() => setSelectedItem(item)}>Выбрать даты</Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myBookings.length === 0 ? <p className="text-center text-gray-400 py-10">Вы пока ничего не арендовали</p> :
                        myBookings.map(b => (
                            <div key={b.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                                <img src={b.rentalImage} alt="" className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-bold text-lg dark:text-white">{b.rentalTitle}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-1">
                                        <Calendar className="w-3 h-3" /> {b.startDate} — {b.endDate}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2 min-w-[150px]">
                                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Залог: {b.deposit} ₽
                                    </div>
                                    <Button size="sm" onClick={() => handleReturn(b.id)}>Вернуть вещь</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

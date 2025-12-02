
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LostFoundItem } from '../types';
import { Button } from '../components/ui/Common';
import { Search, MapPin, Phone, Calendar, Loader2, Plus, CheckCircle, Upload } from 'lucide-react';

const CreateLostFoundModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [type, setType] = useState<'lost' | 'found'>('lost');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        contactName: '',
        contactPhone: '',
        image: ''
    });
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
            alert("Ошибка: " + e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createLostFoundItem({ ...formData, type });
            onSuccess();
            onClose();
            setFormData({ title: '', description: '', location: '', contactName: '', contactPhone: '', image: '' });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Подать объявление</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">X</button>
                </div>
                
                <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                    <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'lost' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                        onClick={() => setType('lost')}
                    >
                        Я потерял
                    </button>
                    <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'found' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                        onClick={() => setType('found')}
                    >
                        Я нашел
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Что случилось?</label>
                        <input 
                            required 
                            className="w-full border rounded-lg p-2 mt-1" 
                            placeholder={type === 'lost' ? "Потерял ключи от машины..." : "Нашел карту Сбербанка..."}
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Где?</label>
                        <input 
                            required 
                            className="w-full border rounded-lg p-2 mt-1" 
                            placeholder="Район, улица..."
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Описание</label>
                        <textarea 
                            required 
                            className="w-full border rounded-lg p-2 mt-1 resize-none" 
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Ваше имя</label>
                            <input 
                                required 
                                className="w-full border rounded-lg p-2 mt-1"
                                value={formData.contactName}
                                onChange={e => setFormData({...formData, contactName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Телефон</label>
                            <input 
                                required 
                                className="w-full border rounded-lg p-2 mt-1" 
                                placeholder="+7..."
                                value={formData.contactPhone}
                                onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {formData.image ? (
                            <img src={formData.image} alt="" className="h-32 mx-auto rounded object-cover" />
                        ) : (
                            <div className="relative cursor-pointer">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <span className="text-sm text-gray-500">{uploading ? "Загрузка..." : "Загрузить фото"}</span>
                                <input type="file" className="absolute inset-0 opacity-0" onChange={handleImageUpload} />
                            </div>
                        )}
                    </div>

                    <Button className="w-full" disabled={loading || uploading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Опубликовать'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const LostFound: React.FC = () => {
    const [items, setItems] = useState<LostFoundItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getLostFoundItems(filter === 'all' ? undefined : filter);
            setItems(data);
            const u = await api.getCurrentUser();
            if (u) setCurrentUserId(u.id);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filter]);

    const handleResolve = async (id: string) => {
        if (confirm("Отметить как решенное? Это скроет контактные данные.")) {
            await api.resolveLostFoundItem(id);
            loadData();
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
            <CreateLostFoundModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadData} />
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Бюро находок</h1>
                    <p className="text-gray-500">Поможем найти потерянное и вернуть найденное</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Подать объявление
                </Button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button 
                    onClick={() => setFilter('all')} 
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Все
                </button>
                <button 
                    onClick={() => setFilter('lost')} 
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'lost' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Потеряно
                </button>
                <button 
                    onClick={() => setFilter('found')} 
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'found' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Найдено
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Список пуст</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <div key={item.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col ${item.isResolved ? 'opacity-60 grayscale' : ''}`}>
                            <div className="h-48 bg-gray-100 relative">
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide text-white ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                                    {item.type === 'lost' ? 'Потеряно' : 'Найдено'}
                                </div>
                                {item.isResolved && (
                                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm">
                                        <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> РЕШЕНО
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">{item.description}</p>
                                
                                <div className="space-y-2 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" /> {item.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" /> {item.date}
                                    </div>
                                </div>

                                {!item.isResolved ? (
                                    <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Контакт:</p>
                                            <p className="font-medium text-gray-900">{item.contactName}</p>
                                        </div>
                                        <a href={`tel:${item.contactPhone}`} className="bg-white border p-2 rounded-full hover:bg-gray-50 text-blue-600">
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 p-3 rounded-lg text-center text-gray-500 text-xs">
                                        Вещь возвращена владельцу
                                    </div>
                                )}

                                {currentUserId === item.authorId && !item.isResolved && (
                                    <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => handleResolve(item.id)}>
                                        Отметить как решено
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

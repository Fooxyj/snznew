import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { LostFoundItem } from '../types';
import { Button } from '../components/ui/Common';
import { Search, MapPin, Phone, Calendar, Loader2, Plus, CheckCircle, Upload, X, MessageCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PhoneInput } from '../components/ui/PhoneInput';

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
    const [uploading, setUploading] = useState(false);
    
    const createMutation = useMutation({
        mutationFn: api.createLostFoundItem,
        onSuccess: () => {
            onSuccess();
            onClose();
            setFormData({ title: '', description: '', location: '', contactName: '', contactPhone: '', image: '' });
        },
        onError: (err: any) => alert(err.message)
    });

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) {
            alert("Ошибка загрузки фото: " + e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ ...formData, type });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Подать объявление</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400"/></button>
                </div>
                
                <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold">
                    <button 
                        className={`flex-1 py-2.5 text-sm rounded-xl transition-all ${type === 'lost' ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' : 'text-gray-500'}`}
                        onClick={() => setType('lost')}
                    >
                        Я потерял
                    </button>
                    <button 
                        className={`flex-1 py-2.5 text-sm rounded-xl transition-all ${type === 'found' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' : 'text-gray-500'}`}
                        onClick={() => setType('found')}
                    >
                        Я нашел
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Что именно?</label>
                        <input required className="w-full border dark:border-gray-700 rounded-2xl p-4 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder={type === 'lost' ? "Напр: Ключи от машины" : "Напр: Карта Сбербанка"} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Где это произошло?</label>
                        <input required className="w-full border dark:border-gray-700 rounded-2xl p-4 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="Район, улица или магазин" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Описание</label>
                        <textarea required className="w-full border dark:border-gray-700 rounded-2xl p-4 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Ваше имя</label>
                            <input required className="w-full border dark:border-gray-700 rounded-2xl p-4 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Телефон</label>
                            <PhoneInput value={formData.contactPhone} onChangeText={val => setFormData({...formData, contactPhone: val})} required />
                        </div>
                    </div>
                    <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] p-8 text-center bg-gray-50 dark:bg-gray-900/50 group">
                        {formData.image ? (
                            <div className="relative inline-block">
                                <img src={formData.image} alt="" className="h-40 mx-auto rounded-2xl object-cover shadow-xl" />
                                <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"><X className="w-4 h-4"/></button>
                            </div>
                        ) : (
                            <div className="relative cursor-pointer py-4">
                                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-500 transition-colors">{uploading ? "Загрузка..." : "Добавить фото"}</span>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            </div>
                        )}
                    </div>
                    <Button className="w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20" disabled={createMutation.isPending || uploading}>
                        {createMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Опубликовать'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const LostFound: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: currentUser } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const { data: items = [], isLoading } = useQuery({ 
        queryKey: ['lostFound', filter], 
        queryFn: () => api.getLostFoundItems(filter)
    });

    const resolveMutation = useMutation({
        mutationFn: api.resolveLostFoundItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lostFound'] });
        }
    });

    const handleCreateClick = () => {
        if (!currentUser) return navigate('/auth');
        setIsModalOpen(true);
    };

    const handleContact = async (item: LostFoundItem) => {
        if (!currentUser) return navigate('/auth');
        if (item.authorId === currentUser.id) return;

        try {
            const contextMsg = JSON.stringify({
                type: 'lost_found_inquiry',
                id: item.id,
                title: item.title,
                image: item.image,
                text: `Здравствуйте! Я по поводу объявления в Бюро находок: "${item.title}"`
            });
            const chatId = await api.startChat(item.authorId, contextMsg);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) { alert(e.message); }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-32">
            <CreateLostFoundModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['lostFound'] })} />
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-4 tracking-tighter">
                        <HelpCircle className="w-10 h-10 text-blue-600" /> Бюро находок
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 text-lg">Поможем вернуть потерянное и найти владельцев</p>
                </div>
                <Button onClick={handleCreateClick} className="rounded-2xl py-4 px-10 font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]">
                    <Plus className="w-4 h-4 mr-2" /> Подать объявление
                </Button>
            </div>

            <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'lost', 'found'].map((f) => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f as any)} 
                        className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-gray-800 text-gray-400 border dark:border-gray-700 hover:text-blue-600 hover:border-blue-200'}`}
                    >
                        {f === 'all' ? 'Все' : f === 'lost' ? 'Потеряно' : 'Найдено'}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed dark:border-gray-700">
                    <Search className="w-20 h-20 mx-auto mb-6 opacity-10 text-gray-400" />
                    <p className="font-black text-gray-400 uppercase tracking-[0.2em] text-sm">Объявлений пока нет</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map(item => (
                        <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-2xl group ${item.isResolved ? 'opacity-60 grayscale-[0.8]' : ''}`}>
                            <div className="h-60 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                                <img src={item.image || 'https://via.placeholder.com/600x400?text=Снежинск+Онлайн'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                <div className={`absolute top-5 left-5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-2xl ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-600'}`}>
                                    {item.type === 'lost' ? 'Потеряно' : 'Найдено'}
                                </div>
                                {item.isResolved && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[3px]">
                                        <div className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl">
                                            <CheckCircle className="w-4 h-4 text-green-600" /> РЕШЕНО
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-7 flex-1 flex flex-col">
                                <h3 className="font-extrabold text-xl mb-2 dark:text-white leading-tight uppercase tracking-tight line-clamp-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 line-clamp-3 leading-relaxed flex-1 italic">
                                    "{item.description}"
                                </p>
                                
                                <div className="space-y-4 pt-6 border-t dark:border-gray-700 mb-8 mt-auto">
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" /> {item.location}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <Calendar className="w-4 h-4 text-blue-500 shrink-0" /> {item.date}
                                    </div>
                                </div>

                                {!item.isResolved && (
                                    <div className="flex gap-3">
                                        {currentUser?.id === item.authorId ? (
                                            <Button variant="outline" className="w-full rounded-2xl py-4 border-green-200 text-green-600 dark:border-green-900/50 hover:bg-green-50 font-black uppercase text-[10px] tracking-[0.2em]" onClick={() => resolveMutation.mutate(item.id)}>
                                                Отметить решенным
                                            </Button>
                                        ) : (
                                            <>
                                                <a href={`tel:${item.contactPhone}`} className="w-14 h-14 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-200 flex items-center justify-center rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border dark:border-gray-700 shadow-sm active:scale-90">
                                                    <Phone className="w-5 h-5" />
                                                </a>
                                                <button onClick={() => handleContact(item)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10 active:scale-95 transition-all">
                                                    <MessageCircle className="w-4 h-4" /> Написать
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
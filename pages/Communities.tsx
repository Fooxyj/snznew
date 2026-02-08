
import React, { useState } from 'react';
import { api } from '../services/api';
import { Community, UserRole } from '../types';
import { Button } from '../components/ui/Common';
import { Users, Loader2, ArrowRight, Plus, X, Upload, Shield, Hash, MessageSquare, Heart, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ToastProvider';

const COMMUNITY_CATEGORIES = [
    'Спорт и Здоровье', 'Технологии', 'Мамы и Дети', 'Творчество', 'Авто и Мото', 'Помощь', 'Городская среда', 'Юмор'
];

const CreateCommunityModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', description: '', image: '', category: COMMUNITY_CATEGORIES[0] });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { success } = useToast();

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createCommunity(formData);
            success("Сообщество отправлено на модерацию!");
            onSuccess();
            onClose();
            setFormData({ name: '', description: '', image: '', category: COMMUNITY_CATEGORIES[0] });
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Создать клуб</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Название</label>
                        <input className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Напр: Снежинский велоклуб" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Категория</label>
                        <select className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {COMMUNITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Описание</label>
                        <textarea rows={3} className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="О чем ваш клуб?" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest flex justify-between items-center">
                            Обложка клуба 
                            <span className="text-blue-500 font-bold">1200x400 px</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-6 text-center relative hover:bg-gray-50 transition-colors cursor-pointer group bg-gray-50/50">
                            {formData.image ? (
                                <img src={formData.image} alt="" className="h-32 mx-auto rounded-xl object-cover shadow-xl" />
                            ) : (
                                <div className="flex flex-col items-center py-4">
                                    <ImageIcon className="w-10 h-10 text-gray-300 mb-3 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-500">{uploading ? "Загрузка..." : "Нажмите для выбора"}</span>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                </div>
                            )}
                        </div>
                    </div>
                    <Button className="w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Отправить на модерацию'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const Communities: React.FC = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Все');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: communities = [], isLoading } = useQuery({
        queryKey: ['communities'],
        queryFn: api.getCommunities
    });

    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const filtered = selectedCategory === 'Все' 
        ? communities 
        : communities.filter(c => c.category === selectedCategory);

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-32">
            <CreateCommunityModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => queryClient.invalidateQueries({queryKey:['communities']})} />

            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-4 dark:text-white uppercase tracking-tighter">
                        <Users className="text-indigo-600 w-12 h-12" /> Клубы Снежинска
                    </h1>
                    <p className="text-gray-500 font-medium text-lg mt-2 italic">Объединяйтесь с теми, кто разделяет ваши интересы</p>
                </div>
                {currentUser && (
                    <Button onClick={() => setIsCreateOpen(true)} className="rounded-2xl py-4 px-10 font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/10">
                        <Plus className="w-5 h-5 mr-2" /> Создать клуб
                    </Button>
                )}
            </div>

            <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                {['Все', ...COMMUNITY_CATEGORIES].map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-gray-800 text-gray-400 border dark:border-gray-700 hover:text-indigo-600'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filtered.map(c => (
                    <div key={c.id} onClick={() => navigate(`/community/${c.id}`)} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all cursor-pointer group">
                        <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                            <img src={c.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg mb-2 inline-block">
                                    {c.category || 'Общее'}
                                </span>
                                <h3 className="text-white font-black text-2xl uppercase tracking-tight line-clamp-1 drop-shadow-md">{c.name}</h3>
                            </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-8 flex-1 line-clamp-3 leading-relaxed italic">"{c.description}"</p>
                            <div className="flex items-center justify-between mt-auto border-t dark:border-gray-700 pt-6">
                                <div className="flex items-center gap-5 text-gray-400">
                                    <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-500" /><span className="text-[11px] font-black uppercase tracking-widest">{c.membersCount || 0}</span></div>
                                    <div className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-green-500" /><span className="text-[11px] font-black uppercase tracking-widest">ЧАТ</span></div>
                                </div>
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 group-hover:translate-x-1 transition-transform">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

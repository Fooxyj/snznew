
import React, { useState } from 'react';
import { api } from '../services/api';
import { Community, UserRole } from '../types';
import { Button } from '../components/ui/Common';
import { Users, Loader2, ArrowRight, Plus, X, Upload, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ToastProvider';

const CreateCommunityModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', description: '', image: '' });
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
            setFormData({ name: '', description: '', image: '' });
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl h-[90vh] overflow-y-auto slide-in-from-top">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Создать сообщество</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 flex gap-3 items-start">
                    <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300">Ваше сообщество появится в списке после проверки администратором (обычно в течение 24 часов).</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Название</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Например: Клуб любителей бега" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Описание</label>
                        <textarea rows={3} className="w-full border rounded-lg p-2 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="О чем это сообщество?" />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        {formData.image ? (
                            <img src={formData.image} alt="" className="h-24 mx-auto rounded object-cover" />
                        ) : (
                            <div className="relative cursor-pointer">
                                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">{uploading ? "..." : "Загрузить обложку"}</span>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            </div>
                        )}
                    </div>
                    <Button className="w-full" disabled={loading || uploading}>{loading ? <Loader2 className="animate-spin" /> : 'Создать и отправить'}</Button>
                </form>
            </div>
        </div>
    );
};

export const Communities: React.FC = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: communities = [], isLoading } = useQuery({
        queryKey: ['communities'],
        queryFn: api.getCommunities
    });

    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <CreateCommunityModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => queryClient.invalidateQueries({queryKey:['communities']})} />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-3 dark:text-white">
                        <Users className="text-indigo-600 dark:text-indigo-400 w-8 h-8" /> Сообщества Снежинска
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Вступайте в клубы по интересам и обсуждайте важное.</p>
                </div>
                {currentUser && (
                    <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Создать
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communities.map(c => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gray-100 dark:bg-gray-700 relative">
                            <img src={c.image} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <h3 className="text-white font-bold text-xl text-center px-4 shadow-black drop-shadow-md">{c.name}</h3>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1 line-clamp-2">{c.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {c.membersCount || 0} участников
                                </span>
                                <Link to={`/community/${c.id}`}>
                                    <Button variant="secondary" size="sm">Открыть <ArrowRight className="w-4 h-4 ml-1" /></Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {communities.length === 0 && <div className="col-span-full py-20 text-center text-gray-400">Пока нет активных сообществ</div>}
            </div>
        </div>
    );
};

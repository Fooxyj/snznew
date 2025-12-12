
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Appeal, UserRole } from '../types';
import { Button } from '../components/ui/Common';
import { MapPin, Loader2, Camera, CheckCircle2, AlertCircle, Plus, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateAppealModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        image: ''
    });
    const [uploading, setUploading] = useState(false);

    // Mutation
    const createMutation = useMutation({
        mutationFn: api.createAppeal,
        onSuccess: () => {
            onSuccess();
            onClose();
            setFormData({ title: '', description: '', location: '', image: '' });
        },
        onError: (e: any) => alert(e.message)
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
            alert("Ошибка: " + e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6 shadow-2xl h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Сообщить о проблеме</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Что случилось?</label>
                        <input 
                            required 
                            className="w-full border rounded-lg p-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                            placeholder="Яма на дороге, не горит фонарь..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Где?</label>
                        <input 
                            required 
                            className="w-full border rounded-lg p-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                            placeholder="Улица, номер дома..."
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Описание</label>
                        <textarea 
                            required 
                            className="w-full border rounded-lg p-2 mt-1 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                            rows={3}
                            placeholder="Опишите проблему подробнее..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Фото проблемы</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mt-1">
                            {formData.image ? (
                                <img src={formData.image} alt="" className="h-32 mx-auto rounded object-cover" />
                            ) : (
                                <div className="relative cursor-pointer">
                                    <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{uploading ? "Загрузка..." : "Загрузить фото"}</span>
                                    <input type="file" className="absolute inset-0 opacity-0" onChange={handleImageUpload} />
                                </div>
                            )}
                        </div>
                    </div>

                    <Button className="w-full" disabled={createMutation.isPending || uploading}>
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отправить жалобу'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const CityMonitor: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Resolve Logic
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState('');
    const [uploadingResult, setUploadingResult] = useState(false);

    // Queries
    const { data: appeals = [], isLoading } = useQuery({
        queryKey: ['appeals'],
        queryFn: api.getAppeals
    });

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    // Mutations
    const resolveMutation = useMutation({
        mutationFn: ({ id, img }: { id: string, img: string }) => api.resolveAppeal(id, img),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appeals'] });
            setResolvingId(null);
            setResultImage('');
        },
        onError: (e: any) => alert(e.message)
    });

    const handleCreateClick = () => {
        if (!user) {
            if (confirm("Для отправки обращения необходимо войти. Перейти?")) {
                navigate('/auth');
            }
            return;
        }
        setIsModalOpen(true);
    };

    const handleResultUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingResult(true);
        try {
            const url = await api.uploadImage(file);
            setResultImage(url);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploadingResult(false);
        }
    };

    const submitResolve = () => {
        if (!resolvingId || !resultImage) return;
        resolveMutation.mutate({ id: resolvingId, img: resultImage });
    };

    const isAdmin = user?.role === UserRole.ADMIN;

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
            <CreateAppealModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['appeals'] })} 
            />
            
            {/* Admin Resolve Modal */}
            {resolvingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">Подтверждение решения</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Загрузите фото результата, чтобы закрыть заявку.</p>
                        
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-4">
                            {resultImage ? (
                                <img src={resultImage} alt="" className="h-32 mx-auto rounded object-cover" />
                            ) : (
                                <div className="relative cursor-pointer">
                                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{uploadingResult ? "Загрузка..." : "Фото результата"}</span>
                                    <input type="file" className="absolute inset-0 opacity-0" onChange={handleResultUpload} />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-gray-300" onClick={() => { setResolvingId(null); setResultImage(''); }}>Отмена</Button>
                            <Button className="flex-1" disabled={!resultImage || resolveMutation.isPending} onClick={submitResolve}>
                                {resolveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Подтвердить'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white mb-10 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Городской Контроль</h1>
                    <p className="opacity-90 max-w-xl mb-6">Вместе мы делаем Снежинск лучше. Сообщайте о проблемах городской инфраструктуры, и администрация решит их.</p>
                    <Button 
                        onClick={handleCreateClick} 
                        variant="secondary"
                        className="text-blue-600 hover:bg-blue-50 border-none shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Сообщить о проблеме
                    </Button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Лента обращений</h2>
                 <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-sm font-bold">{appeals.length}</span>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : appeals.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed dark:border-gray-700 text-gray-400">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>В городе нет активных проблем! Или о них еще не сообщили.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appeals.map(appeal => (
                        <div key={appeal.id} className={`bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col ${appeal.status === 'done' ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
                            <div className="h-48 relative bg-gray-100 dark:bg-gray-700 group">
                                <img src={appeal.image} alt="" className="w-full h-full object-cover" />
                                <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide text-white ${appeal.status === 'done' ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {appeal.status === 'done' ? 'Решено' : 'Проблема'}
                                </div>
                                {appeal.status === 'done' && appeal.resultImage && (
                                    <div className="absolute inset-0 bg-white dark:bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <img src={appeal.resultImage} alt="Result" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 w-full bg-black/50 text-white text-center text-xs py-1">Результат</div>
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-2 line-clamp-1 dark:text-white">{appeal.title}</h3>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
                                    <MapPin className="w-3.5 h-3.5 mr-1" /> {appeal.location}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1">{appeal.description}</p>
                                
                                {appeal.status === 'done' ? (
                                    <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg flex items-center gap-3 text-sm font-medium">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Проблема устранена!
                                    </div>
                                ) : (
                                    <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-center gap-3 text-sm font-medium">
                                        <AlertCircle className="w-5 h-5" />
                                        В работе у администрации
                                    </div>
                                )}

                                {isAdmin && appeal.status === 'new' && (
                                    <Button className="mt-4 w-full" onClick={() => setResolvingId(appeal.id)}>
                                        Решить проблему
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

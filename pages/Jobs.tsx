import React, { useState } from 'react';
import { api } from '../services/api';
import { Vacancy, User } from '../types';
import { Button, Badge } from '../components/ui/Common';
import { Loader2, Briefcase, X, Plus, Upload, Trash2, Zap, Sparkles, Flame, Clock, MapPin, Camera, Phone, MessageSquare, ChevronRight, Building2, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PhoneInput } from '../components/ui/PhoneInput';
import { SuccessModal } from '../components/SuccessModal';

const CreateVacancyModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({ 
        title: '', 
        companyName: '', 
        description: '', 
        contactPhone: '', 
        salaryMin: '', 
        salaryMax: '', 
        schedule: 'full' as const,
        tier: 'regular' as 'regular' | 'vip' | 'urgent',
        images: [] as string[]
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!isOpen && !showSuccess) return null;

    if (showSuccess) {
        return (
            <SuccessModal 
                isOpen={showSuccess} 
                onClose={() => { setShowSuccess(false); onClose(); }} 
            />
        );
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (formData.images.length >= 5) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    const removeImage = (idx: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createVacancy({
                ...formData,
                salaryMin: Number(formData.salaryMin),
                salaryMax: Number(formData.salaryMax),
                image: formData.images[0] || '',
            });
            onSuccess();
            setShowSuccess(true);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl mt-10 mb-10 relative animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8 border-b dark:border-gray-700 pb-5">
                    <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white flex items-center gap-3">
                        <Plus className="w-6 h-6 text-blue-600" /> Разместить вакансию
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1.5 block tracking-widest">Должность</label>
                        <input className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Напр: Повар-сушист" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1.5 block tracking-widest">Компания</label>
                        <input className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} required placeholder="Название организации" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1.5 block tracking-widest">З/П от (₽)</label>
                            <input type="number" className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} placeholder="0" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1.5 block tracking-widest">График</label>
                            <select className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value as any})}>
                                <option value="full">Полный день</option>
                                <option value="shift">Сменный</option>
                                <option value="remote">Удаленно</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1.5 block tracking-widest">Описание и требования</label>
                        <textarea className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none outline-none focus:ring-2 focus:ring-blue-500 font-medium" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Опишите требования и условия..." />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block tracking-widest">Фотографии ({formData.images.length}/5)</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border dark:border-gray-700 bg-gray-100 group shadow-sm">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                </div>
                            ))}
                            {formData.images.length < 5 && (
                                <div className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer">
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                                </div>
                            )}
                        </div>
                    </div>

                    <Button className="w-full py-5 rounded-2xl uppercase font-black tracking-widest shadow-2xl shadow-blue-500/20" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Опубликовать вакансию'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const JobsPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const { data: vacancies = [], isLoading } = useQuery({ 
        queryKey: ['vacancies'], 
        queryFn: api.getVacancies 
    });

    const handleApply = async (v: Vacancy) => {
        if (!user) return navigate('/auth');
        if (user.id === v.authorId) return alert("Вы разместили эту вакансию");

        try {
            const contextMsg = JSON.stringify({
                type: 'vacancy_apply',
                vacancyId: v.id,
                title: v.title,
                company: v.companyName,
                text: `Здравствуйте! Я хочу откликнуться на вакансию "${v.title}" в компании "${v.companyName}".`
            });
            
            const chatId = await api.startChat(v.authorId, contextMsg, v.businessId);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) {
            alert("Ошибка при создании чата: " + e.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8 pb-32">
            <CreateVacancyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['vacancies'] })} />
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-4 dark:text-white uppercase tracking-tighter">
                        <Briefcase className="text-blue-600 w-12 h-12" /> Работа в городе
                    </h1>
                    <p className="text-gray-500 font-medium text-lg mt-2 italic">Найдите работу мечты или надежного сотрудника в Снежинске</p>
                </div>
                <Button onClick={() => user ? setIsModalOpen(true) : navigate('/auth')} className="rounded-2xl py-5 px-10 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all">
                    <Plus className="w-5 h-5 mr-2" /> Разместить вакансию
                </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30 flex items-start gap-4 mb-12">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                   <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h4 className="text-sm font-black uppercase text-blue-900 dark:text-blue-300 tracking-tight">Прямая связь с работодателем</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed mt-1 font-medium">
                        Теперь при отклике на вакансию автоматически создается чат. Вы можете задать вопросы и отправить свое резюме файлом прямо в мессенджере Простора.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : vacancies.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed dark:border-gray-700">
                    <Briefcase className="w-20 h-20 mx-auto mb-6 opacity-10 text-gray-400" />
                    <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Актуальных вакансий пока нет</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {vacancies.map(v => (
                        <div key={v.id} className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                            {v.tier === 'vip' && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>}
                            
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0 border dark:border-gray-700 overflow-hidden shadow-inner">
                                    {v.image ? (
                                        <img src={v.image} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors leading-none">{v.title}</h3>
                                        {v.tier === 'urgent' && <Badge color="red" className="animate-pulse">Срочно</Badge>}
                                        {v.tier === 'vip' && <Sparkles className="w-5 h-5 text-orange-500" />}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        <span className="text-gray-900 dark:text-white">{v.companyName}</span>
                                        <span className="w-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></span>
                                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                            <Wallet className="w-4 h-4" /> {v.salaryMin ? `от ${v.salaryMin.toLocaleString()} ₽` : 'з/п договорная'}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 italic font-medium leading-relaxed">
                                        "{v.description}"
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 z-10">
                                <a 
                                    href={`tel:${v.contactPhone}`} 
                                    className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all border dark:border-gray-700 active:scale-90"
                                    title="Позвонить напрямую"
                                >
                                    <Phone className="w-6 h-6" />
                                </a>
                                <Button 
                                    onClick={() => handleApply(v)}
                                    className="w-full sm:w-auto rounded-[1.5rem] px-10 py-4 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" /> Откликнуться
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-16 text-center">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">© ПРОСТОР РАБОТА • 2025</p>
            </div>
        </div>
    );
};
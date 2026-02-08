
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Business } from '../../types';
import { Button } from '../ui/Common';
import { Loader2, Film, Lock, CheckCircle2, Send, PenTool, Palette, FileText, Key, MessageCircle, Crown, ShieldCheck, Mail, ArrowRight, Clock, Globe, AlertTriangle, XCircle, PlaySquare, ExternalLink, Camera, Image as ImageIcon, MapPin, Sparkles } from 'lucide-react';
import { useToast } from '../ToastProvider';
import { PhoneInput } from '../ui/PhoneInput';
import { StoryEditor } from '../StoryEditor';
import { useNavigate } from 'react-router-dom';

interface CRMSettingsProps {
    business: Business;
}

type RequestType = 'content' | 'design' | 'rights';

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
});

export const CRMSettings: React.FC<CRMSettingsProps> = ({ business }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    
    const [isCustomSchedule, setIsCustomSchedule] = useState(false);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');

    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    
    const [requestType, setRequestType] = useState<RequestType>('content');
    const [requestMessage, setRequestMessage] = useState('');
    const [isStoryEditorOpen, setIsStoryEditorOpen] = useState(false);

    const { register, control, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm<Business>({
        defaultValues: business
    });

    const watchedImage = watch('image');
    const watchedCover = watch('coverImage');
    const watchedWebsite = watch('website');

    useEffect(() => {
        if (business) {
            reset(business);
            const hours = business.workHours || '';
            const match = hours.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
            
            if (match) {
                setStartTime(match[1]);
                setEndTime(match[2]);
                setIsCustomSchedule(false);
            } else {
                if (hours && hours.trim() !== '') {
                    setIsCustomSchedule(true);
                }
            }
        }
    }, [business, reset]);

    const updateSchedule = (start: string, end: string) => {
        setStartTime(start);
        setEndTime(end);
        if (!isCustomSchedule) {
            const newVal = `${start} - ${end}`;
            setValue('workHours', newVal, { shouldDirty: true, shouldValidate: true });
        }
    };

    const toggleCustomSchedule = () => {
        const nextState = !isCustomSchedule;
        setIsCustomSchedule(nextState);
        if (!nextState) {
            const newVal = `${startTime} - ${endTime}`;
            setValue('workHours', newVal, { shouldDirty: true, shouldValidate: true });
        }
    };

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Business>) => api.updateBusiness(business.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBusinesses'] });
            success("Настройки успешно сохранены!");
            reset(watch()); 
        },
        onError: (e: any) => showError(e.message)
    });

    const onSubmit = (data: Business) => {
        // Очистка URL сайта перед сохранением
        if (data.website && !data.website.startsWith('http') && data.website.trim() !== '') {
            data.website = 'https://' + data.website.trim();
        }
        updateMutation.mutate(data);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'coverImage') => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (field === 'image') setUploadingImage(true);
        else setUploadingCover(true);

        try {
            const url = await api.uploadImage(file);
            setValue(field, url, { shouldDirty: true, shouldValidate: true });
        } catch (e: any) { 
            showError(e.message); 
        } finally {
            if (field === 'image') setUploadingImage(false);
            else setUploadingCover(false);
        }
    };

    return (
        <div className="max-w-3xl animate-in fade-in pb-20 space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">Настройки профиля</h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {business.id.slice(0,8)}</p>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                    business.verificationStatus === 'verified' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400' :
                    business.verificationStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                    {business.verificationStatus === 'verified' ? 'Подтвержден' : 'На проверке'}
                </div>
            </div>

            {isStoryEditorOpen && (
                <div className="fixed inset-0 z-[200]">
                    <StoryEditor 
                        onClose={() => setIsStoryEditorOpen(false)}
                        onSave={async (media, caption, config) => {
                            await api.createStory(media, caption, business.id, config);
                            success("История опубликована!");
                            setIsStoryEditorOpen(false);
                            queryClient.invalidateQueries({ queryKey: ['stories'] });
                        }}
                    />
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Медиа-контент */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border dark:border-gray-700 shadow-sm text-center relative overflow-hidden">
                        <div className="relative w-24 h-24 mx-auto mb-4 group">
                            <img src={watchedImage} className="w-full h-full rounded-[1.5rem] object-cover border-4 border-gray-50 dark:border-gray-900 shadow-lg" alt="" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {uploadingImage ? <Loader2 className="animate-spin" /> : <Camera className="w-6 h-6" />}
                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'image')} />
                            </label>
                        </div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Логотип (1:1)</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border dark:border-gray-700 shadow-sm text-center">
                        <div className="relative h-24 w-full mb-4 group rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900">
                            {watchedCover ? (
                                <img src={watchedCover} className="w-full h-full object-cover border-4 border-gray-50 dark:border-gray-900 shadow-lg" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">Нет обложки</div>
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {uploadingCover ? <Loader2 className="animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                            </label>
                        </div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Обложка профиля (горизонтальная)</p>
                    </div>
                </div>

                {/* Основные данные */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border dark:border-gray-700 shadow-sm space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-[0.2em]">Название компании / Имя мастера</label>
                        <input 
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 font-bold dark:text-white focus:ring-2 focus:ring-blue-500/20" 
                            {...register('name', { required: true })}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Ссылка на сайт или соцсети (VK/Telegram)</label>
                            {watchedWebsite && (
                                <a href={watchedWebsite.startsWith('http') ? watchedWebsite : `https://${watchedWebsite}`} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-600 flex items-center gap-1 hover:underline uppercase tracking-widest">
                                    <ExternalLink className="w-3 h-3" /> Проверить переход
                                </a>
                            )}
                        </div>
                        <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-14 pr-6 py-4 font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:font-medium" 
                                placeholder="mysite.ru или vk.com/myshop"
                                {...register('website')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-[0.2em]">Описание компании (О себе)</label>
                        <textarea 
                            rows={5} 
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-3xl px-6 py-5 font-medium dark:text-white focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed" 
                            placeholder="Расскажите клиентам о ваших преимуществах, опыте или ассортименте..."
                            {...register('description')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-[0.2em]">Контактный телефон</label>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <PhoneInput value={field.value} onChangeText={field.onChange} className="bg-gray-50 dark:bg-gray-900 border-none h-[56px]" />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-[0.2em]">Адрес / Район</label>
                            <div className="relative">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-14 pr-6 py-4 font-bold dark:text-white" 
                                    {...register('address')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button 
                            className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 disabled:opacity-50" 
                            disabled={updateMutation.isPending || !isDirty}
                        >
                            {updateMutation.isPending ? <Loader2 className="animate-spin" /> : 'Сохранить изменения профиля'}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Блок спец-возможностей */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-black uppercase mb-3 flex items-center gap-2">
                        <PlaySquare className="w-6 h-6 fill-white text-indigo-600" /> Моментальные истории
                    </h3>
                    <p className="text-indigo-100 text-sm mb-8 leading-relaxed max-w-md">Публикуйте новости, акции и жизнь вашего бизнеса. Истории увидят все жители Снежинска на главной странице портала.</p>
                    <Button 
                        className="bg-white text-indigo-600 hover:bg-indigo-50 border-none px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl"
                        onClick={() => setIsStoryEditorOpen(true)}
                    >
                        Запустить редактор историй
                    </Button>
                </div>
                <Sparkles className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
            </div>
        </div>
    );
};

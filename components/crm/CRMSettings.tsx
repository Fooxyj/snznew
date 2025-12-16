
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Business } from '../../types';
import { Button } from '../ui/Common';
import { Loader2, Film, Lock, CheckCircle2, Send, PenTool, Palette, FileText, Key, MessageCircle, Crown, ShieldCheck, Mail, ArrowRight, Clock, Globe, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '../ToastProvider';
import { PhoneInput } from '../ui/PhoneInput';
import { StoryEditor } from '../StoryEditor';
import { useNavigate } from 'react-router-dom';

interface CRMSettingsProps {
    business: Business;
}

type RequestType = 'content' | 'design' | 'rights';

// Generate time options (00:00, 00:30, ... 23:30)
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
});

export const CRMSettings: React.FC<CRMSettingsProps> = ({ business }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    
    // Schedule State
    const [isCustomSchedule, setIsCustomSchedule] = useState(false);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');

    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    
    // Story Request States
    const [requestType, setRequestType] = useState<RequestType>('content');
    const [requestMessage, setRequestMessage] = useState('');
    const [isStoryEditorOpen, setIsStoryEditorOpen] = useState(false);

    // Initializing React Hook Form
    const { register, control, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm<Business>({
        defaultValues: business
    });

    const watchedImage = watch('image');
    const watchedCover = watch('coverImage');

    useEffect(() => {
        // Use reset to update defaultValues and pristine state when business data loads
        if (business) {
            reset(business);
            
            // Parse Schedule Logic
            const hours = business.workHours || '';
            const match = hours.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
            
            if (match) {
                setStartTime(match[1]);
                setEndTime(match[2]);
                setIsCustomSchedule(false);
            } else {
                // If it doesn't match standard format (e.g. "Kruglo...", "Mon-Fri..."), switch to custom
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
            // Revert to dropdown values
            const newVal = `${startTime} - ${endTime}`;
            setValue('workHours', newVal, { shouldDirty: true, shouldValidate: true });
        } else {
            // Keep current value but allow editing
        }
    };

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Business>) => api.updateBusiness(business.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBusinesses'] });
            success("Настройки успешно сохранены!");
            // Explicitly reset form state with new data to reset isDirty
            reset(watch()); 
        },
        onError: (e: any) => showError(e.message)
    });

    const sendRequestMutation = useMutation({
        mutationFn: async () => {
            const adminId = await api.getAdminUserId();
            if (!adminId) throw new Error("Администратор не найден. Напишите на fooxyj@yandex.ru");

            let prefix = '';
            switch(requestType) {
                case 'content': prefix = '[ПРОСЬБА ОПУБЛИКОВАТЬ]'; break;
                case 'design': prefix = '[ЗАКАЗ ДИЗАЙНА]'; break;
                case 'rights': prefix = '[ЗАПРОС ПРАВ]'; break;
            }
            const fullMessage = `${prefix} ${requestMessage} (Бизнес: ${business.name})`;
            const chatId = await api.startChat(adminId, fullMessage);
            return chatId;
        },
        onSuccess: (chatId) => {
            success("Заявка отправлена! Переходим в чат с администратором...");
            setTimeout(() => navigate(`/chat?id=${chatId}`), 1000);
            setRequestMessage('');
        },
        onError: (e: any) => {
            showError(e.message);
            window.location.href = `mailto:fooxyj@yandex.ru?subject=Запрос для бизнеса ${business.name}&body=${requestMessage}`;
        }
    });

    const submitStoryMutation = useMutation({
        mutationFn: ({ media, caption, config }: any) => api.createStory(media, caption, business.id, config),
        onSuccess: () => {
            success("История отправлена на модерацию!");
            setIsStoryEditorOpen(false);
        },
        onError: (e: any) => showError(e.message)
    });

    const onSubmit = (data: Business) => {
        updateMutation.mutate(data);
    };

    const handleContactAdmin = async () => {
        try {
            const adminId = await api.getAdminUserId();
            if (!adminId) {
                alert("Администратор не найден. Пожалуйста, напишите на email: fooxyj@yandex.ru");
                window.location.href = "mailto:fooxyj@yandex.ru";
                return;
            }
            const msg = `Здравствуйте! Пишу по поводу бизнеса "${business.name}"`;
            const chatId = await api.startChat(adminId, msg);
            navigate(`/chat?id=${chatId}`);
        } catch (e) {
            navigate('/chat'); 
            showError("Ошибка соединения. Пишите на fooxyj@yandex.ru");
        }
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
        <div className="max-w-3xl animate-in fade-in pb-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">Настройки: {business.name}</h1>
                
                {/* Verification Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border ${
                    business.verificationStatus === 'verified' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                    business.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                }`}>
                    {business.verificationStatus === 'verified' && <CheckCircle2 className="w-4 h-4" />}
                    {business.verificationStatus === 'rejected' && <XCircle className="w-4 h-4" />}
                    {business.verificationStatus === 'pending' && <Clock className="w-4 h-4" />}
                    {business.verificationStatus === 'verified' ? 'Подтверждено' : 
                     business.verificationStatus === 'rejected' ? 'Ошибка данных' : 'Проверка...'}
                </div>
            </div>
            
            {/* Story Editor Modal */}
            {isStoryEditorOpen && (
                <div className="fixed inset-0 z-[200]">
                    <StoryEditor 
                        onClose={() => setIsStoryEditorOpen(false)}
                        onSave={async (media, caption, config) => {
                            submitStoryMutation.mutate({ media, caption, config });
                        }}
                    />
                </div>
            )}

            {/* Premium Business Banner (Stories & Features) */}
            <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-gray-900 dark:to-black p-6 sm:p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Crown className="w-32 h-32" />
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-yellow-400" /> Возможности бизнеса
                        </h2>
                        <p className="text-blue-100 dark:text-gray-400 max-w-lg mb-6">
                            Публикация историй, расширенная статистика и приоритетная поддержка доступны для верифицированных партнеров.
                        </p>

                        {business.canPostStories ? (
                            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-full text-green-300 font-bold text-sm">
                                <CheckCircle2 className="w-4 h-4" /> Доступ активен
                            </div>
                        ) : (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-xl">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-indigo-600 rounded-lg shrink-0">
                                        <Lock className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">Разблокировать доступ</h3>
                                        <p className="text-xs text-gray-300 mb-4">
                                            Свяжитесь с персональным менеджером (Admin), чтобы получить права на публикацию, заказать дизайн или обсудить условия.
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            <Button 
                                                size="sm" 
                                                className="bg-white text-indigo-900 hover:bg-gray-100 border-none font-bold shadow-lg"
                                                onClick={handleContactAdmin}
                                            >
                                                <MessageCircle className="w-4 h-4 mr-2" /> Написать Админу
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="border-white/30 text-white hover:bg-white/10"
                                                onClick={() => setIsStoryEditorOpen(true)}
                                            >
                                                <PenTool className="w-4 h-4 mr-2" /> Конструктор (Демо)
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Request Actions (Only if not active) */}
                {!business.canPostStories && (
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Быстрые действия</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button 
                                onClick={() => { setRequestType('content'); setRequestMessage(''); }}
                                className={`p-3 rounded-xl border text-left transition-all ${requestType === 'content' ? 'bg-white dark:bg-gray-700 border-blue-500 ring-1 ring-blue-500' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-400'}`}
                            >
                                <FileText className="w-5 h-5 text-blue-500 mb-2" />
                                <div className="font-bold text-sm text-gray-900 dark:text-white">Разместить</div>
                                <div className="text-[10px] text-gray-500">Отправить материал</div>
                            </button>
                            <button 
                                onClick={() => { setRequestType('design'); setRequestMessage(''); }}
                                className={`p-3 rounded-xl border text-left transition-all ${requestType === 'design' ? 'bg-white dark:bg-gray-700 border-purple-500 ring-1 ring-purple-500' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-400'}`}
                            >
                                <Palette className="w-5 h-5 text-purple-500 mb-2" />
                                <div className="font-bold text-sm text-gray-900 dark:text-white">Дизайн</div>
                                <div className="text-[10px] text-gray-500">Заказать оформление</div>
                            </button>
                            <button 
                                onClick={() => { setRequestType('rights'); setRequestMessage(''); }}
                                className={`p-3 rounded-xl border text-left transition-all ${requestType === 'rights' ? 'bg-white dark:bg-gray-700 border-green-500 ring-1 ring-green-500' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-green-400'}`}
                            >
                                <Key className="w-5 h-5 text-green-500 mb-2" />
                                <div className="font-bold text-sm text-gray-900 dark:text-white">Доступ</div>
                                <div className="text-[10px] text-gray-500">Запросить права</div>
                            </button>
                        </div>

                        <div className="mt-4 bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-300 mb-2 block">
                                {requestType === 'content' && 'Что вы хотите опубликовать?'}
                                {requestType === 'design' && 'Опишите задачу для дизайнера'}
                                {requestType === 'rights' && 'Почему вам нужен прямой доступ?'}
                            </label>
                            <textarea 
                                className="w-full border rounded-lg p-3 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white mb-3 min-h-[80px]"
                                placeholder="Напишите сообщение..."
                                value={requestMessage}
                                onChange={e => setRequestMessage(e.target.value)}
                            />
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> Копия уйдет на fooxyj@yandex.ru
                                </div>
                                <Button 
                                    size="sm" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => sendRequestMutation.mutate()}
                                    disabled={!requestMessage.trim() || sendRequestMutation.isPending}
                                >
                                    {sendRequestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Отправить</>}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 py-4">
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Основная информация</span>
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
            </div>

            {/* Main Settings Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border dark:border-gray-700 shadow-sm space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {watchedImage ? (
                            <img src={watchedImage} alt="" className="h-24 w-24 mx-auto rounded-full object-cover mb-3 shadow-md" />
                        ) : (
                            <div className="h-24 w-24 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 mb-3 flex items-center justify-center">
                                <span className="text-gray-400">Лого</span>
                            </div>
                        )}
                        <div className="relative cursor-pointer">
                            <span className="text-sm font-bold text-blue-600 hover:underline">{uploadingImage ? 'Загрузка...' : 'Изменить Логотип'}</span>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'image')} />
                        </div>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {watchedCover ? (
                            <img src={watchedCover} alt="" className="h-24 w-full mx-auto rounded-xl object-cover mb-3 shadow-md" />
                        ) : (
                            <div className="h-24 w-full mx-auto rounded-xl bg-gray-100 dark:bg-gray-700 mb-3 flex items-center justify-center">
                                <span className="text-gray-400">Обложка</span>
                            </div>
                        )}
                        <div className="relative cursor-pointer">
                            <span className="text-sm font-bold text-blue-600 hover:underline">{uploadingCover ? 'Загрузка...' : 'Изменить Обложку'}</span>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Название</label>
                    <input 
                        className={`w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-600 transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'dark:border-gray-600'}`} 
                        {...register('name', { required: 'Название обязательно' })}
                    />
                    {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Описание</label>
                    <textarea 
                        rows={3} 
                        className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-600 transition-colors outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 resize-none" 
                        {...register('description')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Адрес сайта</label>
                    <div className="relative">
                        <Globe className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            className="w-full border rounded-xl pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-600 transition-colors outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600"
                            placeholder="https://mysite.ru"
                            {...register('website')}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Телефон</label>
                        <Controller
                            name="phone"
                            control={control}
                            rules={{ required: 'Телефон обязателен' }}
                            render={({ field }) => (
                                <PhoneInput
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    error={!!errors.phone}
                                    className="bg-gray-50 dark:bg-gray-700"
                                />
                            )}
                        />
                        {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">График работы</label>
                            <button 
                                type="button"
                                onClick={toggleCustomSchedule}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {isCustomSchedule ? 'Стандартный' : 'Сложный график'}
                            </button>
                        </div>

                        {isCustomSchedule ? (
                            <input 
                                className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-600 transition-colors outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600" 
                                placeholder="Например: Пн-Пт 10:00-19:00, Сб-Вс Выходной"
                                {...register('workHours', { required: 'Укажите график' })}
                            />
                        ) : (
                            <div className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select 
                                            className="w-full border rounded-xl pl-9 pr-3 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none dark:border-gray-600 appearance-none"
                                            value={startTime}
                                            onChange={(e) => updateSchedule(e.target.value, endTime)}
                                        >
                                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <span className="text-gray-400">—</span>
                                <div className="flex-1">
                                    <div className="relative">
                                        <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select 
                                            className="w-full border rounded-xl pl-9 pr-3 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none dark:border-gray-600 appearance-none"
                                            value={endTime}
                                            onChange={(e) => updateSchedule(startTime, e.target.value)}
                                        >
                                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        {errors.workHours && <span className="text-red-500 text-xs mt-1">{errors.workHours.message}</span>}
                    </div>
                </div>

                <div className="pt-4">
                    <Button className="w-full py-4 text-lg font-bold shadow-xl shadow-blue-200 dark:shadow-none" disabled={updateMutation.isPending || !isDirty}>
                        {updateMutation.isPending ? <Loader2 className="animate-spin" /> : 'Сохранить изменения'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

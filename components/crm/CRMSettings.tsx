
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Business } from '../../types';
import { Button } from '../ui/Common';
import { Loader2 } from 'lucide-react';
import { WORK_SCHEDULES } from '../../constants';
import { useToast } from '../ToastProvider';
import { PhoneInput } from '../ui/PhoneInput';

interface CRMSettingsProps {
    business: Business;
}

export const CRMSettings: React.FC<CRMSettingsProps> = ({ business }) => {
    const queryClient = useQueryClient();
    const { success, error: showError } = useToast();
    const [isCustomSchedule, setIsCustomSchedule] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    // Initializing React Hook Form
    const { register, control, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm<Business>({
        defaultValues: {
            name: business.name,
            description: business.description,
            phone: business.phone,
            workHours: business.workHours,
            image: business.image,
            coverImage: business.coverImage
        }
    });

    // Watch values for preview or conditional logic
    const watchedImage = watch('image');
    const watchedCover = watch('coverImage');
    const watchedWorkHours = watch('workHours');

    // Update form when business prop changes (e.g. switching business)
    useEffect(() => {
        setValue('name', business.name);
        setValue('description', business.description);
        setValue('phone', business.phone);
        setValue('workHours', business.workHours);
        setValue('image', business.image);
        setValue('coverImage', business.coverImage);
        
        setIsCustomSchedule(!WORK_SCHEDULES.includes(business.workHours));
    }, [business, setValue]);

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Business>) => api.updateBusiness(business.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBusinesses'] });
            success("Настройки успешно сохранены!");
        },
        onError: (e: any) => showError(e.message)
    });

    const onSubmit = (data: Business) => {
        updateMutation.mutate(data);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'coverImage') => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (field === 'image') setUploadingImage(true);
        else setUploadingCover(true);

        try {
            const url = await api.uploadImage(file);
            setValue(field, url, { shouldDirty: true });
        } catch (e: any) { 
            showError(e.message); 
        } finally {
            if (field === 'image') setUploadingImage(false);
            else setUploadingCover(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl animate-in fade-in pb-10">
            <h1 className="text-2xl font-bold dark:text-white mb-6">Настройки бизнеса</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm space-y-4">
                
                {/* Name */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Название</label>
                    <input 
                        className={`w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : 'dark:border-gray-600'}`} 
                        {...register('name', { required: 'Название обязательно' })}
                    />
                    {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Описание</label>
                    <textarea 
                        rows={3} 
                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        {...register('description')}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
                        <Controller
                            name="phone"
                            control={control}
                            rules={{ required: 'Телефон обязателен' }}
                            render={({ field }) => (
                                <PhoneInput
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    error={!!errors.phone}
                                />
                            )}
                        />
                        {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Часы работы</label>
                        <select 
                            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            value={isCustomSchedule ? 'custom' : watchedWorkHours}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                    setIsCustomSchedule(true);
                                    setValue('workHours', '');
                                } else {
                                    setIsCustomSchedule(false);
                                    setValue('workHours', val);
                                }
                            }}
                        >
                            {WORK_SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                            <option value="custom">Другое...</option>
                        </select>
                    </div>
                </div>

                {isCustomSchedule && (
                    <div>
                        <input 
                            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" 
                            placeholder="Введите свой график"
                            {...register('workHours', { required: isCustomSchedule ? 'Укажите график' : false })}
                        />
                        {errors.workHours && <span className="text-red-500 text-xs mt-1">{errors.workHours.message}</span>}
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        {watchedImage && <img src={watchedImage} alt="" className="h-24 mx-auto rounded object-cover mb-2" />}
                        <div className="relative cursor-pointer">
                            <span className="text-xs lg:text-sm text-blue-600 hover:underline">{uploadingImage ? 'Загрузка...' : 'Изменить Логотип'}</span>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'image')} />
                        </div>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        {watchedCover && <img src={watchedCover} alt="" className="h-24 mx-auto rounded object-cover mb-2" />}
                        <div className="relative cursor-pointer">
                            <span className="text-xs lg:text-sm text-blue-600 hover:underline">{uploadingCover ? 'Загрузка...' : 'Изменить Обложку'}</span>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                        </div>
                    </div>
                </div>

                <Button className="w-full" disabled={updateMutation.isPending || !isDirty}>
                    {updateMutation.isPending ? <Loader2 className="animate-spin" /> : 'Сохранить изменения'}
                </Button>
            </div>
        </form>
    );
};

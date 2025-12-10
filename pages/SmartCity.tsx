
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { SmartDevice } from '../types';
import { Button } from '../components/ui/Common';
import { Loader2, Video, Unlock, Radio, MapPin, Eye, Lock } from 'lucide-react';

export const SmartCity: React.FC = () => {
    const [openingId, setOpeningId] = useState<string | null>(null);

    const { data: devices = [], isLoading } = useQuery({
        queryKey: ['smartDevices'],
        queryFn: api.getSmartDevices
    });

    const openMutation = useMutation({
        mutationFn: (id: string) => api.controlDevice(id, 'open'),
        onMutate: (id) => setOpeningId(id),
        onSuccess: () => alert("Дверь открыта!"),
        onError: () => alert("Ошибка связи с устройством"),
        onSettled: () => setOpeningId(null)
    });

    const handleOpen = (device: SmartDevice) => {
        openMutation.mutate(device.id);
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    const publicCams = devices.filter(d => !d.isPrivate);
    const privateDevices = devices.filter(d => d.isPrivate);
    
    // Demo content if empty
    if (privateDevices.length === 0) {
        privateDevices.push({
            id: 'demo-intercom',
            type: 'intercom',
            name: 'Мой домофон',
            location: 'ул. Ленина 15, кв. 42',
            imageUrl: 'https://media.giphy.com/media/l41YkZ373Jj6gX2zS/giphy.gif',
            isPrivate: true,
            status: 'online'
        });
    }

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 dark:text-white">
                <Eye className="w-8 h-8 text-blue-600" /> Умный Город
            </h1>

            {/* My Access */}
            <h2 className="text-xl font-bold mb-4 dark:text-white">Мой Дом и Доступ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {privateDevices.map(device => (
                    <div key={device.id} className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 relative group">
                        <div className="relative h-64 bg-black">
                            <img src={device.imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse flex items-center gap-1">
                                <Radio className="w-3 h-3" /> LIVE
                            </div>
                            <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
                                {new Date().toLocaleTimeString()}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button 
                                    onClick={() => handleOpen(device)} 
                                    disabled={openingId === device.id}
                                    className="rounded-full w-24 h-24 bg-green-600 hover:bg-green-500 border-4 border-green-800 shadow-[0_0_20px_rgba(34,197,94,0.5)] flex flex-col items-center justify-center text-white transition-all active:scale-95"
                                >
                                    {openingId === device.id ? <Loader2 className="w-8 h-8 animate-spin" /> : <Unlock className="w-8 h-8" />}
                                    <span className="text-[10px] font-bold mt-1 uppercase">Открыть</span>
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-800">
                            <div className="flex justify-between items-center text-white">
                                <div>
                                    <h3 className="font-bold">{device.name}</h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {device.location}</p>
                                </div>
                                <div className="text-green-400 text-xs flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div> Online
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Barrier Mock */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-gray-500 dark:text-gray-300" />
                    </div>
                    <h3 className="font-bold dark:text-white">Шлагбаум во двор</h3>
                    <p className="text-sm text-gray-500 mb-6">Открытие по геолокации</p>
                    <Button variant="outline" className="w-full">Настроить доступ</Button>
                </div>
            </div>

            {/* Public Cameras */}
            <h2 className="text-xl font-bold mb-4 dark:text-white">Городские камеры</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicCams.map(cam => (
                    <div key={cam.id} className="bg-black rounded-xl overflow-hidden shadow-sm relative">
                        <img src={cam.imageUrl} className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity" alt="" />
                        <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                            <Video className="w-3 h-3" /> REC
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <h3 className="text-white font-bold text-sm">{cam.name}</h3>
                            <p className="text-gray-300 text-xs">{cam.location}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

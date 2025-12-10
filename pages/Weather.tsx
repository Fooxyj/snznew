
import React from 'react';
import { api } from '../services/api';
import { Loader2, Wind, Droplets, Gauge, Cloud, CloudSun, Sun, CloudRain, Snowflake, CloudFog, CloudLightning } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export const Weather: React.FC = () => {
    
    const { data: weather, isLoading: wLoading } = useQuery({
        queryKey: ['weather'],
        queryFn: api.getWeather
    });

    const { data: forecast = [], isLoading: fLoading } = useQuery({
        queryKey: ['weatherForecast'],
        queryFn: api.getWeatherForecast
    });

    const loading = wLoading || fLoading;

    const getWeatherIcon = (code: number, className: string = "w-12 h-12") => {
        // WMO Weather interpretation codes (0-99)
        if (code === 0) return <Sun className={`${className} text-yellow-400`} />;
        if (code <= 3) return <CloudSun className={`${className} text-yellow-200`} />;
        if (code === 45 || code === 48) return <CloudFog className={`${className} text-gray-300`} />;
        if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-300`} />; // Drizzle/Rain
        if (code >= 71 && code <= 77) return <Snowflake className={`${className} text-white`} />; // Snow
        if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-400`} />; // Showers
        if (code >= 85 && code <= 86) return <Snowflake className={`${className} text-white`} />; // Snow showers
        if (code >= 95) return <CloudLightning className={`${className} text-purple-400`} />; // Thunderstorm
        return <Cloud className={`${className} text-gray-300`} />;
    };

    const getWeatherDesc = (code: number) => {
        if (code === 0) return 'Ясно';
        if (code === 1) return 'Преимущественно ясно';
        if (code === 2) return 'Переменная облачность';
        if (code === 3) return 'Пасмурно';
        if (code === 45 || code === 48) return 'Туман';
        if (code >= 51 && code <= 55) return 'Морось';
        if (code >= 56 && code <= 57) return 'Ледяной дождь';
        if (code >= 61 && code <= 65) return 'Дождь';
        if (code >= 66 && code <= 67) return 'Ледяной дождь';
        if (code >= 71 && code <= 75) return 'Снегопад';
        if (code === 77) return 'Снежные зерна';
        if (code >= 80 && code <= 82) return 'Ливень';
        if (code >= 85 && code <= 86) return 'Снежный ливень';
        if (code >= 95) return 'Гроза';
        return 'Облачно';
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            <h1 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-3">
                {getWeatherIcon(weather?.code || 0, "w-8 h-8")} Погода в Снежинске
            </h1>

            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-950 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <div className="text-sm opacity-80 uppercase tracking-widest font-bold mb-1">Сейчас</div>
                        <div className="text-7xl font-bold tracking-tighter">{weather?.temp > 0 ? '+' : ''}{weather?.temp}°</div>
                        <div className="text-xl font-medium opacity-90 mt-2">{getWeatherDesc(weather?.code || 0)}</div>
                    </div>
                    
                    <div className="flex-1 w-full md:w-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3">
                                <Wind className="w-6 h-6 opacity-80" />
                                <div>
                                    <div className="text-xs opacity-70">Ветер</div>
                                    <div className="font-bold">{weather?.wind} м/с</div>
                                </div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3">
                                <Droplets className="w-6 h-6 opacity-80" />
                                <div>
                                    <div className="text-xs opacity-70">Влажность</div>
                                    <div className="font-bold">{weather?.humidity}%</div>
                                </div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3">
                                <Gauge className="w-6 h-6 opacity-80" />
                                <div>
                                    <div className="text-xs opacity-70">Давление</div>
                                    <div className="font-bold">{weather?.pressure} мм</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-2 right-4 text-[10px] opacity-50">
                    Данные: Open-Meteo API
                </div>
            </div>

            {/* Weekly Forecast with Detailed Data */}
            <h2 className="text-xl font-bold mb-4 dark:text-white">Прогноз на неделю</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="divide-y dark:divide-gray-700">
                    {forecast.map((day: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            {/* Day & Condition */}
                            <div className="w-28">
                                <div className="font-bold text-gray-900 dark:text-white text-lg">{day.day}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{getWeatherDesc(day.code)}</div>
                            </div>
                            
                            {/* Icon & Rain */}
                            <div className="flex flex-col items-center justify-center w-16">
                                {getWeatherIcon(day.code, "w-8 h-8")}
                                {day.precip > 0 && (
                                    <div className="flex items-center text-[10px] font-bold text-blue-500 mt-1">
                                        <Droplets className="w-3 h-3 mr-0.5" /> {day.precip}%
                                    </div>
                                )}
                            </div>

                            {/* Wind */}
                            <div className="flex flex-col items-center justify-center w-16 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-1">
                                    <Wind className="w-4 h-4 opacity-50" />
                                    <span>{day.wind}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">м/с</span>
                            </div>

                            {/* Temperatures */}
                            <div className="w-20 text-right">
                                <div className="font-bold text-gray-900 dark:text-white text-lg">{day.tempDay > 0 ? '+' : ''}{day.tempDay}°</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{day.tempNight > 0 ? '+' : ''}{day.tempNight}°</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

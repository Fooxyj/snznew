
import { LostFoundItem, Appeal, Ride, SmartDevice, TransportSchedule } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { mockStore } from './mockData';
import { authService } from './authService';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const cityService = {
    // --- WEATHER (Real Data via Open-Meteo) ---
    async getWeather() {
        try {
            // Fetch real weather for Snezhinsk (56.08, 60.73)
            // Added wind_speed_unit=ms to match UI "m/s" label
            // Added timezone to ensure daily alignment matches user reality
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.08&longitude=60.73&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code&wind_speed_unit=ms&timezone=Asia%2FYekaterinburg');
            
            if (!res.ok) throw new Error('Weather API Error');
            
            const data = await res.json();
            const current = data.current;
            
            return { 
                temp: Math.round(current.temperature_2m), 
                wind: Math.round(current.wind_speed_10m), 
                code: current.weather_code, 
                humidity: current.relative_humidity_2m, 
                pressure: Math.round(current.surface_pressure * 0.750062) // Convert hPa to mmHg
            }; 
        } catch (e) {
            console.error("Weather fetch failed:", e);
            // Fallback if API fails
            return { temp: 0, wind: 0, code: 3, humidity: 0, pressure: 0 }; 
        }
    },

    async getWeatherForecast() {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.08&longitude=60.73&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&wind_speed_unit=ms&timezone=Asia%2FYekaterinburg');
            
            if (!res.ok) throw new Error('Forecast API Error');

            const data = await res.json();
            if (!data.daily) return [];

            const daily = data.daily;
            
            const days = daily.time.map((dateStr: string, index: number) => {
                const date = new Date(dateStr);
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);
                
                let dayName = date.toLocaleDateString('ru-RU', { weekday: 'long' });
                
                // Simple check for Today/Tomorrow based on date components (ignoring time)
                if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth()) {
                    dayName = 'Сегодня';
                } else if (date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth()) {
                    dayName = 'Завтра';
                }

                return {
                    day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                    tempDay: Math.round(daily.temperature_2m_max[index]),
                    tempNight: Math.round(daily.temperature_2m_min[index]),
                    code: daily.weather_code[index],
                    wind: Math.round(daily.wind_speed_10m_max[index]),
                    precip: daily.precipitation_probability_max[index]
                };
            });

            return days.slice(0, 7);
        } catch (e) {
            console.error("Forecast fetch failed:", e);
            return [];
        }
    },

    // --- LOST & FOUND ---
    async getLostFoundItems(type?: 'lost' | 'found'): Promise<LostFoundItem[]> {
        await delay(500);
        if (isSupabaseConfigured() && supabase) {
            let query = supabase.from('lost_found').select('*').order('created_at', { ascending: false });
            if (type) query = query.eq('type', type);
            const { data } = await query;
            return data || [];
        }
        
        let items = mockStore.lostFound;
        if (type) items = items.filter(i => i.type === type);
        return items;
    },

    async createLostFoundItem(data: any): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        if (isSupabaseConfigured() && supabase) {
            await supabase.from('lost_found').insert({ ...data, author_id: user.id });
            return;
        }

        mockStore.lostFound.unshift({
            id: Math.random().toString(),
            ...data,
            authorId: user.id,
            isResolved: false,
            date: new Date().toLocaleDateString(),
            image: data.image || 'https://picsum.photos/seed/lost/300/300'
        });
    },

    async resolveLostFoundItem(id: string): Promise<void> {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('lost_found').update({ is_resolved: true }).eq('id', id);
            return;
        }
        const item = mockStore.lostFound.find(i => i.id === id);
        if (item) item.isResolved = true;
    },

    // --- APPEALS (City Monitor) ---
    async getAppeals(): Promise<Appeal[]> {
        await delay(500);
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('appeals').select('*').order('created_at', { ascending: false });
            return data || [];
        }
        return mockStore.appeals;
    },

    async createAppeal(data: any): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        if (isSupabaseConfigured() && supabase) {
            await supabase.from('appeals').insert({ ...data, author_id: user.id, status: 'new' });
            return;
        }

        mockStore.appeals.unshift({
            id: Math.random().toString(),
            ...data,
            authorId: user.id,
            status: 'new',
            createdAt: new Date().toISOString(),
            image: data.image || 'https://picsum.photos/seed/appeal/300/300'
        });
    },

    async resolveAppeal(id: string, resultImage: string): Promise<void> {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('appeals').update({ status: 'done', result_image: resultImage }).eq('id', id);
            return;
        }
        const appeal = mockStore.appeals.find(a => a.id === id);
        if (appeal) {
            appeal.status = 'done';
            appeal.resultImage = resultImage;
        }
    },

    // --- TRANSPORT / RIDES ---
    async getRides(): Promise<Ride[]> {
        await delay(500);
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('rides').select('*, profiles(name, avatar)');
            return data?.map((r: any) => ({
                ...r,
                driverName: r.profiles?.name,
                driverAvatar: r.profiles?.avatar
            })) || [];
        }
        return mockStore.rides;
    },

    async createRide(data: any): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        if (isSupabaseConfigured() && supabase) {
            await supabase.from('rides').insert({ ...data, driver_id: user.id });
            return;
        }

        mockStore.rides.push({
            id: Math.random().toString(),
            ...data,
            driverId: user.id,
            driverName: user.name,
            driverAvatar: user.avatar
        });
    },

    async bookRide(id: string): Promise<void> {
        await delay(500);
        if (isSupabaseConfigured() && supabase) {
            // Logic for booking in DB
            return;
        }
        const ride = mockStore.rides.find(r => r.id === id);
        if (ride && ride.seats > 0) ride.seats--;
    },

    // --- TRANSPORT SCHEDULES (Admin) ---
    async getTransportSchedules(): Promise<TransportSchedule[]> {
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('transport_schedules').select('*').order('route_number', { ascending: true });
            if (data) return data.map((t: any) => ({
                id: t.id,
                type: t.type,
                routeNumber: t.route_number,
                title: t.title,
                schedule: t.schedule,
                workHours: t.work_hours,
                price: t.price
            }));
        }
        // Fallback or empty if offline
        return [];
    },

    async addTransportSchedule(data: Omit<TransportSchedule, 'id'>): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user || user.role !== 'ADMIN') throw new Error("Только для администраторов");

        if (isSupabaseConfigured() && supabase) {
            await supabase.from('transport_schedules').insert({
                type: data.type,
                route_number: data.routeNumber,
                title: data.title,
                schedule: data.schedule,
                work_hours: data.workHours,
                price: data.price
            });
        }
    },

    async deleteTransportSchedule(id: string): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user || user.role !== 'ADMIN') throw new Error("Только для администраторов");

        if (isSupabaseConfigured() && supabase) {
            await supabase.from('transport_schedules').delete().eq('id', id);
        }
    },

    // --- SMART CITY ---
    async getSmartDevices(): Promise<SmartDevice[]> {
        await delay(400);
        return mockStore.smartDevices;
    },

    async controlDevice(id: string, action: string): Promise<void> {
        await delay(1000);
        // Mock success
    }
};

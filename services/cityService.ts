
import { LostFoundItem, Appeal, Ride, SmartDevice, TransportSchedule } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { mockStore } from './mockData';
import { authService } from './authService';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const cityService = {
    // --- WEATHER ---
    async getWeather() {
        // Mock Weather API
        await delay(300);
        return { temp: 22, wind: 4, code: 1, humidity: 45, pressure: 748 }; 
    },

    async getWeatherForecast() {
        await delay(300);
        return [
            { day: 'Завтра', tempDay: 24, tempNight: 15, code: 0, wind: 3, precip: 0 },
            { day: 'Ср', tempDay: 20, tempNight: 14, code: 3, wind: 5, precip: 10 },
            { day: 'Чт', tempDay: 18, tempNight: 12, code: 61, wind: 7, precip: 60 },
            { day: 'Пт', tempDay: 21, tempNight: 13, code: 2, wind: 4, precip: 0 },
            { day: 'Сб', tempDay: 25, tempNight: 16, code: 0, wind: 2, precip: 0 },
        ];
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

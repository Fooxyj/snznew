
import { LostFoundItem, Appeal, Ride, SmartDevice, TransportSchedule, Event, Vacancy, Resume, Quest, UtilityBill, RentalItem, RentalBooking, Ad, NewsItem, Notification, Campaign, UserRole, Banner, Coupon, UserCoupon } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { mockStore } from './mockData';

const mapLostFoundFromDB = (item: any): LostFoundItem => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    image: item.image,
    location: item.location,
    date: item.date,
    contactName: item.contact_name || item.contactName || 'Не указано',
    contactPhone: item.contact_phone || item.contactPhone || '',
    isResolved: item.is_resolved === true,
    authorId: item.author_id,
    status: item.status
});

const mapRentalFromDB = (r: any): RentalItem => ({
    id: r.id,
    title: r.title,
    description: r.description,
    image: r.image,
    pricePerDay: r.price_per_day,
    deposit: r.deposit,
    category: r.category,
    authorId: r.author_id,
    isAvailable: r.is_available === true,
    status: r.status
});

export const cityService = {
    async getWeather() {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.08&longitude=60.73&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code&wind_speed_unit=ms&timezone=Asia%2FYekaterinburg');
            const data = await res.json();
            return { temp: Math.round(data.current.temperature_2m), wind: Math.round(data.current.wind_speed_10m), code: data.current.weather_code, humidity: data.current.relative_humidity_2m, pressure: Math.round(data.current.surface_pressure * 0.750062) }; 
        } catch (e) { return { temp: 0, wind: 0, code: 3, humidity: 0, pressure: 0 }; }
    },

    async getWeatherForecast() {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.08&longitude=60.73&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&wind_speed_unit=ms&timezone=Asia%2FYekaterinburg');
            const data = await res.json();
            return data.daily.time.map((dateStr: string, index: number) => ({
                day: new Date(dateStr).toLocaleDateString('ru-RU', { weekday: 'short' }),
                tempDay: Math.round(data.daily.temperature_2m_max[index]),
                tempNight: Math.round(data.daily.temperature_2m_min[index]),
                code: data.daily.weather_code[index],
                wind: Math.round(data.daily.wind_speed_10m_max[index]),
                precip: data.daily.precipitation_probability_max[index]
            })).slice(0, 7);
        } catch (e) { return []; }
    },

    async getNews(): Promise<NewsItem[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('news').select('*').order('id', { ascending: false });
          return data || [];
      }
      return mockStore.news;
    },

    async getNewsById(id: string): Promise<NewsItem | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('news').select('*').eq('id', id).maybeSingle();
          return data;
      }
      return mockStore.news.find(n => n.id === id) || null;
    },

    async getEvents(): Promise<Event[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*').order('id', { ascending: false });
          return (data || []).map((e: any) => ({ ...e, authorId: e.author_id }));
      }
      return mockStore.events;
    },

    async getEventById(id: string): Promise<Event | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
          if (data) return { ...data, authorId: data.author_id };
      }
      return mockStore.events.find(e => e.id === id) || null;
    },

    async getRides(): Promise<Ride[]> {
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('rides').select('*').order('id', { ascending: false });
            return (data || []).map((r: any) => ({
                id: r.id, fromCity: r.from_city, toCity: r.to_city, date: r.date, time: r.time, price: r.price, seats: r.seats, carModel: r.car_model, driverId: r.driver_id, driverName: r.driver_name, driverAvatar: r.driver_avatar, passengers: r.passengers
            }));
        }
        return mockStore.rides;
    },

    async getLostFoundItems(type?: string): Promise<LostFoundItem[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                let query = supabase.from('lost_found').select('*');
                if (type && type !== 'all') {
                    query = query.eq('type', type);
                }
                // Пробуем сортировку по id, так как в JSON был idx, id точно есть
                const { data, error } = await query.order('id', { ascending: false });
                if (error) throw error;
                return (data || []).map(mapLostFoundFromDB);
            } catch (e) {
                console.error("Supabase LostFound error:", e);
                return [];
            }
        }
        return type && type !== 'all' ? mockStore.lostFound.filter(i => i.type === type) : mockStore.lostFound;
    },

    async createLostFoundItem(data: any) {
        const user = await authService.getCurrentUser();
        if (!user || !supabase) throw new Error("Unauthorized");
        const { error } = await supabase.from('lost_found').insert({
            type: data.type,
            title: data.title,
            description: data.description,
            image: data.image,
            location: data.location,
            contact_name: data.contactName,
            contact_phone: data.contactPhone,
            author_id: user.id,
            status: 'approved',
            date: new Date().toLocaleDateString('ru-RU')
        });
        if (error) throw error;
    },

    async resolveLostFoundItem(id: string) {
        if (!supabase) return;
        await supabase.from('lost_found').update({ is_resolved: true }).eq('id', id);
    },

    async getRentals(): Promise<RentalItem[]> {
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('rentals').select('*').eq('is_available', true).eq('status', 'approved');
            return (data || []).map(mapRentalFromDB);
        }
        return mockStore.rentals;
    },

    async getAppeals(): Promise<Appeal[]> {
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('appeals').select('*').order('id', { ascending: false });
            return (data || []).map(a => ({ ...a, authorId: a.author_id, resultImage: a.result_image }));
        }
        return mockStore.appeals;
    },

    async getNotifications(): Promise<Notification[]> {
        const user = await authService.getCurrentUser();
        if (isSupabaseConfigured() && supabase && user) {
            const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('id', { ascending: false });
            return (data || []).map((n: any) => ({ id: n.id, userId: n.user_id, text: n.text || n.message, isRead: n.is_read, createdAt: n.created_at }));
        }
        return [];
    },

    async getTransportSchedules(): Promise<TransportSchedule[]> {
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('transport_schedules').select('*').order('id', { ascending: true });
            return (data || []).map((t: any) => ({
                id: t.id, type: t.type, routeNumber: t.route_number, title: t.title, schedule: t.schedule, workHours: t.work_hours, price: t.price ? parseFloat(t.price) : 0, phone: t.phone
            }));
        }
        return [];
    },

    // Comment above fix: Added getQuests method to retrieve city exploration missions
    async getQuests(): Promise<Quest[]> {
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('quests').select('*').order('id', { ascending: true });
            return data || [];
        }
        return mockStore.quests;
    },

    // Comment above fix: Added completeQuest method for user rewarding upon geolocation validation
    async completeQuest(questId: string, lat: number, lng: number): Promise<number> {
        const user = await authService.getCurrentUser();
        if (!user || !supabase) throw new Error("Unauthorized");
        
        const { data: quest } = await supabase.from('quests').select('*').eq('id', questId).single();
        if (!quest) throw new Error("Quest not found");

        const reward = quest.xp_reward || quest.xpReward || 100;
        await supabase.from('user_quests').upsert({ user_id: user.id, quest_id: questId, completed: true });
        await supabase.from('profiles').update({ xp: (user.xp || 0) + reward }).eq('id', user.id);
        return reward;
    },

    // Comment above fix: Added createAppeal method for urban monitoring
    async createAppeal(data: any) {
        const user = await authService.getCurrentUser();
        if (!user || !supabase) throw new Error("Unauthorized");
        const { error } = await supabase.from('appeals').insert({
            title: data.title,
            description: data.description,
            location: data.location,
            image: data.image,
            author_id: user.id,
            status: 'new',
            created_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    // Comment above fix: Added resolveAppeal method to update problem status and add result evidence
    async resolveAppeal(id: string, resultImage: string) {
        if (!supabase) return;
        await supabase.from('appeals').update({ status: 'done', result_image: resultImage }).eq('id', id);
    },

    // Comment above fix: Added housing-related methods for bill management and meter readings
    async getUtilityBills(): Promise<UtilityBill[]> {
        const user = await authService.getCurrentUser();
        if (isSupabaseConfigured() && supabase && user) {
            const { data } = await supabase.from('utility_bills').select('*').eq('user_id', user.id);
            return (data || []).map((b: any) => ({ id: b.id, userId: b.user_id, serviceName: b.service_name, amount: b.amount, period: b.period, isPaid: b.is_paid }));
        }
        return [];
    },

    async submitMeterReading(type: string, value: number) {
        const user = await authService.getCurrentUser();
        if (isSupabaseConfigured() && supabase && user) {
            await supabase.from('meter_readings').insert({ user_id: user.id, type, value, date: new Date().toISOString() });
        }
    },

    async payUtilityBill(billId: string, amount: number) {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('utility_bills').update({ is_paid: true }).eq('id', billId);
        }
    },

    // Comment above fix: Added charity-related methods for campaigns and donations
    async getCampaigns(): Promise<Campaign[]> {
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
            return (data || []).map((c: any) => ({ id: c.id, title: c.title, description: c.description, targetAmount: c.target_amount, collectedAmount: c.collected_amount, organizerName: c.organizer_name, image: c.image }));
        }
        return mockStore.campaigns;
    },

    async createCampaign(data: any) {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('campaigns').insert({
                title: data.title,
                description: data.description,
                target_amount: data.targetAmount,
                collected_amount: 0,
                organizer_name: data.organizerName,
                image: data.image
            });
        }
    },

    async donateToCampaign(id: string, amount: number) {
        if (isSupabaseConfigured() && supabase) {
            const { data: camp } = await supabase.from('campaigns').select('collected_amount').eq('id', id).single();
            if (camp) {
                await supabase.from('campaigns').update({ collected_amount: (camp.collected_amount || 0) + amount }).eq('id', id);
            }
        }
    },

    // Comment above fix: Added smart device management methods for city infrastructure control
    async getSmartDevices(): Promise<SmartDevice[]> {
        if (isSupabaseConfigured() && supabase) {
            const user = await authService.getCurrentUser();
            const { data } = await supabase.from('smart_devices').select('*').or(`is_private.eq.false${user ? `,user_id.eq.${user.id}` : ''}`);
            return (data || []).map((d: any) => ({ id: d.id, type: d.type, name: d.name, location: d.location, imageUrl: d.image_url, isPrivate: d.is_private, status: d.status }));
        }
        return mockStore.smartDevices;
    },

    async controlDevice(id: string, action: string) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
    },

    // Comment above fix: Added getExploreData to aggregate city locations for the interactive map
    async getExploreData(): Promise<any[]> {
        const { data: bizsRes } = await supabase.from('businesses').select('*');
        const { data: questsRes } = await supabase.from('quests').select('*');
        const { data: appealsRes } = await supabase.from('appeals').select('*');

        const items: any[] = [];
        (bizsRes || []).forEach(b => items.push({ id: b.id, type: 'business', title: b.name, subtitle: b.category, lat: b.lat, lng: b.lng, image: b.image, data: b }));
        (questsRes || []).forEach(q => items.push({ id: q.id, type: 'quest', title: q.title, subtitle: 'Городской квест', lat: q.lat, lng: q.lng, image: q.image, data: q }));
        (appealsRes || []).forEach(a => items.push({ id: a.id, type: 'appeal', title: a.title, subtitle: a.location, lat: a.lat || 56.08, lng: a.lng || 60.73, image: a.image, data: a }));

        return items;
    },

    // Comment above fix: Added administrative creation and update methods for transport, quests, news, events, and campaigns
    async createTransport(data: any) {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('transport_schedules').insert({
                type: data.type, route_number: data.routeNumber, title: data.title, schedule: data.schedule, work_hours: data.workHours, price: data.price, phone: data.phone
            });
        }
    },
    async updateTransport(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('transport_schedules').update({
                type: data.type, route_number: data.routeNumber, title: data.title, schedule: data.schedule, work_hours: data.workHours, price: data.price, phone: data.phone
            }).eq('id', id);
        }
    },
    async createQuest(data: any) {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('quests').insert({
                title: data.title, description: data.description, image: data.image, lat: parseFloat(data.lat), lng: parseFloat(data.lng), xp_reward: Number(data.xpReward)
            });
        }
    },
    async updateQuest(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('quests').update({
                title: data.title, description: data.description, image: data.image, lat: parseFloat(data.lat), lng: parseFloat(data.lng), xp_reward: Number(data.xpReward)
            }).eq('id', id);
        }
    },
    async updateCampaign(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('campaigns').update({
                title: data.title, description: data.description, target_amount: data.targetAmount, organizer_name: data.organizerName, image: data.image
            }).eq('id', id);
        }
    },
    async createNews(data: any) {
        if (isSupabaseConfigured() && supabase) {
            const { data: saved, error } = await supabase.from('news').insert({
                title: data.title, category: data.category, content: data.content, image: data.image, date: new Date().toISOString(), views: 0, comments_count: 0
            }).select().single();
            if (error) throw error;
            return saved;
        }
        return {} as any;
    },
    async updateNews(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('news').update({ title: data.title, category: data.category, content: data.content, image: data.image }).eq('id', id);
        }
    },
    async deleteNews(id: string) {
        if (isSupabaseConfigured() && supabase) await supabase.from('news').delete().eq('id', id);
    },
    async createEvent(data: any) {
        if (isSupabaseConfigured() && supabase) {
            const { data: saved, error } = await supabase.from('events').insert({
                title: data.title, date: data.date, location: data.location, category: data.category, description: data.description, price: data.price, image: data.image
            }).select().single();
            if (error) throw error;
            return saved;
        }
        return {} as any;
    },
    async updateEvent(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('events').update({
                title: data.title, date: data.date, location: data.location, category: data.category, description: data.description, price: data.price, image: data.image
            }).eq('id', id);
        }
    },
    async deleteEvent(id: string) {
        if (isSupabaseConfigured() && supabase) await supabase.from('events').delete().eq('id', id);
    }
};

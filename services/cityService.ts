
import { LostFoundItem, Appeal, Ride, SmartDevice, TransportSchedule, Event, Vacancy, Resume, Quest, UtilityBill, RentalItem, RentalBooking, Ad, NewsItem, Notification, Campaign, UserRole, Banner, Coupon, UserCoupon } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { mockStore } from './mockData';

const formatRelativeDate = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === '') return 'Недавно';
    const normalizedDate = dateStr.includes(' ') && !dateStr.includes('T') 
        ? dateStr.replace(' ', 'T') 
        : dateStr;
    let date = new Date(normalizedDate);
    if (isNaN(date.getTime())) return 'Недавно';
    const now = new Date();
    const isToday = now.getDate() === date.getDate() && now.getMonth() === date.getMonth() && now.getFullYear() === date.getFullYear();
    if (isToday) return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const mapNewsItem = (n: any): NewsItem => ({
    ...n,
    date: n.date || n.created_at || new Date().toISOString()
});

const mapEventItem = (e: any): Event => ({
    ...e,
    authorId: e.author_id,
    date: e.date || e.created_at || 'Дата уточняется'
});

export const cityService = {
    async getNews(): Promise<NewsItem[]> {
      if (!isSupabaseConfigured() || !supabase) return mockStore.news;
      try {
          const { data, error } = await supabase
            .from('news')
            .select('*')
            .limit(100);
            
          if (error) throw error;
          if (data) return data.map(mapNewsItem).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return mockStore.news;
      } catch (e: any) {
          const errMsg = e?.message || String(e);
          if (!errMsg.includes('fetch') && !errMsg.includes('network')) {
              console.error("Supabase news fetch error:", errMsg);
          }
          return mockStore.news;
      }
    },

    async getNewsById(id: string): Promise<NewsItem | null> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error = null } = await supabase.from('news').select('*').eq('id', id).maybeSingle();
                if (error) throw error;
                return data ? mapNewsItem(data) : null;
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get news by id failed:", errMsg);
                return mockStore.news.find(n => n.id === id) || null;
            }
        }
        return mockStore.news.find(n => n.id === id) || null;
    },

    async updateNews(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('news').update(data).eq('id', id);
            } catch (e) {}
        }
    },

    async createNews(data: any): Promise<NewsItem> {
        if (isSupabaseConfigured() && supabase) {
            const { data: saved, error } = await supabase.from('news').insert(data).select().single();
            if (error) throw error;
            return mapNewsItem(saved);
        }
        const newItem = { ...data, id: Math.random().toString(), date: new Date().toISOString(), views: 0, commentsCount: 0 };
        mockStore.news.push(newItem);
        return newItem;
    },

    async deleteNews(id: string) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('news').delete().eq('id', id);
            } catch (e) {}
        }
    },

    async getEvents(): Promise<Event[]> {
      try {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.from('events').select('*').limit(100);
            if (error) throw error;
            return (data || []).map(mapEventItem);
        }
      } catch (e: any) {
          const errMsg = e?.message || String(e);
          if (!errMsg.includes('fetch')) console.error("Get events failed:", errMsg);
      }
      return mockStore.events;
    },

    async getEventById(id: string): Promise<Event | null> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error = null } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
                if (error) throw error;
                return data ? mapEventItem(data) : null;
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get event by id failed:", errMsg);
                return mockStore.events.find(e => e.id === id) || null;
            }
        }
        return mockStore.events.find(e => e.id === id) || null;
    },

    async updateEvent(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                const dbData = { ...data, author_id: data.authorId };
                delete dbData.authorId;
                await supabase.from('events').update(dbData).eq('id', id);
            } catch (e) {}
        }
    },

    async createEvent(data: any): Promise<Event> {
        if (isSupabaseConfigured() && supabase) {
            const dbData = { ...data, author_id: data.authorId };
            delete dbData.authorId;
            const { data: saved, error } = await supabase.from('events').insert(dbData).select().single();
            if (error) throw error;
            return mapEventItem(saved);
        }
        return { ...data, id: 'e' + Date.now() };
    },

    async deleteEvent(id: string) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('events').delete().eq('id', id);
            } catch (e) {}
        }
    },

    async getTransportSchedules(): Promise<TransportSchedule[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error = null } = await supabase.from('transport_schedules').select('*');
                if (error) throw error;
                return data || [];
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Transport schedules fetch error:", errMsg);
                return [];
            }
        }
        return [];
    },

    async updateTransport(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('transport_schedules').update(data).eq('id', id);
            } catch (e) {}
        }
    },

    async createTransport(data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('transport_schedules').insert(data);
            } catch (e) {}
        }
    },

    async getQuests(): Promise<Quest[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const user = await authService.getCurrentUser();
                const { data: quests, error } = await supabase.from('quests').select('*');
                if (error) throw error;
                if (user) {
                    const { data: completions } = await supabase.from('quest_completions').select('quest_id').eq('user_id', user.id);
                    const completedIds = completions?.map(c => c.quest_id) || [];
                    return (quests || []).map(q => ({ ...q, isCompleted: completedIds.includes(q.id) }));
                }
                return quests || [];
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get quests failed:", errMsg);
                return mockStore.quests;
            }
        }
        return mockStore.quests;
    },

    async updateQuest(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('quests').update(data).eq('id', id);
            } catch (e) {}
        }
    },

    async createQuest(data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('quests').insert(data);
            } catch (e) {}
        }
    },

    async completeQuest(id: string, lat: number, lng: number): Promise<number> {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error("Unauthorized");
        if (isSupabaseConfigured() && supabase) {
            const { data: quest } = await supabase.from('quests').select('*').eq('id', id).single();
            if (!quest) throw new Error("Quest not found");
            await supabase.from('quest_completions').insert({ user_id: user.id, quest_id: id });
            await supabase.from('profiles').update({ xp: (user.xp || 0) + (quest.xp_reward || 0) }).eq('id', user.id);
            return quest.xp_reward || 0;
        }
        return 100;
    },

    async getCampaigns(): Promise<Campaign[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase.from('campaigns').select('*');
                if (error) throw error;
                return data?.map((c: any) => ({ ...c, targetAmount: c.target_amount, collectedAmount: c.collected_amount, organizerName: c.organizer_name })) || [];
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get campaigns failed:", errMsg);
                return mockStore.campaigns;
            }
        }
        return mockStore.campaigns;
    },

    async updateCampaign(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                const dbData = { ...data, target_amount: data.targetAmount, collected_amount: data.collectedAmount, organizer_name: data.organizerName };
                delete dbData.targetAmount; delete dbData.collectedAmount; delete dbData.organizerName;
                await supabase.from('campaigns').update(dbData).eq('id', id);
            } catch (e) {}
        }
    },

    async createCampaign(data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                const dbData = { ...data, target_amount: data.targetAmount, collected_amount: 0, organizer_name: data.organizerName };
                delete dbData.targetAmount; delete dbData.organizerName;
                await supabase.from('campaigns').insert(dbData);
            } catch (e) {}
        }
    },

    async donateToCampaign(id: string, amount: number) {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data: camp } = await supabase.from('campaigns').select('collected_amount').eq('id', id).single();
                await supabase.from('campaigns').update({ collected_amount: (camp?.collected_amount || 0) + amount }).eq('id', id);
            } catch (e) {}
        }
    },

    async getLostFoundItems(type: string): Promise<LostFoundItem[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                let q = supabase.from('lost_found').select('*').eq('status', 'approved');
                if (type !== 'all') q = q.eq('type', type);
                const { data, error } = await q;
                if (error) throw error;
                return data?.map((it: any) => ({ ...it, authorId: it.author_id, contactName: it.contact_name, contactPhone: it.contact_phone, isResolved: it.is_resolved })) || [];
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get lost found items failed:", errMsg);
                return mockStore.lostFound;
            }
        }
        return mockStore.lostFound;
    },

    async createLostFoundItem(data: any) {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        try {
            const dbData = { ...data, author_id: user.id, contact_name: data.contactName, contact_phone: data.contactPhone, status: 'pending' };
            delete dbData.contactName; delete dbData.contactPhone;
            await supabase.from('lost_found').insert(dbData);
        } catch (e) {}
    },

    async resolveLostFoundItem(id: string) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('lost_found').update({ is_resolved: true }).eq('id', id);
            } catch (e) {}
        }
    },

    async getAppeals(): Promise<Appeal[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase.from('appeals').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                return data?.map((a: any) => ({ ...a, authorId: a.author_id, resultImage: a.result_image })) || [];
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get appeals failed:", errMsg);
                return mockStore.appeals;
            }
        }
        return mockStore.appeals;
    },

    async createAppeal(data: any) {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        try {
            await supabase.from('appeals').insert({ ...data, author_id: user.id, status: 'new' });
        } catch (e) {}
    },

    async resolveAppeal(id: string, resultImage: string) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('appeals').update({ status: 'done', result_image: resultImage }).eq('id', id);
            } catch (e) {}
        }
    },

    async getRides(): Promise<Ride[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase.from('rides').select('*, profiles(name, avatar)').eq('status', 'approved');
                if (error) throw error;
                return data?.map((r: any) => ({ ...r, fromCity: r.from_city, toCity: r.to_city, carModel: r.car_model, driverId: r.driver_id, driverName: r.profiles?.name, driverAvatar: r.profiles?.avatar })) || [];
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get rides failed:", errMsg);
                return mockStore.rides;
            }
        }
        return mockStore.rides;
    },

    async createRide(data: any) {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        try {
            const dbData = { ...data, driver_id: user.id, from_city: data.fromCity, to_city: data.toCity, car_model: data.carModel, status: 'pending' };
            delete dbData.fromCity; delete dbData.toCity; delete dbData.carModel;
            await supabase.from('rides').insert(dbData);
        } catch (e) {}
    },

    async confirmRideBooking(rideId: string, passengerId: string, requestedSeats: number): Promise<void> {
        if (!isSupabaseConfigured() || !supabase) return;
        try {
            const { data: ride } = await supabase.from('rides').select('*').eq('id', rideId).single();
            if (!ride || ride.seats < requestedSeats) throw new Error("Мест больше нет");
            
            const { data: passenger } = await supabase.from('profiles').select('id, name, avatar').eq('id', passengerId).single();
            const newPassenger = { id: passenger.id, name: passenger.name, avatar: passenger.avatar };
            
            const currentDetails = ride.passenger_details || [];
            await supabase.from('rides').update({
                seats: ride.seats - requestedSeats,
                passenger_details: [...currentDetails, newPassenger]
            }).eq('id', rideId);
        } catch (e: any) { throw e; }
    },

    async getMyRides(): Promise<Ride[]> {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return [];
        try {
            const { data, error } = await supabase.from('rides').select('*').eq('driver_id', user.id);
            if (error) throw error;
            return data?.map((r: any) => ({ 
                ...r, 
                fromCity: r.from_city, 
                toCity: r.to_city, 
                carModel: r.car_model, 
                driverId: r.driver_id,
                passengerDetails: r.passenger_details 
            })) || [];
        } catch (e: any) {
            const errMsg = e?.message || String(e);
            if (!errMsg.includes('fetch')) console.error("Get my rides failed:", errMsg);
            return [];
        }
    },

    async deleteRide(id: string) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('rides').delete().eq('id', id);
            } catch (e) {}
        }
    },

    async getVacancies(): Promise<Vacancy[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase.from('vacancies').select('*').eq('status', 'approved');
                if (error) throw error;
                return data?.map((v: any) => ({ ...v, authorId: v.author_id, companyName: v.company_name, salaryMin: v.salary_min, salaryMax: v.salary_max, contactPhone: v.contact_phone })) || [];
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get vacancies failed:", errMsg);
                return mockStore.vacancies;
            }
        }
        return mockStore.vacancies;
    },

    async createVacancy(data: any) {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        try {
            const dbData = { ...data, author_id: user.id, company_name: data.companyName, salary_min: data.salary_min, salary_max: data.salary_max, contact_phone: data.contact_phone, status: 'pending' };
            delete dbData.companyName; delete dbData.salary_min; delete dbData.salary_max; delete dbData.contactPhone;
            await supabase.from('vacancies').insert(dbData);
        } catch (e) {}
    },

    async getResumes(): Promise<Resume[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase.from('resumes').select('*').eq('status', 'approved');
                if (error) throw error;
                return data?.map((r: any) => ({ ...r, authorId: r.author_id, salaryExpectation: r.salary_expectation })) || [];
            } catch (e: any) {
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get resumes failed:", errMsg);
                return mockStore.resumes;
            }
        }
        return mockStore.resumes;
    },

    async createResume(data: any) {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        try {
            const dbData = { ...data, author_id: user.id, salary_expectation: data.salaryExpectation, status: 'pending' };
            delete dbData.salaryExpectation;
            await supabase.from('resumes').insert(dbData);
        } catch (e) {}
    },

    async getSmartDevices(): Promise<SmartDevice[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase.from('smart_devices').select('*');
                if (error) throw error;
                return data?.map((d: any) => ({ ...d, imageUrl: d.image_url, isPrivate: d.is_private })) || [];
            } catch (e: any) {
                return mockStore.smartDevices;
            }
        }
        return mockStore.smartDevices;
    },

    async controlDevice(id: string, command: string) {
        await new Promise(r => setTimeout(r, 1000));
    },

    async getWeather(): Promise<any> {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.08&longitude=60.73&current_weather=true&relative_humidity_2m=true&surface_pressure=true');
            if (!res.ok) throw new Error("Weather API error");
            const data = await res.json();
            return {
                temp: data.current_weather.temperature,
                wind: data.current_weather.windspeed,
                code: data.current_weather.weathercode,
                humidity: data.current_weather.relative_humidity_2m,
                pressure: Math.round(data.current_weather.surface_pressure * 0.750062)
            };
        } catch (e: any) {
            return { temp: 0, wind: 0, code: 0, humidity: 0, pressure: 0 };
        }
    },

    async getWeatherForecast(): Promise<any[]> {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.08&longitude=60.73&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto');
            if (!res.ok) throw new Error("Forecast API error");
            const data = await res.json();
            const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
            return data.daily.time.map((t: string, i: number) => ({
                day: days[new Date(t).getDay()],
                code: data.daily.weathercode[i],
                tempDay: Math.round(data.daily.temperature_2m_max[i]),
                tempNight: Math.round(data.daily.temperature_2m_min[i]),
                precip: data.daily.precipitation_probability_max[i],
                wind: data.daily.windspeed_10m_max[i]
            }));
        } catch (e: any) {
            return [];
        }
    },

    async getExploreData(): Promise<any[]> {
        if (!isSupabaseConfigured() || !supabase) return [];
        try {
            const [biz, quests, appeals] = await Promise.all([
                supabase.from('businesses').select('*'),
                supabase.from('quests').select('*'),
                supabase.from('appeals').select('*')
            ]);
            const results: any[] = [];
            biz.data?.forEach(b => results.push({ type: 'business', id: b.id, lat: b.lat, lng: b.lng, title: b.name, subtitle: b.category, image: b.image, data: b }));
            quests.data?.forEach(q => results.push({ type: 'quest', id: q.id, lat: q.lat, lng: q.lng, title: q.title, subtitle: 'Квест', image: q.image, data: q }));
            appeals.data?.forEach(a => results.push({ type: 'appeal', id: a.id, lat: a.lat, lng: a.lng, title: a.title, subtitle: 'Обращение', image: a.image, data: a }));
            return results;
        } catch (e: any) {
            return [];
        }
    },

    async getSystemStats(): Promise<any> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const [u, b, n] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('businesses').select('*', { count: 'exact', head: true }),
                    supabase.from('news').select('*', { count: 'exact', head: true })
                ]);
                return { users: u.count, businesses: b.count, news: n.count };
            } catch (e: any) {
                return { users: 0, businesses: 0, news: 0 };
            }
        }
        return { users: 0, businesses: 0, news: 0 };
    },

    async updateBanner(id: string, data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('banners').update(data).eq('id', id);
            } catch (e) {}
        }
    },

    async createBanner(data: any) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('banners').insert(data);
            } catch (e) {}
        }
    },

    async getUtilityBills(): Promise<UtilityBill[]> {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return [];
        try {
            const { data, error } = await supabase.from('utility_bills').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (error) throw error;
            return data?.map(b => ({ ...b, serviceName: b.service_name, isPaid: b.is_paid })) || [];
        } catch (e: any) {
            return [];
        }
    },

    async payUtilityBill(id: string, amount: number) {
        if (isSupabaseConfigured() && supabase) {
            try {
                await supabase.from('utility_bills').update({ is_paid: true }).eq('id', id);
            } catch (e) {}
        }
    },

    async submitMeterReading(type: string, value: number) {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        try {
            await supabase.from('meter_readings').insert({ user_id: user.id, type, value, date: new Date().toISOString() });
        } catch (e) {}
    },

    async getAdById(id: string): Promise<Ad | null> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data: ad, error } = await supabase.from('ads').select('*').eq('id', id).maybeSingle();
                if (error) throw error;
                if (ad) {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', ad.author_id).maybeSingle();
                    return { 
                        ...ad, 
                        authorId: ad.author_id, // Явный маппинг ID автора
                        date: formatRelativeDate(ad.created_at || ad.date), 
                        authorName: profile?.name, 
                        authorAvatar: profile?.avatar, 
                        authorLastSeen: profile?.last_seen 
                    };
                }
            } catch (e: any) { 
                const errMsg = e?.message || String(e);
                if (!errMsg.includes('fetch')) console.error("Get ad by id failed:", errMsg); 
            }
        }
        return mockStore.ads.find(a => a.id === id) || null;
    },
};

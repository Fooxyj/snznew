

import { ADS_DATA, EVENTS_DATA, NEWS_DATA, CURRENT_USER, CATEGORIES, BUSINESS_DATA } from '../constants';
import { Ad, Business, Event, NewsItem, User, UserRole, Review, Comment, Conversation, Message, Notification, Poll, LostFoundItem, Appeal, Ride, Vacancy, Resume, Coupon, UserCoupon, Product, Story, Community, CommunityPost, Quest, Service, Booking, Ticket, Order, Transaction, MeterReading, UtilityBill, Campaign, RentalItem, RentalBooking, SmartDevice } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';

// Эмуляция задержки для mock-данных
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize Mock Ads in memory from Constants
// This ensures any changes (VIP toggle, delete) persist in the session even if backend fails
let _mockAds: Ad[] = [...ADS_DATA.map(ad => ({...ad, status: ad.status || 'approved'} as Ad))];

const MOCK_USERS: Record<string, Partial<User>> = {
    'u2': { name: 'Иван Петров', avatar: 'https://i.pravatar.cc/150?u=2' },
    'u3': { name: 'Мария С.', avatar: 'https://i.pravatar.cc/150?u=3' },
    'u4': { name: 'Елена В.', avatar: 'https://i.pravatar.cc/150?u=4' },
    'u5': { name: 'Дмитрий К.', avatar: 'https://i.pravatar.cc/150?u=5' },
    'u6': { name: 'Анна Л.', avatar: 'https://i.pravatar.cc/150?u=6' },
};

// Updated Constants for this specific file scope to support the new features
const UPDATED_BUSINESS_DATA: Business[] = [
  ...BUSINESS_DATA.filter(b => b.id !== 'b3'), // Remove old cinema
  {
    id: 'b3',
    name: 'Кинотеатр "Космос"',
    category: 'Кино',
    rating: 4.2,
    reviewsCount: 230,
    address: 'пр. Мира, 5',
    image: 'https://picsum.photos/seed/cinema/400/300',
    description: 'Новинки кино в 3D и 2D. Самый большой экран в городе.',
    lat: 40,
    lng: 60,
    phone: '+79227277322', // Updated phone
    workHours: '10:00 - 02:00',
    authorId: 'u_cinema_owner' // Mock ID for owner
  }
];

const UPDATED_EVENTS_DATA: Event[] = [
    ...EVENTS_DATA,
    {
        id: 'mv1',
        title: 'Головоломка 2',
        date: 'Сегодня',
        image: 'https://picsum.photos/seed/movie1/400/600',
        location: 'Зал 1',
        category: 'Кино',
        price: 350,
        authorId: 'u_cinema_owner',
        sessions: ['10:00', '12:30', '15:00', '18:40', '21:00']
    },
    {
        id: 'mv2',
        title: 'Дэдпул и Росомаха',
        date: 'Сегодня',
        image: 'https://picsum.photos/seed/movie2/400/600',
        location: 'Зал 2',
        category: 'Кино',
        price: 400,
        authorId: 'u_cinema_owner',
        sessions: ['14:00', '17:30', '20:15', '23:00']
    }
];

// --- Mappers ---

const mapAdFromDB = (dbAd: any): Ad => ({
  id: dbAd.id,
  title: dbAd.title,
  price: dbAd.price,
  currency: dbAd.currency,
  category: dbAd.category,
  image: dbAd.image,
  date: dbAd.date,
  authorId: dbAd.author_id,
  description: dbAd.description,
  location: dbAd.location,
  isVip: dbAd.is_vip,
  status: dbAd.status || 'approved'
});

const mapNewsFromDB = (dbNews: any): NewsItem => ({
  id: dbNews.id,
  title: dbNews.title,
  category: dbNews.category,
  image: dbNews.image,
  date: dbNews.date,
  views: dbNews.views,
  commentsCount: dbNews.comments_count,
  content: dbNews.content
});

const mapBusinessFromDB = (dbBiz: any, reviews: any[] = []): Business => {
    // Calculate rating on the fly if reviews are provided
    let rating = dbBiz.rating || 0;
    let reviewsCount = dbBiz.reviews_count || 0;

    if (reviews && reviews.length > 0) {
        const bizReviews = reviews.filter((r: any) => r.business_id === dbBiz.id);
        reviewsCount = bizReviews.length;
        if (reviewsCount > 0) {
            const total = bizReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
            rating = Number((total / reviewsCount).toFixed(1));
        } else {
            rating = 0; // Or keep default
        }
    }

    return {
        id: dbBiz.id,
        name: dbBiz.name,
        category: dbBiz.category,
        rating: rating,
        reviewsCount: reviewsCount,
        address: dbBiz.address,
        image: dbBiz.image,
        description: dbBiz.description,
        lat: dbBiz.lat || 56.08, 
        lng: dbBiz.lng || 60.73,
        phone: dbBiz.phone,
        workHours: dbBiz.work_hours,
        authorId: dbBiz.author_id
    };
};

const mapEventFromDB = (dbEvent: any): Event => ({
    id: dbEvent.id,
    title: dbEvent.title,
    date: dbEvent.date,
    image: dbEvent.image,
    location: dbEvent.location,
    category: dbEvent.category,
    price: dbEvent.price || 350,
    description: 'Описание мероприятия...',
    sessions: dbEvent.sessions || []
});

const mapLostFoundFromDB = (dbItem: any): LostFoundItem => ({
    id: dbItem.id,
    type: dbItem.type,
    title: dbItem.title,
    description: dbItem.description,
    image: dbItem.image,
    location: dbItem.location,
    date: dbItem.date,
    contactName: dbItem.contact_name,
    contactPhone: dbItem.contact_phone,
    isResolved: dbItem.is_resolved,
    authorId: dbItem.author_id
});

const mapAppealFromDB = (dbApp: any): Appeal => ({
    id: dbApp.id,
    title: dbApp.title,
    description: dbApp.description,
    image: dbApp.image,
    location: dbApp.location,
    status: dbApp.status,
    resultImage: dbApp.result_image,
    authorId: dbApp.author_id,
    createdAt: dbApp.created_at
});

const mapRideFromDB = (dbRide: any, driver?: any): Ride => ({
    id: dbRide.id,
    fromCity: dbRide.from_city,
    toCity: dbRide.to_city,
    date: dbRide.date,
    time: dbRide.time,
    price: dbRide.price,
    seats: dbRide.seats,
    carModel: dbRide.car_model,
    driverId: dbRide.driver_id,
    driverName: driver?.name,
    driverAvatar: driver?.avatar
});

const mapVacancyFromDB = (dbV: any): Vacancy => ({
    id: dbV.id,
    title: dbV.title,
    salaryMin: dbV.salary_min,
    salaryMax: dbV.salary_max,
    companyName: dbV.company_name,
    description: dbV.description,
    contactPhone: dbV.contact_phone,
    schedule: dbV.schedule,
    authorId: dbV.author_id,
    createdAt: dbV.created_at
});

const mapResumeFromDB = (dbR: any): Resume => ({
    id: dbR.id,
    name: dbR.name,
    profession: dbR.profession,
    salaryExpectation: dbR.salary_expectation,
    experience: dbR.experience,
    about: dbR.about,
    phone: dbR.phone,
    authorId: dbR.author_id,
    createdAt: dbR.created_at
});

const mapRentalFromDB = (dbR: any): RentalItem => ({
    id: dbR.id,
    title: dbR.title,
    description: dbR.description,
    image: dbR.image,
    pricePerDay: dbR.price_per_day,
    deposit: dbR.deposit,
    category: dbR.category,
    authorId: dbR.author_id,
    isAvailable: dbR.is_available
});

// --- API Implementation ---

export const api = {
  // --- REAL WEATHER ---
  async getWeather() {
      try {
          // Added surface_pressure
          const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.08&longitude=60.73&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&wind_speed_unit=ms');
          if (!res.ok) throw new Error("Failed");
          const data = await res.json();
          return {
              temp: Math.round(data.current.temperature_2m),
              wind: Math.round(data.current.wind_speed_10m),
              humidity: data.current.relative_humidity_2m,
              // Convert hPa to mmHg
              pressure: Math.round(data.current.surface_pressure * 0.750062),
              code: data.current.weather_code
          };
      } catch (e) {
          console.error("Weather fetch failed, using fallback", e);
          // Silent fallback to avoid UI error
          return {
              temp: 18,
              wind: 3,
              humidity: 65,
              pressure: 742,
              code: 1 // Clear sky
          };
      }
  },

  async globalSearch(query: string) {
    const q = query.toLowerCase();
    const [ads, businesses, news] = await Promise.all([
        this.getAds(),
        this.getBusinesses(),
        this.getNews()
    ]);
    return {
        ads: ads.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)),
        businesses: businesses.filter(b => b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)),
        news: news.filter(n => n.title.toLowerCase().includes(q))
    };
  },

  async signUp(email: string, password: string, name: string) {
    if (!isSupabaseConfigured() || !supabase) throw new Error("Supabase не настроен");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured() || !supabase) throw new Error("Supabase не настроен");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (supabase) await supabase.auth.signOut();
    window.location.reload(); 
  },

  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            const { data: favorites } = await supabase.from('favorites').select('item_id').eq('user_id', user.id);
            const favIds = favorites ? favorites.map((f: any) => f.item_id) : [];

            if (profile) {
                return {
                    id: profile.id,
                    name: profile.name || user.email,
                    email: profile.email || user.email,
                    avatar: profile.avatar,
                    phone: profile.phone,
                    role: (profile.role as UserRole) || UserRole.USER,
                    xp: profile.xp || 0,
                    favorites: favIds,
                    badges: profile.badges || [],
                    balance: profile.balance || 0,
                    createdAt: profile.created_at || new Date().toISOString()
                } as User;
            }
        }
        return null; 
    }
    return { ...CURRENT_USER, createdAt: new Date().toISOString() };
  },

  async getUserById(id: string): Promise<User | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
          if (profile) {
              return {
                  id: profile.id,
                  name: profile.name || 'Пользователь',
                  email: profile.email,
                  avatar: profile.avatar || 'https://ui-avatars.com/api/?name=User',
                  role: profile.role as UserRole,
                  xp: profile.xp || 0,
                  favorites: [],
                  badges: profile.badges || [],
                  createdAt: profile.created_at || new Date().toISOString()
              };
          }
      }
      
      if (id === CURRENT_USER.id) return { ...CURRENT_USER, createdAt: new Date().toISOString() }; 
      if (MOCK_USERS[id]) {
          return {
              id: id,
              name: MOCK_USERS[id].name || 'User',
              email: 'mock@user.com',
              avatar: MOCK_USERS[id].avatar || '',
              role: UserRole.USER,
              xp: 100,
              favorites: [],
              createdAt: new Date(Date.now() - 100000000).toISOString()
          };
      }
      return null;
  },

  async updateProfile(updates: Partial<User>) {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Не авторизован");
        const payload: any = {};
        if (updates.name) payload.name = updates.name;
        if (updates.avatar) payload.avatar = updates.avatar;
        if (updates.phone) payload.phone = updates.phone;
        const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
        if (error) throw error;
    }
  },

  async getLeaderboard(): Promise<User[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('profiles').select('*').order('xp', { ascending: false }).limit(50);
          if (data) return data.map((p: any) => ({
              id: p.id,
              name: p.name || 'User',
              email: p.email,
              avatar: p.avatar,
              role: p.role,
              xp: p.xp,
              favorites: [],
              badges: p.badges || []
          }));
      }
      return [CURRENT_USER];
  },

  async startChat(partnerId: string): Promise<string> {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Нужно войти");
        if (user.id === partnerId) throw new Error("Нельзя писать самому себе");

        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${partnerId}),and(participant1_id.eq.${partnerId},participant2_id.eq.${user.id})`)
            .maybeSingle();

        if (existing) return existing.id;

        const { data: newChat, error } = await supabase.from('conversations').insert([{ participant1_id: user.id, participant2_id: partnerId }]).select().single();
        if (error) throw error;
        return newChat.id;
    }
    return "mock_chat_id";
  },

  async getConversations(): Promise<Conversation[]> {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data: convos } = await supabase.from('conversations').select('*').or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`).order('updated_at', { ascending: false });
        if (!convos) return [];
        const result: Conversation[] = [];
        for (const c of convos) {
            const partnerId = c.participant1_id === user.id ? c.participant2_id : c.participant1_id;
            const { data: partner } = await supabase.from('profiles').select('name, avatar').eq('id', partnerId).single();
            if (partner) {
                result.push({
                    id: c.id,
                    participant1Id: c.participant1_id,
                    participant2Id: c.participant2_id,
                    partnerName: partner.name,
                    partnerAvatar: partner.avatar,
                    lastMessageDate: new Date(c.updated_at).toLocaleDateString()
                });
            }
        }
        return result;
    }
    return [];
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
        if (data) return data.map((m: any) => ({
            id: m.id,
            conversationId: m.conversation_id,
            senderId: m.sender_id,
            text: m.text,
            isRead: m.is_read,
            createdAt: m.created_at
        }));
    }
    return [];
  },

  async sendMessage(conversationId: string, text: string) {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('messages').insert([{ conversation_id: conversationId, sender_id: user.id, text: text }]);
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
    }
  },

  subscribeToMessages(conversationId: string, callback: (msg: Message) => void) {
      if (!isSupabaseConfigured() || !supabase) return { unsubscribe: () => {} };
      const channel = supabase.channel(`chat:${conversationId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
            const m = payload.new;
            callback({ id: m.id, conversationId: m.conversation_id, senderId: m.sender_id, text: m.text, isRead: m.is_read, createdAt: m.created_at });
        }).subscribe();
      return { unsubscribe: () => supabase?.removeChannel(channel) };
  },

  subscribeToNotifications(userId: string, callback: (n: Notification) => void) {
      if (!isSupabaseConfigured() || !supabase) return { unsubscribe: () => {} };
      const channel = supabase.channel(`user_notifications:${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
            const n = payload.new;
            callback({ id: n.id, userId: n.user_id, type: n.type, text: n.text, link: n.link, isRead: n.is_read, createdAt: n.created_at });
        }).subscribe();
      return { unsubscribe: () => supabase?.removeChannel(channel) };
  },

  async getNotifications(): Promise<Notification[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (data) return data.map((n:any) => ({ id: n.id, userId: n.user_id, type: n.type, text: n.text, link: n.link, isRead: n.is_read, createdAt: n.created_at }));
      }
      return [];
  },

  async markNotificationRead(id: string) {
      if (isSupabaseConfigured() && supabase) await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  },

  async deleteNotification(id: string) {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('notifications').delete().eq('id', id);
      }
  },

  async incrementXP(amount: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
          if (profile) await supabase.from('profiles').update({ xp: (profile.xp || 0) + amount }).eq('id', user.id);
      }
  },

  async getUserContent(userId: string) {
     if (isSupabaseConfigured() && supabase) {
        const [ads, businesses, events, favorites] = await Promise.all([
            supabase.from('ads').select('*').eq('author_id', userId).order('id', { ascending: false }),
            supabase.from('businesses').select('*').eq('author_id', userId),
            supabase.from('events').select('*').eq('author_id', userId),
            supabase.from('favorites').select('item_id, type').eq('user_id', userId)
        ]);
        let favAds: Ad[] = [];
        if (favorites.data && favorites.data.length > 0) {
            const adIds = favorites.data.filter((f: any) => f.type === 'ad').map((f: any) => f.item_id);
            if (adIds.length > 0) {
                const { data: adsData } = await supabase.from('ads').select('*').in('id', adIds);
                if (adsData) favAds = adsData.map(mapAdFromDB);
            }
        }
        return {
            ads: ads.data ? ads.data.map(mapAdFromDB) : [],
            businesses: businesses.data ? businesses.data.map(b => mapBusinessFromDB(b)) : [],
            events: events.data ? events.data.map(mapEventFromDB) : [],
            favorites: favAds
        };
     }
     
     // Mock fallback
     const userAds = _mockAds.filter(a => a.authorId === userId);
     return { ads: userAds, businesses: [], events: [], favorites: [] };
  },

  async getSystemStats() {
      if (isSupabaseConfigured() && supabase) {
          try {
            const [profiles, ads, businesses, news] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('ads').select('*', { count: 'exact', head: true }),
                supabase.from('businesses').select('*', { count: 'exact', head: true }),
                supabase.from('news').select('*', { count: 'exact', head: true })
            ]);
            return { users: profiles.count || 0, ads: ads.count || 0, businesses: businesses.count || 0, news: news.count || 0 };
          } catch (e) {
            return { users: 0, ads: 0, businesses: 0, news: 0 };
          }
      }
      return { users: 1250, ads: _mockAds.length, businesses: 45, news: 12 };
  },

  async getAllContent() {
      if (isSupabaseConfigured() && supabase) {
          try {
            const { data: ads } = await supabase.from('ads').select('id, title, category, date').order('date', {ascending: false}).limit(10);
            return ads ? ads.map((a: any) => ({ ...a, type: 'Объявление' })) : [];
          } catch (e) {
            return [];
          }
      }
      return [];
  },

  async toggleFavorite(itemId: string, type: 'ad' | 'business') {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите, чтобы добавлять в избранное");
          const { data } = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('item_id', itemId).single();
          if (data) {
              await supabase.from('favorites').delete().eq('id', data.id);
              return false;
          } else {
              await supabase.from('favorites').insert({ user_id: user.id, item_id: itemId, type: type });
              return true;
          }
      }
      return false;
  },

  async uploadImage(file: File): Promise<string> {
    if (!isSupabaseConfigured() || !supabase) throw new Error("База данных не подключена");
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
    if (uploadError) throw new Error('Ошибка загрузки изображения');
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  async getAds(category?: string): Promise<Ad[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
          let query = supabase.from('ads').select('*').order('is_vip', { ascending: false }).order('id', { ascending: false });
          
          // STRICT FILTER: Public feed only shows approved ads
          query = query.eq('status', 'approved');

          if (category && category !== 'Все') query = query.eq('category', category);
          
          const { data, error } = await query;
          if (!error && data) return data.map(mapAdFromDB);
      } catch (e) {
          console.warn("Supabase fetch failed, using mock data", e);
      }
    }
    
    // Offline / Fallback
    await delay(300);
    let result = _mockAds.filter(a => a.status === 'approved');
    if (category && category !== 'Все') result = result.filter(ad => ad.category === category);
    return result.sort((a, b) => (b.isVip === a.isVip ? 0 : b.isVip ? 1 : -1));
  },

  async getAllAdsForAdmin(): Promise<Ad[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: ads } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
                if (ads) return ads.map(mapAdFromDB);
            }
          } catch(e) {
             console.warn("Supabase admin fetch failed, using mock data", e);
          }
      }
      await delay(300);
      return [..._mockAds];
  },

  async createAd(newAd: Partial<Ad>): Promise<Ad> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Нужно войти в систему");
            
            const status = 'pending'; 

            const dbPayload = { 
                title: newAd.title, 
                price: newAd.price, 
                currency: newAd.currency || '₽', 
                category: newAd.category, 
                image: newAd.image, 
                description: newAd.description, 
                location: newAd.location, 
                author_id: user.id, 
                is_vip: false, 
                date: 'Сегодня',
                status: status 
            };
            const { data, error } = await supabase.from('ads').insert([dbPayload]).select();
            if (error) throw new Error(error.message);
            
            await supabase.from('notifications').insert({ user_id: user.id, type: 'system', text: `Ваше объявление "${newAd.title}" отправлено на модерацию.`, is_read: false });
            
            if (data) return mapAdFromDB(data[0]);
        } catch(e) {
             console.warn("Supabase create failed, using mock data", e);
        }
    }
    
    // Offline / Mock Creation
    await delay(600);
    const mockAd: Ad = {
        ...newAd, 
        id: 'temp_' + Date.now(), 
        authorId: 'u1', // Assume current user
        status: 'pending',
        date: 'Сегодня',
        currency: '₽',
        isVip: false
    } as Ad;
    
    // Add to memory storage
    _mockAds.unshift(mockAd);
    return mockAd;
  },

  async getPendingAds(): Promise<Ad[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
            const { data } = await supabase.from('ads').select('*').eq('status', 'pending').order('created_at', { ascending: false });
            if (data) return data.map(mapAdFromDB);
          } catch(e) {
             console.warn("Supabase pending fetch failed, using mock", e);
          }
      }
      return _mockAds.filter(a => a.status === 'pending');
  },

  async approveAd(id: string) {
      if (isSupabaseConfigured() && supabase) {
          try {
            await supabase.from('ads').update({ status: 'approved' }).eq('id', id);
            // Notifications logic...
            return;
          } catch(e) {
             console.warn("Supabase approve failed, using mock", e);
          }
      }
      // Offline
      const ad = _mockAds.find(a => a.id === id);
      if(ad) ad.status = 'approved';
  },

  async rejectAd(id: string) {
      if (isSupabaseConfigured() && supabase) {
          try {
            await supabase.from('ads').delete().eq('id', id);
            return;
          } catch(e) {
             console.warn("Supabase reject failed, using mock", e);
          }
      }
      // Offline: Delete or set to rejected? Admin deletes usually
      _mockAds = _mockAds.filter(a => a.id !== id);
  },

  async deleteAd(id: string) {
      if (isSupabaseConfigured() && supabase) {
          try {
            const { error } = await supabase.from('ads').delete().eq('id', id);
            if (error) throw error;
            return;
          } catch(e) {
             console.warn("Supabase delete failed, using mock data", e);
          }
      }
      // Offline fallback
      _mockAds = _mockAds.filter(a => a.id !== id);
  },

  async updateAd(id: string, updates: Partial<Ad>) {
      if (isSupabaseConfigured() && supabase) {
          try {
            const dbPayload: any = {};
            if (updates.title) dbPayload.title = updates.title;
            if (updates.price) dbPayload.price = updates.price;
            if (updates.description) dbPayload.description = updates.description;
            if (updates.category) dbPayload.category = updates.category;
            if (updates.image) dbPayload.image = updates.image;
            if (updates.location) dbPayload.location = updates.location;

            const { error } = await supabase.from('ads').update(dbPayload).eq('id', id);
            if (error) throw error;
            return;
          } catch(e) {
             console.warn("Supabase update failed, using mock data", e);
          }
      }
      // Offline fallback
      const idx = _mockAds.findIndex(a => a.id === id);
      if (idx !== -1) {
          _mockAds[idx] = { ..._mockAds[idx], ...updates };
      }
  },

  async getAdById(id: string): Promise<Ad | null> {
      if (isSupabaseConfigured() && supabase) {
          try {
            const { data } = await supabase.from('ads').select('*').eq('id', id).single();
            if (data) return mapAdFromDB(data);
          } catch(e) {
             console.warn("Supabase fetch single failed, using mock data", e);
          }
      }
      return _mockAds.find(a => a.id === id) || null;
  },

  async deleteBusiness(id: string) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('businesses').delete().eq('id', id);
          if (error) throw error;
      }
  },

  async updateBusiness(id: string, updates: Partial<Business>) {
      if (isSupabaseConfigured() && supabase) {
          const dbPayload: any = {};
          if (updates.name) dbPayload.name = updates.name;
          if (updates.description) dbPayload.description = updates.description;
          if (updates.address) dbPayload.address = updates.address;
          if (updates.phone) dbPayload.phone = updates.phone;
          if (updates.workHours) dbPayload.work_hours = updates.workHours;
          if (updates.image) dbPayload.image = updates.image;
          if (updates.category) dbPayload.category = updates.category;

          const { error } = await supabase.from('businesses').update(dbPayload).eq('id', id);
          if (error) throw error;
      }
  },

  async promoteAd(id: string) {
      if (isSupabaseConfigured() && supabase) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Нужно войти");
            await supabase.from('transactions').insert({ sender_id: user.id, amount: 99, type: 'purchase', description: 'Продвижение объявления (VIP)' });
            
            const { error } = await supabase.from('ads').update({ is_vip: true, date: 'Поднято сейчас' }).eq('id', id);
            if (error) throw error;
            return;
          } catch(e) {
             console.warn("Supabase promote failed, using mock data", e);
          }
      }
      // Offline
      const ad = _mockAds.find(a => a.id === id);
      if(ad) {
          ad.isVip = true;
          ad.date = 'Поднято сейчас';
      }
  },

  async adminToggleVip(id: string, currentState: boolean) {
      if (isSupabaseConfigured() && supabase) {
          try {
            const { error } = await supabase.from('ads').update({ is_vip: !currentState }).eq('id', id);
            if (error) throw error;
            return;
          } catch(e) {
             console.warn("Supabase update failed, using mock data", e);
          }
      }
      // Offline fallback
      _mockAds = _mockAds.map(a => a.id === id ? { ...a, isVip: !currentState } : a);
  },

  async getActivePoll(): Promise<Poll | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data: poll } = await supabase.from('polls').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
          if (poll) {
              const { data: { user } } = await supabase.auth.getUser();
              let userVotedOptionId = null;
              if (user) {
                  const { data: vote } = await supabase.from('poll_votes').select('option_id').eq('poll_id', poll.id).eq('user_id', user.id).maybeSingle();
                  if (vote) userVotedOptionId = vote.option_id;
              }
              return { id: poll.id, question: poll.question, options: poll.options, isActive: poll.is_active, userVotedOptionId };
          }
      }
      return { id: 'mock-poll', question: 'Что нам построить в центре?', options: [{id:'1',text:'Парк',votes:120},{id:'2',text:'ТЦ',votes:85}], isActive: true, userVotedOptionId: null };
  },

  async votePoll(pollId: string, optionId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите, чтобы голосовать");
          const { error: voteError } = await supabase.from('poll_votes').insert({ poll_id: pollId, user_id: user.id, option_id: optionId });
          if (voteError) { if (voteError.code === '23505') throw new Error("Вы уже голосовали"); throw voteError; }
          const { data: poll } = await supabase.from('polls').select('*').eq('id', pollId).single();
          if (poll) {
              const newOptions = poll.options.map((o: any) => o.id === optionId ? { ...o, votes: o.votes + 1 } : o);
              await supabase.from('polls').update({ options: newOptions }).eq('id', pollId);
          }
          await this.incrementXP(10);
      }
  },

  async createPoll(question: string, optionsTexts: string[]) {
      if (isSupabaseConfigured() && supabase) {
          const options = optionsTexts.map((text, idx) => ({ id: idx.toString(), text, votes: 0 }));
          const { error } = await supabase.from('polls').insert({ question, options, is_active: true });
          if (error) throw error;
      }
  },

  async getNews(): Promise<NewsItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('news').select('*').order('date', { ascending: false });
      if (data && data.length > 0) return data.map(mapNewsFromDB);
    }
    if (!isSupabaseConfigured()) await delay(500); 
    return [...NEWS_DATA];
  },

  async getNewsById(id: string): Promise<NewsItem | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('news').select('*').eq('id', id).single();
        if (data) return mapNewsFromDB(data);
    }
    return NEWS_DATA.find(n => n.id === id) || null;
  },

  async createNews(news: Partial<NewsItem>): Promise<NewsItem> {
    if (isSupabaseConfigured() && supabase) {
        const dbPayload = { title: news.title, category: news.category, content: news.content, image: news.image || 'https://picsum.photos/seed/news/800/400', date: new Date().toLocaleDateString('ru-RU'), views: 0, comments_count: 0 };
        const { data, error } = await supabase.from('news').insert([dbPayload]).select();
        if (error) throw new Error(error.message);
        await this.incrementXP(20); 
        return mapNewsFromDB(data[0]);
    }
    throw new Error("База данных не подключена");
  },

  async deleteNews(id: string) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('news').delete().eq('id', id);
          if (error) throw error;
      }
  },

  async getBusinesses(categoryId?: string): Promise<Business[]> {
      let categoryLabel: string | undefined = undefined;
      
      if (categoryId) {
          const cat = CATEGORIES.find(c => c.id === categoryId);
          categoryLabel = cat ? cat.label : categoryId;
      }

      if (isSupabaseConfigured() && supabase) {
          // Fetch businesses
          let query = supabase.from('businesses').select('*').order('rating', { ascending: false });
          if (categoryLabel && categoryLabel !== 'all') query = query.eq('category', categoryLabel);
          const { data: businesses, error: bizError } = await query;
          
          if (bizError) throw bizError;
          if (!businesses) return [];

          // Fetch reviews to calculate dynamic rating
          const { data: reviews } = await supabase.from('reviews').select('business_id, rating');
          
          return businesses.map(b => mapBusinessFromDB(b, reviews || []));
      }
      
      if (!isSupabaseConfigured()) await delay(500);
      
      if (categoryLabel && categoryLabel !== 'all') {
          return UPDATED_BUSINESS_DATA.filter(b => b.category === categoryLabel);
      }
      return [...UPDATED_BUSINESS_DATA];
  },

  async getBusinessById(id: string): Promise<Business | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data: business } = await supabase.from('businesses').select('*').eq('id', id).single();
          if (!business) return null;

          const { data: reviews } = await supabase.from('reviews').select('business_id, rating').eq('business_id', id);
          return mapBusinessFromDB(business, reviews || []);
      }
      return UPDATED_BUSINESS_DATA.find(b => b.id === id) || null;
  },

  async createBusiness(biz: Partial<Business>): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Нужно войти в систему");
        const randLat = 56.08 + (Math.random() - 0.5) * 0.03;
        const randLng = 60.73 + (Math.random() - 0.5) * 0.03;
        const dbPayload = { name: biz.name, category: biz.category, address: biz.address, phone: biz.phone, description: biz.description, work_hours: biz.workHours, image: biz.image || 'https://picsum.photos/seed/biz/400/300', rating: 5.0, reviews_count: 0, author_id: user.id, lat: randLat, lng: randLng };
        const { error } = await supabase.from('businesses').insert([dbPayload]);
        if (error) throw new Error(error.message);
        await this.incrementXP(50);
        await supabase.from('notifications').insert({ user_id: user.id, type: 'system', text: `Организация "${biz.name}" добавлена в каталог.`, is_read: false });
        return;
    }
    throw new Error("База данных не подключена");
  },

  async getProducts(businessId: string): Promise<Product[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('products').select('*').eq('business_id', businessId).order('created_at', { ascending: true });
          if (data) return data.map((p: any) => ({ id: p.id, businessId: p.business_id, name: p.name, description: p.description, price: p.price, image: p.image, category: p.category }));
      }
      return [];
  },

  async createProduct(product: Partial<Product>) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('products').insert({ business_id: product.businessId, name: product.name, description: product.description, price: product.price, image: product.image || 'https://picsum.photos/seed/food/200/200', category: product.category });
          if (error) throw error;
      }
  },

  async deleteProduct(productId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('products').delete().eq('id', productId);
          if (error) throw error;
      }
  },

  async getServices(businessId: string): Promise<Service[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('business_services').select('*').eq('business_id', businessId).order('title', { ascending: true });
          if (data) return data.map((s:any) => ({ id: s.id, businessId: s.business_id, title: s.title, price: s.price, durationMin: s.duration_min }));
      }
      return [];
  },

  async createService(service: Partial<Service>) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('business_services').insert({ business_id: service.businessId, title: service.title, price: service.price, duration_min: service.durationMin });
          if (error) throw error;
      }
  },

  async deleteService(serviceId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('business_services').delete().eq('id', serviceId);
          if (error) throw error;
      }
  },

  async bookService(service: Service, date: string, time: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите для записи");
          const { data: taken } = await supabase.from('bookings').select('id').eq('business_id', service.businessId).eq('date', date).eq('time', time).maybeSingle();
          if (taken) throw new Error("Это время уже занято");
          const { error } = await supabase.from('bookings').insert({ service_id: service.id, business_id: service.businessId, user_id: user.id, date, time, status: 'confirmed' });
          if (error) throw error;
          await this.incrementXP(15);
      }
  },

  async getMyBookings(): Promise<Booking[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('bookings').select(`*, business_services (title, price), businesses (name)`).eq('user_id', user.id).order('date', { ascending: true });
          if (data) return data.map((b: any) => ({ id: b.id, serviceId: b.service_id, businessId: b.business_id, userId: b.user_id, date: b.date, time: b.time, status: b.status, serviceTitle: b.business_services?.title, businessName: b.businesses?.name, price: b.business_services?.price }));
      }
      return [];
  },
  
  async getEvents(): Promise<Event[]> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (data) return data.map(mapEventFromDB);
    }
    if (!isSupabaseConfigured()) await delay(500);
    return [...UPDATED_EVENTS_DATA];
  },

  // NEW: Get Events by Author (For Business/Cinema Page)
  async getEventsByAuthor(authorId: string): Promise<Event[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*').eq('author_id', authorId).order('date', { ascending: true });
          if (data) return data.map(mapEventFromDB);
      }
      if (!isSupabaseConfigured()) {
          return UPDATED_EVENTS_DATA.filter(e => e.authorId === authorId);
      }
      return [];
  },

  async getEventById(id: string): Promise<Event | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*').eq('id', id).single();
          if (data) return mapEventFromDB(data);
      }
      return UPDATED_EVENTS_DATA.find(e => e.id === id) || null;
  },

  async createEvent(evt: Partial<Event>): Promise<Event> {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Нужно войти в систему");
        const dbPayload = { title: evt.title, date: evt.date, location: evt.location, category: evt.category, image: evt.image || 'https://picsum.photos/seed/evt/400/300', author_id: user.id };
        const { data, error } = await supabase.from('events').insert([dbPayload]).select();
        if (error) throw new Error(error.message);
        await this.incrementXP(30);
        if (data) return mapEventFromDB(data[0]);
    }
    throw new Error("База данных не подключена");
  },

  async updateEvent(id: string, updates: Partial<Event>) {
      if (isSupabaseConfigured() && supabase) {
          const dbPayload: any = {};
          if (updates.title) dbPayload.title = updates.title;
          if (updates.date) dbPayload.date = updates.date;
          if (updates.location) dbPayload.location = updates.location;
          if (updates.category) dbPayload.category = updates.category;
          if (updates.image) dbPayload.image = updates.image;
          if (updates.price) dbPayload.price = updates.price;

          const { error } = await supabase.from('events').update(dbPayload).eq('id', id);
          if (error) throw error;
      }
  },

  async deleteEvent(id: string) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('events').delete().eq('id', id);
          if (error) throw error;
      }
  },

  async getBookedSeats(eventId: string): Promise<{row: number, col: number}[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('tickets').select('row_idx, col_idx').eq('event_id', eventId);
          if (data) return data.map((t: any) => ({ row: t.row_idx, col: t.col_idx }));
      }
      return [];
  },

  async buyTicket(eventId: string, row: number, col: number, price: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите для покупки");
          const { data: existing } = await supabase.from('tickets').select('id').eq('event_id', eventId).eq('row_idx', row).eq('col_idx', col).maybeSingle();
          if (existing) throw new Error("Место уже занято");
          
          await supabase.from('transactions').insert({ sender_id: user.id, amount: price, type: 'purchase', description: `Билет на мероприятие (Ряд ${row+1}, Место ${col+1})` });

          const qrCode = `SNZ-TICKET-${eventId.slice(0,4)}-${row}-${col}-${Math.random().toString(36).substring(7)}`;
          const { error } = await supabase.from('tickets').insert({ user_id: user.id, event_id: eventId, row_idx: row, col_idx: col, price: price, qr_code: qrCode });
          if (error) throw error;
          await this.incrementXP(20);
      }
  },

  async getMyTickets(): Promise<Ticket[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('tickets').select('*, events(title, date, image, location)').eq('user_id', user.id).order('created_at', { ascending: false });
          if (data) return data.map((t: any) => ({ id: t.id, eventId: t.event_id, userId: t.user_id, row: t.row_idx, col: t.col_idx, price: t.price, qrCode: t.qr_code, eventTitle: t.events?.title, eventDate: t.events?.date, eventImage: t.events?.image, eventLocation: t.events?.location }));
      }
      return [];
  },

  async getReviews(businessId: string): Promise<Review[]> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('reviews').select('*').eq('business_id', businessId).order('date', { ascending: false });
        if (!data) return [];
        
        const reviews: Review[] = [];
        for (const r of data) {
            let authorName = r.author_name;
            let authorAvatar = '';
            if (r.author_id) {
                const { data: profile } = await supabase.from('profiles').select('name, avatar').eq('id', r.author_id).maybeSingle();
                if (profile) {
                    authorName = profile.name;
                    authorAvatar = profile.avatar;
                }
            }
            reviews.push({ 
                id: r.id, 
                businessId: r.business_id, 
                authorName: authorName || 'Аноним', 
                authorAvatar,
                rating: r.rating, 
                text: r.text, 
                date: r.date 
            });
        }
        return reviews;
    }
    return [];
  },

  async addReview(businessId: string, rating: number, text: string) {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Войдите, чтобы оставить отзыв");
        
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        const name = profile?.name || user.email;

        // 1. Insert Review
        const { error } = await supabase.from('reviews').insert([{ business_id: businessId, author_id: user.id, author_name: name, rating, text, date: new Date().toLocaleDateString('ru-RU') }]);
        if (error) throw error;
        
        // 2. Recalculate Average & Count (Not strictly needed with the dynamic mapper, but good for data integrity)
        const { data: reviews } = await supabase.from('reviews').select('rating').eq('business_id', businessId);
        if (reviews) {
            const count = reviews.length;
            const total = reviews.reduce((acc, r) => acc + r.rating, 0);
            const avg = count > 0 ? Number((total / count).toFixed(1)) : 0;
            
            await supabase.from('businesses').update({ rating: avg, reviews_count: count }).eq('id', businessId);
        }

        await this.incrementXP(5);
    }
  },

  async getComments(newsId: string): Promise<Comment[]> {
    if (isSupabaseConfigured() && supabase) {
        // Fetch ALL comments for this news item without ordering by column that might be missing
        const { data } = await supabase.from('comments').select('*').eq('news_id', newsId);
        if (!data) return [];

        const comments: Comment[] = [];
        for (const c of data) {
            let authorName = c.author_name;
            let authorAvatar = '';
            if (c.author_id) {
                const { data: profile } = await supabase.from('profiles').select('name, avatar').eq('id', c.author_id).maybeSingle();
                if (profile) {
                    authorName = profile.name;
                    authorAvatar = profile.avatar;
                }
            }
            // Use created_at for time display if available, else fallback to date string
            const displayDate = c.created_at 
                ? new Date(c.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : c.date;

            comments.push({ 
                id: c.id, 
                newsId: c.news_id, 
                authorName: authorName || 'Гость', 
                authorAvatar,
                text: c.text, 
                date: displayDate
            });
        }
        
        // Sort in memory (Oldest -> Newest)
        // Try to sort by ID (usually sequential) or fall back to date string
        return comments.sort((a, b) => {
            // If ids are numeric or sequential strings
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        });
    }
    return [];
  },

  async addComment(newsId: string, text: string) {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Войдите, чтобы комментировать");
        
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        const name = profile?.name || user.email;

        // Save with full timestamp for consistency
        const dateStr = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const { error } = await supabase.from('comments').insert([{ news_id: newsId, author_id: user.id, author_name: name, text, date: dateStr }]);
        if (error) throw error;
        await this.incrementXP(2); 
    }
  },

  async getLostFoundItems(type?: 'lost' | 'found'): Promise<LostFoundItem[]> {
      if (isSupabaseConfigured() && supabase) {
          let query = supabase.from('lost_found').select('*').order('date', { ascending: false });
          if (type && type !== undefined) query = query.eq('type', type);
          const { data } = await query;
          if (data) return data.map(mapLostFoundFromDB);
      }
      return [];
  },

  async createLostFoundItem(item: Partial<LostFoundItem>) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Нужно войти");
          const dbPayload = { type: item.type, title: item.title, description: item.description, image: item.image || 'https://picsum.photos/seed/lost/400/300', location: item.location, date: new Date().toLocaleDateString('ru-RU'), contact_name: item.contactName, contact_phone: item.contactPhone, is_resolved: false, author_id: user.id };
          const { error } = await supabase.from('lost_found').insert([dbPayload]);
          if (error) throw error;
          await this.incrementXP(10); 
      }
  },

  async resolveLostFoundItem(id: string) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('lost_found').update({ is_resolved: true }).eq('id', id);
          if (error) throw error;
      }
  },

  async getAppeals(): Promise<Appeal[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('appeals').select('*').order('created_at', { ascending: false });
          if (data) return data.map(mapAppealFromDB);
      }
      return [];
  },

  async createAppeal(appeal: Partial<Appeal>) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Нужно войти");
          const dbPayload = { title: appeal.title, description: appeal.description, image: appeal.image || 'https://picsum.photos/seed/appeal/400/300', location: appeal.location, author_id: user.id, status: 'new' };
          const { error } = await supabase.from('appeals').insert([dbPayload]);
          if (error) throw error;
          await this.incrementXP(25);
      }
  },

  async resolveAppeal(id: string, resultImage: string) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('appeals').update({ status: 'done', result_image: resultImage }).eq('id', id);
          if (error) throw error;
      }
  },

  async getRides(from?: string, to?: string): Promise<Ride[]> {
      if (isSupabaseConfigured() && supabase) {
          let query = supabase.from('rides').select('*').order('created_at', { ascending: false });
          if (from) query = query.ilike('from_city', `%${from}%`);
          if (to) query = query.ilike('to_city', `%${to}%`);
          const { data } = await query;
          if (!data) return [];
          const rides: Ride[] = [];
          for (const r of data) {
              const { data: driver } = await supabase.from('profiles').select('name, avatar').eq('id', r.driver_id).maybeSingle();
              rides.push(mapRideFromDB(r, driver));
          }
          return rides;
      }
      return [];
  },

  async createRide(ride: Partial<Ride>) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Нужно войти");
          const dbPayload = { from_city: ride.fromCity, to_city: ride.toCity, date: ride.date, time: ride.time, price: ride.price, seats: ride.seats, car_model: ride.carModel, driver_id: user.id };
          const { error } = await supabase.from('rides').insert([dbPayload]);
          if (error) throw error;
          await this.incrementXP(20);
      }
  },

  async bookRide(rideId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Нужно войти");
          const { data: ride } = await supabase.from('rides').select('seats, passengers').eq('id', rideId).single();
          if (!ride) throw new Error("Поездка не найдена");
          if (ride.seats <= 0) throw new Error("Нет мест");
          const passengers = ride.passengers || [];
          if (passengers.includes(user.id)) throw new Error("Вы уже записаны");
          const { error } = await supabase.from('rides').update({ seats: ride.seats - 1, passengers: [...passengers, user.id] }).eq('id', rideId);
          if (error) throw error;
      }
  },

  async getVacancies(): Promise<Vacancy[]> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('vacancies').select('*').order('created_at', { ascending: false });
        if (data) return data.map(mapVacancyFromDB);
    }
    return [];
  },

  async getResumes(): Promise<Resume[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
          if (data) return data.map(mapResumeFromDB);
      }
      return [];
  },

  async createVacancy(v: Partial<Vacancy>) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Нужно войти");
          const dbPayload = { title: v.title, salary_min: v.salaryMin, salary_max: v.salaryMax, company_name: v.companyName, description: v.description, contact_phone: v.contactPhone, schedule: v.schedule, author_id: user.id };
          const { error } = await supabase.from('vacancies').insert([dbPayload]);
          if (error) throw error;
          await this.incrementXP(25);
      }
  },

  async createResume(r: Partial<Resume>) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Нужно войти");
          const dbPayload = { name: r.name, profession: r.profession, salary_expectation: r.salaryExpectation, experience: r.experience, about: r.about, phone: r.phone, author_id: user.id };
          const { error } = await supabase.from('resumes').insert([dbPayload]);
          if (error) throw error;
          await this.incrementXP(25);
      }
  },

  async getCoupons(): Promise<Coupon[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('coupons').select('*').order('price', { ascending: true });
          if (data) return data.map((c: any) => ({ id: c.id, title: c.title, description: c.description, price: c.price, image: c.image, partnerName: c.partner_name }));
      }
      return [];
  },

  async getMyCoupons(): Promise<UserCoupon[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('user_coupons').select('*, coupons(*)').eq('user_id', user.id).order('created_at', { ascending: false });
          if (data) return data.map((uc: any) => ({ id: uc.id, couponId: uc.coupon_id, couponTitle: uc.coupons.title, couponImage: uc.coupons.image, code: uc.code, isUsed: uc.is_used }));
      }
      return [];
  },

  async buyCoupon(couponId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Нужно войти");
          const { data: coupon } = await supabase.from('coupons').select('price, promo_code_mask').eq('id', couponId).single();
          if (!coupon) throw new Error("Купон не найден");
          const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
          if (!profile) throw new Error("Профиль не найден");
          if (profile.xp < coupon.price) throw new Error(`Недостаточно XP. Нужно ${coupon.price}, у вас ${profile.xp}`);
          const code = (coupon.promo_code_mask || 'CODE-XXXX').replace('XXXX', Math.floor(1000 + Math.random() * 9000).toString());
          const { error: xpError } = await supabase.from('profiles').update({ xp: profile.xp - coupon.price }).eq('id', user.id);
          if (xpError) throw xpError;
          const { error: buyError } = await supabase.from('user_coupons').insert({ user_id: user.id, coupon_id: couponId, code: code });
          if (buyError) { await supabase.from('profiles').update({ xp: profile.xp }).eq('id', user.id); throw buyError; }
      }
  },

  async getStories(): Promise<Story[]> {
      if (isSupabaseConfigured() && supabase) {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data } = await supabase.from('stories').select('*').gt('created_at', yesterday).order('created_at', { ascending: true });
          if (!data) return [];
          const stories: Story[] = [];
          for (const s of data) {
              const { data: profile } = await supabase.from('profiles').select('name, avatar').eq('id', s.author_id).maybeSingle();
              stories.push({ 
                  id: s.id, 
                  authorId: s.author_id, 
                  media: s.media, 
                  caption: s.caption, 
                  createdAt: s.created_at, 
                  authorName: profile?.name || 'User', 
                  authorAvatar: profile?.avatar || '',
                  viewers: [ // Mock Viewers
                      { name: 'Алексей Иванов', avatar: 'https://i.pravatar.cc/150?u=a' },
                      { name: 'Мария Смирнова', avatar: 'https://i.pravatar.cc/150?u=b' },
                      { name: 'Дмитрий Козлов', avatar: 'https://i.pravatar.cc/150?u=c' },
                  ]
              });
          }
          return stories;
      }
      return [];
  },

  async createStory(media: string, caption: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Нужно войти");
          const { error } = await supabase.from('stories').insert({ author_id: user.id, media, caption });
          if (error) throw error;
          await this.incrementXP(5);
      }
  },

  async getCommunities(): Promise<Community[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          const { data } = await supabase.from('communities').select('*').order('members_count', { ascending: false });
          if (!data) return [];
          const communities: Community[] = [];
          for (const c of data) {
              let isMember = false;
              if (user) {
                  const { data: member } = await supabase.from('community_members').select('id').eq('community_id', c.id).eq('user_id', user.id).maybeSingle();
                  isMember = !!member;
              }
              communities.push({ id: c.id, name: c.name, description: c.description, image: c.image, membersCount: c.members_count, isMember });
          }
          return communities;
      }
      return [];
  },

  async joinCommunity(communityId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите, чтобы вступить");
          const { error } = await supabase.from('community_members').insert({ community_id: communityId, user_id: user.id });
          if (error) throw error;
          const { data } = await supabase.from('communities').select('members_count').eq('id', communityId).single();
          await supabase.from('communities').update({ members_count: (data?.members_count || 0) + 1 }).eq('id', communityId);
          await this.incrementXP(5);
      }
  },

  async leaveCommunity(communityId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          await supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', user.id);
          const { data } = await supabase.from('communities').select('members_count').eq('id', communityId).single();
          await supabase.from('communities').update({ members_count: Math.max(0, (data?.members_count || 1) - 1) }).eq('id', communityId);
      }
  },

  async getCommunityPosts(communityId: string): Promise<CommunityPost[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('community_posts').select('*').eq('community_id', communityId).order('created_at', { ascending: false });
          if (!data) return [];
          const posts: CommunityPost[] = [];
          for (const p of data) {
              const { data: profile } = await supabase.from('profiles').select('name, avatar').eq('id', p.author_id).maybeSingle();
              posts.push({ id: p.id, communityId: p.community_id, authorId: p.author_id, content: p.content, image: p.image, likes: p.likes, createdAt: p.created_at, authorName: profile?.name || 'Участник', authorAvatar: profile?.avatar || '' });
          }
          return posts;
      }
      return [];
  },

  async createCommunityPost(communityId: string, content: string, image?: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите, чтобы писать");
          const { error } = await supabase.from('community_posts').insert({ community_id: communityId, author_id: user.id, content, image });
          if (error) throw error;
          await this.incrementXP(2);
      }
  },

  async getQuests(): Promise<Quest[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: quests } = await supabase.from('quests').select('*');
          if (!quests) return [];
          const { data: { user } } = await supabase.auth.getUser();
          const mapped: Quest[] = [];
          for (const q of quests) {
              let isCompleted = false;
              if (user) {
                  const { data: completed } = await supabase.from('user_quests').select('id').eq('quest_id', q.id).eq('user_id', user.id).maybeSingle();
                  isCompleted = !!completed;
              }
              mapped.push({ id: q.id, title: q.title, description: q.description, image: q.image, lat: q.lat, lng: q.lng, xpReward: q.xp_reward, isCompleted });
          }
          return mapped;
      }
      return [];
  },

  async completeQuest(questId: string, userLat: number, userLng: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите, чтобы пройти квест");
          const { data: quest } = await supabase.from('quests').select('*').eq('id', questId).single();
          if (!quest) throw new Error("Квест не найден");
          const dist = Math.sqrt(Math.pow(quest.lat - userLat, 2) + Math.pow(quest.lng - userLng, 2));
          if (dist > 0.003) throw new Error("Вы слишком далеко от цели! Подойдите ближе.");
          const { error } = await supabase.from('user_quests').insert({ user_id: user.id, quest_id: questId });
          if (error) { if (error.code === '23505') throw new Error("Вы уже прошли этот квест"); throw error; }
          await this.incrementXP(quest.xp_reward || 100);
          return quest.xp_reward || 100;
      }
  },

  async createOrder(businessId: string, items: {productName: string, price: number, quantity: number}[], address: string, totalPrice: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите для заказа");
          
          await supabase.from('transactions').insert({ sender_id: user.id, amount: totalPrice, type: 'purchase', description: `Заказ товаров (${items.length} поз.)` });

          const { data: order, error } = await supabase.from('orders').insert({ user_id: user.id, business_id: businessId, total_price: totalPrice, address: address, status: 'new' }).select().single();
          if (error) throw error;
          const orderItems = items.map(item => ({ order_id: order.id, product_name: item.productName, price: item.price, quantity: item.quantity }));
          const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
          if (itemsError) throw itemsError;
          await this.incrementXP(15);
      }
  },

  async getMyOrders(): Promise<Order[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('orders').select('*, businesses(name)').eq('user_id', user.id).order('created_at', { ascending: false });
          if (!data) return [];
          return data.map((o: any) => ({ id: o.id, userId: o.user_id, businessId: o.business_id, status: o.status, totalPrice: o.total_price, address: o.address, businessName: o.businesses?.name, createdAt: o.created_at, courierId: o.courier_id }));
      }
      return [];
  },

  async getDeliveryOrders(): Promise<Order[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('orders')
            .select('*, businesses(name, address)')
            .is('courier_id', null)
            .neq('status', 'done')
            .order('created_at', { ascending: false });
            
          if (!data) return [];
          return data.map((o: any) => ({
              id: o.id,
              userId: o.user_id,
              businessId: o.business_id,
              status: o.status,
              totalPrice: o.total_price,
              address: o.address,
              businessName: o.businesses?.name,
              businessAddress: o.businesses?.address,
              createdAt: o.created_at,
              deliveryFee: o.delivery_fee || 150
          }));
      }
      return [];
  },

  async getMyDeliveries(): Promise<Order[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('orders')
            .select('*, businesses(name, address)')
            .eq('courier_id', user.id)
            .order('created_at', { ascending: false });
            
          if (!data) return [];
          return data.map((o: any) => ({
              id: o.id,
              userId: o.user_id,
              businessId: o.business_id,
              status: o.status,
              totalPrice: o.total_price,
              address: o.address,
              businessName: o.businesses?.name,
              businessAddress: o.businesses?.address,
              createdAt: o.created_at,
              deliveryFee: o.delivery_fee || 150
          }));
      }
      return [];
  },

  async takeDelivery(orderId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите");
          const { error } = await supabase.from('orders').update({ courier_id: user.id, status: 'delivery' }).eq('id', orderId);
          if (error) throw error;
      }
  },

  async completeDelivery(orderId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите");
          
          const { data: order } = await supabase.from('orders').select('delivery_fee').eq('id', orderId).single();
          const fee = order?.delivery_fee || 150;

          const { error } = await supabase.from('orders').update({ status: 'done' }).eq('id', orderId);
          if (error) throw error;

          const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
          const newBalance = (profile?.balance || 0) + fee;
          await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
          
          await supabase.from('transactions').insert({ 
              receiver_id: user.id, 
              amount: fee, 
              type: 'earning', 
              description: `Оплата за доставку заказа #${orderId.slice(0,4)}` 
          });
          
          await this.incrementXP(50);
      }
  },

  async getTransactions(): Promise<Transaction[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('transactions')
            .select('*')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false });
          
          if (!data) return [];
          return data.map((t: any) => ({
              id: t.id,
              senderId: t.sender_id,
              receiverId: t.receiver_id,
              amount: t.amount,
              type: t.type,
              description: t.description,
              createdAt: t.created_at,
              isIncoming: t.receiver_id === user.id
          }));
      }
      return [];
  },

  async topUpWallet(amount: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите");
          const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
          const newBalance = (profile?.balance || 0) + amount;
          
          await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
          await supabase.from('transactions').insert({ receiver_id: user.id, amount: amount, type: 'topup', description: 'Пополнение кошелька' });
      }
  },

  async transferMoney(emailOrPhone: string, amount: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите");
          
          const { data: receiver } = await supabase.from('profiles')
            .select('id, balance')
            .or(`email.eq.${emailOrPhone},phone.eq.${emailOrPhone}`)
            .maybeSingle();
            
          if (!receiver) throw new Error("Пользователь не найден");
          if (receiver.id === user.id) throw new Error("Нельзя перевести себе");

          const { data: sender } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
          if ((sender?.balance || 0) < amount) throw new Error("Недостаточно средств");

          const newSenderBalance = (sender?.balance || 0) - amount;
          const newReceiverBalance = (receiver.balance || 0) + amount;

          await supabase.from('profiles').update({ balance: newSenderBalance }).eq('id', user.id);
          await supabase.from('profiles').update({ balance: newReceiverBalance }).eq('id', receiver.id);
          
          await supabase.from('transactions').insert({ 
              sender_id: user.id, 
              receiver_id: receiver.id, 
              amount: amount, 
              type: 'transfer', 
              description: `Перевод пользователю` 
          });
      }
  },

  async submitMeterReading(type: 'hot_water' | 'cold_water' | 'electricity', value: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите");
          const { error } = await supabase.from('meter_readings').insert({ 
              user_id: user.id, 
              type, 
              value, 
              date: new Date().toISOString().slice(0, 7) // '2024-05'
          });
          if (error) throw error;
          await this.incrementXP(5);
      }
  },

  async getUtilityBills(): Promise<UtilityBill[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('utility_bills').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (!data) return [];
          return data.map((b: any) => ({
              id: b.id,
              userId: b.user_id,
              serviceName: b.service_name,
              amount: b.amount,
              period: b.period,
              isPaid: b.is_paid,
              createdAt: b.created_at
          }));
      }
      return [];
  },

  async payUtilityBill(billId: string, amount: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите");
          
          const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
          if ((profile?.balance || 0) < amount) throw new Error("Недостаточно средств на кошельке");

          const { error } = await supabase.from('utility_bills').update({ is_paid: true }).eq('id', billId);
          if (error) throw error;

          const newBalance = (profile?.balance || 0) - amount;
          await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
          
          await supabase.from('transactions').insert({ 
              sender_id: user.id, 
              amount: amount, 
              type: 'bill_payment', 
              description: `Оплата ЖКУ` 
          });
          await this.incrementXP(10);
      }
  },

  async getCampaigns(): Promise<Campaign[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('campaigns').select('*').eq('is_active', true).order('created_at', { ascending: false });
          if (data) return data.map((c: any) => ({
              id: c.id,
              title: c.title,
              description: c.description,
              targetAmount: c.target_amount,
              collectedAmount: c.collected_amount,
              image: c.image,
              organizerName: c.organizer_name
          }));
      }
      return [];
  },

  async donateToCampaign(campaignId: string, amount: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите для пожертвования");
          
          const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
          if ((profile?.balance || 0) < amount) throw new Error("Недостаточно средств");

          const newBalance = (profile?.balance || 0) - amount;
          await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);

          const { data: campaign } = await supabase.from('campaigns').select('collected_amount').eq('id', campaignId).single();
          const newCollected = (campaign?.collected_amount || 0) + amount;
          await supabase.from('campaigns').update({ collected_amount: newCollected }).eq('id', campaignId);

          await supabase.from('campaign_donations').insert({ campaign_id: campaignId, user_id: user.id, amount });

          await supabase.from('transactions').insert({ 
              sender_id: user.id, 
              amount: amount, 
              type: 'donation', 
              description: `Пожертвование на благотворительность` 
          });
          
          await this.incrementXP(amount > 500 ? 50 : 10);
      }
  },

  async getRentals(): Promise<RentalItem[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('rentals').select('*').eq('is_available', true).order('created_at', { ascending: false });
          if (data) return data.map(mapRentalFromDB);
      }
      return [];
  },

  async createRental(rental: Partial<RentalItem>) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите");
          const dbPayload = { 
              title: rental.title, description: rental.description, image: rental.image || 'https://picsum.photos/seed/tool/400/300',
              price_per_day: rental.pricePerDay, deposit: rental.deposit, category: rental.category,
              author_id: user.id, is_available: true
          };
          const { error } = await supabase.from('rentals').insert(dbPayload);
          if (error) throw error;
          await this.incrementXP(20);
      }
  },

  async getMyRentals(): Promise<RentalBooking[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('rental_bookings').select('*, rentals(title, image, deposit)').eq('renter_id', user.id).eq('status', 'active');
          if (data) return data.map((b: any) => ({
              id: b.id, rentalId: b.rental_id, renterId: b.renter_id, startDate: b.start_date, endDate: b.end_date, totalPrice: b.total_price, status: b.status,
              rentalTitle: b.rentals?.title, rentalImage: b.rentals?.image, deposit: b.rentals?.deposit
          }));
      }
      return [];
  },

  async bookRental(rentalId: string, startDate: string, endDate: string, totalPrice: number, deposit: number) {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Войдите");
          
          const fullAmount = totalPrice + deposit;
          const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
          if ((profile?.balance || 0) < fullAmount) throw new Error("Недостаточно средств (Цена + Залог)");

          const newBalance = (profile?.balance || 0) - fullAmount;
          await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);

          const { error } = await supabase.from('rental_bookings').insert({
              rental_id: rentalId, renter_id: user.id, start_date: startDate, end_date: endDate, total_price: totalPrice, status: 'active'
          });
          if (error) throw error;

          await supabase.from('rentals').update({ is_available: false }).eq('id', rentalId);

          await supabase.from('transactions').insert({ sender_id: user.id, amount: totalPrice, type: 'purchase', description: 'Аренда вещи' });
          await supabase.from('transactions').insert({ sender_id: user.id, amount: deposit, type: 'rental_deposit', description: 'Залог за аренду' });
      }
  },

  async returnRental(bookingId: string) {
      if (isSupabaseConfigured() && supabase) {
          const { data: booking } = await supabase.from('rental_bookings').select('*, rentals(deposit)').eq('id', bookingId).single();
          if (!booking) throw new Error("Бронь не найдена");
          
          const deposit = booking.rentals.deposit;
          const { data: profile } = await supabase.from('profiles').select('balance').eq('id', booking.renter_id).single();
          
          await supabase.from('profiles').update({ balance: (profile?.balance || 0) + deposit }).eq('id', booking.renter_id);
          
          await supabase.from('rental_bookings').update({ status: 'returned' }).eq('id', bookingId);
          await supabase.from('rentals').update({ is_available: true }).eq('id', booking.rental_id);

          await supabase.from('transactions').insert({ receiver_id: booking.renter_id, amount: deposit, type: 'rental_refund', description: 'Возврат залога за аренду' });
      }
  },

  async getMyBusiness(): Promise<Business | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return null;
          const { data } = await supabase.from('businesses').select('*').eq('author_id', user.id).order('id', {ascending: false}).limit(1).maybeSingle();
          if (data) return mapBusinessFromDB(data);
      }
      return null;
  },

  async getMyBusinesses(): Promise<Business[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];
          const { data } = await supabase.from('businesses').select('*').eq('author_id', user.id).order('id', {ascending: false});
          if (data) return data.map((b: any) => mapBusinessFromDB(b));
      }
      return [];
  },

  async getBusinessOrders(businessId: string): Promise<Order[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('orders').select('*, order_items(*)').eq('business_id', businessId).order('created_at', { ascending: false });
          if (!data) return [];
          return data.map((o: any) => ({
              id: o.id,
              userId: o.user_id,
              businessId: o.business_id,
              status: o.status,
              totalPrice: o.total_price,
              address: o.address,
              createdAt: o.created_at,
              items: o.order_items?.map((i: any) => ({ productName: i.product_name, price: i.price, quantity: i.quantity }))
          }));
      }
      return [];
  },

  async updateOrderStatus(orderId: string, status: string) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
          if (error) throw error;
      }
  },

  async getBusinessBookings(businessId: string): Promise<Booking[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('bookings').select('*, business_services(title), profiles(name, phone)').eq('business_id', businessId).order('date', {ascending: true});
          if (!data) return [];
          return data.map((b: any) => ({
              id: b.id,
              serviceId: b.service_id,
              businessId: b.business_id,
              userId: b.user_id,
              date: b.date,
              time: b.time,
              status: b.status,
              serviceTitle: b.business_services?.title,
              businessName: `${b.profiles?.name} (${b.profiles?.phone || 'Нет тел.'})`
          }));
      }
      return [];
  },

  async validateTicket(qrCode: string): Promise<{valid: boolean, ticket?: Ticket, msg?: string}> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('tickets').select('*, events(title)').eq('qr_code', qrCode).maybeSingle();
          if (!data) return { valid: false, msg: 'Билет не найден' };
          return { valid: true, ticket: {
              id: data.id,
              eventId: data.event_id,
              userId: data.user_id,
              row: data.row_idx,
              col: data.col_idx,
              price: data.price,
              qrCode: data.qr_code,
              eventTitle: data.events?.title
          }};
      }
      return { valid: false, msg: 'Ошибка базы данных' };
  },

  async getSmartDevices(): Promise<SmartDevice[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          const uid = user ? user.id : 'anon';
          
          const { data } = await supabase.from('smart_devices')
            .select('*')
            .or(`is_private.eq.false,owner_id.eq.${uid}`);
            
          if (data) return data.map((d: any) => ({
              id: d.id, type: d.type, name: d.name, imageUrl: d.image_url, location: d.location, isPrivate: d.is_private, status: d.status
          }));
      }
      return [];
  },

  async controlDevice(deviceId: string, action: 'open') {
      if (isSupabaseConfigured() && supabase) {
          await delay(1000);
          return true;
      }
      return false;
  }
};
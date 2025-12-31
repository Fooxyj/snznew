
import { 
  User, Ad, Business, NewsItem, Notification, Event, 
  Ticket, Review, Comment, Conversation, Message, 
  Poll, LostFoundItem, Appeal, Ride, Vacancy, Resume, 
  Coupon, UserCoupon, CommunityPost, 
  Quest, Order, Product, Service, Booking, RentalItem, 
  RentalBooking, SmartDevice, Transaction, UtilityBill, 
  Campaign, UserRole, StoryConfig, Employee, AnalyticsData, Table, Report, Suggestion, AccessRequest, TransportSchedule, Story, Community, Banner, PromoAd, ExclusivePage 
} from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { businessService } from './businessService';
import { socialService } from './socialService';
import { cityService } from './cityService';
import { mockStore } from './mockData';

const formatRelativeDate = (dateStr: string | null): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return 'Недавно';
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Недавно';
    const now = new Date();
    const isToday = now.getDate() === date.getDate() && now.getMonth() === date.getMonth() && now.getFullYear() === date.getFullYear();
    if (isToday) return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const mapAdFromDB = (a: any, profileData?: any): Ad => {
    const profile = Array.isArray(profileData) ? profileData[0] : profileData;
    let numericPrice = 0;
    if (typeof a.price === 'number') numericPrice = a.price;
    else if (typeof a.price === 'string') {
        numericPrice = parseFloat(a.price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }

    return {
        id: a.id || Math.random().toString(),
        title: a.title || 'Без названия',
        price: numericPrice,
        currency: a.currency || '₽',
        category: a.category || 'Прочее',
        image: a.image || 'https://via.placeholder.com/400x300?text=No+Image',
        images: a.images || (a.image ? [a.image] : []),
        date: formatRelativeDate(a.date || a.created_at),
        authorId: a.author_id,
        authorName: profile?.name || 'Житель Снежинска',
        authorAvatar: profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}`,
        description: a.description || '',
        location: a.location || 'Снежинск',
        isVip: a.is_vip === true || a.isVip === true,
        isPremium: a.is_premium === true || a.isPremium === true,
        status: a.status || 'approved',
        authorLastSeen: profile?.last_seen
    };
};

export const api = {
  supabase,
  ...authService,
  ...businessService,
  ...socialService,
  ...cityService,

  async getExclusivePages(): Promise<ExclusivePage[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.from('exclusive_pages').select('*').eq('is_active', true).order('idx', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Supabase getExclusivePages error:", e);
            return [];
        }
    }
    return [];
  },

  async createExclusivePage(data: Partial<ExclusivePage>) {
    if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('exclusive_pages').insert(data);
        if (error) throw error;
    }
  },

  async deleteExclusivePage(id: string) {
    if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('exclusive_pages').delete().eq('id', id);
        if (error) throw error;
    }
  },

  async getPromoAds(): Promise<PromoAd[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.from('promo_ads').select('*').eq('is_active', true).order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Supabase getPromoAds error:", e);
            return [];
        }
    }
    return [];
  },

  async createPromoAd(data: Partial<PromoAd>) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('promo_ads').insert(data);
          if (error) throw error;
      }
  },

  async updatePromoAd(id: string, data: Partial<PromoAd>) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('promo_ads').update(data).eq('id', id);
          if (error) throw error;
      }
  },

  async updateEntity(table: string, id: string, data: any) {
      if (isSupabaseConfigured() && supabase) await supabase.from(table).update(data).eq('id', id);
  },

  async deleteEntity(table: string, id: string) {
      if (isSupabaseConfigured() && supabase) await supabase.from(table).delete().eq('id', id);
  },

  async getAdminReports(): Promise<Report[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      try {
          const { data: reports, error } = await supabase.from('reports').select('*').neq('target_type', 'access_request').order('created_at', { ascending: false });
          if (error) throw error;
          if (!reports) return [];

          const userIds = [...new Set(reports.map(r => r.user_id).filter(Boolean))];
          const { data: profs } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
          const profMap = new Map<string, any>(profs?.map(p => [p.id, p]) || []);

          return reports.map(r => ({
              id: r.id,
              userId: r.user_id,
              userName: profMap.get(r.user_id)?.name || 'Житель Снежинска',
              userAvatar: profMap.get(r.user_id)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profMap.get(r.user_id)?.name || 'U')}`,
              targetId: r.target_id,
              targetType: r.target_type,
              reason: r.reason,
              status: r.status,
              createdAt: r.created_at || r.date || new Date().toISOString()
          }));
      } catch (e: any) {
          return [];
      }
  },

  async getAdminSuggestions(): Promise<Suggestion[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      try {
          const { data: ideas, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (!ideas) return [];

          const userIds = [...new Set(ideas.map(i => i.user_id).filter(Boolean))];
          const { data: profs } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
          const profMap = new Map<string, any>(profs?.map(p => [p.id, p]) || []);

          return ideas.map(i => ({
              id: i.id,
              userId: i.user_id,
              userName: profMap.get(i.user_id)?.name || 'Житель Снежинска',
              userAvatar: profMap.get(i.user_id)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profMap.get(i.user_id)?.name || 'U')}`,
              text: i.text,
              createdAt: i.created_at || i.date || new Date().toISOString(),
              isRead: !!i.is_read
          }));
      } catch (e: any) {
          return [];
      }
  },

  async getAds(category?: string): Promise<Ad[]> {
    if (!isSupabaseConfigured() || !supabase) return mockStore.ads;
    try {
        let query = supabase.from('ads').select('*');
        if (category && category !== 'Все') query = query.eq('category', category);
        const { data: adsData, error: adsError } = await query;
        if (adsError || !adsData) throw adsError;

        const authorIds = [...new Set(adsData.map(ad => ad.author_id).filter(Boolean))];
        let profMap = new Map<string, any>();
        if (authorIds.length > 0) {
            const { data: profs } = await supabase.from('profiles').select('*').in('id', authorIds);
            if (profs) profs.forEach(p => profMap.set(p.id, p));
        }
        return adsData.map(ad => mapAdFromDB(ad, profMap.get(ad.author_id))).sort((a, b) => {
            if (a.isVip && !b.isVip) return -1;
            if (!a.isVip && b.isVip) return 1;
            if (a.isPremium && !b.isPremium) return -1;
            if (!a.isPremium && b.isPremium) return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    } catch (e: any) { 
        console.error("Ads fetch failed, using mocks:", e);
        return mockStore.ads; 
    }
  },

  async getAdById(id: string): Promise<Ad | null> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data: ad } = await supabase.from('ads').select('*').eq('id', id).maybeSingle();
            if (ad) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', ad.author_id).maybeSingle();
                return mapAdFromDB(ad, profile);
            }
        } catch (e: any) {
            console.error("Ad Detail fetch failed:", e);
        }
    }
    return mockStore.ads.find(a => a.id === id) || null;
  },

  async getAllPendingContent(): Promise<any[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      const tables = ['ads', 'rides', 'vacancies', 'resumes', 'lost_found', 'communities', 'stories'];
      try {
          const results = await Promise.all(tables.map(async (t) => {
              const { data } = await supabase.from(t).select('*').eq('status', 'pending');
              return (data || []).map(item => ({ ...item, _table: t }));
          }));
          const flattened = results.flat();
          if (flattened.length === 0) return [];

          const authorIds = [...new Set(flattened.map((it: any) => it.author_id || it.driver_id || it.user_id).filter(Boolean))];
          const { data: profs } = await supabase.from('profiles').select('id, name').in('id', authorIds);
          const profMap = new Map(profs?.map(p => [p.id, p.name]) || []);

          return flattened.map(it => ({
              ...it,
              authorName: profMap.get(it.author_id || it.driver_id || it.user_id) || 'Пользователь',
              displayTitle: it.title || it.name || it.caption || `${it.from_city} → ${it.to_city}`,
              typeLabel: it._table === 'ads' ? 'Объявление' : it._table === 'rides' ? 'Поездка' : it._table === 'stories' ? 'История' : 'Контент'
          }));
      } catch (e) { return []; }
  },

  async createAd(data: any): Promise<Ad> {
    const user = await authService.getCurrentUser();
    if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
    const { data: saved, error } = await supabase.from('ads').insert({
      title: data.title, price: data.price, currency: data.currency, category: data.category, description: data.description,
      location: data.location, image: data.image, images: data.images, author_id: user.id, is_vip: data.is_vip, is_premium: data.is_premium,
      status: 'approved', date: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return mapAdFromDB(saved, user);
  },

  async updateAd(id: string, data: any): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('ads').update({
              title: data.title,
              price: data.price,
              category: data.category,
              description: data.description,
              location: data.location,
              image: data.image,
              images: data.images
          }).eq('id', id);
      }
  },

  async getUserContent(userId: string): Promise<{ ads: Ad[] }> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: adsData } = await supabase.from('ads').select('*').eq('author_id', userId);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        const mapped = (adsData || []).map(ad => mapAdFromDB(ad, profile)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { ads: mapped };
      } catch (e) {
        return { ads: mockStore.ads.filter(a => a.authorId === userId) };
      }
    }
    return { ads: mockStore.ads.filter(a => a.authorId === userId) };
  },

  async uploadImage(file: File): Promise<string> {
    if (isSupabaseConfigured() && supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        return data.publicUrl;
    }
    throw new Error("Supabase not configured");
  },

  async getBanners(position?: string): Promise<Banner[]> {
    const getFallback = () => position ? mockStore.banners.filter(b => b.position === position) : mockStore.banners;
    
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('banners').select('*').eq('is_active', true);
        
        if (position) {
            query = query.eq('position', position);
        }
        
        const { data, error } = await query.order('idx', { ascending: true });
        
        if (error) throw error;
        
        const banners = (data || []);
        if (banners.length === 0) return getFallback();
        return banners;
      } catch (error) {
          console.error("Supabase getBanners error (falling back to mocks):", error);
          return getFallback();
      }
    }
    return getFallback();
  },

  async createBanner(data: any) {
    if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('banners').insert({ 
            image_url: data.image_url,
            link_url: data.link_url,
            title: data.title,
            position: data.position,
            is_active: data.is_active,
            idx: data.idx || 0,
            created_at: new Date().toISOString() 
        });
        if (error) throw error;
    }
  },

  async updateBanner(id: string, data: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('banners').update({
            image_url: data.image_url,
            link_url: data.link_url,
            title: data.title,
            position: data.position,
            is_active: data.is_active,
            idx: data.idx
        }).eq('id', id);
        if (error) throw error;
    }
  },

  async approveContent(table: string, id: string) {
    if (isSupabaseConfigured() && supabase) {
      const finalStatus = table === 'stories' ? 'published' : 'approved';
      await supabase.from(table).update({ status: finalStatus }).eq('id', id);
    }
  },

  async rejectContent(table: string, id: string) {
    if (isSupabaseConfigured() && supabase) await supabase.from(table).update({ status: 'rejected' }).eq('id', id);
  },

  async getSystemStats() {
      if (isSupabaseConfigured() && supabase) {
        try {
            const [u, a, b, n] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('ads').select('id', { count: 'exact', head: true }),
                supabase.from('businesses').select('id', { count: 'exact', head: true }),
                supabase.from('news').select('id', { count: 'exact', head: true })
            ]);
            return { users: u.count || 0, ads: a.count || 0, businesses: b.count || 0, news: n.count || 0 };
        } catch (e) {
            return { users: mockStore.ads.length, ads: mockStore.ads.length, businesses: mockStore.businesses.length, news: mockStore.news.length };
        }
      }
      return { users: mockStore.ads.length, ads: mockStore.ads.length, businesses: mockStore.businesses.length, news: mockStore.news.length };
  },

  async globalSearch(query: string): Promise<{ ads: Ad[], businesses: Business[], news: NewsItem[] }> {
    const q = query.toLowerCase();
    const [ads, businesses, news] = await Promise.all([
        this.getAds(),
        this.getBusinesses(),
        this.getNews()
    ]);
    return {
        ads: ads.filter(ad => ad.title.toLowerCase().includes(q) || ad.description.toLowerCase().includes(q)),
        businesses: businesses.filter(b => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)),
        news: news.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    };
  },

  async getTransportSchedules(): Promise<TransportSchedule[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data } = await supabase.from('transport_schedules').select('*').order('created_at', { ascending: true });
            if (!data) return [];
            return (data || []).map((t: any) => ({
                id: t.id, type: t.type, routeNumber: t.route_number, title: t.title, schedule: t.schedule, workHours: t.work_hours, price: t.price ? parseFloat(t.price) : 0, phone: t.phone
            }));
        } catch (e) {
            return [];
        }
    }
    return [];
  },
};

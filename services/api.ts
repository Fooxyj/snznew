
import { 
  User, Ad, Business, NewsItem, Notification, Event, 
  Ticket, Review, Comment, Conversation, Message, 
  Poll, LostFoundItem, Appeal, Ride, Vacancy, Resume, 
  Coupon, UserCoupon, CommunityPost, 
  Quest, Order, Product, Service, Booking, RentalItem, 
  RentalBooking, SmartDevice, Transaction, UtilityBill, 
  Campaign, UserRole, StoryConfig, Employee, AnalyticsData, Table, Report, Suggestion, AccessRequest, TransportSchedule, Story, Community, Banner, PromoAd, ExclusivePage, ModerationLog 
} from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { businessService } from './businessService';
import { socialService } from './socialService';
import { cityService } from './cityService';
import { moderationService } from './moderationService';
import { mockStore } from './mockData';

export const api = {
  supabase,
  ...authService,
  ...businessService,
  ...socialService,
  ...cityService,
  ...moderationService,

  // Переопределяем методы создания для авто-модерации
  async createAd(data: any): Promise<Ad> {
      const { cleanedText: cleanTitle } = this.validateContent(data.title);
      const { cleanedText: cleanDesc } = this.validateContent(data.description);
      return businessService.createAd({ ...data, title: cleanTitle, description: cleanDesc });
  },

  async addComment(newsId: string, text: string) {
      const { cleanedText } = this.validateContent(text);
      return socialService.addComment(newsId, cleanedText);
  },

  async updateMessage(messageId: string, newText: string) {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('messages').update({ text: newText }).eq('id', messageId);
          if (error) throw error;
      } else {
          const msg = mockStore.messages.find(m => m.id === messageId);
          if (msg) msg.text = newText;
      }
  },

  async deleteEntity(table: string, id: string, reason: string = 'Удалено модератором') {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data: snapshot } = await supabase.from(table).select('*').eq('id', id).single();
              const { error } = await supabase.from(table).delete().eq('id', id);
              if (error) throw error;
              await this.logModerationAction({
                  targetId: id,
                  targetType: table,
                  action: 'deleted',
                  reason: reason,
                  contentSnapshot: snapshot
              });
          } catch (e: any) {
              console.error(`Delete entity from ${table} failed:`, e?.message || e);
          }
      }
  },

  async rejectContent(table: string, id: string, reason: string = 'Не соответствует правилам') {
      if (isSupabaseConfigured() && supabase) {
          const { data: snapshot } = await supabase.from(table).select('*').eq('id', id).single();
          await supabase.from(table).update({ status: 'rejected' }).eq('id', id);
          
          await this.logModerationAction({
              targetId: id,
              targetType: table,
              action: 'rejected',
              reason: reason,
              contentSnapshot: snapshot
          });
      }
  },
  
  async uploadImage(file: File): Promise<string> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { error } = await supabase.storage.from('images').upload(fileName, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
            return publicUrl;
        } catch (e: any) { console.error("Upload failed:", e); }
    }
    return URL.createObjectURL(file);
  },

  async getUserContent(uid: string): Promise<{ ads: Ad[] }> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('ads').select('*').eq('author_id', uid);
          return { 
              ads: data?.map(a => ({ 
                  ...a, 
                  id: a.id, 
                  authorId: a.author_id, 
                  title: a.title, 
                  price: a.price, 
                  category: a.category, 
                  image: a.image, 
                  date: a.created_at 
              })) || [] 
          };
      }
      return { ads: mockStore.ads.filter(a => a.authorId === uid) };
  },

  async globalSearch(q: string): Promise<{ ads: Ad[], businesses: Business[], news: NewsItem[] }> {
      if (isSupabaseConfigured() && supabase) {
          const [ads, biz, news] = await Promise.all([
              supabase.from('ads').select('*').ilike('title', `%${q}%`),
              supabase.from('businesses').select('*').ilike('name', `%${q}%`),
              supabase.from('news').select('*').ilike('title', `%${q}%`)
          ]);
          return {
              ads: (ads.data || []).map(a => ({ ...a, authorId: a.author_id })), 
              businesses: biz.data || [],
              news: news.data || []
          };
      }
      return { ads: [], businesses: [], news: [] };
  },

  async approveContent(table: string, id: string) {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from(table).update({ status: 'approved' }).eq('id', id);
      }
  },

  async getAllProfiles(query?: string): Promise<User[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      try {
          let q = supabase.from('profiles').select('*');
          if (query) q = q.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
          const { data, error } = await q.order('name', { ascending: true }).limit(50);
          if (error) throw error;
          return (data || []).map(p => ({ id: p.id, name: p.name, avatar: p.avatar, role: p.role as UserRole, xp: p.xp || 0, email: p.email || '', favorites: [] }));
      } catch (e: any) { return []; }
  },

  async getExclusivePages(): Promise<ExclusivePage[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.from('exclusive_pages').select('*').eq('is_active', true).order('idx', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (e: any) { return []; }
    }
    return [];
  },

  async getMiniSiteByBusiness(businessId: string): Promise<ExclusivePage | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
        const { data, error } = await supabase.from('exclusive_pages').select('*').eq('business_id', businessId).maybeSingle();
        if (error) throw error;
        return data;
    } catch (e: any) { return null; }
  },

  async saveMiniSite(businessId: string, pageData: Partial<ExclusivePage>) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
        const { data: existing } = await supabase.from('exclusive_pages').select('id').eq('business_id', businessId).maybeSingle();
        if (existing) await supabase.from('exclusive_pages').update(pageData).eq('id', existing.id);
        else await supabase.from('exclusive_pages').insert({ ...pageData, business_id: businessId, is_active: true, idx: 99 });
    } catch (e: any) { throw e; }
  },

  async createExclusivePage(data: Partial<ExclusivePage>) {
    if (isSupabaseConfigured() && supabase) await supabase.from('exclusive_pages').insert(data);
  },

  async deleteExclusivePage(id: string) {
    if (isSupabaseConfigured() && supabase) await supabase.from('exclusive_pages').delete().eq('id', id);
  },

  async getPromoAds(): Promise<PromoAd[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.from('promo_ads').select('*').eq('is_active', true).order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e: any) { return []; }
    }
    return [];
  },

  async createPromoAd(data: Partial<PromoAd>) {
      if (isSupabaseConfigured() && supabase) await supabase.from('promo_ads').insert(data);
  },

  async updatePromoAd(id: string, data: Partial<PromoAd>) {
      if (isSupabaseConfigured() && supabase) await supabase.from('promo_ads').update(data).eq('id', id);
  },

  async updateEntity(table: string, id: string, data: any) {
      if (isSupabaseConfigured() && supabase) await supabase.from(table).update(data).eq('id', id);
  },

  async getAdminReports(): Promise<Report[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      try {
          const { data: reports, error } = await supabase.from('reports').select('*').neq('target_type', 'access_request').order('created_at', { ascending: false });
          if (error) throw error;
          if (!reports) return [];
          const userIds = [...new Set(reports.map(r => r.user_id).filter(Boolean))];
          let profMap = new Map<string, any>();
          if (userIds.length > 0) {
              const { data: profs } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
              profMap = new Map<string, any>(profs?.map(p => [p.id, p]) || []);
          }
          return reports.map(r => ({ id: r.id, userId: r.user_id, userName: profMap.get(r.user_id)?.name || 'Житель', userAvatar: profMap.get(r.user_id)?.avatar || '', targetId: r.target_id, targetType: r.target_type, reason: r.reason, status: r.status, createdAt: r.created_at || new Date().toISOString() }));
      } catch (e: any) { return []; }
  },

  async getAdminSuggestions(): Promise<Suggestion[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      try {
          const { data: ideas, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (!ideas) return [];
          const userIds = [...new Set(ideas.map(i => i.user_id).filter(Boolean))];
          let profMap = new Map<string, any>();
          if (userIds.length > 0) {
              const { data: profs } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
              profMap = new Map<string, any>(profs?.map(p => [p.id, p]) || []);
          }
          return ideas.map(i => ({ id: i.id, userId: i.user_id, userName: profMap.get(i.user_id)?.name || 'Житель', userAvatar: profMap.get(i.user_id)?.avatar || '', text: i.text, createdAt: i.created_at || new Date().toISOString(), isRead: !!i.is_read }));
      } catch (e: any) { return []; }
  },

  async getAds(category?: string): Promise<Ad[]> {
    if (!isSupabaseConfigured() || !supabase) return mockStore.ads;
    try {
        let query = supabase.from('ads').select('*');
        if (category && category !== 'Все') query = query.eq('category', category);
        const { data: adsData, error: adsError } = await query;
        if (adsError || !adsData) throw adsError;
        return adsData.map(ad => ({ 
            ...ad, 
            authorId: ad.author_id, 
            date: ad.created_at || ad.date, 
            isVip: !!ad.is_vip, 
            isPremium: !!ad.is_premium 
        }));
    } catch (e: any) { return mockStore.ads; }
  },

  async getAdById(id: string): Promise<Ad | null> {
    return cityService.getAdById(id);
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

          // Собираем всех авторов для отображения имен и аватарок в модерации
          const userIds = [...new Set(flattened.map(it => it.author_id || it.driver_id || it.user_id).filter(Boolean))];
          let profileMap = new Map();
          if (userIds.length > 0) {
              const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
              profiles?.forEach(p => profileMap.set(p.id, p));
          }

          return flattened.map(it => {
              const authorId = it.author_id || it.driver_id || it.user_id;
              const authorProfile = profileMap.get(authorId);
              const authorName = authorProfile?.name || 'Неизвестно';
              const authorAvatar = authorProfile?.avatar || '';

              let displayTitle = it.title || it.name || it.caption || 'Без названия';
              let description = it.description || it.content || '';

              // Кастомная логика для Попутчиков (rides)
              if (it._table === 'rides') {
                  displayTitle = `${it.from_city} ➔ ${it.to_city}`;
                  description = `Дата: ${it.date} ${it.time}. Авто: ${it.car_model}. Водитель: ${authorName}`;
              } 
              // Кастомная логика для Бюро находок
              else if (it._table === 'lost_found') {
                  displayTitle = `[${it.type === 'lost' ? 'ПОТЕРЯ' : 'НАХОДКА'}] ${it.title}`;
                  description = `${it.description}. Автор: ${authorName}`;
              }
              // Для остальных добавляем имя автора в описание
              else {
                  description = `${description} (Автор: ${authorName})`;
              }

              return { 
                  ...it, 
                  displayTitle, 
                  description,
                  authorId,
                  authorName,
                  authorAvatar,
                  typeLabel: it._table 
              };
          });
      } catch (e: any) { 
          console.error("Pending content fetch error:", e);
          return []; 
      }
  },

  async getBanners(position?: string): Promise<Banner[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('banners').select('*').eq('is_active', true);
        if (position) query = query.eq('position', position);
        const { data } = await query.order('idx', { ascending: true });
        return data || [];
      } catch (error: any) { return mockStore.banners; }
    }
    return mockStore.banners;
  },
};

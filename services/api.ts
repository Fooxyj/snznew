
import { 
  User, Ad, Business, NewsItem, Notification, Event, 
  Ticket, Review, Comment, Conversation, Message, 
  Poll, LostFoundItem, Appeal, Ride, Vacancy, Resume, 
  Coupon, UserCoupon, CommunityPost, 
  Quest, Order, Product, Service, Booking, RentalItem, 
  RentalBooking, SmartDevice, Transaction, UtilityBill, 
  Campaign, UserRole, StoryConfig, Employee, AnalyticsData, Table, Report, Suggestion, AccessRequest, TransportSchedule, Story, Community, Banner, PromoAd, ExclusivePage, ModerationLog, Achievement 
} from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { businessService } from './businessService';
import { socialService } from './socialService';
import { cityService } from './cityService';
import { moderationService } from './moderationService';
import { mockStore } from './mockData';

// Вспомогательная функция для безопасного парсинга дат из БД
const parseSafeDate = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'Invalid Date' || dateStr === 'null') return new Date().toISOString();
    const normalized = dateStr.includes(' ') && !dateStr.includes('T') 
        ? dateStr.replace(' ', 'T') 
        : dateStr;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const mapBusinessFromDB = (b: any): Business => {
    return {
        ...b,
        rating: parseFloat(String(b.rating || 0)),
        reviewsCount: parseInt(String(b.reviews_count || 0)),
        workHours: b.work_hours || '',
        website: b.website || '', 
        authorId: b.author_id,
        coverImage: b.cover_image,
        canPostStories: b.can_post_stories,
        verificationStatus: b.verification_status || 'pending',
        isMaster: !!b.is_master,
        lat: parseFloat(String(b.lat || 0)),
        lng: parseFloat(String(b.lng || 0))
    };
};

const mapNewsItem = (n: any): NewsItem => ({
    ...n,
    views: parseInt(String(n.views || 0)),
    commentsCount: parseInt(String(n.comments_count || 0)),
    date: n.date || n.created_at || new Date().toISOString()
});

export const api = {
  supabase,
  ...authService,
  ...businessService,
  ...socialService,
  ...cityService,
  ...moderationService,

  async resetPassword(email: string) {
      if (!isSupabaseConfigured() || !supabase) throw new Error("Система не настроена");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/#/reset-password',
      });
      if (error) throw error;
      return true;
  },

  async updatePassword(password: string) {
      if (!isSupabaseConfigured() || !supabase) throw new Error("Система не настроена");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return true;
  },

  async getAchievements(): Promise<Achievement[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const ALL_ACHIEVEMENTS: Achievement[] = [
        { id: 'admin', name: 'Администратор', description: 'Особый статус управления городом', icon: 'admin', category: 'special', goal: 1, current: user.role === UserRole.ADMIN ? 1 : 0, isUnlocked: user.role === UserRole.ADMIN },
        { id: 'early_adopter', name: 'Старожил', description: 'С нами с самого основания Простора (2025)', icon: 'early_adopter', category: 'special', goal: 1, current: 1, isUnlocked: user.badges.includes('early_adopter') },
        { id: 'verified', name: 'Проверенный', description: 'Наберите 100 XP для подтверждения профиля', icon: 'verified', category: 'reputation', goal: 100, current: Math.min(user.xp, 100), isUnlocked: user.xp >= 100 },
        { id: 'quest_master', name: 'Мастер квестов', description: 'Завершите 10 любых квестов в городе', icon: 'quest_master', category: 'activity', goal: 10, current: user.badges.includes('quest_master') ? 10 : Math.floor(user.xp / 100), isUnlocked: user.badges.includes('quest_master') },
        { id: 'active_citizen', name: 'Голос города', description: 'Оставьте 5 предложений по улучшению Снежинска', icon: 'active_citizen', category: 'social', goal: 5, current: 2, isUnlocked: false },
        { id: 'generous_heart', name: 'Меценат', description: 'Помогите любому благотворительному сбору', icon: 'generous_heart', category: 'special', goal: 1, current: 0, isUnlocked: false },
        { id: 'social_star', name: 'Душа компании', description: 'Вступите в 5 городских сообществ', icon: 'social_star', category: 'social', goal: 5, current: 1, isUnlocked: false },
        { id: 'pro_seller', name: 'Топ-продавец', description: 'Разместите 10 объявлений на Маркете', icon: 'pro_seller', category: 'activity', goal: 10, current: 4, isUnlocked: false }
    ];

    return ALL_ACHIEVEMENTS;
  },

  async updateShowcasedBadges(badgeIds: string[]): Promise<void> {
      if (badgeIds.length > 3) throw new Error("Максимум 3 награды");
      const user = await this.getCurrentUser();
      if (!user) return;
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('profiles').update({ showcased_badges: badgeIds }).eq('id', user.id);
      }
  },

  async deleteMessage(messageId: string) {
      if (!messageId) return;
      try {
          if (isSupabaseConfigured() && supabase) {
              const { error } = await supabase.from('messages').delete().eq('id', messageId);
              if (error) throw error;
          } else {
              const idx = mockStore.messages.findIndex(m => m.id === messageId);
              if (idx !== -1) mockStore.messages.splice(idx, 1);
          }
      } catch (e: any) { throw e; }
  },

  async createAd(data: any): Promise<Ad> {
      return businessService.createAd(data);
  },

  async addComment(newsId: string, text: string) {
      return socialService.addComment(newsId, text);
  },

  async updateMessage(messageId: string, newText: string) {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('messages').update({ text: newText }).eq('id', messageId);
      }
  },

  async deleteEntity(table: string, id: string, reason: string = 'Удалено администратором') {
      if (isSupabaseConfigured() && supabase) {
          console.log(`API: DELETING entity. Table: ${table}, ID: ${id}`);
          const { data: snapshot } = await supabase!.from(table).select('*').eq('id', id).maybeSingle();
          const { error, count } = await supabase!.from(table).delete({ count: 'exact' }).eq('id', id);
          if (error) {
              console.error("API: Delete error details:", error);
              throw error;
          }
          if (count === 0) {
              console.warn("API: No rows were deleted. Check permissions or row existence.");
              throw new Error("Ошибка доступа (RLS): база не позволила удалить запись.");
          }
          await this.logModerationAction({ targetId: id, targetType: table, action: 'deleted', reason: reason, contentSnapshot: snapshot || { info: "Удалено" } });
          return true;
      }
      return false;
  },

  async rejectContent(table: string, id: string, reason: string = 'Не соответствует правилам') {
      if (isSupabaseConfigured() && supabase) {
          console.log(`API: REJECTING content. Table: ${table}, ID: ${id}`);
          
          if (table === 'reports') {
             await supabase.from('reports').update({ status: 'rejected' }).eq('id', id);
             return true;
          }

          const { data: snapshot } = await supabase!.from(table).select('*').eq('id', id).maybeSingle();
          const { data, error } = await supabase!.from(table)
              .update({ status: 'rejected' })
              .eq('id', id)
              .select();
          
          if (error) throw error;
          if (!data || data.length === 0) throw new Error(`Нет прав на отклонение в таблице ${table}`);
          
          await this.logModerationAction({ targetId: id, targetType: table, action: 'rejected', reason: reason, contentSnapshot: snapshot || { info: "Отклонено" } });
          return true;
      }
      return false;
  },
  
  async uploadImage(file: File): Promise<string> {
    if (isSupabaseConfigured() && supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from('images').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        return publicUrl;
    }
    return URL.createObjectURL(file);
  },

  async getUserContent(uid: string): Promise<{ ads: Ad[] }> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('ads').select('*').eq('author_id', uid);
          return { ads: data?.map(a => ({ ...a, id: a.id, authorId: a.author_id, title: a.title, price: a.price, category: a.category, image: a.image, date: a.created_at })) || [] };
      }
      return { ads: mockStore.ads.filter(a => a.authorId === uid) };
  },

  async globalSearch(q: string): Promise<{ ads: Ad[], businesses: Business[], news: NewsItem[] }> {
      if (isSupabaseConfigured() && supabase) {
          const searchPattern = `%${q}%`;
          
          const [adsRes, bizRes, newsRes] = await Promise.all([
              supabase.from('ads')
                .select('*')
                .or(`title.ilike.${searchPattern},description.ilike.${searchPattern},category.ilike.${searchPattern}`)
                .eq('status', 'approved')
                .limit(20),
              supabase.from('businesses')
                .select('*')
                .or(`name.ilike.${searchPattern},description.ilike.${searchPattern},category.ilike.${searchPattern}`)
                .limit(20),
              supabase.from('news')
                .select('*')
                .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
                .limit(20)
          ]);

          return { 
              ads: (adsRes.data || []).map(a => ({ ...a, authorId: a.author_id })), 
              businesses: (bizRes.data || []).map(mapBusinessFromDB), 
              news: (newsRes.data || []).map(mapNewsItem) 
          };
      }
      
      const lowerQ = q.toLowerCase();
      return { 
          ads: mockStore.ads.filter(a => a.title.toLowerCase().includes(lowerQ) || a.category.toLowerCase().includes(lowerQ)), 
          businesses: mockStore.businesses.filter(b => b.name.toLowerCase().includes(lowerQ) || b.category.toLowerCase().includes(lowerQ)), 
          news: mockStore.news.filter(n => n.title.toLowerCase().includes(lowerQ)) 
      };
  },

  async approveContent(table: string, id: string) {
      if (isSupabaseConfigured() && supabase) {
          console.log(`API: APPROVING content. Table: ${table}, ID: ${id}`);
          
          if (table === 'reports') {
              const { data: report } = await supabase.from('reports').select('*').eq('id', id).single();
              if (report) {
                  const isVip = report.target_type === 'biz_vip_request' || report.reason.toLowerCase().includes('vip');
                  const isVerify = report.target_type === 'biz_verify_request' || report.reason.toLowerCase().includes('верификация');
                  
                  if (isVip) {
                      await supabase.from('businesses').update({ is_vip: true }).eq('id', report.target_id);
                  } else if (isVerify) {
                      await supabase.from('businesses').update({ verification_status: 'verified' }).eq('id', report.target_id);
                  }
              }
              await supabase.from('reports').update({ status: 'approved' }).eq('id', id);
              return true;
          }

          const statusVal = table === 'stories' ? 'published' : 'approved';
          const { data, error } = await supabase!.from(table)
              .update({ status: statusVal })
              .eq('id', id)
              .select();
          
          if (error) throw error;
          return true;
      }
      return false;
  },

  async getAllProfiles(query?: string): Promise<User[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      let q = supabase.from('profiles').select('*');
      if (query) q = q.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
      const { data } = await q.order('name', { ascending: true }).limit(50);
      return (data || []).map(p => ({ ...p, role: p.role as UserRole, xp: p.xp || 0, badges: p.badges || [] }));
  },

  async getExclusivePages(): Promise<ExclusivePage[]> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('exclusive_pages').select('*').eq('is_active', true).order('idx', { ascending: true });
        return data || [];
    }
    return [];
  },

  async getMiniSiteByBusiness(businessId: string): Promise<ExclusivePage | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    const { data } = await supabase.from('exclusive_pages').select('*').eq('business_id', businessId).maybeSingle();
    return data;
  },

  async saveMiniSite(businessId: string, pageData: Partial<ExclusivePage>) {
    if (!isSupabaseConfigured() || !supabase) return;
    const { data: existing } = await supabase.from('exclusive_pages').select('id').eq('business_id', businessId).maybeSingle();
    if (existing) await supabase.from('exclusive_pages').update(pageData).eq('id', existing.id);
    else await supabase.from('exclusive_pages').insert({ ...pageData, business_id: businessId, is_active: true, idx: 99 });
  },

  async createExclusivePage(data: Partial<ExclusivePage>) {
    if (isSupabaseConfigured() && supabase) await supabase.from('exclusive_pages').insert(data);
  },

  async getPromoAds(): Promise<PromoAd[]> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('promo_ads').select('*').eq('is_active', true).order('created_at', { ascending: false });
        return data || [];
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
      if (isSupabaseConfigured() && supabase) {
          const { data: res, error } = await supabase.from(table).update(data).eq('id', id).select();
          if (error) throw error;
          return res && res.length > 0;
      }
      return false;
  },

  async getAdminReports(): Promise<Report[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      // Исключаем из обычных жалоб все технические заявки бизнеса
      const techTypes = ['biz_vip_request', 'biz_verify_request', 'business_access_request'];
      const { data: reports } = await supabase.from('reports')
        .select('*')
        .not('target_type', 'in', `(${techTypes.join(',')})`)
        .order('created_at', { ascending: false });
      
      if (!reports) return [];
      const userIds = [...new Set(reports.map(r => r.user_id).filter(Boolean))];
      const { data: profs } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
      const profMap = new Map<string, any>(profs?.map(p => [p.id, p]) || []);
      return reports.map(r => ({ id: r.id, userId: r.user_id, userName: profMap.get(r.user_id)?.name || 'Житель', userAvatar: profMap.get(r.user_id)?.avatar || '', targetId: r.target_id, targetType: r.target_type, reason: r.reason, status: r.status, createdAt: r.created_at || new Date().toISOString() }));
  },

  async getAdminSuggestions(): Promise<Suggestion[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      const { data: ideas } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
      if (!ideas) return [];
      const userIds = [...new Set(ideas.map(i => i.user_id).filter(Boolean))];
      const { data: profs } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
      const profMap = new Map<string, any>(profs?.map(p => [p.id, p]) || []);
      return ideas.map(i => ({ id: i.id, userId: i.user_id, userName: profMap.get(i.user_id)?.name || 'Житель', userAvatar: profMap.get(i.user_id)?.avatar || '', text: i.text, createdAt: i.created_at || new Date().toISOString(), isRead: !!i.is_read }));
  },

  async getAds(category?: string): Promise<Ad[]> {
    if (!isSupabaseConfigured() || !supabase) return mockStore.ads;
    let query = supabase.from('ads').select('*').eq('status', 'approved');
    if (category && category !== 'Все') query = query.eq('category', category);
    const { data } = await query;
    return (data || []).map(ad => ({ ...ad, authorId: ad.author_id, date: ad.created_at || ad.date, isVip: !!ad.is_vip, isPremium: !!ad.is_premium }));
  },

  async getAdById(id: string): Promise<Ad | null> {
    return cityService.getAdById(id);
  },

  async getAllPendingContent(): Promise<any[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      const tables = ['ads', 'rides', 'vacancies', 'resumes', 'lost_found', 'communities', 'stories', 'rentals'];
      
      try {
          const results = await Promise.all(tables.map(async (t) => {
              const { data } = await supabase!.from(t).select('*').eq('status', 'pending');
              return (data || []).map(item => ({ ...item, _table: t }));
          }));
          
          // Захватываем все виды заявок от бизнеса из таблицы reports
          const techTypes = ['biz_vip_request', 'biz_verify_request', 'business_access_request'];
          const { data: bizRequests } = await supabase!.from('reports')
            .select('*')
            .in('target_type', techTypes)
            .eq('status', 'new');
            
          const flattened = [
              ...results.flat(),
              ...(bizRequests || []).map(r => ({ ...r, _table: 'reports' }))
          ];
          
          if (flattened.length === 0) return [];
          
          const userIds = [...new Set(flattened.map(it => it.author_id || it.driver_id || it.user_id).filter(Boolean))];
          const bizIds = [...new Set(flattened.filter(it => it._table === 'reports').map(it => it.target_id))];
          
          const [profilesRes, bizRes] = await Promise.all([
              supabase!.from('profiles').select('id, name, avatar').in('id', userIds),
              bizIds.length > 0 ? supabase!.from('businesses').select('id, name').in('id', bizIds) : { data: [] }
          ]);
          
          const profileMap = new Map<string, any>(profilesRes.data?.map(p => [p.id, p]) || []);
          const businessMap = new Map<string, any>(bizRes.data?.map(b => [b.id, b]) || []);
          
          const typeLabels: Record<string, string> = {
              'ads': 'Маркет',
              'rides': 'Попутчик',
              'vacancies': 'Вакансия',
              'resumes': 'Резюме',
              'lost_found': 'Бюро находок',
              'communities': 'Клуб',
              'stories': 'История',
              'rentals': 'Аренда',
              'reports': 'Заявка бизнеса'
          };

          return flattened.map(it => {
              const authorId = it.author_id || it.driver_id || it.user_id;
              const authorProfile = profileMap.get(authorId);
              
              let displayTitle = it.title || it.caption || it.name || 'Без названия';
              let businessId = null;

              if (it._table === 'reports') {
                  const biz = businessMap.get(it.target_id);
                  const bizName = biz?.name || 'Бизнес удален';
                  const isVip = it.target_type === 'biz_vip_request' || it.reason.toLowerCase().includes('vip');
                  displayTitle = `${isVip ? '👑 VIP' : '✅ Верификация'}: ${bizName}`;
                  businessId = it.target_id;
              }

              return { 
                  ...it, 
                  authorId, 
                  authorName: authorProfile?.name || 'Житель Снежинска', 
                  authorAvatar: authorProfile?.avatar || '', 
                  typeLabel: typeLabels[it._table] || it._table, 
                  displayTitle,
                  image: it.media || it.image,
                  createdAt: parseSafeDate(it.created_at),
                  businessId
              };
          });
      } catch (e: any) {
          console.error("API Error:", e.message);
          return [];
      }
  },

  async getBanners(position?: string): Promise<Banner[]> {
    if (isSupabaseConfigured() && supabase) {
        let query = supabase.from('banners').select('*').eq('is_active', true);
        if (position) query = query.eq('position', position);
        const { data } = await query.order('idx', { ascending: true });
        return data || [];
    }
    return mockStore.banners;
  },

  async getAdminStories(): Promise<Story[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
      if (error) return [];
      
      const userIds = [...new Set(data.map(s => s.user_id).filter(Boolean))];
      const bizIds = [...new Set(data.map(s => s.business_id).filter(Boolean))];
      
      const [profs, biz] = await Promise.all([
          supabase.from('profiles').select('id, name').in('id', userIds),
          bizIds.length > 0 ? supabase.from('businesses').select('id, name').in('id', bizIds) : { data: [] }
      ]);
      
      const profMap = new Map(profs.data?.map(p => [p.id, p.name]) || []);
      const bizMap = new Map(biz.data?.map(b => [b.id, b.name]) || []);
      
      return (data || []).map(s => ({ 
          ...s, 
          authorId: s.business_id || s.user_id,
          authorName: bizMap.get(s.business_id) || profMap.get(s.user_id) || 'Житель',
          createdAt: parseSafeDate(s.created_at) 
      }));
  },

  async getBusinessCoupons(businessId: string): Promise<Coupon[]> {
      if (!isSupabaseConfigured() || !supabase) return [];
      const { data } = await supabase.from('coupons').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
      return data || [];
  },

  async createBusinessCoupon(businessId: string, data: any): Promise<void> {
      if (!isSupabaseConfigured() || !supabase) return;
      await supabase.from('coupons').insert({
          ...data,
          business_id: businessId,
          partner_name: (await this.getBusinessById(businessId))?.name || 'Партнер'
      });
  },

  async deleteCoupon(id: string): Promise<void> {
      if (!isSupabaseConfigured() || !supabase) return;
      await supabase.from('coupons').delete().eq('id', id);
  }
};

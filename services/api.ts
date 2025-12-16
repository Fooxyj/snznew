
import { 
  User, Ad, Business, NewsItem, Notification, Event, 
  Ticket, Review, Comment, Conversation, Message, 
  Poll, LostFoundItem, Appeal, Ride, Vacancy, Resume, 
  Coupon, UserCoupon, Story, Community, CommunityPost, 
  Quest, Order, Product, Service, Booking, RentalItem, 
  RentalBooking, SmartDevice, Transaction, UtilityBill, 
  Campaign, UserRole, StoryConfig, Employee, AnalyticsData, Table, Report, Suggestion, AccessRequest 
} from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { mockStore } from './mockData';
import { authService } from './authService';
import { businessService } from './businessService';
import { socialService } from './socialService';
import { cityService } from './cityService';
import { CURRENT_USER } from '../constants';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const formatRelativeDate = (dateStr: string): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return 'Недавно';
    if (/^\d{2}\.\d{2}\.\d{4}/.test(dateStr)) return dateStr;
    
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const isToday = now.getDate() === date.getDate() &&
                    now.getMonth() === date.getMonth() &&
                    now.getFullYear() === date.getFullYear();
    
    const timeString = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Сегодня, ${timeString}`;
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const mapAdFromDB = (a: any, profile?: any): Ad => ({
    id: a.id,
    title: a.title,
    price: a.price,
    currency: a.currency || '₽',
    category: a.category,
    image: a.image,
    images: a.images || (a.image ? [a.image] : []),
    date: formatRelativeDate(a.date || a.created_at),
    authorId: a.author_id,
    authorName: profile?.name || 'Пользователь',
    authorAvatar: profile?.avatar,
    description: a.description,
    location: a.location,
    isVip: a.is_vip,
    isPremium: a.is_premium,
    status: a.status || 'approved'
});

// Helper: Client-side Image Compression
const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const MAX_WIDTH = 1200; 
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { 
                        type: 'image/jpeg', 
                        lastModified: Date.now() 
                    });
                    resolve(newFile);
                } else {
                    reject(new Error('Compression failed'));
                }
            }, 'image/jpeg', 0.8);
        };
        
        img.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

export const api = {
  ...authService,
  ...businessService,
  ...socialService,
  ...cityService,

  // --- PUBLIC PROFILE ---
  async getUserById(userId: string): Promise<User | null> {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
              if (profile) {
                  return {
                      id: profile.id,
                      name: profile.name,
                      avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`,
                      role: profile.role || UserRole.USER,
                      xp: profile.xp || 0,
                      email: '', 
                      favorites: [],
                      badges: profile.badges || [],
                      createdAt: profile.created_at
                  };
              }
          } catch (e) {
              console.error("Error fetching user", e);
          }
      }
      if (userId === 'u2') return { id: 'u2', name: 'Иван Иванов', avatar: 'https://ui-avatars.com/api/?name=Ivan', role: UserRole.USER, xp: 500, email: '', favorites: [] };
      if (userId === 'u7') return { id: 'u7', name: 'Мария Кулинар', avatar: 'https://ui-avatars.com/api/?name=Maria', role: UserRole.USER, xp: 1200, email: '', favorites: [] };
      return null;
  },

  async getAdminUserId(): Promise<string | null> {
      const ADMIN_EMAIL = 'fooxyj@yandex.ru';
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data } = await supabase.from('profiles').select('id').eq('email', ADMIN_EMAIL).single();
              if (data) return data.id;
              const { data: adminRole } = await supabase.from('profiles').select('id').eq('role', 'ADMIN').limit(1).single();
              if (adminRole) return adminRole.id;
          } catch (e) {
              console.warn("Could not find specific admin in DB");
          }
      }
      return 'admin_user_id'; 
  },

  async getUserContent(userId: string): Promise<{ ads: Ad[] }> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data } = await supabase.from('ads').select('*').eq('author_id', userId);
            if (data) {
                const mapped = data.map(d => mapAdFromDB(d));
                return { ads: mapped };
            }
        } catch (e) {
            console.error("Error fetching user content", e);
        }
        return { ads: [] };
    }
    const allAds = await this.getAds();
    return { ads: allAds.filter(a => a.authorId === userId) };
  },

  async getFavorites(ids: string[]): Promise<{ ads: Ad[], businesses: Business[] }> {
      if (!ids || ids.length === 0) return { ads: [], businesses: [] };

      if (isSupabaseConfigured() && supabase) {
          try {
              // Fetch Ads
              const { data: adsData } = await supabase.from('ads').select('*').in('id', ids);
              let ads: Ad[] = [];
              if (adsData) {
                  const authorIds = [...new Set(adsData.map((a: any) => a.author_id))];
                  let profiles: any[] = [];
                  if (authorIds.length > 0) {
                      const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar').in('id', authorIds);
                      profiles = profilesData || [];
                  }
                  ads = adsData.map((d: any) => {
                      const profile = profiles.find(p => p.id === d.author_id);
                      return mapAdFromDB(d, profile);
                  });
              }

              // Fetch Businesses
              const { data: bizData } = await supabase.from('businesses').select('*').in('id', ids);
              let businesses: Business[] = [];
              if (bizData) {
                  businesses = bizData.map((b: any) => ({
                      id: b.id,
                      name: b.name,
                      category: b.category,
                      rating: 0, // Simplified
                      reviewsCount: 0,
                      address: b.address,
                      image: b.image,
                      coverImage: b.cover_image,
                      description: b.description,
                      lat: b.lat,
                      lng: b.lng,
                      phone: b.phone,
                      workHours: b.work_hours,
                      authorId: b.author_id,
                      verificationStatus: b.verification_status
                  }));
              }

              return { ads, businesses };
          } catch (e) {
              console.error("Error fetching favorites", e);
              return { ads: [], businesses: [] };
          }
      }

      // Mock fallback
      const ads = mockStore.ads.filter(a => ids.includes(a.id));
      const businesses = mockStore.businesses.filter(b => ids.includes(b.id));
      return { ads, businesses };
  },

  async getExploreData() {
      const [businesses, quests, appeals] = await Promise.all([
          this.getBusinesses(),
          this.getQuests(),
          this.getAppeals()
      ]);

      const enrichedBusinesses = businesses.map(b => ({
          type: 'business',
          id: b.id,
          lat: b.lat,
          lng: b.lng,
          title: b.name,
          subtitle: b.category,
          image: b.image,
          data: b
      }));

      const enrichedQuests = quests.map(q => ({
          type: 'quest',
          id: q.id,
          lat: q.lat,
          lng: q.lng,
          title: q.title,
          subtitle: `${q.xpReward} XP`,
          image: q.image,
          data: q
      }));

      const enrichedAppeals = appeals.map((a, i) => ({
          type: 'appeal',
          id: a.id,
          lat: 56.08 + (Math.random() * 0.04 - 0.02),
          lng: 60.73 + (Math.random() * 0.04 - 0.02),
          title: a.title,
          subtitle: a.status === 'done' ? 'Решено' : 'Проблема',
          image: a.image,
          data: a
      }));

      return [...enrichedBusinesses, ...enrichedQuests, ...enrichedAppeals];
  },

  async claimDailyBonus(xp: number): Promise<void> {
      const user = await this.getCurrentUser();
      if (!user) return;

      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('profiles').update({
              xp: (user.xp || 0) + xp
          }).eq('id', user.id);
          
          if (error) throw error;
      }
      localStorage.setItem(`daily_bonus_${user.id}`, new Date().toDateString());
  },

  async sendReport(targetId: string, targetType: string, reason: string): Promise<void> {
      const user = await this.getCurrentUser();
      if (!user) throw new Error("Необходимо войти в систему");
      
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('reports').insert({
              user_id: user.id,
              target_id: targetId,
              target_type: targetType,
              reason,
              status: 'new'
          });
          return;
      }
      mockStore.reports.push({
          id: Math.random().toString(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          targetId,
          targetType,
          reason,
          status: 'new',
          createdAt: new Date().toISOString()
      });
  },

  async getReports(): Promise<Report[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data: reportsData, error } = await supabase
                  .from('reports')
                  .select('*')
                  .order('created_at', { ascending: false });

              if (error) throw error;
              if (!reportsData) return [];

              const userIds = new Set<string>();
              reportsData.forEach((r: any) => {
                  if (r.user_id) userIds.add(r.user_id);
              });

              let profilesMap = new Map();
              if (userIds.size > 0) {
                  const { data: profiles } = await supabase
                      .from('profiles')
                      .select('id, name, avatar')
                      .in('id', Array.from(userIds));
                  
                  if (profiles) {
                      profiles.forEach((p: any) => profilesMap.set(p.id, p));
                  }
              }

              return reportsData.map((r: any) => {
                  const profile = profilesMap.get(r.user_id);
                  return {
                      id: r.id,
                      userId: r.user_id,
                      userName: profile?.name || 'Пользователь',
                      userAvatar: profile?.avatar,
                      targetId: r.target_id,
                      targetType: r.target_type,
                      reason: r.reason,
                      status: r.status,
                      createdAt: r.created_at
                  };
              });
          } catch (e) {
              console.error("Error fetching reports:", e);
              return [];
          }
      }
      return mockStore.reports;
  },

  async deleteReport(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('reports').delete().eq('id', id);
          if (error) throw error;
          return;
      }
      mockStore.reports = mockStore.reports.filter(r => r.id !== id);
  },

  async getAds(): Promise<Ad[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.from('ads').select('*').eq('status', 'approved');
            if (data) {
                const authorIds = [...new Set(data.map((a: any) => a.author_id))];
                let profiles: any[] = [];
                if (authorIds.length > 0) {
                    const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar').in('id', authorIds);
                    profiles = profilesData || [];
                }

                const mapped = data.map((d: any) => {
                    const profile = profiles.find(p => p.id === d.author_id);
                    return mapAdFromDB(d, profile);
                });
                
                return mapped.sort((a, b) => {
                    if (a.isVip !== b.isVip) return a.isVip ? -1 : 1;
                    if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
                    return b.id.localeCompare(a.id); 
                });
            }
        } catch (e) {
            return mockStore.ads;
        }
        return [];
    }
    return mockStore.ads;
  },

  async getAdById(id: string): Promise<Ad | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('ads').select('*').eq('id', id).single();
        if (data) {
            const { data: profile } = await supabase.from('profiles').select('name, avatar').eq('id', data.author_id).single();
            return mapAdFromDB(data, profile);
        }
    }
    return mockStore.ads.find(a => a.id === id) || null;
  },

  async createAd(data: any): Promise<Ad> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    if (isSupabaseConfigured() && supabase) {
        const adData: any = { 
            title: data.title,
            price: data.price,
            currency: data.currency || '₽',
            category: data.category,
            description: data.description,
            location: data.location,
            image: data.image,
            images: data.images,
            author_id: user.id, 
            status: 'pending',
            is_vip: !!data.isVip, 
            is_premium: !!data.isPremium,
            date: new Date().toISOString()
        };
        const { data: saved, error } = await supabase.from('ads').insert(adData).select().single();
        if (error) throw error;
        return mapAdFromDB(saved, { name: user.name, avatar: user.avatar });
    }
    const mock = { id: Math.random().toString(), ...data, authorId: user.id, date: 'Сегодня' };
    mockStore.ads.unshift(mock);
    return mock;
  },

  async updateAd(id: string, data: Partial<Ad>): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const dbData: any = { ...data };
          delete dbData.id; 
          delete dbData.authorId; 
          delete dbData.authorName; 
          delete dbData.authorAvatar;
          
          const { error } = await supabase.from('ads').update(dbData).eq('id', id);
          if (error) throw error;
      } else {
          const idx = mockStore.ads.findIndex(a => a.id === id);
          if (idx !== -1) mockStore.ads[idx] = { ...mockStore.ads[idx], ...data };
      }
  },

  async deleteAd(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('ads').delete().eq('id', id);
          if (error) throw error;
      }
      mockStore.ads = mockStore.ads.filter(a => a.id !== id);
  },

  async promoteAd(id: string, level: 'vip' | 'premium'): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const update = level === 'vip' ? { is_vip: true } : { is_premium: true };
          await supabase.from('ads').update(update).eq('id', id);
      }
  },

  async getAllAdsForAdmin(): Promise<Ad[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data, error } = await supabase.from('ads').select('*').order('date', { ascending: false });
              if (error) return []; 

              if (data && data.length > 0) {
                  const authorIds = [...new Set(data.map((a: any) => a.author_id).filter(Boolean))];
                  let profiles: any[] = [];
                  if (authorIds.length > 0) {
                      const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar').in('id', authorIds);
                      profiles = profilesData || [];
                  }

                  return data.map((d: any) => {
                      const profile = profiles.find(p => p.id === d.author_id);
                      return mapAdFromDB(d, profile);
                  });
              }
              return [];
          } catch (e) {
              return [];
          }
      }
      return mockStore.ads;
  },

  async getPendingAds(): Promise<Ad[]> {
      if (isSupabaseConfigured() && supabase) {
           const { data } = await supabase.from('ads').select('*').eq('status', 'pending');
           if (data) {
               const authorIds = [...new Set(data.map((a: any) => a.author_id).filter(Boolean))];
               let profiles: any[] = [];
               if (authorIds.length > 0) {
                   const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar').in('id', authorIds);
                   profiles = profilesData || [];
               }
               
               return data.map((d: any) => {
                   const profile = profiles.find(p => p.id === d.author_id);
                   return mapAdFromDB(d, profile);
               });
           }
           return [];
      }
      return [];
  },

  async getSystemStats() {
      if (isSupabaseConfigured() && supabase) {
          const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          const { count: ads } = await supabase.from('ads').select('*', { count: 'exact', head: true });
          const { count: businesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
          const { count: news } = await supabase.from('news').select('*', { count: 'exact', head: true });
          const { count: stories } = await supabase.from('stories').select('*', { count: 'exact', head: true });
          return { users: users || 0, ads: ads || 0, businesses: businesses || 0, news: news || 0, stories: stories || 0 };
      }
      return { users: 100, ads: 50, businesses: 10, news: 5, stories: 24 };
  },

  async getAdminAnalytics() {
      await delay(500);
      return { 
          activity: [{name: 'Пн', users: 12, ads: 5}, {name: 'Вт', users: 19, ads: 8}], 
          distribution: [{name: 'Объявления', value: 400}, {name: 'Новости', value: 100}] 
      };
  },

  async approveAd(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('ads').update({ status: 'approved' }).eq('id', id);
          if (error) throw error;
      }
  },

  async rejectAd(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('ads').update({ status: 'rejected' }).eq('id', id);
          if (error) throw error;
      }
  },

  async adminToggleVip(id: string, isVip: boolean): Promise<void> {
      if (isSupabaseConfigured() && supabase) await supabase.from('ads').update({ is_vip: isVip }).eq('id', id);
  },

  async deleteStory(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('stories').delete().eq('id', id);
          if (error) throw error;
          return;
      }
      mockStore.stories = mockStore.stories.filter(s => s.id !== id);
  },

  async getNews(): Promise<NewsItem[]> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('news').select('*').order('date', { ascending: false });
        if (data) {
            return data.map((n: any) => ({
                id: n.id,
                title: n.title,
                category: n.category,
                image: n.image,
                date: formatRelativeDate(n.date),
                views: n.views || 0,
                commentsCount: n.comments_count || 0,
                content: n.content
            }));
        }
    }
    return mockStore.news;
  },

  async getNewsById(id: string): Promise<NewsItem | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('news').select('*').eq('id', id).single();
        if (data) return { ...data, date: formatRelativeDate(data.date), commentsCount: data.comments_count };
    }
    return mockStore.news.find(n => n.id === id) || null;
  },

  async createNews(data: any): Promise<NewsItem> {
      if (isSupabaseConfigured() && supabase) {
          const { data: saved, error } = await supabase.from('news').insert({ ...data, date: new Date().toISOString() }).select().single();
          if (error) throw error;
          return { ...saved, date: formatRelativeDate(saved.date) };
      }
      return { id: 'mock', ...data, date: 'Сегодня', views: 0, commentsCount: 0 };
  },

  async deleteNews(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('news').delete().eq('id', id);
          if (error) throw error;
      }
  },

  async getEvents(): Promise<Event[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
          if (data) return data; 
      }
      return mockStore.events; 
  },

  async createEvent(data: any): Promise<Event> { 
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Auth required");

      if (isSupabaseConfigured() && supabase) {
          const payload = { ...data, author_id: user.id };
          const { data: saved, error } = await supabase.from('events').insert(payload).select().single();
          if (error) throw error;
          return saved;
      }
      const mock = { id: Math.random().toString(), ...data }; 
      mockStore.events.push(mock); 
      return mock; 
  },

  async getEventById(id: string): Promise<Event|null> { 
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*').eq('id', id).single();
          return data;
      }
      return mockStore.events.find(e => e.id === id) || null; 
  },

  async deleteEvent(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) await supabase.from('events').delete().eq('id', id);
  },

  async updateEvent(id: string, data: any): Promise<void> {
      if (isSupabaseConfigured() && supabase) await supabase.from('events').update(data).eq('id', id);
  },
  
  async getEventsByAuthor(authorId: string): Promise<Event[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*').eq('author_id', authorId);
          return data || [];
      }
      return []; 
  },

  async getBookedSeats(eid: string) { return []; },
  async buyTicket(eid: string, r: number, c: number, p: number) {},

  async getRentals(): Promise<RentalItem[]> { 
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('rentals').select('*').eq('is_available', true);
          if (data) return data.map((r: any) => ({
              ...r, pricePerDay: r.price_per_day, authorId: r.author_id
          }));
      }
      return mockStore.rentals; 
  },

  async createRental(data: any): Promise<void> { 
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Auth required");

      if (isSupabaseConfigured() && supabase) {
          await supabase.from('rentals').insert({ 
              ...data, 
              author_id: user.id,
              price_per_day: data.pricePerDay,
              is_available: true
          });
          return;
      }
      mockStore.rentals.push({...data, id: Math.random().toString()}); 
  },

  async deleteRental(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('rentals').delete().eq('id', id);
          if (error) throw error;
          return;
      }
      mockStore.rentals = mockStore.rentals.filter(r => r.id !== id);
  },

  async getMyRentals(): Promise<RentalBooking[]> { 
      const user = await authService.getCurrentUser();
      if (!user) return [];

      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('rental_bookings').select('*, rentals(title, image, deposit)').eq('renter_id', user.id);
          if (data) return data.map((b: any) => ({
              id: b.id,
              rentalId: b.rental_id,
              renterId: b.renter_id,
              startDate: b.start_date,
              endDate: b.end_date,
              totalPrice: b.total_price,
              status: b.status,
              rentalTitle: b.rentals?.title,
              rentalImage: b.rentals?.image,
              deposit: b.rentals?.deposit
          }));
      }
      return []; 
  },

  async getRentalsByAuthor(authorId: string): Promise<RentalItem[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('rentals').select('*').eq('author_id', authorId);
          if (data) return data.map((r: any) => ({
              ...r, pricePerDay: r.price_per_day, authorId: r.author_id
          }));
      }
      return [];
  },

  async bookRental(rentalId: string, startDate: string, endDate: string, totalPrice: number, deposit: number): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Auth required");

      if (isSupabaseConfigured() && supabase) {
          await supabase.from('rental_bookings').insert({
              rental_id: rentalId,
              renter_id: user.id,
              start_date: startDate,
              end_date: endDate,
              total_price: totalPrice,
              status: 'active'
          });
      }
  },

  async returnRental(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('rental_bookings').update({ status: 'returned' }).eq('id', id);
      }
  },

  async uploadImage(file: File): Promise<string> {
      if (isSupabaseConfigured() && supabase) {
          let fileToUpload = file;
          if (file.type.startsWith('image/')) {
              try {
                  fileToUpload = await compressImage(file);
              } catch (e) {
                  console.warn("Image compression failed, using original file", e);
              }
          }

          try {
              const fileExt = fileToUpload.name.split('.').pop();
              const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
              const { error } = await supabase.storage.from('images').upload(fileName, fileToUpload);
              if (error) throw error;
              const { data } = supabase.storage.from('images').getPublicUrl(fileName);
              return data.publicUrl;
          } catch (error) {
              console.warn("Supabase Storage upload failed, falling back to local preview:", error);
          }
      }
      await delay(800);
      return URL.createObjectURL(file);
  },

  async getNotifications(): Promise<Notification[]> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return [];
      
      try {
          const { data } = await supabase
              .from('notifications')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
              
          if (data) {
              return data.map((n: any) => ({
                  id: n.id,
                  userId: n.user_id,
                  type: n.type,
                  text: n.text,
                  isRead: n.is_read,
                  createdAt: n.created_at,
                  link: n.link
              }));
          }
      } catch (e) {
          console.error("Error fetching notifications", e);
      }
      return [];
  },

  async subscribeToNotifications(userId: string, callback: (n: Notification) => void) {
      if (!isSupabaseConfigured() || !supabase) return { unsubscribe: () => {} };
      
      const subscription = supabase.channel(`public:notifications:user_id=eq.${userId}`)
          .on('postgres_changes', 
              { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
              (payload) => {
                  const n = payload.new as any;
                  if (n) {
                      callback({
                          id: n.id,
                          userId: n.user_id,
                          type: n.type,
                          text: n.text,
                          isRead: n.is_read,
                          createdAt: n.created_at,
                          link: n.link
                      });
                  }
              }
          )
          .subscribe();
          
      return { unsubscribe: () => supabase?.removeChannel(subscription) };
  },

  async markNotificationRead(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
  },

  async deleteNotification(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('notifications').delete().eq('id', id);
      }
  },

  async getCoupons(): Promise<Coupon[]> { return []; },
  async getMyCoupons(): Promise<UserCoupon[]> { return []; },
  async buyCoupon(id: string): Promise<void> { },
  async getTransactions(): Promise<Transaction[]> { return []; },

  async getCampaigns(): Promise<Campaign[]> { 
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('campaigns').select('*');
          if (data) return data.map((c: any) => ({ ...c, targetAmount: c.target_amount, collectedAmount: c.collected_amount, organizerName: c.organizer_name }));
      }
      return mockStore.campaigns; 
  },
  
  async createCampaign(data: any) { 
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          await supabase.from('campaigns').insert({ ...data, author_id: user.id, target_amount: data.targetAmount, organizer_name: data.organizer_name });
      }
  },
  
  async donateToCampaign(id: string, amount: number) { 
      if (isSupabaseConfigured() && supabase) {
          const { data: c } = await supabase.from('campaigns').select('collected_amount').eq('id', id).single();
          if (c) {
              await supabase.from('campaigns').update({ collected_amount: c.collected_amount + amount }).eq('id', id);
          }
      }
  },

  async globalSearch(q: string) { 
      if (isSupabaseConfigured() && supabase) {
          const [ads, biz, news] = await Promise.all([
              supabase.from('ads').select('*').ilike('title', `%${q}%`).eq('status', 'approved'),
              supabase.from('businesses').select('*').ilike('name', `%${q}%`),
              supabase.from('news').select('*').ilike('title', `%${q}%`)
          ]);
          return {
              ads: ads.data ? ads.data.map(d => mapAdFromDB(d)) : [],
              businesses: biz.data || [],
              news: news.data || []
          };
      }
      return { ads: [], businesses: [], news: [] }; 
  },
  
  async getVacancies() { return []; },
  async createVacancy(d: any) {},
  async getResumes() { return []; },
  async createResume(d: any) {},
  
  async getQuests() { 
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('quests').select('*');
          return data || [];
      }
      return mockStore.quests; 
  },
  async completeQuest(id: string, lat: number, lng: number) { return 100; },
  async getLeaderboard() { return []; },
  
  async getDeliveryOrders() { return []; },
  async getMyDeliveries() { return []; },
  async takeDelivery(id: string) {},
  async completeDelivery(id: string) {},
  
  async getUtilityBills() { return []; },
  async submitMeterReading(t: string, v: number) {},
  async payUtilityBill(id: string, a: number) {},
  
  async createPoll(q: string, o: string[]) {},
  
  async toggleFavorite(id: string, t: string) { 
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Необходимо войти в систему");
      
      const favorites = user.favorites || [];
      const exists = favorites.includes(id);
      const newFavs = exists ? favorites.filter(f => f !== id) : [...favorites, id];
      
      // Update local storage for immediate optimistic UI update
      // This is crucial if the DB column is missing
      localStorage.setItem(`favs_${user.id}`, JSON.stringify(newFavs));

      if (isSupabaseConfigured() && supabase) {
          try {
              const { error } = await supabase.from('profiles').update({ favorites: newFavs }).eq('id', user.id);
              if (error) {
                  // Fallback if column is missing in DB schema
                  if (error.code === 'PGRST204' || error.message.includes('favorites')) {
                      console.warn("Favorites column missing in DB, using local storage fallback.");
                      return !exists;
                  }
                  throw error;
              }
          } catch (e: any) {
              console.error("Toggle favorite DB failed, falling back to local", e);
              // Return success because we updated local storage
              return !exists;
          }
      } else {
          // Mock mode logic: Update CURRENT_USER directly
          const index = CURRENT_USER.favorites.indexOf(id);
          if (index === -1) {
              CURRENT_USER.favorites.push(id);
          } else {
              CURRENT_USER.favorites.splice(index, 1);
          }
      }
      return !exists;
  }
};

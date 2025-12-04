

import { 
  User, Ad, Business, NewsItem, Notification, Event, 
  Ticket, Review, Comment, Conversation, Message, 
  Poll, LostFoundItem, Appeal, Ride, Vacancy, Resume, 
  Coupon, UserCoupon, Story, Community, CommunityPost, 
  Quest, Order, Product, Service, Booking, RentalItem, 
  RentalBooking, SmartDevice, Transaction, UtilityBill, 
  Campaign, UserRole 
} from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { 
  CURRENT_USER, NEWS_DATA, ADS_DATA, BUSINESS_DATA, 
  EVENTS_DATA 
} from '../constants';

// Helper to simulate delay for mocks
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Fallback Mock Data
let mockAds: Ad[] = [...ADS_DATA];
let mockNews: NewsItem[] = [...NEWS_DATA];
let mockBusinesses: Business[] = [...BUSINESS_DATA];
let mockEvents: Event[] = [...EVENTS_DATA];
let mockRentals: RentalItem[] = []; // Start empty
let mockOrders: Order[] = [];

// Helper Mapper
const mapAdFromDB = (a: any): Ad => ({
    id: a.id,
    title: a.title,
    price: a.price,
    currency: a.currency || '₽',
    category: a.category,
    image: a.image,
    date: a.date || a.created_at ? new Date(a.created_at).toLocaleDateString('ru-RU') : 'Недавно',
    authorId: a.author_id,
    description: a.description,
    location: a.location,
    isVip: a.is_vip,
    isPremium: a.is_premium,
    status: a.status || 'approved'
});

export const api = {
  // --- AUTH ---
  async signIn(email: string, password: string): Promise<User> {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // In a real app, you'd fetch profile from 'profiles' table here
        return { ...CURRENT_USER, id: data.user.id, email: data.user.email || '' }; 
    }
    await delay();
    return CURRENT_USER;
  },

  async signUp(email: string, password: string, name: string): Promise<User> {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // In a real app, create profile record here
        return { ...CURRENT_USER, id: data.user?.id || 'u1', name, email };
    }
    await delay();
    return CURRENT_USER;
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
            // Try fetch profile extra data
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
            // Start with CURRENT_USER as base for structure, but override essential fields
            const user = { 
                ...CURRENT_USER, 
                id: data.user.id, 
                email: data.user.email || '',
                // Reset numeric values to 0 default if not in DB, don't use mock values
                xp: 0,
                balance: 0
            };
            
            if (profile) {
                user.name = profile.name || user.name;
                user.avatar = profile.avatar || user.avatar;
                user.role = profile.role || user.role;
                user.favorites = profile.favorites || user.favorites;
                
                // Explicitly map these fields, using nullish coalescing to handle 0 correctly
                user.xp = profile.xp !== undefined ? profile.xp : 0;
                user.balance = profile.balance !== undefined ? profile.balance : 0;
                user.badges = profile.badges || [];
            }
            return user;
        }
        return null;
    }
    return CURRENT_USER; // Dev Fallback
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("No user");
    
    if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('profiles').upsert({ id: user.id, ...data });
        if (error) console.error("Profile update failed", error);
    }
    Object.assign(CURRENT_USER, data); // Update mock too
    return { ...user, ...data };
  },

  async getUserContent(userId: string): Promise<{ ads: Ad[] }> {
    if (isSupabaseConfigured() && supabase) {
        try {
            // Fetch ALL ads for user (including pending/rejected)
            const { data } = await supabase.from('ads').select('*').eq('author_id', userId);
            if (data) {
                const mapped = data.map(mapAdFromDB);
                return { ads: mapped };
            }
        } catch (e) {
            console.error("Error fetching user content", e);
        }
        return { ads: [] };
    }
    // Fallback
    const allAds = await this.getAds();
    return { ads: allAds.filter(a => a.authorId === userId) };
  },

  // --- BUSINESS ---
  async getMyBusinesses(): Promise<Business[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];
    
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('businesses').select('*').eq('author_id', user.id);
        if (!error && data) {
            return data.map((b: any) => ({
                ...b,
                reviewsCount: b.reviews_count || 0,
                workHours: b.work_hours || '',
                authorId: b.author_id
            }));
        }
    }
    // Fallback to mock only if not configured
    if (!isSupabaseConfigured()) {
        return mockBusinesses.filter(b => b.authorId === user.id);
    }
    return [];
  },

  async getMyBusiness(): Promise<Business | null> {
    const bizs = await this.getMyBusinesses();
    return bizs[0] || null;
  },

  async getBusinessById(id: string): Promise<Business | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('businesses').select('*').eq('id', id).single();
        if (data) return { ...data, reviewsCount: data.reviews_count, workHours: data.work_hours, authorId: data.author_id };
    }
    return mockBusinesses.find(b => b.id === id) || null;
  },

  async getBusinesses(category?: string): Promise<Business[]> {
    if (isSupabaseConfigured() && supabase) {
        let query = supabase.from('businesses').select('*');
        // Robust Mapping for URL slugs -> DB Values
        if (category) {
             if (category === 'shops') query = query.eq('category', 'Магазины');
             else if (category === 'cafe') query = query.eq('category', 'Кафе и рестораны');
             else if (category === 'sport') query = query.ilike('category', '%Спорт%'); // cover 'Спорт' and 'Спортзалы...'
             else if (category === 'rent') query = query.ilike('category', '%Аренда%');
             else if (category === 'beauty') query = query.eq('category', 'Красота');
             else if (category === 'cinema') query = query.eq('category', 'Кино');
             else if (category === 'tourism') query = query.eq('category', 'Туризм');
             else if (category === 'cargo') query = query.eq('category', 'Грузоперевозки');
             else if (category === 'med') query = query.ilike('category', '%Медицин%'); // catch Медицина, Медицинские...
             else if (category === 'carwash') query = query.eq('category', 'Автомойки');
             else if (category === 'autoservice') query = query.eq('category', 'Автосервисы');
             else if (category === 'taxi') query = query.eq('category', 'Такси');
             else query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (!error && data) {
             return data.map((b: any) => ({
                ...b, reviewsCount: b.reviews_count, workHours: b.work_hours, authorId: b.author_id
            }));
        }
        return [];
    }
    
    // Fallback Mock
    let res = mockBusinesses;
    if (category === 'shops') res = res.filter(b => b.category === 'Магазины');
    else if (category === 'cafe') res = res.filter(b => b.category === 'Кафе и рестораны');
    return res;
  },

  async createBusiness(data: any): Promise<Business> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const newBiz = { ...data, author_id: user.id, rating: 0, reviews_count: 0 };

    if (isSupabaseConfigured() && supabase) {
        const { data: saved, error } = await supabase.from('businesses').insert(newBiz).select().single();
        if (error) throw error;
        return { ...saved, reviewsCount: 0, workHours: saved.work_hours, authorId: saved.author_id };
    }

    const mock = { id: Math.random().toString(), ...data, authorId: user.id, rating: 0, reviewsCount: 0 };
    mockBusinesses.push(mock);
    return mock;
  },

  async updateBusiness(id: string, data: Partial<Business>): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const dbData: any = { ...data };
          if (data.workHours) dbData.work_hours = data.workHours;
          await supabase.from('businesses').update(dbData).eq('id', id);
      }
      const idx = mockBusinesses.findIndex(b => b.id === id);
      if (idx !== -1) mockBusinesses[idx] = { ...mockBusinesses[idx], ...data };
  },

  async deleteBusiness(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('businesses').delete().eq('id', id);
      }
      mockBusinesses = mockBusinesses.filter(b => b.id !== id);
  },

  // --- ADS ---
  async getAds(): Promise<Ad[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            // IMPORTANT: Only fetch APPROVED ads for public feed
            const { data, error } = await supabase.from('ads').select('*').eq('status', 'approved');
            
            if (error) {
                console.error("Error fetching ads:", error);
                return [];
            }

            if (data) {
                const mapped = data.map(mapAdFromDB);
                // Sort manually if DB sort failed or wasn't applied: VIP first
                return mapped.sort((a, b) => (a.isVip === b.isVip ? 0 : a.isVip ? -1 : 1));
            }
        } catch (e) {
            console.error("Critical error in getAds:", e);
        }
        return [];
    }
    // Mock Fallback only if no DB configured
    return [...mockAds].filter(a => a.status === 'approved').sort((a, b) => (a.isVip === b.isVip ? 0 : a.isVip ? -1 : 1));
  },

  async getAdById(id: string): Promise<Ad | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('ads').select('*').eq('id', id).single();
        if (data) return mapAdFromDB(data);
    }
    return mockAds.find(a => a.id === id) || null;
  },

  async createAd(data: any): Promise<Ad> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const adData = { 
        ...data, 
        author_id: user.id, 
        date: new Date().toLocaleDateString('ru-RU'),
        status: 'pending',
        is_vip: data.isVip, 
        is_premium: data.isPremium
    };

    if (isSupabaseConfigured() && supabase) {
        const { data: saved, error } = await supabase.from('ads').insert(adData).select().single();
        if (error) throw error;
        return mapAdFromDB(saved);
    }

    const mock = { id: Math.random().toString(), ...data, authorId: user.id, date: 'Сегодня', status: 'pending' };
    mockAds.unshift(mock);
    return mock;
  },

  async updateAd(id: string, data: Partial<Ad>): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const dbData: any = { ...data };
          if (data.isVip !== undefined) dbData.is_vip = data.isVip;
          if (data.isPremium !== undefined) dbData.is_premium = data.isPremium;
          await supabase.from('ads').update(dbData).eq('id', id);
      }
      const idx = mockAds.findIndex(a => a.id === id);
      if (idx !== -1) mockAds[idx] = { ...mockAds[idx], ...data };
  },

  async deleteAd(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('ads').delete().eq('id', id);
      }
      mockAds = mockAds.filter(a => a.id !== id);
  },

  async promoteAd(id: string, level: 'vip' | 'premium'): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const update = level === 'vip' ? { is_vip: true } : { is_premium: true };
          await supabase.from('ads').update(update).eq('id', id);
      }
      const ad = mockAds.find(a => a.id === id);
      if (ad) {
          if (level === 'vip') ad.isVip = true;
          if (level === 'premium') ad.isPremium = true;
      }
  },

  // --- NEWS & COMMENTS ---
  async getNews(): Promise<NewsItem[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.from('news').select('*');
            if (error) {
                console.error("Error fetching news:", error);
                return [];
            }
            if (data) {
                return data.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    category: n.category,
                    image: n.image,
                    date: n.date || 'Сегодня',
                    views: n.views || 0,
                    commentsCount: n.comments_count || 0,
                    content: n.content
                }));
            }
        } catch (e) {
            console.error("Critical error getNews:", e);
        }
        return [];
    }
    return mockNews;
  },

  async getNewsById(id: string): Promise<NewsItem | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('news').select('*').eq('id', id).single();
        if (data) return { ...data, commentsCount: data.comments_count };
    }
    return mockNews.find(n => n.id === id) || null;
  },

  async createNews(data: any): Promise<NewsItem> {
      if (isSupabaseConfigured() && supabase) {
          const { data: saved, error } = await supabase.from('news').insert(data).select().single();
          if (error) throw error;
          return saved;
      }
      const mock = { id: Math.random().toString(), ...data, date: 'Сегодня', views: 0, commentsCount: 0 };
      mockNews.unshift(mock);
      return mock;
  },

  async deleteNews(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) await supabase.from('news').delete().eq('id', id);
      mockNews = mockNews.filter(n => n.id !== id);
  },

  async getComments(newsId: string): Promise<Comment[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            // 1. Fetch comments
            const { data, error } = await supabase
                .from('comments')
                .select('id, news_id, text, date, author_name, author_id')
                .eq('news_id', newsId);
                
            if (error || !data) return [];

            // 2. Fetch avatars for these authors
            const authorIds = [...new Set(data.map((c: any) => c.author_id).filter(Boolean))];
            let profiles: any[] = [];
            
            if (authorIds.length > 0) {
                const { data: profileData } = await supabase.from('profiles').select('id, avatar').in('id', authorIds);
                profiles = profileData || [];
            }
            
            // 3. Merge
            return data.map((c: any) => {
                const profile = profiles.find(p => p.id === c.author_id);
                return {
                    id: c.id,
                    newsId: c.news_id,
                    text: c.text,
                    date: c.date || 'Недавно',
                    authorName: c.author_name || 'Пользователь',
                    authorAvatar: profile?.avatar
                };
            });
        } catch (e) {
            console.error("Critical error fetching comments:", e);
            return [];
        }
    }
    return [];
  },

  async addComment(newsId: string, text: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("Auth required");

    if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('comments').insert({
            news_id: newsId,
            text,
            author_id: user.id,
            author_name: user.name,
            date: new Date().toLocaleString('ru-RU')
        });
        if (error) throw error;
    }
  },

  // --- REVIEWS ---
  async getReviews(businessId: string): Promise<Review[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
              // 1. Get Reviews
              const { data } = await supabase
                .from('reviews')
                .select('id, business_id, rating, text, date, author_name, author_id')
                .eq('business_id', businessId);
                
              if (!data) return [];

              // 2. Get Author Avatars
              const authorIds = [...new Set(data.map((r: any) => r.author_id).filter(Boolean))];
              let profiles: any[] = [];
              
              if (authorIds.length > 0) {
                  const { data: profileData } = await supabase.from('profiles').select('id, avatar').in('id', authorIds);
                  profiles = profileData || [];
              }

              // 3. Map and Merge
              return data.map((r: any) => {
                  const profile = profiles.find(p => p.id === r.author_id);
                  return {
                      id: r.id,
                      businessId: r.business_id,
                      rating: r.rating,
                      text: r.text,
                      date: r.date,
                      authorName: r.author_name || 'Аноним',
                      authorAvatar: profile?.avatar
                  };
              });
          } catch(e) {
              console.error("Error fetching reviews", e);
              return [];
          }
      }
      return [];
  },

  async addReview(businessId: string, rating: number, text: string): Promise<void> {
      const user = await this.getCurrentUser();
      if (!user) throw new Error("Auth required");

      if (isSupabaseConfigured() && supabase) {
          await supabase.from('reviews').insert({
              business_id: businessId,
              rating,
              text,
              author_id: user.id,
              author_name: user.name,
              date: new Date().toLocaleDateString('ru-RU')
          });
      }
  },

  // --- COMMUNITIES ---
  async getCommunities(): Promise<Community[]> {
    if (isSupabaseConfigured() && supabase) {
        // Fetch all communities
        const { data: list, error } = await supabase.from('communities').select('*');
        if (error) {
            console.error(error);
            return [];
        }

        // Check membership
        const user = await this.getCurrentUser();
        let memberIds: string[] = [];
        if (user) {
            const { data: members } = await supabase.from('community_members').select('community_id').eq('user_id', user.id);
            if (members) memberIds = members.map((m: any) => m.community_id);
        }

        return list.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            image: c.image,
            membersCount: c.members_count || 0,
            isMember: memberIds.includes(c.id)
        }));
    }
    return [];
  },

  async getCommunityById(id: string): Promise<Community | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('communities').select('*').eq('id', id).single();
          if (data) {
              const user = await this.getCurrentUser();
              let isMember = false;
              if (user) {
                  const { data: mem } = await supabase.from('community_members').select('*').eq('community_id', id).eq('user_id', user.id).single();
                  isMember = !!mem;
              }
              return { 
                  id: data.id, name: data.name, description: data.description, 
                  image: data.image, membersCount: data.members_count, isMember 
              };
          }
      }
      return null;
  },

  async createCommunity(data: any): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('communities').insert(data);
      }
  },

  async joinCommunity(id: string): Promise<void> {
      const user = await this.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      
      const { error } = await supabase.from('community_members').insert({ community_id: id, user_id: user.id });
      if (!error) {
          await supabase.rpc('increment_community_members', { cid: id });
      }
  },

  async leaveCommunity(id: string): Promise<void> {
      const user = await this.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;

      await supabase.from('community_members').delete().eq('community_id', id).eq('user_id', user.id);
  },

  async getCommunityPosts(id: string): Promise<CommunityPost[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data: posts } = await supabase.from('community_posts').select('*').eq('community_id', id).order('created_at', { ascending: false });
          if (!posts) return [];

          // Fetch authors for posts (simple unique fetch)
          const authorIds = [...new Set(posts.map((p:any) => p.author_id))];
          if (authorIds.length === 0) return posts.map((p:any) => ({...p, authorName: 'Пользователь'}));

          const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', authorIds);
          
          return posts.map((p: any) => {
              const author = profiles?.find((prof:any) => prof.id === p.author_id);
              return {
                  id: p.id,
                  communityId: p.community_id,
                  authorId: p.author_id,
                  authorName: author?.name || 'Пользователь',
                  authorAvatar: author?.avatar,
                  content: p.content,
                  image: p.image,
                  likes: p.likes || 0,
                  createdAt: p.created_at
              };
          });
      }
      return [];
  },

  async createCommunityPost(id: string, content: string, image?: string): Promise<void> {
      const user = await this.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;

      await supabase.from('community_posts').insert({
          community_id: id,
          author_id: user.id,
          content,
          image
      });
  },

  // --- RENTALS (New CRM Feature) ---
  async getRentals(): Promise<RentalItem[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('rentals').select('*');
          if (data) {
              return data.map((r: any) => ({
                  ...r,
                  pricePerDay: r.price_per_day,
                  authorId: r.author_id,
                  isAvailable: r.is_available
              }));
          }
          return [];
      }
      return mockRentals;
  },

  async getRentalsByAuthor(authorId: string): Promise<RentalItem[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('rentals').select('*').eq('author_id', authorId);
          if (data) {
              return data.map((r: any) => ({
                  ...r,
                  pricePerDay: r.price_per_day,
                  authorId: r.author_id,
                  isAvailable: r.is_available
              }));
          }
      }
      return [];
  },

  async createRental(data: any): Promise<void> {
      const user = await this.getCurrentUser();
      if (!user) return;

      if (isSupabaseConfigured() && supabase) {
          await supabase.from('rentals').insert({
              ...data,
              price_per_day: data.pricePerDay,
              author_id: user.id,
              is_available: true
          });
          return;
      }
      mockRentals.push({ id: Math.random().toString(), ...data, authorId: user.id, isAvailable: true });
  },

  async bookRental(rentalId: string, start: string, end: string, total: number, deposit: number): Promise<void> {
      await delay();
  },

  async getMyRentals(): Promise<RentalBooking[]> {
      return []; 
  },

  async returnRental(id: string): Promise<void> {
      await delay();
  },

  // --- CRM ORDERS & BOOKINGS ---
  
  async getBusinessOrders(businessId: string): Promise<Order[]> {
      // Try DB if possible, else mock
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('orders').select('*').eq('business_id', businessId);
          if (!error && data) {
              return data.map((o:any) => ({ ...o, totalPrice: o.total_price, createdAt: o.created_at }));
          }
          return [];
      }
      return mockOrders.filter(o => o.businessId === businessId);
  },

  async createOrder(businessId: string, items: any[], address: string, totalPrice: number): Promise<void> {
      const user = await this.getCurrentUser();
      if (!user) return;

      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('orders').insert({
              business_id: businessId,
              user_id: user.id,
              items, address,
              total_price: totalPrice,
              status: 'new'
          });
          if (!error) return;
      }
      
      mockOrders.push({
          id: Math.random().toString(),
          businessId, userId: user.id,
          status: 'new', totalPrice, address, items,
          createdAt: new Date().toISOString()
      });
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('orders').update({ status }).eq('id', orderId);
      }
      const o = mockOrders.find(x => x.id === orderId);
      if(o) o.status = status as any;
  },

  async getBusinessBookings(businessId: string): Promise<Booking[]> {
      return []; 
  },

  // --- PRODUCTS/SERVICES ---
  async getProducts(businessId: string): Promise<Product[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('products').select('*').eq('business_id', businessId);
          if (data) return data.map((p:any) => ({...p, businessId: p.business_id}));
      }
      return [];
  },

  async createProduct(data: any): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('products').insert({ ...data, business_id: data.businessId });
      }
  },

  async deleteProduct(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) await supabase.from('products').delete().eq('id', id);
  },

  async getServices(businessId: string): Promise<Service[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('services').select('*').eq('business_id', businessId);
          if (data) return data.map((s:any) => ({...s, businessId: s.business_id, durationMin: s.duration_min}));
      }
      return [];
  },

  async createService(data: any): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('services').insert({ ...data, business_id: data.businessId, duration_min: data.durationMin });
      }
  },

  async deleteService(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) await supabase.from('services').delete().eq('id', id);
  },

  // --- EVENTS ---
  async getEvents(): Promise<Event[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*');
          if (data) return data;
          return [];
      }
      return mockEvents;
  },

  async getEventById(id: string): Promise<Event | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*').eq('id', id).single();
          if (data) return data;
      }
      return mockEvents.find(e => e.id === id) || null;
  },

  async getEventsByAuthor(authorId: string): Promise<Event[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('events').select('*').eq('author_id', authorId);
          if (data) return data;
      }
      return mockEvents.filter(e => e.authorId === authorId);
  },

  async createEvent(data: any): Promise<Event> {
      const user = await this.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          const { data: saved, error } = await supabase.from('events').insert({ ...data, author_id: user.id }).select().single();
          if (!error) return saved;
      }
      const mock = { id: Math.random().toString(), ...data };
      mockEvents.push(mock);
      return mock;
  },

  async updateEvent(id: string, data: Partial<Event>): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('events').update(data).eq('id', id);
      }
  },

  async deleteEvent(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('events').delete().eq('id', id);
      }
      mockEvents = mockEvents.filter(e => e.id !== id);
  },

  // --- ADMIN & STATS ---
  async getSystemStats() {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
              const { count: ads } = await supabase.from('ads').select('*', { count: 'exact', head: true });
              const { count: businesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
              const { count: news } = await supabase.from('news').select('*', { count: 'exact', head: true });
              return {
                  users: users || 0,
                  ads: ads || 0,
                  businesses: businesses || 0,
                  news: news || 0
              };
          } catch(e) {
              console.error("Stats error", e);
          }
      }
      return { 
          users: 125, 
          ads: mockAds.length, 
          businesses: mockBusinesses.length, 
          news: mockNews.length 
      }; 
  },

  async getPendingAds(): Promise<Ad[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('ads').select('*').eq('status', 'pending');
          if (data) return data.map(mapAdFromDB);
      }
      return mockAds.filter(a => a.status === 'pending');
  },

  async approveAd(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('ads').update({ status: 'approved' }).eq('id', id);
      } else {
          const ad = mockAds.find(a => a.id === id);
          if (ad) ad.status = 'approved';
      }
  },

  async rejectAd(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('ads').update({ status: 'rejected' }).eq('id', id);
      } else {
          const ad = mockAds.find(a => a.id === id);
          if (ad) ad.status = 'rejected';
      }
  },

  async getAllAdsForAdmin(): Promise<Ad[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('ads').select('*');
          if (data) return data.map(mapAdFromDB);
      }
      return mockAds;
  },

  async adminToggleVip(id: string, isVip: boolean): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('ads').update({ is_vip: isVip }).eq('id', id);
      } else {
          const ad = mockAds.find(a => a.id === id);
          if (ad) ad.isVip = isVip;
      }
  },

  // --- MISC ---
  async uploadImage(file: File): Promise<string> {
      await delay(800);
      return URL.createObjectURL(file);
  },

  async getNotifications(): Promise<Notification[]> { return []; },
  async subscribeToNotifications(uid: string, cb: any): Promise<any> { return { unsubscribe: () => {} }; },
  async markNotificationRead(id: string) {},
  async deleteNotification(id: string) {},
  async globalSearch(q: string): Promise<any> { return { ads: [], businesses: [], news: [] }; },
  async getWeather(): Promise<any> { return { temp: 24, wind: 3, code: 1 }; },
  async getActivePoll(): Promise<Poll|null> { return null; },
  async createPoll(question: string, options: string[]): Promise<void> { await delay(); },
  async votePoll(id: string, opt: string) {},
  async toggleFavorite(id: string, t: string) { return true; },
  
  // Placeholders
  async getConversations() { return []; },
  async getMessages(cid: string) { return []; },
  async sendMessage(cid: string, txt: string) {},
  async subscribeToMessages(cid: string, cb: any) { return { unsubscribe: () => {} }; },
  async startChat(uid: string, ctx?: string) { return 'new_chat'; },
  async getLostFoundItems(t?: string) { return []; },
  async createLostFoundItem(d: any) {},
  async resolveLostFoundItem(id: string) {},
  async getAppeals() { return []; },
  async createAppeal(d: any) {},
  async resolveAppeal(id: string, img: string) {},
  async getRides() { return []; },
  async createRide(d: any) {},
  async bookRide(id: string) {},
  async getVacancies() { return []; },
  async createVacancy(d: any) {},
  async getResumes() { return []; },
  async createResume(d: any) {},
  async getCoupons() { return []; },
  async getMyCoupons() { return []; },
  async buyCoupon(id: string) {},
  async getQuests() { return []; },
  async completeQuest(id: string, lat: number, lng: number) { return 100; },
  async getLeaderboard() { return []; },
  async bookService(s: any, d: string, t: string) {},
  async topUpWallet(a: number) {},
  async transferMoney(c: string, a: number) {},
  async getTransactions() { return []; },
  async getDeliveryOrders() { return []; },
  async getMyDeliveries() { return []; },
  async takeDelivery(id: string) {},
  async completeDelivery(id: string) {},
  async getUtilityBills() { return []; },
  async submitMeterReading(t: string, v: number) {},
  async payUtilityBill(id: string, a: number) {},
  async getCampaigns() { return []; },
  async donateToCampaign(id: string, a: number) {},
  async getStories() { return []; },
  async createStory(m: string, c: string) {},
  async getSmartDevices() { return []; },
  async controlDevice(id: string, a: string) {},
  async buyTicket(eid: string, r: number, c: number, p: number) {},
  async getBookedSeats(eid: string) { return []; }
};

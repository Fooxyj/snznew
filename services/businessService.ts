
import { Business, Order, Booking, Product, Service, Event, RentalItem, AnalyticsData, Employee, Table, User, AccessRequest } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { mockStore } from './mockData';
import { authService } from './authService';
import { CATEGORIES } from '../constants';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const businessService = {
  async getMyBusinesses(): Promise<Business[]> {
    const user = await authService.getCurrentUser();
    if (!user) return [];
    
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
            .from('businesses')
            .select('*, reviews(rating)')
            .eq('author_id', user.id);

        if (!error && data) {
            return data.map((b: any) => {
                const reviews = b.reviews || [];
                const count = reviews.length;
                const avgRating = count > 0 
                    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count 
                    : 0;

                return {
                    ...b,
                    rating: parseFloat(avgRating.toFixed(1)),
                    reviewsCount: count,
                    workHours: b.work_hours || '',
                    authorId: b.author_id,
                    coverImage: b.cover_image,
                    canPostStories: b.can_post_stories,
                    reviews: undefined
                };
            });
        }
    }
    return mockStore.businesses.filter(b => b.authorId === user.id);
  },

  async getMyBusiness(): Promise<Business | null> {
    const bizs = await this.getMyBusinesses();
    return bizs[0] || null;
  },

  async getBusinessById(id: string): Promise<Business | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('businesses').select('*, reviews(rating)').eq('id', id).single();
        if (data) {
            const reviews = data.reviews || [];
            const count = reviews.length;
            const avgRating = count > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count : 0;
            return { ...data, rating: parseFloat(avgRating.toFixed(1)), reviewsCount: count, workHours: data.work_hours, authorId: data.author_id, coverImage: data.cover_image, canPostStories: data.can_post_stories };
        }
    }
    return mockStore.businesses.find(b => b.id === id) || null;
  },

  async getBusinesses(category?: string): Promise<Business[]> {
    if (isSupabaseConfigured() && supabase) {
        let query = supabase.from('businesses').select('*, reviews(rating)');
        if (category) {
             const categoryObj = CATEGORIES.find(c => c.id === category);
             const targetCategory = categoryObj ? categoryObj.label : category;
             
             if (category === 'shops' && !categoryObj) query = query.eq('category', 'Магазины');
             else if (category === 'cafe' && !categoryObj) query = query.eq('category', 'Кафе и рестораны');
             else query = query.eq('category', targetCategory);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
             return data.map((b: any) => {
                const reviews = b.reviews || [];
                const count = reviews.length;
                const avgRating = count > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count : 0;
                return { ...b, rating: parseFloat(avgRating.toFixed(1)), reviewsCount: count, workHours: b.work_hours, authorId: b.author_id, coverImage: b.cover_image, canPostStories: b.can_post_stories };
            });
        }
    }
    
    let res = mockStore.businesses;
    if (category) {
        const categoryObj = CATEGORIES.find(c => c.id === category);
        const targetCategory = categoryObj ? categoryObj.label : category;
        
        if (category === 'shops') res = res.filter(b => b.category === 'Магазины');
        else if (category === 'cafe') res = res.filter(b => b.category === 'Кафе и рестораны');
        else res = res.filter(b => b.category === targetCategory);
    }
    return res;
  },

  async createBusiness(data: any): Promise<Business> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    const newBiz = { name: data.name, category: data.category, description: data.description, address: data.address, phone: data.phone, work_hours: data.workHours, image: data.image, cover_image: data.coverImage, inn: data.inn, ogrn: data.ogrn, author_id: user.id, rating: 0, reviews_count: 0 };
    if (isSupabaseConfigured() && supabase) {
        const { data: saved, error } = await supabase.from('businesses').insert(newBiz).select().single();
        if (error) throw error;
        return { ...saved, reviewsCount: 0, workHours: saved.work_hours, authorId: saved.author_id, coverImage: saved.cover_image };
    }
    const mock = { id: Math.random().toString(), ...data, authorId: user.id, rating: 0, reviewsCount: 0 };
    mockStore.businesses.push(mock);
    return mock;
  },

  async updateBusiness(id: string, data: Partial<Business>): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const dbData: any = { ...data };
          
          // Map camelCase fields to snake_case for DB
          if (dbData.workHours !== undefined) { 
              dbData.work_hours = dbData.workHours; 
              delete dbData.workHours; 
          }
          if (dbData.coverImage !== undefined) { 
              dbData.cover_image = dbData.coverImage; 
              delete dbData.coverImage; 
          }
          if (dbData.canPostStories !== undefined) {
              dbData.can_post_stories = dbData.canPostStories;
              delete dbData.canPostStories;
          }

          // Remove fields that should not be updated or don't exist in DB
          delete dbData.id;
          delete dbData.authorId; // The source of your error
          delete dbData.rating;
          delete dbData.reviewsCount;
          delete dbData.reviews; 

          const { error } = await supabase.from('businesses').update(dbData).eq('id', id);
          if (error) throw error;
      } else {
          const idx = mockStore.businesses.findIndex(b => b.id === id);
          if (idx !== -1) mockStore.businesses[idx] = { ...mockStore.businesses[idx], ...data };
      }
  },

  async deleteBusiness(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('businesses').delete().eq('id', id);
          if (error) throw error;
      }
      mockStore.businesses = mockStore.businesses.filter(b => b.id !== id);
  },

  // --- ACCESS REQUESTS ---
  async sendAccessRequest(businessId: string, message: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");

      if (isSupabaseConfigured() && supabase) {
          const payload: any = {
              user_id: user.id,
              target_id: businessId,
              target_type: 'access_request',
              reason: message,
              status: 'new'
          };
          
          const { error } = await supabase.from('reports').insert(payload);
          
          if (error) {
              delete payload.target_type;
              await supabase.from('reports').insert(payload);
          }
          return;
      }

      mockStore.accessRequests.push({
          id: Math.random().toString(),
          businessId,
          businessName: mockStore.businesses.find(b => b.id === businessId)?.name || 'Бизнес',
          userId: user.id,
          userName: user.name,
          message,
          createdAt: new Date().toISOString()
      });
  },

  async getAccessRequests(): Promise<AccessRequest[]> {
      if (isSupabaseConfigured() && supabase) {
          let { data, error } = await supabase
            .from('reports')
            .select('*, profiles(name)')
            .eq('target_type', 'access_request')
            .order('created_at', { ascending: false });
          
          if (error) {
              console.warn("Failed to fetch access requests", error);
              return [];
          }

          if (data) {
              const bizIds = data.map((r: any) => r.target_id);
              let bizMap = new Map();
              if (bizIds.length > 0) {
                  const { data: bizs } = await supabase.from('businesses').select('id, name').in('id', bizIds);
                  if (bizs) bizs.forEach((b: any) => bizMap.set(b.id, b.name));
              }

              return data.map((r: any) => ({
                  id: r.id,
                  businessId: r.target_id,
                  businessName: bizMap.get(r.target_id) || 'Unknown',
                  userId: r.user_id,
                  userName: r.profiles?.name || 'User',
                  message: r.reason,
                  createdAt: r.created_at
              }));
          }
          return [];
      }
      return mockStore.accessRequests;
  },

  async deleteAccessRequest(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('reports').delete().eq('id', id);
          return;
      }
      mockStore.accessRequests = mockStore.accessRequests.filter(r => r.id !== id);
  },

  async grantStoryAccess(businessId: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized");

      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('businesses').update({ can_post_stories: true }).eq('id', businessId);
          if (error) throw error;
      }
      const b = mockStore.businesses.find(x => x.id === businessId);
      if (b) b.canPostStories = true;
  },

  // --- CRM DATA & PRODUCTS/SERVICES (Existing methods) ---
  async getBusinessOrders(bid: string): Promise<Order[]> { return mockStore.orders.filter(o => o.businessId === bid); },
  async createOrder(bid: string, items: any[], addr: string, total: number) { mockStore.orders.push({ id: Math.random().toString(), businessId: bid, items, address: addr, totalPrice: total, status: 'new', userId: 'me', createdAt: new Date().toISOString() }); },
  async updateOrderStatus(oid: string, s: string) { const idx = mockStore.orders.findIndex(o => o.id === oid); if (idx !== -1) mockStore.orders[idx].status = s as any; },
  async getBusinessBookings(bid: string): Promise<Booking[]> { return []; },
  async getProducts(bid: string): Promise<Product[]> {
      if (isSupabaseConfigured() && supabase) { const { data } = await supabase.from('products').select('*').eq('business_id', bid); if (data) return data.map((p: any) => ({ id: p.id, businessId: p.business_id, name: p.name, description: p.description, price: p.price, image: p.image, category: p.category })); }
      return [];
  },
  async createProduct(d: any) { if (isSupabaseConfigured() && supabase) { await supabase.from('products').insert({ business_id: d.businessId, name: d.name, description: d.description, price: d.price, image: d.image, category: d.category }); } },
  async deleteProduct(id: string) { if (isSupabaseConfigured() && supabase) { await supabase.from('products').delete().eq('id', id); } },
  async getServices(bid: string): Promise<Service[]> {
      if (isSupabaseConfigured() && supabase) { const { data } = await supabase.from('services').select('*').eq('business_id', bid); if (data) return data.map((s: any) => ({ id: s.id, businessId: s.business_id, title: s.title, price: s.price, durationMin: s.duration_min })); }
      return [];
  },
  async createService(d: any) { if (isSupabaseConfigured() && supabase) { await supabase.from('services').insert({ business_id: d.businessId, title: d.title, price: d.price, duration_min: d.durationMin }); } },
  async deleteService(id: string) { if (isSupabaseConfigured() && supabase) { await supabase.from('services').delete().eq('id', id); } },
  async bookService(s: any, d: string, t: string) {},
  async getBusinessAnalytics(businessId: string): Promise<AnalyticsData[]> { await delay(600); return [{ date: 'Пн', revenue: 5000, visitors: 20 }]; },
  async getBusinessEmployees(businessId: string): Promise<Employee[]> { await delay(400); return []; },
  async addEmployee(businessId: string, email: string, role: 'manager' | 'staff'): Promise<Employee> { await delay(800); return { id: 'e1', businessId, name: 'Emp', role, avatar: '', joinedAt: '' }; },
  async removeEmployee(id: string): Promise<void> { await delay(400); },
  async sendBusinessPush(businessId: string, title: string, message: string): Promise<number> { await delay(1000); return 50; },
  async getBusinessTables(businessId: string): Promise<Table[]> { await delay(300); return []; },
  async updateTableStatus(tableId: string, status: 'free' | 'reserved' | 'occupied'): Promise<void> { await delay(200); },
  async getEventsByAuthor(aid: string): Promise<Event[]> { return []; },
  async getRentalsByAuthor(aid: string): Promise<RentalItem[]> { return []; },
};

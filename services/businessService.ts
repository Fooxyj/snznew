
import { Business, Order, Booking, Product, Service, Event, RentalItem, AnalyticsData, Employee, Table, User } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { mockStore } from './mockData';
import { authService } from './authService';

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
        const { data } = await supabase
            .from('businesses')
            .select('*, reviews(rating)')
            .eq('id', id)
            .single();
            
        if (data) {
            const reviews = data.reviews || [];
            const count = reviews.length;
            const avgRating = count > 0 
                ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count 
                : 0;

            return { 
                ...data, 
                rating: parseFloat(avgRating.toFixed(1)),
                reviewsCount: count,
                workHours: data.work_hours, 
                authorId: data.author_id,
                coverImage: data.cover_image,
                reviews: undefined
            };
        }
    }
    return mockStore.businesses.find(b => b.id === id) || null;
  },

  async getBusinesses(category?: string): Promise<Business[]> {
    if (isSupabaseConfigured() && supabase) {
        let query = supabase.from('businesses').select('*, reviews(rating)');
        if (category) {
             if (category === 'shops') query = query.eq('category', 'Магазины');
             else if (category === 'cafe') query = query.eq('category', 'Кафе и рестораны');
             else if (category === 'sport') query = query.ilike('category', '%Спорт%');
             else if (category === 'rent') query = query.ilike('category', '%Аренда%');
             else if (category === 'beauty') query = query.eq('category', 'Красота');
             else if (category === 'cinema') query = query.eq('category', 'Кино');
             else if (category === 'tourism') query = query.eq('category', 'Туризм');
             else if (category === 'cargo') query = query.eq('category', 'Грузоперевозки');
             else if (category === 'med_center') query = query.in('category', ['Медицина', 'Медицинские центры', 'Клиники', 'Стоматология']);
             else if (category === 'med_org') query = query.in('category', ['Медицинские организации', 'Больницы', 'Поликлиники']);
             else if (category === 'med') query = query.ilike('category', '%Медицин%');
             else if (category === 'carwash') query = query.eq('category', 'Автомойки');
             else if (category === 'autoservice') query = query.eq('category', 'Автосервисы');
             else if (category === 'taxi') query = query.eq('category', 'Такси');
             else query = query.eq('category', category);
        }

        const { data, error } = await query;
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
                    workHours: b.work_hours, 
                    authorId: b.author_id, 
                    coverImage: b.cover_image,
                    reviews: undefined
                };
            });
        }
        return [];
    }
    
    let res = mockStore.businesses;
    if (category) {
        if (category === 'shops') res = res.filter(b => b.category === 'Магазины');
        else if (category === 'cafe') res = res.filter(b => b.category === 'Кафе и рестораны');
    }
    return res;
  },

  async createBusiness(data: any): Promise<Business> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const newBiz = { 
        name: data.name,
        category: data.category,
        description: data.description,
        address: data.address,
        phone: data.phone,
        work_hours: data.workHours,
        image: data.image,
        cover_image: data.coverImage,
        author_id: user.id, 
        rating: 0, 
        reviews_count: 0 
    };

    if (isSupabaseConfigured() && supabase) {
        const { data: saved, error } = await supabase.from('businesses').insert(newBiz).select().single();
        if (error) throw error;
        return { 
            ...saved, 
            reviewsCount: 0, 
            workHours: saved.work_hours, 
            authorId: saved.author_id,
            coverImage: saved.cover_image
        };
    }

    const mock = { id: Math.random().toString(), ...data, authorId: user.id, rating: 0, reviewsCount: 0 };
    mockStore.businesses.push(mock);
    return mock;
  },

  async updateBusiness(id: string, data: Partial<Business>): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const dbData: any = { ...data };
          if (data.workHours) {
              dbData.work_hours = data.workHours;
              delete dbData.workHours;
          }
          if (data.coverImage) {
              dbData.cover_image = data.coverImage;
              delete dbData.coverImage;
          }
          await supabase.from('businesses').update(dbData).eq('id', id);
      }
      const idx = mockStore.businesses.findIndex(b => b.id === id);
      if (idx !== -1) mockStore.businesses[idx] = { ...mockStore.businesses[idx], ...data };
  },

  async deleteBusiness(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('businesses').delete().eq('id', id);
      }
      mockStore.businesses = mockStore.businesses.filter(b => b.id !== id);
  },

  // --- CRM DATA ---
  async getBusinessOrders(bid: string): Promise<Order[]> { 
      return mockStore.orders.filter(o => o.businessId === bid); 
  },
  
  async createOrder(bid: string, items: any[], addr: string, total: number) {
      mockStore.orders.push({ id: Math.random().toString(), businessId: bid, items, address: addr, totalPrice: total, status: 'new', userId: 'me', createdAt: new Date().toISOString() });
  },
  
  async updateOrderStatus(oid: string, s: string) {
      const idx = mockStore.orders.findIndex(o => o.id === oid);
      if (idx !== -1) mockStore.orders[idx].status = s as any;
  },

  async getBusinessBookings(bid: string): Promise<Booking[]> { return []; },

  // --- PRODUCTS ---
  async getProducts(bid: string): Promise<Product[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('products').select('*').eq('business_id', bid);
          if (data) return data.map((p: any) => ({
              id: p.id,
              businessId: p.business_id,
              name: p.name,
              description: p.description,
              price: p.price,
              image: p.image,
              category: p.category
          }));
      }
      return [];
  },

  async createProduct(d: any) {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('products').insert({
              business_id: d.businessId,
              name: d.name,
              description: d.description,
              price: d.price,
              image: d.image,
              category: d.category
          });
      }
  },

  async deleteProduct(id: string) {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('products').delete().eq('id', id);
      }
  },
  
  // --- SERVICES ---
  async getServices(bid: string): Promise<Service[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('services').select('*').eq('business_id', bid);
          if (data) return data.map((s: any) => ({
              id: s.id,
              businessId: s.business_id,
              title: s.title,
              price: s.price,
              durationMin: s.duration_min
          }));
      }
      return [];
  },

  async createService(d: any) {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('services').insert({
              business_id: d.businessId,
              title: d.title,
              price: d.price,
              duration_min: d.durationMin
          });
      }
  },

  async deleteService(id: string) {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('services').delete().eq('id', id);
      }
  },

  async bookService(s: any, d: string, t: string) {},

  async getBusinessAnalytics(businessId: string): Promise<AnalyticsData[]> {
      await delay(600);
      const data: AnalyticsData[] = [];
      const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      
      for (let i = 0; i < 7; i++) {
          data.push({
              date: days[i],
              revenue: Math.floor(Math.random() * 15000) + 5000,
              visitors: Math.floor(Math.random() * 100) + 20
          });
      }
      return data;
  },

  async getBusinessEmployees(businessId: string): Promise<Employee[]> {
      await delay(400);
      return [
          { id: 'e1', businessId, name: 'Ирина Администратор', role: 'manager', avatar: 'https://i.pravatar.cc/150?u=e1', joinedAt: '2023-01-10' },
          { id: 'e2', businessId, name: 'Алексей Официант', role: 'staff', avatar: 'https://i.pravatar.cc/150?u=e2', joinedAt: '2023-05-20' },
          { id: 'e3', businessId, name: 'Мария Кассир', role: 'staff', avatar: 'https://i.pravatar.cc/150?u=e3', joinedAt: '2024-02-15' },
      ];
  },

  async addEmployee(businessId: string, email: string, role: 'manager' | 'staff'): Promise<Employee> {
      await delay(800);
      return {
          id: Math.random().toString(),
          businessId,
          name: email.split('@')[0],
          email,
          role,
          avatar: `https://ui-avatars.com/api/?name=${email}&background=random`,
          joinedAt: new Date().toISOString()
      };
  },

  async removeEmployee(id: string): Promise<void> { await delay(400); },
  
  async sendBusinessPush(businessId: string, title: string, message: string): Promise<number> {
      await delay(1000);
      return Math.floor(Math.random() * 200) + 50; 
  },

  async getBusinessTables(businessId: string): Promise<Table[]> {
      await delay(300);
      return [
          { id: 't1', businessId, name: 'Стол 1', seats: 2, x: 10, y: 10, status: 'free', shape: 'circle' },
          { id: 't2', businessId, name: 'Стол 2', seats: 2, x: 10, y: 40, status: 'occupied', shape: 'circle' },
          { id: 't3', businessId, name: 'Стол 3', seats: 4, x: 10, y: 70, status: 'reserved', shape: 'rect' },
          { id: 't4', businessId, name: 'VIP 1', seats: 6, x: 60, y: 20, status: 'free', shape: 'rect' },
          { id: 't5', businessId, name: 'VIP 2', seats: 6, x: 60, y: 60, status: 'free', shape: 'rect' },
          { id: 't6', businessId, name: 'Бар', seats: 1, x: 35, y: 10, status: 'occupied', shape: 'rect' },
      ];
  },

  async updateTableStatus(tableId: string, status: 'free' | 'reserved' | 'occupied'): Promise<void> { await delay(200); },

  // Inventory-related stubs/mocks
  async getEventsByAuthor(aid: string): Promise<Event[]> { return []; },
  async getRentalsByAuthor(aid: string): Promise<RentalItem[]> { return []; },
};

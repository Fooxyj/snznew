
import { Business, Order, Booking, Product, Service, Event, RentalItem, AnalyticsData, Employee, Table, User, AccessRequest, RentalBooking, UserRole, Review } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { CATEGORIES } from '../constants';

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

export const businessService = {
  // Вспомогательная функция для жесткой синхронизации агрегатов
  async syncBusinessStats(businessId: string): Promise<{ rating: number, count: number }> {
      if (!isSupabaseConfigured() || !supabase) return { rating: 0, count: 0 };
      
      const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('business_id', businessId);
      
      if (!reviews || reviews.length === 0) {
          await supabase.from('businesses').update({ rating: 0, reviews_count: 0 }).eq('id', businessId);
          return { rating: 0, count: 0 };
      }

      const count = reviews.length;
      const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
      const avg = parseFloat((sum / count).toFixed(1));

      await supabase.from('businesses').update({ 
          rating: avg, 
          reviews_count: count 
      }).eq('id', businessId);

      return { rating: avg, count };
  },

  async getMyBusinesses(): Promise<Business[]> {
    const user = await authService.getCurrentUser();
    if (!user) return [];
    
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('author_id', user.id);

        if (!error && data) {
            return data.map(mapBusinessFromDB);
        }
    }
    return [];
  },

  async getBusinessById(id: string): Promise<Business | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('businesses').select('*').eq('id', id).maybeSingle();
        if (data) return mapBusinessFromDB(data);
    }
    return null;
  },

  async getBusinesses(category?: string): Promise<Business[]> {
    if (isSupabaseConfigured() && supabase) {
        let query = supabase.from('businesses').select('*');
        
        if (category) {
             const categoryObj = CATEGORIES.find(c => c.id === category);
             const targetLabel = categoryObj ? categoryObj.label : category;
             
             if (category === 'med' || category === 'med_center' || category === 'med_org') {
                 query = query.or(`category.eq.Медицина,category.eq.Медицинские центры,category.eq.Медицинские Организации`);
             } else if (category === 'handmade') {
                 query = query.or(`category.ilike.%Хендмейд%,category.ilike.%Услуги%,category.eq.Домашняя еда,is_master.eq.true,name.ilike.%Торт%,name.ilike.%на заказ%`);
             } else if (category === 'cafe') {
                 query = query.eq('category', 'Кафе и рестораны').not('name', 'ilike', '%Торт%').not('name', 'ilike', '%на заказ%');
             } else {
                 query = query.eq('category', targetLabel);
             }
        }

        const { data, error } = await query;
        if (!error && data) {
             return data.map(mapBusinessFromDB);
        }
    }
    return [];
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
        website: data.website || '',
        work_hours: data.workHours, 
        image: data.image, 
        cover_image: data.coverImage, 
        inn: data.inn, 
        ogrn: data.ogrn, 
        author_id: user.id, 
        is_master: !!data.isMaster,
        verification_status: data.verificationStatus || 'pending'
    };
    if (isSupabaseConfigured() && supabase) {
        const { data: saved, error } = await supabase.from('businesses').insert(newBiz).select().single();
        if (error) throw error;
        return mapBusinessFromDB(saved);
    }
    throw new Error("Supabase is not configured");
  },

  async updateBusiness(id: string, data: Partial<Business>): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const dbData: any = { ...data };
          if (dbData.workHours !== undefined) { dbData.work_hours = dbData.workHours; delete dbData.workHours; }
          if (dbData.coverImage !== undefined) { dbData.cover_image = dbData.coverImage; delete dbData.coverImage; }
          if (dbData.canPostStories !== undefined) { dbData.can_post_stories = dbData.canPostStories; delete dbData.canPostStories; }
          if (dbData.isMaster !== undefined) { dbData.is_master = dbData.isMaster; delete dbData.isMaster; }
          
          delete dbData.id;
          delete dbData.authorId; 
          delete dbData.rating;
          delete dbData.reviewsCount;
          delete dbData.reviews;
          delete dbData.verificationStatus;

          const { error } = await supabase.from('businesses').update(dbData).eq('id', id);
          if (error) throw error;
      }
  },

  async deleteBusiness(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('businesses').delete().eq('id', id);
          if (error) throw error;
      }
  },

  async sendAccessRequest(businessId: string, message: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('reports').insert({ user_id: user.id, target_id: businessId, target_type: 'access_request', reason: message, status: 'new' });
      }
  },

  async getAccessRequests(): Promise<AccessRequest[]> {
      if (isSupabaseConfigured() && supabase) {
          let { data, error } = await supabase.from('reports').select('*, profiles(name)').eq('target_type', 'access_request').order('created_at', { ascending: false });
          if (error) return [];
          if (data) {
              const bizIds = data.map((r: any) => r.target_id);
              let bizMap = new Map();
              if (bizIds.length > 0) { const { data: bizs } = await supabase.from('businesses').select('id, name').in('id', bizIds); if (bizs) bizs.forEach((b: any) => bizMap.set(b.id, b.name)); }
              return data.map((r: any) => ({ id: r.id, businessId: r.target_id, businessName: bizMap.get(r.target_id) || 'Unknown', userId: r.user_id, userName: r.profiles?.name || 'User', message: r.reason, createdAt: r.created_at }));
          }
      }
      return [];
  },

  async deleteAccessRequest(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) await supabase.from('reports').delete().eq('id', id);
  },

  async grantStoryAccess(businessId: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('businesses').update({ can_post_stories: true }).eq('id', businessId);
          if (error) throw error;
      }
  },

  async getBusinessOrders(bid: string): Promise<Order[]> { 
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('orders').select('*').eq('business_id', bid).order('created_at', { ascending: false });
          return data || [];
      }
      return [];
  },

  async createOrder(bid: string, items: any[], addr: string, total: number) {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('orders').insert({ business_id: bid, user_id: user.id, items, address: addr, total_price: total, status: 'new' });
  },

  async updateOrderStatus(oid: string, s: string) {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('orders').update({ status: s }).eq('id', oid);
      }
  },
  
  async getBusinessBookings(bid: string): Promise<Booking[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('bookings').select('*, services(title, price)').eq('business_id', bid);
          if (data) return data.map((b: any) => ({ id: b.id, serviceId: b.service_id, businessId: b.business_id, userId: b.user_id, date: b.date, time: b.time, status: b.status, serviceTitle: b.services?.title, price: b.services?.price }));
      }
      return [];
  },

  async getProducts(bid: string): Promise<Product[]> {
      if (isSupabaseConfigured() && supabase) { const { data } = await supabase.from('products').select('*').eq('business_id', bid); if (data) return data.map((p: any) => ({ id: p.id, businessId: p.business_id, name: p.name, description: p.description, price: p.price, image: p.image, category: p.category })); }
      return [];
  },

  async createProduct(d: any) { if (isSupabaseConfigured() && supabase) { await supabase.from('products').insert({ business_id: d.businessId, name: d.name, description: d.description, price: d.price, image: d.image, category: d.category }); } },

  async updateProduct(id: string, data: Partial<Product>): Promise<void> { if (isSupabaseConfigured() && supabase) { await supabase.from('products').update(data).eq('id', id); } },

  async deleteProduct(id: string) { if (isSupabaseConfigured() && supabase) { await supabase.from('products').delete().eq('id', id); } },
  
  async getServices(bid: string): Promise<Service[]> {
      if (isSupabaseConfigured() && supabase) { const { data } = await supabase.from('services').select('*').eq('business_id', bid); if (data) return data.map((s: any) => ({ id: s.id, businessId: s.business_id, title: s.title, price: s.price, durationMin: s.duration_min, description: s.description, image: s.image })); }
      return [];
  },

  async createService(d: any) { if (isSupabaseConfigured() && supabase) { await supabase.from('services').insert({ business_id: d.businessId, title: d.title, price: d.price, duration_min: d.durationMin, description: d.description, image: d.image }); } },

  async deleteService(id: string) { if (isSupabaseConfigured() && supabase) { await supabase.from('services').delete().eq('id', id); } },

  async bookService(s: any, d: string, t: string) {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('bookings').insert({ service_id: s.id, business_id: s.businessId, user_id: user.id, date: d, time: t, status: 'confirmed' });
  },
  
  async getBusinessAnalytics(businessId: string): Promise<AnalyticsData[]> { 
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('business_analytics').select('*').eq('business_id', businessId).order('date', { ascending: true });
          return data || [];
      }
      return [];
  },

  async getBusinessEmployees(businessId: string): Promise<Employee[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data = [] } = await supabase.from('employees').select('*').eq('business_id', businessId);
          return data;
      }
      return [];
  },

  async addEmployee(businessId: string, email: string, role: 'manager' | 'staff'): Promise<Employee> {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('employees').insert({ business_id: businessId, email, role, name: email.split('@')[0], avatar: `https://ui-avatars.com/api/?name=${email}` }).select().single();
          if (error) throw error;
          return data;
      }
      throw new Error("Supabase not configured");
  },

  async removeEmployee(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('employees').delete().eq('id', id);
      }
  },

  async sendBusinessPush(businessId: string, title: string, message: string): Promise<number> {
      return 0; // Simulation
  },
  
  async getBusinessTables(businessId: string): Promise<Table[]> { 
      if (isSupabaseConfigured() && supabase) { const { data } = await supabase.from('tables').select('*').eq('business_id', businessId); return data || []; }
      return []; 
  },
  
  async updateTableStatus(tableId: string, status: 'free' | 'reserved' | 'occupied'): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('tables').update({ status }).eq('id', tableId);
      }
  },
  
  async getEventsByAuthor(aid: string): Promise<Event[]> {
      if (isSupabaseConfigured() && supabase) { const { data } = await supabase.from('events').select('*').eq('author_id', aid); return data?.map((e: any) => ({ ...e, authorId: e.author_id })) || []; }
      return [];
  },

  async getBookedSeats(eventId: string): Promise<{row: number, col: number}[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('tickets').select('row, col').eq('event_id', eventId);
          return data || [];
      }
      return [];
  },

  async buyTicket(eventId: string, row: number, col: number, price: number): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('tickets').insert({ event_id: eventId, user_id: user.id, row, col, price, qr_code: `ticket-${Date.now()}` });
  },

  async getReviews(businessId: string): Promise<Review[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('business_id', businessId);
          
          if (error || !data) return [];

          // Сортировка: Сначала новые (null date), затем по убыванию даты
          const sortedData = data.sort((a, b) => {
              if (!a.date && b.date) return -1;
              if (a.date && !b.date) return 1;
              const dateA = new Date(a.date || a.created_at || 0).getTime();
              const dateB = new Date(b.date || b.created_at || 0).getTime();
              return dateB - dateA;
          });

          const userIds = [...new Set(sortedData.map((r: any) => r.author_id || r.user_id).filter(Boolean))];
          let profMap = new Map();
          
          if (userIds.length > 0) {
              const { data: profs } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
              if (profs) profs.forEach(p => profMap.set(p.id, p));
          }

          const mappedReviews = sortedData.map((r: any) => {
              const author = profMap.get(r.author_id || r.user_id);
              return { 
                  id: r.id, 
                  businessId: r.business_id, 
                  authorName: r.author_name || author?.name || 'Житель Снежинска', 
                  authorAvatar: r.author_avatar || author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.author_name || author?.name || 'U')}`, 
                  rating: Number(r.rating || 0), 
                  text: r.text, 
                  date: formatRelativeDate(r.date || r.created_at) 
              };
          });

          // Жесткая синхронизация при каждом получении для исправления расхождений
          this.syncBusinessStats(businessId).then();

          return mappedReviews;
      }
      return [];
  },

  async addReview(businessId: string, rating: number, text: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
      
      const { error } = await supabase.from('reviews').insert({ 
          business_id: businessId, 
          user_id: user.id, 
          author_id: user.id,
          author_name: user.name, 
          author_avatar: user.avatar, 
          rating, 
          text 
      });

      if (error) throw error;

      // Сразу обновляем статистику бизнеса
      await this.syncBusinessStats(businessId);
  },

  async getRentalsByAuthor(aid: string): Promise<RentalItem[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('rentals').select('*').eq('author_id', aid);
          return data?.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              image: r.image,
              pricePerDay: r.price_per_day,
              deposit: r.deposit,
              category: r.category,
              authorId: r.author_id,
              isAvailable: r.is_available,
              status: r.status
          })) || [];
      }
      return [];
  },

  async getRentals(): Promise<RentalItem[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('rentals').select('*').eq('is_available', true).eq('status', 'approved');
          return data?.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              image: r.image,
              pricePerDay: r.price_per_day,
              deposit: r.deposit,
              category: r.category,
              authorId: r.author_id,
              isAvailable: r.is_available,
              status: r.status
          })) || [];
      }
      return [];
  },

  async createRental(data: any): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      
      const status = user.role === UserRole.ADMIN ? 'approved' : 'pending';

      if (isSupabaseConfigured() && supabase) {
          await supabase.from('rentals').insert({
              title: data.title,
              description: data.description,
              image: data.image,
              price_per_day: Number(data.pricePerDay),
              deposit: Number(data.deposit),
              category: data.category,
              author_id: user.id,
              is_available: true,
              status: status
          });
      }
  },

  async deleteRental(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('rentals').delete().eq('id', id);
      }
  },

  async getMyRentals(): Promise<RentalBooking[]> {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          const { data } = await supabase.from('rental_bookings').select('*').eq('renter_id', user.id);
          return data?.map((b: any) => ({
              id: b.id,
              rentalId: b.rental_id,
              renterId: b.renter_id,
              rentalTitle: b.rental_title,
              rentalImage: b.rental_image,
              startDate: b.start_date,
              endDate: b.end_date,
              totalPrice: b.total_price,
              deposit: b.deposit,
              status: b.status
          })) || [];
      }
      return [];
  },

  async bookRental(id: string, start: string, end: string, total: number, dep: number): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      if (isSupabaseConfigured() && supabase) {
          const { data: rental } = await supabase.from('rentals').select('title, image').eq('id', id).single();
          await supabase.from('rental_bookings').insert({
              rental_id: id,
              renter_id: user.id,
              rental_title: rental?.title,
              rental_image: rental?.image,
              start_date: start,
              end_date: end,
              total_price: total,
              deposit: dep,
              status: 'active'
          });
          await supabase.from('rentals').update({ is_available: false }).eq('id', id);
      }
  },

  async returnRental(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { data: booking } = await supabase.from('rental_bookings').update({ status: 'returned' }).eq('id', id).select().single();
          if (booking) {
              await supabase.from('rentals').update({ is_available: true }).eq('id', booking.rental_id);
          }
      }
  },

  async getDeliveryOrders(): Promise<Order[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('orders').select('*').eq('status', 'delivery');
          return data || [];
      }
      return [];
  },
  async getMyDeliveries(): Promise<Order[]> {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          const { data = [] } = await supabase.from('orders').select('*').eq('courier_id', user.id);
          return data || [];
      }
      return [];
  },
  async takeDelivery(id: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          await supabase.from('orders').update({ courier_id: user.id, status: 'delivery' }).eq('id', id);
      }
  },
  async completeDelivery(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('orders').update({ status: 'done' }).eq('id', id);
      }
  },
};

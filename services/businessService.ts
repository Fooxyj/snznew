
import { Business, Order, Booking, Product, Service, Event, RentalItem, AnalyticsData, Employee, Table, User, AccessRequest, RentalBooking, UserRole, Review, Ad } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { CATEGORIES } from '../constants';
import { mockStore } from '../services/mockData';

const formatRelativeDate = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === '') return 'Недавно';
    
    const normalizedDate = dateStr.includes(' ') && !dateStr.includes('T') 
        ? dateStr.replace(' ', 'T') 
        : dateStr;
    
    let date = new Date(normalizedDate);
    if (isNaN(date.getTime())) return 'Недавно';
    
    const now = new Date();
    const isToday = now.getDate() === date.getDate() && now.getMonth() === date.getMonth() && now.getFullYear() === date.getFullYear();
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = yesterday.getDate() === date.getDate() && yesterday.getMonth() === date.getMonth() && yesterday.getFullYear() === date.getFullYear();

    const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Сегодня в ${timeStr}`;
    if (isYesterday) return `Вчера в ${timeStr}`;
    
    return `${date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })} в ${timeStr}`;
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

const mapAdFromDB = (a: any): Ad => {
    return {
        id: a.id,
        title: a.title,
        price: a.price,
        currency: a.currency || '₽',
        category: a.category,
        image: a.image,
        images: a.images || (a.image ? [a.image] : []),
        date: formatRelativeDate(a.created_at || a.date),
        authorId: a.author_id,
        description: a.description || '',
        location: a.location || 'Снежинск',
        isVip: !!a.is_vip,
        isPremium: !!a.is_premium,
        status: a.status || 'approved'
    };
};

const mapOrderFromDB = (o: any): Order => ({
    id: o.id,
    businessId: o.business_id,
    businessName: o.business_name,
    businessAddress: o.business_address,
    userId: o.user_id,
    items: o.items,
    address: o.address,
    totalPrice: o.total_price,
    deliveryFee: o.delivery_fee,
    status: o.status,
    createdAt: o.created_at,
    courierId: o.courier_id
});

export const businessService = {
  async createAd(data: any): Promise<Ad> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
      const dbData = { ...data, author_id: user.id, is_vip: data.isVip, is_premium: data.isPremium, status: 'pending' };
      delete dbData.isVip; delete dbData.isPremium;
      const { data: saved, error } = await supabase.from('ads').insert(dbData).select().single();
      if (error) throw error;
      return mapAdFromDB(saved);
  },

  async updateAd(id: string, data: Partial<Ad>) {
      if (isSupabaseConfigured() && supabase) {
          const dbData: any = { ...data };
          if (dbData.authorId) { dbData.author_id = dbData.authorId; delete dbData.authorId; }
          if (dbData.isVip !== undefined) { dbData.is_vip = dbData.isVip; delete dbData.isVip; }
          if (dbData.isPremium !== undefined) { dbData.is_premium = dbData.isPremium; delete dbData.isPremium; }
          delete dbData.id;
          await supabase.from('ads').update(dbData).eq('id', id);
      }
  },

  async syncBusinessStats(businessId: string): Promise<{ rating: number, count: number }> {
      try {
          if (!isSupabaseConfigured() || !supabase) return { rating: 0, count: 0 };
          const { data: reviews } = await supabase.from('reviews').select('rating').eq('business_id', businessId);
          if (!reviews || reviews.length === 0) {
              await supabase.from('businesses').update({ rating: 0, reviews_count: 0 }).eq('id', businessId);
              return { rating: 0, count: 0 };
          }
          const count = reviews.length;
          const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
          const avg = parseFloat((sum / count).toFixed(1));
          await supabase.from('businesses').update({ rating: avg, reviews_count: count }).eq('id', businessId);
          return { rating: avg, count };
      } catch (e: any) {
          console.error("Sync stats failed:", e?.message || e);
          return { rating: 0, count: 0 };
      }
  },

  async getMyBusinesses(): Promise<Business[]> {
    try {
        const user = await authService.getCurrentUser();
        if (!user) return [];
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.from('businesses').select('*').eq('author_id', user.id);
            if (error) throw error;
            if (data) return data.map(mapBusinessFromDB);
        }
    } catch (e: any) { console.error("Get my businesses failed:", e?.message || e); }
    return [];
  },

  async getBusinessById(id: string): Promise<Business | null> {
    try {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.from('businesses').select('*').eq('id', id).maybeSingle();
            if (error) throw error;
            if (data) return mapBusinessFromDB(data);
        }
    } catch (e: any) { console.error("Get business by id failed:", e?.message || e); }
    return mockStore.businesses.find(b => b.id === id) || null;
  },

  async getBusinesses(category?: string): Promise<Business[]> {
    try {
        if (isSupabaseConfigured() && supabase) {
            let query = supabase.from('businesses').select('*');
            
            if (category) {
                 if (category === 'shops') {
                    query = query.eq('is_master', false).or('category.eq.Магазины,category.ilike.%Маркет%,category.eq.Строительные');
                 } else if (category === 'food_market') {
                    query = query.or('category.eq.Продукты,category.ilike.%Фермер%,category.eq.Супермаркеты');
                 } else if (category === 'home_garden') {
                    query = query.or('category.eq.Дом и Сад,category.eq.Мебель,category.eq.Хозтовары');
                 } else if (category === 'construction') {
                    query = query.or('category.eq.Строительные,category.ilike.%Строй%,category.eq.Ремонт');
                 } else if (category === 'tech_digital') {
                    query = query.or('category.eq.Техника,category.eq.Электроника,category.eq.Смартфоны');
                 } else if (category === 'handmade') {
                    query = query.eq('is_master', true).or('category.ilike.%Хендмейд%,category.eq.Домашняя еда,category.ilike.%Торт%,category.eq.Еда и Хендмейд');
                 } else if (category === 'home_repair') {
                    query = query.eq('is_master', true).or('category.ilike.%Ремонт%,category.eq.Электрик,category.eq.Сантехник,category.eq.Ремонт и Быт');
                 } else if (category === 'education') {
                    query = query.or('category.eq.Обучение,category.eq.Репетиторы,category.eq.Курсы');
                 } else if (category === 'beauty_masters') {
                    query = query.eq('is_master', true).or('category.ilike.%Красота%,category.ilike.%Здоровье%,category.ilike.%Маникюр%,category.ilike.%Массаж%');
                 } else if (category === 'digital_pros') {
                    query = query.eq('is_master', true).or('category.ilike.%IT%,category.ilike.%Фриланс%,category.ilike.%Разраб%,category.ilike.%Настройка%');
                 } else if (category === 'creative') {
                    query = query.eq('is_master', true).or('category.ilike.%Фото%,category.ilike.%Дизайн%,category.ilike.%Креатив%,category.ilike.%Видео%');
                 } else if (category === 'events_pros') {
                    query = query.eq('is_master', true).or('category.ilike.%Праздник%,category.ilike.%Шоу%,category.ilike.%Ведущий%,category.ilike.%Аниматор%');
                 } else if (category === 'cleaning') {
                    query = query.eq('is_master', true).or('category.ilike.%Уборка%,category.ilike.%Клининг%');
                 } else if (category === 'pets_service') {
                    query = query.eq('is_master', true).or('category.ilike.%Зоо%,category.ilike.%Собак%,category.ilike.%Кошек%,category.ilike.%Груминг%');
                 } else if (category === 'car_service') {
                    query = query.or('category.eq.Автосервисы,category.eq.Мойки,category.eq.Шиномонтаж');
                 } else if (category === 'med') {
                    query = query.or('category.eq.Медицина,category.eq.Аптеки,category.eq.Медицинские центры');
                 } else if (category === 'cafe') {
                    query = query.eq('category', 'Кафе и рестораны').eq('is_master', false);
                 } else if (category === 'rent') {
                    query = query.or('category.eq.Аренда и Отдых,category.eq.Аренда,category.eq.Прокат');
                 } else if (category === 'transport') {
                    query = query.or('category.eq.Транспорт,category.eq.Такси,category.eq.Грузоперевозки');
                 } else if (category === 'beauty') {
                    query = query.or('category.eq.Красота и Уход,category.eq.Красота,category.ilike.%Салон%,category.ilike.%Барбер%');
                 } else {
                    const categoryObj = CATEGORIES.find(c => c.id === category);
                    query = query.eq('category', categoryObj ? categoryObj.label : category);
                 }
            }

            const { data, error } = await query;
            if (error) throw error;
            if (data) return data.map(mapBusinessFromDB);
        }
    } catch (e: any) { 
        if (e?.message !== 'Supabase is not configured') {
            console.error("Get businesses failed:", e?.message || e);
        }
    }

    if (!category || category === 'all') return mockStore.businesses;

    const categoryObj = CATEGORIES.find(c => c.id === category);
    const label = categoryObj?.label || category;

    return mockStore.businesses.filter(b => {
        if (category === 'shops') return !b.isMaster && (b.category === 'Магазины' || b.category.includes('Маркет') || b.category === 'Строительные');
        if (category === 'handmade') return !!b.isMaster && (b.category.includes('Хендмейд') || b.category === 'Домашняя еда' || b.category.includes('Торт') || b.category === 'Еда и Хендмейд');
        if (category === 'cafe') return b.category === 'Кафе и рестораны' && !b.isMaster;
        if (category === 'rent') return b.category === 'Аренда и Отдых' || b.category === 'Аренда';
        if (category === 'construction') return b.category === 'Строительные' || b.category.includes('Строй');
        if (category === 'transport') return b.category === 'Транспорт' || b.category === 'Грузоперевозки' || b.category === 'Такси';
        if (category === 'beauty') return b.category === 'Красота и Уход' || b.category === 'Красота';
        
        return b.category === label;
    });
  },

  async createBusiness(data: any): Promise<Business> {
    try {
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
          verification_status: data.verification_status || 'pending'
      };
      if (isSupabaseConfigured() && supabase) {
          const { data: saved, error } = await supabase.from('businesses').insert(newBiz).select().single();
          if (error) throw error;
          return mapBusinessFromDB(saved);
      }
      throw new Error("Supabase is not configured");
    } catch (e: any) { throw e; }
  },

  async updateBusiness(id: string, data: Partial<Business>): Promise<void> {
      try {
        if (isSupabaseConfigured() && supabase) {
            const dbData: any = { ...data };
            if (dbData.workHours !== undefined) { dbData.work_hours = dbData.workHours; delete dbData.workHours; }
            if (dbData.coverImage !== undefined) { dbData.cover_image = dbData.coverImage; delete dbData.coverImage; }
            if (dbData.canPostStories !== undefined) { dbData.can_post_stories = dbData.canPostStories; delete dbData.canPostStories; }
            if (dbData.isMaster !== undefined) { dbData.is_master = dbData.isMaster; delete dbData.isMaster; }
            delete dbData.id; delete dbData.authorId; delete dbData.rating; delete dbData.reviewsCount; delete dbData.reviews; delete dbData.verificationStatus;
            const { error } = await supabase.from('businesses').update(dbData).eq('id', id);
            if (error) throw error;
        }
      } catch (e: any) { console.error("Update business failed:", e?.message || e); }
  },

  async deleteBusiness(id: string): Promise<void> {
      try {
        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase.from('businesses').delete().eq('id', id);
            if (error) throw error;
        }
      } catch (e: any) { console.error("Delete business failed:", e?.message || e); }
  },

  async getBusinessOrders(bid: string): Promise<Order[]> { 
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('orders').select('*').eq('business_id', bid).order('created_at', { ascending: false });
          if (error) throw error;
          return (data || []).map(mapOrderFromDB);
      }
    } catch (e: any) { console.error("Get orders failed:", e?.message || e); }
    return [];
  },

  async createOrder(bid: string, items: any[], addr: string, total: number) {
      try {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        await supabase.from('orders').insert({ business_id: bid, user_id: user.id, items, address: addr, total_price: total, status: 'new' });
      } catch (e: any) { console.error("Create order failed:", e?.message || e); }
  },

  async updateOrderStatus(oid: string, s: string) {
      try {
        if (isSupabaseConfigured() && supabase) await supabase.from('orders').update({ status: s }).eq('id', oid);
      } catch (e: any) { console.error("Update order status failed:", e?.message || e); }
  },
  
  async getBusinessBookings(bid: string): Promise<Booking[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('bookings').select('*, services(title, price)').eq('business_id', bid);
          if (error) throw error;
          if (data) return data.map((b: any) => ({ id: b.id, serviceId: b.service_id, businessId: b.business_id, userId: b.user_id, date: b.date, time: b.time, status: b.status, serviceTitle: b.services?.title, price: b.services?.price }));
      }
    } catch (e: any) { console.error("Get bookings failed:", e?.message || e); }
    return [];
  },

  async getProducts(bid: string): Promise<Product[]> {
    try {
      if (isSupabaseConfigured() && supabase) { const { data, error } = await supabase.from('products').select('*').eq('business_id', bid); if (error) throw error; if (data) return data.map((p: any) => ({ id: p.id, businessId: p.business_id, name: p.name, description: p.description, price: p.price, image: p.image, category: p.category })); }
    } catch (e: any) { console.error("Get products failed:", e?.message || e); }
    return [];
  },

  async createProduct(d: any) { 
    try {
      if (isSupabaseConfigured() && supabase) await supabase.from('products').insert({ business_id: d.businessId, name: d.name, description: d.description, price: d.price, image: d.image, category: d.category }); 
    } catch (e: any) { console.error("Create product failed:", e?.message || e); }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<void> { 
    try {
      if (isSupabaseConfigured() && supabase) await supabase.from('products').update(data).eq('id', id); 
    } catch (e: any) { console.error("Update product failed:", e?.message || e); }
  },

  async deleteProduct(id: string) { 
    try {
      if (isSupabaseConfigured() && supabase) await supabase.from('products').delete().eq('id', id); 
    } catch (e: any) { console.error("Delete product failed:", e?.message || e); }
  },
  
  async getServices(bid: string): Promise<Service[]> {
    try {
      if (isSupabaseConfigured() && supabase) { const { data, error } = await supabase.from('services').select('*').eq('business_id', bid); if (error) throw error; if (data) return data.map((s: any) => ({ id: s.id, businessId: s.business_id, title: s.title, price: s.price, duration_min: s.duration_min, description: s.description, image: s.image })); }
    } catch (e: any) { console.error("Get services failed:", e?.message || e); }
    return [];
  },

  async createService(d: any) { 
    try {
      if (isSupabaseConfigured() && supabase) await supabase.from('services').insert({ business_id: d.businessId, title: d.title, price: d.price, duration_min: d.durationMin, description: d.description, image: d.image }); 
    } catch (e: any) { console.error("Create service failed:", e?.message || e); }
  },

  async deleteService(id: string) { 
    try {
      if (isSupabaseConfigured() && supabase) await supabase.from('services').delete().eq('id', id); 
    } catch (e: any) { console.error("Delete service failed:", e?.message || e); }
  },

  async bookService(s: any, d: string, t: string) {
    try {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('bookings').insert({ service_id: s.id, business_id: s.businessId, user_id: user.id, date: d, time: t, status: 'confirmed' });
    } catch (e: any) { console.error("Book service failed:", e?.message || e); }
  },
  
  async getBusinessAnalytics(businessId: string): Promise<AnalyticsData[]> { 
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('business_analytics').select('*').eq('business_id', businessId).order('date', { ascending: true });
          if (error) throw error;
          return data || [];
      }
    } catch (e: any) { console.error("Get analytics failed:", e?.message || e); }
    return [];
  },

  async getBusinessEmployees(businessId: string): Promise<Employee[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('employees').select('*').eq('business_id', businessId);
          if (error) throw error;
          return data || [];
      }
    } catch (e: any) { console.error("Get employees failed:", e?.message || e); }
    return [];
  },

  async addEmployee(businessId: string, email: string, role: 'manager' | 'staff'): Promise<Employee> {
      try {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.from('employees').insert({ business_id: businessId, email, role, name: email.split('@')[0], avatar: `https://ui-avatars.com/api/?name=${email}` }).select().single();
            if (error) throw error;
            return data;
        }
        throw new Error("Supabase not configured");
      } catch (e: any) { throw e; }
  },

  async removeEmployee(id: string): Promise<void> {
      try {
        if (isSupabaseConfigured() && supabase) await supabase.from('employees').delete().eq('id', id);
      } catch (e: any) { console.error("Remove employee failed:", e?.message || e); }
  },

  async sendBusinessPush(businessId: string, title: string, message: string): Promise<number> { return 0; },
  
  async getBusinessTables(businessId: string): Promise<Table[]> { 
    try {
      if (isSupabaseConfigured() && supabase) { const { data, error } = await supabase.from('tables').select('*').eq('business_id', businessId); if (error) throw error; return data || []; }
    } catch (e: any) { console.error("Get tables failed:", e?.message || e); }
    return []; 
  },
  
  async updateTableStatus(tableId: string, status: 'free' | 'reserved' | 'occupied'): Promise<void> {
      try {
        if (isSupabaseConfigured() && supabase) await supabase.from('tables').update({ status }).eq('id', tableId);
      } catch (e: any) { console.error("Update table status failed:", e?.message || e); }
  },
  
  async getEventsByAuthor(aid: string): Promise<Event[]> {
    try {
      if (isSupabaseConfigured() && supabase) { const { data, error } = await supabase.from('events').select('*').eq('author_id', aid); if (error) throw error; return data?.map((e: any) => ({ ...e, authorId: e.author_id })) || []; }
    } catch (e: any) { console.error("Get events by author failed:", e?.message || e); }
    return [];
  },

  async getBookedSeats(eventId: string): Promise<{row: number, col: number}[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('tickets').select('row, col').eq('event_id', eventId);
          if (error) throw error;
          return data || [];
      }
    } catch (e: any) { console.error("Get booked seats failed:", e?.message || e); }
    return [];
  },

  async buyTicket(eventId: string, row: number, col: number, price: number): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('tickets').insert({ event_id: eventId, user_id: user.id, row, col, price, qr_code: `ticket-${Date.now()}` });
    } catch (e: any) { console.error("Buy ticket failed:", e?.message || e); }
  },

  async getReviews(businessId: string): Promise<Review[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('business_id', businessId);
          
          if (error || !data) throw error || new Error("No data");
          
          const sortedData = data.sort((a, b) => {
              const timeA = new Date(a.date || a.created_at || 0).getTime();
              const timeB = new Date(b.date || b.created_at || 0).getTime();
              return timeB - timeA;
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
                  authorName: author?.name || 'Житель Снежинска', 
                  authorAvatar: author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.name || 'U')}`, 
                  rating: Number(r.rating || 0), 
                  text: r.text, 
                  date: formatRelativeDate(r.date || r.created_at) 
              };
          });
          
          // Фоновая синхронизация, если открыли отзывы
          this.syncBusinessStats(businessId).then();
          return mappedReviews;
      }
    } catch (e: any) { console.error("Get reviews failed:", e?.message || e); }
    return [];
  },

  async addReview(businessId: string, rating: number, text: string): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
      
      const { error } = await supabase.from('reviews').insert({ 
          business_id: businessId, 
          author_id: user.id, 
          rating, 
          text,
          date: new Date().toISOString() 
      });
      
      if (error) throw error;
      // ВАЖНО: Дожидаемся синхронизации перед завершением метода
      await this.syncBusinessStats(businessId);
    } catch (e: any) { throw e; }
  },

  async getRentalsByAuthor(aid: string): Promise<RentalItem[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('rentals').select('*').eq('author_id', aid);
          if (error) throw error;
          return data?.map((r: any) => ({ id: r.id, title: r.title, description: r.description, image: r.image, price_per_day: r.price_per_day, deposit: r.deposit, category: r.category, author_id: r.author_id, is_available: r.is_available, status: r.status })) || [];
      }
    } catch (e: any) { console.error("Get rentals by author failed:", e?.message || e); }
    return [];
  },

  async getRentals(): Promise<RentalItem[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('rentals').select('*').eq('is_available', true).eq('status', 'approved');
          if (error) throw error;
          return data?.map((r: any) => ({ id: r.id, title: r.title, description: r.description, image: r.image, pricePerDay: r.price_per_day, deposit: r.deposit, category: r.category, authorId: r.author_id, isAvailable: r.is_available, status: r.status })) || [];
      }
    } catch (e: any) { console.error("Get rentals failed:", e?.message || e); }
    return mockStore.rentals;
  },

  async createRental(data: any): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      const status = user.role === UserRole.ADMIN ? 'approved' : 'pending';
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('rentals').insert({ title: data.title, description: data.description, image: data.image, price_per_day: Number(data.pricePerDay), deposit: Number(data.deposit), category: data.category, author_id: user.id, is_available: true, status: status });
      }
    } catch (e: any) { console.error("Create rental failed:", e?.message || e); }
  },

  async getMyRentals(): Promise<RentalBooking[]> {
    try {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          const { data, error } = await supabase.from('rental_bookings').select('*').eq('renter_id', user.id);
          if (error) throw error;
          return data?.map((b: any) => ({ id: b.id, rentalId: b.rental_id, renterId: b.renter_id, rentalTitle: b.rental_title, rentalImage: b.rental_image, startDate: b.start_date, endDate: b.end_date, totalPrice: b.total_price, deposit: b.deposit, status: b.status })) || [];
      }
    } catch (e: any) { console.error("Get my rentals failed:", e?.message || e); }
    return [];
  },

  async takeDelivery(id: string): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) await supabase.from('orders').update({ courier_id: user.id, status: 'delivery' }).eq('id', id);
    } catch (e: any) { console.error("Take delivery failed:", e?.message || e); }
  },

  async completeDelivery(id: string): Promise<void> {
    try {
      if (isSupabaseConfigured() && supabase) await supabase.from('orders').update({ status: 'done' }).eq('id', id);
    } catch (e: any) { console.error("Complete delivery failed:", e?.message || e); }
  },

  async getDeliveryOrders(): Promise<Order[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'new')
            .is('courier_id', null)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return (data || []).map(mapOrderFromDB);
      }
    } catch (e: any) { console.error("Get delivery orders failed:", e?.message || e); }
    return [];
  },

  async getMyDeliveries(): Promise<Order[]> {
    try {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('courier_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return (data || []).map(mapOrderFromDB);
      }
    } catch (e: any) { console.error("Get my deliveries failed:", e?.message || e); }
    return [];
  },

  async deleteRental(id: string): Promise<void> {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('rentals').delete().eq('id', id);
        if (error) throw error;
      }
    } catch (e: any) { console.error("Delete rental failed:", e?.message || e); }
  },

  async returnRental(id: string): Promise<void> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data: booking, error: bError } = await supabase
            .from('rental_bookings')
            .update({ status: 'returned' })
            .eq('id', id)
            .select('rental_id')
            .single();
          
          if (bError) throw bError;
          if (booking && booking.rental_id) {
              await supabase.from('rentals').update({ is_available: true }).eq('id', booking.rental_id);
          }
      }
    } catch (e: any) { console.error("Return rental failed:", e?.message || e); }
  },
};

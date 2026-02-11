
import { Business, Order, Booking, Product, Service, Event, RentalItem, AnalyticsData, Employee, Table, User, AccessRequest, RentalBooking, UserRole, Review, Ad, Vacancy, BusinessPost } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { CATEGORIES } from '../constants';
import { mockStore } from '../services/mockData';

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

const mapBusinessToDB = (data: Partial<Business>) => {
    const dbData: any = { ...data };
    
    if ('authorId' in dbData) { dbData.author_id = dbData.authorId; delete dbData.authorId; }
    if ('reviewsCount' in dbData) { dbData.reviews_count = dbData.reviewsCount; delete dbData.reviewsCount; }
    if ('coverImage' in dbData) { dbData.cover_image = dbData.coverImage; delete dbData.coverImage; }
    if ('workHours' in dbData) { dbData.work_hours = dbData.workHours; delete dbData.workHours; }
    if ('verificationStatus' in dbData) { dbData.verification_status = dbData.verificationStatus; delete dbData.verificationStatus; }
    if ('canPostStories' in dbData) { dbData.can_post_stories = dbData.canPostStories; delete dbData.canPostStories; }
    if ('isMaster' in dbData) { dbData.is_master = dbData.isMaster; delete dbData.isMaster; }
    
    return dbData;
};

const formatSafeDate = (dateStr: any): string => {
    if (!dateStr) return new Date().toLocaleDateString('ru-RU');
    try {
        const d = new Date(String(dateStr).replace(' ', 'T'));
        if (isNaN(d.getTime())) return new Date().toLocaleDateString('ru-RU');
        return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
        return new Date().toLocaleDateString('ru-RU');
    }
};

export const businessService = {
  async getBusinesses(category?: string): Promise<Business[]> {
    const catObj = CATEGORIES.find(c => c.id === category);
    const filterValue = catObj ? catObj.label : category;

    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('businesses').select('*');
        
        if (category && category !== 'news' && category !== 'Все') {
            query = query.eq('category', filterValue);
            const masterSlugs = ['handmade', 'home_repair', 'education', 'beauty_masters', 'digital_pros', 'creative', 'events_pros', 'cleaning', 'pets_service'];
            if (masterSlugs.includes(category)) query = query.eq('is_master', true);
            else query = query.eq('is_master', false);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(mapBusinessFromDB);
      } catch (e: any) { console.error("getBusinesses failed:", e); }
    }
    
    return mockStore.businesses.filter(b => {
        if (!category || category === 'news' || category === 'Все') return true;
        const masterSlugs = ['handmade', 'home_repair', 'education', 'beauty_masters', 'digital_pros', 'creative', 'events_pros', 'cleaning', 'pets_service'];
        const shouldBeMaster = masterSlugs.includes(category);
        return b.category === filterValue && !!b.isMaster === shouldBeMaster;
    });
  },

  async getBusinessById(id: string): Promise<Business | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error = null } = await supabase.from('businesses').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return data ? mapBusinessFromDB(data) : null;
      } catch (e: any) { console.error("getBusinessById failed:", e); }
    }
    return mockStore.businesses.find(b => b.id === id) || null;
  },

  async getMyBusinesses(): Promise<Business[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return [];
      if (isSupabaseConfigured() && supabase) {
        const { data, error = null } = await supabase.from('businesses').select('*').eq('author_id', user.id);
        if (error) throw error;
        return (data || []).map(mapBusinessFromDB);
      }
    } catch (e: any) { console.error("getMyBusinesses failed:", e); }
    return [];
  },

  async createBusiness(data: any): Promise<Business> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (isSupabaseConfigured() && supabase) {
        const dbData = mapBusinessToDB({
            ...data,
            authorId: user.id,
            verificationStatus: data.isMaster ? 'verified' : 'pending'
        });
        const { data: saved, error } = await supabase.from('businesses').insert(dbData).select().single();
        if (error) throw error;
        return mapBusinessFromDB(saved);
    }
    throw new Error("Supabase not configured");
  },

  async updateBusiness(id: string, data: Partial<Business>): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
        const dbData = mapBusinessToDB(data);
        const { error } = await supabase.from('businesses').update(dbData).eq('id', id);
        if (error) throw error;
    }
  },

  async getProducts(businessId: string): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return [];
  },

  async createProduct(data: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('products').insert({
          ...data,
          business_id: data.businessId
      });
      if (error) throw error;
    }
  },

  async updateProduct(id: string, data: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('products').update(data).eq('id', id);
      if (error) throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    }
  },

  async getServices(businessId: string): Promise<Service[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('services').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return [];
  },

  async createService(data: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('services').insert({
          ...data,
          business_id: data.businessId,
          duration_min: data.durationMin
      });
      if (error) throw error;
    }
  },

  async deleteService(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('services').delete().eq('id', id);
          if (error) throw error;
      }
  },

  async createAd(data: any): Promise<Ad> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (isSupabaseConfigured() && supabase) {
        const { data: saved, error } = await supabase.from('ads').insert({
            ...data,
            author_id: user.id,
            status: 'pending'
        }).select().single();
        if (error) throw error;
        return { ...saved, authorId: saved.author_id };
    }
    throw new Error("Supabase not configured");
  },

  async updateAd(id: string, data: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('ads').update(data).eq('id', id);
      if (error) throw error;
    }
  },

  async getReviews(businessId: string): Promise<Review[]> {
    if (!isSupabaseConfigured() || !supabase) return [];
    
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles(name, avatar)')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(r => {
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            const authorName = profile?.name || 'Житель Снежинска';
            
            return {
                id: r.id,
                businessId: r.business_id,
                authorName,
                authorAvatar: profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`,
                rating: Number(r.rating || 5),
                text: r.text || '',
                date: formatSafeDate(r.created_at),
                userId: r.user_id
            };
        });
    } catch (e) {
        console.error("getReviews failed:", e);
        return [];
    }
  },

  async createReview(businessId: string, rating: number, text: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('reviews').insert({
              business_id: businessId,
              user_id: user.id,
              rating,
              text
          });
          if (error) throw error;
      }
  },

  async getBusinessBookings(businessId: string): Promise<Booking[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('bookings').select('*').eq('business_id', businessId).order('date', { ascending: false });
      if (error) throw error;
      return data?.map(b => ({
          ...b,
          serviceId: b.service_id,
          businessId: b.business_id,
          userId: b.user_id,
          serviceTitle: b.service_title
      })) || [];
    }
    return [];
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
          if (error) throw error;
      }
  },

  async getBusinessOrders(businessId: string): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return [];
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
    }
  },

  async getBusinessEmployees(businessId: string): Promise<Employee[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('employees').select('*').eq('business_id', businessId);
      if (error) throw error;
      return data || [];
    }
    return [];
  },

  async addEmployee(businessId: string, email: string, role: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
        const { data: profile, error } = await supabase.from('profiles').select('id, name, avatar').eq('email', email).maybeSingle();
        if (error) throw error;
        if (!profile) throw new Error("Пользователь с таким email не найден.");
        
        const { error: insError } = await supabase.from('employees').insert({
            business_id: businessId,
            user_id: profile.id,
            name: profile.name,
            avatar: profile.avatar,
            email: email,
            role: role
        });
        if (insError) throw insError;
    }
  },

  async removeEmployee(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
    }
  },

  async sendBusinessPush(businessId: string, title: string, message: string): Promise<number> {
    return 124; 
  },

  async getRentals(): Promise<RentalItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('rentals').select('*').eq('status', 'approved');
      if (error) throw error;
      return (data || []).map(r => ({ 
          ...r, 
          authorId: r.author_id,
          pricePerDay: Number(r.price_per_day),
          isAvailable: !!r.is_available
      }));
    }
    return mockStore.rentals;
  },

  async getMyRentals(): Promise<RentalBooking[]> {
    const user = await authService.getCurrentUser();
    if (!user) return [];
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('rental_bookings').select('*').eq('renter_id', user.id);
      if (error) throw error;
      return data || [];
    }
    return [];
  },

  async createRental(data: any): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('rentals').insert({ 
          title: data.title,
          description: data.description,
          price_per_day: data.pricePerDay,
          deposit: data.deposit,
          category: data.category,
          image: data.image,
          author_id: user.id, 
          status: 'pending',
          is_available: true
      });
      if (error) throw error;
    }
  },

  async returnRental(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error = await supabase.from('rental_bookings').update({ status: 'returned' }).eq('id', id) } = {};
      if (error) throw error;
    }
  },

  async createOrder(businessId: string, items: any[], address: string, total: number): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (isSupabaseConfigured() && supabase) {
      const { error = null } = await supabase.from('orders').insert({
        business_id: businessId,
        user_id: user.id,
        items,
        address,
        total_price: total,
        status: 'new'
      });
      if (error) throw error;
    }
  },

  async getDeliveryOrders(): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').select('*').eq('status', 'cooking');
      if (error) throw error;
      return data || [];
    }
    return [];
  },

  async getMyDeliveries(): Promise<Order[]> {
    const user = await authService.getCurrentUser();
    if (!user) return [];
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').select('*').eq('courier_id', user.id);
      if (error) throw error;
      return data || [];
    }
    return [];
  },

  async takeDelivery(id: string): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (isSupabaseConfigured() && supabase) {
      const { error = null } = await supabase.from('orders').update({ courier_id: user.id, status: 'delivery' }).eq('id', id);
      if (error) throw error;
    }
  },

  async completeDelivery(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error = await supabase.from('orders').update({ status: 'done' }).eq('id', id) } = {};
      if (error) throw error;
    }
  },

  async createBusinessVacancy(businessId: string, data: any): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (isSupabaseConfigured() && supabase) {
      const { error = await supabase.from('vacancies').insert({
        ...data,
        business_id: businessId,
        author_id: user.id,
        status: 'pending'
      }) } = {};
      if (error) throw error;
    }
  },

  async getVacanciesByBusiness(businessId: string): Promise<Vacancy[]> {
    if (!isSupabaseConfigured() || !supabase) return [];
    try {
        const { data, error } = await supabase.from('vacancies').select('*').eq('business_id', businessId);
        if (error) return [];
        return data?.map(v => ({ ...v, authorId: v.author_id, contactPhone: v.contact_phone })) || [];
    } catch(e) { return []; }
  },

  async getBusinessPosts(businessId: string): Promise<BusinessPost[]> {
    try {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase
            .from('business_posts')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });
          
          if (error) return [];

          let userLikes: string[] = [];
          if (user) {
              const { data: likesData } = await supabase
                .from('business_post_likes')
                .select('post_id')
                .eq('user_id', user.id);
              userLikes = (likesData || []).map(l => l.post_id);
          }

          return (data || []).map(p => ({
            id: p.id,
            businessId: p.business_id,
            title: p.title,
            content: p.content,
            image: p.image,
            views: p.views || 0,
            likes: p.likes || 0,
            isLiked: userLikes.includes(p.id),
            createdAt: p.created_at
          }));
      }
    } catch (e: any) { }
    return [];
  },

  async toggleBusinessPostLike(postId: string): Promise<boolean> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return false;
      try {
          const { data, error } = await supabase.rpc('toggle_business_post_like', { 
            p_post_id: postId, 
            p_user_id: user.id 
          });
          if (error) throw error;
          return !!data;
      } catch (e: any) {
          console.error("Like toggle failed", e);
          return false;
      }
  },

  async createBusinessPost(data: Partial<BusinessPost>): Promise<void> {
      try {
        if (isSupabaseConfigured() && supabase) {
            const { error = await supabase.from('business_posts').insert({
                business_id: data.businessId,
                title: data.title,
                content: data.content,
                image: data.image
            }) } = {};
            if (error) throw error;
        }
      } catch (e: any) { throw e; }
  },

  async deleteBusinessPost(id: string): Promise<void> {
      try {
        if (isSupabaseConfigured() && supabase) {
            const { error = await supabase.from('business_posts').delete().eq('id', id) } = {};
            if (error) throw error;
        }
      } catch (e: any) { throw e; }
  },

  async viewBusinessPost(id: string): Promise<boolean> {
      if (!isSupabaseConfigured() || !supabase || !id) return false;
      try {
          const storageKey = `v_post_${id}`;
          const lastView = localStorage.getItem(storageKey);
          const now = Date.now();
          const ONE_DAY = 24 * 60 * 60 * 1000;

          if (lastView && (now - parseInt(lastView) < ONE_DAY)) {
              return false;
          }

          const { error } = await supabase.rpc('increment_post_views', { post_id: id });
          if (!error) {
              localStorage.setItem(storageKey, now.toString());
              return true;
          }
          return false;
      } catch (e: any) {
          return false;
      }
  }
};

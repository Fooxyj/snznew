
import { 
    Comment, Review, Conversation, Message, Story, Community, CommunityPost, StoryConfig, Suggestion, Report, Coupon, UserCoupon, Ad, NewsItem, Business, User, UserRole, Notification, Vacancy, Resume, Ride
} from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { mockStore } from './mockData';

const formatRelativeDate = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === '') return '—';
    
    const normalizedDate = dateStr.includes(' ') && !dateStr.includes('T') 
        ? dateStr.replace(' ', 'T') 
        : dateStr;
        
    const date = new Date(normalizedDate);
    if (isNaN(date.getTime())) return '—';

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
        return `Сегодня, ${timeStr}`;
    } else if (isYesterday) {
        return `Вчера, ${timeStr}`;
    } else if (now.getTime() - date.getTime() < 7 * 86400000) {
        const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' });
        return `${weekday}, ${timeStr}`;
    } else {
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
};

export const socialService = {
  // Comment above fix: Added notification subscription and management methods
  async subscribeToNotifications(userId: string, callback: (n: Notification) => void) {
    if (!isSupabaseConfigured() || !supabase) return { unsubscribe: () => {} };
    
    const channel = supabase
      .channel(`notifs-${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${userId}` 
      }, (payload) => {
        const n = payload.new as any;
        callback({
            id: n.id,
            userId: n.user_id,
            text: n.text || n.message,
            isRead: n.is_read,
            createdAt: n.created_at
        });
      })
      .subscribe();
      
    return { unsubscribe: () => supabase.removeChannel(channel) };
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      }
  },

  async deleteNotification(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('notifications').delete().eq('id', id);
      }
  },

  async markNotificationRead(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
  },

  // Comment above fix: Added job vacancy management methods
  async getVacancies(): Promise<Vacancy[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('vacancies').select('*').order('created_at', { ascending: false });
          return (data || []).map((v: any) => ({ id: v.id, title: v.title, salaryMin: v.salary_min, salaryMax: v.salary_max, companyName: v.company_name, description: v.description, contactPhone: v.contact_phone, schedule: v.schedule, authorId: v.author_id, createdAt: v.created_at, status: v.status }));
      }
      return mockStore.vacancies || [];
  },
  async createVacancy(data: any) {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          const { error } = await supabase.from('vacancies').insert({ 
              title: data.title, company_name: data.companyName, description: data.description, 
              salary_min: data.salaryMin, salary_max: data.salaryMax, contact_phone: data.contactPhone, 
              schedule: data.schedule, author_id: user.id, status: 'approved', created_at: new Date().toISOString() 
          });
          if (error) throw error;
      }
  },

  // Comment above fix: Added resume management methods
  async getResumes(): Promise<Resume[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
          return (data || []).map((r: any) => ({ id: r.id, name: r.name, profession: r.profession, salaryExpectation: r.salary_expectation, experience: r.experience, about: r.about, phone: r.phone, authorId: r.author_id, createdAt: r.created_at, status: r.status }));
      }
      return mockStore.resumes || [];
  },
  async createResume(data: any) {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          const { error } = await supabase.from('resumes').insert({ 
              name: data.name, profession: data.profession, salary_expectation: data.salaryExpectation, 
              experience: data.experience, about: data.about, phone: data.phone, 
              author_id: user.id, status: 'approved', created_at: new Date().toISOString() 
          });
          if (error) throw error;
      }
  },

  // Comment above fix: Added bonus shop and coupon management methods
  async getCoupons(): Promise<Coupon[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('coupons').select('*');
          return data || [];
      }
      return mockStore.coupons || [];
  },
  async getMyCoupons(): Promise<UserCoupon[]> {
      const user = await authService.getCurrentUser();
      if (isSupabaseConfigured() && supabase && user) {
          const { data } = await supabase.from('user_coupons').select('*, coupons(title, image)').eq('user_id', user.id);
          return (data || []).map((c: any) => ({ id: c.id, userId: c.user_id, couponId: c.coupon_id, code: c.code, couponTitle: c.coupons?.title, couponImage: c.coupons?.image }));
      }
      return [];
  },
  async buyCoupon(id: string) {
      const user = await authService.getCurrentUser();
      if (!user || !supabase) throw new Error("Unauthorized");
      const { data: coupon } = await supabase.from('coupons').select('price').eq('id', id).single();
      if (!coupon) throw new Error("Coupon not found");
      if (user.xp < coupon.price) throw new Error("Недостаточно XP");
      
      const { error: xpError } = await supabase.from('profiles').update({ xp: user.xp - coupon.price }).eq('id', user.id);
      if (xpError) throw xpError;

      const { error: insError } = await supabase.from('user_coupons').insert({ 
          user_id: user.id, 
          coupon_id: id, 
          code: `SNZ-${Math.random().toString(36).substring(7).toUpperCase()}` 
      });
      if (insError) throw insError;
  },

  async getConversations(): Promise<Conversation[]> {
    const user = await authService.getCurrentUser();
    if (!user || !isSupabaseConfigured() || !supabase) return [];
    
    const { data: convos, error: convError } = await supabase
        .from('conversations')
        .select('id, participant1_id, participant2_id, business_id')
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${partnerId}),and(participant1_id.eq.${partnerId},participant2_id.eq.${user.id})`);
    
    if (convError || !convos) return [];

    const convoIds = convos.map(c => c.id);

    const [messagesRes, unreadRes] = await Promise.all([
        supabase
            .from('messages')
            .select('conversation_id, text, created_at')
            .in('conversation_id', convoIds)
            .order('created_at', { ascending: false }),
        supabase
            .from('messages')
            .select('conversation_id')
            .in('conversation_id', convoIds)
            .eq('is_read', false)
            .neq('sender_id', user.id)
    ]);

    const lastMsgMap = new Map<string, { text: string, date: string }>();
    if (messagesRes.data) {
        messagesRes.data.forEach(m => {
            if (!lastMsgMap.has(m.conversation_id)) {
                lastMsgMap.set(m.conversation_id, { text: m.text, date: m.created_at });
            }
        });
    }

    const unreadCountMap = new Map<string, number>();
    if (unreadRes.data) {
        unreadRes.data.forEach(m => {
            unreadCountMap.set(m.conversation_id, (unreadCountMap.get(m.conversation_id) || 0) + 1);
        });
    }

    const partnerIds = convos.map(c => c.participant1_id === user.id ? c.participant2_id : c.participant1_id);
    const businessIds = convos.map(c => c.business_id).filter(Boolean);
    
    const [profsRes, bizRes] = await Promise.all([
        supabase.from('profiles').select('id, name, avatar, last_seen').in('id', [...new Set(partnerIds)]),
        businessIds.length > 0 ? supabase.from('businesses').select('id, name, image, author_id').in('id', [...new Set(businessIds)]) : { data: [] }
    ]);

    const profMap = new Map<string, any>(profsRes.data?.map(p => [p.id, p]) || []);
    const bizMap = new Map<string, any>(bizRes.data?.map(b => [b.id, b]) || []);
    
    return convos.map(c => {
        const business = c.business_id ? bizMap.get(c.business_id) : null;
        const partnerId = c.participant1_id === user.id ? c.participant2_id : c.participant1_id;
        const partnerProfile = profMap.get(partnerId);

        let partnerName = partnerProfile?.name || 'Пользователь';
        let partnerAvatar = partnerProfile?.avatar || '';

        if (business && business.author_id !== user.id) {
            partnerName = business.name;
            partnerAvatar = business.image;
        } else if (business && business.author_id === user.id) {
            partnerName = `${partnerName} (в ${business.name})`;
        }

        const realLastMsg = lastMsgMap.get(c.id);
        let lastText = realLastMsg?.text || '';
        const rawDate = realLastMsg?.date || null;

        if (lastText.startsWith('{')) {
            try {
                const parsed = JSON.parse(lastText);
                if (parsed.type === 'ad_inquiry') lastText = '💬 Запрос по объявлению';
            } catch (e) {}
        } else if (lastText.startsWith('http')) {
             lastText = '📷 Фотография';
        }

        return {
            id: c.id,
            participant1Id: c.participant1_id,
            participant2Id: c.participant2_id,
            partnerId,
            partnerName,
            partnerAvatar,
            lastMessageDate: formatRelativeDate(rawDate),
            lastMessageText: lastText || 'Сообщений нет',
            businessId: c.business_id,
            unreadCount: unreadCountMap.get(c.id) || 0,
            _rawDate: rawDate ? new Date(rawDate.replace(' ', 'T')).getTime() : 0
        };
    }).sort((a, b) => b._rawDate - a._rawDate);
  },

  async startChat(partnerId: string, context?: string, businessId?: string): Promise<string> {
    const user = await authService.getCurrentUser();
    if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
    
    let query = supabase.from('conversations').select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${partnerId}),and(participant1_id.eq.${partnerId},participant2_id.eq.${user.id})`);
    
    if (businessId) {
        query = query.eq('business_id', businessId);
    } else {
        query = query.is('business_id', null);
    }
    
    const { data: existing } = await query.maybeSingle();
    
    let convoId = '';
    
    if (existing) {
        convoId = existing.id;
    } else {
        const { data: created, error } = await supabase.from('conversations').insert({
            participant1_id: user.id,
            participant2_id: partnerId,
            business_id: businessId || null
        }).select().single();

        if (error) throw error;
        convoId = created.id;
    }

    if (context) {
        await this.sendMessage(convoId, context);
    }
    
    return convoId;
  },

  async deleteConversation(convoId: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    await supabase.from('messages').delete().eq('conversation_id', convoId);
    await supabase.from('conversations').delete().eq('id', convoId);
  },

  async sendMessage(convoId: string, text: string): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user || !isSupabaseConfigured() || !supabase) return;
    
    const now = new Date().toISOString();
    await supabase.from('messages').insert({ 
        conversation_id: convoId, 
        sender_id: user.id, 
        text,
        created_at: now
    });
  },

  async getMessages(convoId: string): Promise<Message[]> {
    if (!isSupabaseConfigured() || !supabase) return [];
    const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });
    
    return (data || []).map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        text: m.text,
        createdAt: m.created_at,
        isRead: m.is_read
    }));
  },

  async markMessagesAsRead(convoId: string): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user || !isSupabaseConfigured() || !supabase) return;
    await supabase.from('messages').update({ is_read: true }).eq('conversation_id', convoId).neq('sender_id', user.id);
  },

  async getUnreadChatsCount(): Promise<number> {
    const user = await authService.getCurrentUser();
    if (!user || !isSupabaseConfigured() || !supabase) return 0;
    try {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .neq('sender_id', user.id);
        
        if (error) return 0;
        return count || 0;
    } catch (e) {
        return 0;
    }
  },

  async getComments(newsId: string): Promise<Comment[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('comments').select('*').eq('news_id', newsId).order('created_at', { ascending: false });
          return data?.map((c: any) => ({
              id: c.id,
              newsId: c.news_id,
              authorName: c.author_name,
              authorAvatar: c.author_avatar,
              text: c.text,
              date: formatRelativeDate(c.created_at)
          })) || [];
      }
      return [];
  },

  async addComment(newsId: string, text: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
      await supabase.from('comments').insert({
          news_id: newsId,
          author_name: user.name,
          author_avatar: user.avatar,
          text
      });
  },

  async getStories(): Promise<Story[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase
            .from('stories')
            .select('*, story_views(user_id, profiles(name, avatar))')
            .order('created_at', { ascending: false });
          
          if (error || !data) return [];

          const profileIds = [...new Set(data.map(s => s.user_id).filter(Boolean))];
          const bizIds = [...new Set(data.map(s => s.business_id).filter(Boolean))];

          const [profsRes, bizRes] = await Promise.all([
              supabase.from('profiles').select('id, name, avatar').in('id', profileIds),
              bizIds.length > 0 ? supabase.from('businesses').select('id, name, image').in('id', bizIds) : { data: [] }
          ]);

          const profMap = new Map<string, any>(profsRes.data?.map(p => [p.id, p]) || []);
          const bizMap = new Map<string, any>(bizRes.data?.map(b => [b.id, b]) || []);

          return data.map((s: any) => {
              const business = s.business_id ? bizMap.get(s.business_id) : null;
              const profile = profMap.get(s.user_id);
              
              const viewers = (s.story_views || []).map((v: any) => ({
                  id: v.user_id,
                  name: v.profiles?.name || 'Житель',
                  avatar: v.profiles?.avatar || ''
              }));

              let config = s.content_config;
              if (typeof config === 'string') {
                  try {
                      const parsed = JSON.parse(config);
                      config = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
                  } catch (e) {
                      config = null;
                  }
              }
              
              return {
                  id: s.id,
                  authorId: s.business_id || s.user_id,
                  userId: s.user_id,
                  authorName: business?.name || profile?.name || 'Житель Снежинска',
                  authorAvatar: business?.image || profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}`,
                  media: s.media,
                  caption: s.caption || '',
                  contentConfig: config,
                  createdAt: s.created_at,
                  viewers: viewers,
                  status: 'published'
              };
          });
      }
      return [];
  },

  async createStory(media: string, caption: string, businessId?: string, config?: any): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
      
      const storyData = {
          user_id: user.id,
          author_id: user.id, 
          business_id: businessId || null,
          media,
          caption: caption || '',
          content_config: config || {},
          created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('stories').insert(storyData);
      
      if (error) {
          console.error("Supabase Story Insert Error:", error);
          throw new Error(`Ошибка сохранения в БД: ${error.message}`);
      }
  },

  async viewStory(storyId: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      
      await supabase.from('story_views').upsert({
          story_id: storyId,
          user_id: user.id
      }, { onConflict: 'story_id, user_id' });
  },

  async getCommunities(): Promise<Community[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('communities').select('*').eq('status', 'approved');
          return data || [];
      }
      return [];
  },

  async getCommunityById(id: string): Promise<Community | null> {
      if (isSupabaseConfigured() && supabase) {
          const user = await authService.getCurrentUser();
          const { data: community } = await supabase.from('communities').select('*').eq('id', id).single();
          if (community && user) {
              const { data: membership } = await supabase.from('community_members').select('*').eq('community_id', id).eq('user_id', user.id).maybeSingle();
              return { ...community, isMember: !!membership };
          }
          return community;
      }
      return null;
  },

  async createCommunity(data: any): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
      await supabase.from('communities').insert({
          name: data.name,
          description: data.description,
          image: data.image,
          author_id: user.id,
          status: 'pending',
          members_count: 1
      });
  },

  async leaveCommunity(communityId: string): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user || !isSupabaseConfigured() || !supabase) return;
    await supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', user.id);
    
    const { data } = await supabase.from('communities').select('members_count').eq('id', communityId).single();
    if (data) {
        await supabase.from('communities').update({ members_count: Math.max(0, (data.members_count || 0) - 1) }).eq('id', communityId);
    }
},

async getCommunityPosts(communityId: string): Promise<CommunityPost[]> {
    if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.from('community_posts').select('*').eq('community_id', communityId).order('created_at', { ascending: false });
        if (!data) return [];
        
        const authorIds = [...new Set(data.map(p => p.author_id))];
        const { data: profs } = await supabase.from('profiles').select('id, name, avatar').in('id', authorIds);
        const profMap = new Map<string, any>(profs?.map(p => [p.id, p]) || []);

        return data.map((p: any) => ({
            id: p.id,
            communityId: p.community_id,
            authorId: p.author_id,
            authorName: profMap.get(p.author_id)?.name || 'Пользователь',
            authorAvatar: profMap.get(p.author_id)?.avatar || '',
            content: p.content,
            image: p.image,
            likes: p.likes || 0,
            createdAt: p.created_at
        }));
    }
    return [];
},

async createCommunityPost(communityId: string, content: string, image?: string): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
    await supabase.from('community_posts').insert({
        community_id: communityId,
        author_id: user.id,
        content,
        image: image || null
    });
},

async sendSuggestion(text: string): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!isSupabaseConfigured() || !supabase) return;
    await supabase.from('suggestions').insert({
        user_id: user?.id || null,
        text,
        date: new Date().toISOString()
    });
},

async sendReport(targetId: string, targetType: string, reason: string): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!isSupabaseConfigured() || !supabase) return;
    await supabase.from('reports').insert({
        user_id: user?.id || null,
        target_id: targetId,
        target_type: targetType,
        reason,
        status: 'new',
        date: new Date().toISOString()
    });
},

// Comment above fix: Implementation for confirming ride bookings and updating seat availability
async confirmRideBooking(rideId: string, passengerId: string, count: number): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
        const { data: ride } = await supabase.from('rides').select('*').eq('id', rideId).single();
        if (!ride) throw new Error("Поездка не найдена");
        
        let passengers = [];
        try {
            passengers = JSON.parse(ride.passengers || '[]');
        } catch (e) { passengers = []; }
        
        if (!Array.isArray(passengers)) passengers = [];
        
        // Add passenger ID multiple times based on seat count
        for(let i=0; i<count; i++) {
            passengers.push(passengerId);
        }
        
        const { error } = await supabase.from('rides').update({
            passengers: JSON.stringify(passengers),
            seats: Math.max(0, ride.seats - count)
        }).eq('id', rideId);
        
        if (error) throw error;
    }
},

// Comment above fix: Added getMyRides method to retrieve user's active rides
async getMyRides(): Promise<Ride[]> {
    const user = await authService.getCurrentUser();
    if (isSupabaseConfigured() && supabase && user) {
        const { data } = await supabase.from('rides').select('*').eq('driver_id', user.id);
        return (data || []).map((r: any) => ({
            id: r.id, fromCity: r.from_city, toCity: r.to_city, date: r.date, time: r.time, price: r.price, seats: r.seats, carModel: r.car_model, driverId: r.driver_id, driverName: r.driver_name, driverAvatar: r.driver_avatar, passengers: r.passengers
        }));
    }
    return [];
},

// Comment above fix: Added deleteRide method to handle ride removal
async deleteRide(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
        await supabase.from('rides').delete().eq('id', id);
    }
},

// Comment above fix: Added createRide method to handle new ride publication
async createRide(data: any): Promise<void> {
    const user = await authService.getCurrentUser();
    if (isSupabaseConfigured() && supabase && user) {
        await supabase.from('rides').insert({
            from_city: data.fromCity,
            to_city: data.toCity,
            date: data.date,
            time: data.time,
            price: data.price,
            seats: data.seats,
            car_model: data.carModel,
            driver_id: user.id,
            driver_name: user.name,
            driver_avatar: user.avatar,
            status: 'approved'
        });
    }
}
};

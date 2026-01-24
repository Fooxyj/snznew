
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
  async getUnreadChatsCount(): Promise<number> {
      try {
        const user = await authService.getCurrentUser();
        if (!user) return 0;
        
        if (isSupabaseConfigured() && supabase) {
            const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false).neq('sender_id', user.id);
            return count || 0;
        }
        return mockStore.conversations.filter(c => c.unreadCount && c.unreadCount > 0).length;
      } catch (e) { return 0; }
  },

  async getConversations(): Promise<Conversation[]> {
      try {
        const user = await authService.getCurrentUser();
        if (!user) return [];
        
        if (isSupabaseConfigured() && supabase) {
            const { data: convos, error } = await supabase
                .from('conversations')
                .select(`id, participant1_id, participant2_id, business_id`)
                .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);

            if (error) throw error;
            if (!convos || convos.length === 0) return [];

            const convoIds = convos.map(c => c.id);

            // Получаем только те диалоги, где есть сообщения
            const { data: allLastMsgs } = await supabase
                .from('messages')
                .select('conversation_id, text, created_at')
                .in('conversation_id', convoIds)
                .order('created_at', { ascending: false });

            const lastMsgMap = new Map<string, any>();
            if (allLastMsgs) {
                allLastMsgs.forEach(m => {
                    if (!lastMsgMap.has(m.conversation_id)) {
                        lastMsgMap.set(m.conversation_id, m);
                    }
                });
            }

            const { data: unreadCounts } = await supabase
                .from('messages')
                .select('conversation_id')
                .in('conversation_id', convoIds)
                .eq('is_read', false)
                .neq('sender_id', user.id);

            const unreadMap = new Map<string, number>();
            if (unreadCounts) {
                unreadCounts.forEach(m => {
                    unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
                });
            }

            const partnerIds = new Set<string>();
            const bizIds = new Set<string>();
            convos.forEach(c => {
                partnerIds.add(c.participant1_id === user.id ? c.participant2_id : c.participant1_id);
                if (c.business_id) bizIds.add(c.business_id);
            });

            const [profilesRes, businessesRes] = await Promise.all([
                supabase.from('profiles').select('id, name, avatar').in('id', Array.from(partnerIds)),
                bizIds.size > 0 
                    ? supabase.from('businesses').select('id, name, author_id').in('id', Array.from(bizIds))
                    : Promise.resolve({ data: [] })
            ]);

            const profileMap = new Map<string, any>(profilesRes.data?.map(p => [p.id, p]) || []);
            const bizMap = new Map<string, any>(businessesRes.data?.map(b => [b.id, b]) || []);

            const result = convos
                .map((c: any) => {
                    const partnerId = c.participant1_id === user.id ? c.participant2_id : c.participant1_id;
                    const partnerProfile = profileMap.get(partnerId);
                    const lastMsg = lastMsgMap.get(c.id);
                    const bizData = c.business_id ? bizMap.get(c.business_id) : null;
                    
                    const rawDate = lastMsg?.created_at || '1970-01-01T00:00:00Z';

                    return {
                        id: c.id,
                        participant1Id: c.participant1_id,
                        participant2Id: c.participant2_id,
                        partnerId: partnerId,
                        partnerName: partnerProfile?.name || 'Житель Снежинска',
                        partnerAvatar: partnerProfile?.avatar || '',
                        businessId: c.business_id,
                        businessName: bizData?.name,
                        businessOwnerId: bizData?.author_id,
                        lastMessageDate: lastMsg ? formatRelativeDate(rawDate) : '—',
                        lastMessageDateRaw: rawDate,
                        lastMessageText: lastMsg ? lastMsg.text : 'Нет сообщений',
                        unreadCount: unreadMap.get(c.id) || 0
                    };
                })
                // КРИТИЧЕСКИЙ ФИЛЬТР: Убираем пустые диалоги из списка
                .filter(c => c.lastMessageDateRaw !== '1970-01-01T00:00:00Z');

            return result.sort((a, b) => {
                const dateA = new Date(a.lastMessageDateRaw || 0).getTime();
                const dateB = new Date(b.lastMessageDateRaw || 0).getTime();
                return dateB - dateA;
            });
        }
        
        const mockResult = mockStore.conversations.filter(c => c.participant1Id === user.id || c.participant2Id === user.id);
        return mockResult.sort((a, b) => {
             const dateA = new Date(a.lastMessageDateRaw || 0).getTime();
             const dateB = new Date(b.lastMessageDateRaw || 0).getTime();
             return dateB - dateA;
        });
      } catch (e: any) { 
          console.error("Conversations fetch error:", e.message);
          return []; 
      }
  },

  async getMessages(cid: string): Promise<Message[]> {
      if (!cid || cid === 'undefined') return [];
      try {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', cid).order('created_at', { ascending: true });
            if (!error && data) {
                return data.map(m => ({ ...m, conversationId: m.conversation_id, senderId: m.sender_id, createdAt: m.created_at, isRead: m.is_read }));
            }
        }
      } catch (e) {}
      
      return mockStore.messages.filter(m => m.conversationId === cid).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendMessage(cid: string, text: string): Promise<Message> {
      if (!cid || cid === 'undefined') throw new Error("Invalid conversation ID");
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");

      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('messages').insert({ conversation_id: cid, sender_id: user.id, text, is_read: false }).select().single();
          if (error) throw error;
          return { ...data, conversationId: data.conversation_id, senderId: data.sender_id, createdAt: data.created_at, isRead: data.is_read };
      }
      
      const newMessage: Message = {
          id: Math.random().toString(36).substring(7),
          conversationId: cid,
          senderId: user.id,
          text: text,
          createdAt: new Date().toISOString(),
          isRead: true
      };
      mockStore.messages.push(newMessage);
      return newMessage;
  },

  async deleteMessage(mid: string): Promise<void> {
      if (!mid) return;
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");

      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.from('messages').delete().eq('id', mid).eq('sender_id', user.id);
          if (error) throw error;
      } else {
          const idx = mockStore.messages.findIndex(m => m.id === mid);
          if (idx !== -1) mockStore.messages.splice(idx, 1);
      }
  },

  async deleteConversation(cid: string): Promise<void> {
      if (!cid) return;
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");

      if (isSupabaseConfigured() && supabase) {
          // Удаляем диалог и все сообщения в нем
          await supabase.from('messages').delete().eq('conversation_id', cid);
          const { error } = await supabase.from('conversations').delete().eq('id', cid);
          if (error) throw error;
      } else {
          const idx = mockStore.conversations.findIndex(c => c.id === cid);
          if (idx !== -1) mockStore.conversations.splice(idx, 1);
          mockStore.messages = mockStore.messages.filter(m => m.conversationId !== cid);
      }
  },

  async markMessagesAsRead(cid: string) {
      if (!cid || cid === 'undefined') return;
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('messages').update({ is_read: true }).eq('conversation_id', cid).neq('sender_id', user.id);
  },

  async startChat(partnerId: string, text: string, businessId?: string): Promise<string> {
      if (!partnerId || partnerId === 'undefined') throw new Error("Invalid partner ID");
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      
      if (isSupabaseConfigured() && supabase) {
          // Ищем существующий диалог между этими двумя участниками
          const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${partnerId}),and(participant1_id.eq.${partnerId},participant2_id.eq.${user.id})`)
            .maybeSingle();
          
          let cid = existing?.id;
          if (!cid) {
              const { data: newConvo, error: insertError } = await supabase.from('conversations').insert({ 
                  participant1_id: user.id, 
                  participant2_id: partnerId, 
                  business_id: businessId
              }).select().maybeSingle();
              
              if (insertError) {
                  // Повторная попытка без бизнес-id если первый insert не удался
                  const { data: retryConvo, error: retryError } = await supabase.from('conversations').insert({ 
                      participant1_id: user.id, 
                      participant2_id: partnerId
                  }).select().maybeSingle();
                  
                  if (retryError) throw retryError;
                  cid = retryConvo?.id;
              } else {
                  cid = newConvo?.id;
              }
              
              if (!cid) throw new Error("Не удалось создать диалог.");
          }
          
          // Отправляем сообщение, если оно передано
          if (text && cid) await this.sendMessage(cid, text);
          return cid;
      }
      
      const existingMock = mockStore.conversations.find(c => (c.participant1Id === user.id && c.participant2Id === partnerId) || (c.participant1Id === partnerId && c.participant2Id === user.id));
      if (existingMock) {
          if (text) await this.sendMessage(existingMock.id, text);
          return existingMock.id;
      }
      
      const newId = 'mc' + Math.random().toString(36).substring(7);
      mockStore.conversations.push({
          id: newId,
          participant1Id: user.id,
          participant2Id: partnerId,
          partnerId: partnerId,
          partnerName: 'Новый собеседник',
          partnerAvatar: '',
          lastMessageDate: 'Сейчас',
          lastMessageDateRaw: new Date().toISOString(),
          lastMessageText: text,
          unreadCount: 0
      });
      if (text) await this.sendMessage(newId, text);
      return newId;
  },

  async getComments(newsId: string): Promise<Comment[]> {
      if (!newsId || newsId === 'undefined') return [];
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('comments').select('*, profiles(name, avatar)').eq('news_id', newsId).order('created_at', { ascending: false });
          return data?.map(c => ({ id: c.id, newsId: c.news_id, authorName: c.profiles?.name || 'Житель', authorAvatar: c.profiles?.avatar, text: c.text, date: formatRelativeDate(c.created_at) })) || [];
      }
      return [];
  },

  async addComment(newsId: string, text: string) {
      if (!newsId || newsId === 'undefined') throw new Error("Invalid news ID");
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) throw new Error("Unauthorized");
      await supabase.from('comments').insert({ news_id: newsId, user_id: user.id, text });
  },

  async sendReport(tid: string, type: string, reason: string) {
      if (!tid || tid === 'undefined') return;
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('reports').insert({ user_id: user.id, target_id: tid, target_type: type, reason, status: 'new' });
  },

  async sendSuggestion(text: string) {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('suggestions').insert({ user_id: user.id, text, is_read: false });
  },

  async getCoupons(): Promise<Coupon[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('coupons').select('*').order('price', { ascending: true });
          return data || [];
      }
      return mockStore.coupons;
  },

  async getMyCoupons(): Promise<UserCoupon[]> {
      try {
        const user = await authService.getCurrentUser();
        if (!user) return [];
        
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.from('user_coupons').select('*, coupons(title, image)').eq('user_id', user.id);
            return (data || []).map(uc => ({
                id: uc.id,
                userId: uc.user_id,
                couponId: uc.coupon_id,
                code: uc.code,
                couponTitle: (uc.coupons as any)?.title,
                couponImage: (uc.coupons as any)?.image
            }));
        }
      } catch (e) { return []; }
      return [];
  },

  async buyCoupon(id: string) {
      if (!id || id === 'undefined') throw new Error("Invalid coupon ID");
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      const { data: coupon } = await supabase.from('coupons').select('price').eq('id', id).single();
      if (!coupon || user.xp < coupon.price) throw new Error("Not enough XP");
      await supabase.from('user_coupons').insert({ user_id: user.id, coupon_id: id, code: `SNZ-${Math.random().toString(36).substring(7).toUpperCase()}` });
      await supabase.from('profiles').update({ xp: user.xp - coupon.price }).eq('id', user.id);
  },

  async viewStory(id: string) {
      if (!id || id === 'undefined') return;
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('story_views').upsert({ story_id: id, user_id: user.id }, { onConflict: 'story_id,user_id' });
  },

  async createStory(media: string, caption: string, businessId: string | undefined, config: any) {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('stories').insert({ user_id: user.id, business_id: businessId, media, caption, content_config: config, status: 'published' });
  },

  async createCommunity(d: any) {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('communities').insert({ ...d, author_id: user.id, status: 'pending' });
  },

  async getCommunities(): Promise<Community[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('communities').select('*').eq('status', 'approved');
          return data?.map(c => ({ ...c, membersCount: 0 })) || [];
      }
      return mockStore.communities;
  },

  async getCommunityById(id: string): Promise<Community | null> {
      if (!id || id === 'undefined') return null;
      if (isSupabaseConfigured() && supabase) {
          const { data = null } = await supabase.from('communities').select('*').eq('id', id).single();
          return data ? { ...data, membersCount: 0 } : null;
      }
      return null;
  },

  async getCommunityPosts(id: string): Promise<CommunityPost[]> {
      if (!id || id === 'undefined') return [];
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('community_posts').select('*, profiles(name, avatar)').eq('community_id', id).order('created_at', { ascending: false });
          return data?.map(p => ({ id: p.id, communityId: p.community_id, authorId: p.author_id, authorName: p.profiles?.name, authorAvatar: p.profiles?.avatar, content: p.content, image: p.image, likes: p.likes || 0, createdAt: p.created_at })) || [];
      }
      return [];
  },

  async leaveCommunity(id: string) {
      if (!id || id === 'undefined') return;
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('community_members').delete().eq('community_id', id).eq('user_id', user.id);
  },

  async createCommunityPost(cid: string, content: string, image: string) {
      if (!cid || cid === 'undefined') return;
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('community_posts').insert({ community_id: cid, author_id: user.id, content, image });
  },

  async getStories(): Promise<Story[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase
            .from('stories')
            .select('*, story_views(user_id, profiles(name, avatar))')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          if (!data) return [];

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
    } catch (e: any) {
        console.error("Get stories failed:", e?.message || e);
    }
    return [];
  },
};

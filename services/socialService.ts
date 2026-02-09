
import { 
    Comment, Review, Conversation, Message, Story, Community, CommunityPost, StoryConfig, Suggestion, Report, Coupon, UserCoupon, Ad, NewsItem, Business, User, UserRole, Notification, Vacancy, Resume, Ride, CommunityChatMessage
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

  async getNotifications(): Promise<Notification[]> {
      try {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return [];
        
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(n => ({
            id: n.id,
            userId: n.user_id,
            text: n.text,
            isRead: n.is_read,
            createdAt: n.created_at,
            type: n.type || 'system',
            link: n.link
        }));
      } catch (e) { return []; }
  },

  async markAllNotificationsAsRead(): Promise<void> {
      try {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
            
        if (error) throw error;
      } catch (e: any) { 
          console.error("Mark notifications read error:", e.message);
          throw e; 
      }
  },

  async deleteNotification(id: string): Promise<void> {
      if (!isSupabaseConfigured() || !supabase) return;
      const user = await authService.getCurrentUser();
      if (!user) return;
      await supabase.from('notifications').delete().eq('id', id).eq('user_id', user.id);
  },

  async clearAllNotifications(): Promise<void> {
      try {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        
        const { error } = await supabase.from('notifications').delete().eq('user_id', user.id);
        if (error) throw error;
      } catch (e: any) { 
          console.error("Clear notifications error:", e.message);
          throw e; 
      }
  },

  async getConversationById(id: string): Promise<Conversation | null> {
      if (!isSupabaseConfigured() || !supabase || !id) return null;
      try {
          const user = await authService.getCurrentUser();
          if (!user) return null;

          const { data: convo, error } = await supabase
              .from('conversations')
              .select('*')
              .eq('id', id)
              .maybeSingle();

          if (error || !convo) return null;

          const partnerId = convo.participant1_id === user.id ? convo.participant2_id : convo.participant1_id;
          
          const [profRes, bizRes] = await Promise.all([
              supabase.from('profiles').select('id, name, avatar').eq('id', partnerId).maybeSingle(),
              convo.business_id 
                ? supabase.from('businesses').select('id, name, image, author_id').eq('id', convo.business_id).maybeSingle()
                : Promise.resolve({ data: null })
          ]);

          return {
              id: convo.id,
              participant1Id: convo.participant1_id,
              participant2Id: convo.participant2_id,
              partnerId: partnerId,
              partnerName: bizRes.data ? (bizRes.data.author_id === user.id ? (profRes.data?.name || 'Клиент') : bizRes.data.name) : (profRes.data?.name || 'Житель Снежинска'),
              partnerAvatar: bizRes.data ? (bizRes.data.author_id === user.id ? (profRes.data?.avatar || '') : bizRes.data.image) : (profRes.data?.avatar || ''),
              businessId: convo.business_id,
              businessName: bizRes.data?.name,
              businessOwnerId: bizRes.data?.author_id,
              lastMessageDate: '',
              lastMessageText: ''
          };
      } catch (e) { return null; }
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

            const { data: allLastMsgs } = await supabase
                .from('messages')
                .select('conversation_id, text, created_at, deleted_for')
                .in('conversation_id', convoIds)
                .not('deleted_for', 'cs', `{${user.id}}`)
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
                    ? supabase.from('businesses').select('id, name, image, author_id').in('id', Array.from(bizIds))
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
                    
                    const isOwner = bizData?.author_id === user.id;
                    const rawDate = lastMsg?.created_at || '1970-01-01T00:00:00Z';

                    return {
                        id: c.id,
                        participant1Id: c.participant1_id,
                        participant2Id: c.participant2_id,
                        partnerId: partnerId,
                        partnerName: isOwner ? (partnerProfile?.name || 'Клиент') : (bizData ? bizData.name : (partnerProfile?.name || 'Житель Снежинска')),
                        partnerAvatar: isOwner ? (partnerProfile?.avatar || '') : (bizData ? bizData.image : (partnerProfile?.avatar || '')),
                        businessId: c.business_id,
                        businessName: bizData?.name,
                        businessOwnerId: bizData?.author_id,
                        lastMessageDate: lastMsg ? formatRelativeDate(rawDate) : '—',
                        lastMessageDateRaw: rawDate,
                        lastMessageText: lastMsg ? lastMsg.text : 'Нет сообщений',
                        unreadCount: unreadMap.get(c.id) || 0
                    };
                })
                .filter(c => c.lastMessageDateRaw !== '1970-01-01T00:00:00Z');

            return result.sort((a, b) => {
                const dateA = new Date(a.lastMessageDateRaw || 0).getTime();
                const dateB = new Date(b.lastMessageDateRaw || 0).getTime();
                return dateB - dateA;
            });
        }
        
        return mockStore.conversations.filter(c => (c.participant1Id === user.id || c.participant2Id === user.id));
      } catch (e: any) { 
          console.error("Conversations fetch error:", e.message);
          return []; 
      }
  },

  async getMessages(cid: string): Promise<Message[]> {
      if (!cid || cid === 'undefined') return [];
      try {
        const user = await authService.getCurrentUser();
        if (!user) return [];

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', cid)
                .not('deleted_for', 'cs', `{${user.id}}`)
                .order('created_at', { ascending: true });

            if (!error && data) {
                return data.map(m => ({ 
                    ...m, 
                    conversationId: m.conversation_id, 
                    senderId: m.sender_id, 
                    createdAt: m.created_at, 
                    isRead: m.is_read,
                    imageUrl: m.image_url,
                    audioUrl: m.audio_url
                }));
            }
        }
      } catch (e) {}
      
      return mockStore.messages.filter(m => m.conversationId === cid);
  },

  async uploadChatFile(file: Blob, ext: string = 'jpg'): Promise<string> {
      if (!isSupabaseConfigured() || !supabase) throw new Error("Supabase not connected");
      const fileName = `${Math.random()}.${ext}`;
      const { error } = await supabase.storage.from('chat-media').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(fileName);
      return publicUrl;
  },

  async sendMessage(cid: string, text: string, imageUrl?: string, audioUrl?: string): Promise<Message> {
      if (!cid || cid === 'undefined') throw new Error("Invalid conversation ID");
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");

      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase.from('messages').insert({ 
              conversation_id: cid, 
              sender_id: user.id, 
              text, 
              is_read: false,
              image_url: imageUrl,
              audio_url: audioUrl
          }).select().single();
          if (error) throw error;
          return { 
              ...data, 
              conversationId: data.conversation_id, 
              senderId: data.sender_id, 
              createdAt: data.created_at, 
              isRead: data.is_read,
              imageUrl: data.image_url,
              audio_url: data.audio_url
          };
      }
      return { id: 'm_mock', conversationId: cid, senderId: user.id, text, createdAt: new Date().toISOString(), isRead: true };
  },

  async deleteMessages(mids: string[], mode: 'forMe' | 'forEveryone'): Promise<void> {
      if (!mids || mids.length === 0) return;
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");

      if (isSupabaseConfigured() && supabase) {
          if (mode === 'forEveryone') {
              await supabase.from('messages').delete().in('id', mids).eq('sender_id', user.id);
          } else {
              for (const mid of mids) {
                  await supabase.rpc('delete_message_for_user', { msg_id: mid, user_id: user.id });
              }
          }
      }
  },

  async deleteConversation(cid: string): Promise<void> {
      if (!cid) return;
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");

      if (isSupabaseConfigured() && supabase) {
          const { data: messages } = await supabase.from('messages').select('id').eq('conversation_id', cid);
          if (messages && messages.length > 0) {
              await this.deleteMessages(messages.map(m => m.id), 'forMe');
          }
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
          let query = supabase.from('conversations').select('id');
          if (businessId) {
              query = query.eq('business_id', businessId).or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);
          } else {
              query = query.is('business_id', null).or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);
          }

          const { data: results } = await query;
          const existing = results?.find(c => true);
          let cid = existing?.id;
          if (!cid) {
              const { data: newConvo, error: insertError } = await supabase.from('conversations').insert({ 
                  participant1_id: user.id, 
                  participant2_id: partnerId, 
                  business_id: businessId || null
              }).select().single();
              if (insertError) throw insertError;
              cid = newConvo?.id;
          }
          if (text && cid) await this.sendMessage(cid, text);
          return cid!;
      }
      return 'mc_mock';
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
      try {
          const user = await authService.getCurrentUser();
          if (!user || !isSupabaseConfigured() || !supabase) return;
          
          const isAdmin = user.role === UserRole.ADMIN;
          const configStr = typeof config === 'string' ? config : JSON.stringify(config);

          const { error } = await supabase.from('stories').insert({ 
              user_id: user.id, 
              business_id: businessId || null, 
              media, 
              caption: caption || '', 
              content_config: configStr, 
              status: isAdmin ? 'published' : 'pending' // Важно: админы постят сразу, юзеры - на модерацию
          });

          if (error) throw error;
      } catch (e: any) {
          console.error("createStory error:", e.message);
          throw e;
      }
  },

  async getStories(): Promise<Story[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data, error } = await supabase
            .from('stories')
            .select('*, story_views(user_id, profiles(name, avatar))')
            .eq('status', 'published') // Берем ТОЛЬКО опубликованные
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          if (!data) return [];
          
          // Фильтрация по сроку давности (макс 3 дня)
          const MAX_STORY_AGE = 3 * 24 * 60 * 60 * 1000;
          const now = Date.now();
          const filteredData = data.filter(s => (now - new Date(s.created_at).getTime()) < MAX_STORY_AGE);

          const profileIds = [...new Set(filteredData.map(s => s.user_id).filter(Boolean))];
          const bizIds = [...new Set(filteredData.map(s => s.business_id).filter(Boolean))];
          const [profsRes, bizRes] = await Promise.all([
              supabase.from('profiles').select('id, name, avatar').in('id', profileIds),
              bizIds.length > 0 ? supabase.from('businesses').select('id, name, image').in('id', bizIds) : { data: [] }
          ]);
          const profMap = new Map<string, any>(profsRes.data?.map(p => [p.id, p]) || []);
          const bizMap = new Map<string, any>(bizRes.data?.map(b => [b.id, b]) || []);
          
          return filteredData.map((s: any) => {
              const business = s.business_id ? bizMap.get(s.business_id) : null;
              const profile = profMap.get(s.user_id);
              const viewers = (s.story_views || []).map((v: any) => {
                  const profileData = (Array.isArray(v.profiles) ? v.profiles[0] : v.profiles) as any;
                  return { id: v.user_id, name: profileData?.name || 'Житель', avatar: profileData?.avatar || '' };
              });
              let config = s.content_config;
              if (typeof config === 'string') { try { config = JSON.parse(config); } catch (e) { config = null; } }
              
              return { 
                id: s.id, 
                authorId: s.business_id || s.user_id, 
                userId: s.user_id, 
                authorName: (business as any)?.name || (profile as any)?.name || 'Житель Снежинска', 
                authorAvatar: (business as any)?.image || (profile as any)?.avatar || `https://ui-avatars.com/api/?name=${s.id.slice(0,1)}`, 
                media: s.media, 
                caption: s.caption || '', 
                contentConfig: config, 
                createdAt: s.created_at, 
                viewers, 
                status: s.status || 'published' 
              };
          });
      }
    } catch (e) {}
    return [];
  },

  async getCommunities(): Promise<Community[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data, error } = await supabase.from('communities').select('*').eq('status', 'approved');
              if (error) throw error;
              
              const user = await authService.getCurrentUser();
              let membershipMap = new Map<string, boolean>();
              if (user) {
                  const { data: memberships } = await supabase.from('community_members').select('community_id').eq('user_id', user.id);
                  memberships?.forEach(m => membershipMap.set(m.community_id, true));
              }

              return (data || []).map(c => ({
                  ...c,
                  membersCount: c.members_count || 0,
                  isMember: membershipMap.has(c.id),
                  authorId: c.author_id
              }));
          } catch (e) {
              console.error("getCommunities failed:", e);
              return [];
          }
      }
      return mockStore.communities;
  },

  async getCommunityById(id: string): Promise<Community | null> {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data, error } = await supabase.from('communities').select('*').eq('id', id).maybeSingle();
              if (error) throw error;
              if (!data) return null;

              const user = await authService.getCurrentUser();
              let isMember = false;
              if (user) {
                  const { data: member } = await supabase.from('community_members').select('id').eq('community_id', id).eq('user_id', user.id).maybeSingle();
                  isMember = !!member;
              }

              return {
                  ...data,
                  membersCount: data.members_count || 0,
                  isMember,
                  authorId: data.author_id
              };
          } catch (e) {
              console.error("getCommunityById failed:", e);
              return null;
          }
      }
      return mockStore.communities.find(c => c.id === id) || null;
  },

  async createCommunity(data: any): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('communities').insert({
          ...data,
          author_id: user.id,
          status: 'pending'
      });
  },

  async joinCommunity(communityId: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('community_members').insert({ community_id: communityId, user_id: user.id });
  },

  async leaveCommunity(communityId: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', user.id);
  },

  async getCommunityMembers(communityId: string): Promise<User[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data, error } = await supabase.from('community_members').select('user_id').eq('community_id', communityId);
              if (error) throw error;
              const userIds = data?.map(m => m.user_id) || [];
              if (userIds.length === 0) return [];
              const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
              return (profiles || []).map((p: any) => ({
                  ...p,
                  role: p.role as UserRole,
                  badges: p.badges || [],
                  favorites: []
              }));
          } catch (e) {
              console.error("getCommunityMembers failed:", e);
              return [];
          }
      }
      return [];
  },

  async getCommunityPosts(communityId: string, pendingOnly: boolean): Promise<CommunityPost[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
              let query = supabase.from('community_posts').select('*, profiles(name, avatar)').eq('community_id', communityId);
              if (pendingOnly) query = query.eq('status', 'pending');
              else query = query.eq('status', 'approved');
              
              const { data, error } = await query.order('created_at', { ascending: false });
              if (error) throw error;
              
              const user = await authService.getCurrentUser();
              const { data: likes } = user ? await supabase.from('community_post_likes').select('post_id').eq('user_id', user.id) : { data: [] };
              const likedSet = new Set(likes?.map(l => l.post_id) || []);

              return (data || []).map(p => ({
                  ...p,
                  communityId: p.community_id,
                  authorId: p.author_id,
                  authorName: p.profiles?.name,
                  authorAvatar: p.profiles?.avatar,
                  createdAt: p.created_at,
                  isLiked: likedSet.has(p.id)
              }));
          } catch (e) {
              console.error("getCommunityPosts failed:", e);
              return [];
          }
      }
      return [];
  },

  async createCommunityPost(communityId: string, content: string, image: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      
      const { data: comm } = await supabase.from('communities').select('author_id').eq('id', communityId).single();
      const status = comm?.author_id === user.id ? 'approved' : 'pending';

      await supabase.from('community_posts').insert({
          community_id: communityId,
          author_id: user.id,
          content,
          image,
          status
      });
  },

  async likeCommunityPost(postId: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      
      try {
          const { data: existing } = await supabase.from('community_post_likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
          if (existing) {
              await supabase.from('community_post_likes').delete().eq('id', existing.id);
          } else {
              await supabase.from('community_post_likes').insert({ post_id: postId, user_id: user.id });
          }
      } catch (e) {
          console.error("likeCommunityPost failed:", e);
      }
  },

  async deleteCommunityPost(postId: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('community_posts').delete().eq('id', postId);
      }
  },

  async approveCommunityPost(postId: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('community_posts').update({ status: 'approved' }).eq('id', postId);
      }
  },

  async getCommunityPostComments(postId: string): Promise<any[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data } = await supabase.from('community_post_comments').select('*, profiles(name, avatar)').eq('post_id', postId).order('created_at', { ascending: true });
              return data?.map(c => ({
                  id: c.id,
                  userId: c.user_id,
                  userName: c.profiles?.name,
                  userAvatar: c.profiles?.avatar,
                  text: c.text,
                  createdAt: c.created_at
              })) || [];
          } catch (e) {
              console.error("getCommunityPostComments failed:", e);
              return [];
          }
      }
      return [];
  },

  async addCommunityPostComment(postId: string, text: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('community_post_comments').insert({ post_id: postId, user_id: user.id, text });
  },

  async getCommunityChatMessages(communityId: string): Promise<CommunityChatMessage[]> {
      if (isSupabaseConfigured() && supabase) {
          try {
              const { data } = await supabase.from('community_chat').select('*, profiles(name, avatar)').eq('community_id', communityId).order('created_at', { ascending: true }).limit(100);
              return data?.map(m => ({
                  id: m.id,
                  communityId: m.community_id,
                  senderId: m.user_id,
                  senderName: m.profiles?.name,
                  senderAvatar: m.profiles?.avatar,
                  text: m.text,
                  createdAt: m.created_at
              })) || [];
          } catch (e) {
              console.error("getCommunityChatMessages failed:", e);
              return [];
          }
      }
      return [];
  },

  async sendCommunityChatMessage(communityId: string, text: string): Promise<void> {
      const user = await authService.getCurrentUser();
      if (!user || !isSupabaseConfigured() || !supabase) return;
      await supabase.from('community_chat').insert({ community_id: communityId, user_id: user.id, text });
  }
};

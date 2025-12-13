
import { 
    Comment, Review, Conversation, Message, Story, Community, CommunityPost, StoryConfig, Suggestion 
} from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { mockStore } from './mockData';
import { authService } from './authService';
import { businessService } from './businessService'; 

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const formatRelativeDate = (dateStr: string): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return 'Недавно';
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const isToday = now.getDate() === date.getDate() &&
                    now.getMonth() === date.getMonth() &&
                    now.getFullYear() === date.getFullYear();
    
    if (isToday) return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Helper to find the user ID in a record regardless of column naming convention
const getRecordUserId = (record: any): string | undefined => {
    return record.user_id || record.author_id || record.userId || record.authorId;
};

export const socialService = {
    // --- COMMENTS ---
    async getComments(newsId: string): Promise<Comment[]> {
        if (isSupabaseConfigured() && supabase) {
            let data: any[] | null = null;
            try {
                const result = await supabase.from('comments').select('*, profiles(name, avatar)').eq('news_id', newsId);
                if (!result.error && result.data) data = result.data;
            } catch (e) { console.warn(e); }

            if (!data) {
                try {
                    const result = await supabase.from('comments').select('*').eq('news_id', newsId);
                    if (!result.error && result.data) data = result.data;
                } catch (e) { console.warn(e); }
            }

            if (data) {
                const userIdsToFetch = new Set<string>();
                data.forEach((c: any) => { if (!c.profiles) { const uid = getRecordUserId(c); if (uid) userIdsToFetch.add(uid); }});
                if (userIdsToFetch.size > 0) {
                    try {
                        const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', Array.from(userIdsToFetch));
                        if (profiles) {
                            const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
                            data = data.map((c: any) => { if (!c.profiles) { const uid = getRecordUserId(c); if (uid && profileMap.has(uid)) return { ...c, profiles: profileMap.get(uid) }; } return c; });
                        }
                    } catch (e) {}
                }
                return data.map((c: any) => {
                    const name = c.profiles?.name || 'Пользователь';
                    const avatar = c.profiles?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
                    return { id: c.id, newsId: c.news_id, text: c.text || c.content || c.body || '', date: formatRelativeDate(c.created_at || c.date), authorName: name, authorAvatar: avatar };
                }).sort((a, b) => b.date.localeCompare(a.date));
            }
            return [];
        }
        return mockStore.comments.filter(c => c.newsId === newsId);
    },

    async addComment(newsId: string, text: string): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error("Unauthorized");
        if (isSupabaseConfigured() && supabase) {
            const payload = { news_id: newsId, user_id: user.id, text };
            const { error } = await supabase.from('comments').insert(payload);
            if (error) await supabase.from('comments').insert({ news_id: newsId, author_id: user.id, text });
            return;
        }
        mockStore.comments.push({ id: Math.random().toString(), newsId, authorName: user.name, authorAvatar: user.avatar, text, date: 'Только что' });
    },

    // --- REVIEWS ---
    async getReviews(businessId: string): Promise<Review[]> {
        if (isSupabaseConfigured() && supabase) {
            let data: any[] | null = null;
            try { const result = await supabase.from('reviews').select('*, profiles(name, avatar)').eq('business_id', businessId); if (!result.error && result.data) data = result.data; } catch (e) {}
            if (!data) { try { const result = await supabase.from('reviews').select('*').eq('business_id', businessId); if (!result.error && result.data) data = result.data; } catch (e) {} }
            if (data) {
                const userIdsToFetch = new Set<string>();
                data.forEach((r: any) => { if (!r.profiles) { const uid = getRecordUserId(r); if (uid) userIdsToFetch.add(uid); }});
                if (userIdsToFetch.size > 0) {
                    try {
                        const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', Array.from(userIdsToFetch));
                        if (profiles) {
                            const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
                            data = data.map((r: any) => { if (!r.profiles) { const uid = getRecordUserId(r); if (uid && profileMap.has(uid)) return { ...r, profiles: profileMap.get(uid) }; } return r; });
                        }
                    } catch (e) {}
                }
                return data.map((r: any) => {
                    const name = r.profiles?.name || 'Пользователь';
                    const avatar = r.profiles?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
                    return { id: r.id, businessId: r.business_id, rating: r.rating, text: r.text || r.comment || r.content || '', date: formatRelativeDate(r.created_at || r.date), authorName: name, authorAvatar: avatar };
                }).sort((a, b) => b.date.localeCompare(a.date));
            }
            return [];
        }
        return mockStore.reviews.filter(r => r.businessId === businessId);
    },

    async addReview(businessId: string, rating: number, text: string): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error("Unauthorized");
        if (isSupabaseConfigured() && supabase) {
            const payload1 = { business_id: businessId, user_id: user.id, rating, text };
            const { error } = await supabase.from('reviews').insert(payload1);
            if (error) { const payload2 = { business_id: businessId, author_id: user.id, rating, text }; await supabase.from('reviews').insert(payload2); }
            return;
        }
        mockStore.reviews.unshift({ id: Math.random().toString(), businessId, authorName: user.name, authorAvatar: user.avatar, rating, text, date: 'Только что' });
    },

    // --- CHAT ---
    async getConversations(): Promise<Conversation[]> {
        const user = await authService.getCurrentUser();
        if (!user) return [];
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase.from('conversations').select('*, messages(text, created_at)').or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`).order('updated_at', { ascending: false });
                if (error) throw error;
                if (!data) return [];
                const partnerIds = data.map((c: any) => c.participant1_id === user.id ? c.participant2_id : c.participant1_id);
                let profiles: any[] = [];
                try { if (partnerIds.length > 0) { const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar').in('id', partnerIds); profiles = profilesData || []; } } catch (e) {}
                return data.map((c: any) => {
                    const partnerId = c.participant1_id === user.id ? c.participant2_id : c.participant1_id;
                    const profile = profiles.find((p: any) => p.id === partnerId);
                    let lastMessageText = 'Нет сообщений';
                    if (c.messages && Array.isArray(c.messages) && c.messages.length > 0) {
                        c.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                        const last = c.messages[0];
                        const msgContent = last.text || last.content || '';
                        if (msgContent) {
                            if (msgContent.startsWith('http') || msgContent.includes('blob:')) lastMessageText = '📷 Фото';
                            else if (msgContent.startsWith('{')) { try { const parsed = JSON.parse(msgContent); if (parsed.type === 'ad_inquiry') lastMessageText = '📄 Заявка: ' + parsed.title; else lastMessageText = 'Системное сообщение'; } catch { lastMessageText = msgContent; } } else lastMessageText = msgContent;
                        }
                    }
                    return { id: c.id, participant1Id: c.participant1_id, participant2Id: c.participant2_id, partnerName: profile?.name || 'Пользователь', partnerAvatar: profile?.avatar || `https://ui-avatars.com/api/?name=User&background=random`, lastMessageDate: formatRelativeDate(c.updated_at), lastMessageText: lastMessageText };
                });
            } catch (e) { console.error("Error fetching conversations", e); }
        }
        return []; 
    },
    async getMessages(conversationId: string): Promise<Message[]> {
        if (isSupabaseConfigured() && supabase) { 
            try { 
                const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }); 
                if (error) throw error;
                if (data) return data.map((m: any) => ({ id: m.id, conversationId: m.conversation_id, senderId: m.sender_id, text: m.text || m.content || m.message || m.body || '', createdAt: m.created_at || new Date().toISOString(), isRead: m.is_read, status: m.is_read ? 'read' : 'sent' })); 
            } catch (e) {
                console.error("Error fetching messages:", e);
            } 
        }
        return [];
    },
    async getUnreadChatsCount(): Promise<number> {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return 0;
        try { const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).neq('sender_id', user.id).eq('is_read', false); return count || 0; } catch (e) { return 0; }
    },
    async sendMessage(conversationId: string, text: string): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        try {
            const { error } = await supabase
                .from('messages')
                .insert({ conversation_id: conversationId, sender_id: user.id, is_read: false, text: text });
            
            if (error) { 
                console.error("SendMessage Error:", error);
                // Fallback for schema variation
                await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, is_read: false, content: text }); 
            }
            
            await supabase.from('conversations').update({ updated_at: new Date() }).eq('id', conversationId);
        } catch (e) { console.error("Send message failed", e); }
    },
    async markMessagesAsRead(conversationId: string): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user) return;
        if (isSupabaseConfigured() && supabase) {
            try { 
                const { error } = await supabase.from('messages')
                    .update({ is_read: true })
                    .eq('conversation_id', conversationId)
                    .neq('sender_id', user.id) 
                    .eq('is_read', false); 
                
                if (error) console.error("Mark read failed in DB:", error);
            } catch (e) {
                console.error("Mark read exception:", e);
            }
        }
    },
    async subscribeToMessages(conversationId: string, callback: (msg: Message) => void) {
        if (!isSupabaseConfigured() || !supabase) return { unsubscribe: () => {} };
        
        const subscription = supabase.channel(`public:messages:conversation_id=eq.${conversationId}`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, 
                (payload) => { 
                    const m = payload.new as any; 
                    if (!m) return; 
                    callback({ 
                        id: m.id, 
                        conversationId: m.conversation_id, 
                        senderId: m.sender_id, 
                        text: m.text || m.content || m.message || m.body || '', 
                        createdAt: m.created_at, 
                        isRead: m.is_read, 
                        status: m.is_read ? 'read' : 'sent' 
                    }); 
                }
            )
            .subscribe();
            
        return { unsubscribe: () => supabase?.removeChannel(subscription) };
    },
    async startChat(userId: string, context?: string): Promise<string> {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || !isSupabaseConfigured() || !supabase) return 'mock-chat-id';
        const { data: existing } = await supabase.from('conversations').select('id').or(`and(participant1_id.eq.${currentUser.id},participant2_id.eq.${userId}),and(participant1_id.eq.${userId},participant2_id.eq.${currentUser.id})`).single();
        if (existing) { if (context) await this.sendMessage(existing.id, context); return existing.id; }
        const { data: newConvo, error } = await supabase.from('conversations').insert({ participant1_id: currentUser.id, participant2_id: userId, updated_at: new Date() }).select().single();
        if (error || !newConvo) throw new Error("Could not create chat");
        if (context) await this.sendMessage(newConvo.id, context);
        return newConvo.id;
    },

    // --- STORIES ---
    async getStories(status: 'published' | 'pending' = 'published'): Promise<Story[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                let { data: storiesData, error } = await supabase
                    .from('stories')
                    .select('*')
                    .eq('status', status)
                    .order('created_at', { ascending: false });

                if (error) {
                    const retry = await supabase.from('stories').select('*').order('created_at', { ascending: false });
                    storiesData = retry.data;
                    error = retry.error;
                }

                if (error) {
                    if (error.code === 'PGRST100' || error.code === '400') {
                        return mockStore.stories.filter(s => (s.status || 'published') === status);
                    }
                    throw error;
                }

                if (!storiesData) return [];

                const storyIds = storiesData.map((s: any) => s.id);
                let viewsData: any[] = [];
                if (storyIds.length > 0) {
                    try {
                        const { data: views } = await supabase.from('story_views').select('story_id, user_id');
                        if (views) viewsData = views;
                    } catch (e) {}
                }
                const userIds = new Set<string>();
                const businessIds = new Set<string>();
                const viewerUserIds = new Set<string>();
                storiesData.forEach((s: any) => { if (s.user_id) userIds.add(s.user_id); if (s.business_id) businessIds.add(s.business_id); });
                viewsData.forEach((v: any) => { if (v.user_id) viewerUserIds.add(v.user_id); });
                
                let profiles: any[] = [];
                let businesses: any[] = [];
                let viewersProfiles: any[] = [];
                if (userIds.size > 0) { const { data } = await supabase.from('profiles').select('id, name, avatar').in('id', Array.from(userIds)); if (data) profiles = data; }
                if (businessIds.size > 0) { const { data } = await supabase.from('businesses').select('id, name, image').in('id', Array.from(businessIds)); if (data) businesses = data; }
                if (viewerUserIds.size > 0) { const { data } = await supabase.from('profiles').select('id, name, avatar').in('id', Array.from(viewerUserIds)); if (data) viewersProfiles = data; }
                const viewerMap = new Map(viewersProfiles.map((p: any) => [p.id, p]));

                return storiesData.map((s: any) => {
                    let authorName = 'Пользователь';
                    let authorAvatar = '';
                    if (s.business_id) { const biz = businesses.find(b => b.id === s.business_id); if (biz) { authorName = biz.name; authorAvatar = biz.image; } } 
                    else if (s.user_id) { const profile = profiles.find(p => p.id === s.user_id); if (profile) { authorName = profile.name; authorAvatar = profile.avatar; } }
                    if (!authorAvatar) authorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff`;
                    
                    const storyViewers = viewsData.filter((v: any) => v.story_id === s.id).map((v: any) => { 
                        const p = viewerMap.get(v.user_id); 
                        return p ? { id: p.id, name: p.name, avatar: p.avatar } : null; // Added id
                    }).filter(Boolean);

                    return {
                        id: s.id,
                        media: s.media,
                        caption: s.caption,
                        contentConfig: s.content_config,
                        authorId: s.business_id || s.user_id,
                        authorName: authorName,
                        authorAvatar: authorAvatar,
                        createdAt: s.created_at,
                        status: s.status || 'published',
                        viewers: storyViewers
                    };
                });
            } catch (e) {
                return mockStore.stories.filter(s => (s.status || 'published') === status);
            }
        }
        return mockStore.stories.filter(s => (s.status || 'published') === status);
    },

    async createStory(media: string, caption: string, businessId?: string, config?: StoryConfig): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        let status = 'pending';
        let canPost = false;

        if (user.role === 'ADMIN') canPost = true;
        else if (businessId) {
            const biz = await businessService.getBusinessById(businessId);
            if (biz && biz.canPostStories) canPost = true;
        }

        if (canPost) status = 'published';

        if (isSupabaseConfigured() && supabase) {
            const payload: any = {
                user_id: user.id,
                media,
                caption,
                content_config: config,
                status
            };
            if (businessId) payload.business_id = businessId;
            
            const { error } = await supabase.from('stories').insert(payload);
            if (error) {
                delete payload.status;
                const { error: retryError } = await supabase.from('stories').insert(payload);
                if (retryError) throw retryError;
            }
            return;
        }

        mockStore.stories.unshift({ 
            id: Math.random().toString(), 
            media, 
            caption, 
            contentConfig: config,
            authorId: businessId || user.id, 
            authorName: user.name, 
            authorAvatar: user.avatar,
            createdAt: new Date().toISOString(),
            status: status as any
        });
    },

    async approveStory(id: string): Promise<void> {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('stories').update({ status: 'published' }).eq('id', id);
            return;
        }
        const s = mockStore.stories.find(story => story.id === id);
        if (s) s.status = 'published';
    },

    async rejectStory(id: string): Promise<void> {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('stories').delete().eq('id', id); 
            return;
        }
        mockStore.stories = mockStore.stories.filter(s => s.id !== id);
    },

    async viewStory(storyId: string): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;
        try { await supabase.from('story_views').insert({ story_id: storyId, user_id: user.id }); } catch (e) {}
    },

    // --- COMMUNITIES ---
    async getCommunities(): Promise<Community[]> { return mockStore.communities; },
    async getCommunityById(id: string): Promise<Community | null> { return mockStore.communities.find(c => c.id === id) || null; },
    async createCommunity(data: any): Promise<Community> {
        const newComm = { id: Math.random().toString(), name: data.name, description: data.description, image: data.image || '', membersCount: 1, isMember: true };
        mockStore.communities.push(newComm);
        return newComm;
    },
    async joinCommunity(id: string): Promise<void> { const comm = mockStore.communities.find(c => c.id === id); if (comm) { comm.isMember = true; comm.membersCount++; } },
    async leaveCommunity(id: string): Promise<void> { const comm = mockStore.communities.find(c => c.id === id); if (comm) { comm.isMember = false; comm.membersCount = Math.max(0, comm.membersCount - 1); } },
    async getCommunityPosts(communityId: string): Promise<CommunityPost[]> { return mockStore.communityPosts.filter(p => p.communityId === communityId); },
    async createCommunityPost(communityId: string, content: string, image?: string): Promise<CommunityPost> {
        const user = await authService.getCurrentUser();
        const newPost = { id: Math.random().toString(), communityId, authorId: user?.id || 'anon', authorName: user?.name || 'Anon', authorAvatar: user?.avatar, content, image, likes: 0, createdAt: new Date().toISOString() };
        mockStore.communityPosts.unshift(newPost);
        return newPost;
    },

    // --- SUGGESTIONS ---
    async sendSuggestion(text: string): Promise<void> {
        const user = await authService.getCurrentUser();
        if (isSupabaseConfigured() && supabase) { await supabase.from('suggestions').insert({ user_id: user?.id, text }); return; }
        mockStore.suggestions.unshift({ id: Math.random().toString(), text, userId: user?.id, userName: user?.name, createdAt: new Date().toISOString(), isRead: false });
    },
    async getSuggestions(): Promise<Suggestion[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data: suggestionsData, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                if (!suggestionsData) return [];
                const userIds = new Set<string>(); suggestionsData.forEach((s: any) => { if (s.user_id) userIds.add(s.user_id); });
                let profilesMap = new Map();
                if (userIds.size > 0) { const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', Array.from(userIds)); if (profiles) { profiles.forEach((p: any) => profilesMap.set(p.id, p)); } }
                return suggestionsData.map((s: any) => { const profile = profilesMap.get(s.user_id); return { id: s.id, userId: s.user_id, userName: profile?.name || 'Аноним', userAvatar: profile?.avatar, text: s.text || s.content, createdAt: s.created_at, isRead: s.is_read }; });
            } catch (e) { return []; }
        }
        return mockStore.suggestions;
    },
    async deleteSuggestion(id: string): Promise<void> {
        if (isSupabaseConfigured() && supabase) { await supabase.from('suggestions').delete().eq('id', id); return; }
        mockStore.suggestions = mockStore.suggestions.filter(s => s.id !== id);
    }
};

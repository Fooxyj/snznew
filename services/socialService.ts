
import { 
    Comment, Review, Conversation, Message, Story, Community, CommunityPost, StoryConfig, Suggestion 
} from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { mockStore } from './mockData';
import { authService } from './authService';

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
                const result = await supabase
                    .from('comments')
                    .select('*, profiles(name, avatar)')
                    .eq('news_id', newsId);
                
                if (!result.error && result.data) data = result.data;
            } catch (e) { console.warn(e); }

            if (!data) {
                try {
                    const result = await supabase
                        .from('comments')
                        .select('*')
                        .eq('news_id', newsId);
                    if (!result.error && result.data) data = result.data;
                } catch (e) { console.warn(e); }
            }

            if (data) {
                const userIdsToFetch = new Set<string>();
                data.forEach((c: any) => {
                    if (!c.profiles) {
                        const uid = getRecordUserId(c);
                        if (uid) userIdsToFetch.add(uid);
                    }
                });

                if (userIdsToFetch.size > 0) {
                    try {
                        const { data: profiles } = await supabase
                            .from('profiles')
                            .select('id, name, avatar')
                            .in('id', Array.from(userIdsToFetch));
                        
                        if (profiles) {
                            const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
                            data = data.map((c: any) => {
                                if (!c.profiles) {
                                    const uid = getRecordUserId(c);
                                    if (uid && profileMap.has(uid)) {
                                        return { ...c, profiles: profileMap.get(uid) };
                                    }
                                }
                                return c;
                            });
                        }
                    } catch (e) {}
                }

                return data.map((c: any) => {
                    const name = c.profiles?.name || 'Пользователь';
                    const avatar = c.profiles?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

                    return {
                        id: c.id,
                        newsId: c.news_id,
                        text: c.text || c.content || c.body || '',
                        date: formatRelativeDate(c.created_at || c.date),
                        authorName: name,
                        authorAvatar: avatar
                    };
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
            if (error) {
                await supabase.from('comments').insert({ news_id: newsId, author_id: user.id, text });
            }
            return;
        }

        mockStore.comments.push({
            id: Math.random().toString(),
            newsId,
            authorName: user.name,
            authorAvatar: user.avatar,
            text,
            date: 'Только что'
        });
    },

    // --- REVIEWS ---
    async getReviews(businessId: string): Promise<Review[]> {
        if (isSupabaseConfigured() && supabase) {
            // Similar robust fetch logic as comments
            let data: any[] | null = null;
            try {
                const result = await supabase.from('reviews').select('*, profiles(name, avatar)').eq('business_id', businessId);
                if (!result.error && result.data) data = result.data;
            } catch (e) {}

            if (!data) {
                try {
                    const result = await supabase.from('reviews').select('*').eq('business_id', businessId);
                    if (!result.error && result.data) data = result.data;
                } catch (e) {}
            }

            if (data) {
                const userIdsToFetch = new Set<string>();
                data.forEach((r: any) => {
                    if (!r.profiles) {
                        const uid = getRecordUserId(r);
                        if (uid) userIdsToFetch.add(uid);
                    }
                });

                if (userIdsToFetch.size > 0) {
                    try {
                        const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', Array.from(userIdsToFetch));
                        if (profiles) {
                            const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
                            data = data.map((r: any) => {
                                if (!r.profiles) {
                                    const uid = getRecordUserId(r);
                                    if (uid && profileMap.has(uid)) return { ...r, profiles: profileMap.get(uid) };
                                }
                                return r;
                            });
                        }
                    } catch (e) {}
                }

                return data.map((r: any) => {
                    const name = r.profiles?.name || 'Пользователь';
                    const avatar = r.profiles?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
                    return {
                        id: r.id,
                        businessId: r.business_id,
                        rating: r.rating,
                        text: r.text || r.comment || r.content || '',
                        date: formatRelativeDate(r.created_at || r.date),
                        authorName: name,
                        authorAvatar: avatar
                    };
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
            if (error) {
                 const payload2 = { business_id: businessId, author_id: user.id, rating, text };
                 await supabase.from('reviews').insert(payload2);
            }
            return;
        }

        mockStore.reviews.unshift({
            id: Math.random().toString(),
            businessId,
            authorName: user.name,
            authorAvatar: user.avatar,
            rating,
            text,
            date: 'Только что'
        });
    },

    // --- CHAT & MESSAGES ---
    async getConversations(): Promise<Conversation[]> {
        const user = await authService.getCurrentUser();
        if (!user) return [];
        
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase
                    .from('conversations')
                    .select('*')
                    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
                    .order('updated_at', { ascending: false });

                if (error) throw error;
                if (!data) return [];

                const partnerIds = data.map((c: any) => c.participant1_id === user.id ? c.participant2_id : c.participant1_id);
                let profiles: any[] = [];
                try {
                    if (partnerIds.length > 0) {
                        const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar').in('id', partnerIds);
                        profiles = profilesData || [];
                    }
                } catch (e) {}

                return data.map((c: any) => {
                    const partnerId = c.participant1_id === user.id ? c.participant2_id : c.participant1_id;
                    const profile = profiles.find((p: any) => p.id === partnerId);
                    return {
                        id: c.id,
                        participant1Id: c.participant1_id,
                        participant2Id: c.participant2_id,
                        partnerName: profile?.name || 'Пользователь',
                        partnerAvatar: profile?.avatar || `https://ui-avatars.com/api/?name=User&background=random`,
                        lastMessageDate: formatRelativeDate(c.updated_at)
                    };
                });
            } catch (e) {
                console.error("Error fetching conversations", e);
            }
        }
        return []; 
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
                if (data) {
                    return data.map((m: any) => ({
                        id: m.id,
                        conversationId: m.conversation_id,
                        senderId: m.sender_id,
                        text: m.content || m.text || m.message || m.body || '', 
                        createdAt: m.created_at || new Date().toISOString(),
                        isRead: m.is_read,
                        status: m.is_read ? 'read' : 'sent'
                    }));
                }
            } catch (e) {}
        }
        return [];
    },

    async getUnreadChatsCount(): Promise<number> {
        return 0; 
    },

    async sendMessage(conversationId: string, text: string): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;

        const payload = {
            conversation_id: conversationId,
            sender_id: user.id,
            is_read: false, // Ensure explicitly false
            content: text 
        };

        try {
            const { error } = await supabase.from('messages').insert(payload);
            if (error) {
                const { error: err2 } = await supabase.from('messages').insert({ 
                    conversation_id: conversationId,
                    sender_id: user.id,
                    is_read: false,
                    text: text 
                });
                if (err2) throw err2;
            }
            await supabase.from('conversations').update({ updated_at: new Date() }).eq('id', conversationId);
        } catch (e) {
            console.error("Send message failed", e);
        }
    },

    // Marks all messages in a conversation as read (where I am NOT the sender)
    async markMessagesAsRead(conversationId: string): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user || !isSupabaseConfigured() || !supabase) return;

        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .neq('sender_id', user.id) // Only mark incoming messages
                .eq('is_read', false); // Only if currently unread
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    },

    async subscribeToMessages(conversationId: string, callback: (msg: Message) => void) {
        if (!isSupabaseConfigured() || !supabase) return { unsubscribe: () => {} };

        // Listen for both INSERT (new message) and UPDATE (read status change)
        const subscription = supabase
            .channel(`public:messages:conversation_id=eq.${conversationId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
                const m = payload.new as any;
                callback({
                    id: m.id,
                    conversationId: m.conversation_id,
                    senderId: m.sender_id,
                    text: m.content || m.text || m.message || m.body || '',
                    createdAt: m.created_at,
                    isRead: m.is_read,
                    status: m.is_read ? 'read' : 'sent'
                });
            })
            .subscribe();

        return { unsubscribe: () => supabase?.removeChannel(subscription) };
    },

    async startChat(userId: string, context?: string): Promise<string> {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || !isSupabaseConfigured() || !supabase) return 'mock-chat-id';

        const { data: existing } = await supabase.from('conversations')
            .select('id')
            .or(`and(participant1_id.eq.${currentUser.id},participant2_id.eq.${userId}),and(participant1_id.eq.${userId},participant2_id.eq.${currentUser.id})`)
            .single();

        if (existing) {
            if (context) await this.sendMessage(existing.id, context);
            return existing.id;
        }

        const { data: newConvo, error } = await supabase.from('conversations').insert({
            participant1_id: currentUser.id,
            participant2_id: userId,
            updated_at: new Date()
        }).select().single();

        if (error || !newConvo) throw new Error("Could not create chat");
        
        if (context) await this.sendMessage(newConvo.id, context);
        return newConvo.id;
    },

    // --- STORIES (Fixed manual fetch) ---
    async getStories(): Promise<Story[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                // 1. Fetch stories
                const { data: storiesData, error } = await supabase
                    .from('stories')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error || !storiesData) return [];

                // 2. Collect IDs
                const userIds = new Set<string>();
                const businessIds = new Set<string>();

                storiesData.forEach((s: any) => {
                    if (s.user_id) userIds.add(s.user_id);
                    if (s.business_id) businessIds.add(s.business_id);
                });

                // 3. Fetch related data
                let profiles: any[] = [];
                let businesses: any[] = [];

                if (userIds.size > 0) {
                    const { data } = await supabase.from('profiles').select('id, name, avatar').in('id', Array.from(userIds));
                    if (data) profiles = data;
                }
                if (businessIds.size > 0) {
                    const { data } = await supabase.from('businesses').select('id, name, image').in('id', Array.from(businessIds));
                    if (data) businesses = data;
                }

                // 4. Map
                return storiesData.map((s: any) => {
                    let authorName = 'Пользователь';
                    let authorAvatar = '';

                    if (s.business_id) {
                        const biz = businesses.find(b => b.id === s.business_id);
                        if (biz) {
                            authorName = biz.name;
                            authorAvatar = biz.image;
                        }
                    } else if (s.user_id) {
                        const profile = profiles.find(p => p.id === s.user_id);
                        if (profile) {
                            authorName = profile.name;
                            authorAvatar = profile.avatar;
                        }
                    }

                    // Fallback avatar if fetch failed but we have IDs
                    if (!authorAvatar) {
                         authorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff`;
                    }

                    return {
                        id: s.id,
                        media: s.media,
                        caption: s.caption,
                        contentConfig: s.content_config,
                        authorId: s.business_id || s.user_id,
                        authorName: authorName,
                        authorAvatar: authorAvatar,
                        createdAt: s.created_at,
                        viewers: []
                    };
                });
            } catch (e) {
                console.error("Failed to fetch stories", e);
                return [];
            }
        }
        return mockStore.stories;
    },

    async createStory(media: string, caption: string, businessId?: string, config?: StoryConfig): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        if (isSupabaseConfigured() && supabase) {
            const payload: any = {
                user_id: user.id,
                media,
                caption,
                content_config: config
            };
            if (businessId) {
                payload.business_id = businessId;
            }
            await supabase.from('stories').insert(payload);
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
            createdAt: new Date().toISOString() 
        });
    },

    // --- COMMUNITIES ---
    async getCommunities(): Promise<Community[]> { return mockStore.communities; },
    async getCommunityById(id: string): Promise<Community | null> { return mockStore.communities.find(c => c.id === id) || null; },
    async createCommunity(data: any): Promise<Community> {
        const newComm = { id: Math.random().toString(), name: data.name, description: data.description, image: data.image || '', membersCount: 1, isMember: true };
        mockStore.communities.push(newComm);
        return newComm;
    },
    async joinCommunity(id: string): Promise<void> {
        const comm = mockStore.communities.find(c => c.id === id);
        if (comm) { comm.isMember = true; comm.membersCount++; }
    },
    async leaveCommunity(id: string): Promise<void> {
        const comm = mockStore.communities.find(c => c.id === id);
        if (comm) { comm.isMember = false; comm.membersCount = Math.max(0, comm.membersCount - 1); }
    },
    async getCommunityPosts(communityId: string): Promise<CommunityPost[]> { return mockStore.communityPosts.filter(p => p.communityId === communityId); },
    async createCommunityPost(communityId: string, content: string, image?: string): Promise<CommunityPost> {
        const user = await authService.getCurrentUser();
        const newPost = { id: Math.random().toString(), communityId, authorId: user?.id || 'anon', authorName: user?.name || 'Anon', authorAvatar: user?.avatar, content, image, likes: 0, createdAt: new Date().toISOString() };
        mockStore.communityPosts.unshift(newPost);
        return newPost;
    },

    // --- SUGGESTIONS (Updated) ---
    async sendSuggestion(text: string): Promise<void> {
        const user = await authService.getCurrentUser();
        
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('suggestions').insert({ 
                user_id: user?.id, 
                text 
            });
            return;
        }
        
        // Fallback to mock store
        mockStore.suggestions.unshift({
            id: Math.random().toString(),
            text,
            userId: user?.id,
            userName: user?.name,
            createdAt: new Date().toISOString(),
            isRead: false
        });
    },

    // --- ADMIN: GET SUGGESTIONS ---
    async getSuggestions(): Promise<Suggestion[]> {
        if (isSupabaseConfigured() && supabase) {
            try {
                // Fetch suggestions first
                const { data: suggestionsData, error } = await supabase
                    .from('suggestions')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                if (!suggestionsData) return [];

                // Collect User IDs
                const userIds = new Set<string>();
                suggestionsData.forEach((s: any) => {
                    if (s.user_id) userIds.add(s.user_id);
                });

                // Fetch profiles manually to avoid join errors if relation missing
                let profilesMap = new Map();
                if (userIds.size > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, name, avatar')
                        .in('id', Array.from(userIds));
                    
                    if (profiles) {
                        profiles.forEach((p: any) => profilesMap.set(p.id, p));
                    }
                }

                return suggestionsData.map((s: any) => {
                    const profile = profilesMap.get(s.user_id);
                    return {
                        id: s.id,
                        userId: s.user_id,
                        userName: profile?.name || 'Аноним',
                        userAvatar: profile?.avatar,
                        text: s.text || s.content,
                        createdAt: s.created_at,
                        isRead: s.is_read
                    };
                });
            } catch (e) {
                console.warn("Could not fetch suggestions from DB, returning empty array", e);
                return []; 
            }
        }
        return mockStore.suggestions;
    },

    // --- ADMIN: DELETE SUGGESTION ---
    async deleteSuggestion(id: string): Promise<void> {
        if (isSupabaseConfigured() && supabase) {
            await supabase.from('suggestions').delete().eq('id', id);
            return;
        }
        mockStore.suggestions = mockStore.suggestions.filter(s => s.id !== id);
    }
};

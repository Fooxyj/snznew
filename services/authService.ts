
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { CURRENT_USER } from '../constants';
import { User, UserRole, Ad, Business } from '../types';
import { mockStore } from './mockData';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const parseDBDate = (dateStr: string | null | undefined): string | undefined => {
    if (!dateStr) return undefined;
    return dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
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

// Хелпер для формирования списка доступных значков на основе прогресса
const calculateBadges = (profile: any): string[] => {
    const badges: string[] = profile?.badges || [];
    const role = (profile?.role as UserRole) || UserRole.USER;
    const xp = profile?.xp || 0;
    
    // Автоматические значки по условию
    if (role === UserRole.ADMIN && !badges.includes('admin')) badges.push('admin');
    if (role === UserRole.MODERATOR && !badges.includes('moderator')) badges.push('moderator');
    if (xp >= 100 && !badges.includes('verified')) badges.push('verified');
    if (xp >= 500 && !badges.includes('quest_master')) badges.push('quest_master');
    
    const createdAt = parseDBDate(profile?.created_at);
    if (createdAt && new Date(createdAt).getFullYear() <= 2025) {
        if (!badges.includes('early_adopter')) badges.push('early_adopter');
    }

    return Array.from(new Set(badges)); // Убираем дубликаты
};

const ADMIN_EMAILS = ['evgsur23@gmail.com'];

export const authService = {
  initializeAuthListener(callback: (event: string) => void) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session) => {
          if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            Object.assign(CURRENT_USER, { id: '', role: UserRole.GUEST, name: 'Гость' });
            callback(event);
          }
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            callback(event);
          }
        });
        return subscription;
      } catch (e) {
        console.error("Auth listener failed:", e);
      }
    }
    return null;
  },

  async signIn(email: string, password: string): Promise<User> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error("Неверный email или пароль. Проверьте данные и попробуйте снова.");
                }
                throw error;
            }
            const profile = await this.getCurrentUser();
            return profile || { ...CURRENT_USER, id: data.user.id, email: data.user.email || '' }; 
        } catch (e: any) {
            console.error("Sign in failed:", e?.message || e);
            throw e;
        }
    }
    await delay();
    return { ...CURRENT_USER };
  },

  async signUp(email: string, password: string, name: string): Promise<User> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: { data: { name } }
            });
            if (error) throw error;
            
            if (data.user) {
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    name: name,
                    email: email,
                    role: ADMIN_EMAILS.includes(email) ? UserRole.ADMIN : UserRole.USER,
                    xp: 0,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                }, { onConflict: 'id' });
            }
            return { ...CURRENT_USER, id: data.user?.id || 'u1', name, email };
        } catch (e: any) {
            console.error("Sign up failed:", e?.message || e);
            throw e;
        }
    }
    await delay();
    return { ...CURRENT_USER };
  },

  async signOut(): Promise<void> {
    try {
      if (isSupabaseConfigured() && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
              await supabase.from('profiles').update({ last_seen: oldDate }).eq('id', user.id);
          }
          await supabase.auth.signOut();
      }
    } catch (e: any) {
      console.error("Sign out failed:", e?.message || e);
    }
  },

  async deleteAccount(): Promise<void> {
    try {
        if (isSupabaseConfigured() && supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').delete().eq('id', user.id);
                await supabase.auth.signOut();
            }
        }
    } catch (e: any) {
        console.error("Delete account failed:", e?.message || e);
        throw e;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.auth.getUser();
            
            if (error) {
                if (error.message?.includes('expired') || error.status === 401) {
                    await supabase.auth.signOut();
                }
                return null;
            }
            
            if (!data.user) return null;

            const [profileRes, favsRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', data.user.id).single(),
                supabase.from('favorites').select('item_id').eq('user_id', data.user.id)
            ]);

            const profile = profileRes.data;
            const dbFavs = favsRes.data?.map(f => f.item_id) || [];
            
            const role = ADMIN_EMAILS.includes(data.user.email || '') ? UserRole.ADMIN : ((profile?.role as UserRole) || UserRole.USER);
            const badges = calculateBadges({ ...profile, role });

            const user: User = { 
                ...CURRENT_USER, 
                id: data.user.id, 
                email: data.user.email || '',
                xp: profile?.xp || 0,
                role: role,
                name: profile?.name || 'Пользователь',
                avatar: profile?.avatar || '',
                bio: profile?.about || '', 
                birthDate: profile?.birth_date || '',
                gender: profile?.gender || 'none',
                occupation: profile?.occupation || '',
                favorites: Array.from(new Set(dbFavs)),
                badges: badges,
                showcasedBadges: profile?.showcased_badges || [],
                phone: profile?.phone || '',
                createdAt: parseDBDate(profile?.created_at),
                lastSeen: parseDBDate(profile?.last_seen)
            };
            return user;
        } catch (e: any) {
            console.error("Get current user failed:", e?.message || e);
            return null;
        }
    }
    return null; 
  },

  async toggleFavorite(id: string, type: 'ad' | 'business'): Promise<void> {
    try {
      if (!id || id === 'undefined') return;
      const user = await this.getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      
      const { data: existing } = await supabase!
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', id)
          .maybeSingle();

      if (existing) {
          await supabase!.from('favorites').delete().eq('id', existing.id);
      } else {
          await supabase!.from('favorites').insert({
              user_id: user.id,
              item_id: id,
              type: type
          });
      }
    } catch (e: any) {
        console.error("Toggle favorite failed:", e?.message || e);
        throw e;
    }
  },

  async clearAllFavorites(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('favorites').delete().eq('user_id', user.id);
      }
    } catch (e: any) {
        console.error("Clear favorites failed:", e?.message || e);
    }
  },

  async getFavorites(ids: string[]): Promise<{ ads: Ad[], businesses: Business[] }> {
      if (!ids || ids.length === 0) return { ads: [], businesses: [] };
      const validIds = ids.filter(id => id && id !== 'undefined');
      if (validIds.length === 0) return { ads: [], businesses: [] };
      
      try {
        if (isSupabaseConfigured() && supabase) {
            const [adsRes, bizRes] = await Promise.all([
                supabase.from('ads').select('*').in('id', validIds),
                supabase.from('businesses').select('*').in('id', validIds)
            ]);
            
            const ads = (adsRes.data || []).map(a => ({
                id: a.id,
                title: a.title,
                price: a.price,
                currency: a.currency || '₽',
                category: a.category,
                image: a.image,
                date: parseDBDate(a.created_at || a.date) || a.date,
                authorId: a.author_id,
                description: a.description || '',
                location: a.location || 'Снежинск',
                isVip: !!a.is_vip,
                isPremium: !!a.is_premium,
                status: a.status || 'approved'
            }));

            const businesses = (bizRes.data || []).map(mapBusinessFromDB);

            return { ads, businesses };
        }
      } catch (e: any) {
          console.error("Get favorites failed:", e?.message || e);
          return { ads: [], businesses: [] };
      }
      return { 
          ads: mockStore.ads.filter(a => validIds.includes(a.id)), 
          businesses: mockStore.businesses.filter(b => validIds.includes(b.id)) 
      };
  },

  async claimDailyBonus(xp: number): Promise<void> {
      try {
          const user = await authService.getCurrentUser();
          if (user && isSupabaseConfigured() && supabase) {
              await supabase.from('profiles').update({ xp: (user.xp || 0) + xp }).eq('id', user.id);
          }
          localStorage.setItem(`daily_bonus_${user?.id}`, new Date().toDateString());
      } catch (e: any) {
          console.error("Claim daily bonus failed:", e?.message || e);
      }
  },

  async updateLastSeen(): Promise<void> {
      try {
          const user = await authService.getCurrentUser();
          if (user && isSupabaseConfigured() && supabase) {
              await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
          }
      } catch (e: any) { }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
      try {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error("No user");
        
        const dbUpdate: any = {};
        if (data.name !== undefined) dbUpdate.name = data.name;
        if (data.avatar !== undefined) dbUpdate.avatar = data.avatar;
        if (data.bio !== undefined) dbUpdate.about = data.bio; 
        if (data.phone !== undefined) dbUpdate.phone = data.phone;
        if (data.birthDate !== undefined) dbUpdate.birth_date = data.birthDate; 
        if (data.gender !== undefined) dbUpdate.gender = data.gender;
        if (data.occupation !== undefined) dbUpdate.occupation = data.occupation;

        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase.from('profiles').update(dbUpdate).eq('id', user.id);
            if (error) throw error;
        }
        return { ...user, ...data };
      } catch (e: any) {
        console.error("Update profile failed:", e?.message || e);
        throw e;
      }
  },

  async getUserById(id: string): Promise<User | null> {
      if (!id || id === 'undefined' || id.length < 10) return null;
      try {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
            if (error) throw error;
            if (data) {
                return { 
                    ...data, 
                    role: data.role as UserRole, 
                    badges: calculateBadges(data), 
                    showcasedBadges: data.showcased_badges || [],
                    favorites: [], 
                    bio: data.about,
                    birthDate: data.birth_date,
                    createdAt: parseDBDate(data.created_at), 
                    lastSeen: parseDBDate(data.last_seen) 
                };
            }
        }
      } catch (e: any) {
          console.error("Get user by id failed:", e?.message || e);
      }
      return null;
  },

  async getLeaderboard(): Promise<User[]> {
      try {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.from('profiles').select('*').order('xp', { ascending: false }).limit(20);
            if (error) throw error;
            return (data || []).map((p: any) => ({
                ...p,
                role: p.role as UserRole,
                badges: calculateBadges(p),
                showcasedBadges: p.showcased_badges || [],
                favorites: [],
                lastSeen: parseDBDate(p.last_seen)
            }));
        }
      } catch (e: any) {
          console.error("Get leaderboard failed:", e?.message || e);
          return [];
      }
      return [];
  },

  async getAdminUserId(): Promise<string | null> {
      try {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.from('profiles').select('id').eq('role', 'ADMIN').limit(1).maybeSingle();
            if (error) throw error;
            return data?.id || null;
        }
      } catch (e: any) {
          console.error("Get admin user id failed:", e?.message || e);
          return null; 
      }
      return null; 
  },
};

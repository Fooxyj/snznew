
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { CURRENT_USER } from '../constants';
import { User, UserRole, Ad, Business } from '../types';
import { mockStore } from './mockData';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  initializeAuthListener(callback: (event: string) => void) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          Object.assign(CURRENT_USER, { id: '', role: UserRole.GUEST, name: 'Гость' });
          callback(event);
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          callback(event);
        }
      });
      return subscription;
    }
    return null;
  },

  async signIn(email: string, password: string): Promise<User> {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const profile = await this.getCurrentUser();
        return profile || { ...CURRENT_USER, id: data.user.id, email: data.user.email || '' }; 
    }
    await delay();
    return { ...CURRENT_USER };
  },

  async signUp(email: string, password: string, name: string): Promise<User> {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: { data: { name } }
        });
        if (error) throw error;
        
        if (data.user) {
            await supabase.from('profiles').insert({
                id: data.user.id,
                name: name,
                email: email,
                role: 'USER',
                xp: 0,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            });
        }
        return { ...CURRENT_USER, id: data.user?.id || 'u1', name, email };
    }
    await delay();
    return { ...CURRENT_USER };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Принудительно устанавливаем дату активности на 10 минут назад, 
            // чтобы пользователь мгновенно перестал отображаться "В сети" у других.
            const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
            await supabase.from('profiles').update({ last_seen: oldDate }).eq('id', user.id);
        }
        await supabase.auth.signOut();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) return null;

        const [profileRes, favsRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', data.user.id).single(),
            supabase.from('favorites').select('item_id').eq('user_id', data.user.id)
        ]);

        const profile = profileRes.data;
        const dbFavs = favsRes.data?.map(f => f.item_id) || [];
        const role = (profile?.role as UserRole) || UserRole.USER;
        const xp = profile?.xp || 0;

        // Геймификация: расчет значков
        const badges: string[] = [];
        if (role === UserRole.ADMIN) badges.push('admin');
        if (xp >= 100) badges.push('verified');
        if (xp >= 500) badges.push('quest_master');
        if (profile?.created_at && new Date(profile.created_at).getTime() < new Date('2025-01-01').getTime()) badges.push('early_adopter');

        const user: User = { 
            ...CURRENT_USER, 
            id: data.user.id, 
            email: data.user.email || '',
            xp: xp,
            role: role,
            name: profile?.name || 'Пользователь',
            avatar: profile?.avatar || '',
            favorites: Array.from(new Set(dbFavs)),
            badges: badges,
            phone: profile?.phone || '',
            createdAt: profile?.created_at,
            lastSeen: profile?.last_seen
        };
        return user;
    }
    return { ...CURRENT_USER }; 
  },

  async toggleFavorite(id: string, type: 'ad' | 'business'): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    
    const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', id)
        .maybeSingle();

    if (existing) {
        await supabase.from('favorites').delete().eq('id', existing.id);
    } else {
        await supabase.from('favorites').insert({
            user_id: user.id,
            item_id: id,
            type: type
        });
    }
  },

  async clearAllFavorites(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;
    if (isSupabaseConfigured() && supabase) {
        await supabase.from('favorites').delete().eq('user_id', user.id);
    }
  },

  async getFavorites(ids: string[]): Promise<{ ads: Ad[], businesses: Business[] }> {
      if (!ids || ids.length === 0) return { ads: [], businesses: [] };
      
      if (isSupabaseConfigured() && supabase) {
          // Загружаем объявления и бизнесы по предоставленным ID
          const [adsRes, bizRes] = await Promise.all([
              supabase.from('ads').select('*').in('id', ids),
              supabase.from('businesses').select('*').in('id', ids)
          ]);
          
          const ads = (adsRes.data || []).map(a => ({
              id: a.id,
              title: a.title,
              price: a.price,
              currency: a.currency || '₽',
              category: a.category,
              image: a.image,
              date: a.created_at || a.date,
              authorId: a.author_id,
              description: a.description || '',
              location: a.location || 'Снежинск',
              isVip: !!a.is_vip,
              isPremium: !!a.is_premium,
              status: a.status || 'approved'
          }));

          const businesses = (bizRes.data || []).map(b => ({
              ...b,
              reviewsCount: 0,
              rating: 0,
              workHours: b.work_hours
          }));

          return { ads, businesses };
      }
      return { 
          ads: mockStore.ads.filter(a => ids.includes(a.id)), 
          businesses: mockStore.businesses.filter(b => ids.includes(b.id)) 
      };
  },

  async claimDailyBonus(xp: number): Promise<void> {
      const user = await this.getCurrentUser();
      if (user && isSupabaseConfigured() && supabase) {
          await supabase.from('profiles').update({ xp: (user.xp || 0) + xp }).eq('id', user.id);
      }
      localStorage.setItem(`daily_bonus_${user?.id}`, new Date().toDateString());
  },

  async updateLastSeen(): Promise<void> {
      const user = await authService.getCurrentUser();
      if (user && isSupabaseConfigured() && supabase) {
          await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
      }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
      const user = await this.getCurrentUser();
      if (!user) throw new Error("No user");
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('profiles').update(data).eq('id', user.id);
      }
      return { ...user, ...data };
  },

  async getUserById(id: string): Promise<User | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
          if (data) {
              const role = data.role as UserRole;
              const xp = data.xp || 0;
              const badges: string[] = [];
              if (role === UserRole.ADMIN) badges.push('admin');
              if (xp >= 100) badges.push('verified');
              if (xp >= 500) badges.push('quest_master');
              return { ...data, role, badges, favorites: [], createdAt: data.created_at, lastSeen: data.last_seen };
          }
      }
      return null;
  },

  async getLeaderboard(): Promise<User[]> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('profiles').select('*').order('xp', { ascending: false }).limit(20);
          return data?.map((p: any) => {
              const role = p.role as UserRole;
              const xp = p.xp || 0;
              const badges: string[] = [];
              if (role === UserRole.ADMIN) badges.push('admin');
              if (xp >= 100) badges.push('verified');
              if (xp >= 500) badges.push('quest_master');
              return { ...p, role, badges, favorites: [], lastSeen: p.last_seen };
          }) || [];
      }
      return [];
  },

  async getAdminUserId(): Promise<string | null> {
      if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from('profiles').select('id').eq('role', 'ADMIN').limit(1).single();
          return data?.id || null;
      }
      return 'u1'; 
  },
};

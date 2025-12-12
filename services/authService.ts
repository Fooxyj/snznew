
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { CURRENT_USER } from '../constants';
import { User, UserRole } from '../types';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Инициализация слушателя событий безопасности
  initializeAuthListener(callback: (event: string) => void) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          // Очистка данных при выходе или удалении
          Object.assign(CURRENT_USER, { id: '', role: 'GUEST', name: 'Гость' });
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
        // Fetch profile
        const profile = await this.getCurrentUser();
        return profile || { ...CURRENT_USER, id: data.user.id, email: data.user.email || '' }; 
    }
    await delay();
    if (email === 'fail@test.com') throw new Error("Неверный логин или пароль");
    return CURRENT_USER;
  },

  async signUp(email: string, password: string, name: string): Promise<User> {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: { name } 
            }
        });
        if (error) throw error;
        
        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                name: name,
                email: email,
                role: 'USER',
                xp: 0,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            });
            if (profileError) console.error("Error creating profile:", profileError);
        }

        return { ...CURRENT_USER, id: data.user?.id || 'u1', name, email };
    }
    await delay();
    return CURRENT_USER;
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.getUser();
        
        // Handle auth errors gracefully
        if (error || !data.user) {
            // If session is invalid/expired (often causes 403 loops), force signout locally
            if (error?.status === 403 || error?.message?.includes('invalid claim')) {
                console.warn("Session invalid, clearing local auth state");
                await supabase.auth.signOut();
            }
            return null;
        }

        if (data.user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
            const user: User = { 
                ...CURRENT_USER, 
                id: data.user.id, 
                email: data.user.email || '',
                xp: 0,
                balance: 0,
                role: UserRole.USER,
                name: 'Пользователь',
                avatar: '',
                favorites: []
            };
            
            if (profile) {
                user.name = profile.name || user.name;
                user.avatar = profile.avatar || user.avatar;
                user.role = (profile.role as UserRole) || user.role;
                user.favorites = profile.favorites || user.favorites;
                user.xp = profile.xp !== undefined ? profile.xp : 0;
                user.balance = profile.balance !== undefined ? profile.balance : 0;
                user.badges = profile.badges || [];
                user.phone = profile.phone || ''; // Mapped phone from DB
            }
            return user;
        }
        return null;
    }
    return CURRENT_USER; 
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("No user");
    
    if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('profiles').upsert({ id: user.id, ...data });
        if (error) console.error("Profile update failed", error);
    }
    Object.assign(CURRENT_USER, data); 
    return { ...user, ...data };
  },
};

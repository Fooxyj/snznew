
import { supabase } from './supabaseClient';
import { Ad, Category } from '../types';
import { compressImage } from '../utils';

// Define the fields we actually need for the list view to reduce payload.
// Added author_name and images to support new requirements
const AD_LIST_FIELDS = 'id, user_id, author_name, title, description, price, category, sub_category, contact, location, image, images, is_premium, created_at, status, specs';

export const api = {
  // Helper to upload files to Supabase Storage
  // Fetches current session to ensure path matches auth.uid() for RLS
  uploadFile: async (file: File, bucket: string = 'images', _userId?: string): Promise<string> => {
      try {
          // 1. Get current authenticated user directly from Supabase
          const { data: { user } } = await supabase.auth.getUser();
          const currentUserId = user?.id;

          // 2. Compress
          const compressedBlob = await compressImage(file);
          const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

          // 3. Generate unique path
          const fileExt = 'jpg'; // Always converting to jpeg
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          
          // 4. Structure path as 'userId/fileName' if user is logged in
          // This matches standard RLS policies: (storage.foldername(name))[1] = auth.uid()
          // If not logged in, uploads to root (likely will fail RLS unless public)
          const filePath = currentUserId ? `${currentUserId}/${fileName}` : fileName;

          // 5. Upload
          const { error: uploadError } = await supabase.storage
              .from(bucket)
              .upload(filePath, compressedFile, {
                  upsert: false
              });

          if (uploadError) throw uploadError;

          // 6. Get Public URL
          const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
          return data.publicUrl;
      } catch (error) {
          console.error("Upload error:", error);
          throw error;
      }
  },

  ads: {
    // Optimized fetch for the main feed with Pagination support
    list: async (page = 0, limit = 50) => {
      const from = page * limit;
      const to = from + limit - 1;

      const { data, error } = await supabase
        .from('ads')
        .select(AD_LIST_FIELDS)
        // Removed .eq('status', 'approved') to allow Admin to see pending ads
        .order('is_premium', { ascending: false }) // Premium first
        .order('created_at', { ascending: false }) // Newest next
        .range(from, to); // Use range for DB-level pagination

      if (error) throw error;
      return data;
    },

    // Optimized fetch by category (Server-side filtering)
    getByCategory: async (category: Category, page = 0, limit = 50) => {
      const from = page * limit;
      const to = from + limit - 1;

      const { data, error } = await supabase
        .from('ads')
        .select(AD_LIST_FIELDS)
        .eq('category', category)
        // Removed .eq('status', 'approved') to allow Admin to see pending ads
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data;
    },

    // Fetch user specific ads
    getByUser: async (userId: string) => {
      const { data, error } = await supabase
        .from('ads')
        .select('*') // For edit mode we need everything
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    
    // Create new ad
    create: async (adData: any) => {
       const { data, error } = await supabase
        .from('ads')
        .insert(adData)
        .select()
        .single();
        
       if (error) throw error;
       return data;
    },

    // Update ad
    update: async (id: string, updates: any) => {
        const { error } = await supabase
            .from('ads')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    },

    // Delete ad
    delete: async (id: string) => {
        const { error } = await supabase
            .from('ads')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
  },
  
  chats: {
      getMessages: async (chatId: string) => {
          const { data, error } = await supabase
            .from('messages')
            .select('id, sender_id, text, created_at') // Minimal fields
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true })
            .limit(100); // Limit message history load
            
          if (error) throw error;
          return data;
      }
  }
};

-- MIGRATION: Fix All RLS and Storage Issues
-- Run this in the Supabase SQL Editor

-- 1. ADS: Make them public and editable by owners
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ads are viewable by everyone" ON ads;
CREATE POLICY "Ads are viewable by everyone" ON ads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert ads" ON ads;
CREATE POLICY "Users can insert ads" ON ads FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own ads" ON ads;
CREATE POLICY "Users can update own ads" ON ads FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own ads" ON ads;
CREATE POLICY "Users can delete own ads" ON ads FOR DELETE USING (auth.uid()::text = user_id::text);

-- 2. CHATS: Allow participants to view and message
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (
    auth.uid()::text = buyer_id::text OR 
    EXISTS (SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can insert chats" ON chats;
CREATE POLICY "Users can insert chats" ON chats FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);

-- 3. MESSAGES: Allow participants to view and send
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id::text = messages.chat_id::text 
      AND (
        chats.buyer_id::text = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text)
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
CREATE POLICY "Users can insert messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id::text = messages.chat_id::text 
      AND (
        chats.buyer_id::text = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text)
      )
    )
  );

-- 4. STORIES: Public view, Admin/Owner manage
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stories are viewable by everyone" ON stories;
CREATE POLICY "Stories are viewable by everyone" ON stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and Owners can insert stories" ON stories;
CREATE POLICY "Admins and Owners can insert stories" ON stories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and Owners can update stories" ON stories;
CREATE POLICY "Admins and Owners can update stories" ON stories FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and Owners can delete stories" ON stories;
CREATE POLICY "Admins and Owners can delete stories" ON stories FOR DELETE USING (auth.role() = 'authenticated');

-- 5. MANAGED BUSINESSES: Allow owners to update
ALTER TABLE managed_businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view businesses" ON managed_businesses;
CREATE POLICY "Public view businesses" ON managed_businesses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can update their business" ON managed_businesses;
CREATE POLICY "Owners can update their business" ON managed_businesses FOR UPDATE USING (auth.uid() = user_id);

-- 6. STORAGE BUCKETS: Ensure they exist and are writable
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('story-images', 'story-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Simplified for reliability)
DROP POLICY IF EXISTS "Public Select Images" ON storage.objects;
CREATE POLICY "Public Select Images" ON storage.objects FOR SELECT USING (bucket_id IN ('images', 'business-images', 'story-images', 'product-images'));

DROP POLICY IF EXISTS "Auth Insert Images" ON storage.objects;
CREATE POLICY "Auth Insert Images" ON storage.objects FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  bucket_id IN ('images', 'business-images', 'story-images', 'product-images')
);

DROP POLICY IF EXISTS "Auth Update Images" ON storage.objects;
CREATE POLICY "Auth Update Images" ON storage.objects FOR UPDATE USING (
  auth.role() = 'authenticated' AND 
  bucket_id IN ('images', 'business-images', 'story-images', 'product-images')
);

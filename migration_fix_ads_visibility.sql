-- Fix RLS policies for ads table to ensure public visibility
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Ads are viewable by everyone" ON ads;
DROP POLICY IF EXISTS "Users can insert ads" ON ads;
DROP POLICY IF EXISTS "Users can update own ads" ON ads;
DROP POLICY IF EXISTS "Users can delete own ads" ON ads;

-- Enable RLS (just in case)
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- 1. Allow everyone to view ads (public read access)
CREATE POLICY "Ads are viewable by everyone" ON ads
  FOR SELECT USING (true);

-- 2. Allow authenticated users to insert ads
CREATE POLICY "Users can insert ads" ON ads
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 3. Allow users to update their own ads
CREATE POLICY "Users can update own ads" ON ads
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 4. Allow users to delete their own ads
CREATE POLICY "Users can delete own ads" ON ads
  FOR DELETE USING (auth.uid()::text = user_id::text);


-- ==========================================
-- Fix RLS for Chats and Messages
-- ==========================================

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Allow users to view chats where they are the buyer OR the seller (ad owner)
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (
    auth.uid()::text = buyer_id::text 
    OR EXISTS (
      SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text
    )
  );

-- Allow users to create new chats (as buyers)
DROP POLICY IF EXISTS "Users can insert chats" ON chats;
CREATE POLICY "Users can insert chats" ON chats
  FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);


ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to view messages in chats they belong to
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id::text = messages.chat_id::text 
    AND (
        chats.buyer_id::text = auth.uid()::text 
        OR EXISTS (
            SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text
        )
    )
  ));

-- Allow users to send messages to chats they belong to
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
CREATE POLICY "Users can insert messages in their chats" ON messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id::text = messages.chat_id::text 
    AND (
        chats.buyer_id::text = auth.uid()::text 
        OR EXISTS (
            SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text
        )
    )
  ));

-- ==========================================
-- Fix RLS for Profiles (needed for chat names)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix RLS policies for profiles table
-- Currently, users can only view their own profile. We need to allow everyone to view profiles.

-- 1. Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 2. Create new permissive policy for SELECT
-- Allow any authenticated user to view any profile
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Ensure other policies are correct (optional, just to be safe)
-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can only insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify policies for 'ads' table (ensure they are public)
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view ads
DROP POLICY IF EXISTS "Ads are viewable by everyone" ON ads;
CREATE POLICY "Ads are viewable by everyone" ON ads
  FOR SELECT USING (true);

-- Allow authenticated users to insert ads
DROP POLICY IF EXISTS "Users can insert ads" ON ads;
CREATE POLICY "Users can insert ads" ON ads
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to update their own ads
DROP POLICY IF EXISTS "Users can update own ads" ON ads;
CREATE POLICY "Users can update own ads" ON ads
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow users to delete their own ads
DROP POLICY IF EXISTS "Users can delete own ads" ON ads;
CREATE POLICY "Users can delete own ads" ON ads
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Fix RLS for chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (auth.uid()::text = buyer_id::text OR EXISTS (
    SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text
  ));

DROP POLICY IF EXISTS "Users can insert chats" ON chats;
CREATE POLICY "Users can insert chats" ON chats
  FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);

-- Fix RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id::text = messages.chat_id::text 
    AND (chats.buyer_id::text = auth.uid()::text OR EXISTS (
      SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text
    ))
  ));

DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
CREATE POLICY "Users can insert messages in their chats" ON messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id::text = messages.chat_id::text 
    AND (chats.buyer_id::text = auth.uid()::text OR EXISTS (
      SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text
    ))
  ));

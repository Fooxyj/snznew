-- Create stories table for managing homepage stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id TEXT, -- ID of the shop this story belongs to (can be from managed_businesses or hardcoded shops)
  shop_name TEXT NOT NULL,
  avatar TEXT NOT NULL, -- Shop avatar/logo
  image TEXT NOT NULL, -- Full screen story image
  text TEXT, -- Optional text overlay on the story
  is_viewed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id), -- Admin or business owner who created it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration date
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0 -- Order in which stories appear
);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Everyone can view active stories
CREATE POLICY "Stories are viewable by everyone" ON stories
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Admins can insert stories
CREATE POLICY "Admins can insert stories" ON stories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Admins can update stories
CREATE POLICY "Admins can update stories" ON stories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Admins can delete stories
CREATE POLICY "Admins can delete stories" ON stories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Business owners can manage their own stories
CREATE POLICY "Business owners can manage own stories" ON stories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM managed_businesses 
      WHERE managed_businesses.id::text = stories.shop_id 
      AND managed_businesses.user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_stories_shop ON stories(shop_id);

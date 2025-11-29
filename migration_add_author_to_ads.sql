-- Add missing columns to ads table for author information
ALTER TABLE ads ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS author_avatar TEXT;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS author_level INTEGER DEFAULT 1;

-- Create index for better performance when filtering by user
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_category ON ads(category);

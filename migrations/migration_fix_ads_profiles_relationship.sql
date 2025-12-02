-- Add foreign key relationship between ads and profiles to enable joins
-- This is required for the query: select=...,profiles(full_name,avatar_url,xp)

-- Step 1: Create missing profiles for ads that reference non-existent users
INSERT INTO profiles (id, full_name, avatar_url, xp, updated_at)
SELECT DISTINCT 
    a.user_id,
    COALESCE(a.author_name, 'Пользователь'),
    a.author_avatar,
    COALESCE(a.author_level * 1000, 0),
    NOW()
FROM ads a
LEFT JOIN profiles p ON a.user_id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 2: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_ads_profiles'
    ) THEN
        ALTER TABLE ads
        ADD CONSTRAINT fk_ads_profiles
        FOREIGN KEY (user_id)
        REFERENCES profiles (id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Create index on user_id in ads table for faster joins and filtering
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);

-- Create index on status and is_premium for faster feed queries
CREATE INDEX IF NOT EXISTS idx_ads_status_premium_created ON ads(status, is_premium DESC, created_at DESC);

-- Ensure profiles are readable by everyone (if not already)
-- This is crucial for the join to work for guest users
create policy "Public profiles are viewable by everyone"
on profiles for select
to authenticated, anon
using ( true );

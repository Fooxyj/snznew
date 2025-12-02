-- Remove redundant author columns from ads table
-- All author data now comes from profiles table via foreign key

ALTER TABLE ads 
DROP COLUMN IF EXISTS author_name,
DROP COLUMN IF EXISTS author_avatar,
DROP COLUMN IF EXISTS author_level;

-- Add comment to document the change
COMMENT ON TABLE ads IS 'Ads table. Author data is fetched via user_id foreign key to profiles table.';

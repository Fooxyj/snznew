-- Migration: Redesign chat system to be user-based instead of ad-based
-- This allows one conversation per user pair, regardless of how many ads they discuss

-- 1. Create user_chats table (one chat per user pair)
CREATE TABLE IF NOT EXISTS user_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) NOT NULL,
  user2_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_pair UNIQUE (user1_id, user2_id),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- 2. Add ad context to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ad_id UUID REFERENCES ads(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS context TEXT;

-- 3. Rename chat_id to user_chat_id for clarity
ALTER TABLE messages RENAME COLUMN chat_id TO user_chat_id;

-- 4. Migrate existing data from chats to user_chats
-- For each unique pair of users, create one user_chat
-- Only migrate if both users exist in profiles table
INSERT INTO user_chats (user1_id, user2_id, created_at)
SELECT DISTINCT 
  LEAST(c.buyer_id, a.user_id) as user1_id,
  GREATEST(c.buyer_id, a.user_id) as user2_id,
  MIN(c.created_at) as created_at
FROM chats c
JOIN ads a ON c.ad_id::uuid = a.id
WHERE c.buyer_id IS NOT NULL 
  AND a.user_id IS NOT NULL
  AND c.buyer_id != a.user_id
  -- Ensure both users exist in profiles table
  AND EXISTS (SELECT 1 FROM profiles WHERE id = c.buyer_id)
  AND EXISTS (SELECT 1 FROM profiles WHERE id = a.user_id)
GROUP BY LEAST(c.buyer_id, a.user_id), GREATEST(c.buyer_id, a.user_id)
ON CONFLICT (user1_id, user2_id) DO NOTHING;

-- 5. Update messages to reference user_chats and add ad context
UPDATE messages m
SET 
  user_chat_id = uc.id,
  ad_id = c.ad_id::uuid,  -- Explicit cast
  context = 'По объявлению: ' || COALESCE(a.title, 'Объявление удалено')
FROM chats c
LEFT JOIN ads a ON c.ad_id::uuid = a.id  -- Explicit cast
LEFT JOIN user_chats uc ON (
  (uc.user1_id = c.buyer_id AND uc.user2_id = a.user_id) OR
  (uc.user1_id = a.user_id AND uc.user2_id = c.buyer_id)
)
WHERE m.user_chat_id = c.id;

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_chats_user1 ON user_chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_user_chats_user2 ON user_chats(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_chat_id ON messages(user_chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_ad_id ON messages(ad_id);

-- 7. Add RLS policies for user_chats
ALTER TABLE user_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chats"
  ON user_chats FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats"
  ON user_chats FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 8. Update messages RLS to work with user_chats
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
CREATE POLICY "Users can view messages in their chats"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_chats uc
      WHERE uc.id = messages.user_chat_id
      AND (uc.user1_id = auth.uid() OR uc.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_chats uc
      WHERE uc.id = messages.user_chat_id
      AND (uc.user1_id = auth.uid() OR uc.user2_id = auth.uid())
    )
  );

-- 9. Optional: Drop old chats table after verification
-- IMPORTANT: Only run this after verifying everything works!
-- DROP TABLE IF EXISTS chats CASCADE;

COMMENT ON TABLE user_chats IS 'One chat per user pair, independent of ads';
COMMENT ON COLUMN messages.ad_id IS 'Optional reference to ad being discussed';
COMMENT ON COLUMN messages.context IS 'Human-readable context like "По объявлению: BMW"';

-- Fix RLS policies for user_chats table

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Users can view their own chats" ON user_chats;
DROP POLICY IF EXISTS "Users can create chats" ON user_chats;

-- 2. Create correct policies
CREATE POLICY "Users can view their own chats"
  ON user_chats FOR SELECT
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

CREATE POLICY "Users can insert their own chats"
  ON user_chats FOR INSERT
  WITH CHECK (
    (auth.uid() = user1_id OR auth.uid() = user2_id) AND
    user1_id != user2_id
  );

CREATE POLICY "Users can update their own chats"
  ON user_chats FOR UPDATE
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

-- 3. Ensure messages policies are correct
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can view messages in their chats"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_chats uc
      WHERE uc.id = messages.user_chat_id
      AND (uc.user1_id = auth.uid() OR uc.user2_id = auth.uid())
    )
  );

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

-- 4. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_chats TO authenticated;
GRANT SELECT, INSERT ON messages TO authenticated;

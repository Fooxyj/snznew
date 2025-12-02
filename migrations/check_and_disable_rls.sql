-- Check and disable RLS for user_chats and messages

-- Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_chats', 'messages');

-- Disable RLS completely
ALTER TABLE user_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_chats', 'messages');

-- Also check if there are any policies still active
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_chats', 'messages');

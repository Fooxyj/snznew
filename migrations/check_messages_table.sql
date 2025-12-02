-- Check if messages table has correct column names
-- Run this to see the structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages';

-- If you see 'chat_id' instead of 'user_chat_id', run this:
-- ALTER TABLE messages RENAME COLUMN chat_id TO user_chat_id;

-- Also check if the column exists at all:
SELECT * FROM messages LIMIT 1;

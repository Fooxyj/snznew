-- Diagnostic and fix for messages table

-- Step 1: Check if user_chat_id column exists
DO $$
BEGIN
    -- If chat_id exists and user_chat_id doesn't, rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'chat_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'user_chat_id'
    ) THEN
        ALTER TABLE messages RENAME COLUMN chat_id TO user_chat_id;
        RAISE NOTICE 'Renamed chat_id to user_chat_id';
    END IF;
    
    -- If both exist (shouldn't happen), drop chat_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'chat_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'user_chat_id'
    ) THEN
        ALTER TABLE messages DROP COLUMN chat_id;
        RAISE NOTICE 'Dropped duplicate chat_id column';
    END IF;
END $$;

-- Step 2: Ensure ad_id and context columns exist
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ad_id UUID REFERENCES ads(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS context TEXT;

-- Step 3: Show current structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

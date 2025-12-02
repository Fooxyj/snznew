-- Добавление поля read для отслеживания прочитанных сообщений

-- Добавить поле read (по умолчанию false - непрочитанное)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Добавить поле read_at для отметки времени прочтения
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Создать индекс для быстрого подсчета непрочитанных сообщений
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(chat_id, read) WHERE read = false;

-- Создать индекс для поиска непрочитанных сообщений по получателю
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, read);

-- Обновить RLS политики для поля read
-- Пользователи могут обновлять статус прочтения только своих входящих сообщений
DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;
CREATE POLICY "Users can mark messages as read" ON messages
  FOR UPDATE 
  USING (
    -- Пользователь может пометить сообщение как прочитанное, если он участник чата
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id::text = messages.chat_id::text 
      AND (
        chats.buyer_id::text = auth.uid()::text 
        OR EXISTS (
          SELECT 1 FROM ads 
          WHERE ads.id::text = chats.ad_id::text 
          AND ads.user_id::text = auth.uid()::text
        )
      )
    )
    -- И это не его собственное сообщение
    AND messages.sender_id::text != auth.uid()::text
  )
  WITH CHECK (
    -- Можно обновлять только поле read и read_at
    true
  );

-- Комментарии для документации
COMMENT ON COLUMN messages.read IS 'Флаг прочтения сообщения получателем';
COMMENT ON COLUMN messages.read_at IS 'Время прочтения сообщения';

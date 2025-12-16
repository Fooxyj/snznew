-- ========================================
-- ПОЛНАЯ МИГРАЦИЯ ДЛЯ ИСПРАВЛЕНИЯ ВСЕХ ПРОБЛЕМ
-- ========================================
-- Запустите этот файл в Supabase SQL Editor
-- Это исправит: видимость объявлений, чаты, профили и storage для бизнеса

-- ========================================
-- 1. ИСПРАВЛЕНИЕ RLS ДЛЯ ОБЪЯВЛЕНИЙ
-- ========================================

DROP POLICY IF EXISTS "Ads are viewable by everyone" ON ads;
DROP POLICY IF EXISTS "Users can insert ads" ON ads;
DROP POLICY IF EXISTS "Users can update own ads" ON ads;
DROP POLICY IF EXISTS "Users can delete own ads" ON ads;

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Все могут просматривать объявления (публичный доступ)
CREATE POLICY "Ads are viewable by everyone" ON ads
  FOR SELECT USING (true);

-- Аутентифицированные пользователи могут создавать объявления
CREATE POLICY "Users can insert ads" ON ads
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Пользователи могут редактировать свои объявления
CREATE POLICY "Users can update own ads" ON ads
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Пользователи могут удалять свои объявления
CREATE POLICY "Users can delete own ads" ON ads
  FOR DELETE USING (auth.uid()::text = user_id::text);


-- ========================================
-- 2. ИСПРАВЛЕНИЕ RLS ДЛЯ ЧАТОВ И СООБЩЕНИЙ
-- ========================================

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Пользователи видят чаты, где они покупатели ИЛИ продавцы
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (
    auth.uid()::text = buyer_id::text 
    OR EXISTS (
      SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text
    )
  );

-- Пользователи могут создавать новые чаты (как покупатели)
DROP POLICY IF EXISTS "Users can insert chats" ON chats;
CREATE POLICY "Users can insert chats" ON chats
  FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);


ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Пользователи видят сообщения в своих чатах
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id::text = messages.chat_id::text 
    AND (
        chats.buyer_id::text = auth.uid()::text 
        OR EXISTS (
            SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text
        )
    )
  ));

-- Пользователи могут отправлять сообщения в свои чаты
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
CREATE POLICY "Users can insert messages in their chats" ON messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id::text = messages.chat_id::text 
    AND (
        chats.buyer_id::text = auth.uid()::text 
        OR EXISTS (
            SELECT 1 FROM ads WHERE ads.id::text = chats.ad_id::text AND ads.user_id::text = auth.uid()::text
        )
    )
  ));

-- ========================================
-- 3. ИСПРАВЛЕНИЕ RLS ДЛЯ ПРОФИЛЕЙ
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Все могут просматривать профили (для отображения имен в чатах)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Пользователи могут обновлять свой профиль
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Пользователи могут создавать свой профиль
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- 4. НАСТРОЙКА STORAGE ДЛЯ БИЗНЕС-ИЗОБРАЖЕНИЙ
-- ========================================

-- Создание bucket (если не существует)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Политики доступа для business-images
DROP POLICY IF EXISTS "Public Access for business images" ON storage.objects;
CREATE POLICY "Public Access for business images"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

DROP POLICY IF EXISTS "Authenticated users can upload business images" ON storage.objects;
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-images' 
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can delete own business images" ON storage.objects;
CREATE POLICY "Users can delete own business images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-images' 
  AND auth.uid()::text = owner::text
);

DROP POLICY IF EXISTS "Users can update own business images" ON storage.objects;
CREATE POLICY "Users can update own business images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-images' 
  AND auth.uid()::text = owner::text
);

-- ========================================
-- ГОТОВО!
-- ========================================
-- После выполнения этой миграции:
-- ✅ Все пользователи смогут видеть одобренные объявления
-- ✅ Чаты и сообщения будут работать корректно
-- ✅ Профили будут видны всем (для имен в чатах)
-- ✅ Загрузка изображений для бизнеса будет работать

-- Создание storage bucket для изображений бизнеса
-- Примечание: Создание bucket через SQL может не работать в некоторых версиях Supabase
-- В этом случае создайте bucket вручную через Dashboard: Storage -> New bucket -> "business-images"

-- Если bucket уже существует, эта команда вернет ошибку, но это нормально
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Политики доступа для business-images bucket
-- Разрешить всем просматривать изображения (публичный доступ)
DROP POLICY IF EXISTS "Public Access for business images" ON storage.objects;
CREATE POLICY "Public Access for business images"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

-- Разрешить аутентифицированным пользователям загружать изображения
DROP POLICY IF EXISTS "Authenticated users can upload business images" ON storage.objects;
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-images' 
  AND auth.role() = 'authenticated'
);

-- Разрешить пользователям удалять свои изображения
DROP POLICY IF EXISTS "Users can delete own business images" ON storage.objects;
CREATE POLICY "Users can delete own business images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-images' 
  AND auth.uid()::text = owner::text
);

-- Разрешить пользователям обновлять свои изображения
DROP POLICY IF EXISTS "Users can update own business images" ON storage.objects;
CREATE POLICY "Users can update own business images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-images' 
  AND auth.uid()::text = owner::text
);

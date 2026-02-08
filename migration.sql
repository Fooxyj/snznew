-- 1. Сначала убедимся, что типы данных совпадают (UUID)
ALTER TABLE public.reviews 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- 2. Создаем внешний ключ именно на таблицу profiles (для корректного JOIN)
-- Если ключ уже был на auth.users, мы его перенаправляем на profiles
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 3. Добавляем комментарий для подсказки PostgREST (движку Supabase)
COMMENT ON CONSTRAINT reviews_user_id_fkey ON public.reviews IS 'Link reviews to user profiles';

-- 4. Убеждаемся, что колонка даты имеет значение по умолчанию
ALTER TABLE public.reviews 
ALTER COLUMN created_at SET DEFAULT now();

-- 5. Обновляем кэш схем (иногда помогает при ошибках 400)
NOTIFY pgrst, 'reload schema';
-- ========================================
-- CRM SYSTEM MIGRATION
-- ========================================
-- Создание всех таблиц для управления категориями через админ-панель
-- Запустите этот файл в Supabase SQL Editor

-- ========================================
-- 1. CATEGORIES (Категории)
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. CATEGORY ITEMS (Магазины, Кафе, Спортзалы и т.д.)
-- ========================================
CREATE TABLE IF NOT EXISTS category_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    cover_image TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    working_hours TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    website TEXT,
    payment_config JSONB,
    business_data JSONB,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ========================================
-- 3. PRODUCTS (Товары и услуги)
-- ========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES category_items(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    image TEXT,
    category TEXT,
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. MOVIES (Фильмы)
-- ========================================
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    genre TEXT,
    rating TEXT,
    age_limit TEXT,
    image TEXT,
    description TEXT,
    showtimes TEXT[], -- Массив времени сеансов
    price DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. TRANSPORT SERVICES (Такси и Грузоперевозки)
-- ========================================
CREATE TABLE IF NOT EXISTS transport_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type TEXT NOT NULL, -- 'taxi' или 'freight'
    name TEXT NOT NULL,
    phone TEXT,
    link TEXT,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. BUS SCHEDULES (Расписание автобусов)
-- ========================================
CREATE TABLE IF NOT EXISTS bus_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL,
    route TEXT NOT NULL,
    times TEXT NOT NULL,
    schedule_type TEXT NOT NULL, -- 'city' или 'intercity'
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. EMERGENCY CONTACTS (Экстренные службы)
-- ========================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 8. MEDICINE SERVICES (Медицинские учреждения)
-- ========================================
CREATE TABLE IF NOT EXISTS medicine_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    description TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 9. CULTURE PLACES (Места культуры)
-- ========================================
CREATE TABLE IF NOT EXISTS culture_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    description TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- RLS POLICIES
-- ========================================

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert categories" ON categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Only admins can update categories" ON categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Only admins can delete categories" ON categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Category Items
ALTER TABLE category_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Category items are viewable by everyone" ON category_items
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert category items" ON category_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Only admins can update category items" ON category_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Only admins can delete category items" ON category_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Movies
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Movies are viewable by everyone" ON movies
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage movies" ON movies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Transport Services
ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transport services are viewable by everyone" ON transport_services
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage transport services" ON transport_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Bus Schedules
ALTER TABLE bus_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bus schedules are viewable by everyone" ON bus_schedules
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage bus schedules" ON bus_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Emergency Contacts
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Emergency contacts are viewable by everyone" ON emergency_contacts
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage emergency contacts" ON emergency_contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Medicine Services
ALTER TABLE medicine_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medicine services are viewable by everyone" ON medicine_services
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage medicine services" ON medicine_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Culture Places
ALTER TABLE culture_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Culture places are viewable by everyone" ON culture_places
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage culture places" ON culture_places
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- ========================================
-- STORAGE BUCKETS
-- ========================================

-- Category images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for category-images
CREATE POLICY "Public Access for category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete own category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'category-images' 
  AND auth.uid()::text = owner::text
);

CREATE POLICY "Users can update own category images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'category-images' 
  AND auth.uid()::text = owner::text
);

-- ========================================
-- INDEXES для производительности
-- ========================================

CREATE INDEX IF NOT EXISTS idx_category_items_category_id ON category_items(category_id);
CREATE INDEX IF NOT EXISTS idx_category_items_active ON category_items(is_active);
CREATE INDEX IF NOT EXISTS idx_products_item_id ON products(item_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_movies_active ON movies(is_active);
CREATE INDEX IF NOT EXISTS idx_transport_type ON transport_services(service_type);
CREATE INDEX IF NOT EXISTS idx_bus_type ON bus_schedules(schedule_type);

-- ========================================
-- ГОТОВО!
-- ========================================
-- После выполнения этой миграции у вас будет:
-- ✅ Таблицы для всех категорий
-- ✅ RLS политики для безопасности
-- ✅ Storage bucket для изображений
-- ✅ Индексы для быстрой работы

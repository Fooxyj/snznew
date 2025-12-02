-- Ensure storage buckets exist with correct RLS policies

-- Create business-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create product-images bucket if it doesn't exist  
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create story-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for business-images
DROP POLICY IF EXISTS "Authenticated users can upload business images" ON storage.objects;
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-images' 
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Business images are publicly accessible" ON storage.objects;
CREATE POLICY "Business images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

DROP POLICY IF EXISTS "Users can update own business images" ON storage.objects;
CREATE POLICY "Users can update own business images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-images'
  AND auth.role() = 'authenticated'
);

-- RLS policies for product-images
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- RLS policies for story-images
DROP POLICY IF EXISTS "Authenticated users can upload story images" ON storage.objects;
CREATE POLICY "Authenticated users can upload story images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-images'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Story images are publicly accessible" ON storage.objects;
CREATE POLICY "Story images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

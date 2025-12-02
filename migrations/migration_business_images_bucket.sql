-- Create business-images storage bucket and RLS policies

-- Create bucket for business images (avatar, header, product images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own business images
CREATE POLICY "Users can upload business images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'business-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own business images
CREATE POLICY "Users can update their business images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'business-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own business images
CREATE POLICY "Users can delete their business images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'business-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow everyone to view business images (public bucket)
CREATE POLICY "Anyone can view business images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-images');

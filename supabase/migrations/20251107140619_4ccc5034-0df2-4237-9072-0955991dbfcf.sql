-- Fix Storage Exposure: Make vistoria-fotos bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'vistoria-fotos';

-- Drop existing public storage policies for vistoria-fotos
DROP POLICY IF EXISTS "Public access to vistoria photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload vistoria photos" ON storage.objects;

-- Create secure RLS policies for vistoria-fotos bucket
-- Users can view their own files
CREATE POLICY "Users can view own vistoria photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vistoria-fotos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can upload to their own folder
CREATE POLICY "Users can upload own vistoria photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vistoria-fotos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own files
CREATE POLICY "Users can update own vistoria photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vistoria-fotos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own files
CREATE POLICY "Users can delete own vistoria photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vistoria-fotos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can access all vistoria photos
CREATE POLICY "Admins can access all vistoria photos"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'vistoria-fotos'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Fix Missing RLS: Make user_id NOT NULL on all tables
ALTER TABLE clientes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE digitadores ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE vistoriadores ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE vistorias ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraints for referential integrity
ALTER TABLE clientes 
ADD CONSTRAINT fk_clientes_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE digitadores 
ADD CONSTRAINT fk_digitadores_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE vistoriadores 
ADD CONSTRAINT fk_vistoriadores_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE vistorias 
ADD CONSTRAINT fk_vistorias_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
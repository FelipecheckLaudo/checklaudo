-- Drop all public policies on vistoria-fotos bucket
DROP POLICY IF EXISTS "Fotos são publicamente acessíveis" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos" ON storage.objects;
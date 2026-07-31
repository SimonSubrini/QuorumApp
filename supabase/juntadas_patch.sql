-- SCRIPT DE PARCHE (Fase 5: Creador de Juntada y Storage)
-- Copia y pega en el SQL Editor de Supabase y ejecútalo.

-- 1. Añadir el creador de la juntada a la tabla
ALTER TABLE public.juntadas 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- 2. Crear el Bucket de Storage para las fotos de las juntadas
-- (Si ya existe, esto simplemente lo ignora o puede dar un warning, pero es seguro)
INSERT INTO storage.buckets (id, name, public)
VALUES ('juntadas_photos', 'juntadas_photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Seguridad para el Bucket
-- Permitir a cualquier usuario autenticado subir fotos al bucket
CREATE POLICY "Usuarios autenticados pueden subir fotos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'juntadas_photos');

-- Permitir a cualquier persona (incluso anónimos o no logueados) ver las fotos
CREATE POLICY "Cualquiera puede ver fotos" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'juntadas_photos');

-- SCRIPT DE PARCHE (Fase 6: Agregar Ubicación a Juntadas)
-- Copia y pega en el SQL Editor de Supabase y ejecútalo.

ALTER TABLE public.juntadas 
ADD COLUMN IF NOT EXISTS location TEXT;

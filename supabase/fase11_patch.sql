-- SCRIPT DE PARCHE (Fase 11: Votaciones Mejoradas)
-- Ejecutar en SQL Editor de Supabase.

-- 1. Eliminar la restricción antigua y agregar la nueva para los tipos de votación
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_type_check;

ALTER TABLE public.votes 
ADD CONSTRAINT votes_type_check 
CHECK (type IN ('acto_extraordinario', 'castigo', 'anulacion_juego', 'anulacion_apuesta'));

-- 2. Agregar nuevas columnas
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS points_modifier NUMERIC(10,1);
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS target_bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE;

-- 3. Ya existen políticas RLS sobre la tabla votes, las nuevas columnas estarán protegidas por ellas.

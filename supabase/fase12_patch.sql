-- SCRIPT DE PARCHE (Fase 12: Agregar description a bets)
-- Ejecutar en SQL Editor de Supabase.

ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS description TEXT;

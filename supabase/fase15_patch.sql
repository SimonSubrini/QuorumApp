-- SCRIPT DE PARCHE (Fase 15: Notificaciones Push)
-- Ejecutar en SQL Editor de Supabase.

-- 1. Agregamos la columna expo_push_token a la tabla perfiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

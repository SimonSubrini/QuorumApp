-- SCRIPT DE PARCHE (Fase 8: Temporadas y Vigencia de Grupos)
-- Ejecutar en SQL Editor de Supabase.

-- Agregar columnas a la tabla groups
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS num_winners INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'activo' CHECK (state IN ('activo', 'finalizado')),
ADD COLUMN IF NOT EXISTS winners_data JSONB,
ADD COLUMN IF NOT EXISTS season_number INTEGER DEFAULT 1;

-- Actualizar grupos existentes (opcional, por defecto quedarán sin end_date, lo cual puede significar grupo infinito, 
-- pero para que funcione con el nuevo flujo, podríamos setear un end_date futuro, o manejarlos en el frontend como "invalidados" hasta que se configure).
-- Estableceremos un end_date por defecto de 6 meses para los grupos ya creados, si están en nulo.
UPDATE public.groups 
SET end_date = TIMEZONE('utc'::text, NOW()) + INTERVAL '6 months'
WHERE end_date IS NULL;

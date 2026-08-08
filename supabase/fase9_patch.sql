-- Agrega la columna games_played a la tabla groups para guardar el listado de juegos históricos
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS games_played text[] DEFAULT '{}'::text[];
